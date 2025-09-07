import type { SimulationDb } from "../db/class";
import {
	ComposantTypes,
	Orientation,
	type Pos,
	type WirePos,
} from "../utils/types";
import type { Gate } from "./components/gate/gate";
import type { Switch } from "./components/switch";
import type { SimulationScene } from "./scene";
import type { Simulation } from "./simulation";
import type { WireMesh } from "./wire";

export enum EditModeEnum {
	Neutral = 0,
	Wire = 1,
	Component = 2,
	Delete = 3,
}

export class EditMode {
	private db: SimulationDb;
	private mode: EditModeEnum = EditModeEnum.Wire;
	private componentMode: ComposantTypes = ComposantTypes.BufferGate;
	private scene: SimulationScene;
	public editing = false;
	private wire: WireMesh | null = null;
	private component: Gate | Switch | null = null;
	private newComponents: (Gate | Switch)[] = [];
	private wirePath: WirePos = [];
	private orientation: Orientation = Orientation.Right;
	private stopEditingCallbacks: (() => void)[] = [];
	private simulation: Simulation;
	private componentDeleting: {
		mesh: Gate | Switch;
		id: number;
	} | null = null;
	constructor(
		scene: SimulationScene,
		db: SimulationDb,
		simulation: Simulation,
	) {
		this.scene = scene;
		this.db = db;
		this.simulation = simulation;
	}

	public async click([x, y]: Pos) {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.Wire) {
			if (this.wire) {
				this.scene.remove(this.wire);
				this.wire.clear();
			}
			if (this.wirePath.length === 0) {
				this.wirePath.push([x, y], [x, y]);
			} else {
				this.wirePath.push([x, y]);
			}

			this.wire = this.scene.creator.Wire(this.wirePath);
			this.scene.add(this.wire);
		}
		if (this.mode === EditModeEnum.Component) {
			if (this.component) {
				this.scene.remove(this.component);
				this.component.clear();
			}
			const newComponent = this.scene.creator.createComponent(
				this.componentMode,
				[x, y],
				this.orientation,
			);
			this.scene.add(newComponent);
			this.newComponents.push(newComponent);
			await this.db.addComponent(
				this.componentMode,
				[x, y],
				this.orientation,
				this.componentMode === ComposantTypes.TimerGate ? 100 : undefined,
			);
		}
		if (this.mode === EditModeEnum.Delete) {
			const obj = await this.db.getElementFromPosition([x, y]);
			if (!obj) return;

			if (this.componentDeleting) {
				this.scene.remove(this.componentDeleting.mesh);
				this.db.deleteComponent(this.componentDeleting.id);
				this.componentDeleting.mesh.clear();
				this.componentDeleting = null;
			}
		}
	}

	public async mousemove([x, y]: Pos) {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.Wire) {
			if (this.wirePath.length === 0) {
				if (this.wire) {
					this.scene.remove(this.wire);
					this.wire.clear();
					this.wire = null;
				}
				this.wire = this.scene.creator.Wire([
					[x, y],
					[x, y],
				]);
				this.scene.add(this.wire);
				return;
			}

			const lastPos = this.wirePath[this.wirePath.length - 2];
			const [lastX, lastY] = lastPos;

			if (this.wire) {
				this.scene.remove(this.wire);
				this.wire.clear();
			}

			const xOffset = Math.abs(x - lastX);
			const yOffset = Math.abs(y - lastY);

			if (xOffset > yOffset) {
				this.wirePath[this.wirePath.length - 1][0] = x;
				this.wirePath[this.wirePath.length - 1][1] = lastY;
			} else {
				this.wirePath[this.wirePath.length - 1][1] = y;
				this.wirePath[this.wirePath.length - 1][0] = lastX;
			}
			this.wire = this.scene.creator.Wire(this.wirePath);
			this.scene.add(this.wire);
		}
		if (this.mode === EditModeEnum.Component) {
			if (this.component) {
				this.scene.remove(this.component);
				this.component.clear();
			}
			this.component = this.scene.creator.createComponent(
				this.componentMode,
				[x, y],
				this.orientation,
			);
			this.scene.add(this.component);
		}
		if (this.mode === EditModeEnum.Delete) {
			const obj = await this.db.getElementFromPosition([x, y]);

			if (
				this.componentDeleting &&
				((obj && obj.id !== this.componentDeleting.id) || !obj)
			) {
				this.componentDeleting.mesh.setDeleting(false);
				this.componentDeleting = null;
			}

			if (!obj) return;

			this.componentDeleting = {
				mesh: this.simulation.components[obj.id],
				id: obj.id,
			};
			this.componentDeleting.mesh.setDeleting(true);
		}
	}

	public async escape() {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.Wire) {
			if (!this.wire) return;
			this.wirePath.pop();

			const wire = await this.db.addWire(this.wirePath);
			this.scene.addWires([wire]);

			this.scene.remove(this.wire);
			this.wirePath = [];
			this.wire.clear();
			this.wire = null;
		}
		if (this.mode === EditModeEnum.Component) {
			if (!this.component) return;

			this.scene.remove(this.component);
			this.component.clear();
			this.component = null;
		}
	}

	public toggleEditMode() {
		if (this.editing) {
			this.stopEditing();
		} else {
			this.startEditing();
		}
	}

	public startEditing(mode: EditModeEnum = EditModeEnum.Wire) {
		this.editing = true;
		this.mode = mode;
		this.scene.grid.editMode(true);
	}

	public stopEditing() {
		this.escape();
		this.editing = false;
		this.scene.grid.editMode(false);
		this.newComponents.map((comp) => {
			this.scene.remove(comp);
			comp.clear();
		});
		this.stopEditingCallbacks.forEach((cb) => cb());
	}

	public onStopEditing(callback: () => void) {
		this.stopEditingCallbacks.push(callback);
	}

	public setEditMode(mode: EditModeEnum) {
		this.escape();
		if (!this.editing) this.startEditing(mode);
		this.mode = mode;
	}

	public setComponentEditMode(mode: ComposantTypes, pos: Pos | null) {
		this.escape();
		this.startEditing(EditModeEnum.Component);
		this.componentMode = mode;

		pos && this.mousemove(pos);
	}

	public rotateComponent(pos: Pos | null) {
		if (this.mode !== EditModeEnum.Component) return;
		this.orientation = (this.orientation + 1) % 4;

		pos && this.mousemove(pos);
	}
}
