// ============================================================
// eBaskicim — Decision Tree Engine v1.0
// Pure JS, no DOM/3D dependency. State machine for product config.
// ============================================================

// --- MATERIAL DATABASE ---
// Her malzeme bir veri nesnesi. Texture DEĞİL, üretim bilgisi.
export const MATERIAL_DB = {
  kompozit_3mm: {
    id: 'kompozit_3mm',
    name: '3mm Alüminyum Kompozit',
    family: 'composite',
    thickness: 3,
    density: 1.85,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: false,
    summaCut: false,
    transparent: false,
    weightKgm2: 5.5,
    priceM2: 22,
    leadTimeDays: 2,
    maxSize: { w: 1500, h: 4000 },
    color: '#e8e8e8',
    roughness: 0.35,
    metalness: 0.05,
    texture: 'kompozit_white.jpg',
    finishOptions: ['mat', 'parlak'],
    notFor: ['desktop', 'nameplate'],
  },
  kompozit_4mm: {
    id: 'kompozit_4mm',
    name: '4mm Alüminyum Kompozit',
    family: 'composite',
    thickness: 4,
    density: 1.85,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: false,
    summaCut: false,
    transparent: false,
    weightKgm2: 7.2,
    priceM2: 28,
    leadTimeDays: 2,
    maxSize: { w: 1500, h: 4000 },
    color: '#e0e0e0',
    roughness: 0.35,
    metalness: 0.05,
    texture: 'kompozit_white.jpg',
    finishOptions: ['mat', 'parlak', 'fırçalanmış'],
    notFor: ['desktop', 'nameplate'],
  },
  dekota_3mm: {
    id: 'dekota_3mm',
    name: '3mm Dekota (PVC Köpük)',
    family: 'pvc_foam',
    thickness: 3,
    density: 0.45,
    outdoor: false,
    semiOutdoor: false,
    uvPrintable: true,
    cncCut: true,
    laserCut: false,
    summaCut: true,
    transparent: false,
    weightKgm2: 1.35,
    priceM2: 12,
    leadTimeDays: 1,
    maxSize: { w: 1200, h: 2400 },
    color: '#f5f0e8',
    roughness: 0.6,
    metalness: 0.02,
    texture: 'synthetic_wood.jpg',
    finishOptions: ['mat'],
    notFor: ['outdoor', 'semi_outdoor'],
  },
  dekota_5mm: {
    id: 'dekota_5mm',
    name: '5mm Dekota (PVC Köpük)',
    family: 'pvc_foam',
    thickness: 5,
    density: 0.45,
    outdoor: false,
    semiOutdoor: false,
    uvPrintable: true,
    cncCut: true,
    laserCut: false,
    summaCut: true,
    transparent: false,
    weightKgm2: 2.25,
    priceM2: 16,
    leadTimeDays: 1,
    maxSize: { w: 1200, h: 2400 },
    color: '#f0ebe0',
    roughness: 0.6,
    metalness: 0.02,
    texture: 'synthetic_wood.jpg',
    finishOptions: ['mat'],
    notFor: ['outdoor', 'semi_outdoor'],
  },
  dekota_10mm: {
    id: 'dekota_10mm',
    name: '10mm Dekota (PVC Köpük)',
    family: 'pvc_foam',
    thickness: 10,
    density: 0.45,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: false,
    summaCut: false,
    transparent: false,
    weightKgm2: 4.5,
    priceM2: 24,
    leadTimeDays: 1,
    maxSize: { w: 1200, h: 2400 },
    color: '#eee8dc',
    roughness: 0.6,
    metalness: 0.02,
    texture: 'wood_floor_worn.jpg',
    finishOptions: ['mat'],
    notFor: ['nameplate'],
  },
  pleksi_3mm: {
    id: 'pleksi_3mm',
    name: '3mm Pleksi (Akrilik Şeffaf)',
    family: 'acrylic',
    thickness: 3,
    density: 1.2,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: true,
    summaCut: false,
    transparent: true,
    weightKgm2: 3.6,
    priceM2: 35,
    leadTimeDays: 2,
    maxSize: { w: 1200, h: 2400 },
    color: '#e8f0f8',
    roughness: 0.1,
    metalness: 0.05,
    texture: 'marble_01.jpg',
    finishOptions: ['mat', 'parlak', 'buzlu'],
    notFor: [],
    specialEffects: ['backprint_white', 'edge_glow_led'],
  },
  pleksi_5mm: {
    id: 'pleksi_5mm',
    name: '5mm Pleksi (Akrilik Şeffaf)',
    family: 'acrylic',
    thickness: 5,
    density: 1.2,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: true,
    summaCut: false,
    transparent: true,
    weightKgm2: 6.0,
    priceM2: 45,
    leadTimeDays: 2,
    maxSize: { w: 1200, h: 2400 },
    color: '#e0ecf8',
    roughness: 0.1,
    metalness: 0.05,
    texture: 'marble_01.jpg',
    finishOptions: ['mat', 'parlak', 'buzlu'],
    notFor: [],
    specialEffects: ['backprint_white', 'edge_glow_led'],
  },
  aluminyum_2mm: {
    id: 'aluminyum_2mm',
    name: '2mm Alüminyum Sac',
    family: 'metal',
    thickness: 2,
    density: 2.7,
    outdoor: true,
    semiOutdoor: true,
    uvPrintable: true,
    cncCut: true,
    laserCut: true,
    summaCut: false,
    transparent: false,
    weightKgm2: 5.4,
    priceM2: 55,
    leadTimeDays: 3,
    maxSize: { w: 1000, h: 2000 },
    color: '#c0c4c8',
    roughness: 0.3,
    metalness: 0.85,
    texture: 'metal_plate.jpg',
    finishOptions: ['mat', 'fırçalanmış', 'eloksal'],
    notFor: ['desktop'],
  },
  ahsap_mdf_6mm: {
    id: 'ahsap_mdf_6mm',
    name: '6mm MDF Lazer Kesim',
    family: 'wood',
    thickness: 6,
    density: 0.7,
    outdoor: false,
    semiOutdoor: false,
    uvPrintable: true,
    cncCut: true,
    laserCut: true,
    summaCut: false,
    transparent: false,
    weightKgm2: 4.2,
    priceM2: 20,
    leadTimeDays: 1,
    maxSize: { w: 600, h: 900 },
    color: '#c4a87c',
    roughness: 0.5,
    metalness: 0.02,
    texture: 'dark_wood.jpg',
    finishOptions: ['doğal', 'vernikli', 'boyalı'],
    notFor: ['outdoor', 'semi_outdoor'],
  },
  forex_3mm: {
    id: 'forex_3mm',
    name: '3mm Forex (Ekonomik)',
    family: 'pvc_foam_eco',
    thickness: 3,
    density: 0.3,
    outdoor: false,
    semiOutdoor: false,
    uvPrintable: true,
    cncCut: false,
    laserCut: false,
    summaCut: true,
    transparent: false,
    weightKgm2: 0.9,
    priceM2: 8,
    leadTimeDays: 1,
    maxSize: { w: 700, h: 1000 },
    color: '#fafaf8',
    roughness: 0.7,
    metalness: 0.02,
    texture: 'plywood.jpg',
    finishOptions: ['mat'],
    notFor: ['outdoor', 'semi_outdoor', 'hanging', 'pole_mounted'],
  },
  kanvas_bez: {
    id: 'kanvas_bez',
    name: 'Kanvas Bez (Galeri Sarma)',
    family: 'fabric',
    thickness: 18,
    density: 0.4,
    outdoor: false,
    semiOutdoor: false,
    uvPrintable: true,
    cncCut: false,
    laserCut: false,
    summaCut: false,
    transparent: false,
    stretcherFrame: true,
    weightKgm2: 0.4,
    priceM2: 25,
    leadTimeDays: 1,
    maxSize: { w: 1000, h: 1500 },
    color: '#fafaf5',
    roughness: 0.7,
    metalness: 0,
    texture: 'velour_velvet.jpg',
    finishOptions: ['mat', 'saten'],
    notFor: ['outdoor', 'semi_outdoor', 'nameplate'],
  },
};

// --- DECISION TREE DATA ---
// Her düğüm: { id, question, type, options, affects }
// options: [{ id, label, icon?, affects?, children? }]
// Leaf: children yok → konfigürasyon tamam

const TREE = {
  id: 'product_family',
  question: 'Ne tür bir ürün istiyorsunuz?',
  type: 'single_choice',
  description: 'Ürün ailesini seçin, size özel seçenekleri getirelim.',
  options: [
    {
      id: 'signage',
      label: 'Yönlendirme & Tabela',
      icon: '🪧',
      description: 'İç/dış mekan yönlendirme, kurumsal tabela, kapı tabelası',
      affects: { product_type: 'signage' },
      children: {
        id: 'signage_location',
        question: 'Tabela nerede kullanılacak?',
        type: 'single_choice',
        options: [
          {
            id: 'indoor',
            label: 'İç Mekan',
            icon: '🏠',
            affects: { location: 'indoor' },
          },
          {
            id: 'outdoor',
            label: 'Dış Mekan',
            icon: '🌤️',
            affects: { location: 'outdoor' },
          },
          {
            id: 'semi_outdoor',
            label: 'Yarı Açık (Saçak Altı)',
            icon: '🏗️',
            affects: { location: 'semi_outdoor' },
          },
        ],
      },
    },
    {
      id: 'plaque',
      label: 'Plaket & Ödül',
      icon: '🏆',
      description: 'Akrilik plaket, kristal ödül, metal plaka, teşekkür belgesi',
      affects: { product_type: 'plaque' },
      children: {
        id: 'plaque_location',
        question: 'Plaket nerede sergilenecek?',
        type: 'single_choice',
        options: [
          { id: 'indoor', label: 'İç Mekan (Ofis/Ev)', icon: '🏠', affects: { location: 'indoor' } },
          { id: 'semi_outdoor', label: 'Yarı Açık (Giriş/Koridor)', icon: '🏗️', affects: { location: 'semi_outdoor' } },
        ],
      },
    },
    {
      id: 'nameplate',
      label: 'İsimlik & Rozet',
      icon: '📛',
      description: 'Masaüstü isimlik, kapı isimliği, yaka rozeti',
      affects: { product_type: 'nameplate' },
      children: {
        id: 'nameplate_mount',
        question: 'Nasıl kullanılacak?',
        type: 'single_choice',
        options: [
          {
            id: 'desktop',
            label: 'Masaüstü',
            icon: '🪑',
            affects: { mounting: 'desktop', location: 'indoor' },
          },
          {
            id: 'wall_mounted',
            label: 'Duvara Monte',
            icon: '🧱',
            affects: { mounting: 'wall_mounted', location: 'indoor' },
          },
        ],
      },
    },
    {
      id: 'print_product',
      label: 'Baskı Ürünleri',
      icon: '🎨',
      description: 'Kanvas baskı, çerçeveli tablo, vernikli eser, afiş',
      affects: { product_type: 'print_product', location: 'indoor' },
      children: {
        id: 'print_mount',
        question: 'Nasıl sergilenecek?',
        type: 'single_choice',
        options: [
          {
            id: 'wall_mounted',
            label: 'Duvara Asılı',
            icon: '🧱',
            affects: { mounting: 'wall_mounted' },
          },
          {
            id: 'hanging',
            label: 'Tavandan Askılı',
            icon: '🪝',
            affects: { mounting: 'hanging' },
          },
        ],
      },
    },
    {
      id: 'display',
      label: 'Teşhir & Stand',
      icon: '📐',
      description: 'Roll-up, masaüstü stand, katalog tutucu, x-stand',
      affects: { product_type: 'display', location: 'indoor' },
      children: {
        id: 'display_mount',
        question: 'Nerede kullanılacak?',
        type: 'single_choice',
        options: [
          {
            id: 'freestanding',
            label: 'Yerde (Ayaklı)',
            icon: '🦶',
            affects: { mounting: 'freestanding' },
          },
          {
            id: 'desktop',
            label: 'Masaüstü',
            icon: '🪑',
            affects: { mounting: 'desktop' },
          },
        ],
      },
    },
  ],
};

// --- SIZE PRESETS ---
const SIZE_PRESETS = [
  { id: 'a4_landscape', label: 'A4 Yatay (30×20 cm)', w: 300, h: 200, area: 0.06 },
  { id: 'a4_portrait', label: 'A4 Dikey (20×30 cm)', w: 200, h: 300, area: 0.06 },
  { id: 'a3', label: 'A3 (42×30 cm)', w: 420, h: 297, area: 0.125 },
  { id: '50x35', label: '50×35 cm', w: 500, h: 350, area: 0.175 },
  { id: '60x40', label: '60×40 cm', w: 600, h: 400, area: 0.24 },
  { id: '70x50', label: '70×50 cm', w: 700, h: 500, area: 0.35 },
  { id: '100x70', label: '100×70 cm', w: 1000, h: 700, area: 0.7 },
  { id: '120x80', label: '120×80 cm', w: 1200, h: 800, area: 0.96 },
  { id: '150x100', label: '150×100 cm', w: 1500, h: 1000, area: 1.5 },
];

// --- FINISHING OPTIONS ---
const FINISHING_OPTIONS = [
  { id: 'spot_uv', label: 'Spot UV Vernik', icon: '✨', pricePct: 15, needs: 'uvPrintable' },
  { id: 'full_gloss', label: 'Tam Parlak Vernik', icon: '💎', pricePct: 8, needs: 'uvPrintable' },
  { id: 'matte_lam', label: 'Mat Laminasyon', icon: '📋', pricePct: 10, exclude: 'metal' },
  { id: 'foil', label: 'Yaldız/Folyo Baskı', icon: '🌟', pricePct: 25, only: ['acrylic', 'wood'] },
  { id: 'laser_eng', label: 'Lazer Kazıma', icon: '🔪', pricePct: 20, needs: 'laserCut' },
  { id: 'led_backlight', label: 'LED Aydınlatma', icon: '💡', price: 200, only: ['acrylic'], needsTransparent: true },
  { id: 'magnetic', label: 'Mıknatıs Arka Yüz', icon: '🧲', price: 30, maxThickness: 5 },
];

// ============================================================
// CONSTRAINT ENGINE
// ============================================================
function checkConstraints(selections) {
  const warnings = [];
  const errors = [];
  const mat = selections.material ? MATERIAL_DB[selections.material] : null;

  if (!mat) return { warnings, errors };

  // --- SERT KONTROLLER (REJECT) ---
  if (selections.location === 'outdoor' && mat.outdoor === false) {
    errors.push({
      code: 'MATERIAL_NOT_OUTDOOR',
      message: `${mat.name} dış mekanda kullanılamaz.`,
      suggestion: 'Kompozit, alüminyum veya 10mm dekota seçin.',
    });
  }

  if (selections.location === 'semi_outdoor' && mat.outdoor === false && mat.semiOutdoor === false) {
    errors.push({
      code: 'MATERIAL_NOT_SEMI',
      message: `${mat.name} yarı açık alanda kullanılamaz.`,
    });
  }

  if (mat.notFor.includes(selections.mounting)) {
    errors.push({
      code: 'MATERIAL_NOT_FOR_MOUNT',
      message: `${mat.name}, ${selections.mounting} montaj için uygun değil.`,
    });
  }

  if (mat.notFor.includes(selections.location)) {
    errors.push({
      code: 'MATERIAL_NOT_FOR_LOCATION',
      message: `${mat.name}, ${selections.location} kullanım için uygun değil.`,
    });
  }

  if (selections.width && selections.height && mat.maxSize) {
    if (selections.width > mat.maxSize.w || selections.height > mat.maxSize.h) {
      errors.push({
        code: 'SIZE_EXCEEDS_MATERIAL',
        message: `${mat.name} maksimum ${mat.maxSize.w / 10}×${mat.maxSize.h / 10} cm ebatta üretilebilir.`,
      });
    }
  }

  if (selections.mounting === 'pole_mounted' && mat.thickness < 4) {
    errors.push({
      code: 'TOO_THIN_FOR_POLE',
      message: 'Direk montaj için minimum 4 mm kalınlık gerekli.',
    });
  }

  // --- YUMUŞAK KONTROLLER (WARNING) ---
  if (selections.location === 'outdoor' && mat.family === 'pvc_foam' && mat.thickness < 10) {
    warnings.push({
      code: 'PVC_OUTDOOR_RISK',
      message: 'İnce PVC köpük dış mekanda deforme olabilir. Kompozit veya 10mm dekota önerilir.',
    });
  }

  if (selections.mounting === 'hanging' && mat.weightKgm2) {
    const area = (selections.width || 300) * (selections.height || 200) / 1_000_000;
    const weight = mat.weightKgm2 * area;
    if (weight > 5) {
      warnings.push({
        code: 'HEAVY_HANGING',
        message: `Toplam ağırlık ${weight.toFixed(1)} kg. Askı sistemi güçlendirilmelidir.`,
      });
    }
  }

  if (selections.location === 'outdoor' && !selections.finishing?.includes('uv_resistant')) {
    warnings.push({
      code: 'UV_PROTECTION',
      message: 'Dış mekanda UV koruma önerilir. Solma riski olabilir.',
    });
  }

  return { warnings, errors };
}

// ============================================================
// DECISION TREE ENGINE
// ============================================================
export class DecisionTreeEngine {
  constructor() {
    this.tree = TREE;
    this.path = [];           // [{ nodeId, optionId, label }]
    this.selections = {};     // { product_type, location, mounting, material, size, width, height, finishings }
    this.currentNode = TREE;

    // Aktif soruyu bul
    this._advanceToNextQuestion();
  }

  // Verilen cevaplara göre sonraki soruyu bul
  _advanceToNextQuestion() {
    let node = this.tree;
    for (const step of this.path) {
      const option = node.options.find(o => o.id === step.optionId);
      if (option && option.children) {
        node = option.children;
      } else {
        node = null;
        break;
      }
    }
    this.currentNode = node;
    return node;
  }

  // Kullanıcı bir seçenek seçti
  select(optionId) {
    if (!this.currentNode) return { complete: true };

    const option = this.currentNode.options.find(o => o.id === optionId);
    if (!option) return { error: 'Geçersiz seçim' };

    // Seçimi kaydet
    this.path.push({
      nodeId: this.currentNode.id,
      optionId: option.id,
      label: option.label,
    });

    // Affect'leri state'e uygula
    if (option.affects) {
      Object.assign(this.selections, option.affects);
    }

    // Sonraki soruya ilerle
    const nextNode = this._advanceToNextQuestion();

    if (!nextNode) {
      // Bu seviyede çocuk yok → malzeme seçimine geç
      return { complete: false, next: 'material_selection' };
    }

    return {
      complete: false,
      next: 'question',
      node: nextNode,
      path: this.path,
      selections: this.selections,
    };
  }

  // Malzeme seçimi (karar ağacı tamamlandıktan sonra)
  getAvailableMaterials() {
    const loc = this.selections.location;
    const mount = this.selections.mounting;
    const ptype = this.selections.product_type;

    return Object.values(MATERIAL_DB).filter(mat => {
      // Konum filtresi
      if (loc === 'outdoor' && !mat.outdoor) return false;
      if (loc === 'semi_outdoor' && !mat.outdoor && !mat.semiOutdoor) return false;

      // Montaj filtresi
      if (mat.notFor.includes(mount)) return false;
      if (mat.notFor.includes(loc)) return false;

      // Ürün tipi filtreleri
      if (ptype === 'nameplate' && mat.thickness > 5) return false;
      if (ptype === 'nameplate' && mat.family === 'fabric') return false;

      return true;
    });
  }

  selectMaterial(materialId) {
    this.selections.material = materialId;
    const mat = MATERIAL_DB[materialId];
    if (!mat) return { error: 'Geçersiz malzeme' };

    this.path.push({
      nodeId: 'material_selection',
      optionId: materialId,
      label: mat.name,
    });

    return {
      complete: false,
      next: 'size_selection',
      selections: this.selections,
      material: mat,
    };
  }

  // Ebat seçimi
  getAvailableSizes(materialId) {
    const mat = MATERIAL_DB[materialId];
    if (!mat) return [];

    return SIZE_PRESETS.filter(s => {
      return s.w <= mat.maxSize.w && s.h <= mat.maxSize.h;
    });
  }

  selectSize(sizeId, customW, customH) {
    if (sizeId === 'custom') {
      this.selections.width = customW;
      this.selections.height = customH;
      this.selections.size = `custom_${customW}x${customH}`;
      this.path.push({
        nodeId: 'size_selection',
        optionId: 'custom',
        label: `${customW / 10}×${customH / 10} cm (Özel)`,
      });
    } else {
      const size = SIZE_PRESETS.find(s => s.id === sizeId);
      if (!size) return { error: 'Geçersiz ebat' };
      this.selections.width = size.w;
      this.selections.height = size.h;
      this.selections.size = sizeId;
      this.selections.area = size.area;
      this.path.push({
        nodeId: 'size_selection',
        optionId: sizeId,
        label: size.label,
      });
    }

    return {
      complete: false,
      next: 'finishing_selection',
      selections: this.selections,
    };
  }

  // Özel işlemler
  getAvailableFinishing() {
    const mat = this.selections.material ? MATERIAL_DB[this.selections.material] : null;
    if (!mat) return [];

    return FINISHING_OPTIONS.filter(f => {
      if (f.only && !f.only.includes(mat.family)) return false;
      if (f.needs && !mat[f.needs]) return false;
      if (f.needsTransparent && !mat.transparent) return false;
      if (f.maxThickness && mat.thickness > f.maxThickness) return false;
      if (f.exclude && mat.family === f.exclude) return false;
      return true;
    });
  }

  selectFinishing(finishingIds) {
    this.selections.finishing = finishingIds;
    this.path.push({
      nodeId: 'finishing_selection',
      optionId: finishingIds.join(','),
      label: finishingIds.length > 0 ? `${finishingIds.length} özel işlem` : 'Özel işlem yok',
    });
    return { complete: true, next: 'complete', selections: this.selections };
  }

  // Fiyat hesaplama
  calculatePrice() {
    const mat = this.selections.material ? MATERIAL_DB[this.selections.material] : null;
    if (!mat) return { total: 0, breakdown: [] };

    const area = (this.selections.width || 300) * (this.selections.height || 200) / 1_000_000;
    const qty = this.selections.quantity || 1;

    const breakdown = [];

    // Malzeme
    const materialCost = mat.priceM2 * area;
    breakdown.push({ label: `${mat.name} (${(area).toFixed(2)} m²)`, amount: materialCost });

    // Montaj ek ücreti
    const mountPrices = { wall_mounted: 0, hanging: 50, freestanding: 150, desktop: 0, pole_mounted: 500 };
    const mountCost = mountPrices[this.selections.mounting] || 0;
    if (mountCost > 0) {
      breakdown.push({ label: 'Montaj donanımı', amount: mountCost });
    }

    // Özel işlemler
    let finishingCost = 0;
    if (this.selections.finishing) {
      for (const fid of this.selections.finishing) {
        const fopt = FINISHING_OPTIONS.find(f => f.id === fid);
        if (fopt) {
          const fc = fopt.price || (materialCost * fopt.pricePct / 100);
          finishingCost += fc;
          breakdown.push({ label: fopt.label, amount: fc });
        }
      }
    }

    const subtotal = materialCost + mountCost + finishingCost;
    const totalBeforeQty = subtotal;

    // Adet indirimi
    let discount = 0;
    if (qty >= 100) discount = 0.25;
    else if (qty >= 50) discount = 0.20;
    else if (qty >= 25) discount = 0.15;
    else if (qty >= 10) discount = 0.10;
    else if (qty >= 5) discount = 0.05;

    const qtyTotal = totalBeforeQty * qty * (1 - discount);
    if (qty > 1) {
      breakdown.push({ label: `Adet (${qty}×)`, amount: totalBeforeQty * qty });
    }
    if (discount > 0) {
      breakdown.push({ label: `Adet indirimi (%${Math.round(discount * 100)})`, amount: -(totalBeforeQty * qty * discount) });
    }

    const tax = qtyTotal * 0.20;
    breakdown.push({ label: 'KDV (%20)', amount: tax });

    const total = qtyTotal + tax;

    return {
      total,
      subtotal: qtyTotal,
      tax,
      area,
      materialCost,
      mountCost,
      finishingCost,
      discount: totalBeforeQty * qty * discount,
      breakdown,
    };
  }

  // Teslim süresi
  calculateLeadTime() {
    const mat = this.selections.material ? MATERIAL_DB[this.selections.material] : null;
    if (!mat) return 0;

    const qty = this.selections.quantity || 1;
    let days = mat.leadTimeDays;

    // Özel işlem ek süresi
    if (this.selections.finishing && this.selections.finishing.length > 0) {
      days += 1;
    }
    if (this.selections.finishing?.includes('led_backlight')) {
      days += 2;
    }

    // Adet
    days += Math.ceil(qty / 20);

    // Direk montaj
    if (this.selections.mounting === 'pole_mounted') {
      days += 3;
    }

    return days;
  }

  // Geri git
  goBack() {
    if (this.path.length === 0) return null;

    const removed = this.path.pop();

    // State'ten o seviyede eklenenleri temizle
    if (removed.nodeId === 'material_selection') {
      delete this.selections.material;
    } else if (removed.nodeId === 'size_selection') {
      delete this.selections.size;
      delete this.selections.width;
      delete this.selections.height;
      delete this.selections.area;
    } else if (removed.nodeId === 'finishing_selection') {
      delete this.selections.finishing;
    } else {
      // Karar ağacı düğümü — o seviyedeki affect'leri temizle
      // Basit yaklaşım: o nodeId'ye kadar olan path'i yeniden uygula
      const savedPath = [...this.path];
      this.selections = {};
      this.path = [];
      for (const step of savedPath) {
        const node = this._findNodeForStep(step);
        if (node) {
          const option = node.options.find(o => o.id === step.optionId);
          if (option?.affects) Object.assign(this.selections, option.affects);
          this.path.push(step);
        }
      }
    }

    this._advanceToNextQuestion();
    return this.getState();
  }

  _findNodeForStep(step) {
    let node = this.tree;
    for (const p of this.path) {
      if (p === step) return node;
      const option = node.options.find(o => o.id === p.optionId);
      if (option?.children) node = option.children;
      else return null;
    }
    return node;
  }

  // Mevcut durumu döndür
  getState() {
    const material = this.selections.material ? MATERIAL_DB[this.selections.material] : null;
    const availableMaterials = this.currentNode ? null : this.getAvailableMaterials();
    const constraints = checkConstraints(this.selections);

    let phase = "question";
    if (this.currentNode) {
      phase = "question";
    } else if (!this.selections.material) {
      phase = "material";
    } else if (!this.selections.size) {
      phase = "size";
    } else if (this.selections.finishing === undefined) {
      phase = "finishing";
    } else {
      phase = "complete";
    }

    return {
      phase,
      currentNode: this.currentNode,
      path: this.path,
      selections: this.selections,
      material,
      availableMaterials: phase === 'material' ? this.getAvailableMaterials() : null,
      availableSizes: phase === 'size' && material ? this.getAvailableSizes(this.selections.material) : null,
      availableFinishing: phase === 'finishing' ? this.getAvailableFinishing() : null,
      price: this.selections.material ? this.calculatePrice() : null,
      leadTime: this.selections.material ? this.calculateLeadTime() : null,
      constraints,
    };
  }

  // Sıfırla
  reset() {
    this.path = [];
    this.selections = {};
    this.currentNode = this.tree;
  }
}
