// Third-person orbit, pursuit, and collision-aware camera rig

export const CAMERA_MODES = ['standard', 'close', 'cinematic'];

const MODE_PRESETS = {
  standard: {
    footDist: 5.8,
    footHeight: 2.05,
    shoulder: 0.55,
    carDist: 8.6,
    carHeight: 2.85,
    fov: 62,
  },
  close: {
    footDist: 3.7,
    footHeight: 1.78,
    shoulder: 0.72,
    carDist: 6.4,
    carHeight: 2.25,
    fov: 58,
  },
  cinematic: {
    footDist: 8.4,
    footHeight: 2.95,
    shoulder: -0.95,
    carDist: 11.8,
    carHeight: 3.6,
    fov: 52,
  },
};

function normalizeAngle(rad) {
  let a = rad;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function lerpAngle(a, b, t) {
  return a + normalizeAngle(b - a) * t;
}

export function createCameraRig(THREE, camera) {
  let modeIndex = 0;
  let yaw = 0.4;
  let pitch = 0.18;
  let idleOrbitTimer = 0;
  let shakeIntensity = 0;
  let shakePhase = 0;
  let currentDist = MODE_PRESETS.standard.footDist;
  let currentFov = MODE_PRESETS.standard.fov;
  let overrideConfig = null;

  const smoothPivot = new THREE.Vector3(0, 1.6, 0);
  const smoothPos = new THREE.Vector3(0, 4, 8);
  const desiredPos = new THREE.Vector3();
  const rayDir = new THREE.Vector3();
  const aimOrigin = new THREE.Vector3();
  const aimDirection = new THREE.Vector3();
  const forwardVec = new THREE.Vector3();
  const rightVec = new THREE.Vector3();
  let initialized = false;

  function getMode() {
    return CAMERA_MODES[modeIndex];
  }

  function setMode(modeName) {
    const idx = CAMERA_MODES.indexOf(modeName);
    if (idx >= 0) {
      modeIndex = idx;
    }
    return getMode();
  }

  function cycleMode() {
    modeIndex = (modeIndex + 1) % CAMERA_MODES.length;
    return getMode();
  }

  function addShake(amount) {
    shakeIntensity = Math.min(1.4, Math.max(shakeIntensity, amount));
  }

  function setAngles(nextYaw, nextPitch) {
    if (Number.isFinite(nextYaw)) yaw = normalizeAngle(nextYaw);
    if (Number.isFinite(nextPitch)) {
      pitch = Math.max(-0.55, Math.min(1.05, nextPitch));
    }
  }

  function setOverride(config) {
    overrideConfig = config || null;
    if (overrideConfig) {
      camera.position.set(
        overrideConfig.position[0],
        overrideConfig.position[1],
        overrideConfig.position[2],
      );
      camera.lookAt(
        overrideConfig.target[0],
        overrideConfig.target[1],
        overrideConfig.target[2],
      );
      if (overrideConfig.fov && Math.abs(camera.fov - overrideConfig.fov) > 0.05) {
        camera.fov = overrideConfig.fov;
        camera.updateProjectionMatrix();
      }
    }
  }

  function snapToTarget(targetState, cityWorld) {
    if (!targetState) return;
    if (Number.isFinite(targetState.yaw)) {
      yaw = normalizeAngle(targetState.yaw + Math.PI);
    }
    const preset = MODE_PRESETS[getMode()];
    const pivotY = targetState.y + (targetState.inVehicle ? preset.carHeight * 0.55 : 1.55);
    smoothPivot.set(targetState.x, pivotY, targetState.z);

    const dist = targetState.inVehicle ? preset.carDist : preset.footDist;
    currentDist = dist;
    const horiz = Math.cos(pitch) * dist;
    const cx = smoothPivot.x + Math.sin(yaw) * horiz;
    const cz = smoothPivot.z + Math.cos(yaw) * horiz;
    let cy = smoothPivot.y + Math.sin(pitch) * dist + 0.35;
    if (cityWorld) {
      cy = Math.max(cy, cityWorld.getGroundHeight(cx, cz) + 0.75);
    }
    smoothPos.set(cx, cy, cz);
    camera.position.copy(smoothPos);
    camera.lookAt(smoothPivot);
    initialized = true;
  }

  function update(dt, targetState, lookInput, cityWorld) {
    if (overrideConfig) {
      setOverride(overrideConfig);
      return;
    }
    if (!targetState) return;

    if (!initialized) {
      snapToTarget(targetState, cityWorld);
    }

    const dx = lookInput ? lookInput.lookDeltaX || 0 : 0;
    const dy = lookInput ? lookInput.lookDeltaY || 0 : 0;

    if (Math.abs(dx) > 0.00001 || Math.abs(dy) > 0.00001) {
      yaw = normalizeAngle(yaw - dx);
      pitch = Math.max(-0.48, Math.min(1.02, pitch + dy));
      idleOrbitTimer = 0;
    } else {
      idleOrbitTimer += dt;
    }

    const preset = MODE_PRESETS[getMode()];
    const inVehicle = Boolean(targetState.inVehicle);
    const aiming = Boolean(targetState.aiming) && !inVehicle;
    const speed = Math.abs(targetState.vehicleSpeed || 0);

    // Gentle auto-follow behind moving vehicle when mouse is idle
    if (inVehicle && idleOrbitTimer > 1.05 && speed > 2.2) {
      const travelDirOffset = (targetState.forwardSpeed || 0) < -1.5 ? 0 : Math.PI;
      const desiredYaw = normalizeAngle((targetState.yaw || 0) + travelDirOffset);
      const followRate = Math.min(1, dt * (1.8 + Math.min(3.0, speed * 0.08)));
      yaw = lerpAngle(yaw, desiredYaw, followRate);
      pitch += (0.2 - pitch) * Math.min(1, dt * 1.8);
    }

    // Pivot tracking
    const pivotHeight = inVehicle ? 1.48 : aiming ? 1.62 : 1.52;
    const pivotBlend = 1 - Math.exp(-dt * (inVehicle ? 13 : 16));
    smoothPivot.x += (targetState.x - smoothPivot.x) * pivotBlend;
    smoothPivot.y += (targetState.y + pivotHeight - smoothPivot.y) * pivotBlend;
    smoothPivot.z += (targetState.z - smoothPivot.z) * pivotBlend;

    // Camera distance, shoulder offset & dynamic FOV
    let targetDist = inVehicle
      ? preset.carDist + Math.min(2.4, speed * 0.05)
      : aiming
        ? 2.65
        : preset.footDist;
    const shoulderOffset = inVehicle ? 0 : aiming ? 0.78 : preset.shoulder;

    let targetFov = preset.fov;
    if (aiming) {
      targetFov = 48;
    } else if (inVehicle) {
      targetFov = preset.fov + Math.min(12, speed * 0.26);
    } else if (targetState.sprinting) {
      targetFov = preset.fov + 4;
    }

    // Camera forward points from camera toward pivot: (-sin(yaw), ..., -cos(yaw))
    const cosPitch = Math.cos(pitch);
    const backX = Math.sin(yaw) * cosPitch;
    const backZ = Math.cos(yaw) * cosPitch;
    const backY = Math.sin(pitch);

    // Right vector relative to camera look direction
    rightVec.set(Math.cos(yaw), 0, -Math.sin(yaw));

    desiredPos.set(
      smoothPivot.x + backX * targetDist + rightVec.x * shoulderOffset,
      smoothPivot.y + backY * targetDist + (inVehicle ? preset.carHeight * 0.34 : 0.28),
      smoothPivot.z + backZ * targetDist + rightVec.z * shoulderOffset,
    );

    // Analytical collision check against buildings so camera never clips inside walls
    if (cityWorld && typeof cityWorld.raycastWorld === 'function') {
      rayDir.subVectors(desiredPos, smoothPivot);
      const fullLen = rayDir.length();
      if (fullLen > 0.2) {
        rayDir.divideScalar(fullLen);
        const hit = cityWorld.raycastWorld(smoothPivot, rayDir, fullLen + 0.35);
        if (hit && hit.hit && hit.distance < fullLen) {
          targetDist = Math.max(1.25, hit.distance - 0.42);
          desiredPos.copy(smoothPivot).addScaledVector(rayDir, targetDist);
        }
      }
      const floorY = cityWorld.getGroundHeight(desiredPos.x, desiredPos.z) + 0.65;
      if (desiredPos.y < floorY) {
        desiredPos.y = floorY;
      }
    }

    currentDist += (targetDist - currentDist) * (1 - Math.exp(-dt * 14));
    const posBlend = 1 - Math.exp(-dt * (aiming ? 22 : 14));
    smoothPos.lerp(desiredPos, posBlend);

    camera.position.copy(smoothPos);

    // Camera shake on explosions, collisions, or heavy gunfire
    if (shakeIntensity > 0.002) {
      shakePhase += dt * 43;
      const sx = Math.sin(shakePhase * 1.7) * shakeIntensity * 0.26;
      const sy = Math.cos(shakePhase * 2.3) * shakeIntensity * 0.22;
      camera.position.x += sx;
      camera.position.y += sy;
      shakeIntensity = Math.max(0, shakeIntensity - dt * 2.6);
    }

    // Look slightly ahead/right of pivot so character sits comfortably off-center
    const lookTargetX = smoothPivot.x + rightVec.x * (shoulderOffset * 0.65);
    const lookTargetY = smoothPivot.y + (aiming ? 0.08 : 0.14) - Math.sin(pitch) * 0.9;
    const lookTargetZ = smoothPivot.z + rightVec.z * (shoulderOffset * 0.65);
    camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);

    currentFov += (targetFov - currentFov) * (1 - Math.exp(-dt * 8));
    if (Math.abs(camera.fov - currentFov) > 0.04) {
      camera.fov = currentFov;
      camera.updateProjectionMatrix();
    }
  }

  function getAimRay(spread = 0) {
    camera.getWorldPosition(aimOrigin);
    camera.getWorldDirection(forwardVec);
    aimDirection.copy(forwardVec);
    if (spread > 0) {
      aimDirection.x += (Math.random() - 0.5) * spread;
      aimDirection.y += (Math.random() - 0.5) * spread;
      aimDirection.z += (Math.random() - 0.5) * spread;
      aimDirection.normalize();
    }
    return {
      origin: aimOrigin.clone(),
      direction: aimDirection.clone(),
      yaw: Math.atan2(-forwardVec.x, -forwardVec.z),
      pitch: Math.asin(Math.max(-1, Math.min(1, forwardVec.y))),
    };
  }

  return {
    getMode,
    setMode,
    cycleMode,
    addShake,
    setAngles,
    setOverride,
    snapToTarget,
    update,
    getAimRay,
    getYaw() {
      // Forward look yaw in world space
      return normalizeAngle(yaw + Math.PI);
    },
    getOrbitYaw() {
      return yaw;
    },
    getPitch() {
      return pitch;
    },
  };
}
