import Stats from "stats.js";
import * as THREE from "three";
import {
	EffectComposer,
	OrbitControls,
	RenderPass,
	UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import type { GetComponents, GetWires, getAllComponents } from "../db/type";
import { ComposantTypes, ElementTypes } from "../utils/types";
import { ComponentsCreator } from "./components/creator";
import type { OneInputGate } from "./components/gate/oneInputGate";
import type { TwoInputsGate } from "./components/gate/twoInputsGate";
import type { Switch } from "./components/switch";
import { Grid } from "./grid";
import type { WireMesh } from "./wire";

type ComponentMesh = TwoInputsGate | OneInputGate | Switch;

export class SimulationScene extends THREE.Scene {
	private sizes: { width: number; height: number };
	public canvas: HTMLCanvasElement;
	public grid: Grid;
	public camera: THREE.OrthographicCamera;
	public lights: {
		ambientLight: THREE.AmbientLight;
		directionalLight: THREE.DirectionalLight;
	};
	public controls: OrbitControls;
	public renderer: THREE.WebGLRenderer;
	public composer: EffectComposer;
	public stats: Stats;
	public creator: ComponentsCreator;
	public components: {
		wires: Record<number, WireMesh>;
		andGates: Record<number, TwoInputsGate>;
		orGates: Record<number, TwoInputsGate>;
		xorGates: Record<number, TwoInputsGate>;
		notGates: Record<number, OneInputGate>;
		bufferGates: Record<number, OneInputGate>;
		latches: Record<number, TwoInputsGate>;
		timer: Record<number, OneInputGate>;
		switches: Record<number, Switch>;
	} = {
		wires: {},
		andGates: {},
		orGates: {},
		xorGates: {},
		notGates: {},
		bufferGates: {},
		latches: {},
		timer: {},
		switches: {},
	};

	constructor() {
		super();
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		this.canvas = this.createCanvas();
		this.grid = this.createGrid();
		this.camera = this.createCamera();
		this.lights = this.createLigths();
		this.controls = this.createControls();
		this.renderer = this.createRenderer();
		this.composer = this.createComposer();
		this.stats = this.createStats();
		this.creator = new ComponentsCreator();
		this.addResizeEvent();
		this.beforeUnloadEvent();
		// this.loadCameraState();
	}
	private beforeUnloadEvent() {
		window.addEventListener("beforeunload", () => {
			this.saveCameraState();
		});
	}

	private addResizeEvent() {
		window.addEventListener("resize", () => {
			this.sizes.width = window.innerWidth;
			this.sizes.height = window.innerHeight;

			this.camera.left = 0;
			this.camera.right = this.sizes.width;
			this.camera.top = 0;
			this.camera.bottom = -this.sizes.height;

			this.camera.updateProjectionMatrix();

			this.renderer.setSize(this.sizes.width, this.sizes.height);
			this.composer.setSize(this.sizes.width, this.sizes.height);
		});
	}

	private createCanvas() {
		const canvas = document.createElement("canvas");
		canvas.className = "webgl";
		document.body.appendChild(canvas);
		return canvas;
	}

	private createGrid() {
		const grid = new Grid(window.innerWidth, window.innerHeight);
		this.add(grid);
		return grid;
	}

	private createCamera() {
		const camera = new THREE.OrthographicCamera(
			0,
			this.sizes.width,
			0,
			-this.sizes.height,
			1,
			10000,
		);
		camera.position.z = 1000;
		this.add(camera);
		return camera;
	}

	private createLigths() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
		this.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
		directionalLight.position.set(0, 50, 100);
		this.add(directionalLight);

		return { ambientLight, directionalLight };
	}

	private createControls() {
		const controls = new OrbitControls(this.camera, this.canvas);
		controls.enableDamping = true;
		controls.enableRotate = false;
		controls.minZoom = 1;
		return controls;
	}

	private createRenderer() {
		const renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
		});
		renderer.setSize(this.sizes.width, this.sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		return renderer;
	}

	private createComposer() {
		const composer = new EffectComposer(this.renderer);
		composer.addPass(new RenderPass(this, this.camera));

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(this.sizes.width, this.sizes.height),
			0.4, // Strength
			0.8, // Radius
			0.2, // Threshold
		);
		composer.addPass(bloomPass);
		return composer;
	}

	private createStats() {
		const stats = new Stats();
		stats.showPanel(0);
		document.body.appendChild(stats.dom);
		return stats;
	}

	private loadCameraState = () => {
		const camX = localStorage.getItem("camX");
		const camY = localStorage.getItem("camY");
		const camZ = localStorage.getItem("camZ");
		const zoom = localStorage.getItem("zoom");

		if (camX && camY && camZ && zoom) {
			this.camera.position.set(
				Number.parseFloat(camX),
				Number.parseFloat(camY),
				Number.parseFloat(camZ),
			);
			this.camera.zoom = Number.parseFloat(zoom);
			this.camera.updateProjectionMatrix();
		}

		const targetX = localStorage.getItem("targetX");
		const targetY = localStorage.getItem("targetY");
		const targetZ = localStorage.getItem("targetZ");
		if (targetX && targetY && targetZ) {
			this.controls.target.set(
				Number.parseFloat(targetX),
				Number.parseFloat(targetY),
				Number.parseFloat(targetZ),
			);
		}

		this.controls.update();
	};

	private saveCameraState = () => {
		localStorage.setItem("camX", this.camera.position.x.toString());
		localStorage.setItem("camY", this.camera.position.y.toString());
		localStorage.setItem("camZ", this.camera.position.z.toString());
		localStorage.setItem("zoom", this.camera.zoom.toString());

		localStorage.setItem("targetX", this.controls.target.x.toString());
		localStorage.setItem("targetY", this.controls.target.y.toString());
		localStorage.setItem("targetZ", this.controls.target.z.toString());
	};

	public addWires(wires: GetWires) {
		wires.forEach(({ value, key }) => {
			const mesh = this.creator.Wire(value.positions);
			this.add(mesh);
			this.components.wires[key] = mesh;
		});
	}

	public addAndGate(andGates: GetComponents) {
		andGates.forEach(({ value, key }) => {
			const mesh = this.creator.AndGate(value.positions, value.orientation);
			this.add(mesh);
			this.components.andGates[key] = mesh;
		});
	}

	public addOrGate(orGates: GetComponents) {
		orGates.forEach(({ value, key }) => {
			const mesh = this.creator.OrGate(value.positions, value.orientation);
			this.add(mesh);
			this.components.orGates[key] = mesh;
		});
	}

	public addXorGate(xorGates: GetComponents) {
		xorGates.forEach(({ value, key }) => {
			const mesh = this.creator.XorGate(value.positions, value.orientation);
			this.add(mesh);
			this.components.xorGates[key] = mesh;
		});
	}

	public addNotGate(notGates: GetComponents) {
		notGates.forEach(({ value, key }) => {
			const mesh = this.creator.NotGate(value.positions, value.orientation);
			this.add(mesh);
			this.components.notGates[key] = mesh;
		});
	}

	public addBufferGate(bufferGates: GetComponents) {
		bufferGates.forEach(({ value, key }) => {
			const mesh = this.creator.BufferGate(value.positions, value.orientation);
			this.add(mesh);
			this.components.bufferGates[key] = mesh;
		});
	}

	public addLatches(latches: GetComponents) {
		latches.forEach(({ value, key }) => {
			const mesh = this.creator.Latch(value.positions, value.orientation);
			this.add(mesh);
			this.components.latches[key] = mesh;
		});
	}

	public addTimer(timer: GetComponents) {
		timer.forEach(({ value, key }) => {
			const mesh = this.creator.Timer(value.positions, value.orientation);
			this.add(mesh);
			this.components.timer[key] = mesh;
		});
	}

	public addSwitch(switches: GetComponents) {
		switches.forEach(({ value, key }) => {
			const mesh = this.creator.Switch(value.positions, key);
			this.add(mesh);
			this.components.switches[key] = mesh;
		});
	}

	public addComponents(dbComponents: getAllComponents) {
		const { [ElementTypes.Wire]: wires, [ElementTypes.Component]: components } =
			dbComponents;
		this.addWires(wires);
		components.forEach((component) => {
			switch (component.value.type) {
				case ComposantTypes.AndGate:
					this.addAndGate([component]);
					break;
				case ComposantTypes.OrGate:
					this.addOrGate([component]);
					break;
				case ComposantTypes.XorGate:
					this.addXorGate([component]);
					break;
				case ComposantTypes.NotGate:
					this.addNotGate([component]);
					break;
				case ComposantTypes.BufferGate:
					this.addBufferGate([component]);
					break;
				case ComposantTypes.LatchGate:
					this.addLatches([component]);
					break;
				case ComposantTypes.TimerGate:
					this.addTimer([component]);
					break;
				case ComposantTypes.Switch:
					this.addSwitch([component]);
					break;
			}
		});
	}

	public resetScene() {
		Object.values(this.components.wires).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.andGates).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.orGates).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.xorGates).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.notGates).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.bufferGates).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.latches).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.timer).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});
		Object.values(this.components.switches).forEach((mesh) => {
			this.remove(mesh);
			mesh.clear?.();
		});

		this.components = {
			wires: {},
			andGates: {},
			orGates: {},
			xorGates: {},
			notGates: {},
			bufferGates: {},
			latches: {},
			timer: {},
			switches: {},
		};
	}
}
