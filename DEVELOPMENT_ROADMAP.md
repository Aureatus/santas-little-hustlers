# Santa's Little Hustlers - Development Roadmap

## 🎯 Priority Features to Implement

### Phase 1: Core Building Expansion
**Goal: Add meaningful progression depth with new building types**

#### 1. Research Lab
- **Purpose**: Unlock permanent upgrades that persist through sessions
- **Features**:
  - Faster production speed research
  - Reduced upgrade costs research  
  - Increased coin value research
  - Special building abilities research
- **Implementation**: New upgrade tree system with research points
- **Files to modify**: `Building.ts`, `GameScene.ts`, new `ResearchSystem.ts`

#### 2. Cookie Bakery
- **Purpose**: Consumable resource management for temporary boosts
- **Features**:
  - Bake cookies using gold coins
  - Feed cookies to elves for temporary production multipliers
  - Cookie quality affects boost duration/strength
  - Visual cookie consumption animations
- **Implementation**: New resource type + buff system
- **Files to modify**: `Building.ts`, `EconomySystem.ts`, new `BuffSystem.ts`

#### 3. Gift Wrapping Station
- **Purpose**: Passive coin value multiplier
- **Features**:
  - Automatically adds percentage bonus to collected coins
  - Upgradeable wrapping quality (1%, 2%, 5%, 10% bonuses)
  - Visual wrapping animations when coins pass through
  - Different wrapping paper styles at higher levels
- **Implementation**: Passive multiplier system
- **Files to modify**: `Building.ts`, `Coin.ts`, `EconomySystem.ts`

#### 4. Elf Dormitory
- **Purpose**: Foundation for future elf management
- **Features**:
  - Increases maximum elf capacity
  - Provides passive happiness bonus
  - Visual elf housing animations
  - Prepares for future elf hiring system
- **Implementation**: Simple capacity system + visual elements
- **Files to modify**: `Building.ts`, `GameScene.ts`

#### 5. Reindeer Stables Expansion
- **Purpose**: Active gameplay enhancement
- **Features**:
  - Increases coin collection speed/range
  - Reindeer delivery animations
  - Upgradeable stable capacity
  - Visual reindeer movement around workshop
- **Implementation**: Modify player collection mechanics
- **Files to modify**: `Building.ts`, `Player.ts`, `Coin.ts`

---

### Phase 2: Workshop Customization
**Goal: Give players creative control over their workshop layout**

#### 6. Drag & Drop Building System
- **Purpose**: Allow players to customize workshop layout
- **Features**:
  - Click and drag buildings to reposition
  - Grid-based placement system (snap to grid)
  - Building collision detection
  - Save/load custom layouts
  - Visual placement validation (green/red overlays)
- **Implementation**: New interaction system + grid system
- **Files to modify**: `GameScene.ts`, `Building.ts`, new `GridSystem.ts`

#### 7. Decorations System
- **Purpose**: Visual personalization with gameplay benefits
- **Features**:
  - Buy festive decorations (lights, ornaments, snowmen, candy canes)
  - Place decorations anywhere in workshop
  - Decorations provide small morale/productivity bonuses
  - Different decoration categories with different effects
  - Seasonal decoration unlocks
- **Implementation**: New entity type + placement system
- **Files to modify**: `GameScene.ts`, new `Decoration.ts`, `UIManager.ts`

---

### Phase 3: Visual & Audio Polish
**Goal: Enhance the sensory experience and make the world feel alive**

#### 8. Enhanced Building Animations
- **Purpose**: Make buildings feel active and productive
- **Features**:
  - Each building shows production cycle animations
  - Moving parts, smoke, sparks, magical effects
  - Different animations per building type
  - Animation speed scales with building level
  - Idle animations when not producing
- **Implementation**: Expand procedural graphics + animation system
- **Files to modify**: `AssetCreator.ts`, `Building.ts`, `EnvironmentRenderer.ts`

#### 9. Upgraded Particle System
- **Purpose**: Add visual flair and feedback to all actions
- **Features**:
  - More coin collection effects (sparkles, trails)
  - Building upgrade particles (different colors per building type)
  - Weather particles (enhanced snow, sparkles, magic dust)
  - Magic aura effects for high-level buildings
  - Particle effects scale with building level
- **Implementation**: Expand particle system
- **Files to modify**: `EnvironmentRenderer.ts`, `Building.ts`, `ChristmasTree.ts`

#### 10. Audio Experience
- **Purpose**: Complete the sensory experience
- **Features**:
  - Background Christmas music playlist
  - Building-specific sound effects (toy making, gift wrapping, etc.)
  - Coin collection sounds with pitch variation
  - UI interaction sounds (clicks, upgrades, errors)
  - Ambient workshop sounds (hammering, machinery, elf chatter)
- **Implementation**: Full audio system integration
- **Files to modify**: `AudioManager.ts`, `GameScene.ts`, `Building.ts`

---

## 🚀 Implementation Order Rationale

### Why This Order?

1. **Buildings First**: Core gameplay loop needs more depth before customization
2. **Customization Second**: Once players have more buildings, they'll want to organize them
3. **Polish Last**: Audio/visual enhancements have maximum impact when game is feature-complete

### Dependencies:
- **Research Lab** → Enables deeper strategy for all other buildings
- **Cookie Bakery** → Adds resource management layer
- **Drag & Drop** → Becomes more valuable with more buildings to place
- **Audio/Visual** → Best added when core features are stable

### Estimated Timeline:
- **Phase 1**: 2-3 weeks (5 new building types)
- **Phase 2**: 1-2 weeks (customization systems)
- **Phase 3**: 1-2 weeks (polish and audio)

---

## 📝 Development Notes

### Technical Considerations:
- **Performance**: More buildings + particles + audio = need optimization
- **Save System**: New features require save format expansion
- **UI Scaling**: More buildings need better UI organization
- **Mobile Prep**: Drag & drop should work with touch controls

### Asset Strategy:
- **Procedural Graphics**: Continue using generated graphics for consistency
- **Animation System**: Build reusable animation components
- **Audio Compression**: Optimize for web delivery

### Testing Priorities:
- **Save/Load**: Test with all new building types
- **Performance**: Monitor FPS with many buildings + particles
- **Mobile**: Touch controls for drag & drop
- **Balance**: Ensure new buildings don't break economy

---

## ✅ Completion Checklist

### Phase 1: Building Expansion
- [ ] Research Lab with upgrade tree
- [ ] Cookie Bakery with buff system
- [ ] Gift Wrapping Station with multipliers
- [ ] Elf Dormitory with capacity system
- [ ] Reindeer Stables with collection bonuses

### Phase 2: Workshop Customization
- [ ] Drag & drop building system
- [ ] Grid-based placement
- [ ] Decoration shop and placement
- [ ] Custom layout save/load

### Phase 3: Visual & Audio Polish
- [ ] Building production animations
- [ ] Enhanced particle effects
- [ ] Complete audio system
- [ ] Ambient workshop sounds

---

*Last Updated: December 2025*
*Game: Santa's Little Hustlers*