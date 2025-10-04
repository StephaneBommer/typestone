import type { CreateComponent, CreateWire } from "../../db/types";
import type { ElementMesh } from "../../scene/elements";
import { Component } from "../../scene/elements/component";
import { Wire } from "../../scene/elements/wire";
import { COPY_OFFSET_X, COPY_OFFSET_Y } from "../../utils/constants";
import type { Pos, WirePos } from "../../utils/types";
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

		const wiresToAdd: CreateWire["value"][] = [];
		const compsToAdd: CreateComponent["value"][] = [];

		this.elementsCopied.forEach((el) => {
			if (el.mesh instanceof Wire) {
				const newPositions: WirePos = el.mesh.wirePos.map((pos) => [
					pos[0] + COPY_OFFSET_X,
					pos[1] + COPY_OFFSET_Y,
				]);
				wiresToAdd.push({ positions: newPositions });
			} else if (el.mesh instanceof Component) {
				const newPos: Pos = [
					el.mesh.pos[0] + COPY_OFFSET_X,
					el.mesh.pos[1] + COPY_OFFSET_Y,
				];
				compsToAdd.push({
					type: el.mesh.type,
					positions: newPos,
					orientation: el.mesh.orientation,
					ticks: el.mesh.ticks,
				});
			}
		});

		const { wireIds, compIds } = await this.db.batchAdd(wiresToAdd, compsToAdd);

		const newElements: { mesh: ElementMesh; id: number }[] = [];
		let wireIndex = 0;
		let compIndex = 0;

		this.elementsCopied.forEach((el) => {
			if (el.mesh instanceof Wire) {
				const id = wireIds[wireIndex++];
				const mesh = this.simulation.addWire({
					key: id,
					value: {
						positions: el.mesh.wirePos.map((pos) => [
							pos[0] + COPY_OFFSET_X,
							pos[1] + COPY_OFFSET_Y,
						]),
					},
				});
				newElements.push({ mesh, id });
			} else if (el.mesh instanceof Component) {
				const id = compIds[compIndex++];
				const newPos: Pos = [
					el.mesh.pos[0] + COPY_OFFSET_X,
					el.mesh.pos[1] + COPY_OFFSET_Y,
				];
				const mesh = this.simulation.addComponent({
					key: id,
					value: {
						type: el.mesh.type,
						orientation: el.mesh.orientation,
						positions: newPos,
						ticks: el.mesh.ticks,
					},
				});
				newElements.push({ mesh, id });
			}
		});

		this.elementsSelected = newElements;
		this.updateOutline();
		this.isLoading = false;
	}

	private async pushChanges() {
		if (!this.shiftX && !this.shiftY) return;
		const isAlreadyLoading = this.isLoading;
		this.isLoading = true;

		const wiresToUpdate: CreateWire[] = [];
		const compsToUpdate: CreateComponent[] = [];

		this.elementsSelected.map(({ mesh, id }) => {
			if (mesh instanceof Wire) {
				wiresToUpdate.push({ key: id, value: { positions: mesh.wirePos } });
			} else if (mesh instanceof Component) {
				compsToUpdate.push({
					key: id,
					value: {
						positions: mesh.pos,
						type: mesh.type,
						orientation: mesh.orientation,
						ticks: mesh.ticks,
					},
				});
			}
		});

		await this.db.batchUpdate(wiresToUpdate, compsToUpdate);

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
