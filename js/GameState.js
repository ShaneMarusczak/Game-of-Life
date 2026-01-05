import { Cell } from './Cell.js';

export class GameState {
  constructor() {
    this.gameStarted = false;
    this.rowsValid = true;
    this.colsValid = true;
    this.speedValid = true;
    this.gridBuilt = false;
    this.gameSpeed = 200;
    this.rows = 30;
    this.cols = 30;
    this.paused = false;
    this.showEnabled = false;
    this.gameBoard = [];
    this.currentEnabledCells = [];
    this.generation = 0;
    this.stateHistory = [];
    this.maxHistoryLength = 20;
    this.patternStatus = null; // null, 'stable', or 'oscillating'
    this.oscillationPeriod = 0;
  }

  validPosition(x, y, cols, rows) {
    return x >= 0 && x < cols + 10 && y >= 0 && y < rows + 10;
  }

  buildGrid() {
    this.gameBoard = [];
    for (let x = 0; x < this.cols + 10; x++) {
      this.gameBoard.push([]);
      for (let y = 0; y < this.rows + 10; y++) {
        const newCell = new Cell(x, y);
        this.gameBoard[x].push(newCell);
        this.gameBoard[x][y].setNeighbors(this.cols, this.rows, this.validPosition);
      }
    }
    this.gridBuilt = true;
    this.generation = 0;
    this.stateHistory = [];
    this.patternStatus = null;
    this.oscillationPeriod = 0;
  }

  toggleCell(x, y) {
    if (!this.gameStarted) {
      const cell = this.gameBoard[x][y];
      cell.alive = !cell.alive;
      if (cell.alive) {
        cell.setEnable(this.gameBoard);
      }
      cell.enabled = true;
    }
  }

  clearGrid() {
    if (!this.gridBuilt) return;

    for (let x = 0; x < this.cols + 10; x++) {
      for (let y = 0; y < this.rows + 10; y++) {
        this.gameBoard[x][y].alive = false;
        this.gameBoard[x][y].nextState = false;
        this.gameBoard[x][y].enabled = false;
      }
    }
    this.generation = 0;
    this.stateHistory = [];
    this.patternStatus = null;
    this.oscillationPeriod = 0;
    this.currentEnabledCells = [];
  }

  getStateHash() {
    let hash = '';
    for (let x = 5; x < this.cols + 5; x++) {
      for (let y = 5; y < this.rows + 5; y++) {
        if (this.gameBoard[x][y].alive) {
          hash += `${x},${y};`;
        }
      }
    }
    return hash;
  }

  detectPattern() {
    const currentHash = this.getStateHash();

    // Check for stability (same as previous state)
    if (this.stateHistory.length > 0 && currentHash === this.stateHistory[this.stateHistory.length - 1]) {
      this.patternStatus = 'stable';
      this.oscillationPeriod = 0;
      return;
    }

    // Check for oscillation (matches any previous state)
    for (let i = 0; i < this.stateHistory.length - 1; i++) {
      if (currentHash === this.stateHistory[i]) {
        this.patternStatus = 'oscillating';
        this.oscillationPeriod = this.stateHistory.length - i;
        return;
      }
    }

    // No pattern detected yet
    this.patternStatus = null;
    this.oscillationPeriod = 0;

    // Add current state to history
    this.stateHistory.push(currentHash);
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory.shift();
    }
  }

  singleStep() {
    const enabledCells = [];
    for (let x = 0; x < this.cols + 10; x++) {
      for (let y = 0; y < this.rows + 10; y++) {
        if (this.gameBoard[x][y].enabled) {
          this.gameBoard[x][y].setNextState(this.gameBoard);
          enabledCells.push(this.gameBoard[x][y]);
        }
      }
    }

    this.currentEnabledCells = [];
    for (const ec of enabledCells) {
      ec.applyNextState(this.gameBoard);
      if (ec.enabled && !ec.alive) {
        if (ec.x >= 5 && ec.x < this.cols + 5 && ec.y >= 5 && ec.y < this.rows + 5) {
          this.currentEnabledCells.push(ec);
        }
      }
    }

    this.generation++;
    this.detectPattern();
  }

  getVisibleCells() {
    const cells = [];
    for (let x = 5; x < this.cols + 5; x++) {
      for (let y = 5; y < this.rows + 5; y++) {
        const cell = this.gameBoard[x][y];
        cells.push({
          x: x - 5,
          y: y - 5,
          alive: cell.alive,
          enabled: cell.enabled
        });
      }
    }
    return cells;
  }

  getLiveCellCount() {
    let count = 0;
    for (let x = 5; x < this.cols + 5; x++) {
      for (let y = 5; y < this.rows + 5; y++) {
        if (this.gameBoard[x][y].alive) {
          count++;
        }
      }
    }
    return count;
  }
}
