// HUD overlay, rotating 2D coastal radar minimap, and title/pause/safehouse menus

function formatClock(time01) {
  const totalMinutes = Math.floor((((time01 % 1) + 1) % 1) * 24 * 60);
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const hh = String(hours24).padStart(2, '0');
  const mm = String(mins).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatTimer(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${mins}:${String(rem).padStart(2, '0')}`;
}

export function createHudAndMenus(ctx) {
  const {
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
    callbacks = {},
  } = ctx;

  // ---------------------------------------------------------------------------
  // 1. Construct HUD DOM Tree inside #hud-root
  // ---------------------------------------------------------------------------
  hudRoot.innerHTML = `
    <div class="hud-damage-flash" data-el="damageFlash"></div>
    <div class="hud-arrest-flash" data-el="arrestFlash"></div>
    <div class="hud-fade-curtain" data-el="fadeCurtain"></div>

    <div class="hud-layer" data-el="hudLayer">
      <div class="hud-top-left">
        <div class="hud-location-bar">
          <span class="hud-district-dot" data-el="districtDot"></span>
          <span class="hud-district-name" data-el="districtName">Miramar Beach</span>
          <span class="hud-clock" data-el="clockText">09:30</span>
        </div>

        <div class="hud-objective-card" data-el="objectiveCard">
          <div class="hud-objective-header">
            <span class="hud-objective-label" data-el="objectiveLabel">ACTIVE CONTRACT</span>
            <span class="hud-objective-timer" data-el="objectiveTimer">01:30</span>
          </div>
          <div class="hud-objective-text" data-el="objectiveText"></div>
          <div class="hud-objective-hint" data-el="objectiveHint"></div>
        </div>
      </div>

      <div class="hud-top-right">
        <div class="hud-wanted-row" data-el="wantedRow" aria-label="Wanted Level">
          <span class="hud-star" data-star="1">&#9733;</span>
          <span class="hud-star" data-star="2">&#9733;</span>
          <span class="hud-star" data-star="3">&#9733;</span>
          <span class="hud-star" data-star="4">&#9733;</span>
          <span class="hud-star" data-star="5">&#9733;</span>
        </div>

        <div class="hud-cash-row">
          <span class="hud-cash-prefix">$</span>
          <span class="hud-cash-value" data-el="cashValue">650</span>
          <span class="hud-cash-delta" data-el="cashDelta"></span>
        </div>

        <div class="hud-weapon-card">
          <div class="hud-weapon-slot-strip" data-el="weaponStrip"></div>
          <div class="hud-weapon-main">
            <span class="hud-weapon-name" data-el="weaponName">Solis 9mm</span>
            <span class="hud-weapon-ammo" data-el="weaponAmmo">72</span>
          </div>
        </div>
      </div>

      <div class="hud-bottom-left">
        <div class="hud-minimap-frame" data-el="minimapFrame">
          <canvas class="hud-minimap-canvas" width="204" height="152" data-el="minimapCanvas"></canvas>
          <div class="hud-compass-badge" data-el="compassBadge">N</div>
        </div>

        <div class="hud-vitals-stack">
          <div class="hud-bar-group">
            <div class="hud-bar-meta"><span>Health</span><span data-el="hpNum">100</span></div>
            <div class="hud-bar-track"><div class="hud-bar-fill is-health" data-el="hpFill"></div></div>
          </div>
          <div class="hud-bar-group">
            <div class="hud-bar-meta"><span>Armor</span><span data-el="armorNum">50</span></div>
            <div class="hud-bar-track"><div class="hud-bar-fill is-armor" data-el="armorFill"></div></div>
          </div>
          <div class="hud-bar-group is-wide">
            <div class="hud-bar-meta">
              <span data-el="auxLabel">Stamina</span>
              <span data-el="auxNum">100%</span>
            </div>
            <div class="hud-bar-track"><div class="hud-bar-fill is-stamina" data-el="auxFill"></div></div>
          </div>
        </div>
      </div>

      <div class="hud-bottom-right">
        <div class="hud-speedo-card" data-el="speedoCard">
          <div class="hud-speedo-top">
            <span class="hud-speedo-value" data-el="speedoValue">0</span>
            <span class="hud-speedo-unit">MPH</span>
          </div>
          <div class="hud-speedo-meta">
            <span class="hud-speedo-vehicle" data-el="speedoVehicle">Solara Sedan</span>
            <span class="hud-speedo-gear" data-el="speedoGear">D1</span>
          </div>
        </div>
        <div class="hud-camera-badge" data-el="cameraBadge">CAM: STANDARD</div>
      </div>

      <div class="hud-reticle" data-el="reticle">
        <span class="hud-reticle-dot"></span>
        <span class="hud-reticle-arm arm-top"></span>
        <span class="hud-reticle-arm arm-right"></span>
        <span class="hud-reticle-arm arm-bottom"></span>
        <span class="hud-reticle-arm arm-left"></span>
      </div>

      <div class="hud-interact-prompt" data-el="interactPrompt">
        <span class="hud-key-cap">E</span>
        <span class="hud-prompt-label" data-el="promptLabel">Enter Vehicle</span>
      </div>

      <div class="hud-dialogue-box" data-el="dialogueBox">
        <div class="hud-dialogue-speaker" data-el="dialogueSpeaker"></div>
        <div class="hud-dialogue-line" data-el="dialogueLine"></div>
      </div>

      <div class="hud-banner" data-el="banner">
        <div class="hud-banner-title" data-el="bannerTitle"></div>
        <div class="hud-banner-sub" data-el="bannerSub"></div>
      </div>
    </div>
  `;

  const els = {};
  hudRoot.querySelectorAll('[data-el]').forEach((node) => {
    els[node.getAttribute('data-el')] = node;
  });
  const starNodes = Array.from(hudRoot.querySelectorAll('[data-star]'));

  // Populate weapon slot chips
  const weaponChips = [];
  for (let i = 0; i < actorSys.weapons.length; i++) {
    const w = actorSys.weapons[i];
    const chip = document.createElement('span');
    chip.className = 'hud-weapon-chip';
    chip.textContent = `${i + 1}:${w.shortName}`;
    els.weaponStrip.appendChild(chip);
    weaponChips.push(chip);
  }

  const mapCtx = els.minimapCanvas.getContext('2d');
  let lastCash = actorSys.player.cash;
  let cashDeltaTimer = 0;
  let lastAnnouncedBanner = '';
  let lastStars = 0;
  let radarFlashPhase = 0;

  function announce(text) {
    if (!srStatus || !text) return;
    srStatus.textContent = text;
  }

  // ---------------------------------------------------------------------------
  // 2. Rotating 2D Coastal Radar Minimap
  // ---------------------------------------------------------------------------
  function renderMinimap(dt, mState) {
    if (!mapCtx) return;
    const cw = els.minimapCanvas.width;
    const ch = els.minimapCanvas.height;
    const cx = cw * 0.5;
    const cy = ch * 0.56;
    const scale = 0.52; // pixels per world meter

    const p = actorSys.player;
    const heading = cameraRig ? cameraRig.getYaw() : p.yaw;

    radarFlashPhase += dt * 9;

    // Ocean base fill
    mapCtx.save();
    mapCtx.fillStyle = '#0c2e45';
    mapCtx.fillRect(0, 0, cw, ch);

    // Rotate world so camera forward (+sin(heading), +cos(heading)) points UP (-Y on canvas)
    mapCtx.translate(cx, cy);
    mapCtx.rotate(heading - Math.PI);
    mapCtx.scale(scale, scale);
    mapCtx.translate(-p.x, -p.z);

    // Mainland ground
    mapCtx.fillStyle = '#252c37';
    mapCtx.fillRect(-560, -560, 852, 946);
    mapCtx.fillRect(-560, 386, 652, 174);

    // Golden Miramar sandy shoreline strip
    mapCtx.fillStyle = '#c8ae78';
    mapCtx.fillRect(292, -560, 56, 946);

    // Roads
    mapCtx.fillStyle = '#4f5969';
    const rw = cityWorld.bounds.roadWidth;
    for (let i = 0; i < cityWorld.roadX.length; i++) {
      const rx = cityWorld.roadX[i];
      mapCtx.fillRect(rx - rw * 0.5, -500, rw, rx > 95 ? 886 : 1000);
    }
    for (let j = 0; j < cityWorld.roadZ.length; j++) {
      const rz = cityWorld.roadZ[j];
      mapCtx.fillRect(-500, rz - rw * 0.5, rz > 386 ? 592 : 786, rw);
    }

    // Nearby buildings (culled to radar radius)
    mapCtx.fillStyle = 'rgba(155, 170, 192, 0.34)';
    const bList = cityWorld.buildings;
    for (let i = 0; i < bList.length; i++) {
      const b = bList[i];
      if (Math.abs(b.x - p.x) > 220 || Math.abs(b.z - p.z) > 220) continue;
      mapCtx.fillRect(b.x - b.w * 0.5, b.z - b.d * 0.5, b.w, b.d);
    }

    // Active mission route line
    if (mState.waypoint) {
      mapCtx.strokeStyle = '#ffc947';
      mapCtx.lineWidth = 3.6;
      mapCtx.beginPath();
      mapCtx.moveTo(p.x, p.z);
      mapCtx.lineTo(mState.waypoint.x, mState.waypoint.z);
      mapCtx.stroke();
    }

    // Safehouse marker
    const sh = cityWorld.landmarks.safehouse;
    mapCtx.fillStyle = '#24d6c4';
    mapCtx.beginPath();
    mapCtx.arc(sh.x + 8, sh.z, 6.5, 0, Math.PI * 2);
    mapCtx.fill();

    // Next mission trigger marker when roaming
    if (!mState.activeMission && mState.nextTriggerPos) {
      mapCtx.fillStyle = '#f4a700';
      mapCtx.beginPath();
      mapCtx.arc(mState.nextTriggerPos.x, mState.nextTriggerPos.z, 7.5, 0, Math.PI * 2);
      mapCtx.fill();
    }

    // Police units (wanted pursuit + staged/roadblock cruisers)
    const cops = wantedSys.getMinimapUnits();
    const copRed = Math.sin(radarFlashPhase) > 0;
    for (let i = 0; i < cops.length; i++) {
      const u = cops[i];
      if (Math.abs(u.x - p.x) > 210 || Math.abs(u.z - p.z) > 210) continue;
      mapCtx.fillStyle = copRed ? '#ff4458' : '#3d9bff';
      mapCtx.beginPath();
      mapCtx.arc(u.x, u.z, u.kind === 'cruiser' ? 5.5 : 4.0, 0, Math.PI * 2);
      mapCtx.fill();
    }
    const activeVehicles = vehicleMgr.vehicles || [];
    for (let i = 0; i < activeVehicles.length; i++) {
      const v = activeVehicles[i];
      if (!v.isPolice || v.destroyed) continue;
      if (Math.abs(v.x - p.x) > 210 || Math.abs(v.z - p.z) > 210) continue;
      let alreadyDrawn = false;
      for (let j = 0; j < cops.length; j++) {
        if (cops[j].kind === 'cruiser' && Math.hypot(cops[j].x - v.x, cops[j].z - v.z) < 1.5) {
          alreadyDrawn = true;
          break;
        }
      }
      if (alreadyDrawn) continue;
      mapCtx.fillStyle = i % 2 === 0 ? (copRed ? '#ff4458' : '#3d9bff') : copRed ? '#3d9bff' : '#ff4458';
      mapCtx.beginPath();
      mapCtx.arc(v.x, v.z, 5.5, 0, Math.PI * 2);
      mapCtx.fill();
    }

    mapCtx.restore();

    // Clamped waypoint blip on radar rim if destination is far
    if (mState.waypoint) {
      const dx = mState.waypoint.x - p.x;
      const dz = mState.waypoint.z - p.z;
      const rotAngle = heading - Math.PI;
      const cosA = Math.cos(rotAngle);
      const sinA = Math.sin(rotAngle);
      let sx = (dx * cosA - dz * sinA) * scale;
      let sy = (dx * sinA + dz * cosA) * scale;
      const maxR = 64;
      const len = Math.hypot(sx, sy);
      if (len > maxR) {
        sx = (sx / len) * maxR;
        sy = (sy / len) * maxR;
      }
      mapCtx.fillStyle = '#ffd54f';
      mapCtx.strokeStyle = '#090d14';
      mapCtx.lineWidth = 2;
      mapCtx.beginPath();
      mapCtx.arc(cx + sx, cy + sy, 5.5, 0, Math.PI * 2);
      mapCtx.fill();
      mapCtx.stroke();
    }

    // Center player directional chevron
    mapCtx.save();
    mapCtx.translate(cx, cy);
    mapCtx.fillStyle = '#ffffff';
    mapCtx.strokeStyle = '#090d14';
    mapCtx.lineWidth = 2;
    mapCtx.beginPath();
    mapCtx.moveTo(0, -8);
    mapCtx.lineTo(6, 7);
    mapCtx.lineTo(0, 4);
    mapCtx.lineTo(-6, 7);
    mapCtx.closePath();
    mapCtx.fill();
    mapCtx.stroke();
    mapCtx.restore();

    // Update North compass badge label
    const deg = (((heading * 180) / Math.PI) % 360 + 360) % 360;
    const dirs = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
    els.compassBadge.textContent = dirs[Math.round(deg / 45) % 8];
  }

  // ---------------------------------------------------------------------------
  // 3. Title, Safehouse Mission Board, Briefing, Save/Load & Settings Menus
  // ---------------------------------------------------------------------------
  let menuMode = 'title'; // 'none' | 'title' | 'pause' | 'briefing'
  let activeTab = 'missions';

  function renderPanelHtml(tab) {
    if (tab === 'missions') {
      const list = missionSys.getMissionsList();
      const activeState = missionSys.getActiveState();
      const cards = list
        .map((m) => {
          const isCurrent = activeState.activeMission && activeState.activeMission.id === m.id;
          const statusCls = [
            'mission-card',
            m.completed ? 'is-completed' : '',
            !m.unlocked ? 'is-locked' : '',
            isCurrent ? 'is-current' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const badge = isCurrent
            ? 'IN PROGRESS'
            : m.completed
              ? 'COMPLETED'
              : m.unlocked
                ? 'AVAILABLE'
                : 'LOCKED';
          return `
            <div class="${statusCls}">
              <div class="mission-card-head">
                <span class="mission-card-title">${m.index}. ${m.title}</span>
                <span class="mission-card-reward">$${m.reward.toLocaleString()}</span>
              </div>
              <div class="mission-card-meta">${m.giver} • ${m.district} • ${badge}</div>
              <div class="mission-card-desc">${m.summary}</div>
              <div class="mission-card-actions">
                <button
                  type="button"
                  class="mission-launch-btn"
                  data-action="launch-mission"
                  data-mission-id="${m.id}"
                  ${!m.unlocked ? 'disabled' : ''}
                >${m.completed ? 'Replay Contract' : 'Start Contract'}</button>
              </div>
            </div>
          `;
        })
        .join('');

      const abortBtn = activeState.activeMission
        ? `<button type="button" class="menu-btn is-danger" data-action="abort-mission">Abort Current Contract<span>${activeState.activeMission.title}</span></button>`
        : '';

      return `
        <div class="menu-panel-header">
          <span class="menu-panel-title">Casa del Sol — Contract Board</span>
          <span class="menu-footer-note">8 Coastal Operations</span>
        </div>
        ${abortBtn}
        <div class="mission-list">${cards}</div>
      `;
    }

    if (tab === 'save') {
      const hasSave = callbacks.hasSavedGame ? callbacks.hasSavedGame() : false;
      return `
        <div class="menu-panel-header">
          <span class="menu-panel-title">Safehouse Ledger — Save &amp; Load</span>
        </div>
        <div class="settings-group">
          <button type="button" class="menu-btn is-primary" data-action="save-game">
            <span>Save Progress to Local Safehouse</span>
            <span class="menu-btn-sub">$${actorSys.player.cash.toLocaleString()}</span>
          </button>
          <button type="button" class="menu-btn" data-action="load-game" ${!hasSave ? 'disabled' : ''}>
            <span>Load Saved Safehouse Slot</span>
            <span class="menu-btn-sub">${hasSave ? 'Ready' : 'No Save Found'}</span>
          </button>
        </div>
        <p class="menu-footer-note">Saves your cash, unlocked weapons, ammo reserves, position, and completed campaign contracts offline in browser storage.</p>
      `;
    }

    if (tab === 'settings') {
      const volPct = Math.round((effects.getMasterVolume() || 0) * 100);
      const muted = effects.isMuted();
      const invY = input.getInvertY();
      const trafficPct = Math.round(
        ((callbacks.getTrafficDensity ? callbacks.getTrafficDensity() : 1) || 1) * 100,
      );

      return `
        <div class="menu-panel-header">
          <span class="menu-panel-title">Audio, Camera &amp; World Settings</span>
        </div>
        <div class="settings-group">
          <div class="settings-row">
            <span class="settings-label">Master Synth Volume (${volPct}%)</span>
            <input type="range" min="0" max="100" value="${volPct}" class="settings-slider" data-setting="volume">
          </div>
          <div class="settings-row">
            <span class="settings-label">Mute Audio (Key M)</span>
            <button type="button" class="mission-launch-btn" data-action="toggle-mute">${muted ? 'Muted' : 'Active'}</button>
          </div>
          <div class="settings-row">
            <span class="settings-label">Invert Mouse Look Y</span>
            <button type="button" class="mission-launch-btn" data-action="toggle-invert-y">${invY ? 'Inverted' : 'Normal'}</button>
          </div>
          <div class="settings-row">
            <span class="settings-label">Traffic &amp; Pedestrian Density (${trafficPct}%)</span>
            <input type="range" min="25" max="150" value="${trafficPct}" class="settings-slider" data-setting="traffic">
          </div>
          <div class="settings-row">
            <span class="settings-label">Camera Preset (Key V)</span>
            <button type="button" class="mission-launch-btn" data-action="cycle-cam">${cameraRig.getMode().toUpperCase()}</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="menu-panel-header">
        <span class="menu-panel-title">Controls Reference</span>
      </div>
      <div class="controls-grid">
        <div class="control-item"><span class="control-keys">W A S D</span><span class="control-desc">Move / Drive / Steer</span></div>
        <div class="control-item"><span class="control-keys">MOUSE</span><span class="control-desc">360° Orbit &amp; Aim</span></div>
        <div class="control-item"><span class="control-keys">L-CLICK</span><span class="control-desc">Fire / Melee / Drive-By</span></div>
        <div class="control-item"><span class="control-keys">R-CLICK</span><span class="control-desc">Precision Aim</span></div>
        <div class="control-item"><span class="control-keys">E</span><span class="control-desc">Enter / Exit Car or Boat</span></div>
        <div class="control-item"><span class="control-keys">SPACE</span><span class="control-desc">Jump / Drift Handbrake</span></div>
        <div class="control-item"><span class="control-keys">SHIFT / F</span><span class="control-desc">Sprint</span></div>
        <div class="control-item"><span class="control-keys">1-5 / TAB</span><span class="control-desc">Select Weapon</span></div>
        <div class="control-item"><span class="control-keys">V</span><span class="control-desc">Switch Camera Mode</span></div>
        <div class="control-item"><span class="control-keys">ESC / P</span><span class="control-desc">Safehouse &amp; Pause Menu</span></div>
      </div>
    `;
  }

  function renderMenuDOM() {
    if (menuMode === 'none') {
      menuRoot.innerHTML = '';
      els.hudLayer.classList.remove('is-hidden');
      return;
    }

    els.hudLayer.classList.add('is-hidden');

    if (menuMode === 'briefing') {
      const m = missionSys.getActiveState().pendingBriefing;
      if (!m) {
        menuMode = 'none';
        renderMenuDOM();
        return;
      }
      menuRoot.innerHTML = `
        <div class="menu-backdrop is-open is-briefing">
          <div class="briefing-modal" role="dialog" aria-modal="true" aria-label="${m.title}">
            <div class="briefing-giver">Contract Briefing • ${m.giver}</div>
            <h2 class="briefing-title">${m.title}</h2>
            <p class="briefing-body">${m.summary}</p>
            <div class="briefing-reward-box">
              <span>District: ${m.district}</span>
              <span>Payout: $${m.reward.toLocaleString()}</span>
            </div>
            <div class="briefing-footer">
              <button type="button" class="menu-btn" data-action="decline-briefing">Later</button>
              <button type="button" class="menu-btn is-primary" data-action="accept-briefing">Accept Contract</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    if (menuMode === 'title') {
      const hasSave = callbacks.hasSavedGame ? callbacks.hasSavedGame() : false;
      menuRoot.innerHTML = `
        <div class="menu-backdrop is-open is-title">
          <div class="menu-shell" role="dialog" aria-label="Sol del Mar Title Menu">
            <div class="menu-sidebar">
              <div class="menu-brand-header">
                <span class="menu-kicker">Sun-Soaked Coastal Open World</span>
                <h1 class="menu-title">Sol del Mar</h1>
                <p class="menu-subtitle">Eight districts, coastal highways, speedboats, Patrulla heat, and an eight-part syndicate campaign.</p>
              </div>
              <div class="menu-nav">
                <button type="button" class="menu-btn is-primary" data-action="start-new">
                  <span>Enter Sol del Mar</span>
                  <span class="menu-btn-sub">Free Roam &amp; Story</span>
                </button>
                ${
                  hasSave
                    ? `<button type="button" class="menu-btn" data-action="continue-save">
                         <span>Continue Safehouse Save</span>
                         <span class="menu-btn-sub">Resume</span>
                       </button>`
                    : ''
                }
                <button type="button" class="menu-btn" data-action="open-contracts-from-title">
                  <span>Select Story Contract</span>
                  <span class="menu-btn-sub">8 Missions</span>
                </button>
                <button type="button" class="menu-btn" data-action="open-controls-from-title">
                  <span>Controls &amp; Audio</span>
                  <span class="menu-btn-sub">Settings</span>
                </button>
              </div>
              <div class="menu-footer-note">100% Offline Three.js Engine • WASD + Mouse</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Pause / Safehouse Menu
    menuRoot.innerHTML = `
      <div class="menu-backdrop is-open is-pause">
        <div class="menu-shell" role="dialog" aria-label="Pause Menu">
          <div class="menu-sidebar">
            <div class="menu-brand-header">
              <span class="menu-kicker">Paused</span>
              <h2 class="menu-title">Sol del Mar</h2>
              <p class="menu-subtitle">Cash: $${actorSys.player.cash.toLocaleString()}</p>
            </div>
            <div class="menu-nav">
              <button type="button" class="menu-btn is-primary" data-action="resume">Resume Game<span>ESC</span></button>
              <button type="button" class="menu-btn ${activeTab === 'missions' ? 'is-active-tab' : ''}" data-tab="missions">Contracts Board</button>
              <button type="button" class="menu-btn ${activeTab === 'save' ? 'is-active-tab' : ''}" data-tab="save">Save / Load</button>
              <button type="button" class="menu-btn ${activeTab === 'settings' ? 'is-active-tab' : ''}" data-tab="settings">Settings</button>
              <button type="button" class="menu-btn ${activeTab === 'controls' ? 'is-active-tab' : ''}" data-tab="controls">Controls</button>
              <button type="button" class="menu-btn" data-action="return-title">Title Screen</button>
            </div>
          </div>
          <div class="menu-panel">
            ${renderPanelHtml(activeTab)}
          </div>
        </div>
      </div>
    `;
  }

  function openTitleMenu() {
    menuMode = 'title';
    input.setGameplayActive(false);
    input.exitPointerLock();
    renderMenuDOM();
    announce('Sol del Mar title screen.');
  }

  function openPauseMenu(tab = 'missions') {
    activeTab = tab;
    menuMode = 'pause';
    input.setGameplayActive(false);
    input.exitPointerLock();
    renderMenuDOM();
    announce('Game paused.');
  }

  function openBriefingModal() {
    menuMode = 'briefing';
    input.setGameplayActive(false);
    input.exitPointerLock();
    renderMenuDOM();
    const pending = missionSys.getActiveState().pendingBriefing;
    if (pending) announce(`Briefing: ${pending.title}`);
  }

  function closeMenus() {
    menuMode = 'none';
    renderMenuDOM();
    input.setGameplayActive(true);
    input.requestPointerLock();
  }

  menuRoot.addEventListener('click', (event) => {
    const tabBtn = event.target.closest('[data-tab]');
    if (tabBtn) {
      effects.unlockAudio();
      effects.playUiSound('click');
      activeTab = tabBtn.getAttribute('data-tab');
      renderMenuDOM();
      return;
    }

    const actionBtn = event.target.closest('[data-action]');
    if (!actionBtn) return;

    effects.unlockAudio();
    effects.playUiSound('click');
    const action = actionBtn.getAttribute('data-action');

    if (action === 'start-new') {
      if (callbacks.onStartNewGame) callbacks.onStartNewGame();
      closeMenus();
    } else if (action === 'continue-save') {
      if (callbacks.onLoadGame) callbacks.onLoadGame();
      closeMenus();
    } else if (action === 'open-contracts-from-title') {
      if (callbacks.onResumeGame) callbacks.onResumeGame();
      openPauseMenu('missions');
    } else if (action === 'open-controls-from-title') {
      if (callbacks.onResumeGame) callbacks.onResumeGame();
      openPauseMenu('settings');
    } else if (action === 'resume') {
      if (callbacks.onResumeGame) callbacks.onResumeGame();
      closeMenus();
    } else if (action === 'return-title') {
      if (callbacks.onReturnTitle) callbacks.onReturnTitle();
      openTitleMenu();
    } else if (action === 'launch-mission') {
      const mId = actionBtn.getAttribute('data-mission-id');
      if (missionSys.startMission(mId)) {
        openBriefingModal();
      }
    } else if (action === 'abort-mission') {
      missionSys.abortMission();
      closeMenus();
    } else if (action === 'accept-briefing') {
      missionSys.acceptBriefing();
      closeMenus();
    } else if (action === 'decline-briefing') {
      missionSys.cancelBriefing();
      closeMenus();
    } else if (action === 'save-game') {
      if (callbacks.onSaveGame) callbacks.onSaveGame();
      missionSys.showBanner('Safehouse Saved', 'Progress written to local storage', 'gold', 2.4);
      closeMenus();
    } else if (action === 'load-game') {
      if (callbacks.onLoadGame) callbacks.onLoadGame();
      closeMenus();
    } else if (action === 'toggle-mute') {
      effects.toggleMute();
      renderMenuDOM();
    } else if (action === 'toggle-invert-y') {
      input.setInvertY(!input.getInvertY());
      renderMenuDOM();
    } else if (action === 'cycle-cam') {
      cameraRig.cycleMode();
      renderMenuDOM();
    }
  });

  menuRoot.addEventListener('input', (event) => {
    const setting = event.target.getAttribute('data-setting');
    if (setting === 'volume') {
      effects.setMasterVolume(Number(event.target.value) / 100);
    } else if (setting === 'traffic' && callbacks.setTrafficDensity) {
      callbacks.setTrafficDensity(Number(event.target.value) / 100);
    }
  });

  // ---------------------------------------------------------------------------
  // 4. Per-Frame HUD Synchronization
  // ---------------------------------------------------------------------------
  function update(dt, time01 = 0.38) {
    const p = actorSys.player;
    const wState = wantedSys.getHudState();
    const mState = missionSys.getActiveState();

    // Auto-open briefing modal if player stepped into a trigger and requested it
    if (mState.pendingBriefing && menuMode === 'none') {
      openBriefingModal();
    }

    // Screen flashes
    els.damageFlash.classList.toggle('is-active', p.damageFlashTimer > 0);
    els.arrestFlash.classList.toggle('is-active', p.arrested || wState.arresting);

    if (menuMode !== 'none') return;

    // District & Clock
    const distObj = cityWorld.getDistrictAt(p.x, p.z);
    els.districtName.textContent = distObj.name;
    els.districtDot.style.background = distObj.mapColor || '#f4a700';
    els.clockText.textContent = formatClock(time01);

    // Objective Card
    if (mState.activeMission) {
      els.objectiveCard.classList.add('is-visible');
      els.objectiveLabel.textContent = mState.activeMission.title;
      els.objectiveText.textContent = mState.stepTitle;
      els.objectiveHint.textContent = mState.stepHint;
      if (mState.timer !== null) {
        els.objectiveTimer.classList.add('is-visible');
        els.objectiveTimer.classList.toggle('is-urgent', mState.timer < 20);
        els.objectiveTimer.textContent = formatTimer(mState.timer);
      } else {
        els.objectiveTimer.classList.remove('is-visible', 'is-urgent');
      }
    } else if (mState.nextMissionTitle) {
      els.objectiveCard.classList.add('is-visible');
      els.objectiveLabel.textContent = 'NEXT CONTRACT';
      els.objectiveText.textContent = mState.nextMissionTitle;
      els.objectiveHint.textContent = 'Follow the gold radar blip or open Casa del Sol board.';
      els.objectiveTimer.classList.remove('is-visible', 'is-urgent');
    } else {
      els.objectiveCard.classList.remove('is-visible');
    }

    // Wanted Stars
    els.wantedRow.classList.toggle('is-active', wState.stars > 0);
    els.wantedRow.classList.toggle('is-evading', wState.evading);
    els.minimapFrame.classList.toggle('is-wanted', wState.stars > 0);
    for (let i = 0; i < starNodes.length; i++) {
      starNodes[i].classList.toggle('is-lit', i < wState.stars);
    }
    if (wState.stars !== lastStars) {
      lastStars = wState.stars;
      announce(wState.stars > 0 ? `Wanted level ${wState.stars} stars` : 'Wanted level cleared');
    }

    // Cash & Delta Popup
    if (p.cash !== lastCash) {
      const diff = p.cash - lastCash;
      lastCash = p.cash;
      els.cashValue.textContent = p.cash.toLocaleString();
      els.cashDelta.textContent = `${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toLocaleString()}`;
      els.cashDelta.classList.remove('is-gain', 'is-loss');
      els.cashDelta.classList.add('is-visible', diff >= 0 ? 'is-gain' : 'is-loss');
      cashDeltaTimer = 1.8;
    } else if (cashDeltaTimer > 0) {
      cashDeltaTimer -= dt;
      if (cashDeltaTimer <= 0) {
        els.cashDelta.classList.remove('is-visible');
      }
    } else {
      els.cashValue.textContent = p.cash.toLocaleString();
    }

    // Weapon Strip & Ammo
    const activeSlot = p.weapons[p.weaponIndex];
    els.weaponName.textContent = activeSlot.def.name;
    els.weaponAmmo.textContent = Number.isFinite(activeSlot.ammo) ? String(activeSlot.ammo) : 'INF';
    for (let i = 0; i < weaponChips.length; i++) {
      const wSlot = p.weapons[i];
      weaponChips[i].classList.toggle('is-owned', wSlot.unlocked);
      weaponChips[i].classList.toggle('is-selected', i === p.weaponIndex);
    }

    // Vital Bars (Health, Armor, Stamina / Vehicle Integrity)
    const hpPct = Math.max(0, Math.min(100, Math.round((p.health / p.maxHealth) * 100)));
    const arPct = Math.max(0, Math.min(100, Math.round((p.armor / p.maxArmor) * 100)));
    els.hpNum.textContent = String(hpPct);
    els.hpFill.style.width = `${hpPct}%`;
    els.hpFill.classList.toggle('is-low', hpPct <= 28);
    els.armorNum.textContent = String(arPct);
    els.armorFill.style.width = `${arPct}%`;

    if (p.inVehicle && p.vehicle) {
      const vPct = Math.max(
        0,
        Math.min(100, Math.round((p.vehicle.health / p.vehicle.maxHealth) * 100)),
      );
      els.auxLabel.textContent = 'Chassis Integrity';
      els.auxNum.textContent = `${vPct}%`;
      els.auxFill.className = 'hud-bar-fill is-vehicle';
      els.auxFill.style.width = `${vPct}%`;
    } else {
      const stPct = Math.max(0, Math.min(100, Math.round((p.stamina / p.maxStamina) * 100)));
      els.auxLabel.textContent = 'Stamina';
      els.auxNum.textContent = `${stPct}%`;
      els.auxFill.className = 'hud-bar-fill is-stamina';
      els.auxFill.style.width = `${stPct}%`;
    }

    // Speedometer & Camera Mode
    if (p.inVehicle && p.vehicle) {
      const mph = Math.round(p.vehicle.speed * 2.237);
      const gear =
        p.vehicle.forwardSpeed < -0.8
          ? 'R'
          : mph < 3
            ? 'N'
            : `D${Math.min(6, 1 + Math.floor(mph / 16))}`;
      els.speedoCard.classList.add('is-visible');
      els.speedoValue.textContent = String(mph);
      els.speedoVehicle.textContent = p.vehicle.name;
      els.speedoGear.textContent = gear;
    } else {
      els.speedoCard.classList.remove('is-visible');
    }
    els.cameraBadge.textContent = `CAM: ${cameraRig.getMode().toUpperCase()}`;

    // Reticle
    els.reticle.classList.toggle('is-aiming', p.aiming);
    els.reticle.classList.toggle('is-hit', p.hitMarkerTimer > 0);
    els.reticle.classList.toggle('is-firing', p.fireCooldown > 0.04);

    // Contextual [E] Interaction Prompt
    let promptMsg = '';
    if (!p.dead && !p.arrested) {
      if (mState.nearTriggerMission && !p.inVehicle) {
        promptMsg = `Start Contract: ${mState.nearTriggerMission.title}`;
      } else if (mState.nearSafehouse && !p.inVehicle) {
        promptMsg = 'Open Casa del Sol Contract Board & Safehouse';
      } else if (!p.inVehicle) {
        const nearVeh = vehicleMgr.findNearestEnterable(p.x, p.z, 5.2);
        if (nearVeh) {
          promptMsg = `${nearVeh.isBoat ? 'Board' : 'Enter'} ${nearVeh.name}`;
        }
      }
    }
    els.interactPrompt.classList.toggle('is-visible', Boolean(promptMsg));
    if (promptMsg) els.promptLabel.textContent = promptMsg;

    // Dialogue Subtitle Box
    if (mState.dialogue) {
      els.dialogueBox.classList.add('is-visible');
      els.dialogueSpeaker.textContent = mState.dialogue.speaker;
      els.dialogueLine.textContent = mState.dialogue.text;
    } else {
      els.dialogueBox.classList.remove('is-visible');
    }

    // Big Status Banner
    if (mState.banner) {
      els.banner.className = `hud-banner is-visible tone-${mState.banner.tone || 'gold'}`;
      els.bannerTitle.textContent = mState.banner.title;
      els.bannerSub.textContent = mState.banner.sub || '';
      if (mState.banner.title !== lastAnnouncedBanner) {
        lastAnnouncedBanner = mState.banner.title;
        announce(`${mState.banner.title}. ${mState.banner.sub || ''}`);
      }
    } else {
      els.banner.classList.remove('is-visible');
      lastAnnouncedBanner = '';
    }

    renderMinimap(dt, mState);
  }

  renderMenuDOM();

  return {
    openTitleMenu,
    openPauseMenu,
    openBriefingModal,
    closeMenus,
    announce,
    isMenuOpen() {
      return menuMode !== 'none';
    },
    getMenuMode() {
      return menuMode;
    },
    setHudVisible(visible) {
      els.hudLayer.classList.toggle('is-hidden', !visible);
      lastCash = actorSys.player.cash;
      cashDeltaTimer = 0;
      els.cashValue.textContent = lastCash.toLocaleString();
      els.cashDelta.classList.remove('is-visible', 'is-gain', 'is-loss');
      els.cashDelta.textContent = '';
    },
    setFadeCurtain(visible) {
      els.fadeCurtain.classList.toggle('is-visible', Boolean(visible));
    },
    update,
  };
}


