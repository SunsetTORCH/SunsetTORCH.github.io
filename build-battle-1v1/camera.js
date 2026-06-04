import * as THREE from "three";

export class FollowCamera {
  constructor(camera, player) {
    this.camera = camera;
    this.player = player;
    this.distance = 7.5;
    this.height = 3.8;
    this.target = new THREE.Vector3();
  }

  update(dt, settings, input) {
    const mouse = input.consumeMouse();
    this.player.yaw -= mouse.dx * 0.0024 * settings.sensitivity;
    this.player.pitch -= mouse.dy * 0.0020 * settings.sensitivity;
    this.player.pitch = THREE.MathUtils.clamp(this.player.pitch, -0.8, 0.55);

    const yaw = this.player.yaw;
    const pitch = this.player.pitch;
    const offset = new THREE.Vector3(
      -Math.sin(yaw) * Math.cos(pitch) * this.distance,
      this.height + Math.sin(pitch) * this.distance,
      -Math.cos(yaw) * Math.cos(pitch) * this.distance
    );
    const wanted = this.player.position.clone().add(offset);
    this.camera.position.lerp(wanted, 1 - Math.pow(.001, dt));
    this.target.copy(this.player.position).add(new THREE.Vector3(0, 1.45, 0));
    this.camera.lookAt(this.target);
  }

  forwardFlat() {
    return new THREE.Vector3(Math.sin(this.player.yaw), 0, Math.cos(this.player.yaw)).normalize();
  }
}
