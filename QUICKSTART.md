# Quick Start Guide

## Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev
```

Game opens at: **http://localhost:3000**

## First Steps

1. **Move around** with WASD or Arrow keys
2. **Collect coins** by walking over them
3. **Press B** to open the build menu
4. **Buy your first building** (Toy Maker - 100 coins)
5. **Click buildings** to upgrade them
6. **Watch your income grow!**

## Tips

- Buildings generate passive income every second
- Upgrading buildings multiplies their income by 1.5x
- Click the 💾 Save button or press S to save manually
- Game auto-saves every 30 seconds
- You earn offline income (up to 1 hour) when you return

## Building Strategy

### Early Game
1. Save up for Toy Maker (100 coins)
2. Get 2-3 Toy Makers
3. Save for Gift Wrapper (250 coins)

### Mid Game
1. Focus on Cookie Factories (500 coins)
2. Start upgrading your buildings
3. Work toward Elf House (1,000 coins)

### Late Game
1. Fill all 28 building slots
2. Upgrade everything to level 3+
3. Save for Santa's Office (100,000 coins)

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move elf |
| B | Toggle build menu |
| S | Manual save |
| Left Click | Interact with buildings |

## Game Stats

- **Total buildings:** 10 types
- **Building slots:** 28
- **Max level:** Unlimited
- **Starting coins:** 50

## Troubleshooting

**Game won't load?**
- Clear browser cache
- Try incognito mode
- Check browser console for errors

**Lost progress?**
- Check if localStorage is enabled
- Press S to save manually
- Export save data from browser dev tools

**Performance issues?**
- Reduce browser zoom to 100%
- Close other tabs
- Disable browser extensions

## Development

```bash
# Type check
bun run tsc --noEmit

# Build for production
bun run build

# Preview production build
bun run preview
```

## Architecture

The game uses a modular architecture:

- **GameScene** - Orchestrator
- **EconomySystem** - Money management  
- **BuildingManager** - Placement logic
- **UIManager** - HUD updates
- **SaveManager** - Persistence

See `ARCHITECTURE.md` for full details.

## Customization

### Add Your Own Sprites

Edit `src/utils/AssetCreator.ts`:
```typescript
scene.load.image('player', 'assets/your_elf.png');
```

### Add Audio

Edit `src/scenes/GameScene.ts`:
```typescript
this.load.audio('bgm', 'audio/christmas.mp3');
this.audioManager.playMusic('bgm');
```

### Add New Buildings

Edit `src/entities/Building.ts`:
```typescript
export enum BuildingType {
  // ... existing buildings
  YOUR_BUILDING = 'your_building'
}

export const BUILDING_DATA = {
  // ... existing data
  [BuildingType.YOUR_BUILDING]: {
    name: 'Your Building',
    baseCost: 5000,
    baseIncome: 500,
    description: 'Does cool things'
  }
}
```

Then add sprite in `src/utils/AssetCreator.ts`.

## Support

- Check `README.md` for full feature list
- See `FEATURES.md` for complete documentation
- Read `ARCHITECTURE.md` for code structure
- File issues on GitHub (if applicable)

Enjoy building your elf empire! 🎄
