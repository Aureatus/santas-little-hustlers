import * as Phaser from 'phaser';
import { Building } from '../entities/Building';

export interface GridCell {
  x: number;
  y: number;
  occupied: boolean;
  building?: Building;
}

export class GridSystem {
  private scene: Phaser.Scene;
  private cellSize: number = 80;
  private gridWidth: number;
  private gridHeight: number;
  private grid: GridCell[][] = [];
  private gridGraphics?: Phaser.GameObjects.Graphics;
  private draggedBuilding?: Building;
  private dragOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, width: number, height: number) {
    this.scene = scene;
    this.gridWidth = Math.ceil(width / this.cellSize);
    this.gridHeight = Math.ceil(height / this.cellSize);
    
    this.initializeGrid();
    this.createGridVisual();
  }

  private initializeGrid() {
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        row.push({
          x: x * this.cellSize + this.cellSize / 2,
          y: y * this.cellSize + this.cellSize / 2,
          occupied: false
        });
      }
      this.grid.push(row);
    }
  }

  private createGridVisual() {
    this.gridGraphics = this.scene.add.graphics();
    this.gridGraphics.setDepth(1);
    this.updateGridVisual();
  }

  private updateGridVisual() {
    if (!this.gridGraphics) return;
    
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x333333, 0.3);
    
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;
        
        this.gridGraphics.strokeRect(cellX, cellY, this.cellSize, this.cellSize);
      }
    }
  }

  addBuilding(building: Building) {
    const gridPos = this.worldToGrid(building.x, building.y);
    if (this.isValidPosition(gridPos.x, gridPos.y)) {
      const cell = this.grid[gridPos.y][gridPos.x];
      cell.occupied = true;
      cell.building = building;
      
      // Update building position to snap to grid
      building.x = cell.x;
      building.y = cell.y;
      
      this.updateGridVisual();
      return true;
    }
    return false;
  }

  removeBuilding(building: Building) {
    const gridPos = this.worldToGrid(building.x, building.y);
    if (this.isValidGridPosition(gridPos.x, gridPos.y)) {
      const cell = this.grid[gridPos.y][gridPos.x];
      if (cell.building === building) {
        cell.occupied = false;
        cell.building = undefined;
        this.updateGridVisual();
      }
    }
  }

  startDrag(building: Building, pointer: Phaser.Input.Pointer) {
    this.draggedBuilding = building;
    this.dragOffset = {
      x: pointer.x - building.x,
      y: pointer.y - building.y
    };
    
    // Remove from grid
    this.removeBuilding(building);
    
    // Bring to front
    building.getSprite().setDepth(100);
  }

  updateDrag(pointer: Phaser.Input.Pointer) {
    if (!this.draggedBuilding) return;
    
    const rawX = pointer.x - this.dragOffset.x;
    const rawY = pointer.y - this.dragOffset.y;
    const clamped = this.clampToBounds(rawX, rawY);
    
    this.draggedBuilding.x = clamped.x;
    this.draggedBuilding.y = clamped.y;
    
    // Show placement preview
    this.showPlacementPreview(clamped.x, clamped.y);
  }

  endDrag() {
    if (!this.draggedBuilding) return;
    
    const gridPos = this.worldToGrid(this.draggedBuilding.x, this.draggedBuilding.y);
    
    if (this.isValidPosition(gridPos.x, gridPos.y)) {
      this.addBuilding(this.draggedBuilding);
    } else {
      // Return to original position or find valid position
      this.returnToValidPosition(this.draggedBuilding);
    }
    
    // Reset depth
    this.draggedBuilding.getSprite().setDepth(5);
    
    this.hidePlacementPreview();
    this.draggedBuilding = undefined;
  }

  private showPlacementPreview(x: number, y: number) {
    this.hidePlacementPreview();
    
    const gridPos = this.worldToGrid(x, y);
    const isValid = this.isValidPosition(gridPos.x, gridPos.y);
    
    const preview = this.scene.add.graphics();
    preview.setDepth(99);
    preview.lineStyle(2, isValid ? 0x00ff00 : 0xff0000, 0.5);
    preview.strokeRect(
      gridPos.x * this.cellSize,
      gridPos.y * this.cellSize,
      this.cellSize,
      this.cellSize
    );
    
    // Store reference for cleanup
    (this as any).placementPreview = preview;
  }

  private hidePlacementPreview() {
    if ((this as any).placementPreview) {
      (this as any).placementPreview.destroy();
      (this as any).placementPreview = undefined;
    }
  }

  private returnToValidPosition(building: Building) {
    // Find nearest valid position
    for (let radius = 1; radius < Math.max(this.gridWidth, this.gridHeight); radius++) {
      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          if (this.isValidPosition(x, y)) {
            const cell = this.grid[y][x];
            building.x = cell.x;
            building.y = cell.y;
            this.addBuilding(building);
            return;
          }
        }
      }
    }
  }
 
  private clampToBounds(x: number, y: number): { x: number; y: number } {
    const minX = this.cellSize / 2;
    const maxX = (this.gridWidth * this.cellSize) - (this.cellSize / 2);
    const minY = this.cellSize / 2;
    const maxY = (this.gridHeight * this.cellSize) - (this.cellSize / 2);
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY)
    };
  }
 
  private worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    const clamped = this.clampToBounds(worldX, worldY);
    return {
      x: Math.floor(clamped.x / this.cellSize),
      y: Math.floor(clamped.y / this.cellSize)
    };
  }


  private isValidPosition(gridX: number, gridY: number): boolean {
    return this.isValidGridPosition(gridX, gridY) && !this.grid[gridY][gridX].occupied;
  }

  private isValidGridPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
  }

  getCellSize(): number {
    return this.cellSize;
  }

  destroy() {
    if (this.gridGraphics) {
      this.gridGraphics.destroy();
    }
    this.hidePlacementPreview();
  }
}