import { GLYPHS_ARRAY, GlyphManager } from "../core/glyphs";
import {
  GridContainer,
  GridConfig,
  GridContainerConfig,
} from "./GridContainer";

/**
 * Default grid configuration for the glyph values board
 */
const GLYPH_VALUES_GRID_CONFIG: GridConfig = {
  cellBorderColor: 0xffffff,
  cellBorderWidth: 1,
  cellPadding: 5,
  columnWidths: [50, 50, 80],
  headerHeight: 30,
  rowHeight: 30,
  rows: GLYPHS_ARRAY.length,
  columns: 3,
};

/**
 * A component that displays glyph values in a grid format
 */
export class GlyphValuesBoard extends GridContainer {
  /**
   * Constructor
   * @param config Configuration for the glyph values board
   */
  constructor(config: Partial<GridContainerConfig> = {}) {
    // Set default grid configuration specific to glyph values
    const glyphValuesConfig: Partial<GridContainerConfig> = {
      ...config,
      gridConfig: {
        ...GLYPH_VALUES_GRID_CONFIG,
        ...config.gridConfig,
      },
    };

    super(glyphValuesConfig);

    // Draw the grid with glyph values
    this.drawGlyphValuesGrid();
  }

  /**
   * Draw the grid with glyph values
   */
  private drawGlyphValuesGrid(): void {
    // Clear the grid
    this.clearGrid();

    // Draw header row
    // this.drawHeaderRow(['Symbol', 'Value', 'Weight %']);

    // Draw data rows
    this.drawGlyphRows();
  }

  /**
   * Draw the glyph data rows
   */
  private drawGlyphRows(): void {
    // Draw data rows
    GLYPHS_ARRAY.forEach((symbol, index) => {
      // Row index is index + 1 (since row 0 is the header)
      const rowIndex = index;

      // Column 1: Symbol emoji
      this.addCellText(symbol.emoji, rowIndex, 0);

      // Column 2: Payout value
      this.addCellText(symbol.payoutValue.toString(), rowIndex, 1);

      // Column 3: Weight percentage
      this.addCellText(
        GlyphManager.getGlyphWeightPercentage(symbol.type).toFixed(2) + "%",
        rowIndex,
        2,
      );
    });
  }

  /**
   * Update the grid configuration and redraw the grid
   * @param gridConfig New grid configuration
   */
  public override updateGridConfig(gridConfig: Partial<GridConfig>): void {
    // Call the parent method to update the configuration
    super.updateGridConfig(gridConfig);

    // Redraw the grid with the new configuration
    this.drawGlyphValuesGrid();
  }

  /**
   * Resize the container
   * @param width New width
   * @param height New height
   */
  public override resize(width: number, height: number): void {
    // Call the parent method to resize the container
    super.resize(width, height);

    // Redraw the grid with the new size
    this.drawGlyphValuesGrid();
  }
}
