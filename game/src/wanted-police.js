// Wanted level (1-5 stars), tactical police pursuit, roadblocks & arrest system

import { buildHumanoidRig, animateCharacterRig, WEAPONS } from './player-peds.js';

const STAR_CONFIGS = [
  null,
  {
    stars: 1,
    heatMin: 18,
    maxOfficers: 3,
    maxCruisers: 0,
    roadblocks: 0,
    cooldownSec: 12,
    spawnInterval: 4.0,
    weapons: ['pistol'],
    tactical: false,
    lethalBelowDist: 10,
  },
  {
    stars: 2,
    heatMin: 60,
    maxOfficers: 5,
    maxCruisers: 2,
    roadblocks: 0,
    cooldownSec: 17,
    spawnInterval: 3.3,
    weapons: ['pistol', 'pistol'],
    tactical: false,
    lethalBelowDist: 28,
  },
  {
    stars: 3,
    heatMin: 135,
    maxOfficers: 7,
    maxCruisers: 3,
    roadblocks: 1,
    cooldownSec: 23,
    spawnInterval: 2.7,
    weapons: ['pistol', 'shotgun', 'smg'],
    tactical: false,
    lethalBelowDist: 55,
  },
  {
    stars: 4,
    heatMin: 245,
    maxOfficers: 9,
    maxCruisers: 4,
    roadblocks: 2,
    cooldownSec: 29,
    spawnInterval: 2.2,
    weapons: ['shotgun', 'smg', 'rifle'],
    tactical: true,
    lethalBelowDist: 80,
  },
  {
    stars: 5,
    heatMin: 380,
    maxOfficers: 12,
    maxCruisers: 5,
    roadblocks: 2,
    cooldownSec: 36,
    spawnInterval: 1.7,
    weapons: ['smg', 'rifle', 'rifle'],
    tactical: true,
    lethalBelowDist: 110,
  },
];

const CRIME_HEAT_VALUES = {
  gunfire: 8,
  carjack: 22,
  assault: 24,
  hit_and_run: 34,
  homicide: 52,
  explosion: 78,
  police_attack: 88,
};

export function createWantedSystem(THREE, scene, cityWorld, vehicleMgr, actorSys, effects) {
  const policeGroup = new THREE.Group();
  policeGroup.name = 'sol-police-group';
  scene.add(policeGroup);

  const barricadeGeo = new THREE.BoxGeometry(3.2, 0.95, 0.45);
  const barricadeMat = new THREE.MeshLambertMaterial({ color: 0xf48c1c });
  const coneGeo = new THREE.ConeGeometry(0.28, 0.72, 7);
  const coneMat = new THREE.MeshLambertMaterial({ color: 0xff6224 });

  const officers = [];
  const cruisers = [];
  const roadblocks = [];

  let stars = 0;
  let heat = 0;
  let evading = false;
  let cooldownTimer = 0;
  let cooldownDuration = 12;
  let spawnTimer = 1.2;
  let roadblockTimer = 4.0;
  let arrestProgress = 0;
  let gunfireWitnessCooldown = 0;
  let arrestCallback = null;
  let nextOfficerId = 1;

  function starsFromHeat(h) {
    let level = 0;
    for (let s = 1; s <= 5; s++) {
      if (h >= STAR_CONFIGS[s].heatMin) level = s;
    }
    return level;
  }

  function heatFloorForStars(s) {
    if (s <= 0) return 0;
    const clamped = Math.min(5, Math.max(1, s));
    return STAR_CONFIGS[clamped].heatMin + 4;
  }

  function setStars(level) {
    const next = Math.max(0, Math.min(5, Math.round(level)));
    if (next === 0) {
      clearWanted();
      return;
    }
    const prev = stars;
    stars = next;
    heat = Math.max(heat, heatFloorForStars(next));
    cooldownDuration = STAR_CONFIGS[stars].cooldownSec;
    cooldownTimer = 0;
    evading = false;
    if (next > prev && effects) {
      effects.playUiSound('wanted');
    }
  }

  function clearWanted() {
    stars = 0;
    heat = 0;
    evading = false;
    cooldownTimer = 0;
    arrestProgress = 0;

    for (let i = officers.length - 1; i >= 0; i--) {
      removeOfficer(officers[i]);
    }
    for (let i = cruisers.length - 1; i >= 0; i--) {
      const c = cruisers[i];
      if (c.vehicle && c.vehicle.aiMode === 'police') {
        c.vehicle.sirenOn = false;
        c.vehicle.aiMode = 'traffic';
      }
      cruisers.splice(i, 1);
    }
    for (let i = roadblocks.length - 1; i >= 0; i--) {
      removeRoadblock(roadblocks[i]);
    }
    if (effects) {
      effects.setSirenState(0, false);
    }
  }

  function reportCrime(crimeType, severity = 1, pos = null) {
    if (actorSys.player.dead || actorSys.player.arrested) return;

    if (crimeType === 'gunfire') {
      if (gunfireWitnessCooldown > 0) return;
      gunfireWitnessCooldown = 1.6;
    }

    const base = CRIME_HEAT_VALUES[crimeType] ?? 20;
    heat = Math.min(520, heat + base * Math.max(0.4, severity));

    const newStars = starsFromHeat(heat);
    if (newStars > stars) {
      const prev = stars;
      stars = newStars;
      cooldownDuration = STAR_CONFIGS[stars].cooldownSec;
      if (prev === 0 && effects) {
        effects.playUiSound('wanted');
      }
    }

    if (stars > 0) {
      // Fresh crime resets evasion timer
      cooldownTimer = 0;
      evading = false;
    }

    if (pos) {
      // Alert nearby officers toward crime position
      for (let i = 0; i < officers.length; i++) {
        officers[i].lastKnownX = pos.x;
        officers[i].lastKnownZ = pos.z;
      }
    }
  }

  function spawnOfficer(x, z, tactical = false, weaponOverride = null) {
    const cfg = STAR_CONFIGS[Math.max(1, stars)];
    const weaponId =
      weaponOverride ||
      cfg.weapons[Math.floor(Math.random() * cfg.weapons.length) % cfg.weapons.length];
    const weaponDef = WEAPONS.find((w) => w.id === weaponId) || WEAPONS[1];

    const rig = buildHumanoidRig(THREE, {
      shirtColor: tactical ? 0x18202c : 0x1e3256,
      vestColor: tactical ? 0x2c3647 : 0x141d2e,
      pantsColor: 0x141c2b,
      hatColor: tactical ? 0x161b24 : 0x1f365c,
      sunglasses: true,
    });
    rig.setEquippedWeapon(weaponDef.id);

    const y = cityWorld.getGroundHeight(x, z);
    rig.root.position.set(x, y, z);
    policeGroup.add(rig.root);

    const cop = {
      id: nextOfficerId++,
      x,
      y,
      z,
      vx: 0,
      vz: 0,
      speed: 0,
      yaw: 0,
      health: tactical ? 145 : 105,
      maxHealth: tactical ? 145 : 105,
      dead: false,
      deathTimer: 0,
      tactical,
      weaponDef,
      fireCooldown: 0.45 + Math.random() * 0.65,
      strafeSign: Math.random() < 0.5 ? -1 : 1,
      strafeTimer: 1.5,
      lastKnownX: actorSys.player.x,
      lastKnownZ: actorSys.player.z,
      rig,
      onDamage(amount, attackerTag) {
        if (cop.dead) return;
        cop.health = Math.max(0, cop.health - amount);
        if (attackerTag === 'player') {
          reportCrime('police_attack', 0.9, { x: cop.x, z: cop.z });
        }
        if (cop.health <= 0) {
          cop.dead = true;
          cop.deathTimer = 9;
          cop.rig.setEquippedWeapon(null);
          actorSys.spawnPickup('ammo', cop.x + 0.2, cop.z, 36);
          if (cop.id % 2 === 0) {
            actorSys.spawnPickup('armor', cop.x - 0.3, cop.z + 0.2, 35);
          }
          if (attackerTag === 'player') {
            reportCrime('police_attack', 1.2, { x: cop.x, z: cop.z });
          }
        }
      },
    };

    officers.push(cop);
    return cop;
  }

  function removeOfficer(cop) {
    const idx = officers.indexOf(cop);
    if (idx >= 0) officers.splice(idx, 1);
    if (cop && cop.rig && cop.rig.root.parent) {
      cop.rig.root.parent.remove(cop.rig.root);
    }
  }

  function spawnPatrolCruiser() {
    const p = actorSys.player;
    const spawn = cityWorld.getRandomRoadSpawn(null, p.x, p.z, 58, 138);
    const veh = vehicleMgr.spawnVehicle('police', spawn.x, spawn.z, spawn.yaw, {
      aiMode: 'police',
      isPolice: true,
      sirenOn: true,
    });
    const unit = {
      vehicle: veh,
      crewCount: stars >= 4 ? 2 : 1,
      dismounted: false,
      stuckTimer: 0,
      reverseTimer: 0,
    };
    cruisers.push(unit);
    return unit;
  }

  function spawnRoadblock() {
    const p = actorSys.player;
    const vx = p.vx || Math.sin(p.yaw) * 10;
    const vz = p.vz || Math.cos(p.yaw) * 10;
    const aheadX = p.x + vx * 4.2;
    const aheadZ = p.z + vz * 4.2;
    const roadPt = cityWorld.getNearestRoadPoint(aheadX, aheadZ);
    const distFromPlayer = Math.hypot(roadPt.x - p.x, roadPt.z - p.z);
    if (distFromPlayer < 45 || distFromPlayer > 165) return null;
    if (cityWorld.isWaterAt(roadPt.x, roadPt.z)) return null;

    const propsGroup = new THREE.Group();
    propsGroup.position.set(roadPt.x, 0, roadPt.z);
    const crossNS = roadPt.axis === 'ns';
    if (!crossNS) propsGroup.rotation.y = Math.PI * 0.5;

    for (const bx of [-4.2, 4.2]) {
      const bar = new THREE.Mesh(barricadeGeo, barricadeMat);
      bar.position.set(bx, 0.52, 0);
      bar.castShadow = true;
      propsGroup.add(bar);
    }
    for (const cx of [-7.2, -1.5, 1.5, 7.2]) {
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(cx, 0.36, 1.4);
      propsGroup.add(cone);
    }
    policeGroup.add(propsGroup);

    const car1X = crossNS ? roadPt.x - 3.6 : roadPt.x;
    const car1Z = crossNS ? roadPt.z - 2.2 : roadPt.z - 3.6;
    const car2X = crossNS ? roadPt.x + 3.6 : roadPt.x;
    const car2Z = crossNS ? roadPt.z + 2.2 : roadPt.z + 3.6;
    const baseYaw = crossNS ? Math.PI * 0.42 : -0.15;

    const v1 = vehicleMgr.spawnVehicle('police', car1X, car1Z, baseYaw, {
      aiMode: 'parked',
      isPolice: true,
      sirenOn: true,
    });
    const v2 = vehicleMgr.spawnVehicle('police', car2X, car2Z, baseYaw + Math.PI, {
      aiMode: 'parked',
      isPolice: true,
      sirenOn: true,
    });

    const c1 = spawnOfficer(roadPt.x - 2.2, roadPt.z + 2.8, stars >= 4, stars >= 4 ? 'rifle' : 'shotgun');
    const c2 = spawnOfficer(roadPt.x + 2.2, roadPt.z - 2.8, stars >= 4, 'smg');

    const block = {
      x: roadPt.x,
      z: roadPt.z,
      propsGroup,
      vehicles: [v1, v2],
      officers: [c1, c2],
    };
    roadblocks.push(block);
    return block;
  }

  function removeRoadblock(block) {
    const idx = roadblocks.indexOf(block);
    if (idx >= 0) roadblocks.splice(idx, 1);
    if (block.propsGroup && block.propsGroup.parent) {
      block.propsGroup.parent.remove(block.propsGroup);
    }
    for (let i = 0; i < block.vehicles.length; i++) {
      const v = block.vehicles[i];
      if (v && v.aiMode !== 'player') {
        vehicleMgr.removeVehicle(v);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Line-of-Sight, Cruiser Interception, Tactical Foot AI & Arrest Mechanic
  // ---------------------------------------------------------------------------
  const losOrigin = new THREE.Vector3();
  const losDir = new THREE.Vector3();
  const copShotOrigin = new THREE.Vector3();
  const copShotDir = new THREE.Vector3();

  function hasLineOfSightToPlayer(ux, uy, uz, maxRange = 78) {
    const p = actorSys.player;
    const dx = p.x - ux;
    const dz = p.z - uz;
    const dist = Math.hypot(dx, dz);
    if (dist > maxRange) return false;
    if (dist < 10) return true;

    losOrigin.set(ux, uy + 1.45, uz);
    losDir.set(dx, p.y + 1.2 - (uy + 1.45), dz).normalize();
    const hit = cityWorld.raycastWorld(losOrigin, losDir, dist - 0.8);
    return !hit.hit;
  }

  function stepCruiserUnits(dt) {
    const p = actorSys.player;
    let anySawPlayer = false;
    let nearestSirenDist = Infinity;

    for (let i = cruisers.length - 1; i >= 0; i--) {
      const unit = cruisers[i];
      const v = unit.vehicle;

      // Remove entry if cruiser was hijacked by player or removed
      if (!v || v.aiMode === 'player' || !vehicleMgr.vehicles.includes(v)) {
        cruisers.splice(i, 1);
        continue;
      }

      const dist = Math.hypot(v.x - p.x, v.z - p.z);
      if (dist > 215) {
        vehicleMgr.removeVehicle(v);
        cruisers.splice(i, 1);
        continue;
      }

      if (v.sirenOn && !v.destroyed && dist < nearestSirenDist) {
        nearestSirenDist = dist;
      }

      // Crew dismounts if cruiser wrecked or close to on-foot player
      if (!unit.dismounted && (v.destroyed || (!p.inVehicle && dist < 17 && v.speed < 8))) {
        unit.dismounted = true;
        v.externalControl = { throttle: 0, steer: 0, handbrake: true };
        if (!v.destroyed) {
          for (let c = 0; c < unit.crewCount; c++) {
            const side = c % 2 === 0 ? -1 : 1;
            const ox = v.x + Math.cos(v.yaw) * side * (v.halfW + 1.1);
            const oz = v.z - Math.sin(v.yaw) * side * (v.halfW + 1.1);
            spawnOfficer(ox, oz, stars >= 4);
          }
        }
        continue;
      }

      if (v.destroyed || unit.dismounted) {
        v.externalControl = { throttle: 0, steer: 0, handbrake: true };
        continue;
      }

      if (hasLineOfSightToPlayer(v.x, v.y, v.z, 92)) {
        anySawPlayer = true;
      }

      // Predictive lead pursuit toward player or player's vehicle
      const leadSeconds = Math.min(1.3, dist / 42);
      const targetX = evading ? p.x : p.x + (p.vx || 0) * leadSeconds;
      const targetZ = evading ? p.z : p.z + (p.vz || 0) * leadSeconds;

      const dx = targetX - v.x;
      const dz = targetZ - v.z;
      const desiredYaw = Math.atan2(dx, dz);
      let yawDiff = desiredYaw - v.yaw;
      while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
      while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;

      // Detect if wedged against building and reverse briefly to unstick
      if (Math.abs(v.forwardSpeed) < 1.2) {
        unit.stuckTimer += dt;
        if (unit.stuckTimer > 1.35) {
          unit.reverseTimer = 1.1;
          unit.stuckTimer = 0;
        }
      } else {
        unit.stuckTimer = Math.max(0, unit.stuckTimer - dt * 2);
      }

      if (unit.reverseTimer > 0) {
        unit.reverseTimer -= dt;
        v.externalControl = {
          throttle: -0.85,
          steer: yawDiff > 0 ? 1 : -1,
          handbrake: false,
        };
      } else {
        const steer = Math.max(-1, Math.min(1, -yawDiff * 1.9));
        const aggressiveSpeed = 24 + stars * 3.4;
        const throttle =
          !p.inVehicle && dist < 13
            ? -0.65
            : v.speed < aggressiveSpeed
              ? 0.96
              : 0.25;
        const handbrake = Math.abs(yawDiff) > 1.35 && v.speed > 17;
        v.externalControl = { throttle, steer, handbrake };
      }
    }

    return { anySawPlayer, nearestSirenDist };
  }

  function stepFootOfficers(dt) {
    const p = actorSys.player;
    const cfg = STAR_CONFIGS[Math.max(1, stars)];
    let anySawPlayer = false;
    let arrestingOfficerNear = false;

    for (let i = officers.length - 1; i >= 0; i--) {
      const cop = officers[i];
      const dist = Math.hypot(cop.x - p.x, cop.z - p.z);

      if (dist > 175 || (cop.dead && cop.deathTimer <= 0)) {
        removeOfficer(cop);
        continue;
      }

      if (cop.dead) {
        cop.deathTimer -= dt;
        animateCharacterRig(cop.rig, { dead: true, speed: 0 }, dt);
        continue;
      }

      // Check vehicle impacts against foot officers
      const allVehs = vehicleMgr.vehicles;
      for (let vIdx = 0; vIdx < allVehs.length; vIdx++) {
        const v = allVehs[vIdx];
        if (v.speed < 5) continue;
        if (Math.hypot(cop.x - v.x, cop.z - v.z) < v.halfW + 0.65) {
          cop.onDamage(v.speed * 6.2, v.aiMode === 'player' ? 'player' : 'traffic');
          break;
        }
      }
      if (cop.dead) continue;

      const seesPlayer = hasLineOfSightToPlayer(cop.x, cop.y, cop.z, 76);
      if (seesPlayer) {
        anySawPlayer = true;
        cop.lastKnownX = p.x;
        cop.lastKnownZ = p.z;
      }

      const goalX = seesPlayer ? p.x : cop.lastKnownX;
      const goalZ = seesPlayer ? p.z : cop.lastKnownZ;
      const dx = goalX - cop.x;
      const dz = goalZ - cop.z;
      const goalDist = Math.max(0.01, Math.hypot(dx, dz));
      cop.yaw = Math.atan2(dx, dz);

      // Arrest check: low-speed / on-foot cornered player within 2.35m at 1-2 stars (or stopped car)
      const playerStopped = p.speed < 2.1;
      if (dist < 2.45 && playerStopped && !p.dead && !p.arrested && stars <= 2) {
        arrestingOfficerNear = true;
      }

      cop.strafeTimer -= dt;
      if (cop.strafeTimer <= 0) {
        cop.strafeSign *= -1;
        cop.strafeTimer = 1.3 + Math.random() * 1.6;
      }

      const preferredRange = stars === 1 ? 2.1 : 13;
      if (goalDist > preferredRange + 3) {
        cop.speed = stars >= 3 ? 5.9 : 5.1;
        cop.vx = (dx / goalDist) * cop.speed;
        cop.vz = (dz / goalDist) * cop.speed;
      } else if (goalDist < preferredRange - 3 && stars >= 2) {
        cop.speed = 2.8;
        cop.vx = (-dx / goalDist) * cop.speed;
        cop.vz = (-dz / goalDist) * cop.speed;
      } else if (stars >= 2) {
        cop.speed = 2.5;
        cop.vx = (dz / goalDist) * cop.strafeSign * cop.speed;
        cop.vz = (-dx / goalDist) * cop.strafeSign * cop.speed;
      } else {
        cop.speed = 0;
        cop.vx = 0;
        cop.vz = 0;
      }

      let aiming = false;
      if (seesPlayer && !p.dead && !p.arrested && dist <= cfg.lethalBelowDist) {
        aiming = true;
        cop.fireCooldown -= dt;
        if (cop.fireCooldown <= 0 && (stars >= 2 || dist > 3.2)) {
          const cadence = 1 / cop.weaponDef.fireRate;
          cop.fireCooldown = cadence * (2.2 - stars * 0.18 + Math.random() * 0.7);
          copShotOrigin.set(cop.x, cop.y + 1.44, cop.z);
          const inaccuracy = Math.max(0.45, 1.55 - stars * 0.2);
          copShotDir
            .set(
              p.x - cop.x + (Math.random() - 0.5) * inaccuracy,
              p.y + 1.15 - (cop.y + 1.44),
              p.z - cop.z + (Math.random() - 0.5) * inaccuracy,
            )
            .normalize();
          actorSys.fireWeapon(
            copShotOrigin,
            copShotDir,
            { ...cop.weaponDef, damage: cop.weaponDef.damage * (0.32 + stars * 0.06) },
            false,
          );
        }
      }

      const nx = cop.x + cop.vx * dt;
      const nz = cop.z + cop.vz * dt;
      if (!cityWorld.isWaterAt(nx, nz)) {
        const col = cityWorld.resolveCircleCollision(nx, nz, 0.44, cop.y);
        cop.x = col.x;
        cop.z = col.z;
      }
      cop.y = cityWorld.getGroundHeight(cop.x, cop.z);
      cop.rig.root.position.set(cop.x, cop.y, cop.z);
      cop.rig.root.rotation.y = cop.yaw;

      animateCharacterRig(
        cop.rig,
        {
          dead: false,
          speed: cop.speed,
          aiming,
          twoHanded: cop.weaponDef.twoHanded,
          punchTimer: 0,
        },
        dt,
      );
    }

    // Arrest progress accumulation
    if (arrestingOfficerNear && !p.dead && !p.arrested) {
      arrestProgress += dt;
      if (arrestProgress >= 1.35) {
        arrestProgress = 0;
        p.arrested = true;
        p.downTimer = 3.0;
        if (p.inVehicle) {
          actorSys.exitCurrentVehicle();
        }
        if (typeof arrestCallback === 'function') {
          arrestCallback('arrest');
        }
      }
    } else {
      arrestProgress = Math.max(0, arrestProgress - dt * 1.5);
    }

    return anySawPlayer;
  }

  function maintainPoliceForces(dt) {
    if (stars <= 0) return;
    const cfg = STAR_CONFIGS[stars];
    const p = actorSys.player;

    // Clean up distant roadblocks
    for (let i = roadblocks.length - 1; i >= 0; i--) {
      const rb = roadblocks[i];
      if (Math.hypot(rb.x - p.x, rb.z - p.z) > 195) {
        removeRoadblock(rb);
      }
    }

    if (evading) return;

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = cfg.spawnInterval;

      let liveOfficers = 0;
      for (let i = 0; i < officers.length; i++) {
        if (!officers[i].dead) liveOfficers++;
      }

      if (cruisers.length < cfg.maxCruisers && !cityWorld.isWaterAt(p.x, p.z)) {
        spawnPatrolCruiser();
      } else if (liveOfficers < cfg.maxOfficers) {
        const pt = cityWorld.getRandomSidewalkPoint(null, p.x, p.z, 36, 82);
        spawnOfficer(pt.x, pt.z, cfg.tactical);
      }
    }

    if (cfg.roadblocks > 0 && roadblocks.length < cfg.roadblocks && p.inVehicle && p.speed > 10) {
      roadblockTimer -= dt;
      if (roadblockTimer <= 0) {
        roadblockTimer = 7.5;
        spawnRoadblock();
      }
    }
  }

  function update(dt) {
    gunfireWitnessCooldown = Math.max(0, gunfireWitnessCooldown - dt);

    if (stars <= 0) {
      if (effects) effects.setSirenState(0, false);
      return;
    }

    maintainPoliceForces(dt);
    const cruiserStatus = stepCruiserUnits(dt);
    const footSaw = stepFootOfficers(dt);

    const spotted = cruiserStatus.anySawPlayer || footSaw;
    if (spotted) {
      evading = false;
      cooldownTimer = Math.max(0, cooldownTimer - dt * 0.65);
    } else {
      evading = true;
      cooldownTimer += dt;
      if (cooldownTimer >= cooldownDuration) {
        clearWanted();
        return;
      }
    }

    if (effects) {
      const d = cruiserStatus.nearestSirenDist;
      const sirenIntensity = Number.isFinite(d) ? Math.max(0, 1 - d / 135) : 0;
      effects.setSirenState(sirenIntensity, stars >= 4 && d < 36);
    }
  }

  // Wire into actorSys crime and target hooks automatically
  actorSys.setCrimeCallback((crimeType, severity, pos) => {
    reportCrime(crimeType, severity, pos);
  });
  actorSys.registerExternalTargets(() => officers);

  return {
    officers,
    cruisers,
    roadblocks,
    reportCrime,
    setStars,
    clearWanted,
    getStars() {
      return stars;
    },
    isEvading() {
      return stars > 0 && evading;
    },
    getHudState() {
      return {
        stars,
        evading: stars > 0 && evading,
        cooldownProgress: cooldownDuration > 0 ? cooldownTimer / cooldownDuration : 0,
        arresting: arrestProgress > 0.15,
      };
    },
    getMinimapUnits() {
      const units = [];
      for (let i = 0; i < cruisers.length; i++) {
        const v = cruisers[i].vehicle;
        if (v && !v.destroyed) {
          units.push({ x: v.x, z: v.z, yaw: v.yaw, kind: 'cruiser' });
        }
      }
      for (let i = 0; i < officers.length; i++) {
        const c = officers[i];
        if (!c.dead) {
          units.push({ x: c.x, z: c.z, yaw: c.yaw, kind: 'officer' });
        }
      }
      return units;
    },
    spawnOfficer,
    spawnPatrolCruiser,
    onPlayerArrested(fn) {
      arrestCallback = fn;
    },
    update,
  };
}

