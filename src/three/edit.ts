import type { SimulationDb } from "../db/class";
import type { Pos, WirePos } from "../utils/types";
import type { SimulationScene } from "./scene";
import type { WireMesh } from "./wire";

enum EditModeEnum {
	Neutral = 0,
	EditWire = 1,
}

export class EditMode {
	private db: SimulationDb;
	private mode: EditModeEnum = EditModeEnum.EditWire;
	private scene: SimulationScene;
	public editing = false;
	private wire: WireMesh | null = null;
	private wirePath: WirePos = [];

	constructor(scene: SimulationScene, db: SimulationDb) {
		this.scene = scene;
		this.db = db;

		console.log("Edit mode");
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
	}

	public toggleEditMode() {
		if (this.editing) {
			this.stopEditing();
		} else {
			this.startEditing();
		}
	}

	public startEditing() {
		this.editing = true;
		this.mode = EditModeEnum.EditWire;
		this.scene.grid.editMode(true);
	}

	public stopEditing() {
		this.escape();
		this.editing = false;
		this.scene.grid.editMode(false);
	}
}
