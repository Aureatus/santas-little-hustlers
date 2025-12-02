# Elf Economy Tycoon

A Christmas-themed tycoon game where you manage Santa's workshop! Collect coins, build toy-making machines, and expand your festive operation.

## Game Features

### Visual Polish
- **Festive Christmas world** with snow-covered ground and falling snowflakes
- **Particle effects** for coin collection and building upgrades
- **Smooth animations** for buildings and UI elements
- **Floating damage numbers** showing coin collection

### Gameplay
- **Interactive Christmas Tree** - Click to shake coins loose! (2 second cooldown)
- **Playable elf character** that moves smoothly around the workshop
- **Repair & Unlock System** - 10 pre-placed broken buildings in a compact workshop!
- **Progressive Unlocking** - Repair buildings in order to unlock your workshop
- **Deep upgrade system** - Click active buildings to level them up infinitely!
- **Visual upgrade progression** - Level badges grow and change color (Gold → Orange → Red → Purple)
- **Passive income generation** - Buildings produce coins over time
- **Income indicators** shown above each building
- **Compact workshop layout** - Focused, action-packed area

### Economy & Progression
- **Save/Load system** - Your progress is automatically saved
- **Offline earnings** - Earn coins while away (up to 1 hour)
- **Exponential scaling** - Buildings get more powerful with each upgrade
- **Strategic depth** - Choose which buildings to buy and upgrade

### User Interface
- **Direct building interaction** - Click broken buildings to repair them
- **Building info panels** showing stats and upgrade costs for active buildings
- **Floating repair prompts** on broken buildings showing cost
- **Real-time stats** displaying coins, income rate, and building count
- **Rich visual feedback** - Particles, animations, floating text for all actions
- **Broken/Active states** - Clear visual distinction between repaired and broken buildings
- **Reset button** - Start fresh with a confirmation dialog

## Buildings (10 Total)

**Starter Tier:**
1. **Toy Maker** x2 - Cost: 100 | Income: 5/s - *Crafts wooden toys*
2. **Gift Wrapper** x2 - Cost: 250 | Income: 15/s - *Wraps presents beautifully*

**Mid Tier:**
3. **Cookie Factory** x2 - Cost: 500 | Income: 35/s - *Bakes festive cookies*
4. **Elf House** x2 - Cost: 1,000 | Income: 100/s - *Houses productive elves*

**Advanced Tier:**
5. **Reindeer Stable** - Cost: 2,500 | Income: 250/s - *Trains magical reindeer*
6. **Santa's Office** - Cost: 100,000 | Income: 10,000/s - *The big man himself!*

**Upgrade System:**
- Each building can be upgraded infinitely!
- Upgrade cost: `baseCost * 2^level`
- Income multiplier: `1.5^(level-1)`
- Level badges change color and size based on level

## Controls

- **WASD** or **Arrow Keys** - Move your elf around
- **Left Click Christmas Tree** - Shake it for coins! (3-5 coins worth 15 each)
- **Left Click Broken Buildings** - Repair them (if it's the next in sequence)
- **Left Click Active Buildings** - Open upgrade panel
- **S** - Manual save (also auto-saves every 30 seconds)
- **Walk over coins** to collect them automatically

## How to Play

### Early Game
1. **Click the Christmas tree** to shake coins out (your main income source!)
2. **Walk over the coins** to collect them
3. **Click the first broken building** (glowing repair prompt) to repair it for 100 coins
4. **Watch it come to life** and start generating passive income!
5. **Keep clicking the tree** and save up for the next building
6. **Repair all 10 buildings** to complete your workshop

### Late Game (Upgrade Focus!)
6. **Click active buildings** to open the upgrade panel
7. **Level up buildings** to exponentially increase income
8. **Watch level badges change color** as you progress (Gold → Orange → Red → Purple)
9. **Strategic choices**: Upgrade high-income buildings or diversify?
10. **Infinite progression** - There's no level cap!

## Setup & Running

Install dependencies:
```bash
bun install
```

Run the development server:
```bash
bun run dev
```

The game will open in your browser at `http://localhost:3000`

Build for production:
```bash
bun run build
```

## Project Structure

```
elf_economy/
├── src/
│   ├── main.ts                      # Game entry point
│   ├── scenes/
│   │   └── GameScene.ts             # Main game scene (orchestrator)
│   ├── entities/
│   │   ├── Player.ts                # Player character
│   │   ├── Building.ts              # Building classes & data
│   │   └── Coin.ts                  # Collectible coins
│   ├── systems/
│   │   ├── EconomySystem.ts         # Currency & income management
│   │   └── BuildingManager.ts      # Building placement & slots
│   ├── ui/
│   │   ├── UIManager.ts             # Main UI overlay
│   │   ├── BuildMenu.ts             # Building purchase menu
│   │   └── BuildingInfoPanel.ts    # Upgrade panel
│   ├── utils/
│   │   ├── SaveManager.ts           # Save/load functionality
│   │   ├── AudioManager.ts          # Sound system (ready for audio)
│   │   └── AssetCreator.ts          # Procedural graphics
│   └── rendering/
│       └── EnvironmentRenderer.ts   # Background & effects
├── public/                          # Static assets
├── index.html                       # HTML entry point
└── package.json
```

## Adding Custom Assets

The game currently uses procedurally generated graphics. To add your own sprites:

1. Place image files in the `public/` directory
2. Update `AssetCreator.ts` to load images instead of generating them:
   ```typescript
   scene.load.image('player', 'assets/elf.png');
   scene.load.image('coin', 'assets/coin.png');
   scene.load.image('toy_maker', 'assets/buildings/toy_maker.png');
   ```

## Adding Audio

The game has an AudioManager ready for sounds. To add audio:

1. Place audio files in `public/audio/`
2. Load them in `GameScene.ts`:
   ```typescript
   this.load.audio('bgm_christmas', 'audio/christmas_music.mp3');
   this.load.audio('sfx_coin', 'audio/coin_collect.mp3');
   this.load.audio('sfx_build', 'audio/building_placed.mp3');
   ```
3. Uncomment the audio calls in `GameScene.ts`

## Implemented Features ✅

- ✅ Particle effects for coins and buildings
- ✅ Falling snow animation
- ✅ Building upgrade system with exponential scaling
- ✅ 10 different building types
- ✅ Save/load with localStorage
- ✅ Offline earnings calculation
- ✅ Floating text feedback
- ✅ Interactive UI with hover effects
- ✅ Income indicators on buildings
- ✅ Modular, clean architecture

## Future Enhancement Ideas

- 🎵 Background music and sound effects
- 🏆 Achievements and milestones system
- 🎁 Special events (golden coins, bonuses)
- 📊 Statistics tracking (total earned, buildings built)
- 🎨 Prestige/rebirth system for late game
- 🌙 Day/night cycle
- 🎮 More interactive mini-games
- 📱 Mobile touch controls optimization

## Tech Stack

- **Phaser 3** - Game engine
- **TypeScript** - Type-safe game code
- **Vite** - Fast build tool and dev server
- **Bun** - Fast JavaScript runtime and package manager

Enjoy building your elf empire!
