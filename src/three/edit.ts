import type { SimulationDb } from "../db/class";
import {
	ElementTypes,
	Orientation,
	type Pos,
	type WirePos,
} from "../utils/types";
import type { Gate } from "./components/gate/gate";
import type { Switch } from "./components/switch";
import type { SimulationScene } from "./scene";
import type { WireMesh } from "./wire";

export enum EditModeEnum {
	Neutral = 0,
	EditWire = 1,
	EditComponent = 2,
}

export class EditMode {
	private db: SimulationDb;
	private mode: EditModeEnum = EditModeEnum.EditWire;
	private componentMode: ElementTypes = ElementTypes.BufferGate;
	private scene: SimulationScene;
	public editing = false;
	private wire: WireMesh | null = null;
	private component: Gate | Switch | null = null;
	private newComponents: (Gate | Switch)[] = [];
	private wirePath: WirePos = [];
	private orientation: Orientation = Orientation.Right;
	private stopEditingCallbacks: (() => void)[] = [];

	constructor(scene: SimulationScene, db: SimulationDb) {
		this.scene = scene;
		this.db = db;
	}

	public async click([x, y]: Pos) {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.EditWire) {
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
		if (this.mode === EditModeEnum.EditComponent) {
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
				this.componentMode === ElementTypes.TimerGate ? 100 : undefined,
			);
		}
	}

	public mousemove([x, y]: Pos) {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.EditWire) {
			if (!this.wire) return;

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
		if (this.mode === EditModeEnum.EditComponent) {
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
	}

	public async escape() {
		if (!this.editing) return;
		if (this.mode === EditModeEnum.EditWire) {
			if (!this.wire) return;
			this.wirePath.pop();

			const wire = await this.db.addWire(this.wirePath);
			this.scene.addWires([wire]);

			this.scene.remove(this.wire);
			this.wirePath = [];
			this.wire.clear();
			this.wire = null;
		}
		if (this.mode === EditModeEnum.EditComponent) {
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

	public startEditing(mode: EditModeEnum = EditModeEnum.EditWire) {
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

	public setComponentEditMode(mode: ElementTypes, pos: Pos | null) {
		this.startEditing(EditModeEnum.EditComponent);
		this.componentMode = mode;

		pos && this.mousemove(pos);
	}

	public rotateComponent(pos: Pos | null) {
		if (this.mode !== EditModeEnum.EditComponent) return;
		this.orientation = (this.orientation + 1) % 4;

		pos && this.mousemove(pos);
	}
}
