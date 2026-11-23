
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Phaser from 'phaser';
import { OfficeScene } from '../game/OfficeScene';

const emit = defineEmits([
  'canviZona',
  'a-prop-monitor',
  'preparat',
  'movimentLocal',
  'proximitatCanviada',
  'volumSala'
]);

const contenidor = ref(null);
let game = null;

function enviarJugadors(tots) {
  game?.events.emit('xarxa:jugadors', tots);
}

function actualitzarPerfil(perfil) {
  game?.events.emit('perfil:local', perfil);
}

function bloquejarControls(estat) {
  game?.scene.getScene('OfficeScene')?.bloquejarControls(estat);
}

defineExpose({
  enviarJugadors,
  actualitzarPerfil,
  bloquejarControls
});

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    backgroundColor: '#0f172a',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 } }
    },
    parent: contenidor.value,
    scene: [OfficeScene],

    callbacks: {
      preBoot(g) {
        g.events.on('canvi-zona', (zona) => emit('canviZona', zona));
        g.events.on('a-prop-monitor', (titol) => emit('a-prop-monitor', titol));

        g.events.on('preparat', (pos) => emit('preparat', pos));

        g.events.on('jugador-mogut-local', (pos) => {
          emit('movimentLocal', pos);
        });

        g.events.on('proximitat-canviada', (ids) => {
          emit('proximitatCanviada', ids);
        });

        g.events.on('volum-sala', (volum) => {
          emit('volumSala', volum);
        });
      }
    }
  });
});

onUnmounted(() => game?.destroy(true));
</script>

<template>
  <div ref="contenidor"></div>
</template>
