// ============================================================
// eBaskicim — Content Editor Engine
// Canvas tabanlı text + PNG render → Three.js CanvasTexture
// ============================================================

import * as THREE from 'three';

// --- FONT VERİTABANI ---
const FONTS = [
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", category: 'serif' },
  { id: 'raleway', name: 'Raleway', family: 'Raleway, sans-serif', category: 'sans' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', category: 'sans' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans' },
  { id: 'bebas', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", category: 'display' },
  { id: 'fira', name: 'Fira Sans', family: "'Fira Sans', sans-serif", category: 'sans' },
  { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', category: 'sans' },
];

// --- YERLEŞİM ŞABLONLARI ---
const LAYOUTS = {
  center: { name: 'Ortalanmış', align: 'center', valign: 'middle' },
  left: { name: 'Sola Dayalı', align: 'left', valign: 'middle' },
  split_top_bottom: { name: 'Başlık Üst - Detay Alt', align: 'center', valign: 'split' },
  logo_left_text_right: { name: 'Logo Sol - Metin Sağ', align: 'left', valign: 'middle', logo: 'left' },
  full_bleed: { name: 'Tam Kenar', align: 'center', valign: 'middle', bleed: true },
};

// --- ŞEKİL TANIMLARI ---
const SHAPES = {
  rectangle_landscape: { name: 'Yatay Dikdörtgen', type: 'rect', ratio: 1.5 },
  rectangle_portrait: { name: 'Dikey Dikdörtgen', type: 'rect', ratio: 0.7 },
  square: { name: 'Kare', type: 'rect', ratio: 1.0 },
  circle: { name: 'Yuvarlak', type: 'circle', ratio: 1.0 },
  oval: { name: 'Oval', type: 'ellipse', ratio: 0.7 },
  rounded_rect: { name: 'Köşeleri Yuvarlak', type: 'rounded_rect', ratio: 1.4, radius: 20 },
};

// ============================================================
// CONTENT EDITOR CLASS
// ============================================================
export class ContentEditor {
  constructor() {
    this.state = {
      // Metin
      line1: '',
      line2: '',
      line3: '',
      font: 'montserrat',
      fontSize1: 48,    // başlık punto
      fontSize2: 28,    // alt başlık punto
      fontSize3: 18,    // detay punto
      textColor: '#1a1a1a',
      textColor2: '#444444',
      textColor3: '#666666',

      // Görsel
      uploadedImage: null,     // HTML Image element
      uploadedImageURL: null,  // data URL
      imageScale: 100,         // %
      imageOpacity: 100,       // %
      imagePosition: 'top',    // top | bottom | background

      // Yerleşim
      layout: 'center',
      shape: 'rectangle_landscape',

      // Arka plan
      bgColor: '#ffffff',
      padding: 40,

      // Canvas boyutu (ürün ebatından hesaplanır)
      canvasWidth: 1024,
      canvasHeight: 768,
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.texture = null;
    this._dirty = true;
  }

  // Ürün ebatına göre canvas boyutunu ayarla (DPI: 150)
  setProductSize(widthMM, heightMM) {
    const dpi = 150;
    const mmToPx = dpi / 25.4;
    this.state.canvasWidth = Math.round(widthMM * mmToPx);
    this.state.canvasHeight = Math.round(heightMM * mmToPx);
    this._dirty = true;
  }

  // Metin satırlarını güncelle
  setText(line1, line2, line3) {
    this.state.line1 = line1 || '';
    this.state.line2 = line2 || '';
    this.state.line3 = line3 || '';
    this._dirty = true;
  }

  // Font değiştir
  setFont(fontId) {
    if (FONTS.find(f => f.id === fontId)) {
      this.state.font = fontId;
      this._dirty = true;
    }
  }

  // Renk değiştir
  setTextColor(color, lineIndex) {
    if (lineIndex === 0) this.state.textColor = color;
    else if (lineIndex === 1) this.state.textColor2 = color;
    else this.state.textColor3 = color;
    this._dirty = true;
  }

  // Yerleşim şablonu
  setLayout(layoutId) {
    if (LAYOUTS[layoutId]) {
      this.state.layout = layoutId;
      this._dirty = true;
    }
  }

  // Şekil
  setShape(shapeId) {
    if (SHAPES[shapeId]) {
      this.state.shape = shapeId;
      this._dirty = true;
    }
  }

  // Görsel yükle (File veya URL)
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.state.uploadedImage = img;
        this.state.uploadedImageURL = img.src;
        this._dirty = true;
        resolve(img);
      };
      img.onerror = reject;

      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.onerror = reject;
        reader.readAsDataURL(source);
      }
    });
  }

  // Görseli kaldır
  removeImage() {
    this.state.uploadedImage = null;
    this.state.uploadedImageURL = null;
    this._dirty = true;
  }

  // Görsel ölçeği ve opaklığı
  setImageScale(percent) { this.state.imageScale = percent; this._dirty = true; }
  setImageOpacity(percent) { this.state.imageOpacity = percent; this._dirty = true; }

  // Arka plan rengi
  setBgColor(color) { this.state.bgColor = color; this._dirty = true; }

  // Canvas'ı render et
  render() {
    const s = this.state;
    const w = s.canvasWidth;
    const h = s.canvasHeight;
    const ctx = this.ctx;

    this.canvas.width = w;
    this.canvas.height = h;

    // --- Arka plan ---
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, w, h);

    const pad = s.padding;
    const contentW = w - pad * 2;
    const contentH = h - pad * 2;
    const font = FONTS.find(f => f.id === s.font);

    // --- Görsel (arka plan / tam kenar) ---
    if (s.uploadedImage && s.layout === 'full_bleed') {
      this._drawImage(ctx, 0, 0, w, h, 'cover');
    }

    // --- Görsel (logo solda) ---
    let logoAreaW = 0;
    if (s.uploadedImage && s.layout === 'logo_left_text_right') {
      logoAreaW = contentW * 0.45;
      const logoH = contentH;
      const logoX = pad;
      const logoY = pad;
      this._drawImage(ctx, logoX, logoY, logoAreaW, logoH, 'contain');
    }

    // --- Görsel (üstte) ---
    if (s.uploadedImage && s.imagePosition === 'top' && s.layout !== 'logo_left_text_right' && s.layout !== 'full_bleed') {
      const imgH = contentH * 0.4;
      this._drawImage(ctx, pad, pad, contentW, imgH, 'contain');
    }

    // --- Görsel (background watermark) ---
    if (s.uploadedImage && s.imagePosition === 'background' && s.layout !== 'full_bleed') {
      ctx.save();
      ctx.globalAlpha = s.imageOpacity / 200; // half opacity for bg
      this._drawImage(ctx, 0, 0, w, h, 'cover');
      ctx.restore();
    }

    // --- Metin render ---
    const layout = LAYOUTS[s.layout];
    let textX = pad + (s.layout === 'logo_left_text_right' ? logoAreaW + 30 : 0);
    let textW = s.layout === 'logo_left_text_right' ? contentW - logoAreaW - 30 : contentW;

    // Başlık (line1)
    if (s.line1) {
      ctx.fillStyle = s.textColor;
      ctx.font = `600 ${s.fontSize1}px "${font?.family || 'Inter, sans-serif'}"`;
      ctx.textBaseline = 'top';

      let y = pad + contentH * 0.08;
      if (layout.valign === 'split' || s.layout === 'split_top_bottom') {
        y = pad + contentH * 0.1;
      }

      this._drawText(ctx, s.line1, textX, y, textW, s.fontSize1 * 1.3, layout.align);
    }

    // Alt başlık (line2)
    if (s.line2) {
      ctx.fillStyle = s.textColor2;
      ctx.font = `400 ${s.fontSize2}px "${font?.family || 'Inter, sans-serif'}"`;

      let y = pad + contentH * 0.08 + s.fontSize1 * 1.3 + 10;
      if (layout.valign === 'split') {
        y = pad + contentH * 0.55;
      }

      this._drawText(ctx, s.line2, textX, y, textW, s.fontSize2 * 1.3, layout.align);
    }

    // Detay (line3)
    if (s.line3) {
      ctx.fillStyle = s.textColor3;
      ctx.font = `300 ${s.fontSize3}px "${font?.family || 'Inter, sans-serif'}"`;

      let y = pad + contentH * 0.08 + (s.fontSize1 + s.fontSize2) * 1.3 + 20;
      if (layout.valign === 'split') {
        y = pad + contentH * 0.55 + s.fontSize2 * 1.3 + 20;
      }

      this._drawText(ctx, s.line3, textX, y, textW, s.fontSize3 * 1.3, layout.align);
    }

    // --- Görsel (altta) ---
    if (s.uploadedImage && s.imagePosition === 'bottom' && s.layout !== 'logo_left_text_right' && s.layout !== 'full_bleed' && s.layout !== 'split_top_bottom') {
      const imgH = contentH * 0.35;
      const textUsedH = this._measureTextHeight(s, textW);
      const y = Math.max(pad + textUsedH + 30, h - pad - imgH);
      this._drawImage(ctx, pad, y, contentW, Math.min(imgH, h - y - pad), 'contain');
    }

    this._dirty = false;

    // CanvasTexture oluştur
    if (this.texture) {
      this.texture.dispose();
    }
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = true;

    return this.texture;
  }

  // CanvasTexture döndür (gerekiyorsa render et)
  getTexture() {
    if (this._dirty || !this.texture) {
      return this.render();
    }
    return this.texture;
  }

  // Data URL olarak dışa aktar
  toDataURL(format = 'image/png', quality = 1.0) {
    if (this._dirty) this.render();
    return this.canvas.toDataURL(format, quality);
  }

  // --- PRIVATE HELPERS ---

  _drawImage(ctx, x, y, maxW, maxH, fit) {
    const img = this.state.uploadedImage;
    if (!img) return;

    const imgAspect = img.width / img.height;
    const areaAspect = maxW / maxH;

    let drawW, drawH, drawX, drawY;

    if (fit === 'cover') {
      if (imgAspect > areaAspect) {
        drawH = maxH;
        drawW = drawH * imgAspect;
      } else {
        drawW = maxW;
        drawH = drawW / imgAspect;
      }
    } else { // contain
      if (imgAspect > areaAspect) {
        drawW = maxW;
        drawH = drawW / imgAspect;
      } else {
        drawH = maxH;
        drawW = drawH * imgAspect;
      }
    }

    drawW *= this.state.imageScale / 100;
    drawH *= this.state.imageScale / 100;

    drawX = x + (maxW - drawW) / 2;
    drawY = y + (maxH - drawH) / 2;

    ctx.save();
    ctx.globalAlpha = this.state.imageOpacity / 100;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  _drawText(ctx, text, x, y, maxW, lineHeight, align) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxW && line !== '') {
        this._drawLine(ctx, line.trim(), x, currentY, maxW, align);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      this._drawLine(ctx, line.trim(), x, currentY, maxW, align);
    }
  }

  _drawLine(ctx, text, x, y, maxW, align) {
    let drawX = x;
    if (align === 'center') {
      drawX = x + maxW / 2 - ctx.measureText(text).width / 2;
    } else if (align === 'right') {
      drawX = x + maxW - ctx.measureText(text).width;
    }
    ctx.fillText(text, drawX, y);
  }

  _measureTextHeight(s, maxW) {
    let totalH = 0;
    const font = FONTS.find(f => f.id === s.font);
    const ctx = this.ctx;
    if (s.line1) {
      ctx.font = `600 ${s.fontSize1}px "${font?.family || 'Inter'}"`;
      totalH += this._countLines(ctx, s.line1, maxW) * s.fontSize1 * 1.3;
    }
    if (s.line2) {
      ctx.font = `400 ${s.fontSize2}px "${font?.family || 'Inter'}"`;
      totalH += this._countLines(ctx, s.line2, maxW) * s.fontSize2 * 1.3;
    }
    if (s.line3) {
      ctx.font = `300 ${s.fontSize3}px "${font?.family || 'Inter'}"`;
      totalH += this._countLines(ctx, s.line3, maxW) * s.fontSize3 * 1.3;
    }
    return totalH;
  }

  _countLines(ctx, text, maxW) {
    const words = text.split(' ');
    let line = '';
    let count = 0;
    for (const word of words) {
      const test = line + word + ' ';
      if (ctx.measureText(test).width > maxW && line !== '') {
        count++;
        line = word + ' ';
      } else {
        line = test;
      }
    }
    if (line.trim()) count++;
    return count;
  }
}

// ============================================================
// 3D MESH BUILDER — Şekle göre geometri
// ============================================================

/**
 * Ürün şekline göre board + front mesh oluştur.
 * contentTexture: ContentEditor'dan gelen CanvasTexture
 */
export function buildShapedProduct(shapeId, widthM, heightM, thicknessM, materialData, contentTexture) {
  const shape = SHAPES[shapeId] || SHAPES.rectangle_landscape;
  const group = new THREE.Group();

  let boardGeo, frontGeo;

  switch (shape.type) {
    case 'rect':
    case 'rounded_rect':
      boardGeo = new THREE.BoxGeometry(widthM, heightM, thicknessM);
      frontGeo = new THREE.PlaneGeometry(widthM - 0.002, heightM - 0.002);

      if (shape.type === 'rounded_rect') {
        // Rounded rectangle için ShapeGeometry
        const r = (shape.radius || 20) / 1000; // mm → m
        const hw = widthM / 2;
        const hh = heightM / 2;
        const rectShape = new THREE.Shape();
        rectShape.moveTo(-hw + r, -hh);
        rectShape.lineTo(hw - r, -hh);
        rectShape.quadraticCurveTo(hw, -hh, hw, -hh + r);
        rectShape.lineTo(hw, hh - r);
        rectShape.quadraticCurveTo(hw, hh, hw - r, hh);
        rectShape.lineTo(-hw + r, hh);
        rectShape.quadraticCurveTo(-hw, hh, -hw, hh - r);
        rectShape.lineTo(-hw, -hh + r);
        rectShape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

        boardGeo = new THREE.ExtrudeGeometry(rectShape, { steps: 1, depth: thicknessM, bevelEnabled: false });
        frontGeo = new THREE.ShapeGeometry(rectShape);
      }
      break;

    case 'circle':
      // Silindir (ince disk)
      boardGeo = new THREE.CylinderGeometry(widthM / 2, widthM / 2, thicknessM, 64);
      frontGeo = new THREE.CircleGeometry(widthM / 2 - 0.002, 64);
      break;

    case 'ellipse':
      // Oval: scale a circle
      boardGeo = new THREE.CylinderGeometry(widthM / 2, widthM / 2, thicknessM, 64);
      // Front: scale circle
      frontGeo = new THREE.CircleGeometry(widthM / 2 - 0.002, 64);
      // scale the group for ellipse
      break;

    default:
      boardGeo = new THREE.BoxGeometry(widthM, heightM, thicknessM);
      frontGeo = new THREE.PlaneGeometry(widthM - 0.002, heightM - 0.002);
  }

  // --- Board ---
  const boardMat = materialData
    ? new THREE.MeshStandardMaterial({
      color: materialData.color || '#f5f0e8',
      roughness: materialData.roughness || 0.5,
      metalness: materialData.metalness || 0.02,
    })
    : new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.6, metalness: 0.02 });

  const board = new THREE.Mesh(boardGeo, boardMat);
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  // --- Ön yüz (content) ---
  const frontMat = new THREE.MeshStandardMaterial({
    map: contentTexture,
    roughness: 0.45,
    metalness: 0,
  });

  let front;
  if (shape.type === 'circle' || shape.type === 'ellipse') {
    front = new THREE.Mesh(frontGeo, frontMat);
    front.position.z = thicknessM / 2 + 0.0005;
  } else if (shape.type === 'rounded_rect') {
    front = new THREE.Mesh(frontGeo, frontMat);
    front.position.z = thicknessM / 2 + 0.0005;
  } else {
    front = new THREE.Mesh(frontGeo, frontMat);
    front.position.z = thicknessM / 2 + 0.0005;
  }

  group.add(front);

  // Ellipse: scale X to squish circle → oval (XZ plane)
  if (shape.type === 'ellipse') {
    group.scale.set(heightM / widthM, 1, 1);
  }

  return { group, board, front };
}

// Export statics
export { FONTS, LAYOUTS, SHAPES };
