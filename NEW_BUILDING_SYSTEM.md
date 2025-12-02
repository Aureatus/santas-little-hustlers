# New Building System - Repair & Unlock

## Overview

The grid-based placement system has been completely replaced with a **pre-placed broken building** system, inspired by mobile tycoon ads and Roblox tycoons.

## How It Works

### Pre-Placed Buildings
- **22 building spots** are pre-placed across the workshop in a natural layout
- All buildings start in a **BROKEN** state (darkened, desaturated, inactive)
- Buildings show floating "🔧 Repair" prompts with their cost
- Buildings must be repaired in **sequential order** (unlock progression)

### Repairing Buildings
1. **Click a broken building** to attempt repair
2. If it's the **next building** in the unlock order → repair it!
3. If it's not next → shows "Repair other buildings first!"
4. If you can't afford it → shows "Need X coins!"

### Visual States

#### Broken State (Default)
- Sprite is darkened (`setTint(0x666666)`)
- Reduced opacity (50%)
- Floating repair prompt showing cost
- Pulsing animation on prompt
- No income generation

#### Active State (After Repair)
- Full color and opacity
- Spawn animation (scales from 0 to 1)
- Floating animation (bobs up and down)
- Income indicator showing "+X/s"
- Level badge
- Generates passive income
- Can be clicked to upgrade

### Progression System

Buildings unlock in a predefined order (see `WorkshopLayout.ts`):

```
1. Toy Maker #1      (100 coins)
2. Toy Maker #2      (100 coins)
3. Gift Wrapper #1   (250 coins)
4. Cookie Factory #1 (500 coins)
5. Gift Wrapper #2   (250 coins)
... (continues for all 22 buildings)
22. Santa's Office   (100,000 coins)
```

### Layout

Buildings are placed naturally across the workshop:
- **Top area**: Starting buildings (cheap)
- **Middle area**: Mid-tier buildings
- **Bottom area**: High-tier buildings
- **Corners**: Premium buildings

No rigid grid! Buildings are placed at varied positions for organic feel.

## Code Architecture

### New Files

**`src/systems/WorkshopLayout.ts`**
- Defines all 22 building spots with positions and unlock order
- Helper functions to get next unlockable building
- Tracks repaired vs total count

**Updated `src/entities/Building.ts`**
- Added `BuildingState` enum (BROKEN | ACTIVE)
- Added `id` field for unique identification
- `repair()` method to transition from broken → active
- Visual state management methods
- Repair prompt creation

**Updated `src/scenes/GameScene.ts`**
- Removed `BuildingManager` and `BuildMenu`
- Uses `WorkshopLayout` for building spots
- `Map<string, Building>` for building lookup
- `attemptRepair()` validates unlock order and affordability
- Click handlers for broken vs active buildings

### Removed Files
- ❌ `src/systems/BuildingManager.ts` - No longer needed
- ❌ `src/ui/BuildMenu.ts` - No separate build menu anymore

## Gameplay Loop

### Early Game
1. Collect coins by walking around
2. Click first broken Toy Maker → Repair for 100 coins
3. It starts generating 5 coins/second
4. Save up for next building
5. Repeat!

### Mid Game
- Focus on repairing all buildings in order
- Start upgrading active buildings for more income
- Strategic choice: repair next building OR upgrade existing?

### Late Game
- All buildings repaired
- Focus on upgrading buildings to maximize income
- Exponential growth phase

## Benefits Over Grid System

### ✅ More Engaging
- Satisfying "repair" progression
- Clear goals (next building is highlighted)
- Feels like building up a real workshop

### ✅ Better for Mobile Ad Style
- Matches the aesthetic of popular tycoon ads
- Guided progression (not overwhelming)
- Visual satisfaction of repairing broken things

### ✅ Simplified Controls
- No separate build menu needed
- Just click buildings directly
- Broken = repair, Active = upgrade

### ✅ Better Pacing
- Can't spam all buildings at once
- Natural progression curve
- Forces strategic decisions

## Save System Compatibility

The save system is backward compatible:
- Uses `spotId` to identify buildings
- Falls back to position/type matching for old saves
- Stores repair status and levels

Old saves from the grid system will NOT load properly, but that's expected since it's a completely different system.

## Customization

To add more buildings, edit `WorkshopLayout.ts`:

```typescript
{ 
  id: 'unique_id', 
  type: BuildingType.YOUR_BUILDING, 
  x: 300, 
  y: 400, 
  unlockOrder: 23, 
  repaired: false 
}
```

Buildings will automatically appear broken and be added to the progression sequence!

## Visual Comparison

### Before (Grid System)
- Empty slots with placeholder boxes
- Static grid layout
- Build menu overlay
- All buildings available at once

### After (Repair System)
- Pre-placed broken buildings
- Organic layout
- Direct building interaction
- Sequential unlocking

## Player Feedback

Repair events show visual feedback:
- ✨ Particle burst on repair
- 🎉 "REPAIRED!" floating text
- 📈 Building animates to active state
- 💰 Income counter appears

This makes every repair feel rewarding and impactful!
