export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = 17;
    this.borderWidth = 1;
    this.cols = 0;
    this.rows = 0;

    this.colors = {
      background: 'rgba(201, 201, 201, 0.4)',
      border: 'dimgrey',
      alive: 'dimgrey',
      enabled: 'rgba(125, 186, 232, 0.3)',
      hover: 'dimgrey'
    };

    this.hoverCell = null;
  }

  setup(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.canvas.width = cols * this.cellSize;
    this.canvas.height = rows * this.cellSize;
  }

  setHover(x, y) {
    this.hoverCell = { x, y };
  }

  clearHover() {
    this.hoverCell = null;
  }

  getCellFromPoint(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / this.cellSize);
    const y = Math.floor((clientY - rect.top) / this.cellSize);

    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      return { x, y };
    }
    return null;
  }

  render(gameState) {
    const { ctx, cellSize, borderWidth, colors } = this;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw cells
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const cellX = x * cellSize;
        const cellY = y * cellSize;
        const cell = gameState.gameBoard[x + 5]?.[y + 5];

        // Determine cell color
        let fillColor = colors.background;
        if (cell?.alive) {
          fillColor = colors.alive;
        } else if (gameState.showEnabled && cell?.enabled) {
          fillColor = colors.enabled;
        }

        // Check for hover
        if (this.hoverCell && this.hoverCell.x === x && this.hoverCell.y === y && !gameState.gameStarted) {
          fillColor = colors.hover;
        }

        // Draw cell background
        ctx.fillStyle = fillColor;
        ctx.fillRect(cellX, cellY, cellSize, cellSize);

        // Draw cell border
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(cellX + 0.5, cellY + 0.5, cellSize - 1, cellSize - 1);
      }
    }
  }
}
