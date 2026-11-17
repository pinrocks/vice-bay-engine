// Procedural 3D vehicles, arcade-drift driving physics, damage deformation & AI traffic

export const VEHICLE_SPECS = {
  sedan: {
    id: 'sedan',
    name: 'Solara Sedan',
    halfW: 1.02,
    halfL: 2.32,
    height: 1.44,
    mass: 1350,
    maxSpeed: 31,
    reverseMax: 11,
    accel: 18.5,
    brake: 29,
    steerRate: 2.35,
    grip: 7.8,
    driftGrip: 2.3,
    maxHealth: 320,
    isBoat: false,
    isBike: false,
    colors: [0xd94b4b, 0x3878c8, 0xe6e9ef, 0x2e3542, 0xe2a229, 0x359c8a],
  },
  sports: {
    id: 'sports',
    name: 'Mirage GT',
    halfW: 1.08,
    halfL: 2.38,
    height: 1.22,
    mass: 1220,
    maxSpeed: 45,
    reverseMax: 14,
    accel: 27.5,
    brake: 35,
    steerRate: 2.65,
    grip: 9.2,
    driftGrip: 2.55,
    maxHealth: 270,
    isBoat: false,
    isBike: false,
    colors: [0xff3355, 0xffb400, 0x1ee3cf, 0xf7f9fc, 0x7b4dff],
  },
  suv: {
    id: 'suv',
    name: 'Costa 4x4',
    halfW: 1.14,
    halfL: 2.48,
    height: 1.76,
    mass: 1950,
    maxSpeed: 33,
    reverseMax: 11,
    accel: 17.5,
    brake: 27,
    steerRate: 2.15,
    grip: 7.4,
    driftGrip: 2.4,
    maxHealth: 440,
    isBoat: false,
    isBike: false,
    colors: [0x26303d, 0x4b6352, 0xd8cfc2, 0x8f3434, 0x3e5b7d],
  },
  truck: {
    id: 'truck',
    name: 'Dorado Hauler',
    halfW: 1.32,
    halfL: 3.45,
    height: 2.65,
    mass: 3800,
    maxSpeed: 24,
    reverseMax: 8.5,
    accel: 12.2,
    brake: 22,
    steerRate: 1.68,
    grip: 6.8,
    driftGrip: 2.8,
    maxHealth: 680,
    isBoat: false,
    isBike: false,
    colors: [0xc97e28, 0x456685, 0xd8dce2, 0x8c4138],
  },
  motorcycle: {
    id: 'motorcycle',
    name: 'Viento 900',
    halfW: 0.48,
    halfL: 1.28,
    height: 1.18,
    mass: 420,
    maxSpeed: 42,
    reverseMax: 7,
    accel: 30,
    brake: 34,
    steerRate: 3.15,
    grip: 9.6,
    driftGrip: 3.1,
    maxHealth: 175,
    isBoat: false,
    isBike: true,
    colors: [0xff425c, 0x24d6c4, 0xf4a700, 0x1e2430],
  },
  boat: {
    id: 'boat',
    name: 'Mako Interceptor',
    halfW: 1.25,
    halfL: 3.15,
    height: 1.35,
    mass: 1450,
    maxSpeed: 38,
    reverseMax: 10,
    accel: 21,
    brake: 16,
    steerRate: 2.05,
    grip: 4.4,
    driftGrip: 1.8,
    maxHealth: 360,
    isBoat: true,
    isBike: false,
    colors: [0xf4f7fb, 0x1ec8d6, 0xff5f45, 0xf4a700],
  },
  police: {
    id: 'police',
    name: 'Patrulla Cruiser',
    halfW: 1.05,
    halfL: 2.42,
    height: 1.48,
    mass: 1620,
    maxSpeed: 40,
    reverseMax: 13,
    accel: 24.5,
    brake: 33,
    steerRate: 2.55,
    grip: 8.8,
    driftGrip: 2.6,
    maxHealth: 380,
    isBoat: false,
    isBike: false,
    colors: [0x171d28],
  },
};

function buildVehicleMesh(THREE, spec, bodyColorHex, shared) {
  const root = new THREE.Group();
  const chassis = new THREE.Group();
  root.add(chassis);

  const paintMat = new THREE.MeshStandardMaterial({
    color: bodyColorHex,
    roughness: spec.id === 'sports' ? 0.28 : 0.44,
    metalness: spec.id === 'sports' ? 0.42 : 0.24,
  });
  const trimMat = shared.darkTrimMat;
  const glassMat = shared.glassMat;
  const headlightMat = shared.headlightMat;
  const brakeMat = shared.brakeIdleMat.clone();

  const steerPivots = [];
  const spinWheels = [];
  let hoodPanel = null;
  let frontBumper = null;
  let rearBumper = null;
  let sirenRedMat = null;
  let sirenBlueMat = null;

  const w = spec.halfW * 2;
  const l = spec.halfL * 2;

  if (spec.isBoat) {
    // Stepped coastal V-hull speedboat
    const hullLower = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.58, l * 0.86), paintMat);
    hullLower.position.set(0, 0.36, -0.15);
    hullLower.castShadow = true;
    chassis.add(hullLower);

    const bowCone = new THREE.Mesh(new THREE.ConeGeometry(w * 0.45, 1.85, 4), paintMat);
    bowCone.rotation.x = Math.PI * 0.5;
    bowCone.rotation.z = Math.PI * 0.25;
    bowCone.position.set(0, 0.46, spec.halfL - 0.55);
    chassis.add(bowCone);
    hoodPanel = bowCone;

    const deckStripe = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.94, 0.16, l * 0.78),
      shared.whiteStripeMat,
    );
    deckStripe.position.set(0, 0.7, -0.12);
    chassis.add(deckStripe);

    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.72, 0.42, 0.95),
      glassMat,
    );
    windshield.position.set(0, 0.95, 0.35);
    windshield.rotation.x = -0.35;
    chassis.add(windshield);

    // Twin outboard motors
    for (const ox of [-0.46, 0.46]) {
      const motor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.68, 0.42), trimMat);
      motor.position.set(ox, 0.52, -spec.halfL + 0.12);
      chassis.add(motor);
    }
  } else if (spec.isBike) {
    // Street sportbike
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.46, 1.35), paintMat);
    frame.position.set(0, 0.66, 0.05);
    frame.castShadow = true;
    chassis.add(frame);
    hoodPanel = frame;

    const fairing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.62), paintMat);
    fairing.position.set(0, 0.82, 0.55);
    fairing.rotation.x = 0.28;
    chassis.add(fairing);

    const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.07, 0.07), trimMat);
    handlebar.position.set(0, 1.04, 0.44);
    chassis.add(handlebar);

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.68), trimMat);
    seat.position.set(0, 0.86, -0.32);
    chassis.add(seat);

    const fPivot = new THREE.Group();
    fPivot.position.set(0, 0.36, 0.86);
    const fWheel = new THREE.Mesh(shared.bikeWheelGeo, trimMat);
    fPivot.add(fWheel);
    chassis.add(fPivot);
    steerPivots.push(fPivot);
    spinWheels.push(fWheel);

    const rWheel = new THREE.Mesh(shared.bikeWheelGeo, trimMat);
    rWheel.position.set(0, 0.36, -0.84);
    chassis.add(rWheel);
    spinWheels.push(rWheel);
  } else {
    // 4-wheel car / SUV / truck / police cruiser
    const lowerH = spec.id === 'truck' ? 0.72 : spec.id === 'sports' ? 0.46 : 0.56;
    const bodyMain = new THREE.Mesh(
      new THREE.BoxGeometry(w, lowerH, l * 0.94),
      paintMat,
    );
    bodyMain.position.set(0, 0.36 + lowerH * 0.5, 0);
    bodyMain.castShadow = true;
    bodyMain.receiveShadow = true;
    chassis.add(bodyMain);

    // Separate deformable hood panel
    hoodPanel = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.92, 0.14, l * 0.28),
      paintMat,
    );
    hoodPanel.position.set(0, 0.36 + lowerH + 0.03, l * 0.3);
    chassis.add(hoodPanel);

    frontBumper = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.02, 0.26, 0.24),
      trimMat,
    );
    frontBumper.position.set(0, 0.38, spec.halfL - 0.06);
    chassis.add(frontBumper);

    rearBumper = new THREE.Mesh(
      new THREE.BoxGeometry(w * 1.02, 0.26, 0.22),
      trimMat,
    );
    rearBumper.position.set(0, 0.38, -spec.halfL + 0.06);
    chassis.add(rearBumper);

    if (spec.id === 'truck') {
      const cab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 1.18, l * 0.28), paintMat);
      cab.position.set(0, 1.52, l * 0.26);
      cab.castShadow = true;
      chassis.add(cab);

      const cabGlass = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.88, 0.56, l * 0.24),
        glassMat,
      );
      cabGlass.position.set(0, 1.72, l * 0.28);
      chassis.add(cabGlass);

      const cargoBox = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.98, 1.65, l * 0.6),
        shared.whiteStripeMat,
      );
      cargoBox.position.set(0, 1.76, -l * 0.17);
      cargoBox.castShadow = true;
      chassis.add(cargoBox);
    } else {
      const cabinLen = spec.id === 'suv' ? l * 0.58 : spec.id === 'sports' ? l * 0.44 : l * 0.48;
      const cabinH = spec.id === 'suv' ? 0.68 : spec.id === 'sports' ? 0.44 : 0.54;
      const cabinZ = spec.id === 'suv' ? -l * 0.08 : -l * 0.04;

      const cabinGlass = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.84, cabinH, cabinLen),
        glassMat,
      );
      cabinGlass.position.set(0, 0.36 + lowerH + cabinH * 0.48, cabinZ);
      chassis.add(cabinGlass);

      const roofCap = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.8, 0.09, cabinLen * 0.86),
        spec.id === 'police' ? shared.whiteStripeMat : paintMat,
      );
      roofCap.position.set(0, 0.36 + lowerH + cabinH, cabinZ);
      chassis.add(roofCap);

      if (spec.id === 'sports') {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.08, 0.28), trimMat);
        wing.position.set(0, 0.36 + lowerH + 0.28, -spec.halfL + 0.26);
        chassis.add(wing);
      }

      if (spec.id === 'police') {
        // White patrol doors + roof strobe bar
        const doorStripe = new THREE.Mesh(
          new THREE.BoxGeometry(w * 1.01, lowerH * 0.78, l * 0.42),
          shared.whiteStripeMat,
        );
        doorStripe.position.set(0, 0.36 + lowerH * 0.52, -0.04);
        chassis.add(doorStripe);

        sirenRedMat = new THREE.MeshBasicMaterial({ color: 0xff2a44 });
        sirenBlueMat = new THREE.MeshBasicMaterial({ color: 0x2986ff });
        const barTopY = 0.36 + lowerH + cabinH + 0.14;
        const redPod = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.24), sirenRedMat);
        redPod.position.set(-0.32, barTopY, cabinZ);
        chassis.add(redPod);
        const bluePod = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.14, 0.24), sirenBlueMat);
        bluePod.position.set(0.32, barTopY, cabinZ);
        chassis.add(bluePod);
      }
    }

    // 4 wheels with front steering pivots
    const wheelY = spec.id === 'truck' ? 0.44 : 0.35;
    const wheelX = spec.halfW - 0.06;
    const frontZ = spec.halfL * 0.64;
    const rearZ = -spec.halfL * 0.62;
    const wGeo = spec.id === 'truck' ? shared.truckWheelGeo : shared.carWheelGeo;

    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * wheelX, wheelY, frontZ);
      const fw = new THREE.Mesh(wGeo, trimMat);
      pivot.add(fw);
      chassis.add(pivot);
      steerPivots.push(pivot);
      spinWheels.push(fw);

      const rw = new THREE.Mesh(wGeo, trimMat);
      rw.position.set(side * wheelX, wheelY, rearZ);
      chassis.add(rw);
      spinWheels.push(rw);
    }
  }

  // Headlights, night light cones & tail/brake lamps
  const headY = spec.isBoat ? 0.65 : 0.56;
  const headX = spec.isBike ? 0 : spec.halfW * 0.68;
  const lampOffsets = spec.isBike ? [0] : [-headX, headX];
  const nightCones = [];

  for (let i = 0; i < lampOffsets.length; i++) {
    const lx = lampOffsets[i];
    const lamp = new THREE.Mesh(shared.lampGeo, headlightMat);
    lamp.position.set(lx, headY, spec.halfL - 0.03);
    chassis.add(lamp);

    const cone = new THREE.Mesh(shared.headlightConeGeo, shared.headlightConeMat);
    cone.position.set(lx, headY - 0.05, spec.halfL + 6.4);
    cone.visible = false;
    chassis.add(cone);
    nightCones.push(cone);

    if (!spec.isBoat) {
      const tail = new THREE.Mesh(shared.lampGeo, brakeMat);
      tail.position.set(lx, headY, -spec.halfL + 0.03);
      chassis.add(tail);
    }
  }

  return {
    root,
    chassis,
    paintMat,
    brakeMat,
    steerPivots,
    spinWheels,
    nightCones,
    hoodPanel,
    frontBumper,
    rearBumper,
    sirenRedMat,
    sirenBlueMat,
  };
}

export function createVehicleManager(THREE, scene, cityWorld, effects) {
  const vehicleGroup = new THREE.Group();
  vehicleGroup.name = 'sol-vehicles-group';
  scene.add(vehicleGroup);

  const carWheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.26, 12);
  carWheelGeo.rotateZ(Math.PI * 0.5);
  const truckWheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.32, 12);
  truckWheelGeo.rotateZ(Math.PI * 0.5);
  const bikeWheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.16, 12);
  bikeWheelGeo.rotateZ(Math.PI * 0.5);
  const lampGeo = new THREE.BoxGeometry(0.28, 0.14, 0.08);
  const headlightConeGeo = new THREE.ConeGeometry(1.95, 13, 10, 1, true);
  headlightConeGeo.rotateX(-Math.PI * 0.5);

  const shared = {
    carWheelGeo,
    truckWheelGeo,
    bikeWheelGeo,
    lampGeo,
    headlightConeGeo,
    darkTrimMat: new THREE.MeshLambertMaterial({ color: 0x1a1e26 }),
    whiteStripeMat: new THREE.MeshLambertMaterial({ color: 0xf1f4f8 }),
    glassMat: new THREE.MeshPhongMaterial({
      color: 0x1d3147,
      specular: 0x9bd7ff,
      shininess: 95,
      transparent: true,
      opacity: 0.82,
    }),
    headlightMat: new THREE.MeshBasicMaterial({ color: 0xfff5cc }),
    brakeIdleMat: new THREE.MeshBasicMaterial({ color: 0x7d121d }),
    headlightConeMat: new THREE.MeshBasicMaterial({
      color: 0xfff2bf,
      transparent: true,
      opacity: 0.13,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  };

  const vehicles = [];
  let nextVehicleId = 1;
  let explosionListener = null;
  let panicTimer = 0;

  const TRAFFIC_POOL_TYPES = ['sedan', 'sedan', 'sports', 'suv', 'suv', 'truck', 'motorcycle'];

  function spawnVehicle(type = 'sedan', x = 0, z = 0, yaw = 0, options = {}) {
    const spec = VEHICLE_SPECS[type] || VEHICLE_SPECS.sedan;
    const colorHex =
      options.color ??
      spec.colors[Math.floor(Math.random() * spec.colors.length) % spec.colors.length];

    const rig = buildVehicleMesh(THREE, spec, colorHex, shared);
    const groundY = cityWorld.getGroundHeight(x, z);
    const startY = spec.isBoat
      ? Math.max(groundY, cityWorld.bounds.seaLevel - 0.12)
      : Math.max(groundY, 0.08);

    rig.root.position.set(x, startY, z);
    rig.root.rotation.y = yaw;
    vehicleGroup.add(rig.root);

    const vehicle = {
      id: nextVehicleId++,
      type: spec.id,
      name: spec.name,
      spec,
      rig,
      mesh: rig.root,
      baseColor: colorHex,
      x,
      y: startY,
      z,
      vx: 0,
      vz: 0,
      speed: 0,
      forwardSpeed: 0,
      yaw,
      steer: 0,
      wheelSpin: 0,
      halfW: spec.halfW,
      halfL: spec.halfL,
      health: options.health ?? spec.maxHealth,
      maxHealth: options.maxHealth ?? spec.maxHealth,
      destroyed: false,
      sinking: false,
      isBoat: spec.isBoat,
      isBike: spec.isBike,
      isPolice: Boolean(options.isPolice || spec.id === 'police'),
      sirenOn: Boolean(options.sirenOn),
      sirenPhase: Math.random() * 6,
      aiMode: options.aiMode || 'parked', // 'parked' | 'traffic' | 'police' | 'convoy' | 'player'
      missionTag: options.missionTag || null,
      persistent: Boolean(options.persistent || options.missionTag),
      driver: options.driver || null,
      smokeAcc: 0,
      turnCooldown: 0,
      targetSpeed: options.targetSpeed || 17,
      waypoints: options.waypoints || null,
      waypointIdx: 0,
    };

    vehicles.push(vehicle);
    return vehicle;
  }

  function removeVehicle(vehicle) {
    const idx = vehicles.indexOf(vehicle);
    if (idx >= 0) {
      vehicles.splice(idx, 1);
    }
    if (vehicle && vehicle.rig && vehicle.rig.root.parent) {
      vehicle.rig.root.parent.remove(vehicle.rig.root);
    }
  }

  function clearTraffic(keepPersistent = true) {
    for (let i = vehicles.length - 1; i >= 0; i--) {
      const v = vehicles[i];
      if (v.aiMode === 'player') continue;
      if (keepPersistent && v.persistent) continue;
      removeVehicle(v);
    }
  }

  function applyVisualDeformation(v) {
    const ratio = Math.max(0, v.health / v.maxHealth);
    const dmg = 1 - ratio;
    const rig = v.rig;

    if (rig.hoodPanel && !v.isBoat && !v.isBike) {
      rig.hoodPanel.rotation.x = -dmg * 0.34;
      rig.hoodPanel.rotation.z = Math.sin(v.id * 2.1) * dmg * 0.14;
    }
    if (rig.frontBumper) {
      rig.frontBumper.rotation.z = -dmg * 0.16;
      rig.frontBumper.position.z = v.halfL - 0.06 - dmg * 0.14;
    }
    if (rig.rearBumper) {
      rig.rearBumper.rotation.z = dmg * 0.14;
    }
    if (v.destroyed) {
      rig.paintMat.color.setHex(0x1f1d1c);
      rig.paintMat.roughness = 0.94;
      rig.paintMat.metalness = 0.05;
    }
  }

  function damageVehicle(v, amount, attackerTag = 'world', hitPos = null) {
    if (!v || v.destroyed || amount <= 0) return false;

    v.health = Math.max(0, v.health - amount);
    applyVisualDeformation(v);

    if (attackerTag === 'player') {
      panicTimer = Math.max(panicTimer, 7.5);
    }

    if (hitPos && effects) {
      effects.spawnBulletImpact(hitPos, { x: 0, y: 1, z: 0 }, 'metal');
    }

    if (v.health <= 0 && !v.destroyed) {
      v.destroyed = true;
      v.sirenOn = false;
      applyVisualDeformation(v);

      const blastPos = { x: v.x, y: v.y + 0.9, z: v.z };
      if (effects) {
        effects.spawnExplosion(blastPos, 8.2);
        effects.playExplosionSound(0);
      }
      panicTimer = 10;

      if (typeof explosionListener === 'function') {
        explosionListener(v, blastPos, attackerTag);
      }

      // Chain damage to nearby vehicles
      for (let i = 0; i < vehicles.length; i++) {
        const other = vehicles[i];
        if (other === v || other.destroyed) continue;
        const d = Math.hypot(other.x - v.x, other.z - v.z);
        if (d < 9.5) {
          const splash = (1 - d / 9.5) * 210;
          damageVehicle(other, splash, attackerTag);
        }
      }
      return true;
    }
    return false;
  }

  function raycastVehicles(origin, dir, maxDist = 120, ignoreVehicle = null) {
    let bestT = maxDist;
    let bestVehicle = null;
    const hitPoint = new THREE.Vector3();
    const hitNormal = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v === ignoreVehicle) continue;

      // Quick bounding sphere pre-reject
      const dx = v.x - origin.x;
      const dz = v.z - origin.z;
      const along = dx * dir.x + dz * dir.z;
      if (along < -4 || along > bestT + 4) continue;

      // Transform ray into vehicle local coordinates
      const cosY = Math.cos(-v.yaw);
      const sinY = Math.sin(-v.yaw);
      const relX = origin.x - v.x;
      const relY = origin.y - (v.y + v.spec.height * 0.52);
      const relZ = origin.z - v.z;

      const locOX = relX * cosY + relZ * sinY;
      const locOZ = -relX * sinY + relZ * cosY;
      const locDX = dir.x * cosY + dir.z * sinY;
      const locDY = dir.y;
      const locDZ = -dir.x * sinY + dir.z * cosY;

      const hx = v.halfW;
      const hy = v.spec.height * 0.52;
      const hz = v.halfL;

      const invX = Math.abs(locDX) > 1e-6 ? 1 / locDX : 1e9;
      const invY = Math.abs(locDY) > 1e-6 ? 1 / locDY : 1e9;
      const invZ = Math.abs(locDZ) > 1e-6 ? 1 / locDZ : 1e9;

      const t1 = (-hx - locOX) * invX;
      const t2 = (hx - locOX) * invX;
      const t3 = (-hy - relY) * invY;
      const t4 = (hy - relY) * invY;
      const t5 = (-hz - locOZ) * invZ;
      const t6 = (hz - locOZ) * invZ;

      const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4), Math.min(t5, t6));
      const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4), Math.max(t5, t6));

      if (tmax >= Math.max(0, tmin) && tmin < bestT && tmin > 0.05) {
        bestT = tmin;
        bestVehicle = v;
        hitPoint.set(
          origin.x + dir.x * bestT,
          origin.y + dir.y * bestT,
          origin.z + dir.z * bestT,
        );
      }
    }

    if (!bestVehicle) return { hit: false, distance: maxDist, vehicle: null, point: null, normal: null };
    return {
      hit: true,
      distance: bestT,
      vehicle: bestVehicle,
      point: hitPoint,
      normal: hitNormal,
    };
  }

  function findNearestEnterable(x, z, maxDist = 5.2) {
    let best = null;
    let bestD = maxDist;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v.destroyed || v.sinking) continue;
      // Boats have a slightly larger boarding reach from piers/shoreline
      const limit = v.isBoat ? maxDist + 2.6 : maxDist;
      const d = Math.hypot(v.x - x, v.z - z);
      if (d < limit && d < bestD + (v.isBoat ? 2.2 : 0)) {
        bestD = d;
        best = v;
      }
    }
    return best;
  }

  function getExitPosition(v) {
    // Try left driver door, then right passenger door, then rear
    const rightX = Math.cos(v.yaw);
    const rightZ = -Math.sin(v.yaw);
    const candidates = [
      { x: v.x - rightX * (v.halfW + 1.05), z: v.z - rightZ * (v.halfW + 1.05) },
      { x: v.x + rightX * (v.halfW + 1.05), z: v.z + rightZ * (v.halfW + 1.05) },
      { x: v.x - Math.sin(v.yaw) * (v.halfL + 1.1), z: v.z - Math.cos(v.yaw) * (v.halfL + 1.1) },
    ];

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      const col = cityWorld.resolveCircleCollision(c.x, c.z, 0.5, v.y + 0.5);
      if (!col.hit && (!v.isBoat || !cityWorld.isWaterAt(col.x, col.z))) {
        return { x: col.x, y: Math.max(0, cityWorld.getGroundHeight(col.x, col.z)), z: col.z };
      }
    }
    const fallback = candidates[0];
    return {
      x: fallback.x,
      y: Math.max(cityWorld.bounds.seaLevel, cityWorld.getGroundHeight(fallback.x, fallback.z)),
      z: fallback.z,
    };
  }

  function resolvePairCollisions(playerPos) {
    for (let i = 0; i < vehicles.length; i++) {
      const a = vehicles[i];
      for (let j = i + 1; j < vehicles.length; j++) {
        const b = vehicles[j];
        const minSep = (a.halfW + b.halfW) * 0.92 + (a.halfL + b.halfL) * 0.36;
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const distSq = dx * dx + dz * dz;
        if (distSq >= minSep * minSep || distSq < 1e-6) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const nz = dz / dist;
        const overlap = minSep - dist;

        const totalMass = a.spec.mass + b.spec.mass;
        const ratioA = b.spec.mass / totalMass;
        const ratioB = a.spec.mass / totalMass;

        a.x -= nx * overlap * ratioA;
        a.z -= nz * overlap * ratioA;
        b.x += nx * overlap * ratioB;
        b.z += nz * overlap * ratioB;

        const relVx = b.vx - a.vx;
        const relVz = b.vz - a.vz;
        const closing = -(relVx * nx + relVz * nz);
        if (closing > 1.2) {
          const impulse = closing * 0.72;
          a.vx -= nx * impulse * ratioA;
          a.vz -= nz * impulse * ratioA;
          b.vx += nx * impulse * ratioB;
          b.vz += nz * impulse * ratioB;

          if (closing > 9) {
            const crashDmg = (closing - 8) * 2.4;
            const byPlayer = a.aiMode === 'player' || b.aiMode === 'player';
            damageVehicle(a, crashDmg * ratioA, byPlayer ? 'player' : 'traffic');
            damageVehicle(b, crashDmg * ratioB, byPlayer ? 'player' : 'traffic');
            if (effects && playerPos) {
              const dPlayer = Math.hypot(a.x - playerPos.x, a.z - playerPos.z);
              effects.playCollisionSound(Math.min(1, closing / 26), dPlayer);
            }
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Driving Dynamics, Boat Buoyancy, AI Lane Following & Ambient Traffic Pool
  // ---------------------------------------------------------------------------
  function stepVehiclePhysics(v, ctrl, dt, isNight, simTime, isPlayerDriven = false) {
    const spec = v.spec;
    const throttle = v.destroyed ? 0 : Math.max(-1, Math.min(1, ctrl.throttle || 0));
    const steerInput = v.destroyed ? 0 : Math.max(-1, Math.min(1, ctrl.steer || 0));
    const handbrake = Boolean(ctrl.handbrake) && !v.destroyed;

    const fwdX = Math.sin(v.yaw);
    const fwdZ = Math.cos(v.yaw);
    const rightX = Math.cos(v.yaw);
    const rightZ = -Math.sin(v.yaw);

    let fwdVel = v.vx * fwdX + v.vz * fwdZ;
    let latVel = v.vx * rightX + v.vz * rightZ;

    const inWater = cityWorld.isWaterAt(v.x, v.z);

    if (v.isBoat) {
      // Boats thrive on water, drag heavily if beached on sand
      if (!inWater) {
        fwdVel *= Math.exp(-dt * 5.5);
        latVel *= Math.exp(-dt * 7.5);
      } else {
        if (throttle > 0.01) {
          fwdVel += throttle * spec.accel * dt;
        } else if (throttle < -0.01) {
          fwdVel += throttle * (fwdVel > 0.8 ? spec.brake : spec.accel * 0.55) * dt;
        } else {
          fwdVel *= Math.exp(-dt * 0.95);
        }
        fwdVel = Math.max(-spec.reverseMax, Math.min(spec.maxSpeed, fwdVel));
        latVel *= Math.exp(-dt * spec.grip);

        const steerAuthority = Math.min(1, Math.abs(fwdVel) / 4.5);
        const dirSign = fwdVel >= -0.2 ? 1 : -1;
        v.yaw -= steerInput * spec.steerRate * steerAuthority * dirSign * dt;

        if (Math.abs(fwdVel) > 4 && effects) {
          v.smokeAcc += dt;
          if (v.smokeAcc > 0.06) {
            v.smokeAcc = 0;
            effects.spawnWaterWake(v, v.yaw, Math.abs(fwdVel));
          }
        }
      }
    } else {
      // Land vehicle dynamics
      if (inWater && cityWorld.getGroundHeight(v.x, v.z) < -1.45) {
        v.sinking = true;
        fwdVel *= Math.exp(-dt * 4.2);
        latVel *= Math.exp(-dt * 4.2);
        damageVehicle(v, 38 * dt, 'water');
      } else {
        if (handbrake) {
          fwdVel *= Math.exp(-dt * 2.9);
        } else if (throttle > 0.01) {
          if (fwdVel < -0.6) {
            fwdVel += throttle * spec.brake * dt;
          } else {
            const topRatio = Math.max(0.15, 1 - Math.max(0, fwdVel) / spec.maxSpeed);
            fwdVel += throttle * spec.accel * (0.45 + 0.55 * topRatio) * dt;
          }
        } else if (throttle < -0.01) {
          if (fwdVel > 0.8) {
            fwdVel += throttle * spec.brake * dt;
          } else {
            fwdVel += throttle * spec.accel * 0.58 * dt;
          }
        } else {
          fwdVel *= Math.exp(-dt * 1.15);
        }

        fwdVel = Math.max(-spec.reverseMax, Math.min(spec.maxSpeed, fwdVel));

        const speedAbs = Math.abs(fwdVel);
        const steerScale =
          Math.min(1, speedAbs / 3.2) * (1 / (1 + speedAbs * 0.022));
        const revSign = fwdVel >= -0.15 ? 1 : -1;
        const driftBoost = handbrake ? 1.28 : 1.0;
        v.yaw -= steerInput * spec.steerRate * steerScale * revSign * driftBoost * dt;

        const gripRate = handbrake ? spec.driftGrip : spec.grip;
        latVel *= Math.exp(-dt * gripRate);
      }
    }

    const newFwdX = Math.sin(v.yaw);
    const newFwdZ = Math.cos(v.yaw);
    const newRightX = Math.cos(v.yaw);
    const newRightZ = -Math.sin(v.yaw);

    v.vx = newFwdX * fwdVel + newRightX * latVel;
    v.vz = newFwdZ * fwdVel + newRightZ * latVel;
    v.forwardSpeed = fwdVel;
    v.speed = Math.hypot(v.vx, v.vz);

    v.x += v.vx * dt;
    v.z += v.vz * dt;

    // World building & boundary collision
    const col = cityWorld.resolveBoxCollision(v.x, v.z, v.halfW, v.halfL, v.yaw);
    if (col.hit) {
      const impact = Math.abs(v.vx * col.normalX + v.vz * col.normalZ);
      v.x = col.x;
      v.z = col.z;
      if (impact > 0.5) {
        v.vx += col.normalX * impact * 1.28;
        v.vz += col.normalZ * impact * 1.28;
        v.vx *= 0.72;
        v.vz *= 0.72;
        if (impact > 9.5) {
          damageVehicle(v, (impact - 8.5) * 2.6, isPlayerDriven ? 'player' : 'world');
          if (effects && isPlayerDriven) {
            effects.playCollisionSound(Math.min(1, impact / 24), 0);
          }
        }
      }
    }

    // Ground & ocean wave height placement
    const groundY = cityWorld.getGroundHeight(v.x, v.z);
    if (v.isBoat && inWater) {
      const bob = Math.sin(simTime * 2.4 + v.id) * 0.08;
      v.y = cityWorld.bounds.seaLevel - 0.1 + bob;
    } else {
      v.y = Math.max(groundY, v.sinking ? -1.4 : groundY) + 0.02;
    }

    // Visual wheel spin, steering angle, body roll/pitch, brake lamps & headlights
    v.steer += (-steerInput * 0.52 - v.steer) * Math.min(1, dt * 12);
    v.wheelSpin += fwdVel * dt * 2.7;

    const rig = v.rig;
    for (let i = 0; i < rig.steerPivots.length; i++) {
      rig.steerPivots[i].rotation.y = v.steer;
    }
    for (let i = 0; i < rig.spinWheels.length; i++) {
      rig.spinWheels[i].rotation.x = v.wheelSpin;
    }

    // Subtle chassis lean into turns or bike bank angle
    const targetRoll = v.isBike
      ? steerInput * Math.min(0.42, v.speed * 0.015)
      : -latVel * 0.018;
    const targetPitch = v.isBoat
      ? -Math.min(0.14, Math.max(-0.05, fwdVel * 0.004))
      : throttle * -0.022;
    rig.chassis.rotation.z += (targetRoll - rig.chassis.rotation.z) * Math.min(1, dt * 9);
    rig.chassis.rotation.x += (targetPitch - rig.chassis.rotation.x) * Math.min(1, dt * 9);

    const braking = (throttle < -0.1 && fwdVel > 1) || handbrake;
    rig.brakeMat.color.setHex(braking ? 0xff2a3c : 0x6e101a);

    const showBeams = Boolean(isNight) && !v.destroyed && (v.aiMode !== 'parked' || v.sirenOn);
    for (let i = 0; i < rig.nightCones.length; i++) {
      rig.nightCones[i].visible = showBeams;
    }

    // Police lightbar red/blue alternating strobes
    if (rig.sirenRedMat && rig.sirenBlueMat) {
      if (v.sirenOn && !v.destroyed) {
        v.sirenPhase += dt * 13;
        const leftHot = Math.sin(v.sirenPhase) > 0;
        rig.sirenRedMat.color.setHex(leftHot ? 0xff2942 : 0x450b14);
        rig.sirenBlueMat.color.setHex(leftHot ? 0x0b234d : 0x3395ff);
      } else {
        rig.sirenRedMat.color.setHex(0x52101b);
        rig.sirenBlueMat.color.setHex(0x10284f);
      }
    }

    // Drift tire smoke & engine damage smoke
    const slip = Math.abs(latVel) + (handbrake && v.speed > 6 ? 4 : 0);
    if (!v.isBoat && slip > 3.6 && v.speed > 5 && effects) {
      v.smokeAcc += dt;
      if (v.smokeAcc > 0.055) {
        v.smokeAcc = 0;
        const rearPos = {
          x: v.x - newFwdX * (v.halfL * 0.65),
          y: v.y,
          z: v.z - newFwdZ * (v.halfL * 0.65),
        };
        effects.spawnTireSmoke(rearPos, Math.min(1.4, slip / 6));
      }
    }

    if (v.health < v.maxHealth * 0.45 && effects) {
      v.smokeAcc += dt;
      if (v.smokeAcc > 0.09) {
        v.smokeAcc = 0;
        const hoodPos = {
          x: v.x + newFwdX * (v.halfL * 0.58),
          y: v.y + 0.65,
          z: v.z + newFwdZ * (v.halfL * 0.58),
        };
        effects.spawnDamageSmoke(hoodPos, v.health < v.maxHealth * 0.18 || v.destroyed);
      }
    }

    if (isPlayerDriven && effects) {
      const skidLevel = !v.isBoat && slip > 3.8 && v.speed > 5 ? Math.min(1, (slip - 3.5) / 7) : 0;
      effects.setTireSkidState(skidLevel);
      effects.setEngineState(true, v.speed / spec.maxSpeed, v.type, throttle);
    }

    rig.root.position.set(v.x, v.y, v.z);
    rig.root.rotation.y = v.yaw;
  }

  function computeTrafficControl(v, dt, simTime, playerPos) {
    if (v.destroyed || v.aiMode === 'parked') {
      return { throttle: 0, steer: 0, handbrake: true };
    }

    // Waypoint-driven mission convoy or rival racer
    if (v.waypoints && v.waypoints.length > 0) {
      const wp = v.waypoints[v.waypointIdx % v.waypoints.length];
      const dx = wp.x - v.x;
      const dz = wp.z - v.z;
      const dist = Math.hypot(dx, dz);
      if (dist < (wp.radius || 11)) {
        v.waypointIdx = (v.waypointIdx + 1) % v.waypoints.length;
      }
      const desiredYaw = Math.atan2(dx, dz);
      let diff = desiredYaw - v.yaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const steer = Math.max(-1, Math.min(1, -diff * 1.65));
      const desiredSpd = v.targetSpeed || 24;
      const throttle = v.speed < desiredSpd ? 0.85 : -0.15;
      return { throttle, steer, handbrake: Math.abs(diff) > 1.25 && v.speed > 16 };
    }

    // Standard city lane-following AI traffic
    v.turnCooldown = Math.max(0, v.turnCooldown - dt);
    const fwdX = Math.sin(v.yaw);
    const fwdZ = Math.cos(v.yaw);
    const panicked = panicTimer > 0 && playerPos && Math.hypot(v.x - playerPos.x, v.z - playerPos.z) < 65;

    let desiredSpeed = panicked ? v.spec.maxSpeed * 0.82 : v.targetSpeed;
    let shouldStop = false;

    // Check traffic signals ahead when calm
    if (!panicked) {
      const roadX = cityWorld.roadX;
      const roadZ = cityWorld.roadZ;
      const movingNS = Math.abs(fwdZ) > Math.abs(fwdX);

      if (movingNS) {
        for (let j = 0; j < roadZ.length; j++) {
          const distAhead = (roadZ[j] - v.z) * Math.sign(fwdZ);
          if (distAhead > 10 && distAhead < 22) {
            const sig = cityWorld.getTrafficLightState(v.x, roadZ[j], simTime);
            if (sig !== 'ns') shouldStop = true;
            else if (v.turnCooldown <= 0 && distAhead < 13 && (v.id % 4 === 0)) {
              v.yaw += (v.id % 2 === 0 ? 1 : -1) * Math.PI * 0.5;
              v.turnCooldown = 6;
            }
            break;
          }
        }
      } else {
        for (let i = 0; i < roadX.length; i++) {
          const distAhead = (roadX[i] - v.x) * Math.sign(fwdX);
          if (distAhead > 10 && distAhead < 22) {
            const sig = cityWorld.getTrafficLightState(roadX[i], v.z, simTime);
            if (sig !== 'ew') shouldStop = true;
            else if (v.turnCooldown <= 0 && distAhead < 13 && (v.id % 4 === 1)) {
              v.yaw += (v.id % 2 === 0 ? 1 : -1) * Math.PI * 0.5;
              v.turnCooldown = 6;
            }
            break;
          }
        }
      }
    }

    // Check vehicles & player directly ahead in lane
    for (let i = 0; i < vehicles.length; i++) {
      const other = vehicles[i];
      if (other === v) continue;
      const dx = other.x - v.x;
      const dz = other.z - v.z;
      const ahead = dx * fwdX + dz * fwdZ;
      const side = Math.abs(dx * fwdZ - dz * fwdX);
      if (ahead > 2 && ahead < 15 && side < 2.6) {
        shouldStop = true;
        break;
      }
    }
    if (!panicked && playerPos) {
      const dx = playerPos.x - v.x;
      const dz = playerPos.z - v.z;
      const ahead = dx * fwdX + dz * fwdZ;
      const side = Math.abs(dx * fwdZ - dz * fwdX);
      if (ahead > 1.5 && ahead < 12 && side < 2.2) {
        shouldStop = true;
      }
    }

    // Snap gentle steering alignment to cardinal lane heading
    const cardinalYaw = Math.round(v.yaw / (Math.PI * 0.5)) * (Math.PI * 0.5);
    let yawErr = cardinalYaw - v.yaw;
    while (yawErr > Math.PI) yawErr -= Math.PI * 2;
    while (yawErr < -Math.PI) yawErr += Math.PI * 2;

    // Turn around if approaching map edge or harbor water
    const lookX = v.x + fwdX * 20;
    const lookZ = v.z + fwdZ * 20;
    if (
      Math.abs(lookX) > 465 ||
      Math.abs(lookZ) > 465 ||
      ( !v.isBoat && cityWorld.isWaterAt(lookX, lookZ) )
    ) {
      if (v.turnCooldown <= 0) {
        v.yaw += Math.PI * 0.5;
        v.turnCooldown = 3.5;
      }
    }

    const steer = Math.max(-1, Math.min(1, -yawErr * 2.1));
    if (shouldStop) {
      return { throttle: v.forwardSpeed > 1 ? -0.9 : 0, steer, handbrake: v.forwardSpeed < 1.5 };
    }
    const throttle = v.forwardSpeed < desiredSpeed ? 0.62 : -0.1;
    return { throttle, steer, handbrake: false };
  }

  function maintainAmbientTraffic(playerPos, density = 1.0) {
    if (!playerPos) return;
    const desiredCount = Math.round(18 * Math.max(0, Math.min(1.6, density)));

    // Despawn far ambient traffic
    let ambientCount = 0;
    for (let i = vehicles.length - 1; i >= 0; i--) {
      const v = vehicles[i];
      if (v.aiMode !== 'traffic') continue;
      const d = Math.hypot(v.x - playerPos.x, v.z - playerPos.z);
      if (d > 195 || (v.destroyed && d > 75)) {
        removeVehicle(v);
      } else {
        ambientCount++;
      }
    }

    if (ambientCount < desiredCount) {
      const spawn = cityWorld.getRandomRoadSpawn(null, playerPos.x, playerPos.z, 62, 160);
      // Avoid spawning on top of another vehicle
      let clear = true;
      for (let i = 0; i < vehicles.length; i++) {
        if (Math.hypot(vehicles[i].x - spawn.x, vehicles[i].z - spawn.z) < 11) {
          clear = false;
          break;
        }
      }
      if (clear) {
        const chosenType =
          TRAFFIC_POOL_TYPES[Math.floor(Math.random() * TRAFFIC_POOL_TYPES.length)];
        const v = spawnVehicle(chosenType, spawn.x, spawn.z, spawn.yaw, {
          aiMode: 'traffic',
          targetSpeed: spawn.speedLimit,
        });
        v.vx = Math.sin(spawn.yaw) * (spawn.speedLimit * 0.55);
        v.vz = Math.cos(spawn.yaw) * (spawn.speedLimit * 0.55);
      }
    }
  }

  function update(dt, context = {}) {
    const playerPos = context.playerPos || null;
    const playerVehicle = context.playerVehicle || null;
    const playerInput = context.playerInput || null;
    const simTime = context.simTime || 0;
    const isNight = Boolean(context.isNight);
    const trafficDensity = context.trafficDensity ?? 1.0;

    panicTimer = Math.max(0, panicTimer - dt);
    maintainAmbientTraffic(playerPos, trafficDensity);

    let playerDrivingAny = false;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      if (v === playerVehicle && playerInput) {
        playerDrivingAny = true;
        stepVehiclePhysics(
          v,
          {
            throttle: playerInput.moveZ,
            steer: playerInput.moveX,
            handbrake: playerInput.handbrake,
          },
          dt,
          isNight,
          simTime,
          true,
        );
      } else if (v.aiMode === 'police') {
        // Police vehicles receive custom pursuit control via v.externalControl
        const ctrl = v.externalControl || { throttle: 0, steer: 0, handbrake: true };
        stepVehiclePhysics(v, ctrl, dt, isNight, simTime, false);
      } else {
        const ctrl = computeTrafficControl(v, dt, simTime, playerPos);
        stepVehiclePhysics(v, ctrl, dt, isNight, simTime, false);
      }
    }

    if (!playerDrivingAny && effects) {
      effects.setEngineState(false, 0, 'sedan', 0);
      effects.setTireSkidState(0);
    }

    resolvePairCollisions(playerPos);
  }

  return {
    specs: VEHICLE_SPECS,
    vehicles,
    spawnVehicle,
    removeVehicle,
    clearTraffic,
    damageVehicle,
    raycastVehicles,
    findNearestEnterable,
    getExitPosition,
    stepVehiclePhysics,
    triggerPanic(seconds = 8) {
      panicTimer = Math.max(panicTimer, seconds);
    },
    onExplosion(fn) {
      explosionListener = fn;
    },
    update,
  };
}


