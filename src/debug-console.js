// src/debug-console.js
import { createBasicEnemy } from "./entities/enemy-basic.js";
import {
  createGroundPatrol,
  createFlyingCharger,
  createVerticalSentinel,
  createFriendlyNpc,
} from "./entities/enemy-variants.js";
import { createCollectible } from "./entities/collectible.js";
import { createProjectile } from "./entities/projectile.js";

/**
 * Debug Console - Runtime command interface for debugging
 *
 * Available commands:
 * - help: Show all available commands
 * - teleport <x> <y>: Teleport player to coordinates
 * - speed <value>: Set player max speed
 * - gravity <value>: Set gravity scale
 * - jump <value>: Set jump force
 * - fps: Toggle FPS display
 * - clear: Clear console history
 */

export class DebugConsole {
  constructor(world, systems) {
    this.world = world;
    this.systems = systems;
    this.visible = false;
    this.history = [];
    this.commandHistory = [];
    this.historyIndex = -1;

    this.createUI();
    this.setupCommands();
  }

  createUI() {
    // Create console container
    this.container = document.createElement("div");
    this.container.id = "debug-console";
    this.container.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 300px;
      background: rgba(0, 0, 0, 0.9);
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      display: none;
      flex-direction: column;
      border-top: 2px solid #00ff00;
      z-index: 1000;
    `;

    // Create output area
    this.output = document.createElement("div");
    this.output.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      white-space: pre-wrap;
    `;
    this.container.appendChild(this.output);

    // Create input area
    const inputContainer = document.createElement("div");
    inputContainer.style.cssText = `
      display: flex;
      border-top: 1px solid #00ff00;
      padding: 5px;
    `;

    const prompt = document.createElement("span");
    prompt.textContent = "> ";
    prompt.style.cssText = "padding: 5px; color: #00ff00;";
    inputContainer.appendChild(prompt);

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.style.cssText = `
      flex: 1;
      background: transparent;
      border: none;
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
      outline: none;
    `;
    inputContainer.appendChild(this.input);

    this.container.appendChild(inputContainer);

    // Add to document
    document.body.appendChild(this.container);

    // Setup input handlers
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Welcome message
    this.log("Debug Console - Type 'help' for available commands");
  }

  setupCommands() {
    this.commands = {
      help: {
        description: "Show all available commands",
        execute: () => {
          this.log("Available commands:");
          for (const [name, cmd] of Object.entries(this.commands)) {
            this.log(`  ${name}: ${cmd.description}`);
          }
        }
      },

      teleport: {
        description: "teleport <x> <y> - Teleport player to coordinates",
        execute: (args) => {
          if (args.length !== 2) {
            this.error("Usage: teleport <x> <y>");
            return;
          }
          const x = parseFloat(args[0]);
          const y = parseFloat(args[1]);
          if (isNaN(x) || isNaN(y)) {
            this.error("Invalid coordinates");
            return;
          }

          const transform = this.world.getComponent(this.world.player, "Transform");
          if (transform) {
            transform.x = x;
            transform.y = y;
            this.log(`Teleported to (${x}, ${y})`);
          } else {
            this.error("Player not found");
          }
        }
      },

      speed: {
        description: "speed <value> - Set player max speed",
        execute: (args) => {
          if (args.length !== 1) {
            this.error("Usage: speed <value>");
            return;
          }
          const speed = parseFloat(args[0]);
          if (isNaN(speed)) {
            this.error("Invalid speed value");
            return;
          }

          const physics = this.world.getComponent(this.world.player, "PhysicsBody");
          if (physics) {
            physics.maxSpeedX = speed;
            this.log(`Max speed set to ${speed}`);
          } else {
            this.error("Player physics not found");
          }
        }
      },

      gravity: {
        description: "gravity <value> - Set gravity scale",
        execute: (args) => {
          if (args.length !== 1) {
            this.error("Usage: gravity <value>");
            return;
          }
          const scale = parseFloat(args[0]);
          if (isNaN(scale)) {
            this.error("Invalid gravity scale");
            return;
          }

          const physics = this.world.getComponent(this.world.player, "PhysicsBody");
          if (physics) {
            physics.gravityScale = scale;
            this.log(`Gravity scale set to ${scale}`);
          } else {
            this.error("Player physics not found");
          }
        }
      },

      jump: {
        description: "jump <value> - Set jump force",
        execute: (args) => {
          if (args.length !== 1) {
            this.error("Usage: jump <value>");
            return;
          }
          const force = parseFloat(args[0]);
          if (isNaN(force)) {
            this.error("Invalid jump force");
            return;
          }

          const input = this.world.getComponent(this.world.player, "Input");
          if (input && this.systems.input) {
            this.systems.input.jumpForce = force;
            this.log(`Jump force set to ${force}`);
          } else {
            this.error("Input system not found");
          }
        }
      },

      clear: {
        description: "Clear console history",
        execute: () => {
          this.output.textContent = "";
          this.history = [];
        }
      },

      fps: {
        description: "Show current FPS",
        execute: () => {
          this.log("FPS display is always visible in debug overlay (F1)");
        }
      },

      info: {
        description: "Show player info",
        execute: () => {
          const transform = this.world.getComponent(this.world.player, "Transform");
          const velocity = this.world.getComponent(this.world.player, "Velocity");
          const physics = this.world.getComponent(this.world.player, "PhysicsBody");

          if (transform && velocity && physics) {
            this.log("=== Player Info ===");
            this.log(`Position: (${Math.round(transform.x)}, ${Math.round(transform.y)})`);
            this.log(`Velocity: (${Math.round(velocity.vx)}, ${Math.round(velocity.vy)})`);
            this.log(`Max Speed: ${physics.maxSpeedX}`);
            this.log(`Gravity Scale: ${physics.gravityScale}`);
            this.log(`Friction: ${physics.frictionX}`);
          } else {
            this.error("Could not retrieve player info");
          }
        }
      },

      spawn: {
        description: "spawn <x> <y> - Spawn entity at coordinates",
        execute: (args) => {
          if (args.length !== 2) {
            this.error("Usage: spawn <x> <y>");
            return;
          }
          const x = parseFloat(args[0]);
          const y = parseFloat(args[1]);
          if (isNaN(x) || isNaN(y)) {
            this.error("Invalid coordinates");
            return;
          }

          // Create a simple box entity
          const entity = this.world.createEntity();
          this.world.addComponent(entity, "Transform", { x, y, z: 0 });
          this.world.addComponent(entity, "Velocity", { vx: 0, vy: 0 });
          this.world.addComponent(entity, "AABB", { w: 32, h: 32, ox: 0, oy: 0 });
          this.world.addComponent(entity, "Renderable", { color: "#ff0000" });
          this.world.addComponent(entity, "PhysicsBody", {
            gravityScale: 1,
            frictionX: 0.8,
            maxSpeedX: 400,
            maxSpeedY: 1600,
          });
          this.world.addComponent(entity, "Collider", { solid: true, group: "box" });

          this.log(`Spawned entity #${entity} at (${x}, ${y})`);
        }
      },

      enemy: {
        description: "enemy [x] [y] - Spawn basic enemy (defaults near player)",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, 160, 0);

          const patrolPoints = [
            { x: x - 40, y },
            { x: x + 40, y },
          ];

          const enemyId = createBasicEnemy(this.world, { x, y, patrolPoints });
          this.log(`Spawned enemy #${enemyId} at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      flyer: {
        description: "flyer [x] [y] - Spawn flying charger",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, 200, 0);
          const id = createFlyingCharger(this.world, { x, y });
          this.log(`Spawned flyer #${id} at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      sentinel: {
        description: "sentinel [x] [y] - Spawn vertical sentinel",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, 0, -100);
          const id = createVerticalSentinel(this.world, { x, y });
          this.log(`Spawned sentinel #${id} at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      friend: {
        description: "friend [x] [y] - Spawn neutral friendly NPC",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, -120, 0);
          const id = createFriendlyNpc(this.world, { x, y });
          this.log(`Spawned friend #${id} at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      collect: {
        description: "collect [x] [y] [kind] [value] - Spawn collectible (energy default)",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, 40, -60);
          const kind = args[2] || "energy";
          const value = args[3] ? parseFloat(args[3]) : 10;
          const id = createCollectible(this.world, { x, y, kind, value, color: "#ffd700" });
          this.log(`Spawned collectible #${id} (${kind}:${value}) at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      proj: {
        description: "proj [x] [y] [vx] [vy] - Spawn projectile",
        execute: (args) => {
          const { x, y } = this.parseCoordsOrPlayerOffset(args, 0, 0);
          const vx = args[2] ? parseFloat(args[2]) : 280;
          const vy = args[3] ? parseFloat(args[3]) : 0;
          const id = createProjectile(this.world, { x, y, vx, vy, team: "enemy" });
          this.log(`Spawned projectile #${id} at (${Math.round(x)}, ${Math.round(y)})`);
        }
      },

      aitune: {
        description: "aitune <sight> <attackRange> <attackCooldown> - apply to all AI",
        execute: (args) => {
          if (args.length !== 3) {
            this.error("Usage: aitune <sight> <attackRange> <attackCooldown>");
            return;
          }
          const sight = parseFloat(args[0]);
          const attackRange = parseFloat(args[1]);
          const attackCd = parseFloat(args[2]);
          if ([sight, attackRange, attackCd].some((v) => Number.isNaN(v))) {
            this.error("Invalid numbers");
            return;
          }

          const aiEntities = this.world.query(["AIState"]);
          let updated = 0;
          for (const id of aiEntities) {
            const perception = this.world.getComponent(id, "Perception");
            const combat = this.world.getComponent(id, "CombatStats");
            const behavior = this.world.getComponent(id, "BehaviorProfile");
            if (perception) perception.sightRange = sight;
            if (combat) {
              combat.attackRange = attackRange;
              combat.attackCooldown = attackCd;
            }
            if (behavior) behavior.attackRange = attackRange;
            updated++;
          }
          this.log(`Applied AI tuning to ${updated} entities`);
        }
      },

      aggro: {
        description: "aggro <max> <disengage> - set global aggro/disengage",
        execute: (args) => {
          if (args.length !== 2) {
            this.error("Usage: aggro <max> <disengage>");
            return;
          }
          const aggro = parseFloat(args[0]);
          const disengage = parseFloat(args[1]);
          if ([aggro, disengage].some(Number.isNaN)) {
            this.error("Invalid numbers");
            return;
          }
          const aiEntities = this.world.query(["BehaviorProfile"]);
          for (const id of aiEntities) {
            const behavior = this.world.getComponent(id, "BehaviorProfile");
            if (behavior) {
              behavior.maxAggroDistance = aggro;
              behavior.disengageRange = disengage;
            }
          }
          this.log(`Aggro set: max=${aggro}, disengage=${disengage} on ${aiEntities.length} entities`);
        }
      },
    };
  }

  handleKeyDown(e) {
    if (e.key === "Enter") {
      const command = this.input.value.trim();
      if (command) {
        this.executeCommand(command);
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
      }
      this.input.value = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.commandHistory[this.historyIndex];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.input.value = this.commandHistory[this.historyIndex];
      } else {
        this.historyIndex = this.commandHistory.length;
        this.input.value = "";
      }
    } else if (e.key === "Escape") {
      this.hide();
    }
  }

  executeCommand(commandStr) {
    this.log(`> ${commandStr}`);

    const parts = commandStr.split(" ");
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    const command = this.commands[cmdName];
    if (command) {
      try {
        command.execute(args);
      } catch (e) {
        this.error(`Error executing command: ${e.message}`);
      }
    } else {
      this.error(`Unknown command: ${cmdName}. Type 'help' for available commands.`);
    }
  }

  log(message) {
    const line = document.createElement("div");
    line.textContent = message;
    line.style.color = "#00ff00";
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
    this.history.push(message);
  }

  error(message) {
    const line = document.createElement("div");
    line.textContent = `ERROR: ${message}`;
    line.style.color = "#ff0000";
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
    this.history.push(message);
  }

  show() {
    this.visible = true;
    this.container.style.display = "flex";
    this.input.focus();
  }

  hide() {
    this.visible = false;
    this.container.style.display = "none";
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  parseCoordsOrPlayerOffset(args, dx = 0, dy = 0) {
    let x;
    let y;
    if (args.length >= 2) {
      x = parseFloat(args[0]);
      y = parseFloat(args[1]);
    }
    if (Number.isNaN(x) || Number.isNaN(y) || x === undefined || y === undefined) {
      const t = this.world.getComponent(this.world.player, "Transform");
      x = t ? t.x + dx : 0;
      y = t ? t.y + dy : 0;
    }
    return { x, y };
  }
}
