// Deterministic scene staging for automated screenshot & visual verification (?shot=...)

import { createSeededRng } from './city-map.js';

export const SHOT_PRESETS = ['chase', 'onfoot', 'combat', 'title'];

const SHOT_ALIASES = {
  chase: 'chase',
  '1': 'chase',
  '1-chase-cover': 'chase',
  onfoot: 'onfoot',
  '2': 'onfoot',
  '2-miramar-mission': 'onfoot',
  combat: 'combat',
  '3': 'combat',
  '3-dockyard-heist': 'combat',
  title: 'title',
  '4': 'title',
  '4-title-safehouse': 'title',
};

export function resolveShotPreset(rawName) {
  if (!rawName) return null;
  const key = String(rawName).trim().toLowerCase();
  return SHOT_ALIASES[key] || SHOT_PRESETS[0];
}

export function stageDeterministicShot(shotName, seed = 2026, ctx = {}) {
  const {
    THREE,
    camera,
    cityWorld,
    cameraRig,
    effects,
    vehicleMgr,
    actorSys,
    wantedSys,
    missionSys,
    ui,
    setTimeOfDay,
  } = ctx;

  const preset = resolveShotPreset(shotName);
  const rng = createSeededRng(seed);

  // Reset dynamic entities so every render of a preset is 100% reproducible
  effects.clearAll();
  wantedSys.clearWanted();
  vehicleMgr.clearTraffic(false);
  actorSys.clearAmbientPeds();
  actorSys.clearMissionPeds();

  if (preset === 'chase') {
    // 1. Sunset golden-hour coastal pursuit along Miramar Ocean Drive
    setTimeOfDay(0.755);
    ui.closeMenus();
    ui.setHudVisible(true);

    const heroCar = vehicleMgr.spawnVehicle('sports', 274.2, -32, 0.16, {
      color: 0xff3355,
      persistent: true,
    });
    heroCar.speed = 36;
    heroCar.forwardSpeed = 36;
    heroCar.vx = Math.sin(heroCar.yaw) * 34;
    heroCar.vz = Math.cos(heroCar.yaw) * 34;
    heroCar.rig.chassis.rotation.z = -0.065;
    actorSys.enterVehicle(heroCar);
    actorSys.addCash(4200);

    // Pursuing Patrulla cruisers with strobes lit
    wantedSys.setStars(3);
    const copCar1 = vehicleMgr.spawnVehicle('police', 278.4, -46.5, 0.08, {
      aiMode: 'police',
      isPolice: true,
      sirenOn: true,
      persistent: true,
    });
    const copCar2 = vehicleMgr.spawnVehicle('police', 271.2, -53.5, 0.12, {
      aiMode: 'police',
      isPolice: true,
      sirenOn: true,
      persistent: true,
    });
    copCar1.rig.sirenRedMat.color.setHex(0xff2942);
    copCar1.rig.sirenBlueMat.color.setHex(0x3395ff);
    copCar2.rig.sirenRedMat.color.setHex(0x3395ff);
    copCar2.rig.sirenBlueMat.color.setHex(0xff2942);

    // Oncoming coastal traffic & speedboat offshore
    vehicleMgr.spawnVehicle('sedan', 282.2, 8, Math.PI, { color: 0xf4a700, persistent: true });
    vehicleMgr.spawnVehicle('boat', 392, -18, 0.25, { color: 0x1ec8d6, persistent: true });

    // Drift tire smoke trail behind hero Mirage GT
    for (let i = 0; i < 10; i++) {
      effects.spawnTireSmoke(
        {
          x: 274 - i * 0.22 + rng.range(-0.3, 0.3),
          y: 0.12,
          z: -34.4 - i * 0.9,
        },
        1.25,
      );
    }

    cameraRig.setOverride({
      position: [266.2, 4.35, -18.5],
      target: [275.4, 1.55, -38.0],
      fov: 56,
    });
    effects.update(0.03, camera.position);
    cityWorld.update(0.016, camera, 6.2);
    ui.update(0.016, 0.755);
    return preset;
  }

  if (preset === 'onfoot') {
    // 2. Sunny tropical morning outside Hotel Brisa Dorada in Miramar Beach
    setTimeOfDay(0.41);
    ui.closeMenus();
    ui.setHudVisible(true);

    actorSys.teleportPlayer(239.5, -55.5, 2.55);
    actorSys.giveWeapon('smg', 180, true);
    actorSys.healPlayer(100, 75);

    missionSys.startMission('m2_miramar_race', { skipBriefing: true });
    missionSys.setWaypointPreview(232, -62);

    // Parked coastal vehicles & strolling pedestrians
    vehicleMgr.spawnVehicle('sports', 244.5, -49.5, -0.55, {
      color: 0x1ee3cf,
      persistent: true,
    });
    vehicleMgr.spawnVehicle('suv', 274, -68, 0, { color: 0xe6e9ef, persistent: true });

    actorSys.spawnPed({ role: 'civilian', x: 234, z: -52, yaw: 0.6, persistent: true });
    actorSys.spawnPed({ role: 'civilian', x: 246, z: -66, yaw: -1.2, persistent: true });
    actorSys.spawnPed({ role: 'civilian', x: 286, z: -58, yaw: 0.1, persistent: true });

    cameraRig.setOverride({
      position: [245.4, 3.35, -48.6],
      target: [235.5, 1.85, -61.5],
      fov: 58,
    });
    cityWorld.update(0.016, camera, 12.4);
    missionSys.update(0.016);
    ui.update(0.016, 0.41);
    return preset;
  }

  if (preset === 'combat') {
    // 3. Puerto Dorado Dockyard Heist firefight with tracers & exploding cartel SUV
    setTimeOfDay(0.72);
    ui.closeMenus();
    ui.setHudVisible(true);

    missionSys.startMission('m5_dockyard_heist', { skipBriefing: true, forceUnlock: true });
    actorSys.teleportPlayer(144.5, 355.5, 0.58);
    actorSys.giveWeapon('rifle', 240, true);
    actorSys.player.aiming = true;
    actorSys.player.rig.rightArmPivot.rotation.x = -Math.PI * 0.48;
    actorSys.player.rig.leftArmPivot.rotation.x = -Math.PI * 0.46;
    actorSys.player.rig.leftArmPivot.rotation.y = 0.36;

    wantedSys.setStars(4);

    // Cover vehicles, harbor guards & fiery cartel SUV blast
    vehicleMgr.spawnVehicle('truck', 139.2, 362.5, 0.35, {
      color: 0xc97e28,
      persistent: true,
    });
    const burningSuv = vehicleMgr.spawnVehicle('suv', 156.5, 369.5, -0.75, {
      color: 0x26303d,
      persistent: true,
    });
    vehicleMgr.spawnVehicle('police', 149.0, 347.5, 0.18, {
      aiMode: 'parked',
      isPolice: true,
      sirenOn: true,
      persistent: true,
    });

    effects.spawnExplosion({ x: burningSuv.x, y: 1.1, z: burningSuv.z }, 7.2);
    effects.spawnMuzzleFlash(
      new THREE.Vector3(144.9, 1.5, 356.2),
      new THREE.Vector3(0.55, -0.02, 0.83),
      1.25,
    );
    effects.spawnBulletTracer(
      new THREE.Vector3(145.0, 1.48, 356.3),
      new THREE.Vector3(154.5, 1.35, 368.2),
      0xffe28a,
    );
    effects.spawnBulletTracer(
      new THREE.Vector3(161.5, 1.45, 366.0),
      new THREE.Vector3(146.2, 1.55, 357.0),
      0xff8a65,
    );

    cameraRig.setOverride({
      position: [140.8, 3.15, 350.2],
      target: [154.2, 1.75, 368.5],
      fov: 57,
    });
    effects.update(0.04, camera.position);
    cityWorld.update(0.016, camera, 18.0);
    missionSys.update(0.016);
    ui.update(0.016, 0.72);
    return preset;
  }

  // 4. Title / Safehouse golden coastal overlook
  setTimeOfDay(0.295);
  ui.openTitleMenu();

  vehicleMgr.spawnVehicle('sports', 274, -76, 0.15, { color: 0xf4a700, persistent: true });
  vehicleMgr.spawnVehicle('sedan', 282, -52, Math.PI, { color: 0x24d6c4, persistent: true });
  vehicleMgr.spawnVehicle('boat', 368, -62, -0.4, { color: 0xf4f7fb, persistent: true });

  cameraRig.setOverride({
    position: [318, 25.5, -18],
    target: [232, 11.5, -68],
    fov: 54,
  });
  cityWorld.update(0.016, camera, 4.0);
  return 'title';
}
