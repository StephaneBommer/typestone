import * as THREE from "three";
import type { Pos } from "../utils/types";
import type { EditMode } from "./edit";
import type { SimulationScene } from "./scene";
import type { Simulation } from "./simulation";
import type { WireMesh } from "./wire";

export class GridClickHandler {
	private raycaster: THREE.Raycaster;
	private plane: THREE.Plane;
	private scene: SimulationScene;
	private gridSize: number;
	private simulation: Simulation;
	private wire: WireMesh | null = null;
	private wirePath: number[][] = [];
	private editing = false;
	private editMode: EditMode;

	constructor(
		scene: SimulationScene,
		gridSize: number,
		simulation: Simulation,
		editMode: EditMode,
	) {
		this.raycaster = new THREE.Raycaster();
		this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
		this.scene = scene;
		this.gridSize = gridSize;
		this.simulation = simulation;
		this.editMode = editMode;

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
		window.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				this.handlePressEscape(event);
			}
			if (event.key === "e") {
				this.editMode.toggleEditMode();
			}
		});
	}

	private handlePressEscape(event: KeyboardEvent) {
		this.editMode.escape();
	}

	private handleClick(event: MouseEvent) {
		const positions = this.findPositionOnGrid(event);
		if (!positions) return;
		const [gridX, gridY] = positions;

		this.editMode.click(positions);
		if (this.editMode.editing) return;
		const switchs = this.simulation.get_switchs();

		switchs.forEach((swi) => {
			const pos = [swi.pos[0] - 2, swi.pos[1]];
			if (
				gridX >= pos[0] - 1 &&
				gridX <= pos[0] + 1 &&
				gridY <= pos[1] + 1 &&
				gridY >= pos[1] - 1
			) {
				this.simulation.toggle_switch(swi.comp_id);
			}
		});
	}

	private handleMouseMove(event: MouseEvent) {
		const positions = this.findPositionOnGrid(event);
		if (!positions) return;

		this.editMode.mousemove(positions);
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
