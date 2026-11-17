// Procedural 3D particle effects and Web Audio synthesizer for Sol del Mar

export function createEffectsAndAudio(THREE, scene) {
  const effectsGroup = new THREE.Group();
  effectsGroup.name = 'sol-effects-group';
  scene.add(effectsGroup);

  // ---------------------------------------------------------------------------
  // 1. Pooled 3D Particle System (InstancedMesh, zero per-frame allocations)
  // ---------------------------------------------------------------------------
  const MAX_PARTICLES = 480;
  const particleGeo = new THREE.IcosahedronGeometry(0.5, 1);
  const particleMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
  });

  const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, MAX_PARTICLES);
  particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particleMesh.frustumCulled = false;

  const dummyColor = new THREE.Color(1, 1, 1);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particleMesh.setColorAt(i, dummyColor);
  }
  if (particleMesh.instanceColor) {
    particleMesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
  }
  effectsGroup.add(particleMesh);

  const particles = new Array(MAX_PARTICLES);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles[i] = {
      active: false,
      x: 0,
      y: -999,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      age: 0,
      life: 1,
      startScale: 0.2,
      endScale: 0.8,
      gravity: 0,
      drag: 0.98,
      r: 1,
      g: 1,
      b: 1,
      fadeR: 0.2,
      fadeG: 0.2,
      fadeB: 0.2,
    };
  }
  let particleCursor = 0;

  // ---------------------------------------------------------------------------
  // 2. Pooled Bullet Tracers & Expanding Shockwave Rings
  // ---------------------------------------------------------------------------
  const MAX_TRACERS = 36;
  const tracerGeo = new THREE.BoxGeometry(0.045, 0.045, 1);
  const tracers = [];
  for (let i = 0; i < MAX_TRACERS; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffe28a,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(tracerGeo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    effectsGroup.add(mesh);
    tracers.push({ mesh, mat, active: false, age: 0, life: 0.075 });
  }
  let tracerCursor = 0;

  const MAX_RINGS = 14;
  const ringGeo = new THREE.RingGeometry(0.55, 1.0, 24);
  ringGeo.rotateX(-Math.PI * 0.5);
  const rings = [];
  for (let i = 0; i < MAX_RINGS; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.visible = false;
    mesh.frustumCulled = false;
    effectsGroup.add(mesh);
    rings.push({
      mesh,
      mat,
      active: false,
      age: 0,
      life: 0.45,
      startScale: 0.5,
      endScale: 8,
    });
  }
  let ringCursor = 0;

  // Short-lived dynamic point lights for explosions and heavy muzzle flashes
  const MAX_FLASH_LIGHTS = 4;
  const flashLights = [];
  for (let i = 0; i < MAX_FLASH_LIGHTS; i++) {
    const light = new THREE.PointLight(0xffaa44, 0, 26, 1.6);
    light.visible = false;
    effectsGroup.add(light);
    flashLights.push({
      light,
      active: false,
      age: 0,
      life: 0.18,
      peakIntensity: 8,
    });
  }
  let flashCursor = 0;

  const tempMatrix = new THREE.Matrix4();
  const tempPos = new THREE.Vector3();
  const tempQuat = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();
  const tracerMid = new THREE.Vector3();
  const tracerTarget = new THREE.Vector3();
  const hiddenMatrix = new THREE.Matrix4().makeScale(0.0001, 0.0001, 0.0001);
  hiddenMatrix.setPosition(0, -999, 0);

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particleMesh.setMatrixAt(i, hiddenMatrix);
  }
  particleMesh.instanceMatrix.needsUpdate = true;

  function allocParticle() {
    for (let attempt = 0; attempt < 16; attempt++) {
      const idx = (particleCursor + attempt) % MAX_PARTICLES;
      if (!particles[idx].active) {
        particleCursor = (idx + 1) % MAX_PARTICLES;
        return particles[idx];
      }
    }
    const p = particles[particleCursor];
    particleCursor = (particleCursor + 1) % MAX_PARTICLES;
    return p;
  }

  function emitParticle(cfg) {
    const p = allocParticle();
    p.active = true;
    p.x = cfg.x;
    p.y = cfg.y;
    p.z = cfg.z;
    p.vx = cfg.vx || 0;
    p.vy = cfg.vy || 0;
    p.vz = cfg.vz || 0;
    p.age = 0;
    p.life = cfg.life || 0.6;
    p.startScale = cfg.startScale ?? 0.25;
    p.endScale = cfg.endScale ?? 0.85;
    p.gravity = cfg.gravity ?? 0;
    p.drag = cfg.drag ?? 0.96;
    p.r = cfg.r ?? 1;
    p.g = cfg.g ?? 1;
    p.b = cfg.b ?? 1;
    p.fadeR = cfg.fadeR ?? p.r * 0.35;
    p.fadeG = cfg.fadeG ?? p.g * 0.35;
    p.fadeB = cfg.fadeB ?? p.b * 0.35;
  }

  function emitFlashLight(x, y, z, colorHex, peakIntensity, radius, life) {
    const slot = flashLights[flashCursor];
    flashCursor = (flashCursor + 1) % MAX_FLASH_LIGHTS;
    slot.active = true;
    slot.age = 0;
    slot.life = life;
    slot.peakIntensity = peakIntensity;
    slot.light.color.setHex(colorHex);
    slot.light.distance = radius;
    slot.light.intensity = peakIntensity;
    slot.light.position.set(x, y, z);
    slot.light.visible = true;
  }

  function emitRing(x, y, z, colorHex, startScale, endScale, life) {
    const slot = rings[ringCursor];
    ringCursor = (ringCursor + 1) % MAX_RINGS;
    slot.active = true;
    slot.age = 0;
    slot.life = life;
    slot.startScale = startScale;
    slot.endScale = endScale;
    slot.mat.color.setHex(colorHex);
    slot.mat.opacity = 0.85;
    slot.mesh.position.set(x, y, z);
    slot.mesh.scale.setScalar(startScale);
    slot.mesh.visible = true;
  }

  // ---------------------------------------------------------------------------
  // 3. High-Level Visual FX Spawners
  // ---------------------------------------------------------------------------
  function spawnMuzzleFlash(pos, dir, scale = 1) {
    if (!pos) return;
    const dx = dir ? dir.x : 0;
    const dy = dir ? dir.y : 0;
    const dz = dir ? dir.z : 1;

    for (let i = 0; i < 4; i++) {
      const speed = (2.5 + Math.random() * 5.5) * scale;
      emitParticle({
        x: pos.x + dx * 0.18,
        y: pos.y + dy * 0.18,
        z: pos.z + dz * 0.18,
        vx: dx * speed + (Math.random() - 0.5) * 2.2,
        vy: dy * speed + (Math.random() - 0.5) * 2.2,
        vz: dz * speed + (Math.random() - 0.5) * 2.2,
        life: 0.06 + Math.random() * 0.05,
        startScale: 0.24 * scale,
        endScale: 0.05,
        drag: 0.82,
        r: 1.0,
        g: 0.86,
        b: 0.42,
        fadeR: 1.0,
        fadeG: 0.42,
        fadeB: 0.1,
      });
    }

    // Gunpowder puff
    emitParticle({
      x: pos.x + dx * 0.25,
      y: pos.y + dy * 0.25,
      z: pos.z + dz * 0.25,
      vx: dx * 1.4 + (Math.random() - 0.5) * 0.8,
      vy: 0.6 + Math.random() * 0.6,
      vz: dz * 1.4 + (Math.random() - 0.5) * 0.8,
      life: 0.28,
      startScale: 0.16 * scale,
      endScale: 0.52 * scale,
      drag: 0.9,
      r: 0.78,
      g: 0.78,
      b: 0.8,
      fadeR: 0.35,
      fadeG: 0.36,
      fadeB: 0.4,
    });

    emitFlashLight(pos.x, pos.y, pos.z, 0xffc455, 4.5 * scale, 11, 0.065);
  }

  function spawnBulletTracer(startPos, endPos, colorHex = 0xffe28a) {
    if (!startPos || !endPos) return;
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const dz = endPos.z - startPos.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist < 0.4) return;

    const slot = tracers[tracerCursor];
    tracerCursor = (tracerCursor + 1) % MAX_TRACERS;

    const tracerLen = Math.min(dist * 0.65, 16);
    const ratio = 0.5;
    tracerMid.set(
      startPos.x + dx * ratio,
      startPos.y + dy * ratio,
      startPos.z + dz * ratio,
    );
    tracerTarget.set(endPos.x, endPos.y, endPos.z);

    slot.active = true;
    slot.age = 0;
    slot.life = 0.065;
    slot.mat.color.setHex(colorHex);
    slot.mat.opacity = 0.92;
    slot.mesh.position.copy(tracerMid);
    slot.mesh.scale.set(1, 1, tracerLen);
    slot.mesh.lookAt(tracerTarget);
    slot.mesh.visible = true;
  }

  function spawnBulletImpact(pos, normal, surfaceType = 'concrete') {
    if (!pos) return;
    const nx = normal ? normal.x : 0;
    const ny = normal ? normal.y : 1;
    const nz = normal ? normal.z : 0;

    if (surfaceType === 'water') {
      emitRing(pos.x, pos.y + 0.05, pos.z, 0x9be7ff, 0.2, 2.2, 0.45);
      for (let i = 0; i < 7; i++) {
        emitParticle({
          x: pos.x,
          y: pos.y + 0.06,
          z: pos.z,
          vx: (Math.random() - 0.5) * 3.5,
          vy: 2.6 + Math.random() * 4.2,
          vz: (Math.random() - 0.5) * 3.5,
          gravity: -12,
          life: 0.38 + Math.random() * 0.2,
          startScale: 0.16,
          endScale: 0.34,
          r: 0.82,
          g: 0.95,
          b: 1.0,
          fadeR: 0.5,
          fadeG: 0.8,
          fadeB: 0.95,
        });
      }
      return;
    }

    const isMetal = surfaceType === 'metal' || surfaceType === 'vehicle';
    const isActor = surfaceType === 'flesh' || surfaceType === 'actor';
    const count = isMetal ? 8 : 6;

    for (let i = 0; i < count; i++) {
      const burst = isMetal ? 6.8 : 3.6;
      emitParticle({
        x: pos.x + nx * 0.06,
        y: pos.y + ny * 0.06,
        z: pos.z + nz * 0.06,
        vx: nx * 2.8 + (Math.random() - 0.5) * burst,
        vy: Math.abs(ny) * 2.4 + Math.random() * 3.2,
        vz: nz * 2.8 + (Math.random() - 0.5) * burst,
        gravity: isMetal ? -14 : -7,
        drag: 0.92,
        life: isMetal ? 0.22 + Math.random() * 0.16 : 0.34 + Math.random() * 0.2,
        startScale: isMetal ? 0.12 : 0.18,
        endScale: isMetal ? 0.03 : 0.48,
        r: isMetal ? 1.0 : isActor ? 0.88 : 0.76,
        g: isMetal ? 0.82 : isActor ? 0.18 : 0.72,
        b: isMetal ? 0.32 : isActor ? 0.2 : 0.64,
        fadeR: isMetal ? 0.95 : 0.4,
        fadeG: isMetal ? 0.35 : 0.36,
        fadeB: isMetal ? 0.08 : 0.34,
      });
    }
  }

  function spawnExplosion(pos, radius = 7.5) {
    if (!pos) return;
    const scaleRatio = Math.max(0.6, radius / 7.5);

    emitRing(pos.x, pos.y + 0.18, pos.z, 0xff9d2e, 0.6, radius * 1.45, 0.48);
    emitFlashLight(pos.x, pos.y + 1.6, pos.z, 0xff8c24, 18 * scaleRatio, radius * 4.2, 0.38);

    // Core fireball spheres
    for (let i = 0; i < 22; i++) {
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.15) * Math.PI * 0.5;
      const spd = (3.5 + Math.random() * 11.5) * scaleRatio;
      emitParticle({
        x: pos.x + (Math.random() - 0.5) * 0.9,
        y: pos.y + 0.5 + Math.random() * 0.9,
        z: pos.z + (Math.random() - 0.5) * 0.9,
        vx: Math.cos(angle) * Math.cos(elev) * spd,
        vy: Math.abs(Math.sin(elev)) * spd + 2.5,
        vz: Math.sin(angle) * Math.cos(elev) * spd,
        gravity: -2.2,
        drag: 0.91,
        life: 0.42 + Math.random() * 0.38,
        startScale: (0.7 + Math.random() * 0.6) * scaleRatio,
        endScale: (2.1 + Math.random() * 1.1) * scaleRatio,
        r: 1.0,
        g: 0.76,
        b: 0.22,
        fadeR: 0.78,
        fadeG: 0.18,
        fadeB: 0.05,
      });
    }

    // Rising dark smoke column
    for (let i = 0; i < 18; i++) {
      emitParticle({
        x: pos.x + (Math.random() - 0.5) * 2.2 * scaleRatio,
        y: pos.y + 0.9 + Math.random() * 1.6,
        z: pos.z + (Math.random() - 0.5) * 2.2 * scaleRatio,
        vx: (Math.random() - 0.5) * 3.8,
        vy: 3.2 + Math.random() * 5.2,
        vz: (Math.random() - 0.5) * 3.8,
        gravity: 0.9,
        drag: 0.95,
        life: 1.1 + Math.random() * 0.95,
        startScale: 0.85 * scaleRatio,
        endScale: 3.2 * scaleRatio,
        r: 0.26,
        g: 0.25,
        b: 0.27,
        fadeR: 0.1,
        fadeG: 0.1,
        fadeB: 0.12,
      });
    }

    // Hot flying embers
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 8 + Math.random() * 14;
      emitParticle({
        x: pos.x,
        y: pos.y + 0.8,
        z: pos.z,
        vx: Math.cos(a) * spd,
        vy: 5 + Math.random() * 11,
        vz: Math.sin(a) * spd,
        gravity: -16,
        drag: 0.97,
        life: 0.55 + Math.random() * 0.45,
        startScale: 0.16,
        endScale: 0.04,
        r: 1.0,
        g: 0.88,
        b: 0.38,
        fadeR: 0.95,
        fadeG: 0.28,
        fadeB: 0.06,
      });
    }
  }

  function spawnTireSmoke(pos, intensity = 1) {
    if (!pos) return;
    const clamped = Math.min(1.6, Math.max(0.2, intensity));
    emitParticle({
      x: pos.x + (Math.random() - 0.5) * 0.35,
      y: pos.y + 0.14,
      z: pos.z + (Math.random() - 0.5) * 0.35,
      vx: (Math.random() - 0.5) * 1.3,
      vy: 0.55 + Math.random() * 0.75,
      vz: (Math.random() - 0.5) * 1.3,
      gravity: 0.3,
      drag: 0.92,
      life: 0.38 + Math.random() * 0.28,
      startScale: 0.24 * clamped,
      endScale: 1.05 * clamped,
      r: 0.86,
      g: 0.87,
      b: 0.9,
      fadeR: 0.52,
      fadeG: 0.54,
      fadeB: 0.58,
    });
  }

  function spawnWaterWake(pos, yaw = 0, speed = 10) {
    if (!pos) return;
    const mag = Math.min(1.5, Math.max(0.3, speed / 22));
    const backX = -Math.sin(yaw);
    const backZ = -Math.cos(yaw);
    const sideX = Math.cos(yaw);
    const sideZ = -Math.sin(yaw);

    for (let side = -1; side <= 1; side += 2) {
      emitParticle({
        x: pos.x + backX * 1.8 + sideX * side * 0.85,
        y: pos.y + 0.08,
        z: pos.z + backZ * 1.8 + sideZ * side * 0.85,
        vx: (backX * 2.4 + sideX * side * 2.1) * mag,
        vy: 0.8 + Math.random() * 1.1,
        vz: (backZ * 2.4 + sideZ * side * 2.1) * mag,
        gravity: -5.5,
        drag: 0.92,
        life: 0.42,
        startScale: 0.28 * mag,
        endScale: 0.92 * mag,
        r: 0.86,
        g: 0.97,
        b: 1.0,
        fadeR: 0.35,
        fadeG: 0.76,
        fadeB: 0.92,
      });
    }
  }

  function spawnDamageSmoke(pos, onFire = false) {
    if (!pos) return;
    emitParticle({
      x: pos.x + (Math.random() - 0.5) * 0.45,
      y: pos.y + 0.25,
      z: pos.z + (Math.random() - 0.5) * 0.45,
      vx: (Math.random() - 0.5) * 0.9,
      vy: 1.6 + Math.random() * 1.4,
      vz: (Math.random() - 0.5) * 0.9,
      gravity: 0.45,
      drag: 0.95,
      life: onFire ? 0.45 : 0.72,
      startScale: onFire ? 0.34 : 0.28,
      endScale: onFire ? 1.15 : 1.25,
      r: onFire ? 1.0 : 0.24,
      g: onFire ? 0.52 : 0.24,
      b: onFire ? 0.14 : 0.26,
      fadeR: 0.12,
      fadeG: 0.12,
      fadeB: 0.14,
    });
  }

  function clearAll() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles[i].active = false;
      particleMesh.setMatrixAt(i, hiddenMatrix);
    }
    particleMesh.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < MAX_TRACERS; i++) {
      tracers[i].active = false;
      tracers[i].mesh.visible = false;
    }
    for (let i = 0; i < MAX_RINGS; i++) {
      rings[i].active = false;
      rings[i].mesh.visible = false;
    }
    for (let i = 0; i < MAX_FLASH_LIGHTS; i++) {
      flashLights[i].active = false;
      flashLights[i].light.visible = false;
    }
  }

  function updateVisuals(dt) {
    let anyParticleChanged = false;
    const dampPow = Math.min(2, dt * 60);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i];
      if (!p.active) continue;
      anyParticleChanged = true;

      p.age += dt;
      if (p.age >= p.life) {
        p.active = false;
        particleMesh.setMatrixAt(i, hiddenMatrix);
        continue;
      }

      const t = p.age / p.life;
      const dragFactor = Math.pow(p.drag, dampPow);
      p.vx *= dragFactor;
      p.vy = p.vy * dragFactor + p.gravity * dt;
      p.vz *= dragFactor;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      // Shrink to zero right at end of life so InstancedMesh needs no per-instance alpha
      const envelope = t < 0.8 ? 1 : Math.max(0.01, (1 - t) / 0.2);
      const scale = (p.startScale + (p.endScale - p.startScale) * t) * envelope;

      tempPos.set(p.x, p.y, p.z);
      tempScale.setScalar(Math.max(0.015, scale));
      tempMatrix.compose(tempPos, tempQuat, tempScale);
      particleMesh.setMatrixAt(i, tempMatrix);

      dummyColor.setRGB(
        p.r + (p.fadeR - p.r) * t,
        p.g + (p.fadeG - p.g) * t,
        p.b + (p.fadeB - p.b) * t,
      );
      particleMesh.setColorAt(i, dummyColor);
    }

    if (anyParticleChanged) {
      particleMesh.instanceMatrix.needsUpdate = true;
      if (particleMesh.instanceColor) {
        particleMesh.instanceColor.needsUpdate = true;
      }
    }

    for (let i = 0; i < MAX_TRACERS; i++) {
      const tr = tracers[i];
      if (!tr.active) continue;
      tr.age += dt;
      if (tr.age >= tr.life) {
        tr.active = false;
        tr.mesh.visible = false;
      } else {
        tr.mat.opacity = 0.92 * (1 - tr.age / tr.life);
      }
    }

    for (let i = 0; i < MAX_RINGS; i++) {
      const rg = rings[i];
      if (!rg.active) continue;
      rg.age += dt;
      if (rg.age >= rg.life) {
        rg.active = false;
        rg.mesh.visible = false;
      } else {
        const t = rg.age / rg.life;
        const ease = 1 - (1 - t) * (1 - t);
        rg.mesh.scale.setScalar(rg.startScale + (rg.endScale - rg.startScale) * ease);
        rg.mat.opacity = 0.85 * (1 - t);
      }
    }

    for (let i = 0; i < MAX_FLASH_LIGHTS; i++) {
      const fl = flashLights[i];
      if (!fl.active) continue;
      fl.age += dt;
      if (fl.age >= fl.life) {
        fl.active = false;
        fl.light.visible = false;
      } else {
        fl.light.intensity = fl.peakIntensity * (1 - fl.age / fl.life);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Procedural Web Audio API Engine (100% Synthesized, Zero External Files)
  // ---------------------------------------------------------------------------
  let audioCtx = null;
  let masterGain = null;
  let noiseBuffer = null;
  let engineNodes = null;
  let sirenNodes = null;
  let skidNodes = null;
  let ambientNodes = null;

  let masterVolume = 0.65;
  let muted = false;
  let sirenPhase = 0;
  let sirenTargetGain = 0;
  let sirenYelp = false;

  const ENGINE_BASE_HZ = {
    sedan: 56,
    sports: 78,
    suv: 50,
    truck: 38,
    motorcycle: 94,
    boat: 62,
    police: 68,
  };

  function createNoiseBuffer(ctx) {
    const length = Math.floor(ctx.sampleRate * 2.0);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let pinkB0 = 0;
    let pinkB1 = 0;
    let pinkB2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      pinkB0 = 0.99765 * pinkB0 + white * 0.099046;
      pinkB1 = 0.963 * pinkB1 + white * 0.2965164;
      pinkB2 = 0.57 * pinkB2 + white * 1.0526913;
      data[i] = Math.max(-1, Math.min(1, (pinkB0 + pinkB1 + pinkB2 + white * 0.45) * 0.28));
    }
    return buffer;
  }

  function unlockAudio() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return;
    }

    const AudioCtxCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxCtor) return;

    try {
      audioCtx = new AudioCtxCtor();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = muted ? 0 : masterVolume;
      masterGain.connect(audioCtx.destination);
      noiseBuffer = createNoiseBuffer(audioCtx);

      // Continuous engine dual-oscillator loop
      const oscMain = audioCtx.createOscillator();
      const oscSub = audioCtx.createOscillator();
      const engineFilter = audioCtx.createBiquadFilter();
      const engineGain = audioCtx.createGain();
      oscMain.type = 'sawtooth';
      oscSub.type = 'triangle';
      oscMain.frequency.value = 58;
      oscSub.frequency.value = 29;
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 240;
      engineFilter.Q.value = 2.8;
      engineGain.gain.value = 0;
      oscMain.connect(engineFilter);
      oscSub.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(masterGain);
      oscMain.start();
      oscSub.start();
      engineNodes = { oscMain, oscSub, engineFilter, engineGain };

      // Continuous tire skid loop
      const skidSrc = audioCtx.createBufferSource();
      skidSrc.buffer = noiseBuffer;
      skidSrc.loop = true;
      const skidFilter = audioCtx.createBiquadFilter();
      skidFilter.type = 'bandpass';
      skidFilter.frequency.value = 1480;
      skidFilter.Q.value = 5.5;
      const skidGain = audioCtx.createGain();
      skidGain.gain.value = 0;
      skidSrc.connect(skidFilter);
      skidFilter.connect(skidGain);
      skidGain.connect(masterGain);
      skidSrc.start();
      skidNodes = { skidGain, skidFilter };

      // Continuous police siren oscillator
      const sirenOsc = audioCtx.createOscillator();
      sirenOsc.type = 'triangle';
      sirenOsc.frequency.value = 720;
      const sirenGain = audioCtx.createGain();
      sirenGain.gain.value = 0;
      sirenOsc.connect(sirenGain);
      sirenGain.connect(masterGain);
      sirenOsc.start();
      sirenNodes = { sirenOsc, sirenGain };

      // Coastal surf & city wind ambient bed
      const surfSrc = audioCtx.createBufferSource();
      surfSrc.buffer = noiseBuffer;
      surfSrc.loop = true;
      const surfFilter = audioCtx.createBiquadFilter();
      surfFilter.type = 'lowpass';
      surfFilter.frequency.value = 340;
      const surfGain = audioCtx.createGain();
      surfGain.gain.value = 0.028;
      surfSrc.connect(surfFilter);
      surfFilter.connect(surfGain);
      surfGain.connect(masterGain);
      surfSrc.start();
      ambientNodes = { surfFilter, surfGain, phase: 0 };
    } catch (_err) {
      audioCtx = null;
    }
  }

  function distanceAttenuation(dist) {
    if (!Number.isFinite(dist) || dist <= 2) return 1;
    if (dist > 150) return 0;
    return Math.max(0, 1 / (1 + dist * 0.045));
  }

  function playGunshot(weaponId = 'pistol', distance = 0) {
    if (!audioCtx || muted) return;
    const att = distanceAttenuation(distance);
    if (att <= 0.02) return;

    const now = audioCtx.currentTime;

    if (weaponId === 'fist') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.09);
      gain.gain.setValueAtTime(0.28 * att, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.11);
      return;
    }

    const presets = {
      pistol: { dur: 0.15, freq: 1350, q: 1.3, punch: 185, vol: 0.34 },
      shotgun: { dur: 0.32, freq: 780, q: 0.85, punch: 95, vol: 0.52 },
      smg: { dur: 0.1, freq: 1750, q: 1.6, punch: 215, vol: 0.25 },
      rifle: { dur: 0.21, freq: 1550, q: 1.1, punch: 150, vol: 0.42 },
    };
    const cfg = presets[weaponId] || presets.pistol;

    // Noise crack
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(cfg.freq, now);
    filter.frequency.exponentialRampToValueAtTime(240, now + cfg.dur);
    filter.Q.value = cfg.q;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(cfg.vol * att, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + cfg.dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(now, Math.random() * 1.2, cfg.dur);

    // Low-end body thump
    const sub = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(cfg.punch, now);
    sub.frequency.exponentialRampToValueAtTime(36, now + 0.09);
    subGain.gain.setValueAtTime(cfg.vol * 0.85 * att, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    sub.connect(subGain);
    subGain.connect(masterGain);
    sub.start(now);
    sub.stop(now + 0.1);
  }

  function playExplosionSound(distance = 0) {
    if (!audioCtx || muted) return;
    const att = distanceAttenuation(distance * 0.55);
    if (att <= 0.02) return;

    const now = audioCtx.currentTime;

    // Rumble noise burst
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(920, now);
    filter.frequency.exponentialRampToValueAtTime(85, now + 1.15);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.75 * att, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(now, 0, 1.3);

    // Sub-bass shockwave drop
    const sub = audioCtx.createOscillator();
    const subGain = audioCtx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(115, now);
    sub.frequency.exponentialRampToValueAtTime(22, now + 0.65);
    subGain.gain.setValueAtTime(0.8 * att, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    sub.connect(subGain);
    subGain.connect(masterGain);
    sub.start(now);
    sub.stop(now + 0.72);
  }

  function playImpactSound(surfaceType = 'concrete', distance = 0) {
    if (!audioCtx || muted) return;
    const att = distanceAttenuation(distance);
    if (att <= 0.03) return;
    const now = audioCtx.currentTime;

    if (surfaceType === 'metal' || surfaceType === 'vehicle') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(980 + Math.random() * 680, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.08);
      gain.gain.setValueAtTime(0.14 * att, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
      return;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = surfaceType === 'water' ? 1100 : 560;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.12 * att, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(now, Math.random(), 0.095);
  }

  function playCollisionSound(severity01 = 0.5, distance = 0) {
    if (!audioCtx || muted) return;
    const att = distanceAttenuation(distance) * Math.min(1, Math.max(0.15, severity01));
    if (att <= 0.02) return;

    const now = audioCtx.currentTime;
    const src = audioCtx.createBufferSource();
    src.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 420;
    filter.Q.value = 1.4;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.38 * att, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    src.start(now, Math.random() * 0.5, 0.24);
  }

  function playUiSound(kind = 'click') {
    if (!audioCtx || muted) return;
    const now = audioCtx.currentTime;
    const notesByKind = {
      click: [520, 680],
      cash: [660, 880, 1175],
      pickup: [540, 760],
      wanted: [440, 415],
      mission_start: [392, 523.25, 659.25],
      mission_pass: [523.25, 659.25, 783.99, 1046.5],
      mission_fail: [349.23, 311.13, 261.63],
    };
    const seq = notesByKind[kind] || notesByKind.click;
    const step = kind === 'click' ? 0.045 : 0.095;

    for (let i = 0; i < seq.length; i++) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = kind === 'mission_fail' || kind === 'wanted' ? 'sawtooth' : 'triangle';
      const t0 = now + i * step;
      osc.frequency.setValueAtTime(seq[i], t0);
      gain.gain.setValueAtTime(0.14, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + step * 1.9);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t0);
      osc.stop(t0 + step * 2.0);
    }
  }

  function setEngineState(active, rpm01 = 0, vehicleType = 'sedan', throttle = 0) {
    if (!audioCtx || !engineNodes) return;
    const now = audioCtx.currentTime;
    if (!active || muted) {
      engineNodes.engineGain.gain.setTargetAtTime(0, now, 0.08);
      return;
    }

    const base = ENGINE_BASE_HZ[vehicleType] || 56;
    const clampedRpm = Math.max(0, Math.min(1.2, rpm01));
    const freq = base * (1 + clampedRpm * 2.15 + Math.abs(throttle) * 0.25);
    engineNodes.oscMain.frequency.setTargetAtTime(freq, now, 0.05);
    engineNodes.oscSub.frequency.setTargetAtTime(freq * 0.5, now, 0.05);
    engineNodes.engineFilter.frequency.setTargetAtTime(
      190 + clampedRpm * 780 + Math.abs(throttle) * 260,
      now,
      0.06,
    );
    engineNodes.engineGain.gain.setTargetAtTime(
      0.065 + Math.abs(throttle) * 0.055 + clampedRpm * 0.035,
      now,
      0.07,
    );
  }

  function setTireSkidState(intensity01 = 0) {
    if (!audioCtx || !skidNodes) return;
    const target = muted ? 0 : Math.min(0.16, Math.max(0, intensity01) * 0.14);
    skidNodes.skidGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.05);
  }

  function setSirenState(intensity01 = 0, yelpMode = false) {
    sirenTargetGain = Math.min(0.18, Math.max(0, intensity01) * 0.16);
    sirenYelp = Boolean(yelpMode);
  }

  function setAmbientState(nearWater01 = 0.2, cityActivity01 = 0.5) {
    if (!audioCtx || !ambientNodes) return;
    const now = audioCtx.currentTime;
    const targetGain = muted ? 0 : 0.018 + nearWater01 * 0.038 + cityActivity01 * 0.012;
    ambientNodes.surfGain.gain.setTargetAtTime(targetGain, now, 0.25);
    ambientNodes.surfFilter.frequency.setTargetAtTime(
      240 + nearWater01 * 420,
      now,
      0.25,
    );
  }

  function updateAudio(dt) {
    if (!audioCtx) return;

    if (sirenNodes) {
      const now = audioCtx.currentTime;
      const gainVal = muted ? 0 : sirenTargetGain;
      sirenNodes.sirenGain.gain.setTargetAtTime(gainVal, now, 0.08);
      if (gainVal > 0.002) {
        sirenPhase += dt * (sirenYelp ? 14.5 : 2.6);
        const sweep = (Math.sin(sirenPhase) + 1) * 0.5;
        sirenNodes.sirenOsc.frequency.setTargetAtTime(630 + sweep * 560, now, 0.025);
      }
    }

    if (ambientNodes && !muted) {
      ambientNodes.phase += dt * 0.55;
    }
  }

  function applyMasterGain() {
    if (audioCtx && masterGain) {
      masterGain.gain.setTargetAtTime(muted ? 0 : masterVolume, audioCtx.currentTime, 0.04);
    }
  }

  return {
    spawnMuzzleFlash,
    spawnBulletTracer,
    spawnBulletImpact,
    spawnExplosion,
    spawnTireSmoke,
    spawnWaterWake,
    spawnDamageSmoke,
    clearAll,
    unlockAudio,
    playGunshot,
    playExplosionSound,
    playImpactSound,
    playCollisionSound,
    playUiSound,
    setEngineState,
    setTireSkidState,
    setSirenState,
    setAmbientState,
    setMasterVolume(vol) {
      masterVolume = Math.max(0, Math.min(1, Number(vol) || 0));
      applyMasterGain();
    },
    getMasterVolume() {
      return masterVolume;
    },
    setMuted(flag) {
      muted = Boolean(flag);
      applyMasterGain();
    },
    toggleMute() {
      muted = !muted;
      applyMasterGain();
      return muted;
    },
    isMuted() {
      return muted;
    },
    update(dt) {
      updateVisuals(dt);
      updateAudio(dt);
    },
  };
}

