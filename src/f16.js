// ============================================================
// F-16 Fighting Falcon — Programatik 3D Model v2
// Smooth single-piece fuselage + proper explode panels
// ============================================================

import * as THREE from 'three';
import gsap from 'gsap';

// ============================================================
// SHARED MATERIALS
// ============================================================
const matBody = new THREE.MeshStandardMaterial({ color: 0x8b8f99, roughness: 0.55, metalness: 0.35 });
const matBodyDark = new THREE.MeshStandardMaterial({ color: 0x6b6f79, roughness: 0.6, metalness: 0.3 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.3, metalness: 0.9 });
const matDarkMetal = new THREE.MeshStandardMaterial({ color: 0x333340, roughness: 0.35, metalness: 0.85 });
const matCanopyFrame = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 0.4, metalness: 0.7 });
const matCanopyGlass = new THREE.MeshPhysicalMaterial({
  color: 0x8899bb, roughness: 0.08, metalness: 0.05,
  transmission: 0.55, thickness: 0.08, ior: 1.45, envMapIntensity: 0.3,
});
const matEngine = new THREE.MeshStandardMaterial({ color: 0x444450, roughness: 0.3, metalness: 0.9 });
const matAfterburner = new THREE.MeshStandardMaterial({
  color: 0xff4400, roughness: 0.2, metalness: 0.1, emissive: 0xff4400, emissiveIntensity: 2.5,
});
const matTurbine = new THREE.MeshStandardMaterial({ color: 0x666670, roughness: 0.25, metalness: 0.95 });
const matBomb = new THREE.MeshStandardMaterial({ color: 0x4a5d23, roughness: 0.7, metalness: 0.1 });
const matMissileBody = new THREE.MeshStandardMaterial({ color: 0x555560, roughness: 0.3, metalness: 0.7 });
const matMissileHead = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.2, metalness: 0.8 });
const matCockpitInterior = new THREE.MeshStandardMaterial({ color: 0x1a1a25, roughness: 0.7, metalness: 0.1 });
const matSeat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.6, metalness: 0.2 });
const matPanel = new THREE.MeshStandardMaterial({
  color: 0x111118, roughness: 0.4, metalness: 0.3, emissive: 0x003322, emissiveIntensity: 0.4,
});
const matNozzle = new THREE.MeshStandardMaterial({ color: 0x333338, roughness: 0.3, metalness: 0.9 });
const matIntake = new THREE.MeshStandardMaterial({ color: 0x444448, roughness: 0.5, metalness: 0.7 });
const matAvionics = new THREE.MeshStandardMaterial({
  color: 0x1a1a20, roughness: 0.5, metalness: 0.4, emissive: 0x001111, emissiveIntensity: 0.2,
});
const matRadar = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.3, metalness: 0.8 });
const matWiring = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.8, metalness: 0.1 });
const matFuelLine = new THREE.MeshStandardMaterial({ color: 0x884422, roughness: 0.5, metalness: 0.3 });

// ============================================================
// SMOOTH FUSELAGE — Cross-section ring builder
// ============================================================

/**
 * Build a smooth fuselage from cross-section stations.
 * Each station: { z, rx, ry } — ellipse radii at that Z position.
 * Returns a closed BufferGeometry (with nose cap and tail cap).
 */
function buildFuselageGeometry(stations, radialSegs = 32) {
  const rings = [];
  const n = stations.length;

  // Build vertex rings (each ring has radialSegs+1 vertices for proper closing)
  for (let i = 0; i < n; i++) {
    const { z, rx, ry } = stations[i];
    const ring = [];
    for (let j = 0; j <= radialSegs; j++) {
      const theta = (j / radialSegs) * Math.PI * 2;
      const x = Math.cos(theta) * rx;
      const y = Math.sin(theta) * ry;
      ring.push({ x, y, z });
    }
    rings.push(ring);
  }

  // Count total vertices
  const vertsPerRing = radialSegs + 1;
  const totalVerts = n * vertsPerRing + 2; // + nose tip + tail center
  const positions = new Float32Array(totalVerts * 3);
  const indices = [];

  let vi = 0;

  // Write ring vertices
  const ringStartIdx = [];
  for (let i = 0; i < n; i++) {
    ringStartIdx.push(vi);
    for (let j = 0; j < vertsPerRing; j++) {
      const v = rings[i][j];
      positions[vi * 3] = v.x;
      positions[vi * 3 + 1] = v.y;
      positions[vi * 3 + 2] = v.z;
      vi++;
    }
  }

  // Nose tip vertex
  const noseIdx = vi;
  const first = stations[0];
  positions[vi * 3] = 0;
  positions[vi * 3 + 1] = 0;
  positions[vi * 3 + 2] = first.z - first.rx * 0.6;
  vi++;

  // Tail center vertex (for nozzle face)
  const tailIdx = vi;
  const last = stations[n - 1];
  positions[vi * 3] = 0;
  positions[vi * 3 + 1] = 0;
  positions[vi * 3 + 2] = last.z + last.rx * 0.3;
  vi++;

  // Connect adjacent rings with triangles
  for (let i = 0; i < n - 1; i++) {
    const a0 = ringStartIdx[i];
    const b0 = ringStartIdx[i + 1];
    for (let j = 0; j < radialSegs; j++) {
      const a = a0 + j;
      const b = a0 + j + 1;
      const c = b0 + j;
      const d = b0 + j + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Nose fan: connect first ring to nose tip
  const r0 = ringStartIdx[0];
  for (let j = 0; j < radialSegs; j++) {
    indices.push(r0 + j, noseIdx, r0 + j + 1);
  }

  // Tail fan: connect last ring to tail center
  const rN = ringStartIdx[n - 1];
  for (let j = 0; j < radialSegs; j++) {
    indices.push(rN + j, rN + j + 1, tailIdx);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Build a removable PANEL from the fuselage (top section only).
 * thetaStart/thetaEnd in radians define which arc of the cross-section to include.
 */
function buildFuselagePanel(stations, thetaStart, thetaEnd, radialSegs = 32) {
  const rings = [];
  const n = stations.length;

  const segsForPanel = Math.max(4, Math.floor(radialSegs * (thetaEnd - thetaStart) / (Math.PI * 2)));
  const totalArcVerts = segsForPanel + 1;

  for (let i = 0; i < n; i++) {
    const { z, rx, ry } = stations[i];
    const ring = [];
    for (let j = 0; j <= segsForPanel; j++) {
      const theta = thetaStart + (j / segsForPanel) * (thetaEnd - thetaStart);
      const x = Math.cos(theta) * rx;
      const y = Math.sin(theta) * ry;
      ring.push({ x, y, z });
    }
    rings.push(ring);
  }

  const totalVerts = n * totalArcVerts;
  const positions = new Float32Array(totalVerts * 3);
  const indices = [];

  let vi = 0;
  const ringStartIdx = [];
  for (let i = 0; i < n; i++) {
    ringStartIdx.push(vi);
    for (let j = 0; j < totalArcVerts; j++) {
      const v = rings[i][j];
      positions[vi * 3] = v.x;
      positions[vi * 3 + 1] = v.y;
      positions[vi * 3 + 2] = v.z;
      vi++;
    }
  }

  // Connect rings
  for (let i = 0; i < n - 1; i++) {
    const a0 = ringStartIdx[i];
    const b0 = ringStartIdx[i + 1];
    for (let j = 0; j < segsForPanel; j++) {
      const a = a0 + j, b = a0 + j + 1, c = b0 + j, d = b0 + j + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  // Edge caps (close the panel edges along Z at thetaStart and thetaEnd)
  for (let i = 0; i < n - 1; i++) {
    const a = ringStartIdx[i];
    const b = ringStartIdx[i + 1];
    // thetaStart edge
    indices.push(a, b, a);
    // thetaEnd edge
    const te = ringStartIdx[i] + segsForPanel;
    const teNext = ringStartIdx[i + 1] + segsForPanel;
    indices.push(te, te, teNext);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ============================================================
// F-16 FUSELAGE STATIONS (cross-section profiles along Z)
// ============================================================
// Z from nose (-4.5) to tail (+4.0)
const fuselageStations = [
  { z: -4.5, rx: 0.04, ry: 0.03 },   // nose tip
  { z: -4.2, rx: 0.08, ry: 0.06 },   // pitot area
  { z: -3.8, rx: 0.12, ry: 0.10 },   // radome
  { z: -3.3, rx: 0.18, ry: 0.15 },   // forward radome
  { z: -2.8, rx: 0.24, ry: 0.20 },   // forward fuselage
  { z: -2.3, rx: 0.30, ry: 0.25 },   // cockpit area
  { z: -1.8, rx: 0.35, ry: 0.28 },   // behind cockpit
  { z: -1.2, rx: 0.44, ry: 0.32 },   // avionics bay
  { z: -0.5, rx: 0.52, ry: 0.35 },   // intake area (widest)
  { z:  0.1, rx: 0.52, ry: 0.34 },   // intake mid
  { z:  0.7, rx: 0.50, ry: 0.33 },   // mid fuselage
  { z:  1.3, rx: 0.48, ry: 0.32 },   // engine bay
  { z:  1.9, rx: 0.44, ry: 0.30 },   // aft engine
  { z:  2.4, rx: 0.38, ry: 0.26 },   // aft fuselage
  { z:  2.9, rx: 0.30, ry: 0.22 },   // pre-nozzle
  { z:  3.3, rx: 0.24, ry: 0.18 },   // nozzle approach
  { z:  3.6, rx: 0.20, ry: 0.14 },   // nozzle
];

// Panel station ranges
const engineCoverStations = fuselageStations.filter(s => s.z >= -0.5 && s.z <= 2.4);
const avionicsCoverStations = fuselageStations.filter(s => s.z >= -1.2 && s.z <= -0.1);

// ============================================================
// WING GEOMETRY (flat trapezoid BufferGeometry)
// ============================================================
function buildWingGeo(rootChord, tipChord, halfSpan, thickness, sweepZ) {
  const hy = thickness / 2;
  const rLE = rootChord / 2, rTE = -rootChord / 2;
  const tLE = -sweepZ + tipChord / 2, tTE = -sweepZ - tipChord / 2;

  const v = new Float32Array([
    0,  hy, rLE,   halfSpan,  hy, tLE,   halfSpan,  hy, tTE,   0,  hy, rTE,
    0, -hy, rLE,   halfSpan, -hy, tLE,   halfSpan, -hy, tTE,   0, -hy, rTE,
  ]);
  const idx = [
    0,1,2, 0,2,3,   4,6,5, 4,7,6,
    0,4,5, 0,5,1,   3,2,6, 3,6,7,
    0,3,7, 0,7,4,   1,5,6, 1,6,2,
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ============================================================
// PART LABEL (canvas texture)
// ============================================================
function createPartLabel(text, subtext, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(0, 8, 20, 0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  const cl = 14;
  ctx.strokeStyle = '#0af';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(6,6+cl); ctx.lineTo(6,6); ctx.lineTo(6+cl,6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(canvas.width-6-cl,6); ctx.lineTo(canvas.width-6,6); ctx.lineTo(canvas.width-6,6+cl); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6,canvas.height-6-cl); ctx.lineTo(6,canvas.height-6); ctx.lineTo(6+cl,canvas.height-6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(canvas.width-6-cl,canvas.height-6); ctx.lineTo(canvas.width-6,canvas.height-6); ctx.lineTo(canvas.width-6,canvas.height-6-cl); ctx.stroke();

  ctx.fillStyle = '#0af';
  ctx.font = 'bold 22px "Orbitron", "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, 48);

  if (subtext) {
    ctx.fillStyle = 'rgba(180, 210, 240, 0.7)';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText(subtext, canvas.width / 2, 78);
  }

  ctx.fillStyle = '#0af';
  ctx.font = '9px sans-serif';
  ctx.fillText('◆', canvas.width / 2, canvas.height - 18);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;

  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, opacity: 0.9,
    side: THREE.DoubleSide, depthTest: true, depthWrite: false,
  });
  const label = new THREE.Mesh(geo, mat);
  label.name = 'partLabel';
  return label;
}

// ============================================================
// CREATE F-16
// ============================================================
export function createF16(scene) {
  const root = new THREE.Group();
  root.name = 'F16_Falcon';

  // ---- SMOOTH MAIN FUSELAGE ----
  const fuselageGeo = buildFuselageGeometry(fuselageStations, 36);
  const fuselageMesh = new THREE.Mesh(fuselageGeo, matBody);
  fuselageMesh.castShadow = true;
  fuselageMesh.receiveShadow = true;
  fuselageMesh.name = 'fuselage';
  root.add(fuselageMesh);

  // ---- NOSE CONE (separate darker piece) ----
  const noseStations = [
    { z: -4.5, rx: 0.04, ry: 0.03 },
    { z: -4.0, rx: 0.10, ry: 0.08 },
    { z: -3.5, rx: 0.14, ry: 0.12 },
    { z: -3.0, rx: 0.20, ry: 0.16 },
  ];
  const noseGeo = buildFuselageGeometry(noseStations, 24);
  const noseMesh = new THREE.Mesh(noseGeo, matBodyDark);
  noseMesh.position.z = 0;
  noseMesh.castShadow = true;
  noseMesh.name = 'noseRadome';
  root.add(noseMesh);

  // ---- UPPER ENGINE COVER (removable panel) ----
  const engineCoverGroup = new THREE.Group();
  engineCoverGroup.name = 'engineCoverGroup';
  root.add(engineCoverGroup);

  const engineCoverGeo = buildFuselagePanel(engineCoverStations, 0.15, Math.PI - 0.15, 36);
  const engineCoverMesh = new THREE.Mesh(engineCoverGeo, matBodyDark);
  engineCoverMesh.castShadow = true;
  engineCoverMesh.name = 'engineCover';
  engineCoverGroup.add(engineCoverMesh);

  // ---- AVIONICS COVER (removable panel behind cockpit) ----
  const avionicsCoverGroup = new THREE.Group();
  avionicsCoverGroup.name = 'avionicsCoverGroup';
  root.add(avionicsCoverGroup);

  const avionicsCoverGeo = buildFuselagePanel(avionicsCoverStations, 0.1, Math.PI - 0.1, 28);
  const avionicsCoverMesh = new THREE.Mesh(avionicsCoverGeo, matBodyDark);
  avionicsCoverMesh.castShadow = true;
  avionicsCoverMesh.name = 'avionicsCover';
  avionicsCoverGroup.add(avionicsCoverMesh);

  // ---- INTAKE (under fuselage) ----
  const intakeGeo = new THREE.BoxGeometry(0.55, 0.22, 0.6);
  const intake = new THREE.Mesh(intakeGeo, matIntake);
  intake.position.set(0, -0.20, -0.25);
  intake.castShadow = true;
  intake.name = 'intake';
  root.add(intake);

  const splitterGeo = new THREE.BoxGeometry(0.04, 0.14, 0.45);
  const splitter = new THREE.Mesh(splitterGeo, matDarkMetal);
  splitter.position.set(0, -0.08, -0.25);
  splitter.name = 'splitter';
  root.add(splitter);

  // ---- ENGINE NOZZLE ----
  const nozzleGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.55, 28, 1, true);
  const nozzle = new THREE.Mesh(nozzleGeo, matNozzle);
  nozzle.position.z = 3.65;
  nozzle.scale.y = 0.7;
  nozzle.rotation.x = -Math.PI / 2;
  nozzle.castShadow = true;
  nozzle.name = 'nozzle';
  root.add(nozzle);

  const nozzleInnerGeo = new THREE.TorusGeometry(0.16, 0.025, 12, 24);
  const nozzleInner = new THREE.Mesh(nozzleInnerGeo, matAfterburner);
  nozzleInner.position.z = 3.3;
  nozzleInner.rotation.x = Math.PI / 2;
  nozzleInner.name = 'nozzleInner';
  root.add(nozzleInner);

  // ---- ENGINE BAY INTERNALS ----
  const engineGroup = new THREE.Group();
  engineGroup.name = 'engineGroup';
  root.add(engineGroup);

  // Main engine block
  const engineBlockGeo = new THREE.CylinderGeometry(0.28, 0.30, 1.8, 20, 1, false);
  const engineBlock = new THREE.Mesh(engineBlockGeo, matEngine);
  engineBlock.position.set(0, -0.05, 0.9);
  engineBlock.scale.y = 0.55;
  engineBlock.rotation.x = -Math.PI / 2;
  engineBlock.name = 'engineBlock';
  engineGroup.add(engineBlock);

  // Fan blades (front)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const bladeGeo = new THREE.BoxGeometry(0.03, 0.22, 0.06);
    const blade = new THREE.Mesh(bladeGeo, matTurbine);
    blade.position.set(Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0.15);
    blade.rotation.z = angle;
    blade.name = 'fanBlade';
    engineGroup.add(blade);
  }

  // Turbine rings
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.24 - i * 0.03, 0.015, 12, 24);
    const ring = new THREE.Mesh(ringGeo, matTurbine);
    ring.position.z = 0.9 + (i - 1) * 0.4;
    ring.rotation.x = Math.PI / 2;
    ring.name = `turbineRing${i}`;
    engineGroup.add(ring);
  }

  // Afterburner rings
  for (let i = 0; i < 2; i++) {
    const abGeo = new THREE.TorusGeometry(0.20 + i * 0.03, 0.02, 10, 20);
    const abRing = new THREE.Mesh(abGeo, matAfterburner);
    abRing.position.z = 2.5 + i * 0.2;
    abRing.rotation.x = Math.PI / 2;
    abRing.name = `abRing${i}`;
    engineGroup.add(abRing);
  }

  // Fuel lines
  for (let i = 0; i < 4; i++) {
    const lineGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.2, 6);
    const line = new THREE.Mesh(lineGeo, matFuelLine);
    line.position.set(-0.22 + i * 0.14, -0.1, 0.8);
    line.rotation.x = Math.PI / 2;
    line.name = 'fuelLine';
    engineGroup.add(line);
  }

  // ---- COCKPIT CANOPY (removable) ----
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'canopyGroup';
  canopyGroup.position.set(0, 0.25, -1.9);
  root.add(canopyGroup);

  const frameGeo = new THREE.TorusGeometry(0.26, 0.022, 12, 20);
  const frame = new THREE.Mesh(frameGeo, matCanopyFrame);
  frame.position.y = 0.02;
  frame.rotation.x = Math.PI / 2;
  frame.scale.set(0.9, 1, 1.35);
  frame.name = 'canopyFrame';
  canopyGroup.add(frame);

  const glassGeo = new THREE.SphereGeometry(0.28, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const glass = new THREE.Mesh(glassGeo, matCanopyGlass);
  glass.position.y = 0.02;
  glass.scale.set(0.55, 0.55, 1.2);
  glass.name = 'canopyGlass';
  canopyGroup.add(glass);

  // ---- COCKPIT INTERIOR ----
  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = 'cockpitGroup';
  cockpitGroup.position.set(0, 0.08, -1.8);
  root.add(cockpitGroup);

  // Cockpit tub
  const tubGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.55, 16, 1, false, 0, Math.PI);
  const tub = new THREE.Mesh(tubGeo, matCockpitInterior);
  tub.position.y = -0.05;
  tub.scale.set(0.9, 0.3, 1.25);
  tub.name = 'cockpitTub';
  cockpitGroup.add(tub);

  // Ejection seat
  const seatBaseGeo = new THREE.BoxGeometry(0.11, 0.25, 0.09);
  const seatBase = new THREE.Mesh(seatBaseGeo, matSeat);
  seatBase.position.set(0, 0.10, -0.08);
  seatBase.name = 'seat';
  cockpitGroup.add(seatBase);

  const seatBackGeo = new THREE.BoxGeometry(0.11, 0.18, 0.04);
  const seatBack = new THREE.Mesh(seatBackGeo, matSeat);
  seatBack.position.set(0, 0.22, -0.06);
  seatBack.name = 'seatBack';
  cockpitGroup.add(seatBack);

  const headrestGeo = new THREE.BoxGeometry(0.09, 0.09, 0.05);
  const headrest = new THREE.Mesh(headrestGeo, matSeat);
  headrest.position.set(0, 0.28, -0.05);
  headrest.name = 'headrest';
  cockpitGroup.add(headrest);

  // Main instrument panel (angled)
  const panelGeo = new THREE.BoxGeometry(0.20, 0.10, 0.03);
  const instPanel = new THREE.Mesh(panelGeo, matPanel);
  instPanel.position.set(0, 0.06, 0.08);
  instPanel.rotation.x = -0.55;
  instPanel.name = 'instrumentPanel';
  cockpitGroup.add(instPanel);

  // MFD screens (glowing)
  for (let s = -1; s <= 1; s += 2) {
    const mfdGeo = new THREE.PlaneGeometry(0.06, 0.05);
    const mfdMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88, transparent: true, opacity: 0.7, side: THREE.DoubleSide, depthWrite: false,
    });
    const mfd = new THREE.Mesh(mfdGeo, mfdMat);
    mfd.position.set(s * 0.07, 0.06, 0.10);
    mfd.rotation.x = -0.55;
    mfd.name = 'MFD';
    cockpitGroup.add(mfd);
  }

  // HUD glass
  const hudGeo = new THREE.PlaneGeometry(0.09, 0.05);
  const hudMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false,
  });
  const hudGlass = new THREE.Mesh(hudGeo, hudMat);
  hudGlass.position.set(0, 0.16, 0.12);
  hudGlass.rotation.x = -0.3;
  hudGlass.name = 'hudGlass';
  cockpitGroup.add(hudGlass);

  // Control stick
  const stickGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.14, 8);
  const stick = new THREE.Mesh(stickGeo, matDarkMetal);
  stick.position.set(0, 0.02, -0.01);
  stick.rotation.x = 0.12;
  stick.name = 'stick';
  cockpitGroup.add(stick);

  // Throttle (left side)
  const throttleGeo = new THREE.BoxGeometry(0.02, 0.08, 0.03);
  const throttle = new THREE.Mesh(throttleGeo, matDarkMetal);
  throttle.position.set(-0.16, 0.06, -0.02);
  throttle.rotation.z = 0.3;
  throttle.name = 'throttle';
  cockpitGroup.add(throttle);

  // ---- AVIONICS BAY ----
  const avionicsGroup = new THREE.Group();
  avionicsGroup.name = 'avionicsGroup';
  avionicsGroup.position.set(0, 0.0, -0.85);
  root.add(avionicsGroup);

  // Radar processor unit
  const radarUnitGeo = new THREE.BoxGeometry(0.20, 0.15, 0.25);
  const radarUnit = new THREE.Mesh(radarUnitGeo, matAvionics);
  radarUnit.position.set(0, 0.05, 0);
  radarUnit.name = 'radarUnit';
  avionicsGroup.add(radarUnit);

  // Avionics boxes
  for (let i = 0; i < 3; i++) {
    const boxGeo = new THREE.BoxGeometry(0.12, 0.08, 0.10);
    const box = new THREE.Mesh(boxGeo, matAvionics);
    box.position.set(-0.12 + i * 0.12, -0.04, i * 0.12);
    box.name = `avionicsBox${i}`;
    avionicsGroup.add(box);
  }

  // Cable bundles
  for (let i = 0; i < 5; i++) {
    const cableGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.3, 5);
    const cable = new THREE.Mesh(cableGeo, matWiring);
    cable.position.set(-0.18 + i * 0.08, 0.02, 0.05);
    cable.rotation.x = Math.PI / 2;
    cable.rotation.z = (i - 2) * 0.3;
    cable.name = 'cableBundle';
    avionicsGroup.add(cable);
  }

  // ---- WINGS ----
  const wingsGroup = new THREE.Group();
  wingsGroup.name = 'wingsGroup';
  root.add(wingsGroup);

  const leftWingGeo = buildWingGeo(0.55, 0.10, 2.4, 0.04, 0.55);
  const leftWing = new THREE.Mesh(leftWingGeo, matBody);
  leftWing.position.set(-0.08, -0.02, -0.3);
  leftWing.castShadow = true; leftWing.receiveShadow = true;
  leftWing.name = 'leftWing';
  wingsGroup.add(leftWing);

  const rightWingGeo = buildWingGeo(0.55, 0.10, 2.4, 0.04, 0.55);
  const rightWing = new THREE.Mesh(rightWingGeo, matBody);
  rightWing.position.set(0.08, -0.02, -0.3);
  rightWing.scale.x = -1;
  rightWing.castShadow = true; rightWing.receiveShadow = true;
  rightWing.name = 'rightWing';
  wingsGroup.add(rightWing);

  // ---- TAIL ----
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tailGroup';
  root.add(tailGroup);

  // Vertical stabilizer
  const vStabGeo = buildWingGeo(0.50, 0.06, 0.72, 0.035, 0.18);
  const vStab = new THREE.Mesh(vStabGeo, matBody);
  vStab.position.set(0, 0.38, 2.5);
  vStab.rotation.x = Math.PI / 2;
  vStab.rotation.z = -Math.PI / 2;
  vStab.castShadow = true;
  vStab.name = 'verticalStabilizer';
  tailGroup.add(vStab);

  // Horizontal stabilizers
  const leftHStabGeo = buildWingGeo(0.28, 0.05, 0.85, 0.025, 0.22);
  const leftHStab = new THREE.Mesh(leftHStabGeo, matBody);
  leftHStab.position.set(-0.10, 0.12, 2.6);
  leftHStab.castShadow = true;
  leftHStab.name = 'leftStabilizer';
  tailGroup.add(leftHStab);

  const rightHStabGeo = buildWingGeo(0.28, 0.05, 0.85, 0.025, 0.22);
  const rightHStab = new THREE.Mesh(rightHStabGeo, matBody);
  rightHStab.position.set(0.10, 0.12, 2.6);
  rightHStab.scale.x = -1;
  rightHStab.castShadow = true;
  rightHStab.name = 'rightStabilizer';
  tailGroup.add(rightHStab);

  // ---- WEAPONS ----
  const missilesGroup = new THREE.Group();
  missilesGroup.name = 'missilesGroup';
  root.add(missilesGroup);

  function createMissile() {
    const g = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.024, 0.026, 1.3, 10);
    g.add(new THREE.Mesh(bodyGeo, matMissileBody)).name = 'body';
    g.children[0].rotation.x = Math.PI / 2;

    const seekerGeo = new THREE.SphereGeometry(0.024, 8, 8);
    const seeker = new THREE.Mesh(seekerGeo, matMissileHead);
    seeker.position.z = -0.65;
    g.add(seeker);

    // Fins
    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.006, 0.018, 0.11);
      const fin = new THREE.Mesh(finGeo, matMissileHead);
      fin.position.z = -0.25;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.028;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.028;
      g.add(fin);
    }
    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.006, 0.022, 0.12);
      const fin = new THREE.Mesh(finGeo, matMissileHead);
      fin.position.z = 0.32;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.028;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.028;
      g.add(fin);
    }
    return g;
  }

  const missileData = [
    { x: -2.3, z: -0.8 },  // left wingtip
    { x:  2.3, z: -0.8 },  // right wingtip
  ];

  const missileRefs = [];
  missileData.forEach(d => {
    const m = createMissile();
    m.position.set(d.x, -0.30, d.z);
    m.name = 'missile';
    missilesGroup.add(m);
    missileRefs.push(m);
  });

  // Wingtip rails
  missileData.forEach(d => {
    const railGeo = new THREE.BoxGeometry(0.025, 0.035, 0.22);
    const rail = new THREE.Mesh(railGeo, matDarkMetal);
    rail.position.set(d.x, -0.22, d.z - 0.05);
    rail.name = 'rail';
    missilesGroup.add(rail);
  });

  // Bombs
  const bombsGroup = new THREE.Group();
  bombsGroup.name = 'bombsGroup';
  root.add(bombsGroup);

  function createBomb() {
    const g = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.65, 12);
    const body = new THREE.Mesh(bodyGeo, matBomb);
    body.rotation.x = Math.PI / 2;
    g.add(body);

    const noseGeo = new THREE.ConeGeometry(0.045, 0.13, 8);
    const n = new THREE.Mesh(noseGeo, matDarkMetal);
    n.position.z = -0.38;
    n.rotation.x = Math.PI / 2;
    g.add(n);

    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.008, 0.05, 0.09);
      const fin = new THREE.Mesh(finGeo, matDarkMetal);
      fin.position.z = 0.32;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.055;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.055;
      g.add(fin);
    }
    return g;
  }

  const bombPositions = [
    { x: -0.85, z: -0.50 },
    { x: -1.60, z: -0.62 },
    { x:  0.85, z: -0.50 },
    { x:  1.60, z: -0.62 },
  ];

  const bombRefs = [];
  bombPositions.forEach(d => {
    const b = createBomb();
    b.position.set(d.x, -0.42, d.z);
    b.name = 'bomb';
    bombsGroup.add(b);
    bombRefs.push(b);

    const pylonGeo = new THREE.BoxGeometry(0.035, 0.12, 0.18);
    const pylon = new THREE.Mesh(pylonGeo, matDarkMetal);
    pylon.position.set(d.x, -0.28, d.z);
    pylon.name = 'pylon';
    bombsGroup.add(pylon);
  });

  // Centerline fuel tank
  const tankGeo = new THREE.CylinderGeometry(0.07, 0.08, 1.1, 12);
  const tank = new THREE.Mesh(tankGeo, matBodyDark);
  tank.position.set(0, -0.35, 0.3);
  tank.rotation.x = Math.PI / 2;
  tank.name = 'centerTank';
  bombsGroup.add(tank);

  // ---- LANDING GEAR ----
  const gearGroup = new THREE.Group();
  gearGroup.name = 'gearGroup';
  root.add(gearGroup);

  // Nose gear
  const noseStrutGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.32, 8);
  const noseStrut = new THREE.Mesh(noseStrutGeo, matMetal);
  noseStrut.position.set(0, -0.32, -2.5);
  noseStrut.name = 'noseStrut';
  gearGroup.add(noseStrut);

  const noseWheelGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.035, 12);
  const noseWheel = new THREE.Mesh(noseWheelGeo, matDarkMetal);
  noseWheel.position.set(0, -0.48, -2.5);
  noseWheel.rotation.x = Math.PI / 2;
  gearGroup.add(noseWheel);

  // Main gear
  [-0.28, 0.28].forEach(side => {
    const strutGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8);
    const strut = new THREE.Mesh(strutGeo, matMetal);
    strut.position.set(side, -0.32, -0.85);
    gearGroup.add(strut);

    const wheelGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.045, 12);
    const wheel = new THREE.Mesh(wheelGeo, matDarkMetal);
    wheel.position.set(side, -0.50, -0.85);
    wheel.rotation.x = Math.PI / 2;
    gearGroup.add(wheel);
  });

  // ---- 3D LABELS ----
  const partLabels = [];

  const engineLabel = createPartLabel('F110-GE-129', 'S/N: SH2V23V3000 • TURBOFAN', 1.6, 0.40);
  engineLabel.position.set(0, 0.38, 1.1);
  engineLabel.name = 'engineLabel';
  root.add(engineLabel);
  partLabels.push(engineLabel);

  const radarLabel = createPartLabel('AN/APG-68(V)9', 'PULSE-DOPPLER RADAR', 1.3, 0.32);
  radarLabel.position.set(0, 0.20, -3.2);
  radarLabel.name = 'radarLabel';
  root.add(radarLabel);
  partLabels.push(radarLabel);

  const tailLabel = createPartLabel('F-16C BLOCK 50+', 'LOCKHEED MARTIN', 1.3, 0.32);
  tailLabel.position.set(0, 0.65, 2.6);
  tailLabel.name = 'tailLabel';
  root.add(tailLabel);
  partLabels.push(tailLabel);

  // ---- HOTSPOTS ----
  const hotspotData = [
    {
      position: new THREE.Vector3(0, 0.30, 1.0),
      title: 'F110-GE-129 TURBOFAN MOTOR',
      body: 'General Electric F110-GE-129 afterburning turbofan. 29,500 lb maksimum itki. 3 kademeli fan, 9 kademeli kompresör, 2 kademeli türbin. F-16C Block 50+ konfigürasyonu.',
      specs: ['İtki: 29,500 lb', 'Fan: 3 Kademe', 'Kompresör: 9K', 'S/N: SH2V23V3000'],
    },
    {
      position: new THREE.Vector3(0, 0.25, -1.8),
      title: 'KOKPİT • AVİYONİK SİSTEMLER',
      body: 'AN/APG-68(V)9 pulse-Doppler radar, JHMCS kaska monteli nişangah, 2× renkli MFD, HOTAS kontroller, ACES II fırlatma koltuğu. Gece görüş uyumlu kokpit aydınlatması.',
      specs: ['Radar: APG-68(V)9', 'MFD: 2× Renkli', 'JHMCS: Entegre', 'Koltuk: ACES II'],
    },
    {
      position: new THREE.Vector3(1.5, -0.15, -0.4),
      title: 'SİLAH İSTASYONLARI',
      body: '9 hardpoint: 2 kanat ucu (AIM-9X), 6 kanat altı (Mk.82/84, AGM-65, AIM-120), 1 gövde altı. 7,700 kg taşıma kapasitesi. M61A1 20mm Vulcan top (511 mermi).',
      specs: ['Hardpoint: 9', 'Kapasite: 7,700 kg', 'Top: M61A1 20mm', 'Mermi: 511'],
    },
    {
      position: new THREE.Vector3(0, 0.12, -3.3),
      title: 'AN/APG-68(V)9 RADAR',
      body: 'X-band pulse-Doppler. 296 km tespit menzili. Havadan-havaya (TWS, STT) ve havadan-yere (GMTI, SAR) modları. Sentetik açıklıklı radar ile yüksek çözünürlüklü haritalama.',
      specs: ['Bant: X-band', 'Menzil: 296 km', 'Mod: A/A + A/G', 'SAR: 1m'],
    },
    {
      position: new THREE.Vector3(0, -0.10, -0.85),
      title: 'AVİYONİK BÖLMESİ',
      body: 'AN/APG-68 radar işlemcisi, merkezi görev bilgisayarı, INS/GPS navigasyon ünitesi, IFF transponder, ECM/EW kendini koruma sistemleri. MIL-STD-1553B veri yolu.',
      specs: ['Radar İşlemci: PS-68', 'Bilgisayar: MMC-5000', 'BUS: 1553B', 'GPS/INS: Entegre'],
    },
  ];

  const hotspotMarkers = [];
  const hotspotMarkerGeo = new THREE.SphereGeometry(0.10, 10, 10);
  hotspotData.forEach((hs, i) => {
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x00aaff, transparent: true, opacity: 0.0, depthTest: false, depthWrite: false,
    });
    const marker = new THREE.Mesh(hotspotMarkerGeo, markerMat);
    marker.position.copy(hs.position);
    marker.name = `f16-hotspot-${i}`;
    marker.userData = { hotspotIndex: i, hotspotData: hs, model: 'f16' };
    root.add(marker);
    hotspotMarkers.push(marker);
  });

  // ---- STORE REFS ----
  root.userData = {
    canopyGroup,
    engineCoverGroup,
    avionicsCoverGroup,
    engineGroup,
    cockpitGroup,
    avionicsGroup,
    missilesGroup,
    missileRefs,
    bombRefs,
    bombsGroup,
    nozzleInner,
    partLabels,
    hotspotMarkers,
    hotspotData,
    // Originals for reset
    canopyOrigY: canopyGroup.position.y,
    canopyOrigZ: canopyGroup.position.z,
    engineCoverOrigY: engineCoverGroup.position.y,
    engineCoverOrigZ: engineCoverGroup.position.z,
    avionicsCoverOrigY: avionicsCoverGroup.position.y,
    avionicsCoverOrigZ: avionicsCoverGroup.position.z,
    missileOrigPositions: missileRefs.map(m => m.position.clone()),
    bombOrigPositions: bombRefs.map(b => b.position.clone()),
  };

  scene.add(root);
  return root;
}

// ============================================================
// DISPOSE
// ============================================================
export function disposeF16(root) {
  root.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      Array.isArray(child.material) ? child.material.forEach(m => m.dispose()) : child.material.dispose();
    }
  });
}

// ============================================================
// EXPLODE — canopy, engine cover, avionics cover open, missiles eject
// ============================================================
export function f16Explode(root, isExploded) {
  const ud = root.userData;
  const tl = gsap.timeline();

  if (isExploded) {
    // Canopy lifts up
    tl.to(ud.canopyGroup.position, {
      y: ud.canopyOrigY + 0.85, z: ud.canopyOrigZ - 0.2,
      duration: 0.8, ease: 'power2.out',
    }, 0);
    tl.to(ud.canopyGroup.rotation, {
      x: -0.35,
      duration: 0.7, ease: 'power2.out',
    }, 0);

    // Engine cover lifts
    tl.to(ud.engineCoverGroup.position, {
      y: ud.engineCoverOrigY + 1.0, z: ud.engineCoverOrigZ - 0.15,
      duration: 0.9, ease: 'power2.out',
    }, 0.1);
    tl.to(ud.engineCoverGroup.rotation, {
      x: -0.2,
      duration: 0.8, ease: 'power2.out',
    }, 0.1);

    // Avionics cover lifts
    tl.to(ud.avionicsCoverGroup.position, {
      y: ud.avionicsCoverOrigY + 0.7, z: ud.avionicsCoverOrigZ - 0.1,
      duration: 0.7, ease: 'power2.out',
    }, 0.15);

    // Missiles eject backward + outward
    ud.missileRefs.forEach((m, i) => {
      const orig = ud.missileOrigPositions[i];
      tl.to(m.position, {
        z: orig.z - 3.5,
        x: orig.x * 1.4,
        duration: 0.7, ease: 'power3.in',
      }, 0.25 + i * 0.1);
    });

    // Bombs drop slightly
    ud.bombRefs.forEach((b, i) => {
      tl.to(b.position, {
        y: b.position.y - 0.2,
        duration: 0.5, ease: 'power2.in',
      }, 0.45 + i * 0.06);
    });

    // Afterburner glow intensifies
    if (ud.nozzleInner) {
      tl.to(ud.nozzleInner.material, { emissiveIntensity: 5, duration: 0.4 }, 0.2);
    }
  } else {
    // Reset all
    tl.to(ud.canopyGroup.position, {
      y: ud.canopyOrigY, z: ud.canopyOrigZ,
      duration: 0.7, ease: 'power2.in',
    }, 0);
    tl.to(ud.canopyGroup.rotation, { x: 0, duration: 0.6, ease: 'power2.in' }, 0);

    tl.to(ud.engineCoverGroup.position, {
      y: ud.engineCoverOrigY, z: ud.engineCoverOrigZ,
      duration: 0.7, ease: 'power2.in',
    }, 0.05);
    tl.to(ud.engineCoverGroup.rotation, { x: 0, duration: 0.6, ease: 'power2.in' }, 0.05);

    tl.to(ud.avionicsCoverGroup.position, {
      y: ud.avionicsCoverOrigY, z: ud.avionicsCoverOrigZ,
      duration: 0.6, ease: 'power2.in',
    }, 0.1);

    ud.missileRefs.forEach((m, i) => {
      const orig = ud.missileOrigPositions[i];
      tl.to(m.position, {
        z: orig.z, x: orig.x,
        duration: 0.6, ease: 'power2.out',
      }, 0.1 + i * 0.08);
    });

    ud.bombRefs.forEach((b, i) => {
      tl.to(b.position, {
        y: b.position.y + 0.2,
        duration: 0.4, ease: 'power2.out',
      }, 0.25 + i * 0.05);
    });

    if (ud.nozzleInner) {
      tl.to(ud.nozzleInner.material, { emissiveIntensity: 2.5, duration: 0.4 }, 0.15);
    }
  }
  return tl;
}

// ============================================================
// DEMO CAMERA PATH
// ============================================================
export function f16DemoCameras() {
  return [
    { pos: new THREE.Vector3(0, 1.5, 7), target: new THREE.Vector3(0, 0, 0), duration: 1.5 },
    { pos: new THREE.Vector3(3.5, 0.3, 1.5), target: new THREE.Vector3(1.5, -0.15, -0.3), duration: 2.5 },
    { pos: new THREE.Vector3(0, 2.0, 1.0), target: new THREE.Vector3(0, 0.3, -1.8), duration: 2.5 },
    { pos: new THREE.Vector3(0, 1.0, -5), target: new THREE.Vector3(0, 0.1, 2), duration: 2.5 },
    { pos: new THREE.Vector3(0, 3.5, 6), target: new THREE.Vector3(0, 0, 0), duration: 2 },
  ];
}

// ============================================================
// PER-FRAME UPDATE
// ============================================================
export function updateF16(root, time, camera, isExploded) {
  if (!root || !root.visible) return;
  const ud = root.userData;

  if (ud.nozzleInner && !isExploded) {
    const pulse = 1 + Math.sin(time * 6) * 0.12;
    ud.nozzleInner.scale.setScalar(pulse);
    ud.nozzleInner.material.emissiveIntensity = 2.5 + Math.sin(time * 5) * 0.6;
  }

  if (ud.partLabels && camera) {
    ud.partLabels.forEach(l => l.lookAt(camera.position));
  }
}
