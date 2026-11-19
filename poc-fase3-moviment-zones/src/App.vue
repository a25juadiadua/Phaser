<script setup>
import { ref, watch, onUnmounted } from 'vue';
import PhaserCanvas from './components/PhaserCanvas.vue';

const zonaActiva = ref(null);
const monitorCercano = ref(null);

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
      <p style="margin-top: 16px; font-size: 12px; color: #94a3b8;">Controls: WASD o Fletxes per moure en George.</p>
    </aside>
  </main>
</template>