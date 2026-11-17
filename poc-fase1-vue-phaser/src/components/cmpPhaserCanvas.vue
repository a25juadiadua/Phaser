  <script setup>
    import { ref, watch, onMounted, onUnmounted } from 'vue'; // [NOU] Importar watch
    import Phaser from 'phaser';
    import { MainScene } from '../game/MainScene';
 
    const props = defineProps(['nomUsuari', 'color', 'estat', 'pausado']); // [NOU] Rep la prop des d'App.vue
 
    const contenidor = ref(null);
 
    let game = null;
 
    onMounted(() => {
 
        game = new Phaser.Game({ type: Phaser.AUTO, width: 640, height: 400,
 
        backgroundColor: '#1e293b', parent: contenidor.value, scene: [MainScene] });
 
        // [NOU] Sincronitza el nom actual només acabar d'arrencar (útil amb v-if)
 
        game.events.once('ready', () => {

            game?.scene.getScene('MainScene')?.actualitzarNom(props.nomUsuari);
            game?.scene.getScene('MainScene')?.actualitzarColor(props.color);
            game?.scene.getScene('MainScene')?.actualitzarEstat(props.estat);
        });
 
    });
 
    onUnmounted(() => game?.destroy(true));
 
    // [NOU] Al MATEIX nivell que onMounted (MAI dins d'onMounted)
 
    watch(() => props.nomUsuari, (nouNom) => {
 
        const escena = game?.scene.getScene('MainScene');
 
        escena?.actualitzarNom(nouNom);
 
    });
 
    watch(() => props.color, (nouColor) => {
    const escena = game?.scene.getScene('MainScene');
    escena?.actualitzarColor(nouColor);
});

watch(() => props.estat, (nouEstat) => {
    const escena = game?.scene.getScene('MainScene');
    escena?.actualitzarEstat(nouEstat);
});

watch(() => props.pausado, (nouEstat) => {
    const escena = game?.scene.getScene('MainScene');

    if (nouEstat) {
        escena?.scene.pause();
    } else {
        escena?.scene.resume();
    }
});

 </script>
 
 <template><div ref="contenidor"></div></template>
