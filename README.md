# Javascript Platformer Concepts

A **zero-dependency 2D platformer** built with pure JavaScript, HTML Canvas, and ECS (Entity-Component-System) architecture. No external libraries—just hand-crafted game engine fundamentals.

## 🎮 [Play Demo](https://your-username.github.io/vanilla-platformer-js/)

## 🎯 Project Goals

- **Pure Vanilla JS**: No Phaser, Pixi, or any runtime libraries
- **ECS Architecture**: Data-driven design with modular components and systems
- **Tiled Integration**: Level loading from Tiled JSON exports
- **Fixed Timestep**: Deterministic 60Hz physics simulation
- **AABB Collision**: Per-axis collision resolution
- **Educational**: Learn game engine fundamentals from scratch

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/vanilla-platformer-js.git
cd vanilla-platformer-js
```

### Vite Dev Server (recommended)
```bash
npm install
npm run dev      # http://localhost:5173
# Build for static hosting
npm run build
npm run preview  # Serve the built bundle for final check
```

### Simple static server (legacy)
```bash
python -m http.server 8000
# OR
npx http-server
```

# Open http://localhost:8000
```

## 🎮 Controls

| Input | Action |
|-------|--------|
| **WASD** / **Arrow Keys** | Move left/right, look up/down |
| **Space** | Jump |
| **F1** | Toggle debug overlay |
| **F2** | Toggle hitboxes |
| **F3** | Slow motion (0.25x speed) |
| **F4** | Toggle tile grid |
| **`** (Backtick) | Pause/unpause |
| **.** (Period) | Frame step (when paused) |
| **F6** | Debug panel (toggles overlay controls) |
| **F7** | Level menu (pick/load levels, respawn; includes procedural levels) |


## 🏗️ Architecture

### ECS Core
- **Entities**: Unique IDs with component bitmasks
- **Components**: Pure data structures (`Transform`, `Velocity`, `AABB`, etc.)
- **Systems**: Single-responsibility logic processors

### Update Pipeline
```
Input → Physics → Collision → AI → Camera → Render
```

### Key Systems
- **InputSystem**: Keyboard state management
- **PhysicsSystem**: Semi-implicit Euler integration
- **CollisionSystem**: Per-axis AABB resolution
- **RenderSystem**: Canvas drawing with layers
- **LevelSystem**: Tiled JSON loading pipeline

## 📁 Project Structure

```
vanilla-platformer-js/
├── index.html              # Main entry point
├── styles.css              # Base styling
├── src/
│   ├── main.js             # Game bootstrap & loop
│   ├── config.js           # Physics constants & tunables
│   ├── debug.js            # Debug flags & profiler
│   ├── input.js            # Keyboard input management
│   ├── core/               # Engine utilities
│   │   ├── math.js         # AABB, clamp, lerp functions
│   │   ├── events.js       # Event bus (pub/sub)
│   │   └── ...
│   ├── ecs/                # ECS framework
│   │   ├── world.js        # Entity registry & queries
│   │   ├── components.js   # Component definitions
│   │   └── systems.js      # Base system class
│   ├── systems/            # Game logic systems
│   │   ├── input-system.js
│   │   ├── physics-system.js
│   │   ├── collision-system.js
│   │   ├── render-system.js
│   │   └── ...
│   ├── entities/           # Entity factories
│   └── render/             # Rendering utilities
└── assets/
    ├── maps/               # Tiled JSON levels
    ├── tilesets/           # Tileset JSON + PNG
    ├── characters/         # Character manifests & sprites
    ├── items/              # Collectibles & props
    ├── backgrounds/        # Parallax layers
    └── audio/              # SFX & music
```

## 🎨 Asset Pipeline

### Tiled Integration
Create levels using [Tiled Map Editor](https://www.mapeditor.org/):

1. **Required Layers**:
   - `TilesBG` - Background decoration
   - `TilesSolids` - Collision layer
   - `TilesFG` - Foreground decoration
   - `Objects` - Entity spawn points

2. **Tileset Properties**:
   ```json
   { "name": "solid", "type": "bool", "value": true }
   ```

3. **Object Types**:
   - `PlayerSpawn` - Player starting position
   - `EnemyBasic` - Patrolling enemy
   - `Coin` - Collectible item
   - `Goal` - Level exit
   - `Hazard` - Damage zone

### Character System
Per-action image approach with manifest files:

```json
{
  "name": "hero",
  "aabb": { "w": 16, "h": 24 },
  "actions": {
    "idle": { "image": "idle.png", "origin": [8, 24] },
    "run": { "image": "run.png", "origin": [8, 24] },
    "jump": { "image": "jump.png", "origin": [8, 24] },
    "fall": { "image": "fall.png", "origin": [8, 24] }
  }
}
```

## ⚙️ Configuration

Physics parameters in `src/config.js`:

```javascript
export const PHYSICS = {
  GRAVITY_Y: 1800,        // Gravity acceleration
  MOVE_ACCEL: 1500,       // Horizontal acceleration
  MAX_RUN_SPEED: 180,     // Maximum run speed
  JUMP_VELOCITY: -520,    // Jump initial velocity
  COYOTE_TIME: 0.08,      // Edge jump tolerance
  JUMP_BUFFER: 0.08       // Jump input buffer
};
```

## 🐛 Debug Features

### Overlay Information (F1)
- FPS and frame time
- System performance profiling
- Entity counts and collision stats
- Player position and velocity
- Physics flags (onGround, hitWall, etc.)

### Visual Debugging
- **F2**: Entity hitboxes and collision bounds
- **F3**: Slow motion for collision analysis
- **F4**: Tile grid overlay
- **`**: Pause simulation, **.**  step frame-by-frame

### Developer Console
```javascript
// Available in browser console
debug.tp(x, y)           // Teleport player
debug.seed(12345)        // Set random seed
debug.replayExport()     // Export input recording
debug.give('coin', 5)    // Give items
```

## 🚦 Development Workflow

### Stage-based Development
Current implementation follows a staged approach:

- **Stage 0**: Scaffold & ECS foundation
- **Stage 1**: Player movement & physics
- **Stage 2**: AABB collision system ✅
- **Stage 3**: Camera follow & scrolling
- **Stage 4**: Tiled JSON level loading
- **Stage 5**: Collectibles & HUD
- **Stage 6**: Enemies & health system
- **Stage 7**: Visual & audio polish
- **Stage 8**: Build & deployment

### Git Workflow
```bash
# Feature development
git checkout -b feature/stage3-camera-follow
git commit -m "feat(camera): add dead zone following"

# Stage completion
git checkout develop
git merge --no-ff feature/stage3-camera-follow
git tag v0.1.0 -m "Stage 3: Camera system complete"
```

## 🏗️ Build & Deploy

### Local Development
```bash
# Simple HTTP server (required for CORS)
python -m http.server 8000
```

### Production Build
```bash
# Build script copies files and disables debug
rm -rf dist && mkdir -p dist
cp index.html styles.css dist/
cp -R src assets dist/
sed -i 's/export const DEBUG = true/export const DEBUG = false/' dist/src/debug.js
```

### GitHub Pages Deployment
Automated via `.github/workflows/pages.yml`:
- Triggers on version tags (`v*`)
- Builds static files to `dist/`
- Deploys to GitHub Pages

## 📋 Manual Testing Checklist

### Core Physics
- [ ] Smooth acceleration/deceleration
- [ ] Consistent jump height
- [ ] Proper gravity feel
- [ ] No penetration through platforms
- [ ] Edge jump behavior (coyote time)

### Collision System
- [ ] No wall sticking at high speeds
- [ ] Proper ground detection
- [ ] Ceiling collision stops upward movement
- [ ] Per-axis resolution prevents tunneling

### Camera System
- [ ] Dead zone prevents jitter
- [ ] Map boundary clamping
- [ ] No visual tearing at pixel boundaries

### Level Loading
- [ ] Tiled JSON loads without errors
- [ ] Objects spawn at correct positions
- [ ] Unknown object types log warnings only
- [ ] Tileset properties correctly parsed

## 🧪 Performance Targets

- **60 FPS** on desktop browsers (Chrome, Firefox, Edge)
- **<16.6ms** total frame time
- **<4ms** collision system overhead
- **<8ms** rendering system overhead
- Zero garbage collection spikes during gameplay

### Code Style
- **All code and comments in English**
- **Conventional Commits**: `feat(collision): add per-axis resolution`
- **ES Modules** with explicit imports/exports
- **PascalCase** for classes, **camelCase** for variables
- **UPPER_SNAKE_CASE** for constants

## 📖 Documentation

Comprehensive documentation available in `/docs/`:
- [Project Architecture](docs/platformer_專案架構.md)
- [Level Format & Tools](docs/Platformer-%20Level%20Format%20&%20Tools.md)
- [Roadmap & Milestones](docs/Platformer-%20Roadmap%20&%20Milestones.md)
- [Coding Standards](docs/Platformer-%20Coding%20Standards%20&%20Review%20Checklist.md)
- [QA & Playtest Plan](docs/Platformer-%20QA%20&%20Playtest%20Plan.md)
- [Debug & Instrumentation](docs/Platformer-%20Debug%20&%20Instrumentation.md)

## 📊 Current Status

### ✅ Completed Features
- ECS architecture foundation
- Fixed timestep game loop (60Hz)
- Keyboard input system
- Semi-implicit Euler physics
- Per-axis AABB collision resolution
- Debug overlay with profiling
- Tile-based collision detection

### 🚧 In Progress
- Camera follow system with dead zones
- Tiled JSON level loading pipeline
- Character animation state machine

### 📋 Planned Features
- Collectible items & HUD system
- Basic enemy AI with patrol behavior
- Health/damage system with respawn
- Audio system (SFX & background music)
- Build pipeline & GitHub Pages deployment

## 🎮 Level Editor Support

Compatible with **Tiled Map Editor**:
1. Create orthogonal maps with 16×16 tile size
2. Use named layers: `TilesBG`, `TilesSolids`, `TilesFG`, `Objects`
3. Set tileset properties for collision detection
4. Export as JSON format (not TMX)
5. Place objects with appropriate `type` properties

## 🔧 Troubleshooting

### Common Issues

**Black screen with console errors**:
- Ensure you're serving via HTTP (not file://)
- Check browser console for CORS errors
- Verify asset paths use relative URLs

**Stuttering or low FPS**:
- Open debug overlay (F1) to check system profiling
- Try slow motion (F3) to analyze performance bottlenecks
- Reduce tile density or visible area

**Collision glitches**:
- Enable hitbox visualization (F2)
- Use frame stepping (` then .) to analyze collision resolution
- Check MTV clamping and per-axis ordering

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
