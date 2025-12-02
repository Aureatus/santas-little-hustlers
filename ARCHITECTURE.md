# Elf Economy Tycoon - Architecture

## Overview

The game follows a modular architecture with clear separation of concerns. The main GameScene acts as an orchestrator that delegates to specialized systems.

## Core Systems

### GameScene (Orchestrator)
- Coordinates all other systems
- Handles game loop (update)
- Manages scene lifecycle
- Sets up input handlers

### Economy System
**Location:** `src/systems/EconomySystem.ts`

Manages all currency and financial operations:
- Track current coins
- Track total earned (statistics)
- Add/spend coins with validation
- Calculate passive income from all buildings
- Process income each game tick

### Building Manager
**Location:** `src/systems/BuildingManager.ts`

Handles building placement and slot management:
- Initialize 28 grid-based building slots (7x4)
- Place buildings in available slots
- Restore buildings from save data
- Track slot occupancy

## UI Components

### UIManager
**Location:** `src/ui/UIManager.ts`

Main HUD overlay displaying:
- Current coin count
- Income per second
- Building count
- Floating text feedback (coin collection, saves, upgrades)

### BuildMenu
**Location:** `src/ui/BuildMenu.ts`

Building purchase interface:
- Shows all 10 building types in a scrollable menu
- Displays cost, income, and description
- Validates affordability and slot availability
- Handles purchase callbacks

### BuildingInfoPanel
**Location:** `src/ui/BuildingInfoPanel.ts`

Building upgrade interface:
- Shows building name, level, and current income
- Calculates and displays upgrade cost
- Handles upgrade purchases
- Visual feedback on hover

## Entities

### Player
**Location:** `src/entities/Player.ts`

The playable elf character:
- WASD/Arrow key movement
- Smooth velocity-based movement
- World bounds collision

### Building
**Location:** `src/entities/Building.ts`

Individual workshop buildings:
- 10 different types with unique stats
- Level system with exponential scaling
- Income calculation: `baseIncome * 1.5^(level-1)`
- Upgrade cost: `baseCost * 2^level`
- Visual indicators (income text, level badge)
- Particle effects on upgrade
- Coin spawning based on income rate
- Interactive (click to show info panel)

### Coin
**Location:** `src/entities/Coin.ts`

Collectible currency:
- Spawn with particle effects
- Float and rotate animations
- 10-second lifespan before fading
- Collection triggers particles and floating text
- Configurable value

## Utilities

### SaveManager
**Location:** `src/utils/SaveManager.ts`

Handles persistence:
- Save to localStorage
- Load from localStorage
- Calculate offline earnings (max 1 hour)
- JSON serialization of game state

### AudioManager
**Location:** `src/utils/AudioManager.ts`

Ready for audio integration:
- Play background music (looping)
- Play sound effects
- Volume controls (music/sfx separate)
- Stop/pause functionality

### AssetCreator
**Location:** `src/utils/AssetCreator.ts`

Procedural graphics generation:
- Creates all textures at runtime
- Player sprite (elf with red hat)
- Coin sprite (golden circle)
- 10 building sprites (unique designs)
- Snowflake particle
- Can be replaced with actual image assets

## Rendering

### EnvironmentRenderer
**Location:** `src/rendering/EnvironmentRenderer.ts`

Scene background and effects:
- Snow-covered ground with grid pattern
- Wooden border fence
- Snow drift decorations
- Falling snow particle system

## Data Flow

```
User Input
    ↓
GameScene (Orchestrator)
    ↓
├─→ EconomySystem (coins, income)
├─→ BuildingManager (placement, slots)
├─→ UIManager (display updates)
└─→ SaveManager (persistence)
```

## Save Data Structure

```typescript
interface SaveData {
  coins: number;
  totalEarned: number;
  lastSaveTime: number;
  buildings: Array<{
    type: BuildingType;
    x: number;
    y: number;
    level: number;
    slotIndex: number;
  }>;
}
```

## Game Loop

1. **Update (60 FPS)**
   - Player movement
   - Building update (coin spawn timers)

2. **Income Tick (1/second)**
   - Calculate total income from all buildings
   - Add coins to player
   - Trigger coin spawns from buildings

3. **Autosave (30 seconds)**
   - Serialize game state
   - Save to localStorage

## Extension Points

### Adding New Buildings
1. Add enum to `BuildingType` in `Building.ts`
2. Add data to `BUILDING_DATA` with cost/income/description
3. Add sprite generation in `AssetCreator.ts`
4. That's it! The UI automatically updates

### Adding Audio
1. Load audio files in `GameScene.preload()`
2. Uncomment audio calls throughout `GameScene.ts`
3. AudioManager handles playback

### Adding New UI Panels
1. Create class in `src/ui/`
2. Follow pattern from `BuildingInfoPanel.ts`
3. Initialize in `GameScene.create()`

## Performance Considerations

- Particle emitters auto-destroy after animation
- Coins auto-destroy after 10 seconds
- UI elements use depth sorting for proper layering
- Save throttled to 30-second intervals
- Offline earnings capped at 1 hour to prevent exploitation

## Testing

To test specific features:

```typescript
// In browser console after game loads
scene = game.scene.scenes[0];

// Give yourself coins
scene.economy.addCoins(100000);

// Clear save data
SaveManager.clear();
```
