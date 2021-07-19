(() => {
  let gameStarted = false;
  let gameSpeed = 300;
  const rows = 40;
  const cols = 40;
  const gameBoard = [];
  const gameBoard_UI = document.getElementById("gameBoard_UI");

  const validPosition = (x, y) => x >= 0 && x < cols && y >= 0 && y < rows;

  const getCellId = (x, y) => "cell-" + x + "-" + y;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  class Cell {
    constructor(x, y, alive) {
      this.x = x;
      this.y = y;
      this.alive = alive;
      this.nextState = false;
      this.neighbors = [];
    }

    calcNeighbors() {
      const dirs = [-1, 0, 1];
      for (let dirx of dirs) {
        for (let diry of dirs) {
          if (validPosition(this.x + dirx, this.y + diry)) {
            if (dirx === 0 && diry === 0) {
              continue;
            }
            const cell = gameBoard[this.x + dirx][this.y + diry];
            this.neighbors.push(cell);
          }
        }
      }
    }

    handleClick() {
      if (!gameStarted) {
        this.alive = !this.alive;
        if (this.alive) {
          document
            .getElementById(getCellId(this.x, this.y))
            .classList.add("alive");
        } else {
          document
            .getElementById(getCellId(this.x, this.y))
            .classList.remove("alive");
        }
      }
    }

    setNextState() {
      let aliveNeighbors = 0;
      for (let n of this.neighbors) {
        if (n.alive) {
          aliveNeighbors++;
        }
      }
      if (this.alive && (aliveNeighbors === 2 || aliveNeighbors == 3)) {
        this.nextState = true;
      } else if (!this.alive && aliveNeighbors === 3) {
        this.nextState = true;
      } else {
        this.nextState = false;
      }
    }

    applyNextState() {
      document
        .getElementById(getCellId(this.x, this.y))
        .classList.remove("alive");
      this.alive = this.nextState;
      if (this.alive) {
        document
          .getElementById(getCellId(this.x, this.y))
          .classList.add("alive");
      }
    }
  }

  function gameTick() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        gameBoard[x][y].setNextState();
      }
    }
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        gameBoard[x][y].applyNextState();
      }
    }
    sleep(gameSpeed).then(() => gameTick());
  }

  function start() {
    if (!gameStarted) {
      gameStarted = true;
      gameTick();
    }
  }

  (() => {
    document.getElementById("start").addEventListener("click", start);

    for (let x = 0; x < cols; x++) {
      gameBoard.push([]);
      const col = document.createElement("div");
      col.id = "col-" + x;
      col.classList.add("col");
      gameBoard_UI.appendChild(col);
      for (let y = 0; y < rows; y++) {
        const newCell = new Cell(x, y, false);
        gameBoard[x].push(newCell);
        const cell = document.createElement("div");
        cell.id = getCellId(x, y);
        cell.classList.add("cell");
        col.appendChild(cell);
        cell.addEventListener("click", () => newCell.handleClick());
      }
    }
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        gameBoard[x][y].calcNeighbors();
      }
    }
    console.log(gameBoard);
  })();
})();
