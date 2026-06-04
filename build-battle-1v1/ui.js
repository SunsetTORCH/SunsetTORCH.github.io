export class UI {
  constructor() {
    this.mainMenu = document.querySelector("#mainMenu");
    this.pauseMenu = document.querySelector("#pauseMenu");
    this.settingsMenu = document.querySelector("#settingsMenu");
    this.hud = document.querySelector("#hud");
    this.modePill = document.querySelector("#modePill");
    this.materials = document.querySelector("#materials");
    this.pieces = [...document.querySelectorAll(".piece")];
    this.sensitivity = document.querySelector("#sensitivity");
    this.fov = document.querySelector("#fov");
    this.sensValue = document.querySelector("#sensValue");
    this.fovValue = document.querySelector("#fovValue");
  }

  showMenu() {
    this.mainMenu.classList.remove("hidden");
    this.pauseMenu.classList.add("hidden");
    this.settingsMenu.classList.add("hidden");
    this.hud.classList.add("hidden");
  }

  showHud() {
    this.mainMenu.classList.add("hidden");
    this.pauseMenu.classList.add("hidden");
    this.settingsMenu.classList.add("hidden");
    this.hud.classList.remove("hidden");
  }

  showPause() {
    this.pauseMenu.classList.remove("hidden");
  }

  hidePause() {
    this.pauseMenu.classList.add("hidden");
  }

  showSettings(settings) {
    this.pauseMenu.classList.add("hidden");
    this.settingsMenu.classList.remove("hidden");
    this.sensitivity.value = settings.sensitivity;
    this.fov.value = settings.fov;
    this.updateSettingsLabels(settings);
  }

  updateSettingsLabels(settings) {
    this.sensValue.textContent = Number(settings.sensitivity).toFixed(2);
    this.fovValue.textContent = `${settings.fov}°`;
  }

  update(building) {
    this.modePill.textContent = `Build: ${building.enabled ? "On" : "Off"}`;
    this.modePill.style.borderColor = building.enabled ? "rgba(34,197,94,.75)" : "rgba(148,163,184,.18)";
    this.materials.textContent = building.materials;
    this.pieces.forEach(btn => btn.classList.toggle("active", btn.dataset.piece === building.selected));
  }
}
