import * as PIXI from "pixi.js";
import logger from "../utils/logger";

/**
 * Configuration for the grid
 */
export interface GridConfig {
  cellBorderColor: number;
  cellBorderWidth: number;
  cellPadding: number;
  columnWidths: number[];
  headerHeight: number;
  rowHeight: number;
  rows: number;
  columns: number;
}

/**
 * Configuration for the grid container
 */
export interface GridContainerConfig {
  width: number;
  height: number;
  color: number;
  textColor: number;
  fontFamily: string;
  fontSize: number;
  gridConfig: GridConfig;
}

const DEFAULT_GRID_CONFIG: GridConfig = {
  rows: 3,
  columns: 3,
  cellBorderColor: 0xffffff,
  cellBorderWidth: 1,
  cellPadding: 5,
  columnWidths: [100, 100, 100],
  headerHeight: 30,
  rowHeight: 35,
};

const DEFAULT_CONFIG: GridContainerConfig = {
  width: 300,
  height: 400,
  color: 0xff0000,
  textColor: 0xffffff,
  fontFamily: '"Gill Sans", sans-serif',
  fontSize: 12,
  gridConfig: DEFAULT_GRID_CONFIG,
};

/**
 * A generic grid container component that can be extended for specific grid displays
 */
export class GridContainer extends PIXI.Container {
  protected config: GridContainerConfig;
  protected grid: PIXI.Graphics = new PIXI.Graphics();
  protected cells: PIXI.Container[][] = [];
  protected background: PIXI.Graphics;

  constructor(config: Partial<GridContainerConfig> = {}) {
    super();

    // Merge the provided config with the default config
    const mergedGridConfig = config.gridConfig
      ? { ...DEFAULT_GRID_CONFIG, ...config.gridConfig }
      : DEFAULT_GRID_CONFIG;

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      gridConfig: mergedGridConfig,
    };

    // Create background
    this.background = new PIXI.Graphics()
      .roundRect(0, 0, this.config.width, this.config.height, 5)
      .fill({ color: this.config.color, alpha: 0.6 });
    this.addChild(this.background);

    // Create grid container
    this.grid = new PIXI.Graphics();
    this.addChild(this.grid);
  }

  private drawGrids() {
    this.cells = [];
    const gridConfig = this.config.gridConfig;
    logger.debug("Draw grid", gridConfig);
    let yPos = gridConfig.headerHeight;
    for (let r = 0; r < gridConfig.rows; r++) {
      let xPos = 0;
      const cellRow: PIXI.Container[] = [];
      for (let c = 0; c < gridConfig.columns; c++) {
        const cell = new PIXI.Container();
        cell.position.set(xPos, yPos);
        cell.setSize(gridConfig.columnWidths[c], gridConfig.rowHeight);
        this.addChild(cell);
        cellRow.push(cell);

        logger.debug(
          `raw cell ${xPos}, ${yPos}, ${gridConfig.columnWidths[c]}, ${gridConfig.rowHeight}`,
        );
        this.grid
          .rect(xPos, yPos, gridConfig.columnWidths[c], gridConfig.rowHeight)
          .stroke({
            width: gridConfig.cellBorderWidth,
            color: gridConfig.cellBorderColor,
          });
        xPos += gridConfig.columnWidths[c];
      }
      this.cells.push(cellRow);
      yPos += gridConfig.rowHeight;
    }
  }

  /**
   * Draw a cell in the grid
   * @param row Row index of the cell
   * @param col Column index of the cell
   * @param width Optional width override of the cell
   * @param height Optional height override of the cell
   */
  protected drawCell(
    row: number,
    col: number,
    width?: number,
    height?: number,
  ): void {
    const { gridConfig } = this.config;

    // Calculate x position based on column widths
    let xPos = 0;
    for (let i = 0; i < col; i++) {
      xPos += gridConfig.columnWidths[i] || 0;
    }

    // Calculate y position based on row height and header height
    const yPos =
      row === 0
        ? 0 // Header row
        : gridConfig.headerHeight + (row - 1) * gridConfig.rowHeight;

    // Use provided width/height or get from config
    const cellWidth = width || gridConfig.columnWidths[col] || 0;
    const cellHeight =
      height || (row === 0 ? gridConfig.headerHeight : gridConfig.rowHeight);

    this.grid.rect(xPos, yPos, cellWidth, cellHeight).stroke({
      width: gridConfig.cellBorderWidth,
      color: gridConfig.cellBorderColor,
    });
  }

  /**
   * Add text to a cell
   * @param text Text to display
   * @param row Row index of the cell
   * @param col Column index of the cell
   * @param isBold Whether the text should be bold
   * @returns The created text object
   */
  protected addCellText(
    text: string,
    row: number,
    col: number,
    isBold: boolean = false,
  ): PIXI.Text {
    const { gridConfig } = this.config;

    const textObj = new PIXI.Text({
      text: text,
      style: {
        fontFamily: this.config.fontFamily,
        fontSize: this.config.fontSize,
        fill: this.config.textColor,
        fontWeight: isBold ? "bold" : "normal",
      },
    });

    textObj.position.set(gridConfig.cellPadding, gridConfig.cellPadding);
    this.cells[row][col].addChild(textObj);

    return textObj;
  }

  /**
   * Draw the header row of the grid
   * @param headers Array of header texts
   */
  protected drawHeaderRow(headers: string[]): void {
    const { gridConfig } = this.config;
    const totalColumns = Math.min(
      gridConfig.columnWidths.length,
      headers.length,
    );

    for (let col = 0; col < totalColumns; col++) {
      // Draw cell border
      this.drawCell(0, col);

      // Add header text
      this.addCellText(headers[col], 0, col, true);
    }
  }

  /**
   * Clear the grid and remove all cell texts
   */
  protected clearGrid(): void {
    // Clear the grid graphics
    this.grid.clear();

    // Remove all children except background and grid
    while (this.children.length > 2) {
      this.removeChildAt(2);
    }

    this.drawGrids();
  }

  /**
   * Update the grid configuration and redraw the grid
   * @param gridConfig New grid configuration
   */
  public updateGridConfig(gridConfig: Partial<GridConfig>): void {
    this.config.gridConfig = {
      ...this.config.gridConfig,
      ...gridConfig,
    };

    // Clear the grid
    this.clearGrid();

    // Subclasses should override this method to redraw their specific grid
  }

  /**
   * Resize the container
   * @param width New width
   * @param height New height
   */
  public resize(width: number, height: number): void {
    this.config.width = width;
    this.config.height = height;

    // Redraw background
    this.background.clear();
    this.background
      .roundRect(0, 0, width, height, 5)
      .fill({ color: this.config.color, alpha: 0.6 });

    // Clear the grid
    this.clearGrid();

    // Subclasses should override this method to redraw their specific grid
  }
}
