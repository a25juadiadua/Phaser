  import Phaser from 'phaser';
  export class MapScene extends Phaser.Scene {
    constructor() { super('MapScene'); }
    preload() { /* ... càrrega de tiles_oficina i mapa_oficina ... */ }
  
    create() {
      const map = this.make.tilemap({ key: 'mapa_oficina' });
      const tileset = map.addTilesetImage('tileset_tiled', 'tiles_oficina');
      const elementsDetectats = []; // [NOU] Llista per enviar a Vue en acabar el bucle

      map.createLayer('Terra', tileset, 0, 0);
      const capaParets = map.createLayer('Parets', tileset, 0, 0);
      capaParets?.setCollisionByProperty({ collides: true });
 
     // [NOU] Llegim la capa d'objectes 'Objectes' definida a Tiled
    const capaObjectes = map.getObjectLayer('Objectes');
     capaObjectes?.objects.forEach((obj) => {
       const props = this.obtenirPropietats(obj); // Converteix [{name,value}] -> {clau: valor}
       // Tiled dona (x, y) a dalt a l'esquerra; sumem la meitat per trobar el centre
       const cx = obj.x + (obj.width || 0) / 2;
       const cy = obj.y + (obj.height || 0) / 2;
 
       if (props.tipus === 'spawn') {
          this.avatar = this.add.circle(cx, cy, 14, 0x10b981).setStrokeStyle(2, 0xffffff);
        }
       // [NOU] Si és una sala de reunions, dibuixem un rectangle semitransparent i el nom
       if (props.tipus === 'zona') {
         this.add.rectangle(cx, cy, obj.width, obj.height, 0x10b981, 0.22).setStrokeStyle(2, 0x10b981);
         this.add.text(cx, cy, props.nomSala || 'Zona', { fontSize: '13px', color: '#a7f3d0' }).setOrigin(0.5);
         elementsDetectats.push({ tipus: 'Zona', nom: props.nomSala || 'Sense nom' });
       }
       // [NOU] Si és un monitor, dibuixem una icona de pantalla i el seu títol
       if (props.tipus === 'monitor') {
         this.add.rectangle(cx, cy, 28, 20, 0xf59e0b).setStrokeStyle(2, 0xffffff);
         this.add.text(cx, cy - 18, props.titol || 'Monitor', { fontSize: '12px', color: '#fde68a' }).setOrigin(0.5);
         elementsDetectats.push({ tipus: 'Monitor', nom: props.titol || 'Pantalla' });
       }
      });
     // [NOU] Emetem un esdeveniment global del joc perquè PhaserCanvas.vue el rebi
     this.game.events.emit('mapa-carregat', elementsDetectats);
    }


    }
 
   // [NOU] Mètode auxiliar DINS de class MapScene per llegir Custom Properties de Tiled
   obtenirPropietats(obj) {
     const resultat = {};
     (obj.properties || []).forEach((p) => { resultat[p.name] = p.value; });
     return resultat;
   }
  }



