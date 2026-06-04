import { GameRenderer } from "./renderer.js";
import { Player } from "./player.js";
import { FollowCamera } from "./camera.js";
import { BuildingSystem } from "./building.js";
import { Input } from "./input.js";
import { UI } from "./ui.js";
import { loadSettings, saveSettings } from "./settings.js";

const canvas = document.querySelector("#gameCanvas");
const settings = loadSettings();
const ui = new UI();
const input = new Input(canvas);
const renderer = new GameRenderer(canvas, settings);
let player;
let cameraController;
let building;
let running = false;
let paused = false;
let lastPieceKey = {};

renderer.init();
renderer.setFov(settings.fov);
input.bind();

function startFreeBuild() {
  if (!player) {
    player = new Player(renderer.scene);
    cameraController = new FollowCamera(renderer.camera, player);
    building = new BuildingSystem(renderer.scene, player, cameraController);
  }
  running = true;
  paused = false;
  ui.showHud();
  canvas.requestPointerLock();
}

function pauseGame() {
  if (!running) return;
  paused = true;
  document.exitPointerLock();
  ui.showPause();
}

function resumeGame() {
  paused = false;
  ui.hidePause();
  canvas.requestPointerLock();
}

function returnToMenu() {
  running = false;
  paused = false;
  document.exitPointerLock();
  ui.showMenu();
}

function handleBuildHotkeys() {
  const bindings = {
    KeyZ: "wall",
    KeyX: "floor",
    KeyC: "ramp",
    KeyV: "cone"
  };
  Object.entries(bindings).forEach(([key, piece]) => {
    if (input.pressed(key) && !lastPieceKey[key]) building.setPiece(piece);
    lastPieceKey[key] = input.pressed(key);
  });

  if (input.pressed("KeyQ") && !lastPieceKey.KeyQ) building.toggle();
  if (input.pressed("KeyR") && !lastPieceKey.KeyR) building.rotate();
  lastPieceKey.KeyQ = input.pressed("KeyQ");
  lastPieceKey.KeyR = input.pressed("KeyR");
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(renderer.clock.getDelta(), 0.033);

  if (running && !paused) {
    handleBuildHotkeys();
    player.update(dt, input);
    cameraController.update(dt, settings, input);
    building.update(dt);
    building.animatePieces();
    if (input.consumePlace()) building.place();
    ui.update(building);
  } else {
    input.consumeMouse();
    input.consumePlace();
  }

  renderer.render();
}

document.querySelector("#freeBuildBtn").addEventListener("click", startFreeBuild);
document.querySelector("#resumeBtn").addEventListener("click", resumeGame);
document.querySelector("#settingsBtn").addEventListener("click", () => ui.showSettings(settings));
document.querySelector("#menuBtn").addEventListener("click", returnToMenu);
document.querySelector("#settingsBack").addEventListener("click", () => {
  saveSettings(settings);
  ui.settingsMenu.classList.add("hidden");
  ui.showPause();
});

ui.sensitivity.addEventListener("input", e => {
  settings.sensitivity = Number(e.target.value);
  ui.updateSettingsLabels(settings);
  saveSettings(settings);
});

ui.fov.addEventListener("input", e => {
  settings.fov = Number(e.target.value);
  renderer.setFov(settings.fov);
  ui.updateSettingsLabels(settings);
  saveSettings(settings);
});

ui.pieces.forEach(btn => btn.addEventListener("click", () => building && building.setPiece(btn.dataset.piece)));

window.addEventListener("keydown", e => {
  if (e.code === "Escape") {
    e.preventDefault();
    if (!running) return;
    if (paused) resumeGame();
    else pauseGame();
  }
});

ui.showMenu();
animate();
