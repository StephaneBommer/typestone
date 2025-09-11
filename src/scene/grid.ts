import * as THREE from "three";
import type { SimulationScene } from ".";
import { SIZE } from "../utils/constants";
import fragmentShader from "./shaders/grid/grid.frag.glsl";
import vertexShader from "./shaders/grid/grid.vert.glsl";

export class Grid extends THREE.Group {
	private material: THREE.ShaderMaterial;
	private mesh: THREE.Mesh;
	private defaultColor = new THREE.Color(0x161616);
	private editColor = new THREE.Color(0x262626);
	private scene: SimulationScene;

	constructor(scene: SimulationScene) {
		super();
		this.scene = scene;

		this.material = new THREE.ShaderMaterial({
			side: THREE.DoubleSide,
			transparent: true,
			depthWrite: false,
			uniforms: {
				uColor: { value: this.defaultColor },
				uSize1: { value: SIZE },
				uSize2: { value: SIZE * 10 },
				uThickness1: { value: 1.0 },
				uThickness2: { value: 1.0 },
			},
			vertexShader,
			fragmentShader,
		});

		const geometry = new THREE.PlaneGeometry(
			this.scene.sizes.width,
			this.scene.sizes.height,
		);
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.position.set(
			this.scene.sizes.width / 2,
			-this.scene.sizes.height / 2,
			0,
		);

		this.add(this.mesh);
	}

	public editMode(mode: boolean) {
		this.material.uniforms.uColor.value = mode
			? this.editColor
			: this.defaultColor;

		this.material.uniforms.uThickness2.value = mode ? 2.3 : 1.0;
	}

	public update(camera: THREE.Camera) {
		const pos = new THREE.Vector3();
		camera.getWorldPosition(pos);

		this.mesh.position.set(
			this.scene.sizes.width / 2 + pos.x,
			-this.scene.sizes.height / 2 + pos.y,
			0,
		);
	}

	public updateSize() {
		this.mesh.scale.set(this.scene.sizes.width, this.scene.sizes.height, 1);
	}
}
