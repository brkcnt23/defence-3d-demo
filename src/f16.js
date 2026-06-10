// ============================================================
// F-16 Fighting Falcon — Programatik 3D Model
// Three.js primitives only, no external models
// ============================================================

import * as THREE from 'three';
import gsap from 'gsap';

// ============================================================
// SHARED MATERIALS
// ============================================================
const matBody = new THREE.MeshStandardMaterial({
  color: 0x8b8f99,
  roughness: 0.55,
  metalness: 0.35,
});
const matBodyDark = new THREE.MeshStandardMaterial({
  color: 0x6b6f79,
  roughness: 0.6,
  metalness: 0.3,
});
const matMetal = new THREE.MeshStandardMaterial({
  color: 0x555560,
  roughness: 0.3,
  metalness: 0.9,
});
const matDarkMetal = new THREE.MeshStandardMaterial({
  color: 0x333340,
  roughness: 0.35,
  metalness: 0.85,
});
const matCanopyFrame = new THREE.MeshStandardMaterial({
  color: 0x2a2a35,
  roughness: 0.4,
  metalness: 0.7,
});
const matCanopyGlass = new THREE.MeshPhysicalMaterial({
  color: 0x8899bb,
  roughness: 0.08,
  metalness: 0.05,
  transmission: 0.55,
  thickness: 0.08,
  ior: 1.45,
  envMapIntensity: 0.3,
});
const matEngine = new THREE.MeshStandardMaterial({
  color: 0x444450,
  roughness: 0.3,
  metalness: 0.9,
});
const matAfterburner = new THREE.MeshStandardMaterial({
  color: 0xff4400,
  roughness: 0.2,
  metalness: 0.1,
  emissive: 0xff4400,
  emissiveIntensity: 2.5,
});
const matTurbine = new THREE.MeshStandardMaterial({
  color: 0x666670,
  roughness: 0.25,
  metalness: 0.95,
});
const matBomb = new THREE.MeshStandardMaterial({
  color: 0x4a5d23,
  roughness: 0.7,
  metalness: 0.1,
});
const matMissileBody = new THREE.MeshStandardMaterial({
  color: 0x555560,
  roughness: 0.3,
  metalness: 0.7,
});
const matMissileHead = new THREE.MeshStandardMaterial({
  color: 0x333338,
  roughness: 0.2,
  metalness: 0.8,
});
const matCockpitInterior = new THREE.MeshStandardMaterial({
  color: 0x1a1a25,
  roughness: 0.7,
  metalness: 0.1,
});
const matSeat = new THREE.MeshStandardMaterial({
  color: 0x2a2a30,
  roughness: 0.6,
  metalness: 0.2,
});
const matPanel = new THREE.MeshStandardMaterial({
  color: 0x111118,
  roughness: 0.4,
  metalness: 0.3,
  emissive: 0x003322,
  emissiveIntensity: 0.4,
});
const matNozzle = new THREE.MeshStandardMaterial({
  color: 0x333338,
  roughness: 0.3,
  metalness: 0.9,
});
const matIntake = new THREE.MeshStandardMaterial({
  color: 0x444448,
  roughness: 0.5,
  metalness: 0.7,
});

// ============================================================
// HELPER: create a fuselage segment (cylinder along Z axis)
// ============================================================
function createFuselageSegment(radiusTop, radiusBottom, length, zCenter, scaleY = 0.7) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 24, 1, false);
  const mesh = new THREE.Mesh(geo, matBody);
  mesh.position.z = zCenter;
  mesh.scale.y = scaleY;
  // Cylinder default axis is Y, rotate to align with Z
  mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'fuselageSegment';
  return mesh;
}

// Create a closed fuselage segment (with caps)
function createFuselageSegmentClosed(radiusTop, radiusBottom, length, zCenter, scaleY = 0.7) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 24, 1, false);
  const mesh = new THREE.Mesh(geo, matBody);
  mesh.position.z = zCenter;
  mesh.scale.y = scaleY;
  mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================
// CREATE F-16
// ============================================================
export function createF16(scene) {
  const root = new THREE.Group();
  root.name = 'F16_Falcon';

  // --- BODY GROUP ---
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'bodyGroup';
  root.add(bodyGroup);

  // Nose cone (closed, pointed)
  const noseGeo = new THREE.ConeGeometry(0.12, 0.8, 16, 1, false);
  const nose = new THREE.Mesh(noseGeo, matBodyDark);
  nose.position.z = -4.0;
  nose.scale.y = 0.7;
  nose.rotation.x = -Math.PI / 2;
  nose.castShadow = true;
  nose.name = 'nose';
  bodyGroup.add(nose);

  // Fuselage segments (nose to tail)
  // F-16 gets wider from nose to intake area, then tapers to engine
  bodyGroup.add(createFuselageSegment(0.14, 0.22, 0.7, -3.35, 0.68));
  bodyGroup.add(createFuselageSegment(0.22, 0.32, 0.8, -2.6, 0.65));
  bodyGroup.add(createFuselageSegment(0.32, 0.42, 0.9, -1.8, 0.62));
  bodyGroup.add(createFuselageSegment(0.42, 0.48, 0.8, -1.0, 0.6));
  // Widest point — intake area
  bodyGroup.add(createFuselageSegment(0.48, 0.50, 0.9, -0.1, 0.58));
  bodyGroup.add(createFuselageSegment(0.50, 0.46, 0.9, 0.8, 0.58));
  // Tapering aft
  bodyGroup.add(createFuselageSegment(0.46, 0.38, 0.8, 1.7, 0.6));
  bodyGroup.add(createFuselageSegment(0.38, 0.28, 0.8, 2.5, 0.62));
  bodyGroup.add(createFuselageSegment(0.28, 0.20, 0.6, 3.1, 0.64));

  // Fuselage bottom cap piece (to close off the bottom)
  const bottomCapGeo = new THREE.CylinderGeometry(0.20, 0.22, 0.15, 24, 1, false);
  const bottomCap = new THREE.Mesh(bottomCapGeo, matBodyDark);
  bottomCap.position.set(0, -0.15, 3.1);
  bottomCap.scale.y = 0.6;
  bottomCap.rotation.x = -Math.PI / 2;
  bottomCap.castShadow = true;
  bottomCap.name = 'bottomCap';
  bodyGroup.add(bottomCap);

  // --- TOP COVER GROUP (lifts up on explode, reveals engine) ---
  const topCoverGroup = new THREE.Group();
  topCoverGroup.name = 'topCoverGroup';
  root.add(topCoverGroup);

  // Top fuselage shell — covers the mid/aft section
  // We create a half-cylinder shape for the top cover
  const coverLength = 2.5;
  const coverGeo = new THREE.CylinderGeometry(0.52, 0.28, coverLength, 24, 1, false, 0, Math.PI);
  const cover = new THREE.Mesh(coverGeo, matBodyDark);
  cover.position.z = 1.3;
  cover.scale.y = 0.58;
  cover.rotation.x = -Math.PI / 2;
  cover.castShadow = true;
  cover.name = 'topCover';
  topCoverGroup.add(cover);

  // --- INTAKE (under fuselage) ---
  const intakeGeo = new THREE.BoxGeometry(0.55, 0.25, 0.6);
  const intake = new THREE.Mesh(intakeGeo, matIntake);
  intake.position.set(0, -0.15, -0.3);
  intake.castShadow = true;
  intake.name = 'intake';
  bodyGroup.add(intake);

  // Intake splitter plate
  const splitterGeo = new THREE.BoxGeometry(0.04, 0.15, 0.5);
  const splitter = new THREE.Mesh(splitterGeo, matDarkMetal);
  splitter.position.set(0, -0.05, -0.3);
  splitter.name = 'splitter';
  bodyGroup.add(splitter);

  // --- ENGINE NOZZLE ---
  const nozzleGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.6, 24, 1, false);
  const nozzle = new THREE.Mesh(nozzleGeo, matNozzle);
  nozzle.position.z = 3.5;
  nozzle.scale.y = 0.65;
  nozzle.rotation.x = -Math.PI / 2;
  nozzle.castShadow = true;
  nozzle.name = 'nozzle';
  bodyGroup.add(nozzle);

  // Nozzle inner glow ring
  const nozzleInnerGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24);
  const nozzleInner = new THREE.Mesh(nozzleInnerGeo, matAfterburner);
  nozzleInner.position.z = 3.2;
  nozzleInner.rotation.x = Math.PI / 2;
  nozzleInner.name = 'nozzleInner';
  bodyGroup.add(nozzleInner);

  // --- ENGINE GROUP (inside, revealed when top cover opens) ---
  const engineGroup = new THREE.Group();
  engineGroup.name = 'engineGroup';
  root.add(engineGroup);

  // Engine block
  const engineBlockGeo = new THREE.CylinderGeometry(0.30, 0.32, 1.8, 20, 1, false);
  const engineBlock = new THREE.Mesh(engineBlockGeo, matEngine);
  engineBlock.position.z = 1.3;
  engineBlock.scale.y = 0.55;
  engineBlock.rotation.x = -Math.PI / 2;
  engineBlock.name = 'engineBlock';
  engineGroup.add(engineBlock);

  // Turbine rings inside engine
  for (let i = 0; i < 3; i++) {
    const ringGeo = new THREE.TorusGeometry(0.26 - i * 0.02, 0.015, 12, 20);
    const ring = new THREE.Mesh(ringGeo, matTurbine);
    ring.position.z = 1.3 + (i - 1) * 0.45;
    ring.rotation.x = Math.PI / 2;
    ring.name = `turbineRing${i}`;
    engineGroup.add(ring);
  }

  // Afterburner flame holder rings
  for (let i = 0; i < 2; i++) {
    const abRingGeo = new THREE.TorusGeometry(0.22 + i * 0.02, 0.02, 10, 20);
    const abRing = new THREE.Mesh(abRingGeo, matAfterburner);
    abRing.position.z = 2.8 + i * 0.2;
    abRing.rotation.x = Math.PI / 2;
    abRing.name = `abRing${i}`;
    engineGroup.add(abRing);
  }

  // --- COCKPIT CANOPY GROUP (lifts up on explode) ---
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'canopyGroup';
  canopyGroup.position.z = -1.5;
  root.add(canopyGroup);

  // Canopy frame (elliptical base)
  const frameGeo = new THREE.TorusGeometry(0.28, 0.025, 12, 20);
  const frame = new THREE.Mesh(frameGeo, matCanopyFrame);
  frame.position.y = 0.28;
  frame.rotation.x = Math.PI / 2;
  frame.scale.set(1, 1, 1.4);
  frame.name = 'canopyFrame';
  canopyGroup.add(frame);

  // Canopy glass (half ellipsoid)
  const glassGeo = new THREE.SphereGeometry(0.30, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.4);
  const glass = new THREE.Mesh(glassGeo, matCanopyGlass);
  glass.position.y = 0.28;
  glass.scale.set(0.58, 0.55, 1.25);
  glass.name = 'canopyGlass';
  canopyGroup.add(glass);

  // --- COCKPIT INTERIOR (avionics, visible when canopy lifts) ---
  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = 'cockpitGroup';
  cockpitGroup.position.set(0, 0.05, -1.5);
  root.add(cockpitGroup);

  // Cockpit tub
  const tubGeo = new THREE.CylinderGeometry(0.25, 0.28, 0.6, 16, 1, false, 0, Math.PI);
  const tub = new THREE.Mesh(tubGeo, matCockpitInterior);
  tub.position.y = -0.08;
  tub.scale.set(1, 0.35, 1.3);
  tub.rotation.x = 0;
  tub.name = 'cockpitTub';
  cockpitGroup.add(tub);

  // Ejection seat
  const seatBaseGeo = new THREE.BoxGeometry(0.12, 0.28, 0.10);
  const seatBase = new THREE.Mesh(seatBaseGeo, matSeat);
  seatBase.position.set(0, 0.10, -0.1);
  seatBase.name = 'seatBase';
  cockpitGroup.add(seatBase);

  const seatBackGeo = new THREE.BoxGeometry(0.12, 0.20, 0.05);
  const seatBack = new THREE.Mesh(seatBackGeo, matSeat);
  seatBack.position.set(0, 0.22, -0.08);
  seatBack.name = 'seatBack';
  cockpitGroup.add(seatBack);

  // Headrest
  const headrestGeo = new THREE.BoxGeometry(0.10, 0.10, 0.06);
  const headrest = new THREE.Mesh(headrestGeo, matSeat);
  headrest.position.set(0, 0.30, -0.06);
  headrest.name = 'headrest';
  cockpitGroup.add(headrest);

  // Instrument panel
  const panelGeo = new THREE.BoxGeometry(0.22, 0.12, 0.04);
  const instrumentPanel = new THREE.Mesh(panelGeo, matPanel);
  instrumentPanel.position.set(0, 0.08, 0.08);
  instrumentPanel.rotation.x = -0.6;
  instrumentPanel.name = 'instrumentPanel';
  cockpitGroup.add(instrumentPanel);

  // HUD glass (small transparent panel)
  const hudGeo = new THREE.PlaneGeometry(0.10, 0.06);
  const hudGlass = new THREE.Mesh(hudGeo, new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  }));
  hudGlass.position.set(0, 0.18, 0.12);
  hudGlass.rotation.x = -0.35;
  hudGlass.name = 'hudGlass';
  cockpitGroup.add(hudGlass);

  // Control stick
  const stickGeo = new THREE.CylinderGeometry(0.015, 0.018, 0.16, 8);
  const stick = new THREE.Mesh(stickGeo, matDarkMetal);
  stick.position.set(0, 0.02, -0.02);
  stick.rotation.x = 0.15;
  stick.name = 'controlStick';
  cockpitGroup.add(stick);

  // --- WINGS (reliable BufferGeometry trapezoids) ---
  const wingsGroup = new THREE.Group();
  wingsGroup.name = 'wingsGroup';
  root.add(wingsGroup);

  /**
   * Build a flat trapezoid wing as BufferGeometry.
   * Wing lies in XZ plane with small Y thickness.
   */
  function buildWingGeo(rootChord, tipChord, halfSpan, thickness, sweepZ) {
    const hy = thickness / 2;
    // Root at X=0, tip at X=halfSpan
    // Root: Z from +rootChord/2 (LE) to -rootChord/2 (TE)
    // Tip:  Z from -sweepZ+tipChord/2 (LE) to -sweepZ-tipChord/2 (TE)
    const rLE = rootChord / 2, rTE = -rootChord / 2;
    const tLE = -sweepZ + tipChord / 2, tTE = -sweepZ - tipChord / 2;

    const v = new Float32Array([
      0,  hy, rLE,   halfSpan,  hy, tLE,   halfSpan,  hy, tTE,   0,  hy, rTE,  // top 0-3
      0, -hy, rLE,   halfSpan, -hy, tLE,   halfSpan, -hy, tTE,   0, -hy, rTE,  // bottom 4-7
    ]);
    const idx = [
      0,1,2, 0,2,3,   // top
      4,6,5, 4,7,6,   // bottom
      0,4,5, 0,5,1,   // LE
      3,2,6, 3,6,7,   // TE
      0,3,7, 0,7,4,   // root rib
      1,5,6, 1,6,2,   // tip rib
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  // Left wing: root chord 0.55, tip chord 0.12, span 2.4, sweep 0.5
  const leftWingGeo = buildWingGeo(0.55, 0.12, 2.4, 0.04, 0.5);
  const leftWing = new THREE.Mesh(leftWingGeo, matBody);
  leftWing.position.set(-0.08, -0.02, -0.3);
  leftWing.castShadow = true;
  leftWing.receiveShadow = true;
  leftWing.name = 'leftWing';
  wingsGroup.add(leftWing);

  // Right wing: mirror by scaling X by -1
  const rightWingGeo = buildWingGeo(0.55, 0.12, 2.4, 0.04, 0.5);
  const rightWing = new THREE.Mesh(rightWingGeo, matBody);
  rightWing.position.set(0.08, -0.02, -0.3);
  rightWing.scale.x = -1;
  rightWing.castShadow = true;
  rightWing.receiveShadow = true;
  rightWing.name = 'rightWing';
  wingsGroup.add(rightWing);

  // --- TAIL ---
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tailGroup';
  root.add(tailGroup);

  // Vertical stabilizer (flat trapezoid fin using buildWingGeo rotated 90° to stand up)
  const vStabGeo = buildWingGeo(0.55, 0.08, 0.75, 0.035, 0.15);
  const vStab = new THREE.Mesh(vStabGeo, matBody);
  vStab.position.set(0, 0.35, 2.5);
  // Rotate: the wing geo lies in XZ, we need it in YZ (standing up)
  // rotate 90° around Z then -90° around Y, or simpler: rotate X by PI/2
  vStab.rotation.x = Math.PI / 2;
  vStab.rotation.z = -Math.PI / 2;
  vStab.castShadow = true;
  vStab.name = 'verticalStabilizer';
  tailGroup.add(vStab);

  // Horizontal stabilizers (small trapezoid wings at tail)
  const leftHStabGeo = buildWingGeo(0.30, 0.06, 0.9, 0.025, 0.2);
  const leftHStab = new THREE.Mesh(leftHStabGeo, matBody);
  leftHStab.position.set(-0.1, 0.12, 2.6);
  leftHStab.castShadow = true;
  leftHStab.name = 'leftStabilizer';
  tailGroup.add(leftHStab);

  const rightHStabGeo = buildWingGeo(0.30, 0.06, 0.9, 0.025, 0.2);
  const rightHStab = new THREE.Mesh(rightHStabGeo, matBody);
  rightHStab.position.set(0.1, 0.12, 2.6);
  rightHStab.scale.x = -1;
  rightHStab.castShadow = true;
  rightHStab.name = 'rightStabilizer';
  tailGroup.add(rightHStab);

  // --- WING PYLONS ---
  function createPylon(x, z) {
    const pylonGroup = new THREE.Group();
    const pylonGeo = new THREE.BoxGeometry(0.04, 0.15, 0.20);
    const pylon = new THREE.Mesh(pylonGeo, matDarkMetal);
    pylon.position.y = -0.07;
    pylon.name = 'pylon';
    pylonGroup.add(pylon);
    pylonGroup.position.set(x, -0.08, z);
    return pylonGroup;
  }

  // --- BOMBS ---
  const bombsGroup = new THREE.Group();
  bombsGroup.name = 'bombsGroup';
  root.add(bombsGroup);

  function createBomb() {
    const bombGroup = new THREE.Group();

    // Bomb body
    const bodyGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.7, 12);
    const body = new THREE.Mesh(bodyGeo, matBomb);
    body.rotation.x = Math.PI / 2;
    body.name = 'bombBody';
    bombGroup.add(body);

    // Nose fuze
    const noseGeo = new THREE.ConeGeometry(0.05, 0.15, 8);
    const noseBomb = new THREE.Mesh(noseGeo, matDarkMetal);
    noseBomb.position.z = -0.42;
    noseBomb.rotation.x = Math.PI / 2;
    noseBomb.name = 'bombNose';
    bombGroup.add(noseBomb);

    // Tail fins
    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.01, 0.06, 0.10);
      const fin = new THREE.Mesh(finGeo, matDarkMetal);
      fin.position.z = 0.35;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.06;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.06;
      fin.name = 'bombFin';
      bombGroup.add(fin);
    }

    return bombGroup;
  }

  // Place bombs under wings
  const bombPositions = [
    { x: -0.9, z: -0.45 },   // left inner (1/3 span)
    { x: -1.7, z: -0.60 },   // left outer (2/3 span)
    { x: 0.9, z: -0.45 },    // right inner (1/3 span)
    { x: 1.7, z: -0.60 },    // right outer (2/3 span)
  ];

  const bombRefs = [];
  bombPositions.forEach(pos => {
    const bomb = createBomb();
    bomb.position.set(pos.x, -0.45, pos.z);
    bomb.rotation.x = 0;
    bomb.name = 'bomb';
    bombsGroup.add(bomb);
    bombRefs.push(bomb);
  });

  // Add pylons for bombs
  bombPositions.forEach(pos => {
    const pylon = createPylon(pos.x, pos.z);
    bombsGroup.add(pylon);
  });

  // --- MISSILES ---
  const missilesGroup = new THREE.Group();
  missilesGroup.name = 'missilesGroup';
  root.add(missilesGroup);

  function createMissile() {
    const missileGroup = new THREE.Group();

    // Missile body
    const bodyGeo = new THREE.CylinderGeometry(0.025, 0.028, 1.3, 10);
    const body = new THREE.Mesh(bodyGeo, matMissileBody);
    body.rotation.x = Math.PI / 2;
    body.name = 'missileBody';
    missileGroup.add(body);

    // Seeker head
    const seekerGeo = new THREE.SphereGeometry(0.026, 8, 8);
    const seeker = new THREE.Mesh(seekerGeo, matMissileHead);
    seeker.position.z = -0.65;
    seeker.name = 'seeker';
    missileGroup.add(seeker);

    // Fins (front)
    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.008, 0.02, 0.12);
      const fin = new THREE.Mesh(finGeo, matMissileHead);
      fin.position.z = -0.3;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.03;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.03;
      fin.name = 'missileFinFront';
      missileGroup.add(fin);
    }

    // Fins (rear)
    for (let a = 0; a < 4; a++) {
      const finGeo = new THREE.BoxGeometry(0.008, 0.025, 0.15);
      const fin = new THREE.Mesh(finGeo, matMissileHead);
      fin.position.z = 0.35;
      fin.position.x = Math.cos(a * Math.PI / 2) * 0.03;
      fin.position.y = Math.sin(a * Math.PI / 2) * 0.03;
      fin.name = 'missileFinRear';
      missileGroup.add(fin);
    }

    // Exhaust nozzle
    const exhaustGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.08, 8);
    const exhaust = new THREE.Mesh(exhaustGeo, matNozzle);
    exhaust.position.z = 0.65;
    exhaust.rotation.x = Math.PI / 2;
    exhaust.name = 'missileExhaust';
    missileGroup.add(exhaust);

    return missileGroup;
  }

  // Place missiles at wingtips (match new wing geometry: halfSpan=2.4, rootZ=-0.3, sweep=0.5)
  const missilePositions = [
    { x: -2.35, z: -0.75, ry: 0 },
    { x: 2.35, z: -0.75, ry: 0 },
  ];

  const missileRefs = [];
  missilePositions.forEach(pos => {
    const missile = createMissile();
    missile.position.set(pos.x, -0.35, pos.z);
    missile.rotation.y = pos.ry;
    missile.name = 'missile';
    missilesGroup.add(missile);
    missileRefs.push(missile);
  });

  // Add wingtip rails for missiles
  missilePositions.forEach(pos => {
    const railGeo = new THREE.BoxGeometry(0.03, 0.04, 0.25);
    const rail = new THREE.Mesh(railGeo, matDarkMetal);
    rail.position.set(pos.x, -0.25, pos.z - 0.1);
    rail.name = 'rail';
    missilesGroup.add(rail);
  });

  // --- LANDING GEAR ---
  const gearGroup = new THREE.Group();
  gearGroup.name = 'gearGroup';
  root.add(gearGroup);

  // Nose gear
  const noseGearStrutGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
  const noseGearStrut = new THREE.Mesh(noseGearStrutGeo, matMetal);
  noseGearStrut.position.set(0, -0.35, -2.2);
  noseGearStrut.name = 'noseGear';
  gearGroup.add(noseGearStrut);

  const noseWheelGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
  const noseWheel = new THREE.Mesh(noseWheelGeo, matDarkMetal);
  noseWheel.position.set(0, -0.52, -2.2);
  noseWheel.rotation.x = Math.PI / 2;
  noseWheel.name = 'noseWheel';
  gearGroup.add(noseWheel);

  // Main gear (left and right)
  [-0.3, 0.3].forEach(side => {
    const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8);
    const strut = new THREE.Mesh(strutGeo, matMetal);
    strut.position.set(side, -0.35, -0.9);
    strut.name = 'mainGearStrut';
    gearGroup.add(strut);

    const wheelGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12);
    const wheel = new THREE.Mesh(wheelGeo, matDarkMetal);
    wheel.position.set(side, -0.55, -0.9);
    wheel.rotation.x = Math.PI / 2;
    wheel.name = 'mainWheel';
    gearGroup.add(wheel);
  });

  // --- FUEL TANKS (under fuselage) ---
  const centerTankGeo = new THREE.CylinderGeometry(0.08, 0.09, 1.2, 12);
  const centerTank = new THREE.Mesh(centerTankGeo, matBodyDark);
  centerTank.position.set(0, -0.35, 0.5);
  centerTank.rotation.x = Math.PI / 2;
  centerTank.name = 'centerTank';
  bombsGroup.add(centerTank);

  // ============================================================
  // 3D LABELS — Canvas-textured planes on key parts
  // ============================================================
  function createPartLabel(text, subtext, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Semi-transparent dark background
    ctx.fillStyle = 'rgba(0, 8, 20, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyan border
    ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Accent corners
    const cl = 14;
    ctx.strokeStyle = '#0af';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(6, 6 + cl); ctx.lineTo(6, 6); ctx.lineTo(6 + cl, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width - 6 - cl, 6); ctx.lineTo(canvas.width - 6, 6); ctx.lineTo(canvas.width - 6, 6 + cl); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, canvas.height - 6 - cl); ctx.lineTo(6, canvas.height - 6); ctx.lineTo(6 + cl, canvas.height - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(canvas.width - 6 - cl, canvas.height - 6); ctx.lineTo(canvas.width - 6, canvas.height - 6); ctx.lineTo(canvas.width - 6, canvas.height - 6 - cl); ctx.stroke();

    // Main text
    ctx.fillStyle = '#0af';
    ctx.font = 'bold 22px "Orbitron", "Rajdhani", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, canvas.width / 2, 48);

    // Subtext
    if (subtext) {
      ctx.fillStyle = 'rgba(180, 210, 240, 0.7)';
      ctx.font = '14px "Share Tech Mono", monospace';
      ctx.fillText(subtext, canvas.width / 2, 78);
    }

    // Bottom diamond
    ctx.fillStyle = '#0af';
    ctx.font = '9px sans-serif';
    ctx.fillText('◆', canvas.width / 2, canvas.height - 18);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
    });
    const label = new THREE.Mesh(geo, mat);
    label.name = 'partLabel';
    label.userData.billboard = true;
    return label;
  }

  // --- Engine label ---
  const engineLabel = createPartLabel('F110-GE-129', 'S/N: SH2V23V3000 • TURBOFAN', 1.8, 0.45);
  engineLabel.position.set(0, 0.45, 1.3);
  engineLabel.name = 'engineLabel';
  engineGroup.add(engineLabel);

  // --- Radar label ---
  const radarLabel = createPartLabel('AN/APG-68(V)9', 'PULSE-DOPPLER RADAR', 1.4, 0.35);
  radarLabel.position.set(0, 0.22, -3.8);
  radarLabel.name = 'radarLabel';
  bodyGroup.add(radarLabel);

  // --- Tail label ---
  const tailLabel = createPartLabel('F-16C BLOCK 50+', 'LOCKHEED MARTIN', 1.4, 0.35);
  tailLabel.position.set(0, 0.6, 2.6);
  tailLabel.name = 'tailLabel';
  tailGroup.add(tailLabel);

  // --- Store label refs for billboarding ---
  const partLabels = [engineLabel, radarLabel, tailLabel];

  // ============================================================
  // HOTSPOTS — Invisible markers for hover/click interaction
  // ============================================================
  const hotspotMarkers = [];
  const hotspotGeo = new THREE.SphereGeometry(0.12, 12, 12);
  const hotspotMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: 0.0,
    depthTest: false,
    depthWrite: false,
  });

  const hotspotData = [
    {
      position: new THREE.Vector3(0, 0.35, 1.3),
      title: 'F110-GE-129 TURBOFAN MOTOR',
      body: '29,000 lb thrust sınıfı afterburning turbofan motor. 3 kademeli fan, 9 kademeli kompresör, 2 kademeli türbin. F-16C Block 50+ konfigürasyonunda kullanılan General Electric üretimi. Maksimum itki: 29,500 lb (afterburner ile).',
      specs: ['İtki: 29,500 lb', 'Fan: 3 Kademe', 'Kompresör: 9K', 'S/N: SH2V23V3000'],
    },
    {
      position: new THREE.Vector3(0, 0.25, -1.5),
      title: 'AVİYONİK SİSTEMLER • KOKPİT',
      body: 'AN/APG-68(V)9 pulse-Doppler radar, JHMCS kaska monteli nişangah sistemi, 2 adet çok fonksiyonlu renkli MFD ekran, HOTAS kontroller, gece görüş uyumlu kokpit aydınlatması.',
      specs: ['Radar: APG-68(V)9', 'MFD: 2× Renkli', 'JHMCS: Var', 'GPS/INS: Entegre'],
    },
    {
      position: new THREE.Vector3(1.2, -0.15, 0.1),
      title: 'SİLAH İSTASYONLARI • KANAT ALTI',
      body: '9 adet hardpoint: 2 kanat ucu (AIM-9X Sidewinder), 6 kanat altı (Mk.82/84 bombalar, AGM-65 Maverick, AIM-120 AMRAAM), 1 gövde altı. Toplam 7,700 kg mühimmat taşıma kapasitesi. M61A1 20mm Vulcan top (511 mermi).',
      specs: ['Hardpoint: 9', 'Kapasite: 7,700 kg', 'Top: M61A1 20mm', 'Mermi: 511 adet'],
    },
    {
      position: new THREE.Vector3(0, 0.15, -3.6),
      title: 'AN/APG-68(V)9 RADAR SİSTEMİ',
      body: 'X-band pulse-Doppler radar. 296 km tespit menzili. Havadan-havaya (TWS, STT) ve havadan-yere (GMTI, SAR, DBS) modları. Sentetik açıklıklı radar (SAR) ile yüksek çözünürlüklü yer haritalama kabiliyeti.',
      specs: ['Bant: X-band', 'Menzil: 296 km', 'Mod: A/A + A/G', 'SAR: 1m çözünürlük'],
    },
  ];

  hotspotData.forEach((hs, i) => {
    const marker = new THREE.Mesh(hotspotGeo, hotspotMat.clone());
    marker.position.copy(hs.position);
    marker.name = `f16-hotspot-${i}`;
    marker.userData = { hotspotIndex: i, hotspotData: hs, model: 'f16' };
    root.add(marker);
    hotspotMarkers.push(marker);
  });

  // --- STORE REFS for animations ---
  root.userData = {
    canopyGroup,
    topCoverGroup,
    engineGroup,
    cockpitGroup,
    missilesGroup,
    missileRefs,
    bombRefs,
    bombsGroup,
    nozzleInner,
    partLabels,
    hotspotMarkers,
    hotspotData,
    // Original positions for reset
    canopyOrigY: canopyGroup.position.y,
    topCoverOrigY: topCoverGroup.position.y,
    topCoverOrigZ: topCoverGroup.position.z,
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
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

// ============================================================
// EXPLODE ANIMATION
// ============================================================
export function f16Explode(root, isExploded) {
  const ud = root.userData;
  const tl = gsap.timeline();

  if (isExploded) {
    // Canopy lifts up
    tl.to(ud.canopyGroup.position, {
      y: ud.canopyOrigY + 0.9,
      duration: 0.8,
      ease: 'power2.out',
    }, 0);

    // Top cover lifts up and slightly back
    tl.to(ud.topCoverGroup.position, {
      y: ud.topCoverOrigY + 1.1,
      z: ud.topCoverOrigZ - 0.2,
      duration: 0.9,
      ease: 'power2.out',
    }, 0.1);
    tl.to(ud.topCoverGroup.rotation, {
      x: -0.25,
      duration: 0.7,
      ease: 'power2.out',
    }, 0.1);

    // Missiles slide backward (staggered)
    ud.missileRefs.forEach((missile, i) => {
      const orig = ud.missileOrigPositions[i];
      tl.to(missile.position, {
        z: orig.z - 3.0,
        x: orig.x * 1.3,
        duration: 0.7,
        ease: 'power3.in',
      }, 0.3 + i * 0.12);
    });

    // Bombs drop slightly
    ud.bombRefs.forEach((bomb, i) => {
      tl.to(bomb.position, {
        y: bomb.position.y - 0.25,
        duration: 0.6,
        ease: 'power2.in',
      }, 0.5 + i * 0.08);
    });

    // Afterburner intensifies
    if (ud.nozzleInner) {
      tl.to(ud.nozzleInner.material, {
        emissiveIntensity: 5,
        duration: 0.5,
      }, 0.3);
      tl.to(ud.nozzleInner.scale, {
        x: 1.3,
        y: 1.3,
        duration: 0.4,
      }, 0.3);
    }
  } else {
    // Reset everything
    tl.to(ud.canopyGroup.position, {
      y: ud.canopyOrigY,
      duration: 0.7,
      ease: 'power2.in',
    }, 0);

    tl.to(ud.topCoverGroup.position, {
      y: ud.topCoverOrigY,
      z: ud.topCoverOrigZ,
      duration: 0.7,
      ease: 'power2.in',
    }, 0.05);
    tl.to(ud.topCoverGroup.rotation, {
      x: 0,
      duration: 0.6,
      ease: 'power2.in',
    }, 0.05);

    ud.missileRefs.forEach((missile, i) => {
      const orig = ud.missileOrigPositions[i];
      tl.to(missile.position, {
        z: orig.z,
        x: orig.x,
        duration: 0.65,
        ease: 'power2.out',
      }, 0.15 + i * 0.1);
    });

    ud.bombRefs.forEach((bomb, i) => {
      tl.to(bomb.position, {
        y: bomb.position.y + 0.25,
        duration: 0.5,
        ease: 'power2.out',
      }, 0.3 + i * 0.06);
    });

    if (ud.nozzleInner) {
      tl.to(ud.nozzleInner.material, {
        emissiveIntensity: 2.5,
        duration: 0.4,
      }, 0.2);
      tl.to(ud.nozzleInner.scale, {
        x: 1,
        y: 1,
        duration: 0.4,
      }, 0.2);
    }
  }

  return tl;
}

// ============================================================
// DEMO CAMERA PATH (returns array of {pos, target, duration, description})
// ============================================================
export function f16DemoCameras() {
  return [
    {
      pos: new THREE.Vector3(0, 1.5, 7),
      target: new THREE.Vector3(0, 0, 0),
      duration: 1.5,
      description: 'Önden geniş açı',
    },
    {
      pos: new THREE.Vector3(3.5, 0.3, 2),
      target: new THREE.Vector3(1.5, -0.15, 0),
      duration: 2.5,
      description: 'Sağ kanat altı — silahlar',
    },
    {
      pos: new THREE.Vector3(0, 2.2, 1.5),
      target: new THREE.Vector3(0, 0.3, -1.5),
      duration: 2.5,
      description: 'Kokpite yakın — pilot/aviyonik',
    },
    {
      pos: new THREE.Vector3(0, 1.2, -5),
      target: new THREE.Vector3(0, 0.1, 2),
      duration: 2.5,
      description: 'Arkadan — motor/afterburner',
    },
    {
      pos: new THREE.Vector3(0, 3.5, 6),
      target: new THREE.Vector3(0, 0, 0),
      duration: 2,
      description: 'Üstten geniş açı',
    },
  ];
}

// ============================================================
// RENDER LOOP UPDATE (call each frame)
// ============================================================
export function updateF16(root, time, camera, isExploded) {
  if (!root || !root.visible) return;

  const ud = root.userData;

  // Afterburner glow pulse
  if (ud.nozzleInner && !isExploded) {
    const pulse = 1 + Math.sin(time * 6) * 0.15;
    ud.nozzleInner.scale.setScalar(pulse);
    ud.nozzleInner.material.emissiveIntensity = 2.5 + Math.sin(time * 5) * 0.8;
  }

  // Billboard part labels toward camera
  if (ud.partLabels && camera) {
    ud.partLabels.forEach(label => {
      label.lookAt(camera.position);
    });
  }
}
