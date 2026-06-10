// ============================================================
// MANULI HYDRAULICS — 3D Ürün Deneyimi
// Three.js + GSAP | Q.SAFE • Hortum • Entegre Çözüm
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';

// ============================================================
// DOM REFS
// ============================================================
const loadingEl = document.getElementById('loading');
const infoPanel = document.getElementById('infopanel');
const infoTitle = document.getElementById('infopanel-title');
const infoDesc = document.getElementById('infopanel-desc');
const infoSpecs = document.getElementById('infopanel-specs');
const badgeContainer = document.getElementById('badge-container');
const sceneTabs = document.querySelectorAll('.scene-tab');
const enviroBtns = document.querySelectorAll('.enviro-btn');
const btnExplode = document.getElementById('btn-explode');
const btnAutoplay = document.getElementById('btn-autoplay');
const btnReset = document.getElementById('btn-reset');

// ============================================================
// SCENE, CAMERA, RENDERER
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0c0d14);
scene.fog = new THREE.Fog(0x0c0d14, 6, 28);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.5, 9);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.3, 0.9
);
composer.addPass(bloomPass);

// ============================================================
// LIGHTING
// ============================================================
const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
keyLight.position.set(6, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.3;
keyLight.shadow.camera.far = 30;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0002;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x8899cc, 2);
rimLight.position.set(-4, 3, -4);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x334455, 1);
fillLight.position.set(0, -0.5, 3);
scene.add(fillLight);

// ============================================================
// ENVIRONMENT — Platform + Grid
// ============================================================
const platformGeo = new THREE.CylinderGeometry(4, 4.5, 0.15, 64);
const platformMat = new THREE.MeshStandardMaterial({
  color: 0x1a1d28, roughness: 0.5, metalness: 0.3,
});
const platform = new THREE.Mesh(platformGeo, platformMat);
platform.position.y = -2.3;
platform.receiveShadow = true;
platform.castShadow = true;
scene.add(platform);

// Subtle ring lights on platform
for (let i = 0; i < 3; i++) {
  const ringGeo = new THREE.TorusGeometry(3.8 - i * 0.1, 0.008, 16, 100);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x334466, roughness: 0.3, metalness: 0.5,
    emissive: 0x112233, emissiveIntensity: 0.5,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -2.22;
  ring.receiveShadow = true;
  scene.add(ring);
}

// Grid
const gridHelper = new THREE.PolarGridHelper(8, 48, 24, 64, 0x222233, 0x222233);
gridHelper.position.y = -2.22;
scene.add(gridHelper);

// Particles
const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 150;
const posArr = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i += 3) {
  posArr[i] = (Math.random() - 0.5) * 14;
  posArr[i + 1] = Math.random() * 6 - 1.5;
  posArr[i + 2] = (Math.random() - 0.5) * 10;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.02, color: 0x8899bb, transparent: true, opacity: 0.3,
  blending: THREE.AdditiveBlending, depthWrite: false,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// ============================================================
// MATERIAL FACTORY
// ============================================================
function steelMaterial(color = 0xc0c0c8, roughness = 0.22, metalness = 0.92) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function rubberMaterial(color = 0x1a1a1e, roughness = 0.85, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}
function brassMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0xd4a843, roughness: 0.2, metalness: 0.95 });
}
function puMaterial() {
  return new THREE.MeshStandardMaterial({ color: 0xf48120, roughness: 0.3, metalness: 0.05,
    emissive: 0xf48120, emissiveIntensity: 0.15 });
}

// ============================================================
// PRODUCT 1: Q.SAFE SERIES (Quick Coupling)
// ============================================================
const qsafeGroup = new THREE.Group();
qsafeGroup.position.set(0, 0.3, 0);

// Female body (receiver)
const femaleGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.2, 48);
const femaleBody = new THREE.Mesh(femaleGeo, steelMaterial(0xb8bac2));
femaleBody.position.y = 0;
femaleBody.castShadow = true;
femaleBody.receiveShadow = true;
qsafeGroup.add(femaleBody);

// Female body detail rings
for (let i = 0; i < 3; i++) {
  const ringGeo = new THREE.TorusGeometry(0.36, 0.02, 16, 48);
  const ring = new THREE.Mesh(ringGeo, steelMaterial(0x999aa2, 0.3, 0.85));
  ring.position.y = -0.3 + i * 0.3;
  qsafeGroup.add(ring);
}

// Cr3+ coating indicator (subtle green-blue band)
const crBandGeo = new THREE.TorusGeometry(0.37, 0.03, 16, 64);
const crBand = new THREE.Mesh(crBandGeo, new THREE.MeshStandardMaterial({
  color: 0x88aa99, roughness: 0.15, metalness: 0.7,
  emissive: 0x223322, emissiveIntensity: 0.3,
}));
crBand.position.y = -0.15;
crBand.name = 'Cr3+ E-Coat Kaplama';
qsafeGroup.add(crBand);

// Female bore (dark interior)
const boreGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.8, 32);
const boreMesh = new THREE.Mesh(boreGeo, new THREE.MeshStandardMaterial({
  color: 0x111118, roughness: 0.4, metalness: 0.6,
}));
boreMesh.position.y = 0.2;
qsafeGroup.add(boreMesh);

// PU Seal (orange/amber ring inside bore)
const puSealGeo = new THREE.TorusGeometry(0.27, 0.04, 24, 48);
const puSeal = new THREE.Mesh(puSealGeo, puMaterial());
puSeal.position.y = 0.35;
puSeal.name = 'Gelişmiş PU Conta';
qsafeGroup.add(puSeal);

// Male body (plug) — separate group for animation
const maleGroup = new THREE.Group();
maleGroup.position.y = 1.2;
maleGroup.name = 'Q.SAFE Erkek Uç';

const maleBodyGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.6, 48);
const maleBody = new THREE.Mesh(maleBodyGeo, steelMaterial(0xc5c7cf));
maleBody.position.y = 0;
maleBody.castShadow = true;
maleBody.receiveShadow = true;
maleGroup.add(maleBody);

const maleTipGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.2, 48);
const maleTip = new THREE.Mesh(maleTipGeo, steelMaterial(0xd0d2da, 0.15, 0.95));
maleTip.position.y = -0.4;
maleTip.castShadow = true;
maleGroup.add(maleTip);

// Cr3+ band on male
const maleCrBand = new THREE.Mesh(
  new THREE.TorusGeometry(0.27, 0.025, 16, 48),
  new THREE.MeshStandardMaterial({ color: 0x88aa99, roughness: 0.15, metalness: 0.7,
    emissive: 0x223322, emissiveIntensity: 0.3 })
);
maleCrBand.position.y = -0.1;
maleGroup.add(maleCrBand);

qsafeGroup.add(maleGroup);

// Q.SAFE label ring
const labelRingGeo = new THREE.TorusGeometry(0.33, 0.015, 16, 64);
const labelRing = new THREE.Mesh(labelRingGeo, new THREE.MeshStandardMaterial({
  color: 0xf48120, roughness: 0.2, metalness: 0.1,
  emissive: 0xf48120, emissiveIntensity: 0.6,
}));
labelRing.position.y = 0.55;
labelRing.name = 'Q.SAFE';
qsafeGroup.add(labelRing);

scene.add(qsafeGroup);

// Hotspot data for Q.SAFE
const qsafeHotspots = [
  { obj: puSeal, title: 'Gelişmiş PU Conta',
    desc: 'Poliüretan sızdırmazlık elemanı. 350 bar basınçta sıfıra yakın sızıntı (0.007cc).' },
  { obj: crBand, title: 'Cr3+ E-Coat Zırhı',
    desc: 'Çevre dostu krom-3 kaplama. 1000 saat tuz püskürtme testini geçer — standartların 4 katı.' },
  { obj: maleGroup, title: 'Aletsiz Bağlantı',
    desc: 'Tek bir hareketle kilitlenir. Hiçbir anahtar veya takım gerektirmez. Saniyeler içinde bağlantı.' },
];

// ============================================================
// PRODUCT 2: HYDRAULIC HOSE (Cross-section capable)
// ============================================================
const hoseGroup = new THREE.Group();
hoseGroup.position.set(5.5, 0, 0.5);

// Hose curve
const hoseCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.3, 0.5, 0.2),
  new THREE.Vector3(0.8, 0.1, -0.1),
  new THREE.Vector3(1.3, 0.3, 0.1),
  new THREE.Vector3(1.8, 0.0, 0),
], false, 'catmullrom', 0.5);

// Outer armor layer (black rubber)
const outerGeo = new THREE.TubeGeometry(hoseCurve, 100, 0.28, 32, false);
const outerMesh = new THREE.Mesh(outerGeo, rubberMaterial(0x151518, 0.9, 0.02));
outerMesh.castShadow = true;
outerMesh.name = 'Ekstrem Şart Kalkanı';
hoseGroup.add(outerMesh);

// Steel braid layer (wireframe)
const steelGeo = new THREE.TubeGeometry(hoseCurve, 100, 0.23, 24, false);
const steelMesh = new THREE.Mesh(steelGeo, new THREE.MeshStandardMaterial({
  color: 0x889099, roughness: 0.3, metalness: 0.95,
  wireframe: false,
}));
steelMesh.visible = false; // hidden by default, shown in cross-section
steelMesh.name = 'Yüksek Mukavemetli Çelik Örgü';
hoseGroup.add(steelMesh);

// Inner rubber layer
const innerGeo = new THREE.TubeGeometry(hoseCurve, 100, 0.18, 24, false);
const innerMesh = new THREE.Mesh(innerGeo, rubberMaterial(0x1a1a20, 0.7, 0.03));
innerMesh.visible = false;
innerMesh.name = 'Sentetik Kauçuk İç Katman';
hoseGroup.add(innerMesh);

// Hose end fittings (metal collars at both ends)
function createHoseCollar(t) {
  const pt = hoseCurve.getPointAt(t);
  const tg = hoseCurve.getTangentAt(t);
  const collarGroup = new THREE.Group();
  collarGroup.position.copy(pt);

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg.normalize());
  collarGroup.setRotationFromQuaternion(quat);

  const collarGeo = new THREE.CylinderGeometry(0.31, 0.29, 0.4, 32);
  const collar = new THREE.Mesh(collarGeo, steelMaterial(0xaab0b8, 0.25, 0.9));
  collar.castShadow = true;
  collar.receiveShadow = true;
  collarGroup.add(collar);

  // Hex ring
  const hexGeo = new THREE.TorusGeometry(0.33, 0.03, 8, 6);
  const hexRing = new THREE.Mesh(hexGeo, steelMaterial(0x999aa2, 0.3, 0.85));
  collarGroup.add(hexRing);

  return collarGroup;
}
const collarA = createHoseCollar(0.02);
const collarB = createHoseCollar(0.98);
hoseGroup.add(collarA);
hoseGroup.add(collarB);

// Cross-section indicator ring (middle of hose)
const cutIndicatorGeo = new THREE.TorusGeometry(0.32, 0.01, 16, 64);
const cutIndicator = new THREE.Mesh(cutIndicatorGeo, new THREE.MeshStandardMaterial({
  color: 0xf48120, roughness: 0.1, metalness: 0.0,
  emissive: 0xf48120, emissiveIntensity: 1.0,
}));
const midPoint = hoseCurve.getPointAt(0.5);
cutIndicator.position.copy(midPoint);
cutIndicator.visible = false;
cutIndicator.name = 'Kesit Göstergesi';
hoseGroup.add(cutIndicator);

scene.add(hoseGroup);

const hoseHotspots = [
  { obj: outerMesh, title: 'Ekstrem Şart Kalkanı',
    desc: 'Aşınmaya dayanıklı özel poliüretan dış kılıf. -30°C ile +110°C arası tam performans.' },
  { obj: steelMesh, title: 'Yüksek Mukavemetli Çelik Örgü',
    desc: 'Spiral çelik tel takviyesi. 1 milyon test döngüsünde sıfır deformasyon.' },
  { obj: innerMesh, title: 'Sentetik Kauçuk İç Katman',
    desc: 'İleri sentetik kauçuk bileşen. Hidrolik yağ, yakıt ve kimyasallara karşı tam direnç.' },
];

// ============================================================
// PRODUCT 3: INTEGRATED FITTING + HOSE (Rakor entegre çözüm)
// ============================================================
const fittingGroup = new THREE.Group();
fittingGroup.position.set(-5.5, 0, 0.5);

// Short hose section
const fitCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0.4, 0.3, 0.1),
  new THREE.Vector3(1.0, 0.1, -0.05),
  new THREE.Vector3(1.5, 0.2, 0),
], false, 'catmullrom', 0.5);

const fitHoseGeo = new THREE.TubeGeometry(fitCurve, 80, 0.25, 28, false);
const fitHose = new THREE.Mesh(fitHoseGeo, rubberMaterial(0x151518, 0.9, 0.02));
fitHose.castShadow = true;
fittingGroup.add(fitHose);

// RAKOR (hydraulic fitting) at hose end
const rakorGroup = new THREE.Group();
const endPt = fitCurve.getPointAt(1);
const endTg = fitCurve.getTangentAt(1);
rakorGroup.position.copy(endPt);
const rakorQuat = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(0, 0, 1), endTg.normalize()
);
rakorGroup.setRotationFromQuaternion(rakorQuat);

// Hex body
const hexGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.5, 6);
const hexBody = new THREE.Mesh(hexGeo, steelMaterial(0xa8aeb6, 0.2, 0.93));
hexBody.castShadow = true;
hexBody.receiveShadow = true;
hexBody.name = 'Altıgen Gövde';
rakorGroup.add(hexBody);

// Threaded section
const threadGroup = new THREE.Group();
for (let i = 0; i < 6; i++) {
  const threadGeo = new THREE.TorusGeometry(0.28, 0.015, 8, 32);
  const thread = new THREE.Mesh(threadGeo, steelMaterial(0xc8ccd4, 0.15, 0.95));
  thread.position.z = 0.3 + i * 0.08;
  thread.castShadow = true;
  threadGroup.add(thread);
}
rakorGroup.add(threadGroup);

// Crimp collar (where hose meets fitting)
const crimpGeo = new THREE.CylinderGeometry(0.36, 0.30, 0.4, 32);
const crimpMesh = new THREE.Mesh(crimpGeo, steelMaterial(0x999aa2, 0.25, 0.9));
crimpMesh.position.z = -0.1;
crimpMesh.castShadow = true;
crimpMesh.receiveShadow = true;
crimpMesh.name = 'Pres Bağlantı Bölgesi';
rakorGroup.add(crimpMesh);

// Gold contact tip
const tipGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.2, 32);
const tipMesh = new THREE.Mesh(tipGeo, brassMaterial());
tipMesh.position.z = 0.7;
tipMesh.castShadow = true;
tipMesh.name = 'Sızdırmaz Bağlantı Ucu';
rakorGroup.add(tipMesh);

fittingGroup.add(rakorGroup);

// Integrated badge
const badgeGeo = new THREE.OctahedronGeometry(0.15, 0);
const badgeMesh = new THREE.Mesh(badgeGeo, new THREE.MeshStandardMaterial({
  color: 0xf48120, roughness: 0.1, metalness: 0.3,
  emissive: 0xf48120, emissiveIntensity: 0.8,
}));
badgeMesh.position.copy(fitCurve.getPointAt(0.5));
badgeMesh.position.y += 0.4;
badgeMesh.name = 'Entegre Çözüm Rozeti';
fittingGroup.add(badgeMesh);

scene.add(fittingGroup);

const fittingHotspots = [
  { obj: hexBody, title: 'Altıgen Gövde',
    desc: 'Yüksek tork dayanımı. Manuli özel tasarımı sayesinde anahtarla maksimum sıkma gücü.' },
  { obj: crimpMesh, title: 'Pres Bağlantı Bölgesi',
    desc: 'Hortum ve rakorun ayrılmaz birliği. Milyonda bir sızıntı riski. Entegre üretim felsefesi.' },
  { obj: tipMesh, title: 'Sızdırmaz Bağlantı Ucu',
    desc: 'Özel alaşımlı pirinç uç. API ve MSHA sertifikalı. Her koşulda kusursuz sızdırmazlık.' },
];

// ============================================================
// ALL PRODUCTS REGISTRY
// ============================================================
const products = [
  {
    group: qsafeGroup,
    hotspots: qsafeHotspots,
    title: 'Q.SAFE Serisi',
    sub: 'Hızlı Bağlantı Kaplini',
    desc: 'Zamanın ve güvenliğin her şeyden önemli olduğu anlar için tasarlandı. Manuli Q.SAFE serisi, 350 bar (35 MPa) gibi devasa basınçlar altında bile saniyeler içinde aletsiz bağlantı imkanı sunar. Çevre dostu özel Cr3+ kaplaması sayesinde tuza ve korozyona karşı standartların 4 katı (1000 saate kadar) dayanıklılık gösterir.',
    specs: ['350 bar (35 MPa)', '0.007 cc Sızıntı', '1000 Saat Korozyon', 'Aletsiz Bağlantı'],
    camTarget: new THREE.Vector3(0, 0.3, 0),
    camPos: new THREE.Vector3(0, 1.2, 4.5),
    hasExplode: true,
    explodeFn: null, // set after definition
  },
  {
    group: hoseGroup,
    hotspots: hoseHotspots,
    title: 'Hidrolik Hortum',
    sub: 'Gücün Damarları',
    desc: 'Sisteminizin sarsılmaz can damarları. Manuli hidrolik hortumları, -30°C\'nin dondurucu soğuğundan +110°C\'nin kavurucu sıcağına kadar her koşulda performansından ödün vermez. En ileri sentetik kauçuk bileşenleri ve çelik örgü takviyeleriyle 1 milyon test döngüsünü başarıyla geçmiştir.',
    specs: ['-30°C / +110°C', '1M Test Döngüsü', 'Çelik Örgü Takviye', 'Çok Katmanlı Yapı'],
    camTarget: new THREE.Vector3(5.5, 0.2, 0.5),
    camPos: new THREE.Vector3(5.5, 2.0, 4.5),
    hasExplode: true,
    explodeFn: null,
  },
  {
    group: fittingGroup,
    hotspots: fittingHotspots,
    title: 'Entegre Çözüm',
    sub: 'Hortum + Rakor Bütünlüğü',
    desc: 'Kusursuz performans, mükemmel uyumla başlar. Manuli, hortum ve bağlantı elemanlarını birbirleri için özel olarak tasarlar ve üretir. Bu entegre felsefe sayesinde, milyonda bir ihtimal olan sızıntı veya başlık fırlama riskleri ortadan kalkar.',
    specs: ['Entegre Üretim', 'API Sertifikalı', 'MSHA Onaylı', 'Tam Uyum Garantisi'],
    camTarget: new THREE.Vector3(-5.5, 0.2, 0.5),
    camPos: new THREE.Vector3(-5.5, 2.0, 4.5),
    hasExplode: false,
  },
];

// ============================================================
// EXPLODE FUNCTIONS (defined after groups exist)
// ============================================================
let explodeState = { qsafe: false, hose: false };
let explodeAnimations = {};

// Q.SAFE explode: separate male from female
function toggleQSafeExplode(forceState = null) {
  const shouldExplode = forceState !== null ? forceState : !explodeState.qsafe;
  explodeState.qsafe = shouldExplode;

  if (shouldExplode) {
    explodeAnimations.qsafe = gsap.to(maleGroup.position, {
      y: 1.8, duration: 1, ease: 'power3.out',
    });
  } else {
    if (explodeAnimations.qsafe) explodeAnimations.qsafe.kill();
    explodeAnimations.qsafe = gsap.to(maleGroup.position, {
      y: 1.2, duration: 0.8, ease: 'power3.inOut',
    });
  }
}

// Hose cross-section explode
function toggleHoseExplode(forceState = null) {
  const shouldExplode = forceState !== null ? forceState : !explodeState.hose;
  explodeState.hose = shouldExplode;

  if (shouldExplode) {
    outerMesh.material = outerMesh.material.clone();
    outerMesh.material.transparent = true;
    steelMesh.visible = true;
    innerMesh.visible = true;
    cutIndicator.visible = true;

    explodeAnimations.hose = gsap.timeline();
    explodeAnimations.hose.to(outerMesh.material, { opacity: 0.35, duration: 0.6 }, 0);
    explodeAnimations.hose.to(outerMesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.8, ease: 'power3.out' }, 0);
    explodeAnimations.hose.to(steelMesh.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.8, ease: 'power3.out' }, 0.1);
    explodeAnimations.hose.to(innerMesh.scale, { x: 0.9, y: 0.9, z: 0.9, duration: 0.8, ease: 'power3.out' }, 0.2);
  } else {
    if (explodeAnimations.hose) explodeAnimations.hose.kill();
    explodeAnimations.hose = gsap.timeline();
    explodeAnimations.hose.to(outerMesh.material, { opacity: 1, duration: 0.5 }, 0);
    explodeAnimations.hose.to(outerMesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power3.in' }, 0);
    explodeAnimations.hose.to(steelMesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power3.in' }, 0);
    explodeAnimations.hose.to(innerMesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power3.in' }, 0);
    explodeAnimations.hose.call(() => {
      steelMesh.visible = false;
      innerMesh.visible = false;
      cutIndicator.visible = false;
      outerMesh.material.transparent = false;
    }, null, 0.7);
  }
}

products[0].explodeFn = toggleQSafeExplode;
products[1].explodeFn = toggleHoseExplode;

// ============================================================
// CURRENT SCENE STATE
// ============================================================
let currentScene = 0;
let isExploded = false;

// ============================================================
// ENVIRONMENT EFFECTS
// ============================================================
let currentEnv = 'normal';
const snowParticles = [];

function createSnowSystem() {
  const snowGroup = new THREE.Group();
  snowGroup.name = 'snow-system';
  const snowGeo = new THREE.BufferGeometry();
  const snowCount = 400;
  const snowPos = new Float32Array(snowCount * 3);
  for (let i = 0; i < snowCount * 3; i += 3) {
    snowPos[i] = (Math.random() - 0.5) * 15;
    snowPos[i + 1] = Math.random() * 8;
    snowPos[i + 2] = (Math.random() - 0.5) * 10;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    size: 0.06, color: 0xffffff, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const snow = new THREE.Points(snowGeo, snowMat);
  snowGroup.add(snow);
  return snowGroup;
}

function applyEnvironment(env) {
  // Remove old
  const oldSnow = scene.getObjectByName('snow-system');
  if (oldSnow) { scene.remove(oldSnow); oldSnow.traverse(c => { if (c.geometry) c.geometry.dispose(); if (c.material) c.material.dispose(); }); }

  currentEnv = env;

  const targets = {
    bg: 0x0c0d14,
    fogColor: 0x0c0d14,
    fogDensity: 0.035,
    ambientIntensity: 0.5,
    keyColor: 0xffffff,
    keyIntensity: 3.5,
    rimColor: 0x8899cc,
    exposure: 1.15,
    bloomStrength: 0.4,
  };

  switch (env) {
    case 'snow':
      targets.bg = 0x1a1e28;
      targets.fogColor = 0x8899bb;
      targets.fogDensity = 0.05;
      targets.ambientIntensity = 0.7;
      targets.keyColor = 0xaaccff;
      targets.keyIntensity = 2.5;
      targets.rimColor = 0xccddff;
      targets.exposure = 1.0;
      targets.bloomStrength = 0.2;
      const snowSys = createSnowSystem();
      snowSys.name = 'snow-system';
      scene.add(snowSys);
      break;
    case 'fire':
      targets.bg = 0x1a0c0c;
      targets.fogColor = 0x331111;
      targets.fogDensity = 0.04;
      targets.ambientIntensity = 0.6;
      targets.keyColor = 0xffaa66;
      targets.keyIntensity = 4;
      targets.rimColor = 0xff6644;
      targets.exposure = 1.3;
      targets.bloomStrength = 0.7;
      break;
    case 'ocean':
      targets.bg = 0x0c1a1e;
      targets.fogColor = 0x1a3344;
      targets.fogDensity = 0.045;
      targets.ambientIntensity = 0.55;
      targets.keyColor = 0x88ccdd;
      targets.keyIntensity = 3;
      targets.rimColor = 0x448899;
      targets.exposure = 1.1;
      targets.bloomStrength = 0.5;
      break;
  }

  // Animate transitions
  gsap.to(scene, { background: new THREE.Color(targets.bg), duration: 0.8 });
  const fog = scene.fog;
  if (fog) {
    gsap.to(fog.color, { r: ((targets.fogColor >> 16) & 0xff) / 255, g: ((targets.fogColor >> 8) & 0xff) / 255, b: (targets.fogColor & 0xff) / 255, duration: 0.8 });
  }
  gsap.to(ambientLight, { intensity: targets.ambientIntensity, duration: 0.8 });
  gsap.to(keyLight, { intensity: targets.keyIntensity, duration: 0.8 });
  gsap.to(keyLight.color, {
    r: ((targets.keyColor >> 16) & 0xff) / 255,
    g: ((targets.keyColor >> 8) & 0xff) / 255,
    b: (targets.keyColor & 0xff) / 255,
    duration: 0.8,
  });
  gsap.to(rimLight.color, {
    r: ((targets.rimColor >> 16) & 0xff) / 255,
    g: ((targets.rimColor >> 8) & 0xff) / 255,
    b: (targets.rimColor & 0xff) / 255,
    duration: 0.8,
  });
  gsap.to(renderer, { toneMappingExposure: targets.exposure, duration: 0.8 });
  gsap.to(bloomPass, { strength: targets.bloomStrength, duration: 0.8 });

  // Update enviro button states
  enviroBtns.forEach(b => {
    b.classList.toggle('active', b.dataset.env === env);
  });
}

// ============================================================
// CAMERA CONTROLS
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.3, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 2;
controls.maxDistance = 14;
controls.maxPolarAngle = Math.PI * 0.7;
controls.minPolarAngle = 0.15;
controls.update();

// ============================================================
// HOTSPOT SYSTEM
// ============================================================
const hotspotDots = [];
const hotspotLabels = [];

function updateHotspotPositions() {
  const product = products[currentScene];
  product.hotspots.forEach((hs, i) => {
    if (!hotspotDots[i]) return;
    const worldPos = new THREE.Vector3();
    hs.obj.getWorldPosition(worldPos);
    worldPos.y += 0.15;

    const screenPos = worldPos.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    if (screenPos.z > 1) {
      hotspotDots[i].style.display = 'none';
      if (hotspotLabels[i]) hotspotLabels[i].style.display = 'none';
    } else {
      hotspotDots[i].style.display = 'block';
      hotspotDots[i].style.left = x + 'px';
      hotspotDots[i].style.top = y + 'px';
      if (hotspotLabels[i]) {
        hotspotLabels[i].style.left = x + 'px';
        hotspotLabels[i].style.top = (y - 16) + 'px';
        hotspotLabels[i].style.display = 'block';
      }
    }
  });
}

function clearHotspots() {
  hotspotDots.forEach(d => d.remove());
  hotspotLabels.forEach(l => l.remove());
  hotspotDots.length = 0;
  hotspotLabels.length = 0;
}

function createHotspots(productIndex) {
  clearHotspots();
  const product = products[productIndex];
  product.hotspots.forEach((hs, i) => {
    const dot = document.createElement('div');
    dot.className = 'hotspot-dot';
    dot.title = hs.title;
    dot.addEventListener('click', () => showHotspotInfo(i));
    document.body.appendChild(dot);
    hotspotDots.push(dot);

    const label = document.createElement('div');
    label.className = 'hotspot-label';
    label.textContent = hs.title;
    document.body.appendChild(label);
    hotspotLabels.push(label);
  });
}

function showHotspotInfo(index) {
  const hs = products[currentScene].hotspots[index];
  infoTitle.textContent = hs.title;
  infoDesc.textContent = hs.desc;
  infoSpecs.innerHTML = '';
  infoPanel.classList.add('visible');
  setTimeout(() => {
    if (infoPanel.classList.contains('visible')) {
      infoPanel.classList.remove('visible');
    }
  }, 5000);
}

// ============================================================
// SCENE SWITCHING
// ============================================================
function switchToScene(index, animate = true) {
  currentScene = index;
  const product = products[index];

  // Reset explode for previous scene
  if (isExploded && products[index].explodeFn) {
    // close previous explode
  }
  if (isExploded && !product.hasExplode) {
    isExploded = false;
    btnExplode.classList.remove('active');
  }

  // Update info panel
  infoTitle.textContent = product.title;
  infoDesc.textContent = product.desc;
  infoSpecs.innerHTML = product.specs.map(s => `<span class="spec-badge">${s}</span>`).join('');
  infoPanel.classList.add('visible');
  setTimeout(() => infoPanel.classList.remove('visible'), 6000);

  // Update hotspots
  createHotspots(index);

  // Update scene tabs
  sceneTabs.forEach(t => t.classList.toggle('active', parseInt(t.dataset.scene) === index));

  // Camera animation
  if (animate) {
    gsap.to(controls.target, {
      x: product.camTarget.x, y: product.camTarget.y, z: product.camTarget.z,
      duration: 1.5, ease: 'power2.inOut',
    });
    gsap.to(camera.position, {
      x: product.camPos.x, y: product.camPos.y, z: product.camPos.z,
      duration: 1.5, ease: 'power2.inOut',
    });
  }

  // Update explode button visibility
  btnExplode.style.display = product.hasExplode ? 'flex' : 'none';

  // Highlight product with subtle glow
  products.forEach((p, i) => {
    p.group.children.forEach(child => {
      if (child.isMesh && child.material.emissiveIntensity !== undefined && !child.name?.includes('Q.SAFE') && !child.name?.includes('Rozet')) {
        gsap.to(child.material, { emissiveIntensity: i === index ? 0.15 : 0, duration: 0.8 });
      }
    });
  });
}

// ============================================================
// DEMO TOUR (GSAP Timeline)
// ============================================================
let tourTimeline = null;
let isTourPlaying = false;

function createTour() {
  if (tourTimeline) tourTimeline.kill();
  tourTimeline = gsap.timeline({ paused: true,
    onStart: () => { isTourPlaying = true; btnAutoplay.classList.add('active'); },
    onComplete: () => { isTourPlaying = false; btnAutoplay.classList.remove('active'); },
  });

  // Scene 0: Q.SAFE — orbit around
  tourTimeline.call(() => switchToScene(0, false), null, 0);
  tourTimeline.to(camera.position, { x: 0, y: 1.5, z: 3.5, duration: 2, ease: 'power2.inOut' }, 0);
  tourTimeline.to(controls.target, { x: 0, y: 0.4, z: 0, duration: 2, ease: 'power2.inOut' }, 0);
  // Connect animation
  tourTimeline.call(() => toggleQSafeExplode(true), null, 2.5);
  tourTimeline.call(() => toggleQSafeExplode(false), null, 4.5);

  // Scene 1: Hose — reveal cross-section
  tourTimeline.call(() => switchToScene(1, false), null, 5.5);
  tourTimeline.to(camera.position, { x: 5.5, y: 2.5, z: 3.5, duration: 2, ease: 'power2.inOut' }, 5.5);
  tourTimeline.to(controls.target, { x: 5.5, y: 0.1, z: 0.5, duration: 2, ease: 'power2.inOut' }, 5.5);
  tourTimeline.call(() => toggleHoseExplode(true), null, 8);
  tourTimeline.call(() => toggleHoseExplode(false), null, 10.5);

  // Scene 2: Integrated — zoom to fitting detail
  tourTimeline.call(() => switchToScene(2, false), null, 11.5);
  tourTimeline.to(camera.position, { x: -5.5, y: 1.5, z: 2.5, duration: 2, ease: 'power2.inOut' }, 11.5);
  tourTimeline.to(controls.target, { x: -5.5, y: 0.2, z: 1.2, duration: 2, ease: 'power2.inOut' }, 11.5);

  // Return to overview
  tourTimeline.call(() => switchToScene(0, false), null, 14);
  tourTimeline.to(camera.position, { x: 0, y: 2.5, z: 9, duration: 2.5, ease: 'power2.inOut' }, 14);
  tourTimeline.to(controls.target, { x: 0, y: 0.3, z: 0, duration: 2.5, ease: 'power2.inOut' }, 14);

  return tourTimeline;
}

function playTour() {
  if (!tourTimeline) tourTimeline = createTour();
  if (isTourPlaying) {
    tourTimeline.pause();
    isTourPlaying = false;
    btnAutoplay.classList.remove('active');
  } else {
    tourTimeline.restart();
  }
}

// ============================================================
// UI EVENT HANDLERS
// ============================================================
sceneTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = parseInt(tab.dataset.scene);
    if (idx !== currentScene) switchToScene(idx);
  });
});

enviroBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const env = btn.dataset.env;
    if (env === 'reset') applyEnvironment('normal');
    else applyEnvironment(env);
  });
});

btnExplode.addEventListener('click', () => {
  const product = products[currentScene];
  if (!product.hasExplode || !product.explodeFn) return;
  product.explodeFn();
  isExploded = !isExploded;
  btnExplode.classList.toggle('active', isExploded);
});

btnAutoplay.addEventListener('click', playTour);
btnReset.addEventListener('click', () => {
  if (isTourPlaying) { tourTimeline.pause(); isTourPlaying = false; btnAutoplay.classList.remove('active'); }
  if (isExploded && products[currentScene].explodeFn) {
    products[currentScene].explodeFn(false);
    isExploded = false;
    btnExplode.classList.remove('active');
  }
  applyEnvironment('normal');
  switchToScene(0, true);
});

// Keyboard
window.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case '1': switchToScene(0); break;
    case '2': switchToScene(1); break;
    case '3': switchToScene(2); break;
    case 'e':
      if (products[currentScene].hasExplode && products[currentScene].explodeFn) {
        products[currentScene].explodeFn();
        isExploded = !isExploded;
        btnExplode.classList.toggle('active', isExploded);
      }
      break;
    case ' ': e.preventDefault(); playTour(); break;
    case 'r': btnReset.click(); break;
  }
});

// ============================================================
// ANIMATION LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  controls.update();
  updateHotspotPositions();

  // Animate certification badge
  badgeMesh.rotation.y += dt * 0.8;
  badgeMesh.rotation.x += dt * 0.3;
  badgeMesh.position.y = fitCurve.getPointAt(0.5).y + 0.4 + Math.sin(Date.now() * 0.002) * 0.1;

  // Label ring pulse
  labelRing.material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.003) * 0.3;

  // Snow particle animation
  const snowSys = scene.getObjectByName('snow-system');
  if (snowSys && snowSys.children[0]) {
    snowSys.children[0].rotation.y += dt * 0.1;
    snowSys.children[0].position.y -= dt * 0.4;
    if (snowSys.children[0].position.y < -4) snowSys.children[0].position.y = 8;
  }

  // Subtle particle drift
  particles.rotation.y += dt * 0.03;

  composer.render();
}

// ============================================================
// INIT & START
// ============================================================
function initCertBadges() {
  badgeContainer.innerHTML = `
    <div class="badge-item"><span class="badge-dot msha"></span>MSHA</div>
    <div class="badge-item"><span class="badge-dot api"></span>API Q1</div>
  `;
}

initCertBadges();
switchToScene(0, false); // Setup first scene without animation
controls.target.set(0, 0.3, 0);
camera.position.set(0, 2.5, 9);
controls.update();
tourTimeline = createTour();

// Hide loading
setTimeout(() => {
  loadingEl.classList.add('hidden');
  // Auto-play tour after load
  setTimeout(() => playTour(), 1000);
}, 1500);

// Start
animate();

// ============================================================
// RESIZE
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

console.log('⟁ Manuli Hydraulics 3D Deneyimi hazır.');
console.log('   1/2/3: Sahneler arası geçiş | E: Kesit/Patlat | Space: Demo Turu');
console.log('   ❄️🔥🌊: Çevre simülasyonları aktif');
