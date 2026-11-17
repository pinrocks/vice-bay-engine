// 8-mission coastal crime campaign, objective state machine, 3D beacons & safehouse progression

export const STORY_MISSIONS = [
  {
    id: 'm1_welcome',
    index: 1,
    title: 'Sunburn Welcome',
    giver: 'Rico Salazar',
    district: 'Faro Viejo -> Miramar Beach',
    reward: 1500,
    unlockWeapon: 'shotgun',
    triggerPos: { x: -144, z: -44 },
    summary:
      'Pick up Rico’s tuned Solara Sedan outside Casa del Sol, collect Elena’s coded courier satchel at Hotel Brisa Dorada on Miramar Beach, and roll it safely into Taller Fantasma.',
    introLines: [
      { speaker: 'Rico Salazar', text: 'Welcome back to Sol del Mar, Mateo. Keys are in the blue Solara out front.' },
      { speaker: 'Elena Rojas', text: 'Meet my runner by Hotel Brisa Dorada on Ocean Drive, then bring the satchel to Taller Fantasma.' },
    ],
  },
  {
    id: 'm2_miramar_race',
    index: 2,
    title: 'Ocean Drive Sprint',
    giver: 'Elena Rojas',
    district: 'Miramar Beach -> Punta Faro',
    reward: 3200,
    unlockWeapon: null,
    triggerPos: { x: 232, z: -62 },
    summary:
      'Outrun street champion Diego along five sun-drenched coastal checkpoints from Hotel Brisa Dorada through Bahia Marina and north to Punta Faro Point before time expires.',
    introLines: [
      { speaker: 'Elena Rojas', text: 'Castellano’s street crews only respect speed. Beat their pace car to Punta Faro before the clock hits zero.' },
    ],
  },
  {
    id: 'm3_cold_cargo',
    index: 3,
    title: 'Hot Sun, Cold Cargo',
    giver: 'Rico Salazar',
    district: 'Bahia Marina -> Downtown -> Faro Viejo',
    reward: 4000,
    unlockWeapon: null,
    triggerPos: { x: 268, z: 218 },
    summary:
      'Drive a loaded Costa 4x4 across three timed coastal drop-offs without wrecking the cargo, then clear out rival lookouts waiting at the final courtyard.',
    introLines: [
      { speaker: 'Rico Salazar', text: 'Three drops, tight schedule, sensitive hardware in the trunk. Keep the fenders straight, hermano.' },
    ],
  },
  {
    id: 'm4_hill_heist',
    index: 4,
    title: 'Villa Montecristo Boost',
    giver: 'Elena Rojas',
    district: 'Las Palmas Hills -> Costa Brava',
    reward: 5500,
    unlockWeapon: 'rifle',
    triggerPos: { x: -256, z: 272 },
    summary:
      'Slip into Don Hector’s hillside estate in Las Palmas Hills, neutralize his driveway security, boost his custom gold Mirage GT, lose the police tail, and stash it at Taller Fantasma.',
    introLines: [
      { speaker: 'Elena Rojas', text: 'Don Hector keeps a custom gold Mirage GT parked behind Villa Montecristo. Take out the guards and bring it home clean.' },
    ],
  },
  {
    id: 'm5_dockyard_heist',
    index: 5,
    title: 'Berth C Manifest',
    giver: 'Elena Rojas',
    district: 'Puerto Dorado Dockyards',
    reward: 7500,
    unlockWeapon: null,
    triggerPos: { x: 112, z: 332 },
    summary:
      'Breach Castellano’s shipping yard at Puerto Dorado Berth C, clear harbor mercenaries, seize two encrypted manifest crates, survive dockside reinforcements, and escape the port.',
    introLines: [
      { speaker: 'Elena Rojas', text: 'Every shipment Castellano moves goes through Berth C. Crack both manifest crates and get clear of the cranes.' },
    ],
  },
  {
    id: 'm6_convoy_chase',
    index: 6,
    title: 'Solis Armored Intercept',
    giver: 'Rico Salazar',
    district: 'Solis Downtown',
    reward: 9000,
    unlockWeapon: null,
    triggerPos: { x: 34, z: -56 },
    summary:
      'Intercept Castellano’s moving armored SUV convoy rolling through Solis Downtown, wreck the courier SUV to force out the bearer-bond case, snatch it, and evade a 3-star manhunt.',
    introLines: [
      { speaker: 'Rico Salazar', text: 'Their armored SUV just left Torre Solis with an escort car. Wreck the courier rig and grab the ledger case.' },
    ],
  },
  {
    id: 'm7_bahia_escape',
    index: 7,
    title: 'Riptide Extraction',
    giver: 'Elena Rojas',
    district: 'Bahia Marina -> Open Ocean',
    reward: 11500,
    unlockWeapon: null,
    triggerPos: { x: 282, z: 248 },
    summary:
      'Fight through a dockside ambush on Bahia Marina Pier 4, board the Mako Interceptor speedboat at the end of the pier, and pilot through four offshore channel buoys past Punta Faro.',
    introLines: [
      { speaker: 'Elena Rojas', text: 'Castellano’s hitmen pinned my boat crew on Pier 4. Clear the pier, hit the Mako throttles, and run the channel buoys.' },
    ],
  },
  {
    id: 'm8_final_showdown',
    index: 8,
    title: 'Golden Tide Showdown',
    giver: 'Elena & Rico',
    district: 'Torre Solis -> Puerto Dorado -> Casa del Sol',
    reward: 25000,
    unlockWeapon: null,
    triggerPos: { x: -144, z: -44 },
    summary:
      'Break Castellano’s inner-circle lieutenants at Torre Solis Plaza, corner Don Hector himself at Puerto Dorado Berth C, and escape a 4-star lockdown back to Casa del Sol Safehouse.',
    introLines: [
      { speaker: 'Elena Rojas', text: 'This is for the whole coast, Mateo. Hit Castellano’s captains at Torre Solis, then finish his operation at the docks.' },
      { speaker: 'Mateo Vega', text: 'Once Hector falls, Sol del Mar answers to nobody.' },
    ],
  },
];

export function createMissionAndStorySystem(ctx) {
  const { THREE, scene, cityWorld, vehicleMgr, actorSys, wantedSys, effects } = ctx;

  const missionGroup = new THREE.Group();
  missionGroup.name = 'sol-missions-group';
  scene.add(missionGroup);

  // Safehouse ring marker (Casa del Sol)
  const safehouseLm = cityWorld.landmarks.safehouse;
  const ringGeo = new THREE.RingGeometry(2.1, 2.75, 28);
  ringGeo.rotateX(-Math.PI * 0.5);
  const safehouseMat = new THREE.MeshBasicMaterial({
    color: 0x24d6c4,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.78,
  });
  const safehouseRing = new THREE.Mesh(ringGeo, safehouseMat);
  safehouseRing.position.set(safehouseLm.x + 8, 0.18, safehouseLm.z);
  missionGroup.add(safehouseRing);

  // World mission-start trigger beacon (golden cylinder + ground ring)
  const triggerGroup = new THREE.Group();
  const triggerRingMat = new THREE.MeshBasicMaterial({
    color: 0xf4a700,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85,
  });
  triggerGroup.add(new THREE.Mesh(ringGeo, triggerRingMat));
  const auraGeo = new THREE.CylinderGeometry(2.3, 2.3, 4.5, 20, 1, true);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xffc947,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const triggerAura = new THREE.Mesh(auraGeo, auraMat);
  triggerAura.position.y = 2.25;
  triggerGroup.add(triggerAura);
  missionGroup.add(triggerGroup);

  // Active objective waypoint beacon (tall golden light beam + floating diamond)
  const waypointGroup = new THREE.Group();
  waypointGroup.visible = false;
  const wpRingMat = new THREE.MeshBasicMaterial({
    color: 0xffd24c,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
  });
  const wpRing = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.4, 28), wpRingMat);
  wpRing.rotation.x = -Math.PI * 0.5;
  wpRing.position.y = 0.22;
  waypointGroup.add(wpRing);

  const wpBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 2.5, 16, 18, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf4a700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    }),
  );
  wpBeam.position.y = 8;
  waypointGroup.add(wpBeam);

  const wpDiamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.95, 0),
    new THREE.MeshBasicMaterial({ color: 0xffe07d }),
  );
  wpDiamond.position.y = 4.4;
  waypointGroup.add(wpDiamond);
  missionGroup.add(waypointGroup);

  // Collectible mission prop crates / satchels
  const crateGeo = new THREE.BoxGeometry(0.95, 0.72, 0.95);
  const crateMat = new THREE.MeshLambertMaterial({
    color: 0xf4a700,
    emissive: 0x5c3800,
  });

  const completedIds = new Set();
  let highestUnlockedIndex = 1;

  let activeMission = null;
  let pendingBriefingMission = null;
  let runtime = null;
  let animClock = 0;

  const dialogueQueue = [];
  let currentDialogue = null;
  let currentBanner = null;

  function queueDialogue(lines) {
    if (!Array.isArray(lines)) return;
    for (let i = 0; i < lines.length; i++) {
      dialogueQueue.push({
        speaker: lines[i].speaker,
        text: lines[i].text,
        duration: lines[i].duration || 4.4,
      });
    }
  }

  function showBanner(title, sub = '', tone = 'gold', duration = 3.6) {
    currentBanner = { title, sub, tone, timer: duration };
  }

  function spawnMissionVehicle(type, x, z, yaw, opts = {}) {
    const v = vehicleMgr.spawnVehicle(type, x, z, yaw, {
      ...opts,
      missionTag: 'active_mission',
      persistent: true,
    });
    if (runtime) runtime.vehicles.push(v);
    return v;
  }

  function spawnMissionNpc(role, x, z, weaponId = 'pistol', health = 105) {
    const npc = actorSys.spawnPed({
      role,
      x,
      z,
      weaponId,
      health,
      aiState: 'combat',
      missionTag: 'active_mission',
      persistent: true,
    });
    if (runtime) runtime.npcs.push(npc);
    return npc;
  }

  function spawnMissionCrate(x, z) {
    const y = Math.max(0, cityWorld.getGroundHeight(x, z)) + 0.42;
    const mesh = new THREE.Mesh(crateGeo, crateMat);
    mesh.position.set(x, y, z);
    missionGroup.add(mesh);
    const crate = { x, y, z, mesh, collected: false };
    if (runtime) runtime.crates.push(crate);
    return crate;
  }

  function cleanupMissionEntities(keepPlayerCar = true) {
    if (!runtime) return;
    for (let i = 0; i < runtime.crates.length; i++) {
      const c = runtime.crates[i];
      if (c.mesh.parent) c.mesh.parent.remove(c.mesh);
    }
    for (let i = 0; i < runtime.npcs.length; i++) {
      actorSys.removePed(runtime.npcs[i]);
    }
    for (let i = 0; i < runtime.vehicles.length; i++) {
      const v = runtime.vehicles[i];
      if (keepPlayerCar && actorSys.player.vehicle === v) {
        v.missionTag = null;
        v.persistent = false;
        continue;
      }
      vehicleMgr.removeVehicle(v);
    }
    waypointGroup.visible = false;
  }

  function countAliveGuards(list) {
    let alive = 0;
    for (let i = 0; i < list.length; i++) {
      if (!list[i].dead) alive++;
    }
    return alive;
  }

  function distToPlayer(x, z) {
    return Math.hypot(actorSys.player.x - x, actorSys.player.z - z);
  }

  // ---------------------------------------------------------------------------
  // Campaign Mission Builders (Missions 1 through 4)
  // ---------------------------------------------------------------------------
  function initMissionRuntime(def) {
    runtime = {
      id: def.id,
      step: 0,
      stepTitle: '',
      stepHint: '',
      waypoint: null, // { x, y, z, radius }
      timer: null,
      vehicles: [],
      npcs: [],
      crates: [],
      data: {},
    };

    const p = actorSys.player;

    if (def.id === 'm1_welcome') {
      const car = spawnMissionVehicle('sedan', -138, -36, 0.2, { color: 0x3882dc });
      runtime.data.car = car;
      runtime.stepTitle = 'Enter Rico’s blue Solara Sedan';
      runtime.stepHint = 'Press E beside the parked sedan outside Casa del Sol.';
      runtime.waypoint = { x: car.x, z: car.z, radius: 5 };
    } else if (def.id === 'm2_miramar_race') {
      const playerCar = p.inVehicle && p.vehicle && !p.vehicle.isBoat
        ? p.vehicle
        : spawnMissionVehicle('sports', 220, -68, 0, { color: 0xff3355 });
      if (!p.inVehicle) {
        actorSys.teleportPlayer(216, -68, 1.5);
      }
      const checkpoints = [
        { x: 220, z: 65, radius: 13 },
        { x: 278, z: 215, radius: 13 },
        { x: 110, z: 220, radius: 13 },
        { x: 220, z: -180, radius: 13 },
        { x: 318, z: -352, radius: 15 },
      ];
      const rival = spawnMissionVehicle('sports', 225, -64, 0, {
        color: 0xffb400,
        aiMode: 'convoy',
        targetSpeed: 29,
        waypoints: checkpoints,
      });
      runtime.data = { playerCar, rival, checkpoints, cpIndex: 0 };
      runtime.timer = 105;
      runtime.stepTitle = `Checkpoint 1 / ${checkpoints.length}`;
      runtime.stepHint = 'Stay on the throttle down Ocean Drive and Bahia Marina.';
      runtime.waypoint = checkpoints[0];
    } else if (def.id === 'm3_cold_cargo') {
      const suv = spawnMissionVehicle('suv', 260, 214, -Math.PI * 0.5, {
        color: 0x2f6b5e,
        health: 460,
        maxHealth: 460,
      });
      const drops = [
        { x: 58, z: -42, label: 'Torre Solis Alley' },
        { x: 0, z: -328, label: 'Vista Coral Market' },
        { x: -218, z: 88, label: 'Faro Viejo Courtyard' },
      ];
      runtime.data = { suv, drops, dropIdx: 0, guardsSpawned: false, guards: [] };
      runtime.timer = 140;
      runtime.stepTitle = 'Board the loaded Costa 4x4';
      runtime.stepHint = 'Keep vehicle integrity above zero across all 3 drops.';
      runtime.waypoint = { x: suv.x, z: suv.z, radius: 5 };
    } else if (def.id === 'm4_hill_heist') {
      const targetCar = spawnMissionVehicle('sports', -368, -374, 0.75, {
        color: 0xf4a700,
        health: 360,
        maxHealth: 360,
      });
      const guards = [
        spawnMissionNpc('guard', -362, -366, 'pistol', 95),
        spawnMissionNpc('guard', -376, -368, 'smg', 105),
        spawnMissionNpc('guard', -364, -382, 'shotgun', 110),
      ];
      runtime.data = { targetCar, guards };
      runtime.stepTitle = 'Infiltrate Villa Montecristo & boost the gold Mirage GT';
      runtime.stepHint = 'Drive northwest into Las Palmas Hills and deal with estate security.';
      runtime.waypoint = { x: targetCar.x, z: targetCar.z, radius: 10 };
    } else {
      initLateMissionRuntime(def);
    }
  }

  function stepEarlyMission(dt) {
    const p = actorSys.player;
    const d = runtime.data;

    if (runtime.id === 'm1_welcome') {
      if (d.car && d.car.destroyed) {
        failActiveMission('Rico’s Solara Sedan was wrecked.');
        return;
      }
      if (runtime.step === 0) {
        runtime.waypoint = { x: d.car.x, z: d.car.z, radius: 5 };
        if (p.vehicle === d.car) {
          runtime.step = 1;
          d.satchel = spawnMissionCrate(236, -62);
          runtime.stepTitle = 'Drive to Hotel Brisa Dorada in Miramar Beach';
          runtime.stepHint = 'Follow the golden waypoint east to Ocean Drive.';
          runtime.waypoint = { x: 236, z: -62, radius: 8 };
        }
      } else if (runtime.step === 1) {
        if (distToPlayer(236, -62) < 8.5) {
          d.satchel.collected = true;
          if (d.satchel.mesh.parent) d.satchel.mesh.parent.remove(d.satchel.mesh);
          if (effects) effects.playUiSound('pickup');
          queueDialogue([
            { speaker: 'Elena Rojas', text: 'Got the satchel. Now bring the car into Taller Fantasma in Costa Brava.' },
          ]);
          runtime.step = 2;
          runtime.stepTitle = 'Deliver the satchel to Taller Fantasma Garage';
          runtime.stepHint = 'Head southwest to the industrial chop-shop yard.';
          runtime.waypoint = { x: -260, z: 274, radius: 10 };
        }
      } else if (runtime.step === 2) {
        if (distToPlayer(-260, 274) < 11) {
          completeActiveMission();
        }
      }
    } else if (runtime.id === 'm2_miramar_race') {
      const cps = d.checkpoints;
      const targetCp = cps[d.cpIndex];
      runtime.waypoint = targetCp;
      if (p.inVehicle && distToPlayer(targetCp.x, targetCp.z) < targetCp.radius) {
        d.cpIndex++;
        if (effects) effects.playUiSound('pickup');
        if (d.cpIndex >= cps.length) {
          completeActiveMission();
          return;
        }
        runtime.stepTitle = `Checkpoint ${d.cpIndex + 1} / ${cps.length}`;
        runtime.waypoint = cps[d.cpIndex];
      }
    } else if (runtime.id === 'm3_cold_cargo') {
      if (d.suv.destroyed) {
        failActiveMission('The cargo 4x4 was destroyed.');
        return;
      }
      if (runtime.step === 0) {
        runtime.waypoint = { x: d.suv.x, z: d.suv.z, radius: 5 };
        if (p.vehicle === d.suv) {
          runtime.step = 1;
        }
      }
      if (runtime.step === 1) {
        const drop = d.drops[d.dropIdx];
        runtime.stepTitle = `Deliver cargo (${d.dropIdx + 1}/3): ${drop.label}`;
        runtime.stepHint = 'Drive the Costa 4x4 into the golden drop zone.';
        runtime.waypoint = { x: drop.x, z: drop.z, radius: 9 };
        if (p.vehicle === d.suv && distToPlayer(drop.x, drop.z) < 9.5 && p.speed < 8) {
          if (effects) effects.playUiSound('pickup');
          d.dropIdx++;
          if (d.dropIdx >= d.drops.length) {
            runtime.step = 2;
            d.guards = [
              spawnMissionNpc('gang', drop.x - 12, drop.z + 10, 'pistol', 90),
              spawnMissionNpc('gang', drop.x + 11, drop.z - 9, 'smg', 95),
            ];
            queueDialogue([
              { speaker: 'Rico Salazar', text: 'Castellano’s lookouts spotted the drop! Clear them out, Mateo!' },
            ]);
            runtime.stepTitle = 'Eliminate the ambushing cartel lookouts';
            runtime.stepHint = 'Step out or use drive-by fire to secure the courtyard.';
            runtime.waypoint = { x: drop.x, z: drop.z, radius: 14 };
          }
        }
      } else if (runtime.step === 2) {
        const left = countAliveGuards(d.guards);
        runtime.stepTitle = `Eliminate cartel lookouts (${left} remaining)`;
        if (left === 0) {
          completeActiveMission();
        }
      }
    } else if (runtime.id === 'm4_hill_heist') {
      if (d.targetCar.destroyed) {
        failActiveMission('The custom gold Mirage GT was destroyed.');
        return;
      }
      if (runtime.step === 0) {
        runtime.waypoint = { x: d.targetCar.x, z: d.targetCar.z, radius: 8 };
        if (p.vehicle === d.targetCar) {
          wantedSys.setStars(Math.max(2, wantedSys.getStars()));
          queueDialogue([
            { speaker: 'Elena Rojas', text: 'Estate silent alarm tripped! Shake the Patrulla tail before pulling into Taller Fantasma.' },
          ]);
          runtime.step = 1;
        }
      }
      if (runtime.step === 1) {
        if (wantedSys.getStars() > 0) {
          runtime.stepTitle = 'Evade the police pursuit in the Mirage GT';
          runtime.stepHint = 'Break line-of-sight until your wanted stars clear.';
          runtime.waypoint = { x: -260, z: 274, radius: 10 };
        } else {
          runtime.stepTitle = 'Park the gold Mirage GT at Taller Fantasma';
          runtime.stepHint = 'Pull into the chop-shop bay in Costa Brava.';
          runtime.waypoint = { x: -260, z: 274, radius: 10 };
          if (p.vehicle === d.targetCar && distToPlayer(-260, 274) < 11 && p.speed < 7) {
            completeActiveMission();
          }
        }
      }
    } else {
      stepLateMission(dt);
    }
  }

  // ---------------------------------------------------------------------------
  // Campaign Mission Builders & Step Logic (Missions 5 through 8)
  // ---------------------------------------------------------------------------
  function initLateMissionRuntime(def) {
    if (def.id === 'm5_dockyard_heist') {
      const guards = [
        spawnMissionNpc('guard', 146, 360, 'smg', 105),
        spawnMissionNpc('guard', 162, 366, 'shotgun', 115),
        spawnMissionNpc('guard', 174, 358, 'rifle', 110),
        spawnMissionNpc('guard', 152, 376, 'pistol', 95),
      ];
      const c1 = spawnMissionCrate(148, 368);
      const c2 = spawnMissionCrate(172, 364);
      runtime.data = { guards, crates: [c1, c2], waveSpawned: false };
      runtime.stepTitle = 'Seize both encrypted manifest crates at Berth C (0/2)';
      runtime.stepHint = 'Fight through harbor guards among the Puerto Dorado containers.';
      runtime.waypoint = { x: c1.x, z: c1.z, radius: 7 };
    } else if (def.id === 'm6_convoy_chase') {
      const route = [
        { x: 0, z: -220, radius: 14 },
        { x: 110, z: -220, radius: 14 },
        { x: 110, z: 110, radius: 14 },
        { x: -110, z: 110, radius: 14 },
      ];
      const courier = spawnMissionVehicle('suv', 0, -95, Math.PI, {
        color: 0x1e2430,
        health: 340,
        maxHealth: 340,
        aiMode: 'convoy',
        targetSpeed: 23,
        waypoints: route,
      });
      const escort = spawnMissionVehicle('sedan', 4, -84, Math.PI, {
        color: 0x8f2430,
        aiMode: 'convoy',
        targetSpeed: 23,
        waypoints: route,
      });
      // Parked fast chase bike/car nearby if player is on foot
      if (!actorSys.player.inVehicle) {
        spawnMissionVehicle('motorcycle', 28, -50, -Math.PI * 0.5, { color: 0xff425c });
      }
      runtime.data = { courier, escort, caseCrate: null };
      runtime.stepTitle = 'Intercept & disable Castellano’s armored SUV';
      runtime.stepHint = 'Ram or shoot the black Costa 4x4 until the courier drops the ledger.';
      runtime.waypoint = { x: courier.x, z: courier.z, radius: 10 };
    } else if (def.id === 'm7_bahia_escape') {
      const ambushers = [
        spawnMissionNpc('gang', 308, 246, 'pistol', 95),
        spawnMissionNpc('gang', 322, 250, 'smg', 100),
        spawnMissionNpc('gang', 336, 245, 'shotgun', 105),
      ];
      const boat = spawnMissionVehicle('boat', 398, 248, 0, {
        color: 0x1ec8d6,
        health: 420,
        maxHealth: 420,
      });
      const buoys = [
        { x: 428, z: 140, radius: 16 },
        { x: 442, z: -20, radius: 16 },
        { x: 436, z: -195, radius: 16 },
        { x: 425, z: -368, radius: 18 },
      ];
      runtime.data = { ambushers, boat, buoys, buoyIdx: 0 };
      runtime.stepTitle = 'Clear the cartel ambush on Bahia Marina Pier 4';
      runtime.stepHint = 'Protect the pier deck so you can reach the Mako Interceptor.';
      runtime.waypoint = { x: 324, z: 248, radius: 10 };
    } else if (def.id === 'm8_final_showdown') {
      const towerGuards = [
        spawnMissionNpc('guard', 44, -48, 'smg', 115),
        spawnMissionNpc('guard', 58, -46, 'rifle', 120),
        spawnMissionNpc('guard', 52, -66, 'shotgun', 120),
      ];
      runtime.data = { towerGuards, boss: null, dockGuards: [] };
      runtime.stepTitle = 'Defeat Castellano’s lieutenants at Torre Solis Plaza';
      runtime.stepHint = 'Bring heavy firepower and armor to Solis Downtown.';
      runtime.waypoint = { x: 52, z: -56, radius: 14 };
    }
  }

  function stepLateMission() {
    const p = actorSys.player;
    const d = runtime.data;

    if (runtime.id === 'm5_dockyard_heist') {
      if (runtime.step === 0) {
        let collectedCount = 0;
        let nextTarget = null;
        for (let i = 0; i < d.crates.length; i++) {
          const c = d.crates[i];
          if (!c.collected && distToPlayer(c.x, c.z) < 2.8 && !p.inVehicle) {
            c.collected = true;
            if (c.mesh.parent) c.mesh.parent.remove(c.mesh);
            if (effects) effects.playUiSound('pickup');
          }
          if (c.collected) collectedCount++;
          else if (!nextTarget) nextTarget = c;
        }
        runtime.stepTitle = `Seize manifest crates at Berth C (${collectedCount}/2)`;
        if (nextTarget) {
          runtime.waypoint = { x: nextTarget.x, z: nextTarget.z, radius: 5 };
        }
        if (collectedCount >= 2) {
          runtime.step = 1;
          wantedSys.setStars(Math.max(2, wantedSys.getStars()));
          spawnMissionVehicle('suv', 118, 344, 0.5, { color: 0x26303d });
          spawnMissionNpc('gang', 122, 346, 'smg', 105);
          spawnMissionNpc('gang', 114, 346, 'rifle', 105);
          queueDialogue([
            { speaker: 'Elena Rojas', text: 'You have both manifests! Get out of Puerto Dorado and lose the heat!' },
          ]);
        }
      } else if (runtime.step === 1) {
        if (p.z > 290) {
          runtime.stepTitle = 'Escape north out of Puerto Dorado Dockyards';
          runtime.waypoint = { x: 110, z: 220, radius: 16 };
        } else if (wantedSys.getStars() > 0) {
          runtime.stepTitle = 'Lose your police wanted level';
          runtime.waypoint = null;
        } else {
          completeActiveMission();
        }
      }
    } else if (runtime.id === 'm6_convoy_chase') {
      if (runtime.step === 0) {
        runtime.waypoint = { x: d.courier.x, z: d.courier.z, radius: 10 };
        if (d.courier.destroyed || d.courier.health < d.courier.maxHealth * 0.25) {
          d.courier.aiMode = 'parked';
          d.caseCrate = spawnMissionCrate(d.courier.x + 2.2, d.courier.z + 1.5);
          spawnMissionNpc('guard', d.courier.x - 2.5, d.courier.z, 'smg', 110);
          wantedSys.setStars(Math.max(3, wantedSys.getStars()));
          runtime.step = 1;
          runtime.stepTitle = 'Collect the dropped bearer-bond briefcase';
          runtime.stepHint = 'Exit your vehicle briefly to grab the golden case.';
          runtime.waypoint = { x: d.caseCrate.x, z: d.caseCrate.z, radius: 4 };
        }
      } else if (runtime.step === 1) {
        if (!p.inVehicle && distToPlayer(d.caseCrate.x, d.caseCrate.z) < 2.8) {
          d.caseCrate.collected = true;
          if (d.caseCrate.mesh.parent) d.caseCrate.mesh.parent.remove(d.caseCrate.mesh);
          if (effects) effects.playUiSound('pickup');
          runtime.step = 2;
        }
      } else if (runtime.step === 2) {
        if (wantedSys.getStars() > 0) {
          runtime.stepTitle = 'Evade the 3-star Patrulla manhunt';
          runtime.stepHint = 'Use side alleys or coastal highways to break police sightlines.';
          runtime.waypoint = null;
        } else {
          completeActiveMission();
        }
      }
    } else if (runtime.id === 'm7_bahia_escape') {
      if (d.boat.destroyed) {
        failActiveMission('The Mako Interceptor speedboat was destroyed.');
        return;
      }
      if (runtime.step === 0) {
        const left = countAliveGuards(d.ambushers);
        runtime.stepTitle = `Clear cartel gunmen on Pier 4 (${left} remaining)`;
        if (left === 0) {
          runtime.step = 1;
          runtime.stepTitle = 'Board the Mako Interceptor at the end of Pier 4';
          runtime.stepHint = 'Walk to the end of Bahia Marina Pier 4 and press E.';
          runtime.waypoint = { x: d.boat.x, z: d.boat.z, radius: 8 };
        }
      } else if (runtime.step === 1) {
        runtime.waypoint = { x: d.boat.x, z: d.boat.z, radius: 8 };
        if (p.vehicle === d.boat) {
          wantedSys.setStars(Math.max(2, wantedSys.getStars()));
          runtime.step = 2;
        }
      } else if (runtime.step === 2) {
        const buoy = d.buoys[d.buoyIdx];
        runtime.stepTitle = `Pilot through offshore channel buoys (${d.buoyIdx + 1}/${d.buoys.length})`;
        runtime.stepHint = 'Hold full throttle north toward Punta Faro Point.';
        runtime.waypoint = buoy;
        if (p.vehicle === d.boat && distToPlayer(buoy.x, buoy.z) < buoy.radius) {
          d.buoyIdx++;
          if (effects) effects.playUiSound('pickup');
          if (d.buoyIdx >= d.buoys.length) {
            wantedSys.clearWanted();
            completeActiveMission();
          }
        }
      }
    } else if (runtime.id === 'm8_final_showdown') {
      if (runtime.step === 0) {
        const left = countAliveGuards(d.towerGuards);
        runtime.stepTitle = `Defeat Torre Solis lieutenants (${left} remaining)`;
        if (left === 0) {
          runtime.step = 1;
          d.boss = spawnMissionNpc('vip', 164, 374, 'rifle', 240);
          d.dockGuards = [
            spawnMissionNpc('guard', 156, 368, 'shotgun', 125),
            spawnMissionNpc('guard', 172, 368, 'rifle', 125),
            spawnMissionNpc('guard', 164, 360, 'smg', 120),
          ];
          queueDialogue([
            { speaker: 'Rico Salazar', text: 'Castellano is trying to board a freighter at Berth C! Move to Puerto Dorado now!' },
          ]);
          runtime.stepTitle = 'Corner & eliminate Don Hector Castellano at Berth C';
          runtime.stepHint = 'Watch out for his heavily armed dockside bodyguards.';
          runtime.waypoint = { x: 164, z: 374, radius: 12 };
        }
      } else if (runtime.step === 1) {
        if (d.boss && !d.boss.dead) {
          runtime.waypoint = { x: d.boss.x, z: d.boss.z, radius: 8 };
        } else {
          wantedSys.setStars(4);
          queueDialogue([
            { speaker: 'Elena Rojas', text: 'Castellano is down! Half the force is converging on the port—get back to Casa del Sol clean!' },
          ]);
          runtime.step = 2;
        }
      } else if (runtime.step === 2) {
        const sh = cityWorld.landmarks.safehouse;
        if (wantedSys.getStars() > 0) {
          runtime.stepTitle = 'Lose the 4-star citywide lockdown';
          runtime.stepHint = 'Evade cruisers and roadblocks before returning to Casa del Sol.';
          runtime.waypoint = { x: sh.x + 8, z: sh.z, radius: 10 };
        } else {
          runtime.stepTitle = 'Return to Casa del Sol Safehouse';
          runtime.stepHint = 'Head into Faro Viejo to celebrate taking Sol del Mar.';
          runtime.waypoint = { x: sh.x + 8, z: sh.z, radius: 9 };
          if (distToPlayer(sh.x + 8, sh.z) < 10) {
            completeActiveMission();
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Mission Lifecycle, Briefing Flow, Persistence & Per-Frame Update
  // ---------------------------------------------------------------------------
  function getNextCampaignMission() {
    for (let i = 0; i < STORY_MISSIONS.length; i++) {
      if (!completedIds.has(STORY_MISSIONS[i].id)) {
        return STORY_MISSIONS[i];
      }
    }
    return STORY_MISSIONS[0];
  }

  function startMission(missionId, options = {}) {
    const def = STORY_MISSIONS.find((m) => m.id === missionId);
    if (!def) return false;
    if (def.index > highestUnlockedIndex && !options.forceUnlock) return false;

    if (activeMission) {
      cleanupMissionEntities(false);
      activeMission = null;
      runtime = null;
    }

    if (options.skipBriefing) {
      pendingBriefingMission = null;
      beginMissionExecution(def);
    } else {
      pendingBriefingMission = def;
    }
    return true;
  }

  function beginMissionExecution(def) {
    activeMission = def;
    pendingBriefingMission = null;
    initMissionRuntime(def);
    queueDialogue(def.introLines);
    showBanner(def.title, `Contract — ${def.giver}`, 'gold', 3.0);
    if (effects) effects.playUiSound('mission_start');
  }

  function acceptBriefing() {
    if (!pendingBriefingMission) return false;
    const def = pendingBriefingMission;
    beginMissionExecution(def);
    return true;
  }

  function cancelBriefing() {
    pendingBriefingMission = null;
  }

  function completeActiveMission() {
    if (!activeMission) return;
    const def = activeMission;
    completedIds.add(def.id);
    highestUnlockedIndex = Math.max(highestUnlockedIndex, Math.min(STORY_MISSIONS.length, def.index + 1));

    actorSys.addCash(def.reward);
    let subText = `+$${def.reward.toLocaleString()} Earned`;
    if (def.unlockWeapon) {
      actorSys.giveWeapon(def.unlockWeapon, 64, false);
      subText += ` • ${def.unlockWeapon.toUpperCase()} Unlocked`;
    }

    cleanupMissionEntities(true);
    activeMission = null;
    runtime = null;
    showBanner('Mission Passed', subText, 'gold', 4.4);
    if (effects) effects.playUiSound('mission_pass');
  }

  function failActiveMission(reason = 'Contract Failed') {
    if (!activeMission) return;
    cleanupMissionEntities(true);
    activeMission = null;
    runtime = null;
    showBanner('Mission Failed', reason, 'danger', 3.8);
    if (effects) effects.playUiSound('mission_fail');
  }

  function abortMission() {
    if (!activeMission) return;
    failActiveMission('Mission Aborted');
  }

  function getMissionsList() {
    return STORY_MISSIONS.map((m) => ({
      id: m.id,
      index: m.index,
      title: m.title,
      giver: m.giver,
      district: m.district,
      reward: m.reward,
      summary: m.summary,
      completed: completedIds.has(m.id),
      unlocked: m.index <= highestUnlockedIndex,
    }));
  }

  function update(dt) {
    animClock += dt;

    // Pulse safehouse ring
    const shScale = 1 + Math.sin(animClock * 3.2) * 0.06;
    safehouseRing.scale.setScalar(shScale);

    // Update dialogue queue
    if (currentDialogue) {
      currentDialogue.timer -= dt;
      if (currentDialogue.timer <= 0) {
        currentDialogue = null;
      }
    }
    if (!currentDialogue && dialogueQueue.length > 0) {
      const next = dialogueQueue.shift();
      currentDialogue = {
        speaker: next.speaker,
        text: next.text,
        timer: next.duration,
      };
    }

    // Update big HUD banner timer
    if (currentBanner) {
      currentBanner.timer -= dt;
      if (currentBanner.timer <= 0) {
        currentBanner = null;
      }
    }

    // Active mission progression
    if (activeMission && runtime) {
      triggerGroup.visible = false;

      if (actorSys.player.dead) {
        failActiveMission('You were hospitalized.');
        return;
      }
      if (actorSys.player.arrested) {
        failActiveMission('You were detained by Patrulla.');
        return;
      }

      if (runtime.timer !== null) {
        runtime.timer -= dt;
        if (runtime.timer <= 0) {
          failActiveMission('Out of time.');
          return;
        }
      }

      stepEarlyMission(dt);

      if (runtime && runtime.waypoint) {
        const wp = runtime.waypoint;
        const wy = Math.max(cityWorld.bounds.seaLevel, cityWorld.getGroundHeight(wp.x, wp.z));
        waypointGroup.visible = true;
        waypointGroup.position.set(wp.x, wy, wp.z);
        wpDiamond.rotation.y = animClock * 2.5;
        wpDiamond.position.y = 4.2 + Math.sin(animClock * 3.8) * 0.4;
      } else {
        waypointGroup.visible = false;
      }

      // Spin active mission crates
      if (runtime) {
        for (let i = 0; i < runtime.crates.length; i++) {
          const c = runtime.crates[i];
          if (!c.collected) {
            c.mesh.rotation.y = animClock * 2.1;
          }
        }
      }
    } else {
      // Idle roam: display world trigger ring for next uncompleted campaign mission
      waypointGroup.visible = false;
      const nextDef = getNextCampaignMission();
      if (nextDef) {
        const ty = Math.max(0, cityWorld.getGroundHeight(nextDef.triggerPos.x, nextDef.triggerPos.z));
        triggerGroup.visible = true;
        triggerGroup.position.set(nextDef.triggerPos.x, ty + 0.16, nextDef.triggerPos.z);
        triggerAura.rotation.y = animClock * 1.4;
      } else {
        triggerGroup.visible = false;
      }
    }
  }

  function getActiveState() {
    const p = actorSys.player;
    const shDist = Math.hypot(p.x - (safehouseLm.x + 8), p.z - safehouseLm.z);
    const nextDef = !activeMission ? getNextCampaignMission() : null;
    const trigDist = nextDef
      ? Math.hypot(p.x - nextDef.triggerPos.x, p.z - nextDef.triggerPos.z)
      : Infinity;

    return {
      activeMission,
      pendingBriefing: pendingBriefingMission,
      stepTitle: runtime ? runtime.stepTitle : '',
      stepHint: runtime ? runtime.stepHint : '',
      waypoint: runtime ? runtime.waypoint : null,
      timer: runtime ? runtime.timer : null,
      dialogue: currentDialogue,
      banner: currentBanner,
      nearSafehouse: !activeMission && shDist < 4.5,
      nearTriggerMission: !activeMission && trigDist < 4.5 ? nextDef : null,
      nextTriggerPos: nextDef ? nextDef.triggerPos : null,
      nextMissionTitle: nextDef ? nextDef.title : '',
    };
  }

  return {
    missions: STORY_MISSIONS,
    getMissionsList,
    startMission,
    acceptBriefing,
    cancelBriefing,
    abortMission,
    showBanner,
    queueDialogue,
    getActiveState,
    setWaypointPreview(x, z) {
      const wy = Math.max(cityWorld.bounds.seaLevel, cityWorld.getGroundHeight(x, z));
      waypointGroup.visible = true;
      waypointGroup.position.set(x, wy, z);
    },
    serialize() {
      return {
        completed: Array.from(completedIds),
        highestUnlockedIndex,
      };
    },
    deserialize(data) {
      if (!data) return;
      completedIds.clear();
      if (Array.isArray(data.completed)) {
        data.completed.forEach((id) => completedIds.add(id));
      }
      highestUnlockedIndex = Math.max(1, Number(data.highestUnlockedIndex) || 1);
    },
    update,
  };
}



