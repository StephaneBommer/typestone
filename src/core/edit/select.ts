import type { ElementMesh } from "../../scene/elements";
import { Wire } from "../../scene/elements/wire";
import { SIZE } from "../../utils/constants";
import type { Pos, WirePos } from "../../utils/types";
import { BaseEditHandler } from "./base";

export class SelectEditHandler extends BaseEditHandler {
	private elementsSelected: {
		mesh: ElementMesh;
		id: number;
	}[] = [];
	private shift = false;

	async click(_: Pos, event?: MouseEvent) {
		if (!event) return;

		const object = this.scene.intersectElements(event);
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

		this.scene.setOutlineObjects(this.elementsSelected.map((el) => el.mesh));
	}

	async mousemove() {}

	async escape() {
		this.elementsSelected = [];
		this.scene.setOutlineObjects([]);
	}

	public setShift(multi: boolean) {
		this.shift = multi;
	}

	public right() {
		this.moveSelected(1, 0);
	}
	public left() {
		this.moveSelected(-1, 0);
	}
	public up() {
		this.moveSelected(0, -1);
	}
	public down() {
		this.moveSelected(0, 1);
	}

	public async moveSelected(x: number, y: number) {
		if (this.elementsSelected.length === 0) return;

		const shifted = this.shift ? 5 : 1;

		for (const { mesh, id } of this.elementsSelected) {
			if (mesh instanceof Wire) {
				const wire = await this.db.getWireByKey(id);
				if (!wire) continue;

				const newPositions: WirePos = wire.value.positions.map((pos) => [
					pos[0] + x * shifted,
					pos[1] + y * shifted,
				]);

				await this.db.updateWire(id, newPositions);

				mesh.translateX(SIZE * x * shifted);
				mesh.translateY(SIZE * -y * shifted);
			} else {
				const component = await this.db.getComponentByKey(id);
				if (!component) continue;

				const [px, py] = component.value.positions;
				await this.db.updateComponent(id, {
					positions: [px + x * shifted, py + y * shifted],
				});

				mesh.translateX(SIZE * x * shifted);
				mesh.translateY(SIZE * -y * shifted);
			}
		}
	}
}
