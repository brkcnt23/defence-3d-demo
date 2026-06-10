// ============================================================
// eBaskicim v2 — Karar Ağacı + 3D Konfigüratör
// DecisionTreeEngine + Three.js + SVG Profil Frame
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { DecisionTreeEngine, MATERIAL_DB } from './decision-tree.js';
import { ContentEditor, FONTS, LAYOUTS, SHAPES, buildShapedProduct } from './content-editor.js';
import { SignLetters, LETTER_STYLES } from './sign-letters.js';

// ============================================================
// DOM REFS
// ============================================================
const loadingEl = document.getElementById('loading');
const questionText = document.getElementById('question-text');
const questionDesc = document.getElementById('question-desc');
const stepCounter = document.getElementById('step-counter');
const optionsArea = document.getElementById('options-area');
const navArea = document.getElementById('nav-area');
const btnBack = document.getElementById('btn-back');
const btnSkip = document.getElementById('btn-skip');
const breadcrumb = document.getElementById('breadcrumb');
const summaryList = document.getElementById('summary-list');
const priceBreakdown = document.getElementById('price-breakdown');
const priceValue = document.querySelector('.price-value');
const leadtimeDisplay = document.getElementById('leadtime-display');
const warningArea = document.getElementById('warning-area');
const phaseIndicator = document.getElementById('phase-indicator');
const completeOverlay = document.getElementById('complete-overlay');
const completeSummary = document.getElementById('complete-summary');

// ============================================================
// 3D SCENE
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a24);
scene.fog = new THREE.Fog(0x1a1a24, 4, 18);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 5.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('three-bg').appendChild(renderer.domElement);

// Texture loader
const texLoader = new THREE.TextureLoader();
const loadedTex = {};
function loadTex(path) {
  if (!loadedTex[path]) {
    const tex = texLoader.load('/textures/' + path);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    loadedTex[path] = tex;
  }
  return loadedTex[path];
}

// ============================================================
// LIGHTING — Studio product lighting
// ============================================================
const ambient = new THREE.AmbientLight(0x334466, 0.5);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffffff, 5);
keyLight.position.set(4, 3, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 20;
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xaaccff, 2);
fillLight.position.set(-3, 1, -2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 3);
rimLight.position.set(0, 2, -4);
scene.add(rimLight);

// Ground plane
const groundGeo = new THREE.PlaneGeometry(20, 20);
const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.9, metalness: 0.05 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

// ============================================================
// SVG PROFİL → EXTRUDEGEOMETRY FRAME SYSTEM
// ============================================================

/**
 * Frame profilleri SVG path'lerden oluşturulur.
 * Her profil bir 2D Shape, ExtrudeGeometry ile 3D profil çubuğu.
 * 4 kenar → 45° mitre cut birleşim.
 */
const FRAME_PROFILES = {
  thin_modern: {
    name: 'İnce Modern',
    // SVG path benzeri nokta dizisi: [x, y] çiftleri, normalize
    profile: [
      [0, 0], [0.06, 0], [0.06, 0.02], [0.04, 0.04],
      [0.04, 0.12], [0.06, 0.14], [0.06, 0.16], [0, 0.16],
    ],
    color: '#1a1a1a',
    roughness: 0.25,
    metalness: 0.3,
  },
  thick_classic: {
    name: 'Kalın Klasik',
    profile: [
      [0, 0], [0.08, 0], [0.08, 0.01], [0.06, 0.03],
      [0.06, 0.08], [0.07, 0.095], [0.08, 0.10], [0.08, 0.14],
      [0.06, 0.16], [0.02, 0.16], [0, 0.14],
    ],
    color: '#2a1a0a',
    roughness: 0.3,
    metalness: 0.2,
  },
  gold_leaf: {
    name: 'Altın Varak',
    profile: [
      [0, 0], [0.05, 0], [0.05, 0.015], [0.035, 0.035],
      [0.035, 0.10], [0.05, 0.12], [0.05, 0.135], [0, 0.135],
    ],
    color: '#c4a96a',
    roughness: 0.15,
    metalness: 0.8,
  },
  silver: {
    name: 'Gümüş',
    profile: [
      [0, 0], [0.05, 0], [0.05, 0.015], [0.035, 0.035],
      [0.035, 0.10], [0.05, 0.12], [0.05, 0.135], [0, 0.135],
    ],
    color: '#c0c4c8',
    roughness: 0.2,
    metalness: 0.75,
  },
  matte_black: {
    name: 'Siyah Mat',
    profile: [
      [0, 0], [0.07, 0], [0.07, 0.015], [0.05, 0.03],
      [0.05, 0.11], [0.07, 0.14], [0.07, 0.155], [0, 0.155],
    ],
    color: '#111111',
    roughness: 0.45,
    metalness: 0.1,
  },
};

// Profil noktalarından ExtrudeGeometry oluştur
function createFrameProfileGeometry(profilePoints, length) {
  const shape = new THREE.Shape();
  // Noktaları [x, y] formatından THREE.Vector2'ye çevir
  // Profil kalınlığını metreden normalize et (faktör: 0.15)
  const scale = 0.15;
  shape.moveTo(profilePoints[0][0] * scale, profilePoints[0][1] * scale);
  for (let i = 1; i < profilePoints.length; i++) {
    shape.lineTo(profilePoints[i][0] * scale, profilePoints[i][1] * scale);
  }
  shape.closePath();

  const extrudeSettings = { steps: 1, depth: length, bevelEnabled: false };
  return new THREE.ExtrudeGeometry(shape, extrudeSettings);
}

// 4 kenarlı çerçeve oluştur (mitre cut 45° simülasyonu)
function buildFrameMesh(productW, productH, productD, profileId) {
  const profile = FRAME_PROFILES[profileId];
  if (!profile) return new THREE.Group();

  const group = new THREE.Group();
  const profileWidth = 0.025; // profil genişliği (metre)
  const pw = profileWidth;

  const frameMat = new THREE.MeshStandardMaterial({
    color: profile.color,
    roughness: profile.roughness,
    metalness: profile.metalness,
  });

  // Üst + Alt (yatay, aynı profil)
  const hLen = productW + pw * 2;
  const topGeo = createFrameProfileGeometry(profile.profile, hLen);
  const topMesh = new THREE.Mesh(topGeo, frameMat);
  topMesh.rotation.x = -Math.PI / 2;
  topMesh.rotation.z = Math.PI;
  topMesh.position.set(-hLen / 2, productH / 2 + pw * 0.3, productD / 2 + 0.01);
  topMesh.castShadow = true;
  group.add(topMesh);

  const bottomMesh = new THREE.Mesh(topGeo.clone(), frameMat);
  bottomMesh.rotation.x = -Math.PI / 2;
  bottomMesh.rotation.z = Math.PI;
  bottomMesh.position.set(-hLen / 2, -productH / 2 - pw * 1.2, productD / 2 + 0.01);
  bottomMesh.castShadow = true;
  group.add(bottomMesh);

  // Sol + Sağ (dikey)
  const vLen = productH;
  const sideGeo = createFrameProfileGeometry(profile.profile, vLen);
  const leftMesh = new THREE.Mesh(sideGeo, frameMat);
  leftMesh.rotation.x = -Math.PI / 2;
  leftMesh.rotation.z = Math.PI / 2;
  leftMesh.position.set(-productW / 2 - pw * 0.7, -vLen / 2, productD / 2 + 0.01);
  leftMesh.castShadow = true;
  group.add(leftMesh);

  const rightMesh = new THREE.Mesh(sideGeo.clone(), frameMat);
  rightMesh.rotation.x = -Math.PI / 2;
  rightMesh.rotation.z = Math.PI / 2;
  rightMesh.position.set(productW / 2 + pw * 0.15, -vLen / 2, productD / 2 + 0.01);
  rightMesh.castShadow = true;
  group.add(rightMesh);

  // Köşe vurguları (mitre cut yerine) — aynı profilden 45° kesilmiş küçük parçalar
  const cornerGeo = new THREE.BoxGeometry(pw * 0.6, pw * 0.6, productD + pw * 0.4);
  const cornerMat = new THREE.MeshStandardMaterial({
    color: profile.color,
    roughness: profile.roughness * 0.7,
    metalness: profile.metalness * 1.2,
  });
  [
    [1, 1], [1, -1], [-1, 1], [-1, -1],
  ].forEach(([cx, cy]) => {
    const corner = new THREE.Mesh(cornerGeo, cornerMat);
    corner.position.set(
      cx * (productW / 2 + pw * 0.1),
      cy * (productH / 2 + pw * 0.1),
      productD / 2 + 0.01,
    );
    corner.castShadow = true;
    group.add(corner);
  });

  return group;
}

// ============================================================
// PRODUCT MESH BUILDER
// ============================================================
let productGroup = null;

function buildProduct(selections) {
  if (productGroup) {
    productGroup.traverse(c => {
      if (c.geometry && c !== productGroup) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(m => { if (m.map && !m.map.isRenderTargetTexture) m.map.dispose(); m.dispose(); });
        else { if (c.material.map && !c.material.map.isRenderTargetTexture) c.material.map.dispose(); c.material.dispose(); }
      }
    });
    scene.remove(productGroup);
  }

  productGroup = new THREE.Group();

  const mat = selections.material ? MATERIAL_DB[selections.material] : null;
  const w = (selections.width || 300) / 1000;
  const h = (selections.height || 200) / 1000;
  const thickness = mat ? mat.thickness / 1000 : 0.005;
  const shapeId = selections.shape || 'rectangle_landscape';
  const shape = SHAPES[shapeId] || SHAPES.rectangle_landscape;
  const isSignage = selections.product_type === 'signage';

  // --- Signage modu: Backboard + 3D harfler ---
  if (isSignage && signLetters._ready) {
    // Backboard (kompozit/dekota panel)
    const boardGeo = new THREE.BoxGeometry(w, h, thickness);
    const boardTex = mat?.texture ? loadTex(mat.texture) : null;
    const boardMat = new THREE.MeshStandardMaterial({
      color: mat?.color || '#f5f0e8',
      roughness: mat?.roughness || 0.5,
      metalness: mat?.metalness || 0.02,
      map: boardTex,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.z = -thickness / 2 - 0.01;
    board.castShadow = true;
    board.receiveShadow = true;
    productGroup.add(board);

    // 3D harf grubu — backboard'un önünde
    signLetters.group.position.set(0, 0, thickness / 2 + 0.005);
    signLetters.group.visible = true;

    // Harf yüksekliğini panele oranla
    const letterH = Math.min(h * 0.55, 0.3);
    signLetters.setLetterHeight(letterH * 1000);

    productGroup.add(signLetters.group);

    // Çerçeve
    if (shape.type === 'rect' || shape.type === 'rounded_rect') {
      const frameGroup = buildFrameMesh(w, h, thickness, selectedFrameProfile || 'thin_modern');
      productGroup.add(frameGroup);
    }
  } else {
    // --- Diğer ürünler: Canvas texture ---
    if (isSignage) {
      // Signage ama font henüz yüklenmedi → fallback: canvas texture
      signLetters.group.visible = false;
    }

    const contentTex = editor.getTexture();
    const { group: shapedGroup } = buildShapedProduct(shapeId, w, h, thickness, mat, contentTex);
    productGroup.add(shapedGroup);

    const hasFrame = (shape.type === 'rect' || shape.type === 'rounded_rect') &&
                     (selections.product_type === 'print_product' ||
                      (selections.product_type === 'plaque' && selections.mounting === 'wall_mounted'));

    if (hasFrame) {
      const frameGroup = buildFrameMesh(w, h, thickness, selectedFrameProfile || 'thin_modern');
      productGroup.add(frameGroup);
    }
  }

  // --- Ayak/stand ---
  if (selections.mounting === 'freestanding' || selections.mounting === 'desktop') {
    const standMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.7 });
    const standGeo = new THREE.CylinderGeometry(0.008, 0.012, 0.2, 12);
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = -h / 2 - 0.1;
    stand.castShadow = true;
    productGroup.add(stand);

    const baseGeo = new THREE.CylinderGeometry(0.04, 0.045, 0.015, 24);
    const base = new THREE.Mesh(baseGeo, standMat);
    base.position.y = -h / 2 - 0.2;
    base.castShadow = true;
    productGroup.add(base);
  }

  productGroup.position.set(0, 0, -0.3);
  productGroup.castShadow = true;
  productGroup.receiveShadow = true;
  scene.add(productGroup);

  const maxDim = Math.max(w, h);
  const camDist = maxDim * 4.5 + 1.5;
  gsap.to(camera.position, { x: 0, y: h * 0.3, z: camDist, duration: 0.6, ease: 'power2.out' });
}

// ============================================================
// DECISION TREE ENGINE
// ============================================================
const engine = new DecisionTreeEngine();
const editor = new ContentEditor();
const signLetters = new SignLetters(scene);

// Font init (async)
(async () => {
  try {
    await signLetters.init();
    signLetters.addToScene(new THREE.Vector3(0, 0, -0.3));
    console.log('🔤 3D Sign Letters: font yüklendi');
  } catch (e) {
    console.warn('Font yüklenemedi, harf sistemi devre dışı:', e.message);
  }
})();

// Frame seçim state'i (karar ağacı dışında)
let selectedFrameProfile = 'thin_modern';
let selectedFinishing = [];
let contentDone = false;

function escHtml(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

// ============================================================
// UI RENDER
// ============================================================
function renderUI() {
  const state = engine.getState();
  updateBreadcrumb(state);
  updateSummary(state);
  updatePrice(state);
  updateWarnings(state);

  switch (state.phase) {
    case 'question':
      renderQuestion(state);
      break;
    case 'material':
      renderMaterialSelection(state);
      break;
    case 'size':
      renderSizeSelection(state);
      break;
    case 'finishing':
      // İçerik fazı henüz yapılmadıysa önce onu göster
      if (!contentDone && state.selections.size) {
        renderContentEditing(state);
      } else {
        renderFinishingSelection(state);
      }
      break;
    case 'complete':
      renderComplete(state);
      break;
  }

  // 3D güncelle
  if (state.selections.material || state.selections.product_type) {
    buildProduct({ ...state.selections, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
  }
}

// --- Soru görünümü ---
function renderQuestion(state) {
  const node = state.currentNode;
  if (!node) return;

  questionText.textContent = node.question;
  questionDesc.textContent = node.description || '';
  stepCounter.textContent = `Adım ${state.path.length + 1}`;
  phaseIndicator.textContent = 'Ürün Seçimi';

  optionsArea.className = '';
  optionsArea.innerHTML = node.options.map(opt => `
    <div class="option-card" data-id="${opt.id}">
      <div class="option-icon">${opt.icon || '📋'}</div>
      <div class="option-info">
        <div class="option-name">${opt.label}</div>
        ${opt.description ? `<div class="option-detail">${opt.description}</div>` : ''}
      </div>
    </div>
  `).join('');

  // Click handlers
  optionsArea.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const result = engine.select(card.dataset.id);
      if (result.error) return;
      renderUI();
    });
  });

  btnBack.style.display = state.path.length > 0 ? 'flex' : 'none';
  btnSkip.style.display = 'none';
  completeOverlay.style.display = 'none';
}

// --- Malzeme seçimi ---
function renderMaterialSelection(state) {
  const materials = state.availableMaterials || [];
  questionText.textContent = 'Hangi malzemeden üretilsin?';
  questionDesc.textContent = `${state.selections.location === 'outdoor' ? '🌤️ Dış mekan' : '🏠 İç mekan'} için uygun malzemeler listeleniyor.`;
  stepCounter.textContent = `Adım ${state.path.length + 1}`;
  phaseIndicator.textContent = 'Malzeme Seçimi';

  optionsArea.className = 'material-grid';
  optionsArea.innerHTML = materials.map(m => {
    const warnings = [];
    if (state.selections.location === 'outdoor' && m.family === 'pvc_foam' && m.thickness < 10) {
      warnings.push('Dış mekan riski');
    }
    return `
    <div class="material-card ${state.selections.material === m.id ? 'selected' : ''}" data-id="${m.id}">
      <div class="material-name">${m.name}</div>
      <div class="material-detail">${m.thickness}mm · ${m.weightKgm2} kg/m² · ${m.leadTimeDays} gün</div>
      <div class="material-price">₺${m.priceM2}/m²</div>
      ${warnings.map(w => `<div class="material-warn">⚠️ ${w}</div>`).join('')}
    </div>
  `}).join('');

  optionsArea.querySelectorAll('.material-card').forEach(card => {
    card.addEventListener('click', () => {
      engine.selectMaterial(card.dataset.id);
      renderUI();
    });
  });

  btnBack.style.display = 'flex';
  btnSkip.style.display = 'none';
  completeOverlay.style.display = 'none';
}

// --- Ebat seçimi ---
function renderSizeSelection(state) {
  const sizes = state.availableSizes || [];
  questionText.textContent = 'Hangi ebatta olsun?';
  questionDesc.textContent = state.material
    ? `${state.material.name} · maks. ${state.material.maxSize.w / 10}×${state.material.maxSize.h / 10} cm`
    : '';
  stepCounter.textContent = `Adım ${state.path.length + 1}`;
  phaseIndicator.textContent = 'Ebat Seçimi';

  optionsArea.className = 'size-grid';
  optionsArea.innerHTML = sizes.map(s => {
    const mat = state.material;
    const price = mat ? Math.round(mat.priceM2 * s.area) : 0;
    return `
    <div class="size-card ${state.selections.size === s.id ? 'selected' : ''}" data-id="${s.id}">
      <div class="size-name">${s.label}</div>
      <div class="size-dims">${s.w / 10}×${s.h / 10} cm</div>
      <div class="size-price">~₺${price}</div>
    </div>
  `}).join('');

  optionsArea.querySelectorAll('.size-card').forEach(card => {
    card.addEventListener('click', () => {
      engine.selectSize(card.dataset.id);
      renderUI();
    });
  });

  btnBack.style.display = 'flex';
  btnSkip.style.display = 'none';
  completeOverlay.style.display = 'none';
}

// --- İçerik düzenleme ---
function renderContentEditing(state) {
  questionText.textContent = 'Tasarımınızı özelleştirin';
  questionDesc.textContent = 'Metin, logo veya görsel ekleyin. Değişiklikler anında 3D önizlemede görünür.';
  stepCounter.textContent = 'Adım 5/7';
  phaseIndicator.textContent = 'İçerik Tasarımı';

  const w = state.selections.width || 300;
  const h = state.selections.height || 200;
  const isSignage = state.selections.product_type === 'signage';
  editor.setProductSize(w, h);

  const font = FONTS.find(f => f.id === editor.state.font);

  optionsArea.className = '';
  optionsArea.innerHTML = `
    <!-- Metin Girişleri -->
    <div class="content-section">
      <div class="content-label">📝 Metin</div>
      <input type="text" class="content-input title-input" id="input-line1"
             placeholder="Ana başlık..." value="${escHtml(editor.state.line1)}"
             style="font-family:${font?.family || 'Inter'}">
      <input type="text" class="content-input subtitle-input" id="input-line2"
             placeholder="Alt başlık..." value="${escHtml(editor.state.line2)}">
      <input type="text" class="content-input detail-input" id="input-line3"
             placeholder="Detay metin..." value="${escHtml(editor.state.line3)}">
    </div>

    <!-- Font Seçici -->
    <div class="content-section">
      <div class="content-label">🔤 Font</div>
      <div class="font-row" id="font-selector">
        ${FONTS.map(f => `
          <button class="font-btn ${f.id === editor.state.font ? 'active' : ''}" data-font="${f.id}"
                  style="font-family:${f.family}">${f.name}</button>
        `).join('')}
      </div>
    </div>

    ${isSignage ? `
    <!-- Harf Stili (sadece tabela) -->
    <div class="content-section">
      <div class="content-label">✨ Harf Stili</div>
      <div class="letter-style-row" id="letter-style-selector">
        ${Object.entries(LETTER_STYLES).map(([id, s]) => `
          <button class="letter-style-btn ${id === signLetters.style ? 'active' : ''}" data-style="${id}"
                  style="background:${s.color};${s.color === '#fafafa' || s.color === '#c8ccd0' ? 'border:2px solid #555;' : ''}${s.color === '#1a1a1a' ? 'border:2px solid #888;' : ''}"
                  title="${s.name}"></button>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Şekil Seçici -->
    <div class="content-section">
      <div class="content-label">📐 Şekil</div>
      <div class="shape-row" id="shape-selector">
        ${Object.entries(SHAPES).map(([id, s]) => `
          <button class="shape-btn ${id === editor.state.shape ? 'active' : ''}" data-shape="${id}">
            <span class="shape-icon">${id === 'circle' ? '⭕' : id === 'oval' ? '🥚' : id === 'rounded_rect' ? '🔲' : id === 'square' ? '⬜' : id === 'rectangle_portrait' ? '📋' : '📄'}</span>
            <span class="shape-name">${s.name}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Yerleşim Şablonu -->
    <div class="content-section">
      <div class="content-label">📐 Yerleşim</div>
      <div class="layout-row" id="layout-selector">
        ${Object.entries(LAYOUTS).map(([id, l]) => `
          <button class="layout-btn ${id === editor.state.layout ? 'active' : ''}" data-layout="${id}">
            ${l.name}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Görsel Yükleme -->
    <div class="content-section">
      <div class="content-label">🖼️ Logo / Görsel</div>
      <div class="upload-area" id="upload-area">
        ${editor.state.uploadedImage
          ? `<div class="upload-preview">
               <img src="${editor.state.uploadedImageURL}" alt="Yüklenen görsel">
               <button class="upload-remove" id="btn-remove-img">✕ Kaldır</button>
             </div>`
          : `<div class="upload-placeholder">
               <span class="upload-icon">📁</span>
               <span>Sürükle-bırak veya tıkla<br><small>PNG, JPG, SVG (max 10MB)</small></span>
             </div>`
        }
        <input type="file" id="file-input" accept="image/png,image/jpeg,image/svg+xml" style="display:none">
      </div>
    </div>

    <!-- Devam Butonu -->
    <div id="complete-actions-row">
      <button class="btn-complete primary" id="btn-content-done">
        İçeriği Onayla, Son Kata Geç →
      </button>
    </div>
  `;

  // --- Event binding ---
  // Text inputs
  ['input-line1', 'input-line2', 'input-line3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const vals = [editor.state.line1, editor.state.line2, editor.state.line3];
      vals[i] = el.value;
      editor.setText(vals[0], vals[1], vals[2]);

      // Tabela modunda: 3D harfleri güncelle
      const isSignage = state.selections.product_type === 'signage';
      if (isSignage && signLetters._ready) {
        // Ana başlık = store sign text
        if (i === 0) {
          signLetters.updateText(vals[0]);
        }
      }

      buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
    });
  });

  // Font buttons
  document.getElementById('font-selector')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.font-btn');
    if (!btn) return;
    editor.setFont(btn.dataset.font);
    document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
    // Re-render to update font preview in text inputs
    renderContentEditing(engine.getState());
  });

  // Letter style buttons (signage only)
  document.getElementById('letter-style-selector')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.letter-style-btn');
    if (!btn) return;
    signLetters.setStyle(btn.dataset.style);
    document.querySelectorAll('.letter-style-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });

  // Shape buttons
  document.getElementById('shape-selector')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.shape-btn');
    if (!btn) return;
    editor.setShape(btn.dataset.shape);
    document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
  });

  // Layout buttons
  document.getElementById('layout-selector')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.layout-btn');
    if (!btn) return;
    editor.setLayout(btn.dataset.layout);
    document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
  });

  // Upload area
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  uploadArea?.addEventListener('click', () => fileInput?.click());
  uploadArea?.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
  uploadArea?.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea?.addEventListener('drop', async (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.size < 10 * 1024 * 1024) {
      await editor.loadImage(file);
      buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
      renderContentEditing(engine.getState());
    }
  });
  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (file) {
      await editor.loadImage(file);
      buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
      renderContentEditing(engine.getState());
    }
  });

  // Remove image
  document.getElementById('btn-remove-img')?.addEventListener('click', (e) => {
    e.stopPropagation();
    editor.removeImage();
    buildProduct({ ...state.selections, shape: editor.state.shape, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
    renderContentEditing(engine.getState());
  });

  // Done button
  document.getElementById('btn-content-done')?.addEventListener('click', () => {
    contentDone = true;
    renderFinishingSelection(engine.getState());
  });

  btnBack.style.display = 'flex';
  btnSkip.style.display = 'flex';
  btnSkip.textContent = 'Boş Geç →';
  btnSkip.onclick = () => {
    contentDone = true;
    renderFinishingSelection(engine.getState());
  };
  completeOverlay.style.display = 'none';
}

// --- Özel işlem seçimi ---
function renderFinishingSelection(state) {
  const finishings = state.availableFinishing || [];
  questionText.textContent = 'Özel işlem veya son kat ister misiniz?';
  questionDesc.textContent = 'Birden fazla seçebilirsiniz. Seçimleriniz fiyata yansıyacaktır.';
  stepCounter.textContent = `Adım ${state.path.length + 1}`;
  phaseIndicator.textContent = 'Özel İşlemler';

  optionsArea.className = 'finishing-grid';
  optionsArea.innerHTML = finishings.map(f => {
    const isSelected = selectedFinishing.includes(f.id);
    const price = f.price || `%${f.pricePct}`;
    return `
    <div class="finishing-card ${isSelected ? 'selected' : ''}" data-id="${f.id}">
      <div class="finishing-icon">${f.icon}</div>
      <div class="finishing-info">
        <div class="finishing-name">${f.label}</div>
        <div class="finishing-price">+${typeof f.price === 'number' ? '₺' + f.price : '%' + f.pricePct}</div>
      </div>
    </div>
  `}).join('');

  optionsArea.querySelectorAll('.finishing-card').forEach(card => {
    card.addEventListener('click', () => {
      const fid = card.dataset.id;
      if (selectedFinishing.includes(fid)) {
        selectedFinishing = selectedFinishing.filter(f => f !== fid);
      } else {
        selectedFinishing.push(fid);
      }
      card.classList.toggle('selected');
      // Fiyat ve 3D yi güncelle
      engine.selectFinishing(selectedFinishing);
      const st = engine.getState();
      updatePrice(st);
      buildProduct({ ...st.selections, frame_profile: selectedFrameProfile, finishing: selectedFinishing });
    });
  });

  // Tamamla butonu
  const completeRow = document.createElement('div');
  completeRow.id = 'complete-actions-row';
  completeRow.innerHTML = `
    <button class="btn-complete primary" id="btn-finish">Tasarımı Tamamla →</button>
  `;
  optionsArea.appendChild(completeRow);

  document.getElementById('btn-finish').addEventListener('click', () => {
    engine.selectFinishing(selectedFinishing);
    renderComplete(engine.getState());
  });

  btnBack.style.display = 'flex';
  btnSkip.style.display = 'flex';
  btnSkip.textContent = 'Boş Geç →';
  btnSkip.onclick = () => {
    selectedFinishing = [];
    engine.selectFinishing([]);
    renderComplete(engine.getState());
  };
  completeOverlay.style.display = 'none';
}

// --- Tamamlandı ---
function renderComplete(state) {
  questionText.textContent = '';
  questionDesc.textContent = '';
  stepCounter.textContent = '✅';
  phaseIndicator.textContent = 'Tamamlandı';

  optionsArea.innerHTML = '';
  btnBack.style.display = 'none';
  btnSkip.style.display = 'none';

  completeOverlay.style.display = 'flex';

  const summaryParts = [];
  if (state.selections.product_type) {
    const typeNames = { signage: 'Yönlendirme & Tabela', plaque: 'Plaket & Ödül', nameplate: 'İsimlik & Rozet', print_product: 'Baskı Ürünleri', display: 'Teşhir & Stand' };
    summaryParts.push(typeNames[state.selections.product_type] || state.selections.product_type);
  }
  if (state.material) summaryParts.push(state.material.name);
  if (state.selections.width) summaryParts.push(`${state.selections.width / 10}×${state.selections.height / 10} cm`);
  completeSummary.textContent = summaryParts.join(' · ');

  updatePrice(state);
  updateWarnings(state);
}

// --- Breadcrumb ---
function updateBreadcrumb(state) {
  const phaseNames = {
    product_family: 'Ürün Ailesi',
    signage_location: 'Konum',
    plaque_location: 'Konum',
    nameplate_mount: 'Montaj',
    print_mount: 'Montaj',
    display_mount: 'Montaj',
    material_selection: 'Malzeme',
    size_selection: 'Ebat',
    finishing_selection: 'Özel İşlem',
  };

  let html = '';
  state.path.forEach((step, i) => {
    if (i > 0) html += '<span class="breadcrumb-sep">→</span>';
    const isLast = i === state.path.length - 1;
    html += `<span class="breadcrumb-step ${isLast ? 'current' : 'done'}">${step.label}</span>`;
  });
  breadcrumb.innerHTML = html;
}

// --- Özet ---
function updateSummary(state) {
  const items = [];
  if (state.selections.product_type) {
    const names = { signage: '🪧 Yönlendirme & Tabela', plaque: '🏆 Plaket', nameplate: '📛 İsimlik', print_product: '🎨 Baskı', display: '📐 Teşhir' };
    items.push({ label: 'Ürün', value: names[state.selections.product_type] || state.selections.product_type, set: true });
  }
  if (state.selections.location) {
    const locNames = { indoor: 'İç Mekan', outdoor: 'Dış Mekan', semi_outdoor: 'Yarı Açık' };
    items.push({ label: 'Konum', value: locNames[state.selections.location], set: true });
  }
  if (state.selections.mounting) {
    const mountNames = { wall_mounted: 'Duvar', hanging: 'Askılı', freestanding: 'Ayaklı', desktop: 'Masaüstü', pole_mounted: 'Direk' };
    items.push({ label: 'Montaj', value: mountNames[state.selections.mounting], set: true });
  }
  if (state.material) {
    items.push({ label: 'Malzeme', value: state.material.name, set: true });
  }
  if (state.selections.width) {
    items.push({ label: 'Ebat', value: `${state.selections.width / 10}×${state.selections.height / 10} cm`, set: true });
  }
  if (selectedFinishing.length > 0) {
    items.push({ label: 'Özel İşlem', value: `${selectedFinishing.length} adet`, set: true });
  }

  // Henüz seçilmemiş adımlar
  const allSteps = ['Ürün', 'Konum', 'Montaj', 'Malzeme', 'Ebat', 'Özel İşlem'];
  const setCount = items.length;

  summaryList.innerHTML = items.map(i => `
    <div class="summary-item set">
      <div class="s-dot"></div>
      <span class="s-label">${i.label}:</span>
      <span class="s-value">${i.value}</span>
    </div>
  `).join('');
}

// --- Fiyat ---
function updatePrice(state) {
  if (state.price && state.price.total > 0) {
    priceValue.textContent = '₺' + Math.round(state.price.total).toLocaleString('tr-TR');
    leadtimeDisplay.textContent = `Teslim: ~${state.leadTime || 0} iş günü`;

    priceBreakdown.innerHTML = state.price.breakdown.map(b => `
      <div class="pb-row ${b.label === 'KDV (%20)' ? 'total' : ''}">
        <span class="pb-label">${b.label}</span>
        <span class="pb-amount">${b.amount < 0 ? '-' : ''}₺${Math.abs(Math.round(b.amount)).toLocaleString('tr-TR')}</span>
      </div>
    `).join('');
  } else {
    priceValue.textContent = '₺0';
    leadtimeDisplay.textContent = '';
    priceBreakdown.innerHTML = '<div class="pb-row"><span class="pb-label">Seçimleri tamamlayın</span></div>';
  }
}

// --- Uyarılar ---
function updateWarnings(state) {
  const constraints = state.constraints || { errors: [], warnings: [] };
  const all = [
    ...constraints.errors.map(e => ({ ...e, type: 'error' })),
    ...constraints.warnings.map(w => ({ ...w, type: 'warning' })),
  ];
  warningArea.innerHTML = all.map(w => `
    <div class="warning-toast ${w.type}">${w.message}${w.suggestion ? '<br><strong>Öneri:</strong> ' + w.suggestion : ''}</div>
  `).join('');
}

// ============================================================
// GERİ GİT
// ============================================================
btnBack.addEventListener('click', () => {
  const state = engine.getState();
  if (!contentDone && state.selections.size) {
    // İçerik fazındayız → size'a geri dön
    contentDone = false;
    delete engine.selections.finishing;
    engine.path = engine.path.filter(p => p.nodeId !== 'finishing_selection');
    engine.path = engine.path.filter(p => p.nodeId !== 'size_selection');
    delete engine.selections.size;
    delete engine.selections.width;
    delete engine.selections.height;
    engine._advanceToNextQuestion();
  } else if (state.phase === 'finishing') {
    // finishing ekranından content'e geri dön
    contentDone = false;
    delete engine.selections.finishing;
    engine.path = engine.path.filter(p => p.nodeId !== 'finishing_selection');
  } else {
    engine.goBack();
  }
  selectedFinishing = [];
  renderUI();
});

// ============================================================
// TEKLİF AL / BAŞTAN BAŞLA
// ============================================================
document.getElementById('btn-get-offer').addEventListener('click', () => {
  const state = engine.getState();
  const msg = [
    '🛒 eBaskicim — Tasarım Özeti',
    '',
    ...state.path.map(p => `• ${p.label}`),
    '',
    `💰 Toplam: ${priceValue.textContent}`,
    `📅 Teslim: ~${state.leadTime || 0} iş günü`,
    '',
    'Size özel teklif için ekibimiz iletişime geçecek.',
  ].join('\n');
  alert(msg);
});

document.getElementById('btn-start-over').addEventListener('click', () => {
  engine.reset();
  editor.setText('', '', '');
  editor.removeImage();
  signLetters.clear();
  selectedFinishing = [];
  selectedFrameProfile = 'thin_modern';
  contentDone = false;
  completeOverlay.style.display = 'none';
  renderUI();
});

// ============================================================
// CAMERA CONTROLS
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -0.3);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.5;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI * 0.65;
controls.minPolarAngle = 0.2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.update();

// ============================================================
// RENDER LOOP
// ============================================================
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// INIT
// ============================================================
setTimeout(() => loadingEl.classList.add('hidden'), 600);
renderUI();
animate();

console.log('🪧 eBaskicim v2 — Karar Ağacı Konfigüratörü hazır.');
console.log('   Motor: DecisionTreeEngine | Frame: SVG Profile → ExtrudeGeometry');
