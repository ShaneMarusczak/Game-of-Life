import { GameState } from './GameState.js';
import { Renderer } from './Renderer.js';
import { UI } from './UI.js';

// Initialize the game
const gameState = new GameState();

const canvas = document.getElementById('gameCanvas');
const renderer = new Renderer(canvas);

const elements = {
  rowsInput: document.getElementById('rowsInput'),
  colsInput: document.getElementById('colsInput'),
  speedInput: document.getElementById('speedInput'),
  buildGridBtn: document.getElementById('buildGrid'),
  startBtn: document.getElementById('start'),
  speedUpBtn: document.getElementById('speedUpbtn'),
  slowDownBtn: document.getElementById('slowDownbtn'),
  pauseBtn: document.getElementById('pauseBtn'),
  singleStepBtn: document.getElementById('singleStepBtn'),
  clearBtn: document.getElementById('clearBtn'),
  enabledInput: document.getElementById('enabledInput'),
  generationDisplay: document.getElementById('generationDisplay'),
  messages: document.getElementById('messages')
};

const ui = new UI(gameState, renderer, elements);
ui.init();
