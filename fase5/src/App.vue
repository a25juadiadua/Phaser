<script setup>
import { useRealtime } from './composables/useRealtime.js';
import { ref, watch, onUnmounted, nextTick } from 'vue';
import PhaserCanvas from './components/PhaserCanvas.vue';

const zonaActiva = ref(null);
const monitorCercano = ref(null);

const refCanvas = ref(null);
const modalObert = ref(false);

const elMeuNom = ref('Alumne');
const elMeuColor = ref('#10b981');

const idsPropers = ref([]);
const volumSala = ref(0);

const videoMini = ref(null);
const videoGran = ref(null);
const soActivat = ref(false);

const {
  estatXarxa,
  usuarisRemots,
  connectar,
  enviarMoviment,
  enviarPerfil,
  desconnectar
} = useRealtime();

watch(usuarisRemots, (tots) => {
  refCanvas.value?.enviarJugadors(tots);
});

function aplicarPerfil() {
  const perfil = {
    nom: elMeuNom.value.trim() || 'Convidat',
    color: elMeuColor.value
  };

  refCanvas.value?.actualitzarPerfil(perfil);
  enviarPerfil(perfil);
}

function iniciarConnexio(posicio) {
  aplicarPerfil();

  connectar({
    nom: elMeuNom.value.trim() || 'Convidat',
    color: elMeuColor.value
  }, posicio);
}

function obrirModalGran() {
  modalObert.value = true;
  refCanvas.value?.bloquejarControls(true);
}

function tancarModalGran() {
  modalObert.value = false;
  refCanvas.value?.bloquejarControls(false);
}

async function activarSo() {
  soActivat.value = true;

  await nextTick();

  if (videoMini.value) {
    videoMini.value.muted = false;
    videoMini.value.volume = volumSala.value / 100;
    await videoMini.value.play();
  }

  if (videoGran.value) {
    videoGran.value.muted = false;
    videoGran.value.volume = volumSala.value / 100;
    await videoGran.value.play();
  }
}

const segons = ref(0);
let interval = null;

watch(() => !!zonaActiva.value, (dinsZona) => {
  if (dinsZona) {
    interval = setInterval(() => {
      segons.value++;
    }, 1000);
  } else {
    clearInterval(interval);
    interval = null;
    segons.value = 0;
  }
});

// Actualitzem el volum dels vídeos segons la distància al centre de la sala.
watch([volumSala, zonaActiva, modalObert], async () => {
  await nextTick();

  const volum = Math.max(0, Math.min(1, volumSala.value / 100));

  if (videoMini.value) {
    videoMini.value.volume = volum;
  }

  if (videoGran.value) {
    videoGran.value.volume = volum;
  }
});

onUnmounted(() => {
  clearInterval(interval);
  desconnectar();
});
</script>

<template>
  <main style="display: flex; gap: 20px; padding: 20px; font-family: sans-serif;">

    <PhaserCanvas
      ref="refCanvas"
      @canvi-zona="zonaActiva = $event"
      @a-prop-monitor="monitorCercano = $event"
      @preparat="iniciarConnexio"
      @moviment-local="enviarMoviment"
      @proximitat-canviada="idsPropers = $event"
      @volum-sala="volumSala = $event"
    />

    <aside style="width: 280px; background: #1e293b; color: white; padding: 18px; border-radius: 12px;">

      <h3>Estat de Proximitat</h3>

      <section class="multijugador">
        <h2>El meu perfil</h2>

        <p role="status">Xarxa: {{ estatXarxa }}</p>

        <fieldset
          @focusin="refCanvas?.bloquejarControls(true)"
          @focusout="refCanvas?.bloquejarControls(false)"
        >
          <label>Nom
            <input
              v-model="elMeuNom"
              maxlength="24"
              @change="aplicarPerfil"
            />
          </label>

          <label>Color
            <input
              v-model="elMeuColor"
              type="color"
              @input="aplicarPerfil"
            />
          </label>
        </fieldset>
      </section>

      <!-- RADAR DE COMPANYOS -->
      <section class="multijugador" aria-label="Radar">
        <h2>Companys ({{ Object.keys(usuarisRemots).length }})</h2>

        <p v-if="!Object.keys(usuarisRemots).length">
          Encara no hi ha companys.
        </p>

        <ul>
          <li v-for="u in Object.values(usuarisRemots)" :key="u.id">
            <span
              class="led"
              :class="{ proper: idsPropers.includes(u.id) }"
            ></span>

            {{ u.nom }}:
            {{ idsPropers.includes(u.id) ? 'A prop' : 'Lluny' }}
          </li>
        </ul>

        <p>Volum de sala: {{ volumSala }}%</p>

        <small>El LED indica distància. No obre cap trucada.</small>
      </section>

      <div v-if="monitorCercano" style="background: #92400e; padding: 14px; border-radius: 8px; margin-top: 12px;">
        <strong>A prop de: {{ monitorCercano }}</strong>
      </div>

      <div v-if="zonaActiva" style="background: #065f46; border: 2px solid #10b981; padding: 14px; border-radius: 8px;">
        <strong>Dins de: {{ zonaActiva.nom }}</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">Àudio de sala actiu (llest per Fase 4)</p>
      </div>

      <div v-else style="background: #334155; padding: 14px; border-radius: 8px;">
        <strong>Passadís / Zona comuna</strong>
        <p style="margin: 6px 0 0; font-size: 13px; color: #cbd5e1;">Sense conversa activa</p>
      </div>

      <div v-if="zonaActiva" style="background: #1e40af; padding: 14px; border-radius: 8px; margin-top: 12px;">
        <strong>Temps a la zona: {{ segons }} segons</strong>
      </div>

      <!-- Monitor en miniatura -->
      <div
        v-if="zonaActiva?.streamUrl"
        class="monitor-mini"
        @click="obrirModalGran"
      >
        <button
          v-if="!soActivat"
          @click.stop="activarSo"
        >
          Activar so
        </button>

        <div class="monitor-capcalera">
          <span>{{ zonaActiva.titolMonitor }}</span>
          <span>Ampliar</span>
        </div>

        <video
          ref="videoMini"
          :src="zonaActiva.streamUrl"
          autoplay
          loop
          playsinline
          :muted="!soActivat"
        ></video>
      </div>

      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">
        Controls: WASD o Fletxes per moure en George.
      </p>

    </aside>

    <!-- FASE 4: finestra modal gran -->
    <div
      v-if="modalObert && zonaActiva"
      class="modal-overlay"
      @click.self="tancarModalGran"
    >
      <div class="modal-caixa">
        <div class="modal-capcalera">
          <h3>{{ zonaActiva.titolMonitor }} · Vista Ampliada</h3>
          <button class="boto-tancar" @click="tancarModalGran">
            Tancar [X]
          </button>
        </div>

        <video
          ref="videoGran"
          :src="zonaActiva.streamUrl"
          autoplay
          controls
          loop
          class="video-gran"
          :muted="!soActivat"
        ></video>
      </div>
    </div>

  </main>
</template>

<style scoped>
.monitor-mini {
  margin-top: 16px;
  background: #0f172a;
  border: 2px solid #10b981;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;
}

.monitor-mini:hover {
  transform: scale(1.02);
  border-color: #34d399;
}

.monitor-capcalera {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #064e3b;
  font-size: 13px;
  font-weight: bold;
}

.monitor-mini video {
  width: 100%;
  display: block;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-caixa {
  background: #1e293b;
  border: 2px solid #38bdf8;
  border-radius: 14px;
  width: 90%;
  max-width: 820px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0,0,0,0.6);
}

.modal-capcalera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
}

.boto-tancar {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}

.video-gran {
  width: 100%;
  max-height: 70vh;
  display: block;
  background: black;
}

/* Fase 5: perfil i radar */
.multijugador {
  padding: 18px;
  border-bottom: 1px solid #dce5df;
}

.multijugador h2 {
  font-size: 18px;
}

.multijugador fieldset {
  border: 0;
  padding: 0;
  margin: 0;
}

.multijugador label {
  display: block;
  margin: 10px 0;
}

.multijugador input {
  display: block;
  max-width: 100%;
}

.multijugador ul {
  list-style: none;
  padding: 0;
}

.multijugador li {
  margin: 8px 0;
}

.led {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #87948e;
  margin-right: 8px;
}

.led.proper {
  background: #17845e;
}
</style>
