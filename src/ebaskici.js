// ============================================================
// eBaskicim — 3D Baskı Konfigüratörü
// Three.js | Ürün: Tabela • Menü • Afiş | Poly Haven PBR Textures
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

// ============================================================
// DOM REFS
// ============================================================
const loadingEl = document.getElementById('loading');
const priceEl = document.getElementById('price-display');
const prodCards = document.querySelectorAll('.prod-card');
const materialSwatches = document.getElementById('material-swatches');
const frameSwatches = document.getElementById('frame-swatches');
const designSwatches = document.getElementById('design-swatches');
const colorSwatches = document.getElementById('color-swatches');
const sizeSwatches = document.getElementById('size-swatches');
const tooltip = document.getElementById('tooltip');

// ============================================================
// SCENE SETUP
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1410);
scene.fog = new THREE.Fog(0x1a1410, 4, 16);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 7.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

// Texture loader
const texLoader = new THREE.TextureLoader();
const loadedTextures = {};
function loadTex(path) {
  if (!loadedTextures[path]) {
    const tex = texLoader.load(path);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    loadedTextures[path] = tex;
  }
  return loadedTextures[path];
}

// ============================================================
// LIGHTING (studio/product photography)
// ============================================================
// Warm luxury hotel lighting
const ambient = new THREE.AmbientLight(0x3a2820, 0.35);
scene.add(ambient);

// Main spot on product
const keyLight = new THREE.SpotLight(0xffeedd, 12, 10, Math.PI / 7, 0.3, 0.5);
keyLight.position.set(0, 4, 5);
keyLight.target.position.set(0, 1.5, -2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.3;
keyLight.shadow.camera.far = 20;
keyLight.shadow.bias = -0.0002;
scene.add(keyLight);
scene.add(keyLight.target);

// Warm wall grazing light (left)
const wallLight1 = new THREE.PointLight(0xffcc88, 8, 5);
wallLight1.position.set(-3, 3, 1);
scene.add(wallLight1);

// Warm wall grazing light (right)
const wallLight2 = new THREE.PointLight(0xffcc88, 8, 5);
wallLight2.position.set(3, 3, 1);
scene.add(wallLight2);

// Subtle ceiling fill
const ceilingLight = new THREE.PointLight(0xffddaa, 4, 6);
ceilingLight.position.set(0, 3.8, 0);
scene.add(ceilingLight);

// ============================================================
// ============================================================
// ENVIRONMENT — Lüks otel sergi odası (tablo.jpeg referans)
// ============================================================

const darkWoodTex = loadTex('/textures/dark_wood.jpg');
darkWoodTex.wrapS = THREE.RepeatWrapping; darkWoodTex.wrapT = THREE.RepeatWrapping;
const panelTex = loadTex('/textures/wooden_panels.jpg');
panelTex.wrapS = THREE.RepeatWrapping; panelTex.wrapT = THREE.RepeatWrapping;
const floorTex2 = loadTex('/textures/wood_floor.jpg');
floorTex2.wrapS = THREE.RepeatWrapping; floorTex2.wrapT = THREE.RepeatWrapping;

// --- Oda mimarisi ---
const roomMat = new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.65, metalness: 0.02 });

function makeWall(w, h, x, y, z, ry) {
  const g = new THREE.BoxGeometry(w, h, 0.25);
  const m = new THREE.Mesh(g, roomMat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.receiveShadow = true; m.castShadow = true;
  return m;
}

panelTex.repeat.set(3, 2);
scene.add(makeWall(7, 4.5, 0, 0, -3.5, 0));        // Arka
panelTex.repeat.set(2, 2);
scene.add(makeWall(5.5, 4.5, -3.5, 0, -0.75, Math.PI/2));   // Sol
scene.add(makeWall(5.5, 4.5, 3.5, 0, -0.75, -Math.PI/2));   // Sağ

// Tavan
const ceilingGeo = new THREE.PlaneGeometry(7, 5.5);
const ceilingTex = loadTex('/textures/plywood.jpg');
ceilingTex.repeat.set(4, 3);
const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshStandardMaterial({ map: ceilingTex, roughness: 0.7, metalness: 0 }));
ceiling.rotation.x = -Math.PI / 2; ceiling.position.set(0, 2.25, -0.75);
scene.add(ceiling);

// Zemin
floorTex2.repeat.set(6, 4);
const floorRoom = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.5), new THREE.MeshStandardMaterial({ map: floorTex2, roughness: 0.4, metalness: 0.02 }));
floorRoom.rotation.x = -Math.PI / 2; floorRoom.position.set(0, -2.25, -0.75);
floorRoom.receiveShadow = true; scene.add(floorRoom);

// Süpürgelik
function baseboard(x1, z1, x2, z2) {
  const dx = x2 - x1, dz = z2 - z1;
  const len = Math.sqrt(dx*dx+dz*dz);
  const g = new THREE.BoxGeometry(len, 0.15, 0.06);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x1a1008, roughness: 0.3, metalness: 0.1 }));
  m.position.set((x1+x2)/2, -2.17, (z1+z2)/2);
  m.rotation.y = Math.atan2(dx, dz);
  m.receiveShadow = true; return m;
}
scene.add(baseboard(-3.5,-3.5,3.5,-3.5));
scene.add(baseboard(-3.5,-3.5,-3.5,2.0));
scene.add(baseboard(3.5,-3.5,3.5,2.0));

// Taç silme (altın)
function crown(x1,z1,x2,z2) {
  const dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
  const g = new THREE.BoxGeometry(len,0.1,0.12);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color:0xd4b060, roughness:0.2, metalness:0.7 }));
  m.position.set((x1+x2)/2,2.18,(z1+z2)/2);
  m.rotation.y=Math.atan2(dx,dz); return m;
}
scene.add(crown(-3.5,-3.5,3.5,-3.5));
scene.add(crown(-3.5,-3.5,-3.5,2.0));
scene.add(crown(3.5,-3.5,3.5,2.0));

// Avize
(function(){
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color:0xd4b060, roughness:0.15, metalness:0.92 });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.8,8), gold)).position.y=0.4;
  for(let ring=0;ring<3;ring++){
    const r=0.3+ring*0.18, y=-ring*0.25;
    g.add(new THREE.Mesh(new THREE.TorusGeometry(r,0.03,12,48), gold)).position.y=y;
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,r+0.1,6),gold);
      arm.position.set(Math.cos(a)*r*0.5,y,Math.sin(a)*r*0.5);
      arm.rotation.z=Math.PI/2;arm.rotation.y=-a+Math.PI/2;g.add(arm);
    }
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2;
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),
        new THREE.MeshStandardMaterial({ color:0xffe8cc,roughness:0.1,metalness:0,emissive:0xffcc88,emissiveIntensity:0.7 }));
      bulb.position.set(Math.cos(a)*(r+0.05),y,Math.sin(a)*(r+0.05));g.add(bulb);
    }
  }
  g.position.set(0,3.5,-0.75);scene.add(g);
  const cl = new THREE.PointLight(0xffd8a0,15,6);
  cl.position.set(0,3.2,-0.75);scene.add(cl);
})();

// Duvar aplikleri
function sconce(x,y,z,ry){
  const g=new THREE.Group();
  const b=new THREE.MeshStandardMaterial({ color:0xd4b060,roughness:0.15,metalness:0.9 });
  const s=new THREE.MeshStandardMaterial({ color:0xfaf5e8,roughness:0.4,metalness:0,emissive:0xffd8a0,emissiveIntensity:0.4,side:THREE.DoubleSide });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.03,16),b));
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.2,8),b);
  arm.rotation.x=Math.PI/2;arm.position.z=0.12;g.add(arm);
  const shade=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.06,0.18,16,1,true),s);
  shade.rotation.x=Math.PI/2;shade.position.z=0.25;g.add(shade);
  const pt=new THREE.PointLight(0xffd8a0,6,3.5);pt.position.z=0.25;g.add(pt);
  g.position.set(x,y,z);g.rotation.y=ry;return g;
}
scene.add(sconce(-3.35,1.5,0,Math.PI/2));
scene.add(sconce(3.35,1.5,0,-Math.PI/2));

// Chesterfield koltuklar
function armchair(x,z,ry){
  const g=new THREE.Group();
  const lt=loadTex('/textures/fabric_leather_02.jpg');
  const l=new THREE.MeshStandardMaterial({ map:lt,roughness:0.4,metalness:0.03 });
  const dw=new THREE.MeshStandardMaterial({ map:darkWoodTex,roughness:0.35,metalness:0.05 });
  for(let lx=-0.22;lx<=0.22;lx+=0.44)
    for(let lz=-0.18;lz<=0.18;lz+=0.36){
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.03,0.35,8),dw);
      leg.position.set(lx,-0.4,lz);leg.castShadow=true;g.add(leg);
    }
  const seat=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.12,24),l);
  seat.position.y=-0.17;seat.castShadow=seat.receiveShadow=true;g.add(seat);
  const back=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.28,0.5,24),l);
  back.position.set(0,0.08,-0.18);back.rotation.x=0.2;back.castShadow=true;g.add(back);
  for(let ax=-0.26;ax<=0.26;ax+=0.52){
    const ap=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.38,12),l);
    ap.rotation.x=Math.PI/2;ap.position.set(ax,-0.05,0.05);ap.castShadow=true;g.add(ap);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.22,8),dw)).position.set(ax*1.2,-0.28,0.05);
  }
  g.position.set(x,-1.8,z);g.rotation.y=ry;g.scale.set(0.95,0.95,0.95);return g;
}
scene.add(armchair(-2.5,0.8,0.6)); scene.add(armchair(2.5,0.8,-0.6));
scene.add(armchair(-2.0,1.8,0.2)); scene.add(armchair(2.0,1.8,-0.2));

// Sehpalar
function stool(x,z){
  const g=new THREE.Group();
  const w=new THREE.MeshStandardMaterial({ map:darkWoodTex,roughness:0.3,metalness:0.05 });
  const t=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.22,0.03,24),w);
  t.position.y=0;t.castShadow=true;g.add(t);
  const lg=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.04,0.45,8),w);
  lg.position.y=-0.24;lg.castShadow=true;g.add(lg);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.02,16),w)).position.y=-0.46;
  g.position.set(x,-1.8,z);return g;
}
scene.add(stool(-2.0,1.2)); scene.add(stool(2.0,1.2));

// Arka duvar sergi nişi (koyu gömme alan)
const nicheGeo = new THREE.BoxGeometry(0.08,2.2,2.0);
const niche = new THREE.Mesh(nicheGeo, new THREE.MeshStandardMaterial({ color:0x0e0a06, roughness:0.9, metalness:0 }));
niche.position.set(0,0.6,-3.32); scene.add(niche);

// Arka duvar spotları
const spotL = new THREE.SpotLight(0xffffff, 8, 8, Math.PI/10, 0.4, 0.3);
spotL.position.set(0, 2.8, -2.5);
spotL.target.position.set(0, 1.2, -3.3);
scene.add(spotL); scene.add(spotL.target);

const spotR = new THREE.SpotLight(0xffffff, 8, 8, Math.PI/10, 0.4, 0.3);
spotR.position.set(0, 2.8, 1);
spotR.target.position.set(0, 1.2, 2);
scene.add(spotR); scene.add(spotR.target);

// CANVAS TEXTURE GENERATOR
// ============================================================
function createCanvas(w, h, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ============================================================
// MATERIALS DATABASE
// ============================================================
const materials = [
  { id: 'oak', name: 'Meşe', type: 'wood', tex: 'oak_veneer_01.jpg', roughness: 0.55, metalness: 0.02, color: '#c4a87c' },
  { id: 'walnut', name: 'Ceviz', type: 'wood', tex: 'dark_wood.jpg', roughness: 0.5, metalness: 0.02, color: '#6b4c3b' },
  { id: 'pine', name: 'Çam', type: 'wood', tex: 'wood_planks.jpg', roughness: 0.55, metalness: 0.02, color: '#d4be8a' },
  { id: 'whitewood', name: 'Kontrplak', type: 'wood', tex: 'plywood.jpg', roughness: 0.5, metalness: 0.02, color: '#e8dcc8' },
  { id: 'aluminum', name: 'Alüminyum', type: 'metal', tex: 'metal_plate.jpg', roughness: 0.3, metalness: 0.85, color: '#c0c4c8' },
  { id: 'copper', name: 'Bakır', type: 'metal', tex: 'blue_metal_plate.jpg', roughness: 0.3, metalness: 0.8, color: '#8b9bb4' },
  { id: 'marble', name: 'Mermer', type: 'stone', tex: 'marble_01.jpg', roughness: 0.35, metalness: 0.05, color: '#e8e4dc' },
  { id: 'acrylic', name: 'Akrilik', type: 'synthetic', tex: 'synthetic_wood.jpg', roughness: 0.4, metalness: 0.02, color: '#f0e8d8' },
  { id: 'pvc', name: 'PVC Köpük', type: 'synthetic', tex: 'wood_floor_worn.jpg', roughness: 0.6, metalness: 0.02, color: '#e8ddd0' },
];

const frames = [
  { id: 'none', name: 'Çerçevesiz', thickness: 0, color: 'transparent' },
  { id: 'thin', name: 'İnce Modern', thickness: 0.04, color: '#2c2416' },
  { id: 'thick', name: 'Kalın Klasik', thickness: 0.08, color: '#3a2a1a' },
  { id: 'gold', name: 'Altın Varak', thickness: 0.05, color: '#c4a96a' },
  { id: 'silver', name: 'Gümüş', thickness: 0.05, color: '#c0c4c8' },
  { id: 'black', name: 'Siyah Mat', thickness: 0.05, color: '#1a1a1a' },
];

const artDesigns = [
  { id: 'tablo', name: 'Koleksiyon', path: '/textures/tablo.jpeg' },
  { id: 'oil', name: 'Yağlı Boya', path: '/textures/art/oil_painting.jpg' },
  { id: 'floral', name: 'Çiçek', path: '/textures/art/floral.jpg' },
  { id: 'modern', name: 'Modern', path: '/textures/art/modern_art.jpg' },
  { id: 'landscape', name: 'Manzara', path: '/textures/art/landscape.jpg' },
  { id: 'abstract', name: 'Soyut', path: '/textures/art/abstract_art.jpg' },
];

const accentColors = [
  { id: 'gold', color: '#c4a96a', name: 'Altın' },
  { id: 'red', color: '#c0392b', name: 'Kırmızı' },
  { id: 'blue', color: '#2980b9', name: 'Mavi' },
  { id: 'green', color: '#27ae60', name: 'Yeşil' },
  { id: 'black', color: '#1a1a1a', name: 'Siyah' },
  { id: 'white', color: '#f5f5f5', name: 'Beyaz' },
];

const sizes = [
  { id: 'small', name: 'Küçük', scale: 0.7, price: 150 },
  { id: 'medium', name: 'Orta', scale: 1.0, price: 250 },
  { id: 'large', name: 'Büyük', scale: 1.4, price: 400 },
];

// ============================================================
// STATE
// ============================================================
const state = {
  product: 'framed',       // 'framed' | 'canvas' | 'varnished'
  material: 'oak',
  frame: 'thin',
  design: 'tablo',
  accentColor: '#c4a96a',
  size: 'medium',
  vernik: true,            // Vernik (clearcoat) açık/kapalı
};
let productMesh = null;
let autoRotate = false; // Ürün kendi etrafında dönsün mü? (default: duruyor)

function getMatTexture(mat) {
  return loadTex('/textures/' + mat.tex);
}

function buildProduct() {
  // Remove old
  if (productMesh) {
    productMesh.traverse(c => {
      if (c.geometry && c.geometry !== productMesh.geometry) c.geometry.dispose();
      if (c.material) {
        if (Array.isArray(c.material)) c.material.forEach(m => { if (m.map && !m.map.isRenderTargetTexture) m.map.dispose(); m.dispose(); });
        else { if (c.material.map && !c.material.map.isRenderTargetTexture) c.material.map.dispose(); c.material.dispose(); }
      }
    });
    scene.remove(productMesh);
  }

  productMesh = new THREE.Group();

  const mat = materials.find(m => m.id === state.material);
  const frame = frames.find(f => f.id === state.frame);
  const size = sizes.find(s => s.id === state.size);
  const s = size.scale;

  if (state.product === 'framed') {
    buildFramed(productMesh, mat, frame, s);
  } else if (state.product === 'canvas') {
    buildCanvas(productMesh, mat, s);
  } else {
    buildVarnished(productMesh, mat, frame, s);
  }

  productMesh.position.set(0, 0.6, -3.2); // Arka duvar nişinde
  productMesh.castShadow = true;
  productMesh.receiveShadow = true;
  scene.add(productMesh);

  updatePrice();
}

// Canvas doku — kanvas bezinin pürüzlü yüzeyi
function makeCanvasBump() {
  return createCanvas(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      for (let x = 0; x < w; x += 4) {
        const v = 120 + Math.random() * 15;
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 4, 4);
      }
    }
  });
}

function loadArtTex() {
  const art = artDesigns.find(a => a.id === state.design);
  return loadTex(art.path);
}

// Çerçeveli Tablo (klasik şövale üzerinde)
function buildFramed(group, mat, frame, s) {
  const w = 0.9 * s;  const h = 1.2 * s;  const d = 0.03 * s;
  const artTex = loadArtTex();

  // Arka panel — ince düzlem (BoxGeometry değil, kenar yüzleri olmasın)
  const boardGeo = new THREE.PlaneGeometry(w, h);
  const boardMat = new THREE.MeshStandardMaterial({ map: getMatTexture(mat), roughness: mat.roughness, metalness: mat.metalness });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.z = -0.002;
  board.castShadow = true; board.receiveShadow = true;
  group.add(board);

  // Sanat eseri ön yüz — board ile aynı boyutta, tam kapatır
  const decalGeo = new THREE.PlaneGeometry(w, h);
  const decalMat = new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.5, metalness: 0 });
  const decal = new THREE.Mesh(decalGeo, decalMat);
  decal.position.z = 0.002;
  group.add(decal);

  // Çerçeve
  if (frame.thickness > 0) {
    addFrame(group, w, h, d, frame.thickness * s, frame.color);
  }

  // Şövale ayağı (sadece altta görünür destek)
  const easelMat = new THREE.MeshStandardMaterial({ map: loadTex('/textures/dark_wood.jpg'), roughness: 0.4, metalness: 0.05 });
  const footGeo = new THREE.BoxGeometry(0.18 * s, 0.02 * s, 0.10 * s);
  const foot = new THREE.Mesh(footGeo, easelMat);
  foot.position.set(0, -h / 2 - 0.05 * s, 0.02 * s);
  foot.castShadow = true; group.add(foot);
}

// Kanvas Baskı (galeri sarma, çerçevesiz, bez dokulu)
function buildCanvas(group, mat, s) {
  const w = 0.85 * s;  const h = 1.1 * s;  const d = 0.04 * s;
  const artTex = loadArtTex();

  // Tuval kalınlığı (yanlarda kanvas dokusu görünür)
  const wrapGeo = new THREE.BoxGeometry(w, h, d);
  const wrapCanvasTex = loadTex('/textures/velour_velvet.jpg');
  wrapCanvasTex.repeat.set(4, 4);
  const wrapMat = new THREE.MeshStandardMaterial({ map: wrapCanvasTex, roughness: 0.7, metalness: 0 });
  const wrap = new THREE.Mesh(wrapGeo, wrapMat);
  wrap.castShadow = true; wrap.receiveShadow = true;
  group.add(wrap);

  // Baskı ön yüzü
  const frontGeo = new THREE.PlaneGeometry(w - 0.01, h - 0.01);
  const frontTex = artTex;
  const frontMat = new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.55, metalness: 0 });
  const front = new THREE.Mesh(frontGeo, frontMat);
  front.position.z = d / 2 + 0.001;
  group.add(front);

  // Arka (mat.name)
  const backGeo = new THREE.PlaneGeometry(w, h);
  const backMat = new THREE.MeshStandardMaterial({ map: getMatTexture(mat), roughness: mat.roughness, metalness: mat.metalness });
  const back = new THREE.Mesh(backGeo, backMat);
  back.position.z = -d / 2 - 0.001;
  back.rotation.y = Math.PI;
  group.add(back);

  // Görünmez ayak (duvara yaslı durur gibi)
  const leanGeo = new THREE.CylinderGeometry(0.015 * s, 0.015 * s, 0.6 * s, 8);
  const leanMat = new THREE.MeshStandardMaterial({ map: loadTex('/textures/dark_wood.jpg'), roughness: 0.4, metalness: 0.05 });
  const lean = new THREE.Mesh(leanGeo, leanMat);
  lean.position.set(0, -h / 2 - 0.3 * s, 0.04);
  lean.rotation.x = 0.15;
  lean.castShadow = true; group.add(lean);
}

// Vernikli Eser (clearcoat parlak vernik efekti)
function buildVarnished(group, mat, frame, s) {
  const w = 0.9 * s;  const h = 1.2 * s;  const d = 0.03 * s;
  const artTex = loadArtTex();

  // Arka panel — ince düzlem (BoxGeometry değil)
  const boardGeo = new THREE.PlaneGeometry(w, h);
  const boardMat = new THREE.MeshStandardMaterial({ map: getMatTexture(mat), roughness: mat.roughness, metalness: mat.metalness });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.z = -0.002;
  board.castShadow = true; board.receiveShadow = true;
  group.add(board);

  // Vernikli ön yüz — tam boyut, board'u kapatır
  const decalGeo = new THREE.PlaneGeometry(w, h);
  const decalMat = state.vernik ? new THREE.MeshPhysicalMaterial({
    map: artTex, roughness: 0.35, metalness: 0,
    clearcoat: 0.8, clearcoatRoughness: 0.1,
  }) : new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.55, metalness: 0 });
  const decal = new THREE.Mesh(decalGeo, decalMat);
  decal.position.z = 0.002;
  group.add(decal);
  decal.userData = { isDecal: true, artTex };

  // Çerçeve
  if (frame.thickness > 0) {
    addFrame(group, w, h, d, frame.thickness * s, frame.color);
  }

  // Şövale ayağı (sadece altta görünür destek)
  const easelMat2 = new THREE.MeshStandardMaterial({ map: loadTex('/textures/dark_wood.jpg'), roughness: 0.4, metalness: 0.05 });
  const footGeo2 = new THREE.BoxGeometry(0.18 * s, 0.02 * s, 0.10 * s);
  const foot2 = new THREE.Mesh(footGeo2, easelMat2);
  foot2.position.set(0, -h / 2 - 0.05 * s, 0.02 * s);
  foot2.castShadow = true; group.add(foot2);
}

function addFrame(group, w, h, d, ft, color) {
  const frameMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.25, metalness: 0.25 });
  // Profil: dışa doğru hafif eğimli (üst + alt + sol + sağ)
  [[0, 1], [0, -1], [-1, 0], [1, 0]].forEach(([fx, fy]) => {
    const isV = fx === 0;
    const fw = isV ? w + ft * 2 : ft;
    const fh = isV ? ft : h;
    const fGeo = new THREE.BoxGeometry(fw, fh, d + ft * 0.6);
    const fMesh = new THREE.Mesh(fGeo, frameMat);
    fMesh.position.set(fx * (w / 2 + ft / 2), fy * (h / 2 + ft / 2), 0);
    fMesh.castShadow = true;
    group.add(fMesh);
  });
  // Köşe vurguları
  const accentColor = state.accentColor;
  const cornerGeo = new THREE.BoxGeometry(ft * 1.8, ft * 1.8, d + ft * 0.7);
  const cornerMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.15, metalness: 0.6 });
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([cx, cy]) => {
    const corner = new THREE.Mesh(cornerGeo, cornerMat);
    corner.position.set(cx * (w / 2 + ft / 2), cy * (h / 2 + ft / 2), 0);
    corner.castShadow = true; group.add(corner);
  });
}

// ============================================================
// PRICE
// ============================================================
function updatePrice() {
  const sizePrice = sizes.find(s => s.id === state.size).price;
  const framePrice = state.frame === 'none' ? 0 : 50;
  const matPrice = materials.find(m => m.id === state.material).type === 'metal' ? 80 : 0;
  const total = sizePrice + framePrice + matPrice;
  gsap.to(priceEl, { textContent: total, duration: 0.3, snap: { textContent: 1 }, onUpdate() {
    priceEl.textContent = '₺' + Math.round(total);
  }});
}

// ============================================================
// BUILD UI SWATCHES
// ============================================================
function buildMaterialSwatches() {
  materialSwatches.innerHTML = materials.map(m => `
    <div class="swatch ${m.id === state.material ? 'active' : ''}"
         data-id="${m.id}" data-type="material"
         style="background-image:url('/textures/${m.tex}');background-size:cover"
         title="${m.name}"></div>
  `).join('');
}

function buildFrameSwatches() {
  frameSwatches.innerHTML = frames.map(f => `
    <div class="swatch ${f.id === state.frame ? 'active' : ''}"
         data-id="${f.id}" data-type="frame"
         style="background-color:${f.color};${f.id === 'none' ? 'border:2px dashed rgba(0,0,0,0.2)' : ''}"
         title="${f.name}"></div>
  `).join('');
}

function buildDesignSwatches() {
  designSwatches.innerHTML = artDesigns.map(d => `
    <div class="swatch ${d.id === state.design ? 'active' : ''}"
         data-id="${d.id}" data-type="design"
         style="background-image:url('${d.path}');background-size:cover"
         title="${d.name}"></div>
  `).join('');
}

function buildColorSwatches() {
  colorSwatches.innerHTML = accentColors.map(c => `
    <div class="swatch color ${c.id === accentColors.find(ac => ac.color === state.accentColor)?.id ? 'active' : ''}"
         data-id="${c.color}" data-type="color"
         style="background-color:${c.color}"
         title="${c.name}"></div>
  `).join('');
}

function buildSizeSwatches() {
  sizeSwatches.innerHTML = sizes.map(s => `
    <button class="swatch size-btn ${s.id === state.size ? 'active' : ''}"
         data-id="${s.id}" data-type="size">
      ${s.name}<br>₺${s.price}
    </button>
  `).join('');
}

function rebuildAllSwatches() {
  buildMaterialSwatches();
  buildFrameSwatches();
  buildDesignSwatches();
  buildColorSwatches();
  buildSizeSwatches();
  // Vernik sadece vernikli eser seçiliyse görünür
  vernikSection.style.display = state.product === 'varnished' ? 'flex' : 'none';
}

// ============================================================
// UI EVENTS
// ============================================================
// Product cards
prodCards.forEach(card => {
  card.addEventListener('click', () => {
    prodCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    state.product = card.dataset.product;
    rebuildAllSwatches();
    buildProduct();
    resetCamera();
  });
});

// Swatch clicks (delegated)
[materialSwatches, frameSwatches, designSwatches, colorSwatches, sizeSwatches].forEach(container => {
  container.addEventListener('click', (e) => {
    const swatch = e.target.closest('[data-type]');
    if (!swatch) return;
    const { type, id } = swatch.dataset;

    switch (type) {
      case 'material':
        state.material = id;
        break;
      case 'frame':
        state.frame = id;
        break;
      case 'design':
        state.design = id;
        break;
      case 'color':
        state.accentColor = id;
        break;
      case 'size':
        state.size = id;
        break;
    }

    // Update active state
    if (type === 'color') {
      colorSwatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    } else if (type === 'size') {
      sizeSwatches.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    } else {
      swatch.parentElement.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    }

    buildProduct();
  });
});

// Vernik toggle
const vernikSection = document.getElementById('vernik-section');
const btnVernik = document.getElementById('btn-vernik');
const vernikStatus = document.getElementById('vernik-status');
btnVernik.addEventListener('click', () => {
  state.vernik = !state.vernik;
  vernikStatus.textContent = state.vernik ? 'Açık ✨' : 'Kapalı';
  btnVernik.classList.toggle('active', state.vernik);
  buildProduct();
});

// Rotate toggle
const btnRotate = document.getElementById('btn-rotate');
const rotateStatus = document.getElementById('rotate-status');
btnRotate.addEventListener('click', () => {
  autoRotate = !autoRotate;
  rotateStatus.textContent = autoRotate ? 'Açık' : 'Kapalı';
  btnRotate.classList.toggle('active', autoRotate);
});
// Rotate başlangıçta kapalı (kullanıcı açana kadar dönmez)

// Screenshot
document.getElementById('btn-screenshot').addEventListener('click', () => {
  renderer.render(scene, camera);
  const link = document.createElement('a');
  link.download = 'ebaskicim-tasarim.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();
});

// Order
document.getElementById('btn-order').addEventListener('click', () => {
  const mat = materials.find(m => m.id === state.material);
  const frame = frames.find(f => f.id === state.frame);
  const size = sizes.find(s => s.id === state.size);
  const prodNames = { framed: 'Çerçeveli Tablo', canvas: 'Kanvas Baskı', varnished: 'Vernikli Eser' };
  const msg = `🛒 Tasarım Özeti:\n📦 ${size.name} ${prodNames[state.product]}\n🎨 ${mat.name} zemin\n🖼️ ${frame.name} çerçeve\n💰 ${priceEl.textContent}\n\nSize özel teklif için bizimle iletişime geçin!`;
  alert(msg);
});

// ============================================================
// CAMERA
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.6, -3.2);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2.5;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI * 0.65;
controls.minPolarAngle = 0.3;
controls.update();

function resetCamera() {
  gsap.to(controls.target, { x: 0, y: 0.6, z: -3.2, duration: 0.8, ease: 'power2.inOut' });
  gsap.to(camera.position, { x: 0, y: 1.6, z: -0.5, duration: 0.8, ease: 'power2.inOut' });
}

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);
  controls.update();
  // Auto-rotate ürün
  if (autoRotate && productMesh) {
    productMesh.rotation.y += dt * 0.4;
  }
  renderer.render(scene, camera);
}

// ============================================================
// INIT
// ============================================================
rebuildAllSwatches();
buildProduct();
resetCamera();
controls.target.set(0, 0.6, -3.2);
camera.position.set(0, 1.6, -0.5);
controls.update();

setTimeout(() => loadingEl.classList.add('hidden'), 800);
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('🖨️  eBaskicim 3D Konfigüratör hazır.');
console.log('   🪧 Tabela | 📋 Menü | 🖼️ Afiş');
console.log('   🎨 Zemin • Çerçeve • Tasarım • Renk • Ebat');
