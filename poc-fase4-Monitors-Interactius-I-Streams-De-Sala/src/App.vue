<script setup>
import { ref, watch, onUnmounted } from 'vue';
import PhaserCanvas from './components/PhaserCanvas.vue';

const zonaActiva = ref(null);
const monitorCercano = ref(null);

// FASE 4: referència al pont PhaserCanvas i estat del modal gran
const refCanvas = ref(null);
const modalObert = ref(false);

function obrirModalGran() {
  modalObert.value = true;
  refCanvas.value?.bloquejarControls(true); // Atura el teclat de Phaser
}
function tancarModalGran() {
  modalObert.value = false;
  refCanvas.value?.bloquejarControls(false); // Reactiva el teclat de Phaser
}

const segons = ref(0);
let interval = null;

watch(() => !!zonaActiva.value, (dinsZona) => {
  if (dinsZona) {
    // Comencem a comptar
    interval = setInterval(() => {
      segons.value++;
    }, 1000);
  } else {
    // Sortim de la zona: parem i reiniciem
    clearInterval(interval);
    interval = null;
    segons.value = 0;
  }
});

// Evitem deixar l'interval actiu si es destrueix el component
onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <main style="display: flex; gap: 20px; padding: 20px; font-family: sans-serif;">
<PhaserCanvas
  ref="refCanvas"
  @canvi-zona="zonaActiva = $event"
  @a-prop-monitor="monitorCercano = $event"
/>
    <aside style="width: 280px; background: #1e293b; color: white; padding: 18px; border-radius: 12px;">
      <h3>Estat de Proximitat</h3>
      
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
    
    <div v-if="zonaActiva?.streamUrl" class="monitor-mini" @click="obrirModalGran">

      <div class="monitor-capcalera">
        <span>{{ zonaActiva.titolMonitor }}</span>
        <span>Ampliar</span>
      </div>

      <video :src="zonaActiva.streamUrl" autoplay loop playsinline></video>

    </div>
      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Controls: WASD o Fletxes per moure en George.</p>
      
      
    </aside>

    <!-- FASE 4: finestra modal gran superposada a tota la pantalla -->
    <div v-if="modalObert && zonaActiva" class="modal-overlay" @click.self="tancarModalGran">
      <div class="modal-caixa">
        <div class="modal-capcalera">
          <h3>{{ zonaActiva.titolMonitor }} · Vista Ampliada</h3>
          <button class="boto-tancar" @click="tancarModalGran">Tancar [X]</button>
        </div>
        <video :src="zonaActiva.streamUrl" autoplay controls loop class="video-gran"></video>
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
.monitor-mini:hover { transform: scale(1.02); border-color: #34d399; }

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

/* FASE 4: estils de la finestra modal gran */
.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.85); display: flex; align-items: center; justify-content: center; z-index: 50; }
.modal-caixa { background: #1e293b; border: 2px solid #38bdf8; border-radius: 14px; width: 90%; max-width: 820px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.6); }
.modal-capcalera { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: #0f172a; border-bottom: 1px solid #334155; }
.boto-tancar { background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: bold; cursor: pointer; }
.video-gran { width: 100%; max-height: 70vh; display: block; background: black; }
</style>