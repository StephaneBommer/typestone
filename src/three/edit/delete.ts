import type { Pos } from "../../utils/types";
import type { Gate } from "./../components/gate/gate";
import type { Switch } from "./../components/switch";
import { BaseEditHandler } from "./base";

export class DeleteEditHandler extends BaseEditHandler {
	private componentDeleting: { mesh: Gate | Switch; id: number } | null = null;

	async click([x, y]: Pos) {
		const obj = await this.db.getElementFromPosition([x, y]);
		if (!obj) return;

		if (this.componentDeleting) {
			this.scene.remove(this.componentDeleting.mesh);
			this.db.deleteComponent(this.componentDeleting.id);
			this.componentDeleting.mesh.clear();
			this.componentDeleting = null;
		}
	}

	async mousemove([x, y]: Pos) {
		const obj = await this.db.getElementFromPosition([x, y]);

		if (
			this.componentDeleting &&
			((obj && obj.id !== this.componentDeleting.id) || !obj)
		) {
			this.componentDeleting.mesh.setDeleting(false);
			this.componentDeleting = null;
		}

		if (!obj) return;

		this.componentDeleting = {
			mesh: this.simulation.components[obj.id],
			id: obj.id,
		};
		this.componentDeleting.mesh.setDeleting(true);
	}

	async escape() {
		if (this.componentDeleting) {
			this.componentDeleting.mesh.setDeleting(false);
			this.componentDeleting = null;
		}
	}
}
