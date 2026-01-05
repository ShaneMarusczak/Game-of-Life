export class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alive = false;
    this.nextState = false;
    this.enabled = false;
    this.neighbors = [];
    this.aliveNeighbors = 0;
    this.permaDead = false;
  }

  setNeighbors(cols, rows, validPosition) {
    const dirs = [-1, 0, 1];
    for (const dirx of dirs) {
      for (const diry of dirs) {
        if (validPosition(this.x + dirx, this.y + diry, cols, rows)) {
          if (dirx === 0 && diry === 0) {
            continue;
          }
          this.neighbors.push([this.x + dirx, this.y + diry]);
        }
      }
    }
    if (this.neighbors.length < 6) {
      this.permaDead = true;
    }
  }

  setAliveNeighborCount(gameBoard) {
    this.aliveNeighbors = 0;
    for (const n of this.neighbors) {
      if (gameBoard[n[0]][n[1]].alive) {
        this.aliveNeighbors++;
      }
    }
  }

  setEnable(gameBoard) {
    for (const n of this.neighbors) {
      gameBoard[n[0]][n[1]].enabled = true;
    }
  }

  setNextState(gameBoard) {
    this.setAliveNeighborCount(gameBoard);
    if (this.permaDead) {
      this.nextState = false;
    } else if (
      this.alive &&
      (this.aliveNeighbors === 2 || this.aliveNeighbors === 3)
    ) {
      this.nextState = true;
    } else if (!this.alive && this.aliveNeighbors === 3) {
      this.nextState = true;
    } else {
      this.nextState = false;
      if (this.aliveNeighbors === 0) {
        this.enabled = false;
      }
    }
  }

  applyNextState(gameBoard) {
    this.alive = this.nextState;
    if (this.alive) {
      this.setEnable(gameBoard);
    }
  }
}
