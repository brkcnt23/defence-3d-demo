// ============================================================
// Savunma Sanayii 3D Demo - Fiber Optik Askeri Kablo
// Three.js + Theatre.js + GSAP + Sci-Fi HUD
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import studio from '@theatre/studio';
import { getProject, types } from '@theatre/core';
import { createF16, disposeF16, f16Explode, f16DemoCameras, updateF16 } from './f16.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ============================================================
// DOM REFS
// ============================================================
const loadingEl = document.getElementById('loading');
const btnDemo = document.getElementById('btn-demo');
const btnExplode = document.getElementById('btn-explode');
const btnReset = document.getElementById('btn-reset');

// Sci-Fi HUD refs
const elSignal = document.getElementById('data-signal');
const elThroughput = document.getElementById('data-throughput');
const elLatency = document.getElementById('data-latency');
const elIntegrity = document.getElementById('data-integrity');
const elTemp = document.getElementById('data-temp');
const elQuality = document.getElementById('data-quality');
const elClockTime = document.getElementById('clock-time');
const elClockDate = document.getElementById('clock-date');
const waveformCanvas = document.getElementById('waveform-canvas');
const notificationContainer = document.getElementById('notification-container');
const hotspotCard = document.getElementById('hotspot-card');
const hotspotTitle = document.getElementById('hotspot-title');
const hotspotBody = document.getElementById('hotspot-body');
const hotspotSpecs = document.getElementById('hotspot-specs');
const hotspotClose = document.getElementById('hotspot-close');
const btnModelCable = document.getElementById('btn-model-cable');
const btnModelF16 = document.getElementById('btn-model-f16');

// Model state
let activeModel = 'cable'; // 'cable' | 'f16'
let f16Group = null;
let cableGroup = null;
let isF16Exploded = false;

// HUD element refs for updating
const hudProductValue = document.querySelector('#hud-product .hud-value');
const hudProductSubtitle = document.querySelector('#hud-product .hud-subtitle');
const hudSpecsContainer = document.getElementById('hud-specs');
const panelLeftHeader = document.querySelector('#panel-left .panel-header');
const panelRightHeader = document.querySelector('#panel-right .panel-header');

// ============================================================
// SCENE, CAMERA, RENDERER
// ============================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a18);
scene.fog = new THREE.Fog(0x0a0a18, 8, 35);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('app').appendChild(renderer.domElement);

// ============================================================
// POST-PROCESSING
// ============================================================
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.5,   // strength
  0.4,   // radius
  0.85   // threshold
);
composer.addPass(bloomPass);

// ============================================================
// LIGHTING
// ============================================================
const ambient = new THREE.AmbientLight(0x1a2a44, 0.6);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffeedd, 4);
keyLight.position.set(8, 6, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 40;
keyLight.shadow.camera.left = -8;
keyLight.shadow.camera.right = 8;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -8;
keyLight.shadow.bias = -0.0001;
keyLight.shadow.normalBias = 0.02;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x4488cc, 2.5);
rimLight.position.set(-4, 2, -6);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x334466, 1.5);
fillLight.position.set(0, -1, 2);
scene.add(fillLight);

const spotLight = new THREE.SpotLight(0xffaa44, 8, 12, Math.PI / 6, 0.3, 0.5);
spotLight.position.set(5, 1.5, 3);
spotLight.target.position.set(4.2, 0, 0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLight2 = new THREE.SpotLight(0xffaa44, 8, 12, Math.PI / 6, 0.3, 0.5);
spotLight2.position.set(-5, 1.5, 3);
spotLight2.target.position.set(-4.2, 0, 0);
scene.add(spotLight2);
scene.add(spotLight2.target);

// ============================================================
// ENVIRONMENT
// ============================================================
const groundGeo = new THREE.PlaneGeometry(40, 40);
const groundMat = new THREE.MeshStandardMaterial({
  color: 0x111122,
  roughness: 0.95,
  metalness: 0.05,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.PolarGridHelper(12, 64, 32, 64, 0x222244, 0x222244);
gridHelper.position.y = -2.49;
scene.add(gridHelper);

const particlesGeo = new THREE.BufferGeometry();
const particlesCount = 200;
const posArray = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i += 3) {
  posArray[i] = (Math.random() - 0.5) * 20;
  posArray[i + 1] = Math.random() * 8 - 2;
  posArray[i + 2] = (Math.random() - 0.5) * 15;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({
  size: 0.015,
  color: 0x4488cc,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(particlesGeo, particlesMat);
scene.add(particles);

// ============================================================
// CABLE GROUP — All cable parts go here for show/hide switching
// ============================================================
cableGroup = new THREE.Group();
cableGroup.name = 'CableGroup';
scene.add(cableGroup);

// ============================================================
// CABLE ASSEMBLY
// ============================================================
const cablePathPoints = [
  new THREE.Vector3(-4.5, 0.0, 0.1),
  new THREE.Vector3(-3.5, 0.3, 0.5),
  new THREE.Vector3(-2.0, -0.15, -0.3),
  new THREE.Vector3(-0.5, 0.2, 0.2),
  new THREE.Vector3(0.5, -0.2, -0.15),
  new THREE.Vector3(2.0, 0.15, 0.3),
  new THREE.Vector3(3.5, -0.3, -0.4),
  new THREE.Vector3(4.5, 0.0, -0.1),
];
const cableCurve = new THREE.CatmullRomCurve3(cablePathPoints, false, 'catmullrom', 0.5);

function getCablePoint(t) {
  return cableCurve.getPointAt(t);
}

// --- Cable Jacket ---
const jacketGeo = new THREE.TubeGeometry(cableCurve, 200, 0.13, 24, false);
const jacketMat = new THREE.MeshStandardMaterial({
  color: 0x2d3a1e,
  roughness: 0.65,
  metalness: 0.05,
});
const jacket = new THREE.Mesh(jacketGeo, jacketMat);
jacket.castShadow = true;
jacket.receiveShadow = true;
jacket.name = 'Kablo Kılıfı';
cableGroup.add(jacket);

// --- Inner Kevlar layer ---
const innerGeo = new THREE.TubeGeometry(cableCurve, 200, 0.10, 16, false);
const innerMat = new THREE.MeshStandardMaterial({
  color: 0x3a3a30,
  roughness: 0.8,
  metalness: 0.0,
});
const innerLayer = new THREE.Mesh(innerGeo, innerMat);
innerLayer.castShadow = true;
innerLayer.name = 'Kevlar Katman';
cableGroup.add(innerLayer);

// --- Fiber cores ---
const fiberColors = [0x3b82f6, 0xf59e0b, 0x10b981, 0xef4444, 0x8b5cf6, 0xec4899];
const fiberStrands = [];
const fiberOffsetAngles = [0, 60, 120, 180, 240, 300];

fiberOffsetAngles.forEach((angle, i) => {
  const rad = THREE.MathUtils.degToRad(angle);
  const offsetPoints = cablePathPoints.map(p => {
    return new THREE.Vector3(
      p.x + Math.cos(rad) * 0.03,
      p.y + Math.sin(rad) * 0.03,
      p.z + Math.cos(rad + 1) * 0.03
    );
  });
  const fiberCurve = new THREE.CatmullRomCurve3(offsetPoints, false, 'catmullrom', 0.5);
  const fiberGeo = new THREE.TubeGeometry(fiberCurve, 150, 0.018, 8, false);
  const fiberMat = new THREE.MeshStandardMaterial({
    color: fiberColors[i],
    roughness: 0.3,
    metalness: 0.1,
    emissive: fiberColors[i],
    emissiveIntensity: 0.2,
  });
  const fiber = new THREE.Mesh(fiberGeo, fiberMat);
  fiber.name = `Fiber ${i + 1}`;
  fiber.castShadow = true;
  fiberStrands.push(fiber);
  cableGroup.add(fiber);
});

// --- Connector Groups ---
function createConnector(position, tangent, isLeft) {
  const group = new THREE.Group();
  group.position.copy(position);

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent.normalize());
  group.setRotationFromQuaternion(quat);

  // Strain relief boot
  const bootGeo = new THREE.CylinderGeometry(0.16, 0.13, 0.6, 24);
  const bootMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.85,
    metalness: 0.0,
  });
  const boot = new THREE.Mesh(bootGeo, bootMat);
  boot.position.x = isLeft ? -0.1 : 0.1;
  boot.rotation.z = Math.PI / 2;
  boot.castShadow = true;
  boot.receiveShadow = true;
  boot.name = 'Strain Relief';
  group.add(boot);

  // Connector body
  const bodyGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 32);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c8,
    roughness: 0.25,
    metalness: 0.9,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.x = isLeft ? -0.8 : 0.8;
  body.rotation.z = Math.PI / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  body.name = 'Konnektör Gövde';
  group.add(body);

  // Knurled rings
  const ringGeo = new THREE.TorusGeometry(0.16, 0.025, 16, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x888890,
    roughness: 0.3,
    metalness: 0.85,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.x = isLeft ? -0.4 : 0.4;
  ring.rotation.y = Math.PI / 2;
  ring.castShadow = true;
  ring.name = 'Tırtıllı Halka';
  group.add(ring);

  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring2.position.x = isLeft ? -0.15 : 0.15;
  ring2.rotation.y = Math.PI / 2;
  ring2.castShadow = true;
  group.add(ring2);

  // Ferrule tip
  const tipGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.3, 24);
  const tipMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    roughness: 0.2,
    metalness: 0.95,
  });
  const tip = new THREE.Mesh(tipGeo, tipMat);
  tip.position.x = isLeft ? -1.5 : 1.5;
  tip.rotation.z = Math.PI / 2;
  tip.castShadow = true;
  tip.name = 'Ferrule Uç';
  group.add(tip);

  // Connector cap
  const capGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.25, 32);
  const capMat = new THREE.MeshStandardMaterial({
    color: 0xd0d0d8,
    roughness: 0.2,
    metalness: 0.9,
  });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.x = isLeft ? -0.5 : 0.5;
  cap.rotation.z = Math.PI / 2;
  cap.castShadow = true;
  cap.receiveShadow = true;
  cap.name = 'Konnektör Kapak';
  group.add(cap);

  return group;
}

const startPoint = getCablePoint(0);
const startTangent = cableCurve.getTangentAt(0);
const endPoint = getCablePoint(1);
const endTangent = cableCurve.getTangentAt(1);

const leftConnector = createConnector(startPoint, startTangent.clone().multiplyScalar(-1), true);
const rightConnector = createConnector(endPoint, endTangent, false);

leftConnector.name = 'Sol Konnektör';
rightConnector.name = 'Sağ Konnektör';

cableGroup.add(leftConnector);
cableGroup.add(rightConnector);

const connectorData = {
  left: { group: leftConnector, originalPos: startPoint.clone() },
  right: { group: rightConnector, originalPos: endPoint.clone() },
};

// ============================================================
// 3D HOLOGRAM PANELS — Canvas-textured planes in 3D space
// ============================================================

/**
 * Draw a sci-fi holographic info panel onto a canvas.
 * Returns a CanvasTexture ready for use on a PlaneGeometry.
 */
function createHologramTexture(title, subtitle, specs, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const W = width;
  const H = height;

  // --- Dark semi-transparent glass background ---
  ctx.fillStyle = 'rgba(0, 8, 24, 0.88)';
  ctx.fillRect(0, 0, W, H);

  // --- Cyan border with glow ---
  ctx.strokeStyle = 'rgba(0, 170, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0, 170, 255, 0.5)';
  ctx.shadowBlur = 8;
  ctx.strokeRect(8, 8, W - 16, H - 16);
  ctx.shadowBlur = 0;

  // --- Inner subtle border ---
  ctx.strokeStyle = 'rgba(0, 170, 255, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  // --- Corner accent lines ---
  const cornerLen = 18;
  ctx.strokeStyle = '#0af';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#0af';
  ctx.shadowBlur = 6;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(8, 8 + cornerLen);
  ctx.lineTo(8, 8);
  ctx.lineTo(8 + cornerLen, 8);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(W - 8 - cornerLen, 8);
  ctx.lineTo(W - 8, 8);
  ctx.lineTo(W - 8, 8 + cornerLen);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(8, H - 8 - cornerLen);
  ctx.lineTo(8, H - 8);
  ctx.lineTo(8 + cornerLen, H - 8);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(W - 8 - cornerLen, H - 8);
  ctx.lineTo(W - 8, H - 8);
  ctx.lineTo(W - 8, H - 8 - cornerLen);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // --- Scanlines ---
  ctx.fillStyle = 'rgba(0, 170, 255, 0.015)';
  for (let y = 16; y < H - 16; y += 3) {
    ctx.fillRect(16, y, W - 32, 1);
  }

  // --- Header separator line ---
  const headerY = 48;
  ctx.strokeStyle = 'rgba(0, 170, 255, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(20, headerY);
  ctx.lineTo(W - 20, headerY);
  ctx.stroke();

  // --- TITLE ---
  ctx.fillStyle = '#0af';
  ctx.font = 'bold 14px "Orbitron", "Rajdhani", sans-serif';
  ctx.shadowColor = 'rgba(0, 170, 255, 0.5)';
  ctx.shadowBlur = 8;
  ctx.fillText('◆', 20, 32);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#cceeff';
  ctx.font = 'bold 13px "Orbitron", "Rajdhani", sans-serif';
  ctx.fillText(title, 40, 34);

  // --- SUBTITLE ---
  ctx.fillStyle = 'rgba(160, 200, 230, 0.6)';
  ctx.font = '9px "Share Tech Mono", monospace';
  if (subtitle) {
    ctx.fillText(subtitle, 20, 65);
  }

  // --- BODY TEXT ---
  const bodyStartY = subtitle ? 88 : 65;
  ctx.fillStyle = 'rgba(200, 220, 240, 0.85)';
  ctx.font = '11px "Inter", "Segoe UI", sans-serif';

  // Word wrap for body
  const words = (specs && specs.body) ? specs.body.split(' ') : [];
  let line = '';
  let lineY = bodyStartY;
  const maxWidth = W - 40;
  const lineHeight = 16;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), 20, lineY);
      line = word + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), 20, lineY);
    lineY += lineHeight + 6;
  }

  // --- SPEC BADGES ---
  if (specs && specs.tags) {
    let badgeX = 20;
    let badgeY = Math.max(lineY + 4, H - 28);
    ctx.font = '8px "Share Tech Mono", monospace';
    for (const tag of specs.tags) {
      const tagW = ctx.measureText(tag).width + 14;
      if (badgeX + tagW > W - 16) {
        badgeX = 20;
        badgeY -= 18;
      }
      // Badge background
      ctx.fillStyle = 'rgba(0, 170, 255, 0.08)';
      ctx.strokeStyle = 'rgba(0, 170, 255, 0.2)';
      ctx.lineWidth = 0.5;
      // Manual rounded rect
      const rx = 3, ry = 3;
      const bx = badgeX, by = badgeY - 10, bw = tagW, bh = 16;
      ctx.beginPath();
      ctx.moveTo(bx + rx, by);
      ctx.lineTo(bx + bw - rx, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + ry);
      ctx.lineTo(bx + bw, by + bh - ry);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - rx, by + bh);
      ctx.lineTo(bx + rx, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - ry);
      ctx.lineTo(bx, by + ry);
      ctx.quadraticCurveTo(bx, by, bx + rx, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Badge text
      ctx.fillStyle = 'rgba(180, 210, 240, 0.8)';
      ctx.fillText(tag, badgeX + 7, badgeY + 1);
      badgeX += tagW + 6;
    }
  }

  // --- Bottom accent line ---
  const accentY = H - 14;
  ctx.strokeStyle = 'rgba(0, 170, 255, 0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(20, accentY);
  ctx.lineTo(W - 20, accentY);
  ctx.stroke();

  // --- Small diamond at bottom center ---
  ctx.fillStyle = '#0af';
  ctx.font = '6px sans-serif';
  ctx.fillText('◆', W / 2 - 4, accentY + 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Create a holographic anchor line (thin glowing cylinder)
 * from one point to another.
 */
function createAnchorLine(from, to) {
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();

  const geo = new THREE.CylinderGeometry(0.008, 0.008, len, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.35,
    depthTest: true,
    depthWrite: false,
  });
  const line = new THREE.Mesh(geo, mat);
  line.position.copy(mid);
  line.name = 'anchorLine'; // mark for billboarding skip
  line.userData.baseLen = len; // store for later scale updates

  // Orient cylinder along direction
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  line.setRotationFromQuaternion(quat);

  return line;
}

/**
 * Update an existing anchor line's position and scale to match new endpoints.
 * Avoids geometry/material churn in the render loop.
 */
function updateAnchorLine(line, from, to) {
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();

  line.position.copy(mid);
  // Adjust Y-scale for length change (cylinder base height is stored in userData)
  line.scale.set(1, len / (line.userData.baseLen || len), 1);

  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  line.setRotationFromQuaternion(quat);
}

/**
 * Create a complete hologram panel in 3D space.
 * Returns { group, panel, glow, line, anchorPos } for animation.
 */
function createHologramPanel(anchorPos, title, subtitle, specData, panelW, panelH, offsetY) {
  const group = new THREE.Group();

  // --- Anchor point (on the cable) ---
  group.position.copy(anchorPos);
  const anchorWorld = anchorPos.clone();

  // --- Panel plane (positioned above/below anchor) ---
  const panelGeo = new THREE.PlaneGeometry(panelW, panelH);
  const texture = createHologramTexture(title, subtitle, specData, 512, Math.round(512 * (panelH / panelW)));
  const panelMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: false,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.y = offsetY;
  panel.name = title;
  panel.renderOrder = 1;
  group.add(panel);

  // --- Glow plane (slightly larger, additive, behind main panel) ---
  const glowGeo = new THREE.PlaneGeometry(panelW * 1.15, panelH * 1.15);

  // Create a simple glow texture
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const gctx = glowCanvas.getContext('2d');
  const glowGrad = gctx.createRadialGradient(32, 32, 10, 32, 32, 40);
  glowGrad.addColorStop(0, 'rgba(0, 170, 255, 0.3)');
  glowGrad.addColorStop(0.5, 'rgba(0, 170, 255, 0.08)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  gctx.fillStyle = glowGrad;
  gctx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(glowCanvas);

  const glowMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthTest: true,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.y = offsetY - 0.01;
  glow.renderOrder = 0;
  group.add(glow);

  // --- Anchor line from anchor point to panel ---
  const lineFrom = new THREE.Vector3(0, 0, 0); // local origin = anchor
  const lineTo = new THREE.Vector3(0, offsetY - panelH / 2, 0);
  const anchorLine = createAnchorLine(lineFrom, lineTo);
  group.add(anchorLine);

  // Store metadata for animation
  group.userData = {
    anchorPos: anchorWorld,
    offsetY: offsetY,
    baseY: offsetY,
    panel: panel,
    glow: glow,
    line: anchorLine,
  };

  cableGroup.add(group);
  return group;
}

// --- Define panel data ---
const W_PANEL = 1.6;  // world units wide
const H_PANEL = 1.0;  // world units tall

const panelData = [
  {
    anchor: getCablePoint(0.02),
    title: 'KONNEKTÖR A',
    subtitle: 'MIL-DTL-83526',
    specs: {
      body: 'Askeri standartlara uygun taktik fiber optik konnektör. Altın kaplama ferrule uç ile minimum sinyal kaybı sağlar.',
      tags: ['Ferrule: Altın', 'IP68', '-40~+85°C', 'Alüminyum'],
    },
    offsetY: 1.2,
  },
  {
    anchor: getCablePoint(0.5),
    title: 'FİBER OPTİK KABLO',
    subtitle: 'TACTICAL COMMUNICATION CORE',
    specs: {
      body: '6 bağımsız fiber kanalı, Kevlar güçlendirme ve poliüretan kılıf. Zırhlı araç içi haberleşme için optimize.',
      tags: ['6× Tek Mod', 'Kevlar Örgü', '2000N Çekme', 'PU Kılıf'],
    },
    offsetY: 1.4,
  },
  {
    anchor: getCablePoint(0.98),
    title: 'KONNEKTÖR B',
    subtitle: 'EXPANDED BEAM',
    specs: {
      body: 'Genişletilmiş ışın teknolojisi ile toz ve kirden etkilenmez. Kör eşleştirme mekanizması, 10.000+ çevrim ömrü.',
      tags: ['Exp. Beam', 'Kör Eşleştirme', '10K+ Çevrim', 'MIL-PRF-29504'],
    },
    offsetY: 1.2,
  },
];

const hologramPanels = [];

// Create hologram panels after fonts are loaded for correct text metrics
async function initHologramPanels() {
  // Wait for Google Fonts to be ready
  await document.fonts.ready;

  panelData.forEach(p => {
    const panel = createHologramPanel(p.anchor, p.title, p.subtitle, p.specs, W_PANEL, H_PANEL, p.offsetY);
    hologramPanels.push(panel);
  });

  console.log('🖥️  3D Hologram Panels: %d adet (fontlar yüklendi)', hologramPanels.length);
}

initHologramPanels();

// ============================================================
// HOTSPOT MARKERS (invisible 3D points for raycasting)
// ============================================================
const hotspotData = [
  {
    position: getCablePoint(0.02),
    title: 'KONNEKTÖR A — MIL-DTL-83526',
    body: 'Askeri standartlara uygun taktik fiber optik konnektör. Altın kaplama ferrule uç, tırtıllı kavrama halkası ve strain relief koruma botu ile sahada güvenilir bağlantı sağlar.',
    specs: ['Ferrule: Altın', 'Gövde: Alüminyum', 'IP68 Sızdırmaz', '-40°C ~ +85°C'],
  },
  {
    position: getCablePoint(0.5),
    title: 'FİBER OPTİK KABLO GÖVDESİ',
    body: 'Çok çekirdekli taktik fiber optik kablo. 6 bağımsız fiber kanalı, Kevlar güçlendirme katmanı ve poliüretan dış kılıf ile maksimum dayanıklılık. Zırhlı araç içi haberleşme sistemleri için optimize edilmiştir.',
    specs: ['6× Tek Mod Fiber', 'Kevlar Örgü', 'Poliüretan Kılıf', 'Çekme: 2000N'],
  },
  {
    position: getCablePoint(0.98),
    title: 'KONNEKTÖR B — GENİŞLETİLMİŞ IŞIN',
    body: 'Genişletilmiş ışın (expanded beam) teknolojisine sahip askeri konnektör. Toz, kir ve yağdan etkilenmez. Kör eşleştirme mekanizması ile hızlı bağlantı. 10.000+ eşleştirme ömrü.',
    specs: ['Expanded Beam', 'Kör Eşleştirme', '10K+ Çevrim', 'MIL-PRF-29504'],
  },
];

const hotspotMarkers = [];
const hotspotMarkerGeo = new THREE.SphereGeometry(0.06, 16, 16);
hotspotData.forEach((hs, i) => {
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.0,
    depthTest: false,
    depthWrite: false,
  });
  const marker = new THREE.Mesh(hotspotMarkerGeo, markerMat);
  marker.position.copy(hs.position);
  marker.name = `hotspot-${i}`;
  marker.userData = { hotspotIndex: i };
  cableGroup.add(marker);
  hotspotMarkers.push(marker);
});

// Hover glow ring for hotspots
const ringGlowGeo = new THREE.TorusGeometry(0.08, 0.015, 16, 32);
const ringGlowMat = new THREE.MeshBasicMaterial({
  color: 0x00aaff,
  transparent: true,
  opacity: 0.0,
  depthTest: false,
  depthWrite: false,
});
const ringGlow = new THREE.Mesh(ringGlowGeo, ringGlowMat);
ringGlow.visible = false;
scene.add(ringGlow);

// ============================================================
// LIGHT PULSE
// ============================================================
const pulseGroup = new THREE.Group();
scene.add(pulseGroup);

const pulseGeo = new THREE.SphereGeometry(0.04, 16, 16);
const pulseMat = new THREE.MeshStandardMaterial({
  color: 0x4da6ff,
  roughness: 0.1,
  metalness: 0.0,
  emissive: 0x4da6ff,
  emissiveIntensity: 3.0,
});
const pulse = new THREE.Mesh(pulseGeo, pulseMat);
pulseGroup.add(pulse);

const pulseLight = new THREE.PointLight(0x4da6ff, 15, 0.6);
pulseLight.position.set(0, 0, 0);
pulseGroup.add(pulseLight);

const pulse2Geo = new THREE.SphereGeometry(0.03, 12, 12);
const pulse2Mat = new THREE.MeshStandardMaterial({
  color: 0x88ccff,
  roughness: 0.1,
  metalness: 0.0,
  emissive: 0x88ccff,
  emissiveIntensity: 2.0,
});
const pulse2 = new THREE.Mesh(pulse2Geo, pulse2Mat);
pulseGroup.add(pulse2);

const pulse2Light = new THREE.PointLight(0x88ccff, 8, 0.4);
pulseGroup.add(pulse2Light);

// ============================================================
// ORBIT CONTROLS
// ============================================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.75;
controls.minPolarAngle = 0.2;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.update();

// ============================================================
// RAYCASTER — for hotspot interaction
// ============================================================
const raycaster = new THREE.Raycaster();
raycaster.params.Points.threshold = 0.1;
raycaster.params.Line = { threshold: 0.1 };
const mouse = new THREE.Vector2();
let hoveredHotspot = null;

function updateMouse(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getHotspotIntersections() {
  raycaster.setFromCamera(mouse, camera);
  // Check both cable and F-16 hotspots
  const allMarkers = [...hotspotMarkers];
  if (f16Group && f16Group.userData.hotspotMarkers) {
    allMarkers.push(...f16Group.userData.hotspotMarkers);
  }
  return raycaster.intersectObjects(allMarkers);
}

function onMouseMove(event) {
  updateMouse(event);
  const intersects = getHotspotIntersections();

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (hoveredHotspot !== obj) {
      // Leave previous
      if (hoveredHotspot) {
        hoveredHotspot.material.opacity = 0.0;
      }
      // Enter new
      hoveredHotspot = obj;
      hoveredHotspot.material.opacity = 0.6;
      ringGlow.visible = true;
      ringGlow.position.copy(obj.position);
      ringGlow.rotation.x = Math.random() * Math.PI;
      ringGlow.rotation.y = Math.random() * Math.PI;
      ringGlowMat.opacity = 0.7;
      document.body.style.cursor = 'pointer';
    }
    // Pulse the ring
    ringGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.15);
  } else if (hoveredHotspot) {
    hoveredHotspot.material.opacity = 0.0;
    hoveredHotspot = null;
    ringGlow.visible = false;
    ringGlowMat.opacity = 0.0;
    document.body.style.cursor = 'default';
  }
}

function onClick(event) {
  updateMouse(event);
  const intersects = getHotspotIntersections();
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    const idx = obj.userData.hotspotIndex;
    if (idx !== undefined) {
      // Check if it's an F-16 hotspot
      if (obj.userData.model === 'f16' && obj.userData.hotspotData) {
        showHotspotCardFromData(obj.userData.hotspotData);
      } else if (hotspotData[idx]) {
        showHotspotCard(idx);
      }
    }
  }
}

function showHotspotCardFromData(hs) {
  hotspotTitle.textContent = hs.title;
  hotspotBody.textContent = hs.body;
  hotspotSpecs.innerHTML = hs.specs.map(s => `<span class="mini-spec">${s}</span>`).join('');
  hotspotCard.classList.remove('hidden');
  controls.autoRotate = false;
}

function showHotspotCard(idx) {
  const hs = hotspotData[idx];
  hotspotTitle.textContent = hs.title;
  hotspotBody.textContent = hs.body;
  hotspotSpecs.innerHTML = hs.specs.map(s => `<span class="mini-spec">${s}</span>`).join('');
  hotspotCard.classList.remove('hidden');
  // Pause auto-rotate for readability
  controls.autoRotate = false;
}

function hideHotspotCard() {
  hotspotCard.classList.add('hidden');
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
}

hotspotClose.addEventListener('click', (e) => {
  e.stopPropagation();
  hideHotspotCard();
});

// Close card on background click
window.addEventListener('click', (e) => {
  if (!hotspotCard.classList.contains('hidden') &&
      !hotspotCard.contains(e.target) &&
      e.target !== hotspotClose) {
    // Check if it's a hotspot click (handled above)
    updateMouse(e);
    const intersects = getHotspotIntersections();
    if (intersects.length === 0) {
      hideHotspotCard();
    }
  }
});

window.addEventListener('mousemove', onMouseMove, { passive: true });
window.addEventListener('click', onClick, { passive: true });

// ============================================================
// THEATRE.JS SETUP
// ============================================================
studio.initialize();

const project = getProject('Savunma 3D Demo');
const sheet = project.sheet('Ana Sahne');

const cableObj = sheet.object('Kablo', {
  rotation: types.compound({
    y: types.number(0, { range: [-1, 1] }),
  }),
  explodeAmount: types.number(0, { range: [0, 1] }),
  pulseSpeed: types.number(1, { range: [0.1, 3] }),
});

const cameraObj = sheet.object('Kamera', {
  orbitSpeed: types.number(0.3, { range: [0, 1] }),
  distance: types.number(10, { range: [3, 18] }),
});

cableObj.onValuesChange((values) => {
  jacket.rotation.y = values.rotation.y * Math.PI;
  const explodeAmt = values.explodeAmount;
  if (connectorData.left.group) {
    const lt = startTangent.clone().multiplyScalar(-1);
    connectorData.left.group.position.copy(
      connectorData.left.originalPos.clone().add(lt.multiplyScalar(explodeAmt * 2))
    );
  }
  if (connectorData.right.group) {
    const rt = endTangent.clone();
    connectorData.right.group.position.copy(
      connectorData.right.originalPos.clone().add(rt.multiplyScalar(explodeAmt * 2))
    );
  }
});

cameraObj.onValuesChange((values) => {
  controls.autoRotateSpeed = values.orbitSpeed;
});

// ============================================================
// GSAP ANIMATION - DEMO TOUR
// ============================================================
let demoTimeline = null;
let isDemoPlaying = false;

function createDemoTour() {
  if (demoTimeline) demoTimeline.kill();

  demoTimeline = gsap.timeline({
    paused: true,
    onStart: () => {
      isDemoPlaying = true;
      btnDemo.classList.add('active');
      controls.autoRotate = false;
      addNotification('DEMO TURU BAŞLATILDI');
    },
    onComplete: () => {
      isDemoPlaying = false;
      btnDemo.classList.remove('active');
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
      addNotification('DEMO TURU TAMAMLANDI');
    },
  });

  // Phase 1: Wide establishing shot
  demoTimeline.to(camera.position, {
    x: 0, y: 4, z: 9,
    duration: 1.5,
    ease: 'power2.inOut',
  }, 0);
  demoTimeline.to(controls.target, {
    x: 0, y: 0, z: 0,
    duration: 1.5,
    ease: 'power2.inOut',
  }, 0);

  // Phase 2: Orbit to right side
  demoTimeline.to(camera.position, {
    x: 6, y: 2, z: 6,
    duration: 3,
    ease: 'power1.inOut',
  }, 2);
  demoTimeline.to(controls.target, {
    x: 2, y: 0.1, z: 0,
    duration: 3,
    ease: 'power1.inOut',
  }, 2);

  // Phase 3: Zoom to right connector detail
  demoTimeline.to(camera.position, {
    x: 5.5, y: 0.3, z: 2.5,
    duration: 2.5,
    ease: 'power2.inOut',
  }, 5.5);
  demoTimeline.to(controls.target, {
    x: 4.2, y: 0, z: -0.1,
    duration: 2.5,
    ease: 'power2.inOut',
  }, 5.5);

  // Phase 4: Pan along cable to left connector
  demoTimeline.to(camera.position, {
    x: -5.5, y: 0.3, z: 2.5,
    duration: 4,
    ease: 'power1.inOut',
  }, 8.5);
  demoTimeline.to(controls.target, {
    x: -4.2, y: 0, z: -0.1,
    duration: 4,
    ease: 'power1.inOut',
  }, 8.5);

  // Phase 5: Pull back to wide
  demoTimeline.to(camera.position, {
    x: 0, y: 3, z: 9,
    duration: 3,
    ease: 'power2.inOut',
  }, 13);
  demoTimeline.to(controls.target, {
    x: 0, y: 0, z: 0,
    duration: 3,
    ease: 'power2.inOut',
  }, 13);

  return demoTimeline;
}

function playDemoTour() {
  // F-16 demo tour
  if (activeModel === 'f16') {
    if (demoTimeline) { demoTimeline.kill(); demoTimeline = null; }
    isDemoPlaying = true;
    btnDemo.classList.add('active');
    controls.autoRotate = false;
    addNotification('F-16 DEMO TURU BAŞLATILDI');

    const cameras = f16DemoCameras();
    demoTimeline = gsap.timeline({
      onComplete: () => {
        isDemoPlaying = false;
        btnDemo.classList.remove('active');
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        addNotification('F-16 DEMO TURU TAMAMLANDI');
      },
    });

    let timeOffset = 0;
    cameras.forEach(cam => {
      demoTimeline.to(camera.position, {
        x: cam.pos.x, y: cam.pos.y, z: cam.pos.z,
        duration: cam.duration,
        ease: 'power2.inOut',
      }, timeOffset);
      demoTimeline.to(controls.target, {
        x: cam.target.x, y: cam.target.y, z: cam.target.z,
        duration: cam.duration,
        ease: 'power2.inOut',
      }, timeOffset);
      timeOffset += cam.duration + 0.3;
    });
    return;
  }

  // Cable demo tour (original)
  if (!demoTimeline) demoTimeline = createDemoTour();
  demoTimeline.restart();
}

function stopDemoTour() {
  if (demoTimeline && demoTimeline.isActive()) {
    demoTimeline.pause();
    isDemoPlaying = false;
    btnDemo.classList.remove('active');
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;
    addNotification('DEMO DURAKLATILDI');
  }
}

// ============================================================
// EXPLODE VIEW
// ============================================================
let isExploded = false;

function toggleExplode() {
  // A-7 Corsair: Patlat = HER MESH'I MERKEZDEN DIŞA DAĞIT
  if (activeModel === 'f16' && f16Group && f16Group.userData.modelLoaded) {
    isF16Exploded = !isF16Exploded;
    const nodes = f16Group.userData.allNodes;
    if (!nodes || !nodes.length) { btnExplode.classList.remove('active'); return; }

    if (isF16Exploded) {
      nodes.forEach((n, i) => {
        const orig = n.origPos;
        const dist = orig.length(); // how far from center originally
        const dir = orig.clone().normalize();
        // Push outward: multiply original distance by 2-3x plus random spread
        const spread = 2.5 + Math.random() * 1.5;
        const target = dir.multiplyScalar(dist * spread + 1.5);
        gsap.to(n.ref.position, {
          x: target.x, y: target.y, z: target.z,
          duration: 0.7 + Math.random() * 0.4,
          ease: 'power2.out',
          delay: Math.random() * 0.2,
        });
        // Slight random rotation
        gsap.to(n.ref.rotation, {
          x: n.origRot.x + (Math.random() - 0.5) * 1.5,
          y: n.origRot.y + (Math.random() - 0.5) * 1.5,
          z: n.origRot.z + (Math.random() - 0.5) * 1.5,
          duration: 0.7, ease: 'power2.out', delay: Math.random() * 0.15,
        });
      });
      addNotification(`PARÇALANDI: ${nodes.length} parça dağıtıldı`);
    } else {
      // RESET: all nodes back to original positions
      nodes.forEach((n, i) => {
        gsap.to(n.ref.position, {
          x: n.origPos.x, y: n.origPos.y, z: n.origPos.z,
          duration: 0.55, ease: 'power2.in', delay: Math.random() * 0.1,
        });
        gsap.to(n.ref.rotation, {
          x: n.origRot.x, y: n.origRot.y, z: n.origRot.z,
          duration: 0.5, ease: 'power2.in', delay: Math.random() * 0.08,
        });
      });
      addNotification('PARÇALAR BİRLEŞTİ');
    }
    btnExplode.classList.toggle('active', isF16Exploded);
    return;
  }

  // Cable explode mode (original)
  isExploded = !isExploded;

  const targetAmt = isExploded ? 1 : 0;
  gsap.to({ val: isExploded ? 0 : 1 }, {
    val: targetAmt,
    duration: 1.2,
    ease: 'power3.inOut',
    onUpdate: function () {
      const amt = this.targets()[0].val;
      const lt = startTangent.clone().multiplyScalar(-1);
      connectorData.left.group.position.copy(
        connectorData.left.originalPos.clone().add(lt.multiplyScalar(amt * 2.5))
      );
      const rt = endTangent.clone();
      connectorData.right.group.position.copy(
        connectorData.right.originalPos.clone().add(rt.multiplyScalar(amt * 2.5))
      );
    },
  });

  btnExplode.classList.toggle('active', isExploded);
  if (isExploded) {
    addNotification('PARÇA GÖRÜNÜMÜ: AÇIK');
  } else {
    addNotification('PARÇA GÖRÜNÜMÜ: KAPALI');
  }
}

function resetView() {
  // Reset F-16 explode if active
  if (activeModel === 'f16' && isF16Exploded) {
    isF16Exploded = true;
    toggleExplode();
  } else if (activeModel === 'cable' && isExploded) {
    isExploded = true;
    toggleExplode();
  }
  stopDemoTour();
  gsap.to(camera.position, {
    x: 0, y: 2.5, z: 10,
    duration: 1.2,
    ease: 'power3.inOut',
  });
  gsap.to(controls.target, {
    x: 0, y: 0, z: 0,
    duration: 1.2,
    ease: 'power3.inOut',
  });
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  btnExplode.classList.remove('active');
  addNotification('GÖRÜNÜM SIFIRLANDI');
}

// ============================================================
// MODEL SWITCHING
// ============================================================
function updateHUDForModel(model) {
  if (model === 'cable') {
    hudProductValue.textContent = 'Askeri Fiber Optik Kablo Sistemi';
    hudProductSubtitle.textContent = 'MIL-SPEC TACTICAL COMMUNICATION';
    hudSpecsContainer.innerHTML = `
      <div class="spec-item"><div class="spec-label">Tip</div><div class="spec-value">Çok Çekirdekli Taktik Fiber</div></div>
      <div class="spec-item"><div class="spec-label">Koruma</div><div class="spec-value">Kevlar + Poliüretan Kılıf</div></div>
      <div class="spec-item"><div class="spec-label">Konnektör</div><div class="spec-value">MIL-DTL-83526</div></div>
      <div class="spec-item"><div class="spec-label">Standard</div><div class="spec-value">ITU-T G.652.D</div></div>`;
    panelLeftHeader.innerHTML = '<span class="panel-diamond">◆</span><span>SİSTEM VERİLERİ</span><span class="panel-line"></span>';
    panelRightHeader.innerHTML = '<span class="panel-diamond">◆</span><span>DİYAGNOSTİK</span><span class="panel-line"></span>';
  } else {
    hudProductValue.textContent = 'A-7E Corsair II';
    hudProductSubtitle.textContent = 'LTV ATTACK AIRCRAFT • CARRIER-BASED';
    hudSpecsContainer.innerHTML = `
      <div class="spec-item"><div class="spec-label">Motor</div><div class="spec-value">TF41-A-2 Turbofan</div></div>
      <div class="spec-item"><div class="spec-label">Silah</div><div class="spec-value">6 Hardpoint • 6,800 kg</div></div>
      <div class="spec-item"><div class="spec-label">Mürettebat</div><div class="spec-value">1 Pilot</div></div>
      <div class="spec-item"><div class="spec-label">Hız</div><div class="spec-value">1,123 km/h</div></div>`;
    panelLeftHeader.innerHTML = '<span class="panel-diamond">◆</span><span>UÇUŞ VERİLERİ</span><span class="panel-line"></span>';
    panelRightHeader.innerHTML = '<span class="panel-diamond">◆</span><span>SİLAH SİSTEMLERİ</span><span class="panel-line"></span>';
  }
}

function switchModel(target) {
  if (activeModel === target) return;
  activeModel = target;

  // Reset any active animations/explode states
  if (isExploded) toggleExplode();
  if (isDemoPlaying) stopDemoTour();

  if (target === 'cable') {
    cableGroup.visible = true;
    if (f16Group) f16Group.visible = false;
    btnModelCable.classList.add('active');
    btnModelF16.classList.remove('active');
    updateHUDForModel('cable');
    const leftPanelFooter = document.querySelector('#panel-left .panel-footer');
    const rightPanelFooter = document.querySelector('#panel-right .panel-footer');
    if (leftPanelFooter) leftPanelFooter.innerHTML = '<span class="panel-dot"></span> AKTİF';
    if (rightPanelFooter) rightPanelFooter.innerHTML = '<span class="panel-dot pulse"></span> CANLI';
    addNotification('FİBER OPTİK KABLO SEÇİLDİ');
  } else {
    cableGroup.visible = false;
    if (!f16Group) {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);

      addNotification('A-7 CORSAIR II YÜKLENİYOR...');
      loadingEl.classList.remove('hidden');

      gltfLoader.load('/A7_Corsair_II_opt.glb',
        (gltf) => {
          f16Group = gltf.scene;
          f16Group.name = 'A7_Corsair_II';
          f16Group.scale.set(0.4, 0.4, 0.4);
          f16Group.position.set(0, -0.3, 0);
          f16Group.rotation.y = Math.PI;
          scene.add(f16Group);

          // Store ALL child nodes with their original positions for explode
          const ud = f16Group.userData;
          ud.modelLoaded = true;
          ud.flapsLeft = f16Group.getObjectByName('MAIN WING FUSELAGE FLAP ARR_Left');
          ud.flapsRight = f16Group.getObjectByName('MAIN WING FUSELAGE FLAP ARR_Right');
          ud.tailRudder = f16Group.getObjectByName('TAIL rudder');
          ud.allNodes = [];
          f16Group.traverse((child) => {
            if (child !== f16Group && child.isMesh) {
              ud.allNodes.push({
                ref: child,
                origPos: child.position.clone(),
                origRot: child.rotation.clone(),
                origScale: child.scale.clone(),
              });
            }
          });
          console.log('   Patlatilabilir parca:', ud.allNodes.length, 'mesh');

          f16Group.visible = true;
          loadingEl.classList.add('hidden');
          btnModelCable.classList.remove('active');
          btnModelF16.classList.add('active');
          updateHUDForModel('f16');
          const lpf = document.querySelector('#panel-left .panel-footer');
          const rpf = document.querySelector('#panel-right .panel-footer');
          if (lpf) lpf.innerHTML = '<span class="panel-dot"></span> HAZIR';
          if (rpf) rpf.innerHTML = '<span class="panel-dot pulse"></span> SİLAHLI';
          console.log('✈ A-7 Corsair II yüklendi (22MB) | Patlamış görünüm hazır');
          addNotification('A-7 CORSAIR II HAZIR');
        },
        (p) => { if (Math.round(p.loaded/p.total*100) % 25 === 0) console.log(`   %${Math.round(p.loaded/p.total*100)}`); },
        (e) => { console.error('GLB hatası:', e); loadingEl.classList.add('hidden'); }
      );
      // Model async yükleniyor — UI şimdilik yükleme durumunda kalsın
      return; // geri kalan UI güncellemeleri load callback içinde
    }
    // Model zaten yüklenmiş, direkt göster
    f16Group.visible = true;
    btnModelCable.classList.remove('active');
    btnModelF16.classList.add('active');
    updateHUDForModel('f16');
    const lpf = document.querySelector('#panel-left .panel-footer');
    const rpf = document.querySelector('#panel-right .panel-footer');
    if (lpf) lpf.innerHTML = '<span class="panel-dot"></span> HAZIR';
    if (rpf) rpf.innerHTML = '<span class="panel-dot pulse"></span> SİLAHLI';
    addNotification('A-7 CORSAIR II SEÇİLDİ');
  }
}

// ============================================================
// BUTTON EVENTS
// ============================================================
btnModelCable?.addEventListener('click', () => switchModel('cable'));
btnModelF16?.addEventListener('click', () => switchModel('f16'));

btnDemo.addEventListener('click', () => {
  if (isDemoPlaying) {
    stopDemoTour();
  } else {
    playDemoTour();
  }
});

btnExplode.addEventListener('click', toggleExplode);
btnReset.addEventListener('click', resetView);

window.addEventListener('keydown', (e) => {
  // Don't trigger if user is typing in Theatre.js
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch (e.key.toLowerCase()) {
    case ' ':
      e.preventDefault();
      if (isDemoPlaying) stopDemoTour();
      else playDemoTour();
      break;
    case 'e':
      if (!e.ctrlKey && !e.metaKey) toggleExplode();
      break;
    case 'r':
      if (!e.ctrlKey && !e.metaKey) resetView();
      break;
    case 'escape':
      hideHotspotCard();
      break;
  }
});

// ============================================================
// SCI-FI HUD: LIVE DATA UPDATES
// ============================================================
function randomAround(base, range) {
  return base + (Math.random() - 0.5) * range * 2;
}

function updateLiveData() {
  if (elSignal) {
    const signal = randomAround(-10.2, 0.8);
    elSignal.textContent = `${signal.toFixed(1)} dBm`;
  }
  if (elThroughput) {
    const tp = randomAround(9.4, 0.5);
    elThroughput.textContent = `${tp.toFixed(1)} Gbps`;
  }
  if (elLatency) {
    const lat = randomAround(0.12, 0.03);
    elLatency.textContent = `${Math.max(0.06, lat).toFixed(2)} ms`;
  }
  if (elIntegrity) {
    const integ = randomAround(99.97, 0.02);
    elIntegrity.textContent = `${Math.min(99.99, Math.max(99.90, integ)).toFixed(2)}%`;
  }
  if (elTemp) {
    const temp = randomAround(34.7, 1.2);
    elTemp.textContent = `${temp.toFixed(1)}°C`;
  }
  if (elQuality) {
    const q = randomAround(98.2, 0.4);
    elQuality.textContent = `${Math.min(99.9, Math.max(97.5, q)).toFixed(1)}`;
  }
}

// ============================================================
// SCI-FI HUD: CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  if (elClockTime) {
    elClockTime.textContent = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Istanbul',
    });
  }
  if (elClockDate) {
    elClockDate.textContent = now.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Istanbul',
    });
  }
}

// ============================================================
// SCI-FI HUD: NOTIFICATIONS
// ============================================================
const notificationMessages = [
  'VERİ PAKETİ #A4F2 İLETİLDİ',
  'SİNYAL GÜCÜ OPTİMAL SEVİYEDE',
  'FİBER ÇEKİRDEK 1-6 AKTİF',
  'BAĞLANTI KALİTESİ 98.2/100',
  'BANT GENİŞLİĞİ KULLANIMI %42',
  'SICAKLIK NORMAL ARALIKTA',
  'PAKET BÜTÜNLÜĞÜ %99.97',
  'ŞİFRELİ KANAL AKTİF',
  'SENKRONİZASYON TAMAMLANDI',
  'YEDEK KANAL HAZIR',
  'MIL-SPEC PROTOKOL AKTİF',
  'DÜŞÜK GECİKME MODU',
  'HATA DÜZELTME AKTİF',
  'GÜVENLİ TÜNEL KURULDU',
];

let notificationTimeout = null;

function addNotification(message) {
  if (!notificationContainer) return;
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.textContent = message || notificationMessages[Math.floor(Math.random() * notificationMessages.length)];
  notificationContainer.appendChild(toast);

  // Auto-remove after animation
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3500);
}

function scheduleRandomNotification() {
  if (notificationTimeout) clearTimeout(notificationTimeout);
  const delay = 8000 + Math.random() * 12000; // 8-20 seconds
  notificationTimeout = setTimeout(() => {
    addNotification();
    scheduleRandomNotification();
  }, delay);
}

// ============================================================
// SCI-FI HUD: WAVEFORM ANIMATION
// ============================================================
let waveformCtx = null;
let waveformTime = 0;

function initWaveform() {
  if (!waveformCanvas) return;
  waveformCtx = waveformCanvas.getContext('2d');
}

function drawWaveform() {
  if (!waveformCtx || !waveformCanvas) return;
  const ctx = waveformCtx;
  const w = waveformCanvas.width;
  const h = waveformCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background grid lines
  ctx.strokeStyle = 'rgba(0,170,255,0.06)';
  ctx.lineWidth = 0.5;
  for (let y = 0; y < h; y += 10) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Waveform
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0,170,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = 'rgba(0,170,255,0.6)';
  ctx.shadowBlur = 6;

  for (let x = 0; x < w; x++) {
    const t = x / w;
    // Complex waveform with multiple frequencies
    const y = h / 2 +
      Math.sin(t * Math.PI * 6 + waveformTime * 0.8) * 12 +
      Math.sin(t * Math.PI * 13 + waveformTime * 1.3) * 5 +
      Math.cos(t * Math.PI * 3 + waveformTime * 0.5) * 8 +
      Math.sin(t * Math.PI * 20 + waveformTime * 2) * 2;

    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Second waveform (subtle, behind)
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0,170,255,0.15)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
  for (let x = 0; x < w; x++) {
    const t = x / w;
    const y = h / 2 +
      Math.sin(t * Math.PI * 2 + waveformTime * 0.3 + 2) * 8 +
      Math.cos(t * Math.PI * 8 + waveformTime * 0.9) * 6;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Reset shadow
  ctx.shadowBlur = 0;
}

// ============================================================
// RENDER LOOP
// ============================================================
const clock = new THREE.Clock();
let pulseT = 0;

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.1);

  controls.update();

  // Light pulse animation
  pulseT += dt * 0.25;
  if (pulseT > 1) pulseT -= 1;
  if (pulseT < 0) pulseT += 1;

  const pulsePos = getCablePoint(pulseT);
  pulse.position.copy(pulsePos);

  let trailT = pulseT - 0.08;
  if (trailT < 0) trailT += 1;
  const trailPos = getCablePoint(trailT);
  pulse2.position.copy(trailPos);

  // Particle drift
  particles.rotation.y += dt * 0.02;
  particles.rotation.x += dt * 0.01;

  // Spot lights follow connectors
  spotLight.target.position.copy(rightConnector.position);
  spotLight2.target.position.copy(leftConnector.position);

  // Hover ring animation
  if (ringGlow.visible) {
    ringGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.008) * 0.2);
    ringGlowMat.opacity = 0.5 + Math.sin(Date.now() * 0.006) * 0.3;
  }

  // --- Hologram panel animations ---
  const time = Date.now() * 0.001;

  // --- A-7 Corsair update (flap yoyo + rudder — only when aircraft visible) ---
  if (f16Group && f16Group.visible && f16Group.userData.modelLoaded && !isF16Exploded) {
    const ud = f16Group.userData;
    const flapAngle = Math.sin(time * 1.5) * 0.12;
    if (ud.flapsLeft) { ud.flapsLeft.rotation.x = flapAngle; ud.flapsLeft.rotation.z = flapAngle * 0.4; }
    if (ud.flapsRight) { ud.flapsRight.rotation.x = flapAngle; ud.flapsRight.rotation.z = -flapAngle * 0.4; }
    if (ud.flapsAvantLeft) ud.flapsAvantLeft.rotation.x = flapAngle * 0.6;
    if (ud.flapsAvantRight) ud.flapsAvantRight.rotation.x = flapAngle * 0.6;
    if (ud.tailRudder) ud.tailRudder.rotation.z = Math.sin(time * 0.7) * 0.06;
  }
  // Legacy programmatic F-16 update
  if (f16Group && f16Group.visible && !f16Group.userData.modelLoaded) {
    updateF16(f16Group, time, camera, isF16Exploded);
  }

  hologramPanels.forEach((group, i) => {
    // Billboard: face the camera (skip anchor lines)
    group.children.forEach(child => {
      if (child.isMesh && child.name !== 'anchorLine') {
        child.lookAt(camera.position);
      }
    });

    // Gentle float animation (each panel at different phase)
    const phase = i * 2.1;
    const floatY = group.userData.baseY + Math.sin(time * 1.2 + phase) * 0.08;

    // Update panel and glow Y position
    if (group.userData.panel) group.userData.panel.position.y = floatY;
    if (group.userData.glow) group.userData.glow.position.y = floatY - 0.01;

    // Update anchor line to track the floating panel
    if (group.userData.line) {
      const lineFrom = new THREE.Vector3(0, 0, 0);
      const lineTo = new THREE.Vector3(0, floatY - H_PANEL / 2, 0);
      updateAnchorLine(group.userData.line, lineFrom, lineTo);
    }

    // Subtle glow pulse
    if (group.userData.glow) {
      group.userData.glow.material.opacity = 0.5 + Math.sin(time * 2.5 + phase) * 0.2;
      const glowScale = 1 + Math.sin(time * 3.0 + phase) * 0.04;
      group.userData.glow.scale.setScalar(glowScale);
    }
  });

  composer.render();
}

// ============================================================
// SECONDARY TICK — HUD updates (lower frequency)
// ============================================================
let hudTickAccum = 0;
const HUD_TICK_INTERVAL = 0.15; // ~6-7 times per second

function animateHUD() {
  requestAnimationFrame(animateHUD);
  hudTickAccum += 0.016; // ~60fps driver

  if (hudTickAccum >= HUD_TICK_INTERVAL) {
    hudTickAccum -= HUD_TICK_INTERVAL;
    updateLiveData();
    waveformTime += HUD_TICK_INTERVAL;
    drawWaveform();
  }
}

// ============================================================
// RESIZE HANDLER
// ============================================================
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// START
// ============================================================
demoTimeline = createDemoTour();
initWaveform();
updateClock();
scheduleRandomNotification();

// Update clock every second
setInterval(updateClock, 1000);

// Hide loading screen
setTimeout(() => {
  loadingEl.classList.add('hidden');
  addNotification('SİSTEM ÇEVRİMİÇİ — FIBER OPTIC NETWORK AKTİF');
  setTimeout(() => playDemoTour(), 800);
}, 1200);

// Start render loops
animate();
animateHUD();

// ============================================================
// EXPORT for debugging
// ============================================================
console.log('🛡️  Savunma Sanayii 3D Demo hazır.');
console.log('   🖱️  Mouse: Orbit | 🎮 Space: Demo | 🔑 E: Explode | 🔑 R: Reset');
console.log('   🎭 Theatre.js Studio aktif - Alt+\\ ile gizle/göster');
console.log('   📡 Sci-Fi HUD: Aktif');
console.log('   🖥️  3D Hologram Panels: 3 adet (canvas textured planes)');
console.log('   🎯 Hotspots: 3 nokta (hover + tıkla)');
console.log('   Kablo:', jacket.name);
console.log('   Fiberler:', fiberStrands.length, 'adet');
