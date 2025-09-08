import type { SimulationDb } from "../../db/class";
import type { SimulationScene } from "../../scene";
import type { ComposantTypes, Pos } from "../../utils/types";
import type { Simulation } from "../simulation";
import type { EditHandler } from "./base";
import { ComponentEditHandler } from "./component";
import { DeleteEditHandler } from "./delete";
import { WireEditHandler } from "./wire";

export enum EditModeEnum {
	Wire = 1,
	Component = 2,
	Delete = 3,
}

export class EditMode {
	private handlers: Record<EditModeEnum, EditHandler>;
	private current: EditHandler;
	public editing = false;
	private stopEditingCallbacks: (() => void)[] = [];
	private componentHandler: ComponentEditHandler;

	constructor(
		private scene: SimulationScene,
		private db: SimulationDb,
		private simulation: Simulation,
	) {
		this.componentHandler = new ComponentEditHandler(scene, db, simulation);

		this.handlers = {
			[EditModeEnum.Wire]: new WireEditHandler(scene, db, simulation),
			[EditModeEnum.Component]: this.componentHandler,
			[EditModeEnum.Delete]: new DeleteEditHandler(scene, db, simulation),
		};

		this.current = this.handlers[EditModeEnum.Wire];
	}

	async click(pos: Pos) {
		if (!this.editing) return;
		await this.current.click(pos);
	}

	async mousemove(pos: Pos, event?: MouseEvent) {
		if (!this.editing) return;
		await this.current.mousemove(pos, event);
	}

	async escape() {
		if (!this.editing) return;
		await this.current.escape();
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
		this.setEditMode(mode);
		this.scene.grid.editMode(true);
	}

	public stopEditing() {
		this.escape();
		this.editing = false;
		this.scene.grid.editMode(false);
		this.componentHandler.clearAll();
		this.stopEditingCallbacks.forEach((cb) => cb());
	}

	public onStopEditing(callback: () => void) {
		this.stopEditingCallbacks.push(callback);
	}

	public setEditMode(mode: EditModeEnum) {
		this.escape();
		if (!this.editing) this.startEditing(mode);
		this.current = this.handlers[mode];
	}

	public setComponentEditMode(mode: ComposantTypes, pos: Pos | null) {
		this.setEditMode(EditModeEnum.Component);
		this.componentHandler.setComponentMode(mode, pos);
	}

	public rotateComponent(pos: Pos | null) {
		if (this.current !== this.componentHandler) return;
		this.componentHandler.rotateComponent(pos);
	}
}
