(function () {
  let gameStarted = false;
  let rowsValid = true;
  let colsValid = true;
  let speedValid = true;
  let gridBuilt = false;
  let gameSpeed = 200;
  let rows = 30;
  let cols = 30;
  let paused = false;

  const gameBoard = [];

  const gameBoard_UI = document.getElementById("gameBoard_UI");
  const rowsInput = document.getElementById("rowsInput");
  const colsInput = document.getElementById("colsInput");
  const speedInput = document.getElementById("speedInput");

  class Cell {
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
      if (this.neighbors.length < 6) {
        this.permaDead = true;
      }
    }

    handleClick() {
      if (!gameStarted) {
        this.alive = !this.alive;
        if (this.alive) {
          getCellElem(this.x, this.y).classList.add("alive");
          this.setEnable();
        } else {
          getCellElem(this.x, this.y).classList.remove("alive");
        }
        this.enabled = true;
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

    applyNextState() {
      this.alive = this.nextState;
      if (this.alive) {
        this.setEnable();
      }
      if (
        this.x >= 5 &&
        this.x < cols + 5 &&
        this.y >= 5 &&
        this.y < rows + 5
      ) {
        getCellElem(this.x, this.y).classList.remove("alive");
        if (this.alive) {
          getCellElem(this.x, this.y).classList.add("alive");
        }
      }
    }
  }

  function getCellId(x, y) {
    return "cell-" + x + "-" + y;
  }

  function getCellElem(x, y) {
    return document.getElementById(getCellId(x, y));
  }

  function validPosition(x, y) {
    return x >= 0 && x < cols + 10 && y >= 0 && y < rows + 10;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function gameTick() {
    if (!paused && gameStarted) {
      singleStep();
      if (!paused) {
        sleep(gameSpeed).then(() => gameTick());
      }
    }
  }

  function singleStep() {
    const enabledCells = [];
    for (let x = 0; x < cols + 10; x++) {
      for (let y = 0; y < rows + 10; y++) {
        if (gameBoard[x][y].enabled) {
          gameBoard[x][y].setNextState();
          enabledCells.push(gameBoard[x][y]);
        }
      }
    }
    for (let ec of enabledCells) {
      ec.applyNextState();
    }
  }

  function start() {
    if (!gameStarted && rowsValid && colsValid && speedValid && gridBuilt) {
      gameStarted = true;
      document.getElementById("start").classList.add("hidden");
      document.getElementById("speedUpbtn").classList.remove("hidden");
      document.getElementById("slowDownbtn").classList.remove("hidden");
      document.getElementById("pauseBtn").classList.remove("hidden");
      document.getElementById("singleStepBtn").classList.remove("hidden");
      gameTick();
    }
  }

  function buildGrid(e) {
    if (!gameStarted && rowsValid && colsValid && speedValid && !gridBuilt) {
      gameSpeed = Number(speedInput.value);
      rows = Number(rowsInput.value);
      cols = Number(colsInput.value);
      rowsInput.disabled = true;
      colsInput.disabled = true;
      e.target.classList.add("hidden");
      speedInput.disabled = true;
      document.getElementById("start").disabled = false;
      document.getElementById("start").classList.remove("hidden");
      buildGridInternal();
      gridBuilt = true;
    }
  }

  function testRowsInput(e) {
    const regex = /^\d{0,2}$/;
    if (
      regex.test(e.target.value) &&
      Number(e.target.value) <= 75 &&
      Number(e.target.value) > 0 &&
      e.target.value != ""
    ) {
      rowsValid = true;
      document.getElementById("invalidRows").remove();
    } else {
      if (rowsValid) {
        const message = document.createElement("p");
        message.id = "invalidRows";
        message.textContent = "Valid range is 1-75 rows";
        message.classList.add("bad");
        document
          .getElementById("messages")
          .insertBefore(
            message,
            document.getElementById("messages").firstChild
          );
      }
      rowsValid = false;
    }
  }

  function testColsInput(e) {
    const regex = /^\d{0,2}$/;
    if (
      regex.test(e.target.value) &&
      Number(e.target.value) <= 75 &&
      Number(e.target.value) > 0 &&
      e.target.value != ""
    ) {
      colsValid = true;
      document.getElementById("invalidCols").remove();
    } else {
      if (colsValid) {
        const message = document.createElement("p");
        message.id = "invalidCols";
        message.textContent = "Valid range is 1-75 columns";
        message.classList.add("bad");
        document
          .getElementById("messages")
          .insertBefore(
            message,
            document.getElementById("messages").firstChild
          );
      }
      colsValid = false;
    }
  }

  function testSpeedInput(e) {
    const regex = /^\d{0,3}$/;
    if (
      regex.test(e.target.value) &&
      Number(e.target.value) <= 500 &&
      Number(e.target.value) > 0 &&
      e.target.value != ""
    ) {
      speedValid = true;
      document.getElementById("invalidSpeed").remove();
    } else {
      if (speedValid) {
        const message = document.createElement("p");
        message.id = "invalidSpeed";
        message.textContent = "Valid range is 1-500 whole ms";
        message.classList.add("bad");
        document
          .getElementById("messages")
          .insertBefore(
            message,
            document.getElementById("messages").firstChild
          );
      }
      speedValid = false;
    }
  }

  function speedUp() {
    if (gameSpeed - 10 >= 1) {
      gameSpeed -= 10;
      speedInput.value = gameSpeed;
    }
  }

  function slowDown() {
    if (gameSpeed + 10 <= 500) {
      gameSpeed += 10;
      speedInput.value = gameSpeed;
    }
  }

  function pause() {
    if (paused) {
      paused = false;
      document.getElementById("pauseBtn").textContent = "Pause";
      gameTick();
    } else {
      paused = true;
      document.getElementById("pauseBtn").textContent = "Unpause";
    }
    document.getElementById(
      "singleStepBtn"
    ).disabled = !document.getElementById("singleStepBtn").disabled;
  }

  function buildGridInternal() {
    for (let x = 0; x < cols + 10; x++) {
      gameBoard.push([]);
      const col = document.createElement("div");
      col.id = "col-" + x;
      col.classList.add("col");
      gameBoard_UI.appendChild(col);
      for (let y = 0; y < rows + 10; y++) {
        const newCell = new Cell(x, y);
        gameBoard[x].push(newCell);
        gameBoard[x][y].setNeighbors();
        if (x >= 5 && x < cols + 5 && y >= 5 && y < rows + 5) {
          const cell = document.createElement("div");
          cell.id = getCellId(x, y);
          cell.classList.add("cell");
          col.appendChild(cell);
          cell.addEventListener("click", () => newCell.handleClick());
        }
      }
    }
  }

  (function () {
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("buildGrid").addEventListener("click", buildGrid);
    document.getElementById("speedUpbtn").addEventListener("click", speedUp);
    document.getElementById("slowDownbtn").addEventListener("click", slowDown);
    document.getElementById("pauseBtn").addEventListener("click", pause);
    document.getElementById("singleStepBtn").addEventListener("click", () => {
      if (paused) {
        singleStep();
      }
    });

    rowsInput.addEventListener("input", testRowsInput);
    colsInput.addEventListener("input", testColsInput);
    colsInput.value = "30";
    rowsInput.value = "30";
    speedInput.value = "200";
    speedInput.addEventListener("input", testSpeedInput);
    document.getElementById("start").disabled = true;
  })();
})();
