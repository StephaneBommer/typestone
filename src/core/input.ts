import * as THREE from "three";
import type { SimulationDb } from "../db/class";
import type { SimulationScene } from "../scene";
import { ComposantTypes, type Pos } from "../utils/types";
import { type EditMode, EditModeEnum } from "./edit";
import type { Simulation } from "./simulation";

export class InputHandler {
	private raycaster: THREE.Raycaster;
	private plane: THREE.Plane;
	private scene: SimulationScene;
	private gridSize: number;
	private simulation: Simulation;
	private editMode: EditMode;
	private lastMousePos: Pos | null = null;
	private db: SimulationDb;
	constructor(
		scene: SimulationScene,
		gridSize: number,
		editMode: EditMode,
		simulation: Simulation,
		db: SimulationDb,
	) {
		this.raycaster = new THREE.Raycaster();
		this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		this.scene = scene;
		this.gridSize = gridSize;
		this.simulation = simulation;
		this.editMode = editMode;
		this.db = db;

		this.addEventListeners();
	}

	private addEventListeners() {
		this.scene.canvas.addEventListener(
			"dblclick",
			this.handleDblClick.bind(this),
		);
		this.scene.canvas.addEventListener("click", this.handleClick.bind(this));
		this.scene.canvas.addEventListener(
			"mousemove",
			this.handleMouseMove.bind(this),
		);
		window.addEventListener("keyup", (event) => {
			if (event.key === "Escape") {
				this.handlePressEscape(event);
			}
			if (event.key === "r") {
				this.editMode.rotateComponent(this.lastMousePos);
			}
			if (event.key === "e") {
				this.editMode.toggleEditMode();
			}
			if (event.key === "@") {
				this.editMode.setEditMode(EditModeEnum.Wire);
			}
			if (event.key === "d") {
				this.editMode.setEditMode(EditModeEnum.Delete);
			}
			if (event.key === "&") {
				this.editMode.setComponentEditMode(
					ComposantTypes.Switch,
					this.lastMousePos,
				);
			}
			if (event.key === "é") {
				this.editMode.setComponentEditMode(
					ComposantTypes.BufferGate,
					this.lastMousePos,
				);
			}
			if (event.key === '"') {
				this.editMode.setComponentEditMode(
					ComposantTypes.NotGate,
					this.lastMousePos,
				);
			}
			if (event.key === "'") {
				this.editMode.setComponentEditMode(
					ComposantTypes.TimerGate,
					this.lastMousePos,
				);
			}
			if (event.key === "(") {
				this.editMode.setComponentEditMode(
					ComposantTypes.AndGate,
					this.lastMousePos,
				);
			}
			if (event.key === "§") {
				this.editMode.setComponentEditMode(
					ComposantTypes.OrGate,
					this.lastMousePos,
				);
			}
			if (event.key === "è") {
				this.editMode.setComponentEditMode(
					ComposantTypes.XorGate,
					this.lastMousePos,
				);
			}
			if (event.key === "!") {
				this.editMode.setComponentEditMode(
					ComposantTypes.LatchGate,
					this.lastMousePos,
				);
			}
			if (event.key === "Backspace") {
				this.db.resetDb();
				this.editMode.stopEditing();
			}
		});
	}

	private handlePressEscape(event: KeyboardEvent) {
		this.editMode.escape();
	}

	private handleClick(event: MouseEvent) {
		const positions = this.findPositionOnGrid(event);
		if (!positions) return;

		this.editMode.click(positions);
		if (this.editMode.editing) return;
		const switchs = this.simulation.get_switchs();

		switchs.forEach((swi) => {
			swi.isClicked(positions) &&
				typeof swi.key === "number" &&
				this.simulation.toggle_switch(swi.key);
		});
	}

	private handleMouseMove(event: MouseEvent) {
		const positions = this.findPositionOnGrid(event);
		if (!positions) return;

		if (
			this.lastMousePos &&
			positions[0] === this.lastMousePos[0] &&
			positions[1] === this.lastMousePos[1]
		) {
			return;
		}
		this.lastMousePos = positions;
		this.editMode.mousemove(positions, event);
	}

	private findPositionOnGrid(event: MouseEvent): Pos | null {
		const rect = this.scene.canvas.getBoundingClientRect();
		const mouse = new THREE.Vector2(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);

		this.raycaster.setFromCamera(mouse, this.scene.camera);

		const intersection = new THREE.Vector3();

		if (this.raycaster.ray.intersectPlane(this.plane, intersection)) {
			const gridX = Math.floor(intersection.x / this.gridSize);
			const gridY = -Math.floor(intersection.y / this.gridSize);

			return [gridX, gridY];
		}
		return null;
	}

	private handleDblClick(event: MouseEvent) {
		const position = this.findPositionOnGrid(event);
		if (!position) return;

		const [gridX, gridY] = position;

		console.log(`Position sur la grille : (${gridX}, ${gridY})`);
		navigator.clipboard.writeText(`[${gridX}, ${gridY}]`);
	}
}
