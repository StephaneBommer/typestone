import type { Component } from "../../scene/elements/component";
import { ComposantTypes, Orientation, type Pos } from "../../utils/types";
import { BaseEditHandler } from "./base";

export class ComponentEditHandler extends BaseEditHandler {
	private component: Component | null = null;
	private newComponents: Component[] = [];
	private orientation: Orientation = Orientation.Right;
	private componentMode: ComposantTypes = ComposantTypes.BufferGate;

	async click([x, y]: Pos) {
		if (this.component) {
			this.scene.remove(this.component);
			this.component.clear();
		}

		const ticks =
			this.componentMode === ComposantTypes.TimerGate ? 1 : undefined;
		const { id } = await this.db.addComponent(
			this.componentMode,
			[x, y],
			this.orientation,
			ticks,
		);
		this.simulation.addComponent({
			key: id,
			value: {
				positions: [x, y],
				type: this.componentMode,
				orientation: this.orientation,
				ticks,
			},
		});
	}

	async mousemove([x, y]: Pos) {
		if (this.component) {
			this.scene.remove(this.component);
			this.component.clear();
		}
		this.component = this.scene.creator.createComponent({
			value: {
				type: this.componentMode,
				positions: [x, y],
				orientation: this.orientation,
			},
		});
		this.scene.add(this.component);
	}

	async escape() {
		if (!this.component) return;
		this.scene.remove(this.component);
		this.component.clear();
		this.component = null;
	}

	public async setComponentMode(mode: ComposantTypes, pos: Pos | null) {
		await this.escape();
		this.componentMode = mode;
		if (pos) this.mousemove(pos);
	}

	public rotateComponent(pos: Pos | null) {
		this.orientation = (this.orientation + 1) % 4;
		if (pos) this.mousemove(pos);
	}

	public clearAll() {
		this.newComponents.forEach((comp) => {
			this.scene.remove(comp);
			comp.clear();
		});
		this.newComponents = [];
	}
}
