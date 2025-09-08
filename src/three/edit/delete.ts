import type { Pos } from "../../utils/types";
import { WireMesh } from "../wire";
import type { Gate } from "./../components/gate/gate";
import type { Switch } from "./../components/switch";
import { BaseEditHandler } from "./base";

export class DeleteEditHandler extends BaseEditHandler {
	private elementDeleting: {
		mesh: Gate | Switch | WireMesh;
		id: number;
	} | null = null;

	async click(_: Pos) {
		if (this.elementDeleting) {
			this.scene.remove(this.elementDeleting.mesh);
			if (this.elementDeleting.mesh instanceof WireMesh) {
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
				object instanceof WireMesh
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
}
