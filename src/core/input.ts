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
	private isSelecting = false;
	private selectionStart: Pos | null = null;
	private selectionEnd: Pos | null = null;
	private selectionMade = false;

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
		this.scene.canvas.addEventListener(
			"mousedown",
			this.handleMouseDown.bind(this),
		);
		this.scene.canvas.addEventListener(
			"mouseup",
			this.handleMouseUp.bind(this),
		);
		window.addEventListener("keydown", this.handleKeyDown.bind(this));
		window.addEventListener("keyup", this.handleKeyUp.bind(this));
	}

	private handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			this.editMode.escape();
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
		if (event.key === "s") {
			this.editMode.setEditMode(EditModeEnum.Select);
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
			// this.db.resetDb();
			this.editMode.delete();
		}
		if (event.key === "Shift") {
			this.editMode.setShift(true);
		}
		if (event.key === "ArrowRight") {
			this.editMode.right();
		}
		if (event.key === "ArrowLeft") {
			this.editMode.left();
		}
		if (event.key === "ArrowUp") {
			this.editMode.up();
		}
		if (event.key === "ArrowDown") {
			this.editMode.down();
		}

		if ((event.ctrlKey || event.metaKey) && event.key === "c") {
			this.editMode.copy();
		}

		if ((event.ctrlKey || event.metaKey) && event.key === "v") {
			this.editMode.paste();
		}

		if (event.key === "Enter") {
			this.editMode.apply();
		}
	}

	private handleKeyUp(event: KeyboardEvent) {
		if (event.key === "Shift") {
			this.editMode.setShift(false);
		}
	}

	private handleClick(event: MouseEvent) {
		if (this.selectionMade) {
			this.selectionMade = false;
			return;
		}

		const positions = this.findPositionOnGrid(event);
		if (!positions) return;

		this.editMode.click(positions, event);
		if (this.editMode.editing) return;
		const switchs = this.simulation.get_switchs();

		switchs.forEach((swi) => {
			swi.isClicked(positions) &&
				typeof swi.key === "number" &&
				this.simulation.toggle_switch(swi.key);
		});
	}

	private handleMouseDown(event: MouseEvent) {
		if (event.button !== 0) return;
		const pos = this.findPositionOnGrid(event);
		if (!pos) return;

		this.selectionStart = pos;
		this.isSelecting = true;
	}

	private handleMouseUp(event: MouseEvent) {
		if (!this.isSelecting) return;
		this.isSelecting = false;

		if (!this.selectionStart || !this.selectionEnd) return;
		if (
			this.selectionStart[0] !== this.selectionEnd[0] ||
			this.selectionStart[1] !== this.selectionEnd[1]
		) {
			this.editMode.releaseSelection(this.selectionStart, this.selectionEnd);
			this.selectionMade = true;
		}

		this.selectionStart = null;
		this.selectionEnd = null;

		event.stopImmediatePropagation();
	}

	private handleMouseMove(event: MouseEvent) {
		const pos = this.findPositionOnGrid(event);
		if (!pos) return;
		if (
			this.lastMousePos &&
			pos[0] === this.lastMousePos[0] &&
			pos[1] === this.lastMousePos[1]
		) {
			return;
		}

		if (this.isSelecting && this.selectionStart) {
			this.selectionEnd = pos;
			this.editMode.setSelection(this.selectionStart, this.selectionEnd);
		} else {
			this.lastMousePos = pos;
			this.editMode.mousemove(pos, event);
		}
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
