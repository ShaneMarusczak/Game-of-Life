export class UI {
  constructor(gameState, renderer, elements) {
    this.gameState = gameState;
    this.renderer = renderer;
    this.elements = elements;
    this.animationId = null;
    this.lastTickTime = 0;
  }

  init() {
    this.setupInputValidation();
    this.setupButtons();
    this.setupCanvas();
    this.setupKeyboardShortcuts();
    this.resetInputs();
    this.updateGenerationDisplay();
  }

  resetInputs() {
    this.elements.rowsInput.value = '30';
    this.elements.colsInput.value = '30';
    this.elements.speedInput.value = '200';
    this.elements.startBtn.disabled = true;
    this.elements.enabledInput.checked = false;
  }

  setupInputValidation() {
    this.elements.rowsInput.addEventListener('input', (e) => this.testRowsInput(e));
    this.elements.colsInput.addEventListener('input', (e) => this.testColsInput(e));
    this.elements.speedInput.addEventListener('input', (e) => this.testSpeedInput(e));
  }

  setupButtons() {
    this.elements.buildGridBtn.addEventListener('click', (e) => this.buildGrid(e));
    this.elements.startBtn.addEventListener('click', () => this.start());
    this.elements.speedUpBtn.addEventListener('click', () => this.speedUp());
    this.elements.slowDownBtn.addEventListener('click', () => this.slowDown());
    this.elements.pauseBtn.addEventListener('click', () => this.pause());
    this.elements.singleStepBtn.addEventListener('click', () => this.singleStep());
    this.elements.clearBtn.addEventListener('click', () => this.clearGrid());
    this.elements.enabledInput.addEventListener('input', () => this.toggleShowEnabled());
  }

  setupCanvas() {
    const canvas = this.renderer.canvas;

    canvas.addEventListener('click', (e) => {
      const cell = this.renderer.getCellFromPoint(e.clientX, e.clientY);
      if (cell && !this.gameState.gameStarted) {
        this.gameState.toggleCell(cell.x + 5, cell.y + 5);
        this.renderer.render(this.gameState);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const cell = this.renderer.getCellFromPoint(e.clientX, e.clientY);
      if (cell) {
        this.renderer.setHover(cell.x, cell.y);
        this.renderer.render(this.gameState);
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this.renderer.clearHover();
      this.renderer.render(this.gameState);
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (this.gameState.gameStarted) {
            this.pause();
          } else if (this.gameState.gridBuilt) {
            this.start();
          }
          break;
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          if (this.gameState.gameStarted) {
            this.speedUp();
          }
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          if (this.gameState.gameStarted) {
            this.slowDown();
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (!this.gameState.gridBuilt) {
            this.elements.buildGridBtn.click();
          } else if (!this.gameState.gameStarted) {
            this.start();
          }
          break;
        case 'KeyS':
          e.preventDefault();
          if (this.gameState.paused) {
            this.singleStep();
          }
          break;
        case 'KeyC':
          e.preventDefault();
          this.clearGrid();
          break;
        case 'KeyE':
          e.preventDefault();
          this.elements.enabledInput.checked = !this.elements.enabledInput.checked;
          this.toggleShowEnabled();
          break;
      }
    });
  }

  buildGrid(e) {
    if (!this.gameState.gameStarted &&
        this.gameState.rowsValid &&
        this.gameState.colsValid &&
        this.gameState.speedValid &&
        !this.gameState.gridBuilt) {

      this.gameState.gameSpeed = Number(this.elements.speedInput.value);
      this.gameState.rows = Number(this.elements.rowsInput.value);
      this.gameState.cols = Number(this.elements.colsInput.value);

      this.elements.rowsInput.disabled = true;
      this.elements.colsInput.disabled = true;
      this.elements.speedInput.disabled = true;
      e.target.classList.add('hidden');

      this.elements.startBtn.disabled = false;
      this.elements.startBtn.classList.remove('hidden');
      this.elements.clearBtn.classList.remove('hidden');

      this.gameState.buildGrid();
      this.renderer.setup(this.gameState.cols, this.gameState.rows);
      this.renderer.render(this.gameState);
      this.updateGenerationDisplay();
    }
  }

  start() {
    if (!this.gameState.gameStarted &&
        this.gameState.rowsValid &&
        this.gameState.colsValid &&
        this.gameState.speedValid &&
        this.gameState.gridBuilt) {

      this.gameState.gameStarted = true;
      this.elements.startBtn.classList.add('hidden');
      this.elements.speedUpBtn.classList.remove('hidden');
      this.elements.slowDownBtn.classList.remove('hidden');
      this.elements.pauseBtn.classList.remove('hidden');
      this.elements.singleStepBtn.classList.remove('hidden');

      document.querySelectorAll('.speedBtns').forEach((item) => {
        item.classList.remove('hidden');
      });

      this.gameTick();
    }
  }

  gameTick(timestamp = 0) {
    if (!this.gameState.paused && this.gameState.gameStarted) {
      if (timestamp - this.lastTickTime >= this.gameState.gameSpeed) {
        this.gameState.singleStep();
        this.renderer.render(this.gameState);
        this.updateGenerationDisplay();
        this.lastTickTime = timestamp;
      }
      this.animationId = requestAnimationFrame((t) => this.gameTick(t));
    }
  }

  singleStep() {
    if (this.gameState.paused || !this.gameState.gameStarted) {
      this.gameState.singleStep();
      this.renderer.render(this.gameState);
      this.updateGenerationDisplay();
    }
  }

  pause() {
    if (this.gameState.paused) {
      this.gameState.paused = false;
      this.elements.pauseBtn.textContent = 'Pause';
      this.lastTickTime = 0;
      this.gameTick();
    } else {
      this.gameState.paused = true;
      this.elements.pauseBtn.textContent = 'Unpause';
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
    this.elements.singleStepBtn.disabled = !this.gameState.paused;
  }

  speedUp() {
    if (this.gameState.gameSpeed - 10 >= 1) {
      this.gameState.gameSpeed -= 10;
      this.elements.speedInput.value = this.gameState.gameSpeed;
    }
  }

  slowDown() {
    if (this.gameState.gameSpeed + 10 <= 500) {
      this.gameState.gameSpeed += 10;
      this.elements.speedInput.value = this.gameState.gameSpeed;
    }
  }

  clearGrid() {
    if (this.gameState.gridBuilt) {
      // If game is running, pause it first
      if (this.gameState.gameStarted && !this.gameState.paused) {
        this.pause();
      }

      this.gameState.clearGrid();
      this.renderer.render(this.gameState);
      this.updateGenerationDisplay();
    }
  }

  toggleShowEnabled() {
    this.gameState.showEnabled = this.elements.enabledInput.checked;
    this.renderer.render(this.gameState);
  }

  updateGenerationDisplay() {
    const genText = `Generation: ${this.gameState.generation}`;
    const cellCount = this.gameState.gridBuilt ? this.gameState.getLiveCellCount() : 0;
    const cellText = ` | Cells: ${cellCount}`;

    let statusText = '';
    if (this.gameState.patternStatus === 'stable') {
      statusText = ' | Status: Stable';
    } else if (this.gameState.patternStatus === 'oscillating') {
      statusText = ` | Status: Oscillating (period ${this.gameState.oscillationPeriod})`;
    }

    this.elements.generationDisplay.textContent = genText + cellText + statusText;
  }

  testRowsInput(e) {
    const regex = /^\d{0,3}$/;
    const value = Number(e.target.value);
    if (regex.test(e.target.value) && value <= 200 && value > 0 && e.target.value !== '') {
      this.gameState.rowsValid = true;
      const elem = document.getElementById('invalidRows');
      if (elem) elem.remove();
    } else {
      if (this.gameState.rowsValid) {
        this.showValidationError('invalidRows', 'Valid range is 1-200 rows');
      }
      this.gameState.rowsValid = false;
    }
  }

  testColsInput(e) {
    const regex = /^\d{0,3}$/;
    const value = Number(e.target.value);
    if (regex.test(e.target.value) && value <= 200 && value > 0 && e.target.value !== '') {
      this.gameState.colsValid = true;
      const elem = document.getElementById('invalidCols');
      if (elem) elem.remove();
    } else {
      if (this.gameState.colsValid) {
        this.showValidationError('invalidCols', 'Valid range is 1-200 columns');
      }
      this.gameState.colsValid = false;
    }
  }

  testSpeedInput(e) {
    const regex = /^\d{0,3}$/;
    const value = Number(e.target.value);
    if (regex.test(e.target.value) && value <= 500 && value > 0 && e.target.value !== '') {
      this.gameState.speedValid = true;
      const elem = document.getElementById('invalidSpeed');
      if (elem) elem.remove();
    } else {
      if (this.gameState.speedValid) {
        this.showValidationError('invalidSpeed', 'Valid range is 1-500 whole ms');
      }
      this.gameState.speedValid = false;
    }
  }

  showValidationError(id, message) {
    const msgElem = document.createElement('p');
    msgElem.id = id;
    msgElem.textContent = message;
    msgElem.classList.add('bad');
    this.elements.messages.insertBefore(msgElem, this.elements.messages.firstChild);
  }
}
