import * as THREE from "three";

const GRID = 2;

export class BuildingSystem {
  constructor(scene, player, cameraController) {
    this.scene = scene;
    this.player = player;
    this.cameraController = cameraController;
    this.enabled = false;
    this.selected = "wall";
    this.rotation = 0;
    this.materials = 500;
    this.pieces = [];
    this.particles = [];
    this.preview = new THREE.Group();
    this.preview.visible = false;
    this.scene.add(this.preview);
    this.previewMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: .42,
      roughness: .58
    });
    this.solidMaterial = new THREE.MeshStandardMaterial({ color: 0xd6b98c, roughness: .72 });
    this.trimMaterial = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: .82 });
  }

  toggle() {
    this.enabled = !this.enabled;
    this.preview.visible = this.enabled;
  }

  setPiece(type) {
    this.selected = type;
    this.rebuildPreview();
  }

  rotate() {
    this.rotation = (this.rotation + Math.PI / 2) % (Math.PI * 2);
  }

  update(dt) {
    this.updatePreview();
    this.updateParticles(dt);
  }

  updatePreview() {
    if (!this.enabled) {
      this.preview.visible = false;
      return;
    }
    this.preview.visible = true;
    const pos = this.getSnapPosition();
    this.preview.position.copy(pos);
    this.preview.rotation.y = this.rotation;
    if (this.preview.children.length === 0) this.rebuildPreview();
  }

  getSnapPosition() {
    const forward = this.cameraController.forwardFlat();
    const target = this.player.position.clone().add(forward.multiplyScalar(5.5));
    target.x = Math.round(target.x / GRID) * GRID;
    target.z = Math.round(target.z / GRID) * GRID;
    target.y = this.selected === "wall" ? 1 : this.selected === "ramp" ? .05 : 0;
    return target;
  }

  place() {
    if (!this.enabled || this.materials <= 0) return false;
    const group = this.createPiece(this.selected, false);
    group.position.copy(this.getSnapPosition());
    group.rotation.y = this.rotation;
    group.scale.set(.2, .2, .2);
    group.userData.birth = performance.now();
    this.scene.add(group);
    this.pieces.push(group);
    this.materials -= 1;
    this.spawnParticles(group.position);
    return true;
  }

  animatePieces() {
    const now = performance.now();
    this.pieces.forEach(piece => {
      const age = Math.min(1, (now - piece.userData.birth) / 180);
      const s = .2 + age * .8;
      piece.scale.set(s, s, s);
    });
  }

  rebuildPreview() {
    this.preview.clear();
    const piece = this.createPiece(this.selected, true);
    piece.children.forEach(child => this.preview.add(child.clone()));
  }

  createPiece(type, preview) {
    const mat = preview ? this.previewMaterial : this.solidMaterial;
    const trim = preview ? this.previewMaterial : this.trimMaterial;
    const group = new THREE.Group();

    if (type === "wall") {
      this.addBox(group, 2, 2, .18, 0, 1, 0, mat);
      this.addBox(group, .16, 2.1, .24, -.92, 1, 0, trim);
      this.addBox(group, .16, 2.1, .24, .92, 1, 0, trim);
      this.addBox(group, 2, .16, .24, 0, 1.92, 0, trim);
    }
    if (type === "floor") {
      this.addBox(group, 2, .18, 2, 0, .08, 0, mat);
      this.addBox(group, 2.05, .22, .14, 0, .18, -.92, trim);
      this.addBox(group, 2.05, .22, .14, 0, .18, .92, trim);
    }
    if (type === "ramp") {
      const shape = new THREE.Shape();
      shape.moveTo(-1, -1);
      shape.lineTo(1, -1);
      shape.lineTo(1, 1);
      shape.lineTo(-1, -1);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 2, bevelEnabled: false });
      geo.center();
      const ramp = new THREE.Mesh(geo, mat);
      ramp.rotation.y = Math.PI / 2;
      ramp.position.y = 1;
      ramp.castShadow = true;
      ramp.receiveShadow = true;
      group.add(ramp);
      this.addBox(group, 2, .18, .16, 0, .1, -.92, trim);
    }
    if (type === "cone") {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.2, 4), mat);
      cone.position.y = .62;
      cone.rotation.y = Math.PI / 4;
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);
      this.addBox(group, 2, .12, 2, 0, .05, 0, trim);
    }
    return group;
  }

  addBox(group, sx, sy, sz, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  spawnParticles(position) {
    for (let i = 0; i < 18; i++) {
      const p = new THREE.Mesh(
        new THREE.BoxGeometry(.12, .12, .12),
        new THREE.MeshBasicMaterial({ color: i % 2 ? 0x38bdf8 : 0xfacc15 })
      );
      p.position.copy(position).add(new THREE.Vector3(0, 1, 0));
      p.userData.velocity = new THREE.Vector3((Math.random() - .5) * 4, Math.random() * 4, (Math.random() - .5) * 4);
      p.userData.life = .55;
      this.scene.add(p);
      this.particles.push(p);
    }
  }

  updateParticles(dt) {
    this.particles = this.particles.filter(p => {
      p.userData.life -= dt;
      p.userData.velocity.y -= 10 * dt;
      p.position.addScaledVector(p.userData.velocity, dt);
      p.material.opacity = Math.max(0, p.userData.life / .55);
      if (p.userData.life <= 0) {
        this.scene.remove(p);
        return false;
      }
      return true;
    });
  }
}
