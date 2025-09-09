import type { ElementMesh } from "../../scene/elements";
import { Wire } from "../../scene/elements/wire";
import type { Pos } from "../../utils/types";
import { BaseEditHandler } from "./base";

export class DeleteEditHandler extends BaseEditHandler {
	private elementDeleting: {
		mesh: ElementMesh;
		id: number;
	} | null = null;

	async click(_: Pos) {
		if (this.elementDeleting) {
			this.scene.remove(this.elementDeleting.mesh);
			if (this.elementDeleting.mesh instanceof Wire) {
				this.db.deleteWire(this.elementDeleting.id);
			} else {
				this.db.deleteComponent(this.elementDeleting.id);
			}
			this.elementDeleting.mesh.clear();
			this.elementDeleting = null;
		}
	}

	async mousemove(_: Pos, event?: MouseEvent) {
		if (!event) return;
		const object = this.scene.intersectElements(event);

		if (
			this.elementDeleting &&
			((object && object.key !== this.elementDeleting.id) || !object)
		) {
			this.elementDeleting.mesh.setDeleting(false);
			this.elementDeleting = null;
		}

		if (!object || object.key === undefined) return;

		this.elementDeleting = {
			mesh:
				object instanceof Wire
					? this.simulation.wires[object.key]
					: this.simulation.components[object.key],
			id: object.key,
		};
		this.elementDeleting.mesh.setDeleting(true);
	}

	async escape() {
		if (this.elementDeleting) {
			this.elementDeleting.mesh.setDeleting(false);
			this.elementDeleting = null;
		}
	}

	public setShift() {}
	public right() {}
	public left() {}
	public up() {}
	public down() {}
}
