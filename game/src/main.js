// Sol del Mar — Main 3D engine bootstrap, fixed-timestep simulation, day/night & localStorage save

import * as THREE from 'three';
import { createCityWorld } from './city-map.js';
import { createCameraRig } from './camera-rig.js';
import { createEffectsAndAudio } from './effects-audio.js';
import { createVehicleManager } from './vehicles.js';
import { createActorsAndCombat } from './player-peds.js';
import { createWantedSystem } from './wanted-police.js';
import { createMissionAndStorySystem } from './missions-story.js';
import { createHudAndMenus } from './hud-menus.js';
import { createGameInput } from './input.js';
import { stageDeterministicShot } from './shots.js';

const SAVE_STORAGE_KEY = 'sol_del_mar_save_v1';
const FIXED_DT = 1 / 60;
const MAX_FRAME_DELTA = 0.085;
// Full 24-hour coastal sun/moon progression every 7 minutes of active open-world play
const DAY_CYCLE_SECONDS = 420;
const WORLD_DEFAULT_SEED = 2026;

function parseLaunchParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const rawSeed = Number(params.get('seed'));
  const seed = Number.isFinite(rawSeed) && rawSeed > 0 ? Math.floor(rawSeed) : WORLD_DEFAULT_SEED;
  return { shot, seed };
}

function readLocalStorageSave() {
  try {
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_err) {
    return null;
  }
}

function writeLocalStorageSave(payload) {
  try {
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (_err) {
    return false;
  }
}

function bootstrapSolDelMar() {
  const canvas = document.getElementById('game-canvas');
  const hudRoot = document.getElementById('hud-root');
  const menuRoot = document.getElementById('menu-root');
  const srStatus = document.getElementById('sr-status');

  const { shot, seed } = parseLaunchParams();

  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: Boolean(shot),
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene & Perspective Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    62,
    window.innerWidth / Math.max(1, window.innerHeight),
    0.35,
    1300,
  );

  // Core Game Subsystems
  const cityWorld = createCityWorld(THREE, scene, seed);
  const cameraRig = createCameraRig(THREE, camera);
  const effects = createEffectsAndAudio(THREE, scene);
  const vehicleMgr = createVehicleManager(THREE, scene, cityWorld, effects);
  const actorSys = createActorsAndCombat(THREE, scene, cityWorld, vehicleMgr, effects);
  const wantedSys = createWantedSystem(THREE, scene, cityWorld, vehicleMgr, actorSys, effects);
  const input = createGameInput(canvas);

  input.onFirstGesture(() => {
    effects.unlockAudio();
  });

  let simTime = 0;
  let timeOfDay = 0.38; // Warm coastal mid-morning
  let trafficDensity = 1.0;
  let respawnSequence = null; // { timer, kind }
  let titleBackdropOrbit = 0;

  function applyTimeOfDay(nextTime01) {
    timeOfDay = ((nextTime01 % 1) + 1) % 1;
    cityWorld.setTimeOfDay(timeOfDay);
  }

  const missionSys = createMissionAndStorySystem({
    THREE,
    scene,
    cityWorld,
    vehicleMgr,
    actorSys,
    wantedSys,
    effects,
  });

  // Spawn signature parked vehicles at key coastal landmarks for immediate exploration
  function seedLandmarkVehicles() {
    const sh = cityWorld.landmarks.safehouse;
    vehicleMgr.spawnVehicle('sedan', sh.x + 17, sh.z - 6, 0.3, {
      color: 0x24d6c4,
      persistent: true,
    });
    vehicleMgr.spawnVehicle('motorcycle', sh.x + 14, sh.z + 9, 1.1, {
      color: 0xf4a700,
      persistent: true,
    });
    vehicleMgr.spawnVehicle('sports', 242, -48, -0.4, {
      color: 0xff3355,
      persistent: true,
    });
    const pier = cityWorld.landmarks.marinaPier;
    vehicleMgr.spawnVehicle('boat', pier.x + 48, pier.z, 0, {
      color: 0x1ec8d6,
      persistent: true,
    });
  }

  function saveGameProgress() {
    return writeLocalStorageSave({
      version: 1,
      savedAt: Date.now(),
      timeOfDay,
      trafficDensity,
      actor: actorSys.getSaveData(),
      missions: missionSys.serialize(),
    });
  }

  function loadGameProgress() {
    const data = readLocalStorageSave();
    if (!data) return false;
    cameraRig.setOverride(null);
    wantedSys.clearWanted();
    if (typeof data.timeOfDay === 'number') applyTimeOfDay(data.timeOfDay);
    if (typeof data.trafficDensity === 'number') trafficDensity = data.trafficDensity;
    actorSys.loadSaveData(data.actor);
    missionSys.deserialize(data.missions);
    cameraRig.snapToTarget(actorSys.player, cityWorld);
    return true;
  }

  function resetNewGame() {
    cameraRig.setOverride(null);
    wantedSys.clearWanted();
    missionSys.abortMission();
    missionSys.deserialize({ completed: [], highestUnlockedIndex: 1 });
    const sh = cityWorld.landmarks.safehouse;
    actorSys.loadSaveData({
      x: sh.x + 12,
      z: sh.z + 4,
      yaw: 0.4,
      health: 100,
      armor: 50,
      cash: 650,
      weaponIndex: 1,
      weapons: [
        { id: 'fist', unlocked: true, ammo: 9999 },
        { id: 'pistol', unlocked: true, ammo: 84 },
        { id: 'shotgun', unlocked: false, ammo: 24 },
        { id: 'smg', unlocked: true, ammo: 150 },
        { id: 'rifle', unlocked: false, ammo: 90 },
      ],
    });
    applyTimeOfDay(0.38);
    cameraRig.snapToTarget(actorSys.player, cityWorld);
  }

  const ui = createHudAndMenus({
    hudRoot,
    menuRoot,
    srStatus,
    cityWorld,
    vehicleMgr,
    actorSys,
    wantedSys,
    missionSys,
    cameraRig,
    effects,
    input,
    callbacks: {
      hasSavedGame: () => Boolean(readLocalStorageSave()),
      onStartNewGame: () => resetNewGame(),
      onSaveGame: () => saveGameProgress(),
      onLoadGame: () => loadGameProgress(),
      onResumeGame: () => {
        cameraRig.setOverride(null);
        cameraRig.snapToTarget(actorSys.player, cityWorld);
      },
      onReturnTitle: () => {
        wantedSys.clearWanted();
      },
      getTimeOfDay: () => timeOfDay,
      setTimeOfDay: (v) => applyTimeOfDay(v),
      getTrafficDensity: () => trafficDensity,
      setTrafficDensity: (v) => {
        trafficDensity = Math.max(0.25, Math.min(1.5, v));
      },
    },
  });

  // Hospitalized / Detained respawn handlers
  actorSys.onPlayerDown(() => {
    missionSys.showBanner('Hospitalized', 'Miramar Trauma Center patched you up', 'danger', 3.1);
    respawnSequence = { timer: 2.8, kind: 'hospital' };
  });

  wantedSys.onPlayerArrested(() => {
    missionSys.showBanner('Detained', 'Patrulla processed your bail release', 'arrest', 3.1);
    respawnSequence = { timer: 2.8, kind: 'arrest' };
  });

  seedLandmarkVehicles();
  applyTimeOfDay(timeOfDay);

  // Resize handler
  function handleResize() {
    const w = window.innerWidth;
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', handleResize);

  // Deterministic Screenshot Mode (?shot=...)
  if (shot) {
    stageDeterministicShot(shot, seed, {
      THREE,
      scene,
      camera,
      cityWorld,
      cameraRig,
      effects,
      vehicleMgr,
      actorSys,
      wantedSys,
      missionSys,
      ui,
      setTimeOfDay: applyTimeOfDay,
    });
    renderer.render(scene, camera);
    window.__SOL_SHOT_READY = true;
    return;
  }

  // Interactive Fixed-Timestep Simulation Loop (60 Hz)
  function stepSimulation(dt) {
    const inp = input.consumeStep();

    if (inp.mutePressed) {
      effects.toggleMute();
    }

    if (inp.pausePressed) {
      if (ui.getMenuMode() === 'none') {
        ui.openPauseMenu('missions');
        return;
      }
      if (ui.getMenuMode() === 'pause') {
        cameraRig.setOverride(null);
        ui.closeMenus();
        return;
      }
      if (ui.getMenuMode() === 'briefing') {
        missionSys.cancelBriefing();
        ui.closeMenus();
        return;
      }
    }

    // Slow scenic coastal flyover while on Title Screen
    if (ui.getMenuMode() === 'title') {
      titleBackdropOrbit += dt * 0.11;
      const cx = 258 + Math.cos(titleBackdropOrbit) * 52;
      const cz = -58 + Math.sin(titleBackdropOrbit) * 58;
      cameraRig.setOverride({
        position: [cx, 24, cz],
        target: [228, 9, -62],
        fov: 55,
      });
      cityWorld.update(dt, camera, simTime);
      simTime += dt;
      return;
    }

    if (ui.isMenuOpen()) return;

    simTime += dt;
    applyTimeOfDay(timeOfDay + dt / DAY_CYCLE_SECONDS);

    if (inp.cameraModePressed) {
      cameraRig.cycleMode();
    }

    // Contextual E interaction: prioritize mission trigger or safehouse board before vehicle entry
    let blockVehicleInteract = false;
    if (inp.interactPressed && !actorSys.player.inVehicle) {
      const mState = missionSys.getActiveState();
      if (mState.nearTriggerMission) {
        blockVehicleInteract = true;
        missionSys.startMission(mState.nearTriggerMission.id);
        ui.openBriefingModal();
      } else if (mState.nearSafehouse) {
        blockVehicleInteract = true;
        ui.openPauseMenu('missions');
      }
    }

    // Respawn fade & recovery
    if (respawnSequence) {
      respawnSequence.timer -= dt;
      if (respawnSequence.timer < 0.7) {
        ui.setFadeCurtain(true);
      }
      if (respawnSequence.timer <= 0) {
        const kind = respawnSequence.kind;
        respawnSequence = null;
        wantedSys.clearWanted();
        const spawnPt =
          kind === 'arrest'
            ? { x: 8, z: -48, yaw: Math.PI }
            : { x: 224, z: -48, yaw: -Math.PI * 0.5 };
        actorSys.respawnPlayer(spawnPt, kind);
        cameraRig.snapToTarget(actorSys.player, cityWorld);
        ui.setFadeCurtain(false);
      }
    }

    actorSys.update(dt, inp, cameraRig, {
      pedDensity: trafficDensity,
      blockVehicleInteract,
    });

    vehicleMgr.update(dt, {
      playerPos: actorSys.player,
      playerVehicle: actorSys.player.vehicle,
      playerInput: actorSys.player.inVehicle ? inp : null,
      simTime,
      isNight: cityWorld.isNight(),
      trafficDensity,
    });

    // Keep player position synced with driven vehicle after vehicle step
    if (actorSys.player.inVehicle && actorSys.player.vehicle) {
      actorSys.player.x = actorSys.player.vehicle.x;
      actorSys.player.y = actorSys.player.vehicle.y;
      actorSys.player.z = actorSys.player.vehicle.z;
      actorSys.player.vx = actorSys.player.vehicle.vx;
      actorSys.player.vz = actorSys.player.vehicle.vz;
      actorSys.player.yaw = actorSys.player.vehicle.yaw;
      actorSys.player.speed = actorSys.player.vehicle.speed;
    }

    wantedSys.update(dt);
    missionSys.update(dt);

    const p = actorSys.player;
    const nearWater = Math.max(0, Math.min(1, (p.x - 230) / 90));
    effects.setAmbientState(nearWater, trafficDensity * 0.6);
    effects.update(dt);

    cameraRig.update(
      dt,
      {
        x: p.x,
        y: p.y,
        z: p.z,
        vx: p.vx,
        vz: p.vz,
        yaw: p.yaw,
        inVehicle: p.inVehicle,
        vehicleSpeed: p.inVehicle && p.vehicle ? p.vehicle.speed : 0,
        forwardSpeed: p.inVehicle && p.vehicle ? p.vehicle.forwardSpeed : 0,
        aiming: p.aiming,
        sprinting: p.sprinting,
      },
      inp,
      cityWorld,
    );

    cityWorld.update(dt, camera, simTime);
    ui.update(dt, timeOfDay);
  }

  let accumulator = 0;
  let lastTimestamp = performance.now();

  function frameLoop(now) {
    const elapsed = Math.min(MAX_FRAME_DELTA, Math.max(0, (now - lastTimestamp) * 0.001));
    lastTimestamp = now;
    accumulator += elapsed;

    while (accumulator >= FIXED_DT) {
      stepSimulation(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frameLoop);
  }

  requestAnimationFrame(frameLoop);
}

bootstrapSolDelMar();
