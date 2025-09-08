import { ComposantTypes, Orientation, type Pos } from "../../utils/types";
import type { Gate } from "./../components/gate/gate";
import type { Switch } from "./../components/switch";
import { BaseEditHandler } from "./base";

export class ComponentEditHandler extends BaseEditHandler {
	private component: Gate | Switch | null = null;
	private newComponents: (Gate | Switch)[] = [];
	private orientation: Orientation = Orientation.Right;
	private componentMode: ComposantTypes = ComposantTypes.BufferGate;

	async click([x, y]: Pos) {
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

	async mousemove([x, y]: Pos) {
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

	async escape() {
		if (!this.component) return;
		this.scene.remove(this.component);
		this.component.clear();
		this.component = null;
	}

	setComponentMode(mode: ComposantTypes, pos: Pos | null) {
		this.escape();
		this.componentMode = mode;
		if (pos) this.mousemove(pos);
	}

	rotateComponent(pos: Pos | null) {
		this.orientation = (this.orientation + 1) % 4;
		if (pos) this.mousemove(pos);
	}

	clearAll() {
		this.newComponents.forEach((comp) => {
			this.scene.remove(comp);
			comp.clear();
		});
		this.newComponents = [];
	}
}
