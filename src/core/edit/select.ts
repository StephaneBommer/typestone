import type { ElementMesh } from "../../scene/elements";
import { Component } from "../../scene/elements/component";
import { Wire } from "../../scene/elements/wire";
import { COPY_OFFSET_X, COPY_OFFSET_Y } from "../../utils/constants";
import type { ComposantTypes, Pos, WirePos } from "../../utils/types";
import { BaseEditHandler } from "./base";

export class SelectEditHandler extends BaseEditHandler {
	private elementsSelected: {
		mesh: ElementMesh;
		id: number;
	}[] = [];
	private elementsCopied: {
		mesh: ElementMesh;
		id: number;
	}[] = [];
	private shift = false;
	private shiftX = 0;
	private shiftY = 0;
	private isLoading = false;

	async click(_: Pos, event?: MouseEvent) {
		if (!event) return;
		await this.pushChanges();

		const object = this.scene.intersectElements([event.clientX, event.clientY]);
		if (!object || object.key === undefined) return;

		const id = object.key;

		const alreadySelected = this.elementsSelected.some((el) => el.id === id);

		if (alreadySelected && this.shift) {
			this.elementsSelected = this.elementsSelected.filter(
				(el) => el.id !== id,
			);
		} else if (this.shift) {
			this.elementsSelected = [...this.elementsSelected, { mesh: object, id }];
		} else {
			this.elementsSelected = [{ mesh: object, id }];
		}

		this.updateOutline();
	}

	private updateOutline() {
		this.scene.setOutlineObjects(this.elementsSelected.map((el) => el.mesh));
	}

	public async mousemove() {}

	public async escape() {
		await this.pushChanges();
		this.elementsSelected = [];
		this.scene.setOutlineObjects([]);
	}

	public setShift(multi: boolean) {
		this.shift = multi;
	}

	public right() {
		if (this.isLoading) return;
		this.moveSelected(1, 0);
	}
	public left() {
		if (this.isLoading) return;
		this.moveSelected(-1, 0);
	}
	public up() {
		if (this.isLoading) return;
		this.moveSelected(0, -1);
	}
	public down() {
		if (this.isLoading) return;
		this.moveSelected(0, 1);
	}

	public async copy() {
		if (this.elementsSelected.length === 0) return;
		await this.pushChanges();
		this.elementsCopied = this.elementsSelected.map((el) => ({ ...el }));
	}

	public async apply() {
		if (this.isLoading) return;
		await this.pushChanges();
		this.elementsSelected = [];
		this.scene.setOutlineObjects([]);
	}

	public async paste() {
		if (this.isLoading) return;
		if (this.elementsCopied.length === 0) return;
		this.isLoading = true;
		await this.pushChanges();
		const newElements = await Promise.all(
			this.elementsCopied.map(async (el) => {
				if (el.mesh instanceof Wire) {
					const newPositions: WirePos = el.mesh.wirePos.map((pos) => [
						pos[0] + COPY_OFFSET_X,
						pos[1] + COPY_OFFSET_Y,
					]);

					const newId = await this.db.addWire(newPositions);

					const mesh = this.simulation.addWire({
						key: newId.key,
						value: { positions: newPositions },
					});

					return { mesh, id: newId.key };
				}

				if (el.mesh instanceof Component) {
					const newPos: Pos = [
						el.mesh.pos[0] + COPY_OFFSET_X,
						el.mesh.pos[1] + COPY_OFFSET_Y,
					];
					const newId = await this.db.addComponent(
						el.mesh.type as ComposantTypes,
						newPos,
						el.mesh.orientation,
						el.mesh.ticks,
					);
					const mesh = this.simulation.addComponent({
						key: newId.id,
						value: {
							type: el.mesh.type,
							orientation: el.mesh.orientation,
							positions: newPos,
							ticks: el.mesh.ticks,
						},
					});
					return { mesh, id: newId.id };
				}
			}),
		);

		this.elementsSelected = newElements as { mesh: ElementMesh; id: number }[];
		this.updateOutline();
		this.isLoading = false;
	}

	private async pushChanges() {
		if (!this.shiftX && !this.shiftY) return;
		const isAlreadyLoading = this.isLoading;
		this.isLoading = true;

		for (const { mesh, id } of this.elementsSelected) {
			if (mesh instanceof Wire) {
				const wire = await this.db.getWireByKey(id);
				if (!wire) continue;

				const newPositions: WirePos = wire.value.positions.map((pos) => [
					pos[0] + this.shiftX,
					pos[1] + this.shiftY,
				]);

				await this.db.updateWire(id, newPositions);
			} else if (mesh instanceof Component) {
				const component = await this.db.getComponentByKey(id);
				if (!component) continue;

				const [px, py] = component.value.positions;
				await this.db.updateComponent(id, {
					positions: [px + this.shiftX, py + this.shiftY],
				});
			}
		}

		this.shiftX = 0;
		this.shiftY = 0;
		if (!isAlreadyLoading) this.isLoading = false;
	}

	private moveSelected(x: number, y: number) {
		if (this.elementsSelected.length === 0) return;

		const shifted = this.shift ? 5 : 1;

		for (const { mesh } of this.elementsSelected) {
			if (mesh instanceof Wire) {
				mesh.translate(x * shifted, y * shifted);
			} else if (mesh instanceof Component) {
				mesh.translate(x * shifted, y * shifted);
			}
		}

		this.shiftX += x * shifted;
		this.shiftY += y * shifted;
	}

	public delete() {
		if (this.elementsSelected.length === 0) return;

		this.elementsSelected.forEach(({ mesh, id }) => {
			this.scene.remove(mesh);
			if (mesh instanceof Wire) {
				this.db.deleteWire(id);
			} else {
				this.db.deleteComponent(id);
			}
			mesh.clear();
		});
		this.elementsSelected = [];
		this.scene.setOutlineObjects([]);
	}

	public setSelection(start: Pos, end: Pos) {
		const extendPos = this.cumputeGridSelection(start, end);
		this.scene.setSelection(extendPos.start, extendPos.end);
	}

	public async releaseSelection(start: Pos, end: Pos) {
		await this.apply();

		const extendPos = this.cumputeGridSelection(start, end);

		const elements = this.scene.intersectElementsInRect(
			extendPos.start,
			extendPos.end,
		);

		this.elementsSelected = elements.map((mesh) => ({
			mesh,
			id: mesh.key as number,
		}));
		this.updateOutline();

		this.scene.clearSelection();
	}

	private cumputeGridSelection(start: Pos, end: Pos): { start: Pos; end: Pos } {
		const extendSelectionXs = [start[0], start[0] + 1, end[0], end[0] + 1];

		const minX = Math.min(...extendSelectionXs);
		const maxX = Math.max(...extendSelectionXs);

		const extendSelectionYs = [start[1], start[1] - 1, end[1], end[1] - 1];
		const minY = Math.min(...extendSelectionYs);
		const maxY = Math.max(...extendSelectionYs);

		return {
			start: [minX, minY],
			end: [maxX, maxY],
		};
	}
}
