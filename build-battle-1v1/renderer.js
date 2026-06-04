import * as THREE from "three";

export class GameRenderer {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8fd4ff);
    this.scene.fog = new THREE.Fog(0x8fd4ff, 38, 95);
    this.camera = new THREE.PerspectiveCamera(settings.fov, 1, 0.1, 250);
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.clock = new THREE.Clock();
    this.resize = this.resize.bind(this);
  }

  init() {
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 1.8);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(28, 36, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(sun);

    this.createArena();
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  createArena() {
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x3aa655, roughness: .86 });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(72, 1, 72), groundMat);
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(72, 36, 0xffffff, 0x1d6b3d);
    grid.position.y = 0.012;
    grid.material.transparent = true;
    grid.material.opacity = .22;
    this.scene.add(grid);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: .72 });
    for (let i = -36; i <= 36; i += 4) {
      this.addArenaBlock(i, 1, -38, wallMat);
      this.addArenaBlock(i, 1, 38, wallMat);
      this.addArenaBlock(-38, 1, i, wallMat);
      this.addArenaBlock(38, 1, i, wallMat);
    }

    const propMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: .9 });
    for (let i = 0; i < 28; i++) {
      const x = (Math.random() - .5) * 62;
      const z = (Math.random() - .5) * 62;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + Math.random() * .7, 0), propMat);
      rock.position.set(x, .35, z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    }
  }

  addArenaBlock(x, y, z, material) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2, 3.8), material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    this.scene.add(block);
  }

  setFov(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  resize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
