// ============================================================
// eBaskicim — 3D Sign Letters System
// TextGeometry + FontLoader + animasyonlu harf ekleme
// Her harf ayrı 3D model, grup otomatik ortalanır.
// ============================================================

import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import gsap from 'gsap';

// Harf stilleri
const LETTER_STYLES = {
  metal_gold: {
    color: '#c4a96a',
    roughness: 0.2,
    metalness: 0.9,
    name: 'Altın Metal',
  },
  metal_silver: {
    color: '#c8ccd0',
    roughness: 0.25,
    metalness: 0.85,
    name: 'Gümüş Metal',
  },
  metal_bronze: {
    color: '#8b6914',
    roughness: 0.3,
    metalness: 0.7,
    name: 'Bronz',
  },
  matte_black: {
    color: '#1a1a1a',
    roughness: 0.5,
    metalness: 0.05,
    name: 'Siyah Mat',
  },
  glossy_white: {
    color: '#fafafa',
    roughness: 0.15,
    metalness: 0.02,
    name: 'Beyaz Parlak',
  },
  red: {
    color: '#cc2222',
    roughness: 0.25,
    metalness: 0.1,
    name: 'Kırmızı',
  },
  blue: {
    color: '#2255aa',
    roughness: 0.25,
    metalness: 0.1,
    name: 'Mavi',
  },
  gold_acrylic: {
    color: '#d4a843',
    roughness: 0.1,
    metalness: 0.15,
    name: 'Altın Akrilik',
  },
};

// Font loader (singleton)
let _fontLoader = null;
let _loadedFont = null;
let _fontLoading = null;

function getFontLoader() {
  if (!_fontLoader) _fontLoader = new FontLoader();
  return _fontLoader;
}

// Font yükle (CDN'den helvetiker bold)
async function loadFont(url) {
  if (_loadedFont) return _loadedFont;
  if (_fontLoading) return _fontLoading;

  _fontLoading = new Promise((resolve, reject) => {
    const loader = getFontLoader();
    loader.load(
      url,
      (font) => {
        _loadedFont = font;
        _fontLoading = null;
        resolve(font);
      },
      undefined, // progress
      (err) => {
        _fontLoading = null;
        reject(err);
      }
    );
  });

  return _fontLoading;
}

// ============================================================
// SIGN LETTERS CLASS
// ============================================================
export class SignLetters {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'SignLetters';
    this.letters = [];        // { char, mesh, targetX, targetY }
    this.currentText = '';
    this.style = 'metal_gold';
    this.letterHeight = 0.4;  // metre (varsayılan harf yüksekliği)
    this.letterDepth = 0.04;  // metre (harf kalınlığı)
    this.letterSpacing = 0.04; // harfler arası boşluk
    this.font = null;
    this._ready = false;
  }

  // Font yükle
  async init(fontUrl) {
    if (this._ready) return;
    const fontUrlFinal = fontUrl || 'https://unpkg.com/three@0.170.0/examples/fonts/helvetiker_bold.typeface.json';
    this.font = await loadFont(fontUrlFinal);
    this._ready = true;
  }

  // Text değiştiğinde çağrılır
  updateText(newText) {
    if (!this._ready || !this.font) {
      console.warn('SignLetters: font henüz yüklenmedi');
      return;
    }

    newText = (newText || '').toUpperCase().trim();
    const oldText = this.currentText;

    if (newText === oldText) return;

    const oldChars = oldText.split('');
    const newChars = newText.split('');

    // Fazla harfleri kaldır
    while (this.letters.length > newChars.length) {
      const removed = this.letters.pop();
      if (removed.mesh) {
        gsap.to(removed.mesh.scale, { x: 0, y: 0, z: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
          this.group.remove(removed.mesh);
          removed.mesh.geometry?.dispose();
          removed.mesh.material?.dispose();
        }});
      }
    }

    // Yeni veya değişen harfleri ekle/güncelle
    for (let i = 0; i < newChars.length; i++) {
      const nc = newChars[i];
      const oc = i < oldChars.length ? oldChars[i] : null;

      if (nc === oc) continue; // aynı harf, dokunma

      // Eski harfi kaldır (eğer varsa ve farklıysa)
      if (i < this.letters.length && this.letters[i]) {
        const old = this.letters[i];
        gsap.to(old.mesh.scale, { x: 0, y: 0, z: 0, duration: 0.2, ease: 'power2.in', onComplete: () => {
          this.group.remove(old.mesh);
          old.mesh.geometry?.dispose();
          old.mesh.material?.dispose();
        }});
      }

      // Boşluk karakteri
      if (nc === ' ') {
        // Boşluk: invisible placeholder
        const dummyGeo = new THREE.BoxGeometry(0.001, 0.001, 0.001);
        const dummyMat = new THREE.MeshStandardMaterial({ visible: false });
        const dummy = new THREE.Mesh(dummyGeo, dummyMat);
        dummy.scale.set(0, 0, 0);
        dummy.position.set(0, 0, 0);
        this.group.add(dummy);
        this.letters[i] = { char: ' ', mesh: dummy };
        continue;
      }

      // Yeni 3D harf oluştur
      const letterMesh = this._createLetterMesh(nc);
      if (!letterMesh) continue;

      letterMesh.scale.set(0, 0, 0);
      letterMesh.position.set(0, 0, 0);
      this.group.add(letterMesh);

      // Eski harfi replace et veya yeni ekle
      if (i < this.letters.length) {
        this.letters[i] = { char: nc, mesh: letterMesh };
      } else {
        this.letters.push({ char: nc, mesh: letterMesh });
      }

      // Animasyonla görünür yap
      gsap.to(letterMesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.4,
        ease: 'back.out(1.8)',
        delay: (i - (oldChars.length)) * 0.06, // sıralı animasyon
      });
    }

    this.currentText = newText;

    // Yeniden ortala
    this._recenter();
  }

  // Tek harf mesh'i oluştur
  _createLetterMesh(char) {
    const style = LETTER_STYLES[this.style] || LETTER_STYLES.metal_gold;

    const textGeo = new TextGeometry(char, {
      font: this.font,
      size: this.letterHeight,
      height: this.letterDepth,    // depth (kalınlık)
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelOffset: 0,
      bevelSegments: 5,
    });

    // Geometriyi ortala (harf kendi merkezine)
    textGeo.computeBoundingBox();
    const bb = textGeo.boundingBox;
    const centerX = (bb.max.x + bb.min.x) / 2;
    const centerY = (bb.max.y + bb.min.y) / 2;
    textGeo.translate(-centerX, -centerY, 0);

    // Ön yüzeyler daha parlak, yan yüzeyler daha koyu
    const frontMat = new THREE.MeshStandardMaterial({
      color: style.color,
      roughness: style.roughness,
      metalness: style.metalness,
    });

    const mesh = new THREE.Mesh(textGeo, frontMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  // Tüm harfleri grubun içinde ortala
  _recenter() {
    if (this.letters.length === 0) return;

    // Her harfin genişliğini hesaplayıp pozisyonla
    let cursorX = 0;

    // Önce tüm harflerin bounding box'ını hesapla
    const positions = [];

    for (const letter of this.letters) {
      if (!letter.mesh || letter.char === ' ') {
        // Boşluk için fixed width
        positions.push({ x: cursorX, w: this.letterHeight * 0.4 });
        cursorX += this.letterHeight * 0.4 + this.letterSpacing;
        continue;
      }

      // Harfin bounding box'ından genişlik al
      const geo = letter.mesh.geometry;
      if (!geo.boundingBox) geo.computeBoundingBox();
      const bb = geo.boundingBox;
      const charWidth = bb.max.x - bb.min.x;
      const charCenterX = (bb.max.x + bb.min.x) / 2;

      positions.push({ x: cursorX, w: charWidth });

      // Mesh'i pozisyonla
      const targetX = cursorX + charWidth / 2;
      gsap.to(letter.mesh.position, {
        x: targetX,
        y: 0,
        z: 0,
        duration: 0.35,
        ease: 'power2.out',
      });

      cursorX += charWidth + this.letterSpacing;
    }

    if (positions.length === 0) return;

    // Toplam genişlik
    const totalWidth = cursorX - this.letterSpacing; // son spacing'i çıkar

    // Grubu -totalWidth/2 kaydırarak ortala
    const offsetX = -totalWidth / 2;
    gsap.to(this.group.position, {
      x: offsetX,
      y: 0,
      z: 0,
      duration: 0.35,
      ease: 'power2.out',
    });
  }

  // Stil değiştir
  setStyle(styleId) {
    if (!LETTER_STYLES[styleId]) return;
    this.style = styleId;
    const style = LETTER_STYLES[styleId];

    // Tüm harflerin materyalini güncelle
    for (const letter of this.letters) {
      if (letter.mesh && letter.mesh.material) {
        letter.mesh.material.color.set(style.color);
        letter.mesh.material.roughness = style.roughness;
        letter.mesh.material.metalness = style.metalness;
      }
    }
  }

  // Harf yüksekliğini değiştir (mm cinsinden)
  setLetterHeight(heightMM) {
    this.letterHeight = heightMM / 1000;  // mm → metre

    // Tüm harfleri yeniden oluştur
    const savedText = this.currentText;
    this.clear();
    this.currentText = '';
    this.updateText(savedText);
  }

  // Temizle
  clear() {
    for (const letter of this.letters) {
      if (letter.mesh) {
        gsap.killTweensOf(letter.mesh.scale);
        gsap.killTweensOf(letter.mesh.position);
        this.group.remove(letter.mesh);
        letter.mesh.geometry?.dispose();
        letter.mesh.material?.dispose();
      }
    }
    this.letters = [];
    this.currentText = '';
  }

  // Scene'e ekle
  addToScene(position) {
    if (position) this.group.position.copy(position);
    this.scene.add(this.group);
  }

  // Scene'den kaldır
  removeFromScene() {
    this.clear();
    this.scene.remove(this.group);
  }

  // Dispose
  dispose() {
    this.clear();
    this.scene.remove(this.group);
  }
}

export { LETTER_STYLES };
