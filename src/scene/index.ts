import Stats from "stats.js";
import * as THREE from "three";
import {
	EffectComposer,
	OrbitControls,
	RenderPass,
	UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import { ComponentsCreator } from "./elements";
import { Gate } from "./elements/gate";
import type { OneInputGate } from "./elements/gate/oneInputGate";
import type { TwoInputsGate } from "./elements/gate/twoInputsGate";
import { Switch } from "./elements/switch";
import { Wire } from "./elements/wire";
import { Grid } from "./grid";

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
	public raycaster: THREE.Raycaster;
	public components: {
		wires: Record<number, Wire>;
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
		this.raycaster = new THREE.Raycaster();
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

	public intersectElements(event: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);

		const filterChildren = this.children.filter(
			(child) =>
				child instanceof Gate ||
				child instanceof Switch ||
				child instanceof Wire,
		);

		const intersects = this.raycaster.intersectObjects(filterChildren, true);
		const parent = intersects.length > 0 ? intersects[0].object.parent : null;
		const object =
			parent instanceof Gate ||
			parent instanceof Switch ||
			parent instanceof Wire
				? parent
				: null;

		return object;
	}
}
