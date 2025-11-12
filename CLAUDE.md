# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **zero-dependency 2D platformer** built with pure JavaScript using ECS (Entity-Component-System) architecture. No external libraries—everything is hand-crafted from scratch including the game engine, physics, collision detection, and rendering.

## Development Commands

### Running Locally
```bash
# Serve with Python (required for ES modules and asset loading)
python -m http.server 8000

# OR use Node.js http-server
npx http-server

# Then open http://localhost:8000
```

### Production Build
```bash
# Manual build process (no build tools)
rm -rf dist && mkdir -p dist
cp index.html styles.css dist/
cp -R src assets dist/
sed -i 's/export const DEBUG = true/export const DEBUG = false/' dist/src/debug.js
```

### Testing
- Manual testing only (no automated test framework)
- Use debug overlay (F1) to monitor system performance
- Use frame stepping (` then .) for precise debugging
- Refer to README.md "Manual Testing Checklist" section

## Core Architecture

### ECS Pattern

**Entity**: Unique integer ID with component bitmask for fast queries
**Components**: Pure data structures (no logic) stored in separate Maps per type
**Systems**: Single-responsibility processors that operate on entities with specific component combinations

Component bitmask example:
```javascript
// Each component has a unique bit flag
Transform.bit = 1 << 0  // 0b0001
Velocity.bit = 1 << 1   // 0b0010
AABB.bit = 1 << 2       // 0b0100

// Entity with Transform + Velocity has mask: 0b0011
world.query(["Transform", "Velocity"]) // Returns entities with both components
```

### Update Pipeline Order

The main game loop runs systems in strict order (see `src/main.js:120-136`):

1. **InputSystem**: Captures keyboard state snapshot
2. **PhysicsSystem**: Applies gravity, friction, and integrates velocity
3. **CollisionSystem**: Per-axis AABB collision resolution with tile map
4. **CameraSystem**: Updates camera position with dead zone and smoothing
5. **RenderSystem**: Draws entities and tiles with camera offset

**Critical**: Systems must run in this order. Changing the order will break physics or collision detection.

### Fixed Timestep

The game uses a fixed 60Hz timestep (1/60s) for deterministic physics:
- Rendering happens every frame (variable rate)
- Physics updates accumulate delta time and run in fixed steps
- Multiple physics steps can occur in one render frame if needed

### Component Storage

Components are stored in `world.componentStorage[ComponentName]` as Maps:
```javascript
// Adding a component
world.addComponent(entityId, "Transform", { x: 100, y: 50 });

// Retrieving a component
const transform = world.getComponent(entityId, "Transform");
transform.x += 10; // Direct mutation is standard practice

// Querying entities
const entities = world.query(["Transform", "Velocity"]);
```

### Collision System Details

**Per-axis AABB resolution** (`src/systems/collision-system.js`):
1. Apply X-axis movement and check collisions
2. If collision detected, resolve X position and zero X velocity
3. Apply Y-axis movement and check collisions
4. If collision detected, resolve Y position and zero Y velocity

This prevents tunneling and diagonal sliding issues. The collision system exposes flags via `world.collisionFlags`:
- `onGround`: Entity is touching ground below
- `hitWall`: Entity hit a wall horizontally
- `hitCeil`: Entity hit ceiling above

Other systems (e.g., CharacterSystem) read these flags to determine valid actions like jumping.

### Camera System

The camera follows entities with `CameraFollow` component using:
- **Dead zone**: Rectangle where target can move without camera following
- **Smoothing**: Interpolated movement for smooth tracking (0=instant, 1=no movement)
- **Priority system**: Multiple entities can be followed; highest priority wins
- **World clamping**: Camera stops at world boundaries with configurable margin

Camera provides world-to-screen and screen-to-world conversion methods plus visibility culling via `isVisible()`.

## Key Configuration

All tunables are in `src/config.js`:

**PHYSICS**: Gravity, acceleration, max speeds, jump velocity, coyote time, jump buffering
**RENDER**: Canvas dimensions, colors
**COLLISION**: Tile size (16px), MTV clamp distance, collision epsilon
**CAMERA**: Dead zone dimensions, smoothing factor, clamp margins

**Important**: When adjusting physics values, test with slow motion (F3) and frame stepping to verify behavior.

## Debug System

Debug flags in `src/debug.js` control features without code changes:

### Debug Hotkeys
- **F1**: Toggle performance overlay (FPS, system timings, entity counts)
- **F2**: Toggle hitbox visualization (AABBs and collision boxes)
- **F3**: Toggle slow motion (0.25x speed for analyzing collisions)
- **F4**: Toggle tile grid overlay
- **`** (Backtick): Pause simulation
- **.** (Period): Frame step when paused

### Profiler Usage
```javascript
profiler.start("systemName");
// ... system logic ...
profiler.end("systemName");

// Results displayed in overlay or retrieved via:
const duration = profiler.getResult("systemName");
```

### Debug Logging
```javascript
debugLog("system", "message", optionalData);
// Output: [timestamp] [system] message optionalData
```

## File Organization

```
src/
├── main.js                 # Game bootstrap, main loop, system initialization
├── config.js               # All tunables and constants (modify here first)
├── debug.js                # Debug flags, profiler, logging utilities
├── input.js                # Keyboard state management
├── ecs/
│   ├── world.js            # Entity registry, component storage, queries
│   ├── components.js       # Component definitions and factories
│   └── systems.js          # Base system class (currently unused)
├── systems/
│   ├── input-system.js     # Transfers keyboard state to Input component
│   ├── physics-system.js   # Velocity integration, gravity, friction
│   ├── collision-system.js # Per-axis AABB resolution vs tile map
│   ├── camera-system.js    # Dead zone following with smoothing
│   └── render-system.js    # Canvas drawing with camera offset
├── core/
│   ├── math.js             # AABB overlap, clamp, lerp functions
│   ├── events.js           # Event bus (pub/sub pattern)
│   ├── time.js             # Time utilities
│   └── profiler.js         # Performance measurement
├── world/
│   └── tiles.js            # TileMap class for collision grid
└── render/
    ├── camera.js           # Camera utilities (mostly in camera-system now)
    ├── overlay.js          # Debug overlay rendering
    └── debug-draw.js       # Debug visualization helpers
```

## Adding New Components

1. Define component in `src/ecs/components.js`:
```javascript
export const NewComponent = {
  name: "NewComponent",
  bit: 1 << 8,  // Use next available bit
  schema: {
    property: defaultValue,
  },
};
```

2. Add to `ComponentBits` and `components` exports
3. Add optional factory function for convenience

## Adding New Systems

1. Create system file in `src/systems/`
2. Implement constructor and `update(dt)` method
3. Use `world.query()` to get entities with required components
4. Add system to initialization in `src/main.js`
5. Insert into update pipeline at correct position

**Example**:
```javascript
export class AISystem {
  constructor(world) {
    this.world = world;
  }

  update(dt) {
    const entities = this.world.query(["Transform", "AIController"]);
    for (const entity of entities) {
      // System logic here
    }
  }
}
```

## Tiled Integration (Planned Feature)

The project is designed to load levels from Tiled Map Editor JSON exports:

**Required layers**: TilesBG, TilesSolids, TilesFG, Objects
**Object types**: PlayerSpawn, EnemyBasic, Coin, Goal, Hazard
**Tileset properties**: Set `solid: true` on collision tiles

Level loading code will be in `src/systems/level-system.js` and `src/world/level.js`.

## Code Style

- **Language**: All code and comments in English (some Chinese comments exist from early development, prefer English for new code)
- **Commits**: Conventional Commits format: `feat(collision): add per-axis resolution`
- **Modules**: ES6 modules with explicit imports/exports
- **Naming**: PascalCase for classes, camelCase for variables/functions, UPPER_SNAKE_CASE for constants
- **Comments**: Focus on "why" not "what" - the code should be self-documenting

## Performance Targets

- **60 FPS** minimum on desktop browsers
- **<16.6ms** total frame time
- **<4ms** collision system overhead
- **<8ms** rendering system overhead
- Zero GC spikes during gameplay (reuse objects, avoid allocations in hot paths)

Use the profiler overlay (F1) to monitor actual performance.

## Git Workflow

Staged development approach:
- **Stage 0-2**: ✅ Complete (ECS, physics, collision)
- **Stage 3**: ✅ Complete (Camera system)
- **Stage 4**: 🚧 Next (Tiled JSON level loading)
- **Stage 5-8**: 📋 Planned (Collectibles, enemies, polish, deployment)

Create feature branches for each stage: `feature/stage4-level-loading`

## Common Pitfalls

1. **Modifying component data during query iteration**: Safe in this ECS implementation (no deferred operations)
2. **Changing system order**: Will break physics - maintain Input → Physics → Collision → Camera → Render
3. **Using file:// protocol**: CORS will block asset loading - must use HTTP server
4. **Forgetting to add component to bitmask exports**: Component won't be queryable
5. **Allocating objects in update loops**: Causes GC pressure - reuse objects
6. **Not clamping MTV in collision**: Can cause entities to teleport through walls at high speeds

## World Coordinate System

- **Origin**: Top-left (0, 0)
- **Units**: Pixels
- **Tile size**: 16×16 pixels
- **Positive X**: Right
- **Positive Y**: Down (standard canvas coordinates)

## Current Stage Status

**Stage 3 (Camera System)** - Complete
- Camera follows player with configurable dead zone
- Smooth interpolated movement
- World boundary clamping with margins
- Visible area culling support
- Debug visualization shows dead zone and camera bounds

**Next**: Stage 4 will implement Tiled JSON level loading to replace hardcoded tile map generation in `main.js`.
