(function () {
  let gameStarted = false;
  let gameCanStart = true;
  let gridBuilt = false;
  let gameSpeed = 200;
  let rows = 20;
  let cols = 20;
  const gameBoard = [];
  const gameBoard_UI = document.getElementById("gameBoard_UI");

  const validPosition = (x, y) => x >= 0 && x < cols && y >= 0 && y < rows;

  const getCellId = (x, y) => "cell-" + x + "-" + y;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  class Cell {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.alive = false;
      this.nextState = false;
      this.enabled = false;
      this.neighbors = [];
      this.aliveNeighbors = 0;
    }

    setNeighbors() {
      const dirs = [-1, 0, 1];
      for (let dirx of dirs) {
        for (let diry of dirs) {
          if (validPosition(this.x + dirx, this.y + diry)) {
            if (dirx === 0 && diry === 0) {
              continue;
            }
            this.neighbors.push([this.x + dirx, this.y + diry]);
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
        this.enabled = true;
        this.setEnable();
      }
    }

    setAliveNeighborCount() {
      this.aliveNeighbors = 0;
      for (let n of this.neighbors) {
        if (gameBoard[n[0]][n[1]].alive) {
          this.aliveNeighbors++;
        }
      }
    }

    setEnable() {
      for (let n of this.neighbors) {
        gameBoard[n[0]][n[1]].enabled = true;
      }
    }

    setNextState() {
      this.setAliveNeighborCount();
      if (
        this.alive &&
        (this.aliveNeighbors === 2 || this.aliveNeighbors === 3)
      ) {
        this.nextState = true;
      } else if (!this.alive && this.aliveNeighbors === 3) {
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
        this.setEnable();
      }
    }
  }

  function gameTick() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (gameBoard[x][y].enabled) {
          gameBoard[x][y].setNextState();
        }
      }
    }
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (gameBoard[x][y].enabled) {
          gameBoard[x][y].applyNextState();
        }
      }
    }
    sleep(gameSpeed).then(() => gameTick());
  }

  function start() {
    if (!gameStarted && gameCanStart && gridBuilt) {
      gameStarted = true;
      document.getElementById("start").disabled = true;
      gameTick();
    }
  }

  function buildGrid(e) {
    if (
      !gameStarted &&
      gameCanStart &&
      !gridBuilt &&
      document.getElementById("rowsInput").value.length > 0 &&
      document.getElementById("colsInput").value.length > 0
    ) {
      rows = Number(document.getElementById("rowsInput").value);
      cols = Number(document.getElementById("colsInput").value);
      document.getElementById("rowsInput").disabled = true;
      document.getElementById("colsInput").disabled = true;
      e.target.disabled = true;
      buildGridInternal();
      gridBuilt = true;
    }
  }

  function testInput(e) {
    let regex = /^\d{0,2}$/;
    if (
      regex.test(e.target.value) &&
      Number(e.target.value) <= 50 &&
      Number(e.target.value) > 0
    ) {
      document.getElementById("invalid").classList.add("hidden");
      gameCanStart = true;
    } else {
      document.getElementById("invalid").classList.remove("hidden");
      gameCanStart = false;
    }
  }

  function buildGridInternal() {
    for (let x = 0; x < cols; x++) {
      gameBoard.push([]);
      const col = document.createElement("div");
      col.id = "col-" + x;
      col.classList.add("col");
      gameBoard_UI.appendChild(col);
      for (let y = 0; y < rows; y++) {
        const newCell = new Cell(x, y);
        gameBoard[x].push(newCell);
        gameBoard[x][y].setNeighbors();
        const cell = document.createElement("div");
        cell.id = getCellId(x, y);
        cell.classList.add("cell");
        col.appendChild(cell);
        cell.addEventListener("click", () => newCell.handleClick());
      }
    }
  }

  (function () {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("buildGrid").addEventListener("click", buildGrid);
    document.getElementById("rowsInput").addEventListener("input", testInput);
    document.getElementById("colsInput").addEventListener("input", testInput);
  })();
})();
