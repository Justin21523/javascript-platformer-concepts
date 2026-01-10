# Stable Diffusion Prompt 提示詞庫
# Complete Prompt Library for Game Assets

**專案 Project**: JavaScript Platformer Game
**風格 Style**: Cartoon 2D (非像素風格 NO PIXEL ART)
**版本 Version**: 1.0
**日期 Date**: 2025-11-13

---

## 📋 目錄 Table of Contents

1. [通用提示詞模板](#通用提示詞模板)
2. [角色 NPC Prompts](#角色-npc-prompts)
3. [敵人角色 Prompts](#敵人角色-prompts)
4. [Boss 角色 Prompts](#boss-角色-prompts)
5. [特效 VFX Prompts](#特效-vfx-prompts)
6. [發射物 Projectile Prompts](#發射物-projectile-prompts)
7. [物品道具 Item Prompts](#物品道具-item-prompts)
8. [地圖 Tileset Prompts](#地圖-tileset-prompts)
9. [UI 元素 Prompts](#ui-元素-prompts)
10. [提示詞權重技巧](#提示詞權重技巧)

---

## 🎨 通用提示詞模板

### 基礎正面提示詞 (所有素材共用)

```
masterpiece, best quality, high quality, professional game art,
clean design, bright vibrant colors, thick black outline,
cartoon style, cel shading, soft lighting, centered composition
```

### 基礎負面提示詞 (所有素材共用)

```
pixel art, pixelated, 8-bit, retro style, mosaic, low resolution,
blurry, fuzzy, out of focus, realistic, photograph, photorealistic,
3d render, complex background, landscape, scenery, signature,
watermark, text, logo, artist name, grainy, noise, jpeg artifacts,
worst quality, low quality, normal quality, multiple characters,
speech bubble, frame border, messy, cluttered
```

### 透明背景強化詞

```
transparent background, no background, alpha channel, PNG format,
isolated subject, white background (會被移除), clean cutout
```

---

## 👥 角色 NPC Prompts

### 模板結構

```
[基礎品質] + [角色描述] + [動作狀態] + [風格特徵] + [技術要求]
```

### NPC 1: 村民 Villager

#### Idle 動作 (10 幀)

**Positive Prompt**:
```
masterpiece, best quality, game character sprite, friendly villager NPC,
simple medieval clothing, brown tunic, kind face, smiling expression,
idle stance, standing still, subtle breathing animation,
full body view, cartoon style, thick black outline (2px),
bright warm colors, clean design, kawaii friendly style,
transparent background, soft cel shading, professional game asset,
centered, front view
```

**Negative Prompt**:
```
pixel art, pixelated, 8-bit, retro, realistic, 3d render,
complex details, armor, weapons, angry, scary, dark colors,
background, scenery, multiple characters, speech bubble
```

**幀數配置**: 10 frames
**解析度**: 768x768
**Seed**: 固定 (第一幀後記錄)

#### Walk 動作 (8 幀)

```
masterpiece, best quality, game character sprite, friendly villager NPC,
simple medieval clothing, brown tunic, walking animation,
side view, clear leg movement, balanced walk cycle,
full body view, cartoon style, thick black outline,
bright warm colors, transparent background, clean design,
professional game asset, smooth animation
```

**幀數**: 8 frames

#### Talk 動作 (8 幀)

```
masterpiece, best quality, game character sprite, friendly villager NPC,
simple medieval clothing, talking animation, hand gestures,
expressive face, slight body movement, friendly demeanor,
full body view, cartoon style, thick black outline,
bright warm colors, transparent background, kawaii style
```

**幀數**: 8 frames

---

### NPC 2: 商人 Merchant

#### Idle (10 幀)

```
masterpiece, best quality, game merchant NPC sprite,
rich merchant clothing, colorful vest, money bag, coin purse,
idle stance, confident posture, slight sway,
full body view, cartoon style, thick black outline,
bright vibrant colors, gold accents, clean design,
transparent background, professional game asset, friendly face
```

#### Trade 動作 (8 幀)

```
masterpiece, best quality, game merchant NPC sprite,
showing items, presenting goods, trade animation,
holding objects, welcoming gesture, merchant clothing,
full body view, cartoon style, thick black outline,
bright colors, transparent background, clean design
```

---

### NPC 3: 任務發布者 Quest Giver

#### Idle (10 幀)

```
masterpiece, best quality, game quest giver NPC sprite,
wise elder clothing, staff or scroll, mystical appearance,
idle stance, thoughtful pose, slight magical glow,
full body view, cartoon style, thick black outline,
bright mystical colors, purple and blue accents,
transparent background, professional game asset
```

#### Quest Available 動作 (8 幀)

```
masterpiece, best quality, game quest giver NPC sprite,
exclamation mark effect, excited gesture, holding quest scroll,
animated pose, magical sparkles, glowing effect,
full body view, cartoon style, thick black outline,
bright colors, transparent background, clean design
```

---

### NPC 4: 鐵匠 Blacksmith

#### Idle (10 幀)

```
masterpiece, best quality, game blacksmith NPC sprite,
blacksmith apron, muscular build, hammer in hand,
idle stance near anvil, slight breathing animation,
full body view, cartoon style, thick black outline,
brown and grey colors, metal textures, clean design,
transparent background, professional game asset
```

#### Hammer 動作 (8 幀)

```
masterpiece, best quality, game blacksmith NPC sprite,
hammering animation, striking anvil, sparks flying,
dynamic motion, strong pose, blacksmith at work,
full body view, cartoon style, thick black outline,
bright sparks, orange glow, transparent background
```

---

## 👹 敵人角色 Prompts

### 敵人 1: 史萊姆 Slime

#### Idle (10 幀)

```
masterpiece, best quality, game enemy sprite, cute blue slime character,
jelly body, simple rounded blob shape, glossy surface,
idle animation, subtle bounce, wobbling motion,
full body view, cartoon style, thick black outline (2-3px),
bright blue color, shiny highlights, soft shadows,
transparent background, kawaii style, clean design,
professional game asset, centered composition
```

**配置**:
- 幀數: 10 frames
- 解析度: 768x768 (64x64 遊戲內)
- 顏色: 亮藍色 (#4A90E2)
- 邊框: 2-3px 黑色粗線

#### Walk (8 幀)

```
masterpiece, best quality, game enemy sprite, cute blue slime character,
jelly body, walking animation, bouncing movement,
side view, stretching and squashing motion, fluid movement,
full body view, cartoon style, thick black outline,
bright blue color, transparent background, clean design
```

**幀數**: 8 frames

#### Attack (6 幀)

```
masterpiece, best quality, game enemy sprite, cute blue slime character,
jelly body, attack animation, lunging forward,
aggressive bounce, stretching motion, impact pose,
full body view, cartoon style, thick black outline,
bright blue color, motion blur effect, transparent background
```

**幀數**: 6 frames

#### Death (10 幀)

```
masterpiece, best quality, game enemy sprite, cute blue slime character,
jelly body, death animation, dissolving effect,
fading away, splashing motion, defeated pose,
full body view, cartoon style, thick black outline,
bright blue fading to transparent, clean design
```

**幀數**: 10 frames

---

### 敵人 2: 骷髏戰士 Skeleton Warrior

#### Idle (10 幀)

```
masterpiece, best quality, game enemy sprite, skeleton warrior character,
white bones, simple skull face, cartoon skeleton,
holding rusty sword, idle stance, slight sway,
full body view, cartoon style, thick black outline,
white and grey bones, red eye glow, simple armor pieces,
transparent background, clean design, not scary, game friendly
```

**配置**:
- 幀數: 10 frames
- 解析度: 768x768 (72x96 遊戲內)
- 顏色: 白色骨頭 + 紅色眼睛

#### Walk (8 幀)

```
masterpiece, best quality, game enemy sprite, skeleton warrior,
white bones, walking animation, marching motion,
side view, clear bone movement, sword held ready,
full body view, cartoon style, thick black outline,
white bones, transparent background, clean design
```

#### Attack (8 幀)

```
masterpiece, best quality, game enemy sprite, skeleton warrior,
white bones, sword swing attack animation,
aggressive slash motion, dynamic pose, weapon trail effect,
full body view, cartoon style, thick black outline,
white bones, red eye glow, transparent background
```

#### Death (12 幀)

```
masterpiece, best quality, game enemy sprite, skeleton warrior,
white bones, death animation, bones falling apart,
collapsing motion, pieces separating, defeated pose,
full body view, cartoon style, thick black outline,
white bones scattering, transparent background
```

---

### 敵人 3: 蝙蝠 Bat

#### Idle (8 幀)

```
masterpiece, best quality, game enemy sprite, cute purple bat creature,
small cartoon bat, large wings folded, hanging upside down,
idle animation, slight wing flutter, cute face,
full body view, cartoon style, thick black outline,
purple body, pink wing membrane, yellow eyes,
transparent background, kawaii style, clean design
```

**配置**:
- 幀數: 8 frames
- 解析度: 512x512 (48x48 遊戲內)

#### Fly (8 幀)

```
masterpiece, best quality, game enemy sprite, cute purple bat creature,
small cartoon bat, flying animation, wings spread,
flapping motion, smooth flight, aerial movement,
full body view, cartoon style, thick black outline,
purple body, pink wings, transparent background
```

#### Attack (6 幀)

```
masterpiece, best quality, game enemy sprite, cute purple bat creature,
dive attack animation, swooping down, aggressive flight,
fast motion, wings folded back, impact pose,
full body view, cartoon style, thick black outline,
purple body, transparent background, motion lines
```

---

### 敵人 4: 哥布林 Goblin

#### Idle (10 幀)

```
masterpiece, best quality, game enemy sprite, green goblin character,
small mischievous goblin, pointed ears, simple clothing,
idle stance, sneaky posture, holding crude weapon,
full body view, cartoon style, thick black outline,
bright green skin, brown ragged clothes, yellow eyes,
transparent background, kawaii evil style, clean design
```

#### Walk (8 幀)

```
masterpiece, best quality, game enemy sprite, green goblin character,
sneaking walk animation, tiptoeing motion,
hunched posture, weapon ready, side view,
full body view, cartoon style, thick black outline,
green skin, transparent background, clean design
```

---

### 敵人 5: 幽靈 Ghost

#### Float (10 幀)

```
masterpiece, best quality, game enemy sprite, cute white ghost character,
simple ghost shape, floating motion, wavy body,
idle floating animation, gentle bobbing, friendly spooky,
full body view, cartoon style, thick black outline,
white semi-transparent body, blue glow, simple face,
transparent background, kawaii ghost, clean design
```

**配置**:
- 幀數: 10 frames
- 特效: 半透明白色 + 藍色光暈

---

## 👑 Boss 角色 Prompts

### Boss 1: 龍王 Dragon Boss

#### Idle (12 幀)

```
masterpiece, best quality, game boss sprite, large dragon character,
mighty dragon, red scales, golden horns, powerful wings,
idle stance, breathing animation, imposing presence,
full body view, cartoon style, thick black outline (3-4px),
bright red and gold colors, glowing eyes, fire effects,
transparent background, epic but cute style, clean design,
professional game asset, centered, large size
```

**配置**:
- 幀數: 12 frames
- 解析度: 1024x1024 (128x128 遊戲內)
- 特色: 比敵人更大更精細

#### Attack1 - Fire Breath (10 幀)

```
masterpiece, best quality, game boss sprite, large dragon character,
fire breath attack animation, breathing flames,
head rearing back, mouth open, fire stream,
full body view, cartoon style, thick black outline,
red dragon, orange flames, glowing effect,
transparent background, dynamic pose, clean design
```

#### Attack2 - Claw Swipe (8 幀)

```
masterpiece, best quality, game boss sprite, large dragon character,
claw swipe attack animation, powerful slash motion,
wing spread, aggressive pose, sharp claws extended,
full body view, cartoon style, thick black outline,
red scales, motion blur, transparent background
```

#### Hurt (8 幀)

```
masterpiece, best quality, game boss sprite, large dragon character,
hurt animation, recoiling from damage, pain expression,
defensive pose, slight flash effect, stumbling motion,
full body view, cartoon style, thick black outline,
red dragon, damage indicators, transparent background
```

#### Death (15 幀)

```
masterpiece, best quality, game boss sprite, large dragon character,
death animation, defeated pose, collapsing motion,
fading away, epic fall, explosion particles,
full body view, cartoon style, thick black outline,
red dragon dissolving, light particles, transparent background
```

---

### Boss 2: 機械巨人 Mechanical Giant

#### Idle (12 幀)

```
masterpiece, best quality, game boss sprite, large mechanical robot,
giant machine boss, metal body, glowing core,
idle stance, mechanical breathing, gear movements,
full body view, cartoon style, thick black outline,
grey metal, blue glowing parts, steam effects,
transparent background, clean design, professional game asset
```

---

## ✨ 特效 VFX Prompts

### 戰鬥特效 Combat Effects

#### Slash Effect (8 幀)

```
masterpiece, best quality, game VFX sprite, sword slash effect,
blue energy slash trail, arc motion, curved path,
speed lines, motion blur, glowing blade trail,
no character, effect only, transparent background,
bright blue and white colors, high contrast,
cel shading, clean design, professional game effect,
animation frame, dynamic energy
```

**配置**:
- 幀數: 8 frames
- 解析度: 512x512 (64x64 遊戲內)
- 顏色: 亮藍色 + 白色

#### Hit Impact (6 幀)

```
masterpiece, best quality, game VFX sprite, hit impact effect,
white spark burst, star shapes, radial explosion,
impact lines, energy flash, shockwave circle,
no character, effect only, transparent background,
white and yellow colors, high contrast, glowing,
clean design, animation frame, sharp edges
```

**幀數**: 6 frames

#### Punch Impact (8 幀)

```
masterpiece, best quality, game VFX sprite, punch impact effect,
orange impact burst, radial lines, force waves,
comic book style impact, POW effect, energy ripples,
no character, effect only, transparent background,
orange and white colors, high contrast, bold design
```

#### Spark Effect (8 幀)

```
masterpiece, best quality, game VFX sprite, electric spark effect,
lightning sparks, crackling electricity, small bolts,
yellow electric arcs, energy particles, static discharge,
no character, effect only, transparent background,
bright yellow and white, high contrast, glowing
```

---

### 爆炸特效 Explosion Effects

#### Small Explosion (10 幀)

```
masterpiece, best quality, game VFX sprite, small explosion effect,
cartoon explosion, orange and yellow flames, smoke clouds,
radial burst, fire particles, expanding circle,
no character, effect only, transparent background,
bright orange red yellow colors, high contrast,
cel shading, clean design, animation frame
```

**配置**:
- 幀數: 10 frames
- 解析度: 512x512 (64x64 遊戲內)

#### Medium Explosion (12 幀)

```
masterpiece, best quality, game VFX sprite, medium explosion effect,
larger cartoon explosion, big fireball, thick smoke,
radial burst pattern, fire and smoke mix, expanding blast,
no character, effect only, transparent background,
bright orange yellow red, high contrast, glowing core
```

**幀數**: 12 frames
**解析度**: 768x768 (96x96 遊戲內)

#### Large Explosion (15 幀)

```
masterpiece, best quality, game VFX sprite, large explosion effect,
massive cartoon explosion, huge fireball, debris particles,
shockwave rings, fire and smoke mushroom cloud,
epic blast, radial burst, expanding flames,
no character, effect only, transparent background,
bright intense colors, orange red yellow white, high contrast
```

**幀數**: 15 frames
**解析度**: 1024x1024 (128x128 遊戲內)

---

### 煙霧特效 Smoke Effects

#### Dust Cloud (8 幀)

```
masterpiece, best quality, game VFX sprite, dust cloud effect,
brown dust particles, ground impact dust, puff cloud,
dissipating smoke, particle scatter, light dust,
no character, effect only, transparent background,
brown and grey colors, soft edges, fading effect
```

#### Smoke Trail (10 幀)

```
masterpiece, best quality, game VFX sprite, smoke trail effect,
grey smoke clouds, trailing smoke, wispy tendrils,
dissipating motion, flowing smoke, particle fade,
no character, effect only, transparent background,
grey and white smoke, soft gradients, clean design
```

---

### 收集物品特效 Pickup Effects

#### Coin Sparkle (8 幀)

```
masterpiece, best quality, game VFX sprite, coin collect sparkle effect,
golden sparkles, shiny stars, glittering particles,
circular burst pattern, twinkling lights, magical shine,
no character, effect only, transparent background,
bright gold and yellow colors, high contrast, glowing,
clean design, kawaii style, animation frame
```

**幀數**: 8 frames

#### Star Shine (10 幀)

```
masterpiece, best quality, game VFX sprite, star collect effect,
rainbow sparkles, colorful stars, magical particles,
spiral pattern, glowing stars, shimmering lights,
no character, effect only, transparent background,
rainbow colors, bright and vibrant, high contrast
```

#### Item Glow Loop (12 幀)

```
masterpiece, best quality, game VFX sprite, item glow aura effect,
gentle pulsing glow, circular aura, magical shimmer,
looping animation, soft light rays, particle float,
no character, effect only, transparent background,
soft gold and white glow, subtle animation, clean design
```

**Loop**: true (循環動畫)

---

### 魔法特效 Magic Effects

#### Heal Effect (10 幀)

```
masterpiece, best quality, game VFX sprite, healing magic effect,
green sparkles, upward floating particles, health restoration,
soft glow, gentle light, plus symbols, heart particles,
no character, effect only, transparent background,
bright green and white, soft edges, magical aura
```

#### Buff Effect (12 幀)

```
masterpiece, best quality, game VFX sprite, power up buff effect,
golden aura, upward energy stream, strength particles,
glowing rings, power symbols, magical enhancement,
no character, effect only, transparent background,
bright gold and orange, high contrast, glowing effect
```

#### Teleport Effect (10 幀)

```
masterpiece, best quality, game VFX sprite, teleportation effect,
purple magic circle, warping portal, dimensional rift,
energy swirl, particle vortex, mystical symbols,
no character, effect only, transparent background,
purple and blue colors, glowing, magical design
```

---

## 🎯 發射物 Projectile Prompts

### 子彈 Bullet (靜態)

```
masterpiece, best quality, game projectile sprite, energy bullet,
simple rounded bullet shape, glowing core, blue energy,
horizontal orientation, side view, clean design,
no character, projectile only, transparent background,
bright blue color, white glow, high contrast,
professional game asset, centered, small size
```

**配置**:
- 動畫: false
- 解析度: 256x128 (16x8 遊戲內)

---

### 箭矢 Arrow (4 幀動畫)

```
masterpiece, best quality, game projectile sprite, wooden arrow,
sharp metal tip, wooden shaft, feather fletching,
horizontal orientation, side view, slight rotation,
no character, projectile only, transparent background,
brown wood, silver tip, white feathers, clean design,
professional game asset, centered
```

**幀數**: 4 frames (旋轉動畫)

---

### 火球 Fireball (6 幀動畫)

```
masterpiece, best quality, game projectile sprite, fireball,
burning sphere, orange flames, trailing fire particles,
glowing core, fire trail, magical fireball,
horizontal motion, side view, dynamic flames,
no character, projectile only, transparent background,
bright orange red yellow, high contrast, glowing effect
```

**幀數**: 6 frames

---

### 魔法球 Magic Orb (8 幀動畫)

```
masterpiece, best quality, game projectile sprite, magic orb,
purple energy sphere, glowing ball, magical sparkles,
pulsing animation, particle trail, mystical energy,
horizontal orientation, rotating motion, glowing core,
no character, projectile only, transparent background,
bright purple and pink, high contrast, magical aura
```

**幀數**: 8 frames

---

### 雷射光束 Laser (3 幀動畫)

```
masterpiece, best quality, game projectile sprite, laser beam,
bright blue energy beam, straight line, glowing edges,
pulsing animation, electric crackle, sci-fi laser,
horizontal orientation, elongated shape, intense glow,
no character, projectile only, transparent background,
bright cyan and white, very high contrast, glowing effect
```

**幀數**: 3 frames (脈衝動畫)

---

## 🎁 物品道具 Item Prompts

### 金幣 Coins

#### Gold Coin (8 幀 - 旋轉動畫)

```
masterpiece, best quality, game item sprite, gold coin,
shiny golden coin, dollar sign symbol, circular shape,
rotation animation, spinning coin, glittering surface,
item only, no character, transparent background,
bright gold color, yellow highlights, white sparkles,
clean design, professional game asset, centered,
high contrast, metallic shine
```

**幀數**: 8 frames (360° 旋轉)

#### Silver Coin

```
masterpiece, best quality, game item sprite, silver coin,
shiny silver coin, star symbol, circular shape,
rotation animation, spinning coin, metallic surface,
item only, transparent background, bright silver color,
white highlights, clean design, professional game asset
```

---

### 藥水 Potions

#### Health Potion

```
<lora:game-icon-institute:0.8>, health potion icon,
red glowing liquid, glass bottle, cork stopper,
heart symbol on label, magical glow effect,
item only, no character, transparent background,
bright red liquid, glass reflection, white highlights,
clean design, professional game icon, centered,
high detail, sharp edges
```

**配置**:
- 使用 LoRA: game-icon-institute (0.8)
- 解析度: 256x256 (32x32 遊戲內)

#### Mana Potion

```
<lora:game-icon-institute:0.8>, mana potion icon,
blue glowing liquid, glass bottle, magic sparkles,
star symbol on label, mystical aura effect,
item only, transparent background, bright blue liquid,
glass reflection, clean design, professional game icon
```

#### Stamina Potion

```
<lora:game-icon-institute:0.8>, stamina potion icon,
yellow glowing liquid, glass bottle, lightning symbol,
energy particles, dynamic glow effect,
item only, transparent background, bright yellow liquid,
clean design, professional game icon
```

---

### 能量道具 Power-ups

#### Speed Boost

```
<lora:game-icon-institute:0.8>, speed boost power-up icon,
green wing symbol, glowing aura, motion lines,
magical particles, energy swirl effect,
item only, transparent background, bright green color,
white glow, clean design, professional game icon
```

#### Shield Power-up

```
<lora:game-icon-institute:0.8>, shield power-up icon,
blue shield symbol, protective aura, defense emblem,
glowing barrier effect, magical protection,
item only, transparent background, bright blue color,
clean design, professional game icon
```

#### Attack Boost

```
<lora:game-icon-institute:0.8>, attack power-up icon,
red sword symbol, flame aura, strength particles,
power enhancement effect, glowing weapon,
item only, transparent background, bright red and orange,
clean design, professional game icon
```

---

### 收集品 Collectibles

#### Star

```
masterpiece, best quality, game collectible sprite, golden star,
shiny five-pointed star, glittering surface, sparkle effect,
rotation animation, twinkling star, magical glow,
item only, transparent background, bright gold and yellow,
high contrast, clean design, professional game asset
```

**幀數**: 8 frames (旋轉 + 閃爍)

#### Gem

```
masterpiece, best quality, game collectible sprite, magical gem,
faceted crystal, rainbow colors, shimmering light,
glowing core, sparkle particles, precious stone,
item only, transparent background, bright rainbow colors,
high contrast, clean design, professional game asset
```

#### Key

```
<lora:game-icon-institute:0.8>, golden key item icon,
ornate key design, magical glow, key to unlock,
decorative handle, shiny metal, glittering effect,
item only, transparent background, bright gold color,
clean design, professional game icon
```

---

## 🗺️ 地圖 Tileset Prompts

### 草地地形 Grass Tiles

#### 基礎草地 Basic Grass

```
masterpiece, best quality, game tileset, grass terrain tile,
bright green grass texture, top-down view, seamless tile,
small grass blades, flowers scattered, clean pattern,
no character, environment only, transparent edges,
cartoon style, bright green color, simple design,
professional game tileset, 32x32 tile, clean edges
```

**配置**:
- 解析度: 256x256 (32x32 遊戲內)
- 需要: 無縫拼接 (seamless)

#### 草地變化 Grass Variations

```
masterpiece, best quality, game tileset, grass terrain variations,
different grass patterns, scattered rocks, small flowers,
top-down view, seamless tiles, tileable texture,
bright green grass, cartoon style, clean design,
professional game tileset, variety pack
```

---

### 泥土地形 Dirt Tiles

```
masterpiece, best quality, game tileset, dirt terrain tile,
brown dirt texture, top-down view, seamless tile,
small pebbles, dirt patches, earthy texture,
no character, environment only, transparent edges,
cartoon style, brown color, simple design,
professional game tileset, 32x32 tile
```

---

### 石頭地形 Stone Tiles

```
masterpiece, best quality, game tileset, stone floor tile,
grey cobblestone texture, top-down view, seamless tile,
stone pattern, cracks and gaps, medieval floor,
no character, environment only, clean edges,
cartoon style, grey stone color, simple design,
professional game tileset, 32x32 tile
```

---

### 水面 Water Tiles

```
masterpiece, best quality, game tileset, water surface tile,
blue water texture, top-down view, seamless tile,
gentle ripples, light reflection, flowing water,
animated water surface, no character, clean edges,
cartoon style, bright blue color, simple waves,
professional game tileset, 32x32 tile
```

**幀數**: 8 frames (水波動畫)

---

### 平台 Platforms

#### 木製平台 Wooden Platform

```
masterpiece, best quality, game platform sprite,
wooden plank platform, brown wood texture, side view,
sturdy construction, simple design, flat top surface,
no character, platform only, transparent background,
cartoon style, brown wood color, thick black outline,
clean design, professional game asset
```

#### 石製平台 Stone Platform

```
masterpiece, best quality, game platform sprite,
grey stone platform, brick texture, side view,
solid construction, medieval stone, flat surface,
no character, platform only, transparent background,
cartoon style, grey stone, thick black outline,
clean design, professional game asset
```

---

### 裝飾物 Decorations

#### 樹木 Trees

```
masterpiece, best quality, game environment sprite, cartoon tree,
round green tree canopy, brown trunk, simple shape,
side view, decorative element, friendly design,
no character, environment only, transparent background,
bright green leaves, brown trunk, thick black outline,
clean design, professional game asset
```

#### 灌木 Bushes

```
masterpiece, best quality, game environment sprite, cartoon bush,
round green bush, simple leaf texture, decorative plant,
side view, small size, friendly design,
no character, environment only, transparent background,
bright green color, thick black outline, clean design
```

#### 岩石 Rocks

```
masterpiece, best quality, game environment sprite, cartoon rock,
round grey boulder, simple stone texture, decorative obstacle,
side view, various sizes, natural design,
no character, environment only, transparent background,
grey stone color, thick black outline, clean design
```

---

## 🎮 UI 元素 Prompts

### 按鈕 Buttons

#### Play Button

```
<lora:game-icon-institute:0.7>, game UI play button,
green rounded rectangle button, white play symbol,
glossy surface, slight 3D effect, clickable appearance,
no character, UI element only, transparent background,
bright green color, white icon, clean design,
professional game UI, modern style
```

#### Settings Button

```
<lora:game-icon-institute:0.7>, game UI settings button,
blue rounded square button, white gear symbol,
glossy surface, clickable appearance, modern design,
no character, UI element only, transparent background,
bright blue color, white icon, clean design
```

---

### 生命條 Health Bar

```
masterpiece, best quality, game UI health bar,
red heart-shaped bar, green to red gradient, HP display,
glossy surface, border outline, modern design,
no character, UI element only, transparent background,
red and green colors, clean design, professional game UI
```

---

### 圖標 Icons

#### Attack Icon

```
<lora:game-icon-institute:0.8>, game UI attack icon,
red sword symbol, simple weapon icon, action button,
circular background, glossy effect, clear symbol,
no character, UI icon only, transparent background,
red color, white symbol, clean design
```

#### Defense Icon

```
<lora:game-icon-institute:0.8>, game UI defense icon,
blue shield symbol, protection icon, circular background,
glossy effect, clear symbol, modern design,
no character, UI icon only, transparent background,
blue color, white symbol, clean design
```

---

## 🎯 提示詞權重技巧

### 權重語法

```
(keyword)           # 1.1x 權重
((keyword))         # 1.21x 權重
(((keyword)))       # 1.331x 權重
(keyword:1.5)       # 1.5x 權重 (推薦精確控制)
[keyword]           # 0.9x 權重 (減弱)
```

### 實際應用範例

```
# 強調透明背景
(transparent background:1.3), ((no background)), [white background:0.5]

# 強調風格
((cartoon style:1.2)), (thick black outline:1.3), [realistic:0.1]

# 強調顏色
(bright vibrant colors:1.2), ((high contrast:1.1))

# 減弱不想要的元素
[complex details:0.5], [realistic texture:0.3]
```

### 組合範例

```
masterpiece, best quality, (game character sprite:1.2),
((cute blue slime:1.3)), (jelly body:1.1), idle pose,
((cartoon style:1.2)), (thick black outline:1.3),
(bright vibrant colors:1.2), ((transparent background:1.4)),
[realistic:0.1], [3d render:0.2], clean design

Negative:
((pixel art:1.5)), ((pixelated:1.5)), (8-bit:1.3),
realistic, photograph, [cartoon:0], complex background
```

---

## 📊 配置建議表

### 不同素材類型的推薦設定

| 素材類型 | 解析度 | 幀數 | Steps | CFG | LoRA |
|---------|--------|------|-------|-----|------|
| 大型角色 (Player/Boss) | 1024x1024 | 10-15 | 30 | 7 | - |
| 中型角色 (Enemy/NPC) | 768x768 | 8-10 | 28 | 7 | - |
| 小型角色 (Small Enemy) | 512x512 | 8 | 25 | 7 | - |
| 特效 VFX | 512x512 | 6-12 | 25 | 7 | - |
| 發射物 | 256x256 | 1-8 | 25 | 7 | - |
| 物品圖標 | 256x256 | 1 | 28 | 7 | 0.8 |
| 地圖 Tile | 256x256 | 1-8 | 25 | 6 | - |
| UI 元素 | 256x256 | 1 | 25 | 7 | 0.7 |

---

## ✅ 快速參考清單

### 生成前檢查

- [ ] 模型: AnythingXL_v50
- [ ] VAE: sdxl_vae.safetensors
- [ ] Sampler: DPM++ 2M Karras
- [ ] 解析度符合素材類型
- [ ] Seed 已記錄 (連續幀)
- [ ] 提示詞包含 "transparent background"
- [ ] 負面提示詞包含 "pixel art, pixelated"

### 後處理流程

1. 生成完成 → 檢查品質
2. 記錄 Seed (用於後續幀)
3. 批次生成所有幀
4. 使用 `batch_remove_bg.py` 移除背景
5. 調整大小到遊戲解析度
6. 整合到 assets/ 資料夾
7. 更新 config JSON

---

**Last Updated**: 2025-11-13
**Total Prompts**: 100+ (涵蓋所有素材類型)
**維護者 Maintainer**: LLMProvider Tooling AI
