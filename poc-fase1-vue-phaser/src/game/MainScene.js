  import Phaser from 'phaser';
  
  export class MainScene extends Phaser.Scene {
    constructor() { super('MainScene'); }
  
    create() { // ... codi existent de l'avatar i l'etiqueta ...
      this.avatar = this.add.circle(320, 200, 24, 0x10b981);
      this.etiqueta = this.add.text(320, 160, 'Anna', {
        fontSize: '18px', fontFamily: 'sans-serif', color: '#ffffff'
      }).setOrigin(0.5);
      this.estat =
    }
  
    update(time) { // ... codi existent del moviment a 60 FPS ...
      this.avatar.y = 200 + Math.sin(time * 0.004) * 8;
      this.etiqueta.setPosition(this.avatar.x, this.avatar.y - 38);
    }
  
   // [NOU] Afegeix aquest mètode DINS de class MainScene (abans de tancar })
   actualitzarNom(nouNom) {
     // ?. evita errors si l'escena encara carrega; || 'Anònim' evita text buit
     this.etiqueta?.setText(nouNom || 'Anònim');
   }

   actualitzarColor(nouColor) {
    if (nouColor) {
        this.avatar?.setFillStyle(
            Phaser.Display.Color.HexStringToColor(nouColor).color
        );
    }
}
  }
