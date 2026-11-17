// Player character, limb-based humanoid rigs, weapons combat & pedestrian NPCs

export const WEAPONS = [
  {
    id: 'fist',
    slot: 1,
    name: 'Unarmed',
    shortName: 'FIST',
    damage: 26,
    range: 2.35,
    fireRate: 2.6,
    pellets: 1,
    spread: 0.05,
    automatic: false,
    melee: true,
    driveBy: false,
    twoHanded: false,
    defaultAmmo: Infinity,
    maxAmmo: Infinity,
  },
  {
    id: 'pistol',
    slot: 2,
    name: 'Solis 9mm',
    shortName: '9MM',
    damage: 30,
    range: 78,
    fireRate: 4.4,
    pellets: 1,
    spread: 0.018,
    automatic: false,
    melee: false,
    driveBy: true,
    twoHanded: false,
    defaultAmmo: 72,
    maxAmmo: 240,
  },
  {
    id: 'shotgun',
    slot: 3,
    name: 'Costa Pump',
    shortName: 'SG',
    damage: 17,
    range: 36,
    fireRate: 1.25,
    pellets: 7,
    spread: 0.088,
    automatic: false,
    melee: false,
    driveBy: false,
    twoHanded: true,
    defaultAmmo: 32,
    maxAmmo: 96,
  },
  {
    id: 'smg',
    slot: 4,
    name: 'Brisa SMG',
    shortName: 'SMG',
    damage: 20,
    range: 64,
    fireRate: 10.5,
    pellets: 1,
    spread: 0.038,
    automatic: true,
    melee: false,
    driveBy: true,
    twoHanded: false,
    defaultAmmo: 150,
    maxAmmo: 450,
  },
  {
    id: 'rifle',
    slot: 5,
    name: 'Dorado Carbine',
    shortName: 'AR',
    damage: 36,
    range: 125,
    fireRate: 7.2,
    pellets: 1,
    spread: 0.014,
    automatic: true,
    melee: false,
    driveBy: false,
    twoHanded: true,
    defaultAmmo: 120,
    maxAmmo: 360,
  },
];

const SKIN_TONES = [0xe0ac82, 0xc68b63, 0xf0c4a0, 0x8d5b3c, 0xd49a70];
const SHIRT_COLORS = [0xff6b8b, 0x24d6c4, 0xf7e3af, 0x4aa3ff, 0xff9a44, 0xd8d0f8, 0x4cd97b];
const PANTS_COLORS = [0x263246, 0x3b3f47, 0xd8ccb8, 0x2a4556, 0x4a3b34];
const HAIR_COLORS = [0x1c1815, 0x3d281a, 0x6b4728, 0x29262b, 0x9e7444];

export function buildHumanoidRig(THREE, appearance = {}) {
  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = 0.92;
  root.add(hips);

  const skinColor =
    appearance.skinColor ?? SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)];
  const shirtColor =
    appearance.shirtColor ?? SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)];
  const pantsColor =
    appearance.pantsColor ?? PANTS_COLORS[Math.floor(Math.random() * PANTS_COLORS.length)];
  const hairColor =
    appearance.hairColor ?? HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];

  const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
  const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1a1d24 });
  const gunMetalMat = new THREE.MeshLambertMaterial({ color: 0x232832 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.56, 0.25), shirtMat);
  torso.position.y = 0.28;
  torso.castShadow = true;
  hips.add(torso);

  if (appearance.vestColor) {
    const vestMat = new THREE.MeshLambertMaterial({ color: appearance.vestColor });
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.49, 0.44, 0.28), vestMat);
    vest.position.y = 0.3;
    hips.add(vest);
  }

  // Head + hair / cap + optional sunglasses
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.6;
  hips.add(headPivot);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.3), skinMat);
  headMesh.position.y = 0.16;
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  const hairCap = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.11, 0.32),
    appearance.hatColor
      ? new THREE.MeshLambertMaterial({ color: appearance.hatColor })
      : hairMat,
  );
  hairCap.position.y = 0.3;
  headPivot.add(hairCap);

  if (appearance.hatColor) {
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.16),
      new THREE.MeshLambertMaterial({ color: 0x11151c }),
    );
    visor.position.set(0, 0.25, 0.19);
    headPivot.add(visor);
  }

  if (appearance.sunglasses) {
    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.065, 0.05), shoeMat);
    shades.position.set(0, 0.19, 0.145);
    headPivot.add(shades);
  }

  // Left & Right Arms
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.31, 0.52, 0);
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.14), skinMat);
  leftArm.position.y = -0.22;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);
  hips.add(leftArmPivot);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.31, 0.52, 0);
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.52, 0.14), skinMat);
  rightArm.position.y = -0.22;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);
  hips.add(rightArmPivot);

  // Equipped weapon prop attached to right hand
  const weaponMount = new THREE.Group();
  weaponMount.position.set(0, -0.44, 0.12);
  rightArmPivot.add(weaponMount);

  const weaponMeshes = {
    pistol: new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.11, 0.26), gunMetalMat),
    shotgun: new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.68), gunMetalMat),
    smg: new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.14, 0.38), gunMetalMat),
    rifle: new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.13, 0.78), gunMetalMat),
  };
  Object.keys(weaponMeshes).forEach((k) => {
    const m = weaponMeshes[k];
    m.position.z = 0.16;
    m.visible = false;
    weaponMount.add(m);
  });

  // Left & Right Legs
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.12, 0.02, 0);
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.58, 0.18), pantsMat);
  leftLeg.position.y = -0.29;
  leftLeg.castShadow = true;
  leftLegPivot.add(leftLeg);
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.24), shoeMat);
  leftShoe.position.set(0, -0.58, 0.03);
  leftLegPivot.add(leftShoe);
  hips.add(leftLegPivot);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.12, 0.02, 0);
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.58, 0.18), pantsMat);
  rightLeg.position.y = -0.29;
  rightLeg.castShadow = true;
  rightLegPivot.add(rightLeg);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.24), shoeMat);
  rightShoe.position.set(0, -0.58, 0.03);
  rightLegPivot.add(rightShoe);
  hips.add(rightLegPivot);

  function setEquippedWeapon(weaponId) {
    Object.keys(weaponMeshes).forEach((k) => {
      weaponMeshes[k].visible = k === weaponId;
    });
  }

  return {
    root,
    hips,
    torso,
    headPivot,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    rightLegPivot,
    weaponMount,
    weaponMeshes,
    setEquippedWeapon,
    walkPhase: Math.random() * Math.PI * 2,
    punchPhase: 0,
    recoil: 0,
  };
}

export function animateCharacterRig(rig, state, dt) {
  if (!rig) return;

  if (state.dead) {
    rig.hips.position.y += (0.22 - rig.hips.position.y) * Math.min(1, dt * 10);
    rig.hips.rotation.x += (-Math.PI * 0.48 - rig.hips.rotation.x) * Math.min(1, dt * 10);
    rig.leftArmPivot.rotation.x = -0.4;
    rig.rightArmPivot.rotation.x = -0.35;
    rig.leftLegPivot.rotation.x = 0.1;
    rig.rightLegPivot.rotation.x = -0.15;
    return;
  }

  rig.hips.rotation.x += (0 - rig.hips.rotation.x) * Math.min(1, dt * 10);
  rig.recoil = Math.max(0, rig.recoil - dt * 6);

  const speed = state.speed || 0;
  const swimming = Boolean(state.swimming);

  if (swimming) {
    rig.walkPhase += dt * 5.2;
    rig.hips.position.y = 0.48 + Math.sin(rig.walkPhase) * 0.06;
    rig.hips.rotation.x = 0.45;
    rig.leftArmPivot.rotation.x = Math.sin(rig.walkPhase) * 1.1 - 0.7;
    rig.rightArmPivot.rotation.x = -Math.sin(rig.walkPhase) * 1.1 - 0.7;
    rig.leftLegPivot.rotation.x = Math.cos(rig.walkPhase) * 0.45;
    rig.rightLegPivot.rotation.x = -Math.cos(rig.walkPhase) * 0.45;
    return;
  }

  if (speed > 0.25) {
    const strideFreq = 3.6 + Math.min(8.5, speed * 0.95);
    rig.walkPhase += dt * strideFreq;
    const amp = Math.min(0.82, 0.22 + speed * 0.065);
    const swing = Math.sin(rig.walkPhase) * amp;

    rig.hips.position.y = 0.92 + Math.abs(Math.cos(rig.walkPhase)) * 0.045;
    rig.leftLegPivot.rotation.x = swing;
    rig.rightLegPivot.rotation.x = -swing;
    rig.leftArmPivot.rotation.x = -swing * 0.85;
    rig.rightArmPivot.rotation.x = swing * 0.85;
  } else {
    rig.walkPhase += dt * 2.1;
    rig.hips.position.y = 0.92 + Math.sin(rig.walkPhase) * 0.014;
    rig.leftLegPivot.rotation.x *= Math.exp(-dt * 10);
    rig.rightLegPivot.rotation.x *= Math.exp(-dt * 10);
    rig.leftArmPivot.rotation.x *= Math.exp(-dt * 10);
    rig.rightArmPivot.rotation.x *= Math.exp(-dt * 10);
  }

  // Aiming or melee punch override on upper body
  if (state.punchTimer > 0) {
    const punchLift = Math.sin((state.punchTimer / 0.28) * Math.PI);
    rig.rightArmPivot.rotation.x = -1.48 * punchLift;
    rig.hips.rotation.y = 0.28 * punchLift;
  } else {
    rig.hips.rotation.y *= Math.exp(-dt * 10);
    if (state.aiming) {
      const aimPitch = state.aimPitch || 0;
      rig.rightArmPivot.rotation.x = -Math.PI * 0.5 - aimPitch + rig.recoil * 0.35;
      rig.rightArmPivot.rotation.y = -0.08;
      if (state.twoHanded) {
        rig.leftArmPivot.rotation.x = -Math.PI * 0.48 - aimPitch;
        rig.leftArmPivot.rotation.y = 0.38;
      } else {
        rig.leftArmPivot.rotation.y = 0;
      }
    } else {
      rig.rightArmPivot.rotation.y = 0;
      rig.leftArmPivot.rotation.y = 0;
    }
  }
}

export function createActorsAndCombat(THREE, scene, cityWorld, vehicleMgr, effects) {
  const actorGroup = new THREE.Group();
  actorGroup.name = 'sol-actors-group';
  scene.add(actorGroup);

  const pickupGroup = new THREE.Group();
  pickupGroup.name = 'sol-pickups-group';
  scene.add(pickupGroup);

  // Player rig (Mateo Vega — teal/sun-gold coastal jacket)
  const playerRig = buildHumanoidRig(THREE, {
    skinColor: 0xd9a176,
    shirtColor: 0x168d8e,
    vestColor: 0xf4a700,
    pantsColor: 0x1f2838,
    hairColor: 0x1c1715,
    sunglasses: true,
  });
  actorGroup.add(playerRig.root);

  const startX = cityWorld.landmarks.safehouse.x + 12;
  const startZ = cityWorld.landmarks.safehouse.z + 4;

  const player = {
    x: startX,
    y: cityWorld.getGroundHeight(startX, startZ),
    z: startZ,
    vx: 0,
    vy: 0,
    vz: 0,
    speed: 0,
    yaw: 0.4,
    onGround: true,
    swimming: false,
    sprinting: false,
    aiming: false,
    aimPitch: 0,
    inVehicle: false,
    vehicle: null,
    health: 100,
    maxHealth: 100,
    armor: 50,
    maxArmor: 100,
    stamina: 100,
    maxStamina: 100,
    cash: 650,
    weaponIndex: 1, // Solis 9mm default
    weapons: WEAPONS.map((w, idx) => ({
      def: w,
      unlocked: idx <= 1 || idx === 3, // Fist, 9mm, and Brisa SMG available early; all unlockable
      ammo: w.defaultAmmo,
    })),
    fireCooldown: 0,
    punchTimer: 0,
    hitMarkerTimer: 0,
    damageFlashTimer: 0,
    invulnTimer: 0,
    dead: false,
    arrested: false,
    downTimer: 0,
    rig: playerRig,
  };
  playerRig.setEquippedWeapon(WEAPONS[player.weaponIndex].id);
  playerRig.root.position.set(player.x, player.y, player.z);

  const peds = [];
  const pickups = [];
  let nextPedId = 1;
  let crimeCallback = null;
  let externalTargetsGetter = null;
  let playerDownCallback = null;

  // Shared pickup geometries & materials
  const pickupGeo = new THREE.OctahedronGeometry(0.36, 0);
  const pickupMats = {
    cash: new THREE.MeshBasicMaterial({ color: 0x37d67a }),
    health: new THREE.MeshBasicMaterial({ color: 0xff5468 }),
    armor: new THREE.MeshBasicMaterial({ color: 0x3b9eff }),
    ammo: new THREE.MeshBasicMaterial({ color: 0xf4a700 }),
  };

  function emitCrime(type, severity = 1, x = player.x, z = player.z) {
    if (typeof crimeCallback === 'function') {
      crimeCallback(type, severity, { x, z });
    }
  }

  function spawnPickup(kind = 'cash', x = 0, z = 0, value = 120) {
    const mat = pickupMats[kind] || pickupMats.cash;
    const mesh = new THREE.Mesh(pickupGeo, mat);
    const y = Math.max(0, cityWorld.getGroundHeight(x, z)) + 0.65;
    mesh.position.set(x, y, z);
    pickupGroup.add(mesh);
    pickups.push({ kind, x, y, z, value, mesh, age: 0, ttl: 45 });
  }

  function giveWeapon(weaponId, bonusAmmo = 60, autoSelect = false) {
    for (let i = 0; i < player.weapons.length; i++) {
      const slot = player.weapons[i];
      if (slot.def.id === weaponId) {
        slot.unlocked = true;
        if (Number.isFinite(slot.def.maxAmmo)) {
          slot.ammo = Math.min(slot.def.maxAmmo, slot.ammo + bonusAmmo);
        }
        if (autoSelect) {
          player.weaponIndex = i;
          playerRig.setEquippedWeapon(slot.def.id);
        }
        return true;
      }
    }
    return false;
  }

  function selectWeaponSlot(slotIdx) {
    if (slotIdx < 0 || slotIdx >= player.weapons.length) return;
    if (!player.weapons[slotIdx].unlocked) return;
    player.weaponIndex = slotIdx;
    const id = player.weapons[slotIdx].def.id;
    playerRig.setEquippedWeapon(id === 'fist' ? null : id);
  }

  function cycleWeapon(delta = 1) {
    const total = player.weapons.length;
    let idx = player.weaponIndex;
    for (let step = 0; step < total; step++) {
      idx = (idx + (delta >= 0 ? 1 : -1) + total) % total;
      if (player.weapons[idx].unlocked) {
        selectWeaponSlot(idx);
        break;
      }
    }
  }

  function addCash(delta) {
    player.cash = Math.max(0, Math.round(player.cash + delta));
    return player.cash;
  }

  function healPlayer(hp = 100, armorBonus = 0) {
    player.health = Math.min(player.maxHealth, player.health + hp);
    if (armorBonus > 0) {
      player.armor = Math.min(player.maxArmor, player.armor + armorBonus);
    }
  }

  function damagePlayer(amount, sourceTag = 'combat') {
    if (player.dead || player.arrested || player.invulnTimer > 0 || amount <= 0) return;

    let remaining = amount;
    if (player.armor > 0 && sourceTag !== 'drown') {
      const absorbed = Math.min(player.armor, remaining * 0.68);
      player.armor = Math.max(0, player.armor - absorbed);
      remaining -= absorbed;
    }

    player.health = Math.max(0, player.health - remaining);
    player.damageFlashTimer = 0.32;

    if (player.health <= 0 && !player.dead) {
      player.dead = true;
      player.downTimer = 3.1;
      if (player.inVehicle) {
        exitCurrentVehicle();
      }
      if (typeof playerDownCallback === 'function') {
        playerDownCallback('hospital');
      }
    }
  }

  function damagePed(ped, amount, attackerTag = 'player') {
    if (!ped || ped.dead || amount <= 0) return false;
    ped.health = Math.max(0, ped.health - amount);

    if (attackerTag === 'player') {
      player.hitMarkerTimer = 0.14;
      if (ped.role === 'civilian') {
        ped.aiState = 'flee';
        emitCrime('assault', 1, ped.x, ped.z);
      } else if (ped.role === 'gang' || ped.role === 'guard') {
        ped.aiState = 'combat';
      }
    }

    if (ped.health <= 0) {
      ped.dead = true;
      ped.deathTimer = 10;
      ped.rig.setEquippedWeapon(null);

      if (attackerTag === 'player') {
        if (ped.role === 'civilian') {
          emitCrime('homicide', 2, ped.x, ped.z);
        }
        const cashDrop = ped.role === 'civilian' ? 35 + ((ped.id * 17) % 55) : 95 + ((ped.id * 29) % 140);
        spawnPickup('cash', ped.x + 0.25, ped.z, cashDrop);
        if (ped.role !== 'civilian' && ped.id % 2 === 0) {
          spawnPickup(ped.id % 4 === 0 ? 'health' : 'ammo', ped.x - 0.35, ped.z + 0.25, 45);
        }
      }
      return true;
    }
    return false;
  }

  // Ray-cylinder intersection helper for humanoid capsules
  function rayHitsActorCapsule(origin, dir, ax, ay, az, radius, height, maxDist) {
    const ox = origin.x - ax;
    const oz = origin.z - az;
    const a = dir.x * dir.x + dir.z * dir.z;
    if (a < 1e-6) return -1;
    const b = 2 * (ox * dir.x + oz * dir.z);
    const c = ox * ox + oz * oz - radius * radius;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return -1;
    const t = (-b - Math.sqrt(disc)) / (2 * a);
    if (t < 0.1 || t > maxDist) return -1;
    const hitY = origin.y + dir.y * t;
    if (hitY < ay - 0.15 || hitY > ay + height + 0.15) return -1;
    return t;
  }

  const shotDirScratch = new THREE.Vector3();
  const muzzlePosScratch = new THREE.Vector3();
  const endPosScratch = new THREE.Vector3();

  function fireWeapon(origin, baseDir, weaponDef, isPlayerShooter, ignoreVehicle = null) {
    const distToPlayer = Math.hypot(origin.x - player.x, origin.z - player.z);
    if (effects) {
      effects.playGunshot(weaponDef.id, isPlayerShooter ? 0 : distToPlayer);
      if (!weaponDef.melee) {
        muzzlePosScratch.set(
          origin.x + baseDir.x * 0.55,
          origin.y + baseDir.y * 0.55,
          origin.z + baseDir.z * 0.55,
        );
        effects.spawnMuzzleFlash(muzzlePosScratch, baseDir, weaponDef.id === 'shotgun' ? 1.35 : 0.9);
      }
    }

    if (isPlayerShooter && !weaponDef.melee) {
      vehicleMgr.triggerPanic(7.5);
      panicNearbyCivilians(origin.x, origin.z, 48);
      emitCrime('gunfire', 0.55, origin.x, origin.z);
    }

    const externalPolice =
      typeof externalTargetsGetter === 'function' ? externalTargetsGetter() : [];

    const pellets = weaponDef.pellets || 1;
    for (let p = 0; p < pellets; p++) {
      shotDirScratch.copy(baseDir);
      if (weaponDef.spread > 0) {
        shotDirScratch.x += (Math.random() - 0.5) * weaponDef.spread;
        shotDirScratch.y += (Math.random() - 0.5) * weaponDef.spread;
        shotDirScratch.z += (Math.random() - 0.5) * weaponDef.spread;
        shotDirScratch.normalize();
      }

      // 1) World geometry raycast
      const worldHit = cityWorld.raycastWorld(origin, shotDirScratch, weaponDef.range);
      let bestDist = worldHit.hit ? worldHit.distance : weaponDef.range;
      let hitKind = worldHit.hit ? worldHit.tag : null;
      let hitEntity = null;

      // 2) Vehicle raycast
      const vehHit = vehicleMgr.raycastVehicles(
        origin,
        shotDirScratch,
        bestDist,
        ignoreVehicle,
      );
      if (vehHit.hit && vehHit.distance < bestDist) {
        bestDist = vehHit.distance;
        hitKind = 'vehicle';
        hitEntity = vehHit.vehicle;
      }

      // 3) Pedestrians & mission NPCs
      for (let i = 0; i < peds.length; i++) {
        const ped = peds[i];
        if (ped.dead) continue;
        if (!isPlayerShooter && (ped.role === 'gang' || ped.role === 'guard')) continue;
        const t = rayHitsActorCapsule(
          origin,
          shotDirScratch,
          ped.x,
          ped.y,
          ped.z,
          0.46,
          1.78,
          bestDist,
        );
        if (t > 0 && t < bestDist) {
          bestDist = t;
          hitKind = 'ped';
          hitEntity = ped;
        }
      }

      // 4) Police officers (registered by wanted-police.js)
      if (isPlayerShooter && externalPolice.length > 0) {
        for (let i = 0; i < externalPolice.length; i++) {
          const cop = externalPolice[i];
          if (cop.dead) continue;
          const t = rayHitsActorCapsule(
            origin,
            shotDirScratch,
            cop.x,
            cop.y,
            cop.z,
            0.48,
            1.8,
            bestDist,
          );
          if (t > 0 && t < bestDist) {
            bestDist = t;
            hitKind = 'police';
            hitEntity = cop;
          }
        }
      }

      // 5) Hostile NPC or police shooting the player
      if (!isPlayerShooter && !player.dead) {
        if (player.inVehicle && player.vehicle) {
          // Handled via vehicle hit above, plus slight cabin bleed
        } else {
          const tp = rayHitsActorCapsule(
            origin,
            shotDirScratch,
            player.x,
            player.y,
            player.z,
            0.48,
            1.78,
            bestDist,
          );
          if (tp > 0 && tp < bestDist) {
            bestDist = tp;
            hitKind = 'player';
            hitEntity = player;
          }
        }
      }

      endPosScratch.set(
        origin.x + shotDirScratch.x * bestDist,
        origin.y + shotDirScratch.y * bestDist,
        origin.z + shotDirScratch.z * bestDist,
      );

      if (!weaponDef.melee && effects) {
        effects.spawnBulletTracer(
          origin,
          endPosScratch,
          isPlayerShooter ? 0xffe28a : 0xff8a65,
        );
      }

      if (hitKind === 'vehicle' && hitEntity) {
        vehicleMgr.damageVehicle(
          hitEntity,
          weaponDef.damage,
          isPlayerShooter ? 'player' : 'npc',
          endPosScratch,
        );
        if (isPlayerShooter) {
          player.hitMarkerTimer = 0.12;
          if (hitEntity.isPolice) {
            emitCrime('police_attack', 2.5, hitEntity.x, hitEntity.z);
          } else if (hitEntity === player.vehicle) {
            // Ignore self
          }
        }
        if (!isPlayerShooter && player.inVehicle && hitEntity === player.vehicle) {
          damagePlayer(weaponDef.damage * 0.25, 'combat');
        }
      } else if (hitKind === 'ped' && hitEntity) {
        damagePed(hitEntity, weaponDef.damage, isPlayerShooter ? 'player' : 'npc');
        if (effects) effects.spawnBulletImpact(endPosScratch, null, 'flesh');
      } else if (hitKind === 'police' && hitEntity && typeof hitEntity.onDamage === 'function') {
        hitEntity.onDamage(weaponDef.damage, 'player');
        player.hitMarkerTimer = 0.14;
        if (effects) effects.spawnBulletImpact(endPosScratch, null, 'flesh');
      } else if (hitKind === 'player') {
        damagePlayer(weaponDef.damage, 'combat');
        if (effects) effects.spawnBulletImpact(endPosScratch, null, 'flesh');
      } else if (hitKind && effects) {
        const surf = hitKind === 'water' ? 'water' : hitKind === 'container' ? 'metal' : 'concrete';
        effects.spawnBulletImpact(endPosScratch, worldHit.normal, surf);
        effects.playImpactSound(surf, Math.hypot(endPosScratch.x - player.x, endPosScratch.z - player.z));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Pedestrians, Armed Guards/Gang Hostiles & Vehicle Enter/Exit
  // ---------------------------------------------------------------------------
  function panicNearbyCivilians(cx, cz, radius = 45) {
    for (let i = 0; i < peds.length; i++) {
      const ped = peds[i];
      if (ped.dead) continue;
      const d = Math.hypot(ped.x - cx, ped.z - cz);
      if (d < radius) {
        if (ped.role === 'civilian') {
          ped.aiState = 'flee';
          ped.fleeTimer = 9 + Math.random() * 5;
          ped.yaw = Math.atan2(ped.x - cx, ped.z - cz);
        } else if (ped.role === 'gang' || ped.role === 'guard') {
          ped.aiState = 'combat';
        }
      }
    }
  }

  function spawnPed(config = {}) {
    const role = config.role || 'civilian';
    const isHostile = role === 'gang' || role === 'guard';
    const appearance = {
      shirtColor:
        role === 'guard'
          ? 0x2b303a
          : role === 'gang'
            ? 0xb52b3b
            : role === 'vip'
              ? 0xf4f0e6
              : undefined,
      vestColor: role === 'guard' ? 0x454d5c : undefined,
      pantsColor: isHostile ? 0x1c2029 : undefined,
      sunglasses: isHostile || Math.random() < 0.25,
    };

    const rig = buildHumanoidRig(THREE, appearance);
    const x = config.x ?? 0;
    const z = config.z ?? 0;
    const y = cityWorld.getGroundHeight(x, z);
    const weaponId = config.weaponId || (isHostile ? 'pistol' : 'fist');
    rig.setEquippedWeapon(weaponId === 'fist' ? null : weaponId);
    rig.root.position.set(x, y, z);
    actorGroup.add(rig.root);

    const weaponDef = WEAPONS.find((w) => w.id === weaponId) || WEAPONS[1];
    const ped = {
      id: nextPedId++,
      role,
      x,
      y,
      z,
      vx: 0,
      vz: 0,
      speed: 0,
      yaw: config.yaw ?? Math.random() * Math.PI * 2,
      health: config.health ?? (isHostile ? 95 : 65),
      maxHealth: config.health ?? (isHostile ? 95 : 65),
      dead: false,
      deathTimer: 0,
      aiState: config.aiState || (isHostile ? 'combat' : 'walk'),
      fleeTimer: 0,
      fireCooldown: 0.6 + Math.random() * 0.9,
      strafeSign: Math.random() < 0.5 ? -1 : 1,
      strafeTimer: 1.5 + Math.random() * 2,
      weaponDef,
      missionTag: config.missionTag || null,
      persistent: Boolean(config.persistent || config.missionTag),
      rig,
    };

    peds.push(ped);
    return ped;
  }

  function removePed(ped) {
    const idx = peds.indexOf(ped);
    if (idx >= 0) peds.splice(idx, 1);
    if (ped && ped.rig && ped.rig.root.parent) {
      ped.rig.root.parent.remove(ped.rig.root);
    }
  }

  function clearAmbientPeds() {
    for (let i = peds.length - 1; i >= 0; i--) {
      if (!peds[i].persistent) removePed(peds[i]);
    }
  }

  function clearMissionPeds(tag = null) {
    for (let i = peds.length - 1; i >= 0; i--) {
      const p = peds[i];
      if (!p.missionTag) continue;
      if (!tag || p.missionTag === tag) removePed(p);
    }
  }

  function enterVehicle(v) {
    if (!v || v.destroyed || player.dead || player.arrested) return false;
    const wasTraffic = v.aiMode === 'traffic' || v.aiMode === 'police';
    const wasPoliceCar = v.isPolice;

    player.inVehicle = true;
    player.vehicle = v;
    player.x = v.x;
    player.y = v.y;
    player.z = v.z;
    player.yaw = v.yaw;
    player.speed = v.speed;
    v.aiMode = 'player';
    v.driver = 'player';
    playerRig.root.visible = false;

    if (wasTraffic) {
      emitCrime(wasPoliceCar ? 'police_attack' : 'carjack', wasPoliceCar ? 2 : 1, v.x, v.z);
      panicNearbyCivilians(v.x, v.z, 32);
    }
    return true;
  }

  function exitCurrentVehicle() {
    if (!player.inVehicle || !player.vehicle) return false;
    const v = player.vehicle;
    const exitPos = vehicleMgr.getExitPosition(v);

    v.aiMode = 'parked';
    v.driver = null;
    player.inVehicle = false;
    player.vehicle = null;
    player.x = exitPos.x;
    player.y = exitPos.y;
    player.z = exitPos.z;
    player.vx = v.vx * 0.25;
    player.vz = v.vz * 0.25;
    player.vy = 0;
    playerRig.root.visible = true;
    playerRig.root.position.set(player.x, player.y, player.z);
    return true;
  }

  function toggleVehicleInteraction() {
    if (player.inVehicle) {
      return exitCurrentVehicle();
    }
    const candidate = vehicleMgr.findNearestEnterable(player.x, player.z, 5.2);
    if (candidate) {
      return enterVehicle(candidate);
    }
    return false;
  }

  // Explosion splash damage from destroyed vehicles
  vehicleMgr.onExplosion((explodedVeh, blastPos, attackerTag) => {
    if (attackerTag === 'player') {
      emitCrime('explosion', 2.4, blastPos.x, blastPos.z);
    }
    panicNearbyCivilians(blastPos.x, blastPos.z, 65);

    for (let i = 0; i < peds.length; i++) {
      const ped = peds[i];
      if (ped.dead) continue;
      const d = Math.hypot(ped.x - blastPos.x, ped.z - blastPos.z);
      if (d < 9.5) {
        damagePed(ped, (1 - d / 9.5) * 180, attackerTag);
      }
    }

    const externalPolice =
      typeof externalTargetsGetter === 'function' ? externalTargetsGetter() : [];
    for (let i = 0; i < externalPolice.length; i++) {
      const cop = externalPolice[i];
      if (cop.dead) continue;
      const d = Math.hypot(cop.x - blastPos.x, cop.z - blastPos.z);
      if (d < 9.5 && typeof cop.onDamage === 'function') {
        cop.onDamage((1 - d / 9.5) * 180, attackerTag);
      }
    }

    if (player.inVehicle && player.vehicle === explodedVeh) {
      exitCurrentVehicle();
      damagePlayer(85, 'explosion');
    } else {
      const dp = Math.hypot(player.x - blastPos.x, player.z - blastPos.z);
      if (dp < 10) {
        damagePlayer((1 - dp / 10) * 95, 'explosion');
      }
    }
  });

  const npcShotOrigin = new THREE.Vector3();
  const npcShotDir = new THREE.Vector3();

  function maintainAndStepPeds(dt, pedestrianDensity = 1.0) {
    const desiredCivilians = Math.round(24 * Math.max(0, Math.min(1.5, pedestrianDensity)));
    let ambientCount = 0;

    for (let i = peds.length - 1; i >= 0; i--) {
      const ped = peds[i];
      const distToPlayer = Math.hypot(ped.x - player.x, ped.z - player.z);

      if (!ped.persistent) {
        if (distToPlayer > 135 || (ped.dead && ped.deathTimer <= 0)) {
          removePed(ped);
          continue;
        }
        ambientCount++;
      } else if (ped.dead) {
        ped.deathTimer = Math.max(0, ped.deathTimer - dt);
      }

      if (ped.dead) {
        ped.deathTimer -= dt;
        animateCharacterRig(ped.rig, { dead: true, speed: 0 }, dt);
        continue;
      }

      // Check collisions against fast-moving vehicles
      const vehicles = vehicleMgr.vehicles;
      for (let vIdx = 0; vIdx < vehicles.length; vIdx++) {
        const v = vehicles[vIdx];
        if (v.speed < 4.5) continue;
        const vd = Math.hypot(ped.x - v.x, ped.z - v.z);
        if (vd < v.halfW + 0.65) {
          damagePed(ped, v.speed * 6.5, v.aiMode === 'player' ? 'player' : 'traffic');
          break;
        }
      }
      if (ped.dead) continue;

      let aiming = false;
      if (ped.aiState === 'combat' && !player.dead && !player.arrested) {
        const dx = player.x - ped.x;
        const dz = player.z - ped.z;
        const dist = Math.max(0.01, Math.hypot(dx, dz));
        ped.yaw = Math.atan2(dx, dz);

        ped.strafeTimer -= dt;
        if (ped.strafeTimer <= 0) {
          ped.strafeSign *= -1;
          ped.strafeTimer = 1.4 + Math.random() * 1.8;
        }

        if (dist > 22) {
          ped.speed = 4.2;
          ped.vx = (dx / dist) * ped.speed;
          ped.vz = (dz / dist) * ped.speed;
        } else if (dist < 8) {
          ped.speed = 2.8;
          ped.vx = (-dx / dist) * ped.speed;
          ped.vz = (-dz / dist) * ped.speed;
        } else {
          ped.speed = 2.4;
          ped.vx = (dz / dist) * ped.strafeSign * ped.speed;
          ped.vz = (-dx / dist) * ped.strafeSign * ped.speed;
        }

        if (dist < ped.weaponDef.range * 0.85) {
          aiming = true;
          ped.fireCooldown -= dt;
          if (ped.fireCooldown <= 0) {
            ped.fireCooldown = (1 / ped.weaponDef.fireRate) * (2.1 + Math.random() * 1.2);
            npcShotOrigin.set(ped.x, ped.y + 1.42, ped.z);
            npcShotDir
              .set(
                player.x - ped.x + (Math.random() - 0.5) * 1.6,
                player.y + 1.15 - (ped.y + 1.42),
                player.z - ped.z + (Math.random() - 0.5) * 1.6,
              )
              .normalize();
            fireWeapon(npcShotOrigin, npcShotDir, { ...ped.weaponDef, damage: ped.weaponDef.damage * 0.42 }, false);
          }
        }
      } else if (ped.aiState === 'flee') {
        ped.fleeTimer -= dt;
        if (ped.fleeTimer <= 0) ped.aiState = 'walk';
        ped.speed = 5.6;
        ped.vx = Math.sin(ped.yaw) * ped.speed;
        ped.vz = Math.cos(ped.yaw) * ped.speed;
      } else if (ped.aiState === 'idle') {
        ped.speed = 0;
        ped.vx = 0;
        ped.vz = 0;
      } else {
        // Calm sidewalk stroll
        ped.speed = 1.65;
        ped.vx = Math.sin(ped.yaw) * ped.speed;
        ped.vz = Math.cos(ped.yaw) * ped.speed;
      }

      const nextX = ped.x + ped.vx * dt;
      const nextZ = ped.z + ped.vz * dt;
      if (cityWorld.isWaterAt(nextX, nextZ)) {
        ped.yaw += Math.PI * 0.75;
      } else {
        const col = cityWorld.resolveCircleCollision(nextX, nextZ, 0.42, ped.y);
        ped.x = col.x;
        ped.z = col.z;
        if (col.hit) {
          ped.yaw += Math.PI * (0.45 + Math.random() * 0.35);
        }
      }
      ped.y = cityWorld.getGroundHeight(ped.x, ped.z);
      ped.rig.root.position.set(ped.x, ped.y, ped.z);
      ped.rig.root.rotation.y = ped.yaw;
      animateCharacterRig(
        ped.rig,
        {
          dead: false,
          speed: ped.speed,
          aiming,
          twoHanded: ped.weaponDef.twoHanded,
          punchTimer: 0,
        },
        dt,
      );
    }

    if (ambientCount < desiredCivilians) {
      const pt = cityWorld.getRandomSidewalkPoint(null, player.x, player.z, 32, 105);
      spawnPed({ role: 'civilian', x: pt.x, z: pt.z, yaw: pt.yaw });
    }
  }

  // ---------------------------------------------------------------------------
  // Pickups, Player Locomotion, Aiming, Respawn & Serialization
  // ---------------------------------------------------------------------------
  function updatePickups(dt) {
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pk = pickups[i];
      pk.age += dt;
      if (pk.age >= pk.ttl) {
        pickupGroup.remove(pk.mesh);
        pickups.splice(i, 1);
        continue;
      }

      pk.mesh.rotation.y += dt * 2.6;
      pk.mesh.position.y = pk.y + Math.sin(pk.age * 3.8) * 0.14;

      if (!player.dead && !player.inVehicle) {
        const d = Math.hypot(pk.x - player.x, pk.z - player.z);
        if (d < 1.65) {
          if (pk.kind === 'cash') {
            addCash(pk.value);
            if (effects) effects.playUiSound('cash');
          } else if (pk.kind === 'health') {
            healPlayer(45, 0);
            if (effects) effects.playUiSound('pickup');
          } else if (pk.kind === 'armor') {
            healPlayer(0, 50);
            if (effects) effects.playUiSound('pickup');
          } else if (pk.kind === 'ammo') {
            for (let w = 1; w < player.weapons.length; w++) {
              const slot = player.weapons[w];
              if (slot.unlocked && Number.isFinite(slot.def.maxAmmo)) {
                slot.ammo = Math.min(slot.def.maxAmmo, slot.ammo + Math.ceil(slot.def.defaultAmmo * 0.5));
              }
            }
            if (effects) effects.playUiSound('pickup');
          }
          pickupGroup.remove(pk.mesh);
          pickups.splice(i, 1);
        }
      }
    }
  }

  const playerShotOrigin = new THREE.Vector3();

  function updatePlayer(dt, inputSample, cameraRig) {
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
    player.punchTimer = Math.max(0, player.punchTimer - dt);
    player.hitMarkerTimer = Math.max(0, player.hitMarkerTimer - dt);
    player.damageFlashTimer = Math.max(0, player.damageFlashTimer - dt);
    player.invulnTimer = Math.max(0, player.invulnTimer - dt);

    if (player.dead || player.arrested) {
      player.downTimer = Math.max(0, player.downTimer - dt);
      animateCharacterRig(playerRig, { dead: player.dead, speed: 0 }, dt);
      return;
    }

    const inp = inputSample || {};

    // Weapon selection
    if (inp.weaponSlotPressed >= 0) {
      selectWeaponSlot(inp.weaponSlotPressed);
    } else if (inp.weaponCycleDelta !== 0) {
      cycleWeapon(inp.weaponCycleDelta);
    }

    if (player.inVehicle && player.vehicle) {
      const v = player.vehicle;
      player.x = v.x;
      player.y = v.y;
      player.z = v.z;
      player.vx = v.vx;
      player.vz = v.vz;
      player.yaw = v.yaw;
      player.speed = v.speed;
      player.sprinting = false;
      player.aiming = false;
      player.stamina = Math.min(player.maxStamina, player.stamina + 14 * dt);

      // Optional drive-by firing with one-handed weapons (9mm / SMG)
      const slot = player.weapons[player.weaponIndex];
      if (inp.shoot && slot.def.driveBy && slot.ammo > 0 && player.fireCooldown <= 0 && cameraRig) {
        const aimRay = cameraRig.getAimRay(slot.def.spread * 1.4);
        playerShotOrigin.set(v.x, v.y + 1.35, v.z);
        fireWeapon(playerShotOrigin, aimRay.direction, slot.def, true, v);
        slot.ammo = Math.max(0, slot.ammo - 1);
        player.fireCooldown = 1 / slot.def.fireRate;
      }
      return;
    }

    // On-foot movement relative to camera yaw
    const camYaw = cameraRig ? cameraRig.getYaw() : player.yaw;
    const fwdX = Math.sin(camYaw);
    const fwdZ = Math.cos(camYaw);
    const rightX = -Math.cos(camYaw);
    const rightZ = Math.sin(camYaw);

    let wishX = fwdX * (inp.moveZ || 0) + rightX * (inp.moveX || 0);
    let wishZ = fwdZ * (inp.moveZ || 0) + rightZ * (inp.moveX || 0);
    const wishLen = Math.hypot(wishX, wishZ);
    if (wishLen > 1e-4) {
      wishX /= wishLen;
      wishZ /= wishLen;
    }

    const inWater = cityWorld.isWaterAt(player.x, player.z);
    player.swimming = inWater;

    const wantsSprint = Boolean(inp.sprint) && wishLen > 0.1 && !inp.aim && player.stamina > 3;
    player.sprinting = wantsSprint;
    if (wantsSprint) {
      player.stamina = Math.max(0, player.stamina - 16 * dt);
    } else {
      player.stamina = Math.min(player.maxStamina, player.stamina + 13 * dt);
    }

    const slot = player.weapons[player.weaponIndex];
    const aimingNow = Boolean(inp.aim || (inp.shoot && !slot.def.melee)) && !inWater;
    player.aiming = aimingNow;

    const moveSpeed = inWater
      ? wantsSprint
        ? 5.2
        : 3.6
      : aimingNow
        ? 4.1
        : wantsSprint
          ? 8.8
          : 5.7;

    const targetVx = wishX * moveSpeed * Math.min(1, wishLen);
    const targetVz = wishZ * moveSpeed * Math.min(1, wishLen);
    const accelBlend = 1 - Math.exp(-dt * 14);
    player.vx += (targetVx - player.vx) * accelBlend;
    player.vz += (targetVz - player.vz) * accelBlend;
    player.speed = Math.hypot(player.vx, player.vz);

    if (aimingNow && cameraRig) {
      player.yaw = camYaw;
      player.aimPitch = cameraRig.getPitch();
    } else if (player.speed > 0.35) {
      const moveYaw = Math.atan2(player.vx, player.vz);
      let dy = moveYaw - player.yaw;
      while (dy > Math.PI) dy -= Math.PI * 2;
      while (dy < -Math.PI) dy += Math.PI * 2;
      player.yaw += dy * Math.min(1, dt * 13);
    }

    // Jump & gravity
    if (inp.jumpPressed && player.onGround && !inWater) {
      player.vy = 6.8;
      player.onGround = false;
    }

    const nextX = player.x + player.vx * dt;
    const nextZ = player.z + player.vz * dt;
    const col = cityWorld.resolveCircleCollision(nextX, nextZ, 0.46, player.y);
    player.x = col.x;
    player.z = col.z;

    const floorY = inWater
      ? cityWorld.bounds.seaLevel - 0.55
      : cityWorld.getGroundHeight(player.x, player.z);

    if (inWater) {
      player.vy = 0;
      player.y += (floorY - player.y) * Math.min(1, dt * 8);
      player.onGround = false;
    } else {
      player.vy -= 19.5 * dt;
      player.y += player.vy * dt;
      if (player.y <= floorY) {
        player.y = floorY;
        player.vy = 0;
        player.onGround = true;
      }
    }

    // Shooting & melee combat
    const triggerFire = slot.def.automatic ? Boolean(inp.shoot) : Boolean(inp.shootPressed || inp.shoot);
    if (triggerFire && !inWater && player.fireCooldown <= 0) {
      if (slot.def.melee) {
        player.punchTimer = 0.28;
        player.fireCooldown = 1 / slot.def.fireRate;
        playerShotOrigin.set(player.x, player.y + 1.35, player.z);
        const dir = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
        fireWeapon(playerShotOrigin, dir, slot.def, true, null);
      } else if (slot.ammo > 0 && cameraRig) {
        const aimRay = cameraRig.getAimRay(0);
        // Trace from camera to aim point, then fire from player's shoulder toward that world target
        const camHit = cityWorld.raycastWorld(aimRay.origin, aimRay.direction, slot.def.range);
        const targetPt = camHit.point;
        playerShotOrigin.set(
          player.x + Math.sin(player.yaw) * 0.35,
          player.y + 1.44,
          player.z + Math.cos(player.yaw) * 0.35,
        );
        const fireDir = targetPt.clone().sub(playerShotOrigin).normalize();
        fireWeapon(playerShotOrigin, fireDir, slot.def, true, null);

        slot.ammo = Math.max(0, slot.ammo - 1);
        player.fireCooldown = 1 / slot.def.fireRate;
        playerRig.recoil = 1;
        if (cameraRig) {
          cameraRig.addShake(slot.def.id === 'shotgun' ? 0.22 : 0.08);
        }
      } else if (slot.ammo <= 0) {
        // Auto-fallback when magazine runs dry
        player.fireCooldown = 0.25;
      }
    }

    playerRig.root.position.set(player.x, player.y, player.z);
    playerRig.root.rotation.y = player.yaw;
    animateCharacterRig(
      playerRig,
      {
        dead: false,
        swimming: player.swimming,
        speed: player.speed,
        aiming: player.aiming,
        aimPitch: player.aimPitch,
        twoHanded: slot.def.twoHanded,
        punchTimer: player.punchTimer,
      },
      dt,
    );
  }

  function teleportPlayer(x, z, yaw = 0) {
    if (player.inVehicle) exitCurrentVehicle();
    player.x = x;
    player.z = z;
    player.y = Math.max(0, cityWorld.getGroundHeight(x, z));
    player.vx = 0;
    player.vy = 0;
    player.vz = 0;
    player.yaw = yaw;
    playerRig.root.visible = true;
    playerRig.root.position.set(player.x, player.y, player.z);
    playerRig.root.rotation.y = yaw;
  }

  function respawnPlayer(spawnPoint, penaltyType = 'hospital') {
    const target = spawnPoint || {
      x: cityWorld.landmarks.safehouse.x + 12,
      z: cityWorld.landmarks.safehouse.z + 4,
      yaw: 0.4,
    };
    teleportPlayer(target.x, target.z, target.yaw || 0);
    player.dead = false;
    player.arrested = false;
    player.health = player.maxHealth;
    player.stamina = player.maxStamina;
    player.invulnTimer = 2.5;
    playerRig.hips.rotation.set(0, 0, 0);

    const fee = penaltyType === 'arrest' ? Math.min(250, Math.floor(player.cash * 0.15)) : Math.min(150, Math.floor(player.cash * 0.1));
    addCash(-fee);
    return fee;
  }

  function getSaveData() {
    return {
      x: player.x,
      z: player.z,
      yaw: player.yaw,
      health: player.health,
      armor: player.armor,
      cash: player.cash,
      weaponIndex: player.weaponIndex,
      weapons: player.weapons.map((w) => ({
        id: w.def.id,
        unlocked: w.unlocked,
        ammo: Number.isFinite(w.ammo) ? w.ammo : 9999,
      })),
    };
  }

  function loadSaveData(data) {
    if (!data) return;
    teleportPlayer(data.x ?? startX, data.z ?? startZ, data.yaw ?? 0.4);
    player.health = Math.max(25, Math.min(player.maxHealth, data.health ?? 100));
    player.armor = Math.max(0, Math.min(player.maxArmor, data.armor ?? 50));
    player.cash = Math.max(0, data.cash ?? 650);
    if (Array.isArray(data.weapons)) {
      for (let i = 0; i < data.weapons.length; i++) {
        const saved = data.weapons[i];
        const slot = player.weapons.find((s) => s.def.id === saved.id);
        if (slot) {
          slot.unlocked = Boolean(saved.unlocked);
          if (Number.isFinite(slot.def.maxAmmo) && Number.isFinite(saved.ammo)) {
            slot.ammo = Math.min(slot.def.maxAmmo, saved.ammo);
          }
        }
      }
    }
    selectWeaponSlot(data.weaponIndex ?? 1);
  }

  function update(dt, inputSample, cameraRig, simContext = {}) {
    if (inputSample && inputSample.interactPressed && !simContext.blockVehicleInteract) {
      toggleVehicleInteraction();
    }
    updatePlayer(dt, inputSample, cameraRig);
    maintainAndStepPeds(dt, simContext.pedDensity ?? 1.0);
    updatePickups(dt);
  }

  return {
    player,
    peds,
    pickups,
    weapons: WEAPONS,
    spawnPed,
    removePed,
    clearAmbientPeds,
    clearMissionPeds,
    spawnPickup,
    giveWeapon,
    selectWeaponSlot,
    cycleWeapon,
    addCash,
    healPlayer,
    damagePlayer,
    damagePed,
    fireWeapon,
    enterVehicle,
    exitCurrentVehicle,
    toggleVehicleInteraction,
    teleportPlayer,
    respawnPlayer,
    getSaveData,
    loadSaveData,
    setCrimeCallback(fn) {
      crimeCallback = fn;
    },
    registerExternalTargets(fn) {
      externalTargetsGetter = fn;
    },
    onPlayerDown(fn) {
      playerDownCallback = fn;
    },
    update,
  };
}



