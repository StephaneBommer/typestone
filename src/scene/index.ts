import * as THREE from "three";
import {
	EffectComposer,
	OrbitControls,
	OutlinePass,
	RenderPass,
	UnrealBloomPass,
} from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { SIZE, SKEW, ZOOM } from "../utils/constants";
import type { Pos } from "../utils/types";
import { Component } from "./elements/component";
import type { OneInputGate } from "./elements/component/gate/oneInputGate";
import type { TwoInputsGate } from "./elements/component/gate/twoInputsGate";
import type { Switch } from "./elements/component/switch";
import { ComponentsCreator } from "./elements/creator";
import { Wire } from "./elements/wire";
import { Grid } from "./grid";
import { SelectionMesh } from "./selection";

export class SimulationScene extends THREE.Scene {
	public sizes: { width: number; height: number };
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
	private outlinePass?: OutlinePass;
	public selectionMesh?: SelectionMesh;
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
		this.camera = this.createCamera();
		this.grid = this.createGrid();
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

			this.camera.left = -this.sizes.width / 2;
			this.camera.right = this.sizes.width / 2;
			this.camera.top = this.sizes.height / 2;
			this.camera.bottom = -this.sizes.height / 2;

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
		const grid = new Grid(this);
		this.add(grid);
		return grid;
	}

	private createCamera() {
		const camera = new THREE.OrthographicCamera(
			-this.sizes.width / 2,
			this.sizes.width / 2,
			this.sizes.height / 2,
			-this.sizes.height / 2,
			1,
			100,
		);

		camera.zoom = ZOOM;
		camera.updateProjectionMatrix();
		camera.position.set(0, 0, 100);
		camera.lookAt(0, 0, 0);
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

		this.outlinePass = new OutlinePass(
			new THREE.Vector2(this.sizes.width, this.sizes.height),
			this,
			this.camera,
		);
		this.outlinePass.edgeStrength = 2;
		this.outlinePass.edgeGlow = 0;
		this.outlinePass.edgeThickness = 1.0;
		composer.addPass(this.outlinePass);

		const filmPass = new FilmPass(0.1, false);
		composer.addPass(filmPass);

		const bloomPass = new UnrealBloomPass(
			new THREE.Vector2(this.sizes.width, this.sizes.height),
			0.39,
			0.8,
			0.2,
		);
		composer.addPass(bloomPass);

		return composer;
	}

	private createStats() {
		const stats = new Stats();
		stats.showPanel(1);
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

	public intersectElements(pos: Pos) {
		const rect = this.canvas.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((pos[0] - rect.left) / rect.width) * 2 - 1,
			-((pos[1] - rect.top) / rect.height) * 2 + 1,
		);
		this.raycaster.setFromCamera(mouse, this.camera);

		const filterChildren = this.children.filter(
			(child) => child instanceof Component || child instanceof Wire,
		);

		const intersects = this.raycaster.intersectObjects(filterChildren, true);
		const parent = intersects.length > 0 ? intersects[0].object.parent : null;
		const object =
			parent instanceof Component || parent instanceof Wire ? parent : null;

		return object;
	}

	public intersectElementsInRect(start: Pos, end: Pos) {
		const filterChildren = this.children.filter(
			(child) => child instanceof Component || child instanceof Wire,
		);

		const margin = SIZE * SKEW + SKEW * 0.1 * 0;

		const rectMinX = Math.min(start[0], end[0]) + margin;
		const rectMaxX = Math.max(start[0], end[0]) - margin;
		const rectMinY = Math.min(start[1], end[1]) + margin;
		const rectMaxY = Math.max(start[1], end[1]) - margin;

		const selected: (Component | Wire)[] = [];

		// helper rect
		const rectEdges: [[number, number], [number, number]][] = [
			[
				[rectMinX, rectMinY],
				[rectMaxX, rectMinY],
			],
			[
				[rectMaxX, rectMinY],
				[rectMaxX, rectMaxY],
			],
			[
				[rectMaxX, rectMaxY],
				[rectMinX, rectMaxY],
			],
			[
				[rectMinX, rectMaxY],
				[rectMinX, rectMinY],
			],
		];

		const rectContains = (x: number, y: number) =>
			x >= rectMinX && x <= rectMaxX && y >= rectMinY && y <= rectMaxY;

		filterChildren.forEach((child) => {
			let intersects = false;

			child.traverse((obj) => {
				if ((obj as THREE.Mesh).isMesh) {
					const geometry = (obj as THREE.Mesh).geometry;
					const position = geometry.attributes.position;

					const vertex = new THREE.Vector3();
					const vertices: [number, number][] = [];

					for (let i = 0; i < position.count; i++) {
						vertex.fromBufferAttribute(position, i);
						obj.localToWorld(vertex);

						const gridX = Math.floor(vertex.x / SIZE);
						const gridY = -Math.floor(vertex.y / SIZE);
						vertices.push([gridX, gridY]);

						if (rectContains(gridX, gridY)) {
							intersects = true;
							break;
						}
					}

					if (!intersects && vertices.length > 1) {
						for (let i = 0; i < vertices.length; i++) {
							const a = vertices[i];
							const b = vertices[(i + 1) % vertices.length];

							if (
								this.segmentIntersectsRect(
									a,
									b,
									rectEdges,
									rectMinX,
									rectMaxX,
									rectMinY,
									rectMaxY,
								)
							) {
								intersects = true;
								break;
							}
						}
					}
				}
			});

			if (intersects) selected.push(child as Component | Wire);
		});

		return selected;
	}

	private segmentIntersectsRect(
		a: [number, number],
		b: [number, number],
		rectEdges: [[number, number], [number, number]][],
		minX: number,
		maxX: number,
		minY: number,
		maxY: number,
	): boolean {
		if (a[0] < minX && b[0] < minX) return false;
		if (a[0] > maxX && b[0] > maxX) return false;
		if (a[1] < minY && b[1] < minY) return false;
		if (a[1] > maxY && b[1] > maxY) return false;

		return rectEdges.some(([p1, p2]) => this.segmentsIntersect(a, b, p1, p2));
	}

	private segmentsIntersect(
		a: [number, number],
		b: [number, number],
		c: [number, number],
		d: [number, number],
	): boolean {
		function ccw(
			p1: [number, number],
			p2: [number, number],
			p3: [number, number],
		) {
			return (
				(p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0])
			);
		}
		return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
	}

	public setOutlineObjects(objects: THREE.Object3D[]) {
		if (!this.outlinePass) return;
		this.outlinePass.selectedObjects = objects;
	}

	public setSelection(start: Pos, end: Pos) {
		if (!this.selectionMesh) {
			this.selectionMesh = new SelectionMesh();
			this.add(this.selectionMesh);
		}
		this.selectionMesh.updateCorners(start, end);
	}

	public clearSelection() {
		if (!this.selectionMesh) return;
		this.remove(this.selectionMesh);
		this.selectionMesh = undefined;
	}
}
