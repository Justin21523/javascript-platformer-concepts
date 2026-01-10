// src/ui/level-menu.js
// Minimal level selection overlay (toggle with F7)
export class LevelMenu {
  constructor(levelManager) {
    this.levelManager = levelManager;
    this.visible = false;
    this.lastMeta = null;
    this.container = this.createUI();
    this.bindEvents();
    this.refreshOptions();
    this.syncSelection();
  }

  createUI() {
    const container = document.createElement("div");
    container.id = "level-menu";
    container.style.cssText = `
      position: fixed;
      top: 12px;
      left: 12px;
      width: 260px;
      background: rgba(13, 17, 23, 0.92);
      color: #e6f1ff;
      font-family: "Fira Code", monospace;
      font-size: 12px;
      border: 1px solid #243447;
      border-radius: 8px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.35);
      padding: 10px;
      display: none;
      z-index: 1120;
      backdrop-filter: blur(3px);
    `;

    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div style="font-weight:bold;letter-spacing:0.5px;">Level Menu</div>
        <button data-action="close" class="lv-btn">✕</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <select data-field="levelSelect" class="lv-select"></select>
        <div style="display:flex;gap:6px;">
          <button data-action="load" class="lv-btn" style="flex:1;">Load</button>
          <button data-action="next" class="lv-btn" style="flex:1;">Next</button>
        </div>
        <div style="display:flex;gap:6px;">
          <button data-action="respawn" class="lv-btn" style="flex:1;">Respawn</button>
          <button data-action="reload" class="lv-btn" style="flex:1;">Reload</button>
        </div>
        <div data-field="info" style="color:#9fb3c8;font-size:11px;line-height:1.4;"></div>
      </div>
    `;

    container.querySelectorAll(".lv-btn").forEach((btn) => {
      btn.style.cssText = `
        background: #1f2a3d;
        color: #e6f1ff;
        border: 1px solid #2f3b52;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
      `;
    });

    const select = container.querySelector(".lv-select");
    select.style.cssText = `
      width: 100%;
      background: #0d1117;
      color: #e6f1ff;
      border: 1px solid #2f3b52;
      border-radius: 4px;
      padding: 6px;
    `;

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
        case "load":
          this.loadSelected();
          break;
        case "next":
          this.loadNext();
          break;
        case "respawn":
          this.levelManager.respawnPlayer();
          break;
        case "reload":
          this.reloadCurrent();
          break;
      }
    });

    window.addEventListener("level-changed", (e) => {
      this.lastMeta = e.detail?.meta || null;
      this.syncSelection(e.detail?.current);
      this.renderInfo(e.detail?.level, e.detail?.spawn, this.lastMeta);
    });
  }

  refreshOptions() {
    const select = this.container.querySelector('[data-field="levelSelect"]');
    select.innerHTML = "";
    this.levelManager.getLevels().forEach((lvl) => {
      const opt = document.createElement("option");
      opt.value = lvl.id;
      opt.textContent = lvl.name;
      select.appendChild(opt);
    });
  }

  syncSelection(currentId) {
    const select = this.container.querySelector('[data-field="levelSelect"]');
    const active = currentId || this.levelManager.getCurrentLevel()?.id;
    if (active) select.value = active;
    this.renderInfo(this.levelManager.getCurrentLevel(), this.levelManager.getSpawnPosition(), this.lastMeta);
  }

  toggle(force) {
    const next = typeof force === "boolean" ? force : !this.visible;
    this.visible = next;
    this.container.style.display = next ? "block" : "none";
  }

  async loadSelected() {
    const select = this.container.querySelector('[data-field="levelSelect"]');
    const id = select.value;
    try {
      await this.levelManager.loadLevel(id, { respawnPlayer: true });
      this.setStatus(`Loaded ${id}`);
    } catch (e) {
      this.setStatus(`Load failed: ${e.message}`, true);
    }
  }

  async loadNext() {
    const levels = this.levelManager.getLevels();
    const current = this.levelManager.getCurrentLevel();
    const idx = levels.findIndex((lvl) => lvl.id === current?.id);
    const next = levels[(idx + 1) % levels.length];
    if (next) {
      try {
        await this.levelManager.loadLevel(next.id, { respawnPlayer: true });
        this.syncSelection(next.id);
        this.setStatus(`Loaded ${next.id}`);
      } catch (e) {
        this.setStatus(`Load failed: ${e.message}`, true);
      }
    }
  }

  async reloadCurrent() {
    const current = this.levelManager.getCurrentLevel();
    if (current) {
      try {
        await this.levelManager.loadLevel(current.id, { respawnPlayer: true });
        this.setStatus(`Reloaded ${current.id}`);
      } catch (e) {
        this.setStatus(`Reload failed: ${e.message}`, true);
      }
    }
  }

  renderInfo(level, spawn, meta) {
    const info = this.container.querySelector('[data-field="info"]');
    if (!level) {
      info.textContent = "No level loaded";
      return;
    }
    info.innerHTML = `
      <div>${level.name}</div>
      <div style="opacity:0.8;">Ground: ${level.ground || "N/A"}</div>
      <div style="opacity:0.8;">Sky: ${level.sky || "N/A"}</div>
      <div style="opacity:0.8;">Spawn: ${
        spawn ? `${Math.round(spawn.x)}, ${Math.round(spawn.y)}` : "N/A"
      }</div>
      ${
        level.procedural
          ? `<div style="opacity:0.8;">Proc: ${level.procedural.theme || "default"}${meta?.seed ? ` (seed ${meta.seed})` : ""}</div>`
          : ""
      }
    `;
  }

  setStatus(message, isError = false) {
    const info = this.container.querySelector('[data-field="info"]');
    if (!info) return;
    const prev = info.innerHTML;
    info.innerHTML = `${prev}<div style="color:${isError ? "#ff9aa2" : "#8ab4f8"};margin-top:4px;">${message}</div>`;
  }
}
