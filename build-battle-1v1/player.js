import * as THREE from "three";

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.position = new THREE.Vector3(0, 0, 8);
    this.velocity = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = -0.12;
    this.grounded = true;
    this.speed = 8;
    this.sprintSpeed = 13;
    this.jumpVelocity = 9.2;
    this.createModel();
    scene.add(this.group);
  }

  createModel() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: .62 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf2c6a0, roughness: .7 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x172033, roughness: .8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.2, .75), bodyMat);
    body.position.y = 1.35;
    const head = new THREE.Mesh(new THREE.BoxGeometry(.72, .72, .72), skinMat);
    head.position.y = 2.25;
    const legA = new THREE.Mesh(new THREE.BoxGeometry(.34, .78, .35), darkMat);
    legA.position.set(-.25, .45, 0);
    const legB = legA.clone();
    legB.position.x = .25;
    const armA = new THREE.Mesh(new THREE.BoxGeometry(.28, .95, .32), bodyMat);
    armA.position.set(-.62, 1.32, 0);
    const armB = armA.clone();
    armB.position.x = .62;

    [body, head, legA, legB, armA, armB].forEach(part => {
      part.castShadow = true;
      part.receiveShadow = true;
      this.group.add(part);
    });
  }

  update(dt, input) {
    const sprinting = input.pressed("ShiftLeft") || input.pressed("ShiftRight");
    const speed = sprinting ? this.sprintSpeed : this.speed;
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const wish = new THREE.Vector3();

    if (input.pressed("KeyW")) wish.add(forward);
    if (input.pressed("KeyS")) wish.sub(forward);
    if (input.pressed("KeyD")) wish.add(right);
    if (input.pressed("KeyA")) wish.sub(right);
    if (wish.lengthSq() > 0) wish.normalize().multiplyScalar(speed);

    this.velocity.x += (wish.x - this.velocity.x) * Math.min(1, dt * 12);
    this.velocity.z += (wish.z - this.velocity.z) * Math.min(1, dt * 12);

    if (this.grounded && input.pressed("Space")) {
      this.velocity.y = this.jumpVelocity;
      this.grounded = false;
    }

    this.velocity.y -= 24 * dt;
    this.position.addScaledVector(this.velocity, dt);

    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.grounded = true;
    }

    this.position.x = THREE.MathUtils.clamp(this.position.x, -34, 34);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -34, 34);
    this.group.position.copy(this.position);
    this.group.rotation.y = this.yaw;
  }
}
