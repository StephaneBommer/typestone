import type { SimulationDb } from "../../db/class";
import type { SimulationScene } from "../../scene";
import type { ComposantTypes, Pos } from "../../utils/types";
import type { Simulation } from "../simulation";
import type { EditHandler } from "./base";
import { ComponentEditHandler } from "./component";
import { DeleteEditHandler } from "./delete";
import { SelectEditHandler } from "./select";
import { WireEditHandler } from "./wire";

export enum EditModeEnum {
	Wire = 1,
	Component = 2,
	Delete = 3,
	Select = 4,
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
			[EditModeEnum.Select]: new SelectEditHandler(scene, db, simulation),
		};

		this.current = this.handlers[EditModeEnum.Wire];
	}

	async click(pos: Pos, event?: MouseEvent) {
		if (!this.editing) return;
		await this.current.click(pos, event);
	}

	async mousemove(pos: Pos, event?: MouseEvent) {
		if (!this.editing) return;
		await this.current.mousemove(pos, event);
	}

	async escape() {
		if (!this.editing) return;
		await this.current.escape();
	}

	public setShift(multi: boolean) {
		if (!this.editing) return;
		if (!this.current.setShift) return;
		this.current.setShift(multi);
	}

	public right() {
		if (!this.editing) return;
		if (!this.current.right) return;
		this.current.right();
	}

	public left() {
		if (!this.editing) return;
		if (!this.current.left) return;
		this.current.left();
	}

	public up() {
		if (!this.editing) return;
		if (!this.current.up) return;
		this.current.up();
	}

	public down() {
		if (!this.editing) return;
		if (!this.current.down) return;
		this.current.down();
	}

	public copy() {
		if (!this.editing) return;
		if (!this.current.copy) return;
		this.current.copy();
	}

	public paste() {
		if (!this.editing) return;
		if (!this.current.paste) return;
		this.current.paste();
	}

	public apply() {
		if (!this.editing) return;
		if (!this.current.apply) return;
		this.current.apply();
	}

	public delete() {
		if (!this.editing) return;
		if (!this.current.delete) return;
		this.current.delete();
	}

	public setSelection(start: Pos, end: Pos) {
		if (!this.editing) return;
		if (!this.current.setSelection) return;
		this.current.setSelection([start[0], start[1]], [end[0], end[1]]);
	}

	public releaseSelection(start: Pos, end: Pos) {
		if (!this.editing) return;
		if (!this.current.releaseSelection) return;
		this.current.releaseSelection(start, end);
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

	public async stopEditing() {
		await this.escape();
		this.editing = false;
		this.scene.grid.editMode(false);
		this.componentHandler.clearAll();
		this.stopEditingCallbacks.forEach((cb) => cb());
	}

	public onStopEditing(callback: () => void) {
		this.stopEditingCallbacks.push(callback);
	}

	public async setEditMode(mode: EditModeEnum) {
		await this.escape();
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
