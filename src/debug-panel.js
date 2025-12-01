// src/debug-panel.js
// Lightweight debug UI overlay for toggling diagnostics, teleporting, and swapping maps
import {
  getDebugState,
  updateDebugSetting,
  setTimeScaleIndex,
  TIME_SCALES,
} from "./debug.js";

export class DebugPanel {
  constructor(world, systems, infiniteWorld, tilemapLoader) {
    this.world = world;
    this.systems = systems;
    this.infiniteWorld = infiniteWorld;
    this.tilemapLoader = tilemapLoader;
    this.visible = false;
    this.statusTimer = null;

    this.container = this.createUI();
    this.bindEvents();
    this.syncControls();

    const debug = getDebugState();
    if (debug.showPanel) {
      this.toggle(true);
    }
  }

  createUI() {
    const container = document.createElement("div");
    container.id = "debug-panel";
    container.style.cssText = `
      position: fixed;
      top: 12px;
      right: 12px;
      width: 340px;
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      background: rgba(12, 12, 18, 0.92);
      color: #e6f1ff;
      font-family: "Fira Code", monospace;
      font-size: 12px;
      border: 1px solid #2f3b52;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      padding: 12px;
      display: none;
      z-index: 1100;
      backdrop-filter: blur(4px);
    `;

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-weight:bold;letter-spacing:0.5px;">Debug Panel</div>
        <button data-action="close" style="background:#1f2a3d;color:#e6f1ff;border:1px solid #2f3b52;border-radius:4px;padding:2px 8px;cursor:pointer;">✕</button>
      </div>

      <div class="dbg-section">
        <div class="dbg-row"><span>FPS</span><span data-field="fps">--</span></div>
        <div class="dbg-row"><span>Time Scale</span><span data-field="timeScale">1.0x</span></div>
        <div class="dbg-row"><span>Entities</span><span data-field="entities">--</span></div>
        <div class="dbg-row"><span>Camera</span><span data-field="camera">--</span></div>
        <div class="dbg-row"><span>Player</span><span data-field="player">--</span></div>
        <div class="dbg-row"><span>Velocity</span><span data-field="velocity">--</span></div>
        <div class="dbg-row"><span>Health</span><span data-field="health">--</span></div>
        <div class="dbg-row"><span>AI</span><span data-field="aiState">--</span></div>
        <div class="dbg-row"><span>Layer</span><span data-field="layer">--</span></div>
      </div>

      <div class="dbg-section">
        <div class="dbg-row">
          <label><input type="checkbox" data-toggle="showOverlay"> Overlay</label>
          <label><input type="checkbox" data-toggle="showHitbox"> Hitbox</label>
          <label><input type="checkbox" data-toggle="showTileGrid"> Grid</label>
          <label><input type="checkbox" data-toggle="showVelocityVectors"> Vectors</label>
        </div>
        <div class="dbg-row" style="gap:8px;align-items:center;">
          <label style="display:flex;align-items:center;gap:4px;">Time
            <select data-field="timeSelect" style="background:#0d1117;color:#e6f1ff;border:1px solid #2f3b52;border-radius:4px;padding:2px 6px;">
              ${TIME_SCALES.map((scale) => `<option value="${scale}">${scale}x</option>`).join("")}
            </select>
          </label>
          <button data-action="pause" class="dbg-btn">Pause/Resume</button>
        </div>
      </div>

      <div class="dbg-section">
        <div class="dbg-subtitle">Teleport</div>
        <div class="dbg-row" style="gap:6px;">
          <input data-field="tpX" type="number" placeholder="x" class="dbg-input">
          <input data-field="tpY" type="number" placeholder="y" class="dbg-input">
          <button data-action="teleport" class="dbg-btn">Go</button>
        </div>
        <div class="dbg-row" style="gap:6px;">
          <button data-action="tp-ground" class="dbg-btn">To Ground</button>
          <button data-action="tp-sky" class="dbg-btn">To Sky Entry</button>
          <button data-action="tp-origin" class="dbg-btn">Origin</button>
        </div>
      </div>

      <div class="dbg-section">
        <div class="dbg-subtitle">Level Controls</div>
        <div class="dbg-row">
          <input data-field="groundPath" type="text" placeholder="assets/levels/ground-layer.json" class="dbg-input" value="assets/levels/ground-layer.json">
        </div>
        <div class="dbg-row">
          <input data-field="skyPath" type="text" placeholder="assets/levels/sky-layer.json" class="dbg-input" value="assets/levels/sky-layer.json">
        </div>
        <div class="dbg-row" style="gap:6px;">
          <button data-action="load-maps" class="dbg-btn">Load Maps</button>
          <button data-action="reload-current" class="dbg-btn">Reload Current</button>
        </div>
        <div data-field="status" style="min-height:16px;color:#8ab4f8;font-size:11px;margin-top:4px;"></div>
      </div>

      <div class="dbg-section">
        <div class="dbg-subtitle">AI / Combat Tuning</div>
        <div class="dbg-row" style="gap:6px;">
          <input data-field="aiSight" type="number" class="dbg-input" placeholder="Sight Range" value="520">
          <input data-field="aiAttackRange" type="number" class="dbg-input" placeholder="Attack Range" value="110">
          <input data-field="aiAttackCd" type="number" step="0.05" class="dbg-input" placeholder="Attack CD" value="0.9">
        </div>
        <div class="dbg-row" style="gap:6px;">
          <input data-field="aiAggro" type="number" class="dbg-input" placeholder="Max Aggro" value="700">
          <input data-field="aiDisengage" type="number" class="dbg-input" placeholder="Disengage" value="700">
        </div>
        <div class="dbg-row" style="gap:6px;">
          <input data-field="spawnStep" type="number" class="dbg-input" placeholder="Vertical Step" value="600">
          <input data-field="spawnAirPerBand" type="number" class="dbg-input" placeholder="Air Per Band" value="2">
        </div>
        <div class="dbg-row" style="gap:6px;">
          <button data-action="apply-ai" class="dbg-btn">Apply To Enemies</button>
          <button data-action="apply-spawn" class="dbg-btn">Apply Spawn</button>
        </div>
      </div>
    `;

    container.querySelectorAll(".dbg-section").forEach((section) => {
      section.style.cssText = `
        border: 1px solid #1f2a3d;
        padding: 8px;
        border-radius: 6px;
        margin-bottom: 10px;
        background: rgba(15, 20, 30, 0.9);
      `;
    });

    container.querySelectorAll(".dbg-row").forEach((row) => {
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        gap: 4px;
        flex-wrap: wrap;
      `;
    });

    container.querySelectorAll(".dbg-subtitle").forEach((subtitle) => {
      subtitle.style.cssText = `
        font-weight: bold;
        margin-bottom: 4px;
        color: #9fb3c8;
      `;
    });

    container.querySelectorAll(".dbg-btn").forEach((btn) => {
      btn.style.cssText = `
        background: #1f2a3d;
        color: #e6f1ff;
        border: 1px solid #2f3b52;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
      `;
    });

    container.querySelectorAll(".dbg-input").forEach((input) => {
      input.style.cssText = `
        flex: 1;
        min-width: 0;
        background: #0d1117;
        color: #e6f1ff;
        border: 1px solid #2f3b52;
        border-radius: 4px;
        padding: 4px 6px;
      `;
    });

    document.body.appendChild(container);
    return container;
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const action = e.target.getAttribute("data-action");
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();

      switch (action) {
        case "close":
          this.toggle(false);
          break;
        case "pause":
          this.togglePause();
          break;
        case "teleport":
          this.handleTeleport();
          break;
        case "tp-ground":
          this.handleTeleport("ground");
          break;
        case "tp-sky":
          this.handleTeleport("sky");
          break;
        case "tp-origin":
          this.teleportTo(0, 0);
          break;
        case "load-maps":
          this.handleLoadMaps();
          break;
        case "reload-current":
          this.handleReloadCurrent();
          break;
        case "apply-ai":
          this.handleAITuning();
          break;
        case "apply-spawn":
          this.handleSpawnTuning();
          break;
      }
    });

    this.container.querySelectorAll("input[data-toggle]").forEach((input) => {
      input.addEventListener("change", (e) => {
        const key = e.target.getAttribute("data-toggle");
        updateDebugSetting(key, e.target.checked);
      });
    });

    const timeSelect = this.container.querySelector('[data-field="timeSelect"]');
    timeSelect.addEventListener("change", (e) => {
      const value = parseFloat(e.target.value);
      const index = TIME_SCALES.indexOf(value);
      if (index >= 0) {
        setTimeScaleIndex(index);
        this.updateTimeScaleDisplay();
      }
    });
  }

  toggle(force) {
    const next = typeof force === "boolean" ? force : !this.visible;
    updateDebugSetting("showPanel", next);
    this.visible = next;
    this.container.style.display = next ? "block" : "none";
    if (next) {
      this.syncControls();
      this.update();
    }
  }

  syncControls() {
    const debug = getDebugState();
    this.container
      .querySelectorAll("input[data-toggle]")
      .forEach((input) => {
        const key = input.getAttribute("data-toggle");
        input.checked = Boolean(debug[key]);
      });

    const timeSelect = this.container.querySelector('[data-field="timeSelect"]');
    timeSelect.value = TIME_SCALES[debug.timeScaleIndex] ?? 1.0;
    this.updateTimeScaleDisplay();
  }

  update(fps = 0) {
    if (!this.visible) return;
    const debug = getDebugState();
    const camera = this.systems?.camera?.getCamera
      ? this.systems.camera.getCamera()
      : { x: 0, y: 0, targetX: 0, targetY: 0 };

    this.setField("fps", Math.round(fps).toString());
    this.setField("timeScale", `${debug.timeScale.toFixed(2)}x`);
    const timeSelect = this.container.querySelector('[data-field="timeSelect"]');
    if (timeSelect && parseFloat(timeSelect.value) !== debug.timeScale) {
      timeSelect.value = debug.timeScale;
    }
    this.setField("entities", this.world?.entityCount ?? 0);
    this.setField(
      "camera",
      `(${Math.round(camera.x)}, ${Math.round(camera.y)}) → (${Math.round(
        camera.targetX || 0
      )}, ${Math.round(camera.targetY || 0)})`
    );

    if (this.systems?.spawn) {
      const spawn = this.systems.spawn;
      const stepInput = this.container.querySelector('[data-field="spawnStep"]');
      const airInput = this.container.querySelector('[data-field="spawnAirPerBand"]');
      if (stepInput) stepInput.value = spawn.verticalStep;
      if (airInput) airInput.value = spawn.airPerBand;
    }

    if (this.world) {
      const aiEntities = this.world.query(["AIState"]);
      let engaged = 0;
      for (const id of aiEntities) {
        const ai = this.world.getComponent(id, "AIState");
        if (ai && ai.target !== null && ai.alertLevel > 0.2) {
          engaged++;
        }
      }
      this.setField("aiState", `${aiEntities.length} (${engaged} engaged)`);
    } else {
      this.setField("aiState", "--");
    }

    if (this.world?.player) {
      const t = this.world.getComponent(this.world.player, "Transform");
      const v = this.world.getComponent(this.world.player, "Velocity");
      const health = this.world.getComponent(this.world.player, "Health");
      const onGround = this.world.collisionFlags?.onGround?.get(this.world.player);
      const hitWall = this.world.collisionFlags?.hitWall?.get(this.world.player);

      this.setField(
        "player",
        t ? `(${Math.round(t.x)}, ${Math.round(t.y)}) G:${!!onGround} W:${!!hitWall}` : "--"
      );
      this.setField(
        "velocity",
        v ? `(${Math.round(v.vx)}, ${Math.round(v.vy)})` : "--"
      );
      this.setField(
        "health",
        health ? `${health.current}/${health.max}` : "--"
      );
    } else {
      this.setField("player", "--");
      this.setField("velocity", "--");
      this.setField("health", "--");
    }

    if (this.infiniteWorld && this.world?.player) {
      const t = this.world.getComponent(this.world.player, "Transform");
      if (t) {
        const layerType = this.infiniteWorld.getLayerType(t.y);
        const skyLayer = this.infiniteWorld.getSkyLayerIndex(t.y);
        this.setField("layer", `${layerType.toUpperCase()} / sky:${skyLayer}`);
      }
    } else {
      this.setField("layer", "--");
    }
  }

  updateTimeScaleDisplay() {
    const debug = getDebugState();
    this.setField("timeScale", `${debug.timeScale.toFixed(2)}x`);
  }

  setField(name, value) {
    const el = this.container.querySelector(`[data-field="${name}"]`);
    if (el) el.textContent = value;
  }

  togglePause() {
    const debug = getDebugState();
    updateDebugSetting("paused", !debug.paused);
    this.showStatus(debug.paused ? "Resumed" : "Paused");
  }

  handleTeleport(mode) {
    if (!this.world?.player) return;
    const t = this.world.getComponent(this.world.player, "Transform");
    if (!t) return;

    let x = parseFloat(this.container.querySelector('[data-field="tpX"]').value);
    let y = parseFloat(this.container.querySelector('[data-field="tpY"]').value);

    if (mode === "ground") {
      x = t.x;
      const tileSize = this.infiniteWorld?.tileSize ?? 32;
      const groundBottom = this.infiniteWorld?.groundLayerBottom ?? t.y;
      y = groundBottom - tileSize * 6;
    } else if (mode === "sky") {
      x = t.x;
      y = (this.infiniteWorld?.groundLayerTop ?? 0) - (this.infiniteWorld?.tileSize ?? 32) * 6;
    }

    if (Number.isNaN(x) || Number.isNaN(y)) {
      this.showStatus("Teleport: invalid coordinates", true);
      return;
    }

    this.teleportTo(x, y);
  }

  teleportTo(x, y) {
    const t = this.world.getComponent(this.world.player, "Transform");
    if (!t) return;
    t.x = x;
    t.y = y;
    this.showStatus(`Teleported to (${Math.round(x)}, ${Math.round(y)})`);
  }

  async handleLoadMaps() {
    const groundPath = this.container.querySelector('[data-field="groundPath"]').value.trim();
    const skyPath = this.container.querySelector('[data-field="skyPath"]').value.trim();
    await this.loadMaps(groundPath, skyPath);
  }

  async handleReloadCurrent() {
    const groundPath = this.container.querySelector('[data-field="groundPath"]').value.trim();
    const skyPath = this.container.querySelector('[data-field="skyPath"]').value.trim();
    await this.loadMaps(groundPath || "assets/levels/ground-layer.json", skyPath || "assets/levels/sky-layer.json");
  }

  handleAITuning() {
    const sight = parseFloat(this.container.querySelector('[data-field="aiSight"]').value);
    const attackRange = parseFloat(this.container.querySelector('[data-field="aiAttackRange"]').value);
    const attackCd = parseFloat(this.container.querySelector('[data-field="aiAttackCd"]').value);
    const aggro = parseFloat(this.container.querySelector('[data-field="aiAggro"]').value);
    const disengage = parseFloat(this.container.querySelector('[data-field="aiDisengage"]').value);

    if ([sight, attackRange, attackCd, aggro, disengage].some(Number.isNaN)) {
      this.showStatus("AI tuning: invalid numbers", true);
      return;
    }

    const aiEntities = this.world?.query?.(["AIState"]) || [];
    let updated = 0;
    for (const id of aiEntities) {
      const perception = this.world.getComponent(id, "Perception");
      const combat = this.world.getComponent(id, "CombatStats");
      const behavior = this.world.getComponent(id, "BehaviorProfile");

      if (perception) {
        perception.sightRange = sight;
      }
      if (combat) {
        combat.attackRange = attackRange;
        combat.attackCooldown = attackCd;
      }
      if (behavior) {
        behavior.attackRange = attackRange;
        behavior.maxAggroDistance = aggro;
        behavior.disengageRange = disengage;
      }
      updated++;
    }

    this.showStatus(`AI tuned: ${updated} entities`);
  }

  handleSpawnTuning() {
    const step = parseFloat(this.container.querySelector('[data-field="spawnStep"]').value);
    const airPer = parseFloat(this.container.querySelector('[data-field="spawnAirPerBand"]').value);
    if (Number.isNaN(step) || Number.isNaN(airPer) || !this.systems?.spawn) {
      this.showStatus("Spawn tuning: invalid numbers or spawn system missing", true);
      return;
    }
    this.systems.spawn.verticalStep = step;
    this.systems.spawn.airPerBand = airPer;
    this.showStatus(`Spawn tuned: step=${step}, air/band=${airPer}`);
  }

  async loadMaps(groundPath, skyPath) {
    if (!this.tilemapLoader || !this.infiniteWorld || !this.systems?.render) {
      this.showStatus("Map loader not ready", true);
      return;
    }

    try {
      this.showStatus("Loading maps...");
      const newGround = groundPath ? await this.tilemapLoader.loadMap(groundPath) : null;
      const newSky = skyPath ? await this.tilemapLoader.loadMap(skyPath) : null;

      if (newGround) {
        this.infiniteWorld.setGroundMap(newGround);
        this.systems.render.tileMap = newGround;
      }
      if (newSky) {
        this.infiniteWorld.setSkyMap(newSky);
      }

      this.showStatus("Maps loaded and applied");
    } catch (e) {
      console.error(e);
      this.showStatus(`Load failed: ${e.message}`, true);
    }
  }

  showStatus(message, isError = false) {
    const statusEl = this.container.querySelector('[data-field="status"]');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.color = isError ? "#ff9aa2" : "#8ab4f8";

    if (this.statusTimer) clearTimeout(this.statusTimer);
    this.statusTimer = setTimeout(() => {
      statusEl.textContent = "";
    }, 4000);
  }
}
