<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { OfficeScene } from '../game/OfficeScene';

const emit = defineEmits(['canviZona', 'a-prop-monitor']); // Notificarà a App.vue quan entrem/sortim d'una sala
const contenidor = ref(null);
let game = null;

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 640, height: 480,    // 640x480 px (mapa de 20x15 rajoles de 32x32)
    backgroundColor: '#0f172a',
    pixelArt: true,             // Mantenim el pixel art nítid
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 } } // IMPRESCINDIBLE: 0 gravetat en vista zenital!
    },
    parent: contenidor.value,
    scene: [OfficeScene]
  });
  game.events.on('canvi-zona', (zona) => emit('canviZona', zona));
  game.events.on('a-prop-monitor', (titol) => emit('a-prop-monitor', titol));
});

onUnmounted(() => game?.destroy(true));
</script>

<template><div ref="contenidor"></div></template>