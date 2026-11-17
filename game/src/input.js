// Keyboard and mouse input controller for Sol del Mar

const PREVENT_DEFAULT_CODES = new Set([
  'Space',
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export function createGameInput(targetElement, options = {}) {
  const heldKeys = new Set();
  const gestureListeners = [];

  let gameplayActive = false;
  let pointerLocked = false;
  let mouseLeftDown = false;
  let mouseRightDown = false;
  let invertY = Boolean(options.invertY);
  let sensitivity = typeof options.sensitivity === 'number' ? options.sensitivity : 0.0022;

  // Latched edges and accumulated deltas consumed per simulation tick
  let accLookX = 0;
  let accLookY = 0;
  let wheelAccum = 0;
  let shootPressed = false;
  let jumpPressed = false;
  let interactPressed = false;
  let weaponCycleDelta = 0;
  let weaponSlotPressed = -1;
  let cameraModePressed = false;
  let pausePressed = false;
  let mutePressed = false;
  let gestureFired = false;

  function notifyFirstGesture() {
    if (gestureFired) return;
    gestureFired = true;
    for (let i = 0; i < gestureListeners.length; i++) {
      try {
        gestureListeners[i]();
      } catch (_err) {
        // Ignore audio unlock errors in headless browsers
      }
    }
  }

  function clearHeldInputs() {
    heldKeys.clear();
    mouseLeftDown = false;
    mouseRightDown = false;
    accLookX = 0;
    accLookY = 0;
  }

  function onKeyDown(event) {
    notifyFirstGesture();

    const code = event.code;
    if (gameplayActive && PREVENT_DEFAULT_CODES.has(code)) {
      event.preventDefault();
    }

    const isRepeat = event.repeat || heldKeys.has(code);
    heldKeys.add(code);

    if (isRepeat) return;

    if (code === 'Escape' || code === 'KeyP') {
      pausePressed = true;
      return;
    }
    if (code === 'KeyM') {
      mutePressed = true;
    }

    if (!gameplayActive) return;

    if (code === 'Space') {
      jumpPressed = true;
    } else if (code === 'KeyE') {
      interactPressed = true;
    } else if (code === 'Tab') {
      weaponCycleDelta += event.shiftKey ? -1 : 1;
    } else if (code === 'KeyV' || code === 'KeyC') {
      cameraModePressed = true;
    } else if (code === 'KeyJ') {
      shootPressed = true;
    } else if (code === 'Digit1') {
      weaponSlotPressed = 0;
    } else if (code === 'Digit2') {
      weaponSlotPressed = 1;
    } else if (code === 'Digit3') {
      weaponSlotPressed = 2;
    } else if (code === 'Digit4') {
      weaponSlotPressed = 3;
    } else if (code === 'Digit5') {
      weaponSlotPressed = 4;
    }
  }

  function onKeyUp(event) {
    heldKeys.delete(event.code);
  }

  function onMouseDown(event) {
    notifyFirstGesture();
    if (!gameplayActive) return;

    if (targetElement && event.target === targetElement && !pointerLocked) {
      requestPointerLock();
    }

    if (event.button === 0) {
      mouseLeftDown = true;
      shootPressed = true;
    } else if (event.button === 2) {
      mouseRightDown = true;
    }
  }

  function onMouseUp(event) {
    if (event.button === 0) {
      mouseLeftDown = false;
    } else if (event.button === 2) {
      mouseRightDown = false;
    }
  }

  function onMouseMove(event) {
    if (!gameplayActive) return;
    if (!pointerLocked && !mouseLeftDown && !mouseRightDown) return;

    const dx = Number.isFinite(event.movementX) ? event.movementX : 0;
    const dy = Number.isFinite(event.movementY) ? event.movementY : 0;
    const clampedDx = Math.max(-140, Math.min(140, dx));
    const clampedDy = Math.max(-140, Math.min(140, dy));

    accLookX += clampedDx * sensitivity;
    accLookY += clampedDy * sensitivity * (invertY ? -1 : 1);
  }

  function onWheel(event) {
    if (!gameplayActive) return;
    event.preventDefault();
    wheelAccum += event.deltaY;
    if (Math.abs(wheelAccum) >= 48) {
      weaponCycleDelta += wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
    }
  }

  function onContextMenu(event) {
    if (gameplayActive || event.target === targetElement) {
      event.preventDefault();
    }
  }

  function onPointerLockChange() {
    const lockedEl = document.pointerLockElement;
    const wasLocked = pointerLocked;
    pointerLocked = Boolean(targetElement && lockedEl === targetElement);
    if (wasLocked && !pointerLocked && gameplayActive) {
      // Browser exited pointer lock (usually Escape key); surface pause request
      pausePressed = true;
    }
  }

  function onWindowBlur() {
    clearHeldInputs();
  }

  function requestPointerLock() {
    if (!targetElement || typeof targetElement.requestPointerLock !== 'function') return;
    try {
      const maybePromise = targetElement.requestPointerLock();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    } catch (_err) {
      // Pointer lock may fail outside user gesture or in headless test harnesses
    }
  }

  function exitPointerLock() {
    if (document.pointerLockElement && typeof document.exitPointerLock === 'function') {
      try {
        document.exitPointerLock();
      } catch (_err) {
        // Ignore
      }
    }
    pointerLocked = false;
  }

  function computeAxes() {
    let moveX = 0;
    let moveZ = 0;

    if (heldKeys.has('KeyD') || heldKeys.has('ArrowRight')) moveX += 1;
    if (heldKeys.has('KeyA') || heldKeys.has('ArrowLeft')) moveX -= 1;
    if (heldKeys.has('KeyW') || heldKeys.has('ArrowUp')) moveZ += 1;
    if (heldKeys.has('KeyS') || heldKeys.has('ArrowDown')) moveZ -= 1;

    return { moveX, moveZ };
  }

  function consumeStep() {
    const axes = gameplayActive ? computeAxes() : { moveX: 0, moveZ: 0 };
    const sprint =
      gameplayActive &&
      (heldKeys.has('ShiftLeft') || heldKeys.has('ShiftRight') || heldKeys.has('KeyF'));
    const jump = gameplayActive && heldKeys.has('Space');
    const shoot = gameplayActive && (mouseLeftDown || heldKeys.has('KeyJ'));
    const aim = gameplayActive && (mouseRightDown || heldKeys.has('KeyQ'));

    const snapshot = {
      moveX: axes.moveX,
      moveZ: axes.moveZ,
      sprint,
      jump,
      handbrake: jump,
      shoot,
      aim,
      pointerLocked,
      lookDeltaX: gameplayActive ? accLookX : 0,
      lookDeltaY: gameplayActive ? accLookY : 0,
      shootPressed: gameplayActive ? shootPressed : false,
      jumpPressed: gameplayActive ? jumpPressed : false,
      interactPressed: gameplayActive ? interactPressed : false,
      weaponCycleDelta: gameplayActive ? weaponCycleDelta : 0,
      weaponSlotPressed: gameplayActive ? weaponSlotPressed : -1,
      cameraModePressed: gameplayActive ? cameraModePressed : false,
      pausePressed,
      mutePressed,
    };

    accLookX = 0;
    accLookY = 0;
    shootPressed = false;
    jumpPressed = false;
    interactPressed = false;
    weaponCycleDelta = 0;
    weaponSlotPressed = -1;
    cameraModePressed = false;
    pausePressed = false;
    mutePressed = false;

    return snapshot;
  }

  function resetEdges() {
    accLookX = 0;
    accLookY = 0;
    shootPressed = false;
    jumpPressed = false;
    interactPressed = false;
    weaponCycleDelta = 0;
    weaponSlotPressed = -1;
    cameraModePressed = false;
    pausePressed = false;
    mutePressed = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('contextmenu', onContextMenu);
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  return {
    consumeStep,
    resetEdges,
    requestPointerLock,
    exitPointerLock,
    setGameplayActive(active) {
      gameplayActive = Boolean(active);
      if (!gameplayActive) {
        clearHeldInputs();
      }
    },
    isGameplayActive() {
      return gameplayActive;
    },
    setInvertY(flag) {
      invertY = Boolean(flag);
    },
    getInvertY() {
      return invertY;
    },
    setSensitivity(val) {
      if (Number.isFinite(val) && val > 0.0003 && val < 0.012) {
        sensitivity = val;
      }
    },
    getSensitivity() {
      return sensitivity;
    },
    onFirstGesture(fn) {
      if (typeof fn === 'function') gestureListeners.push(fn);
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    },
  };
}
