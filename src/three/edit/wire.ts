import type { Pos, WirePos } from "../../utils/types";
import type { WireMesh } from "./../wire";
import { BaseEditHandler } from "./base";

export class WireEditHandler extends BaseEditHandler {
	private wire: WireMesh | null = null;
	private wirePath: WirePos = [];

	async click([x, y]: Pos) {
		if (this.wire) {
			this.scene.remove(this.wire);
			this.wire.clear();
		}
		if (this.wirePath.length === 0) {
			this.wirePath.push([x, y], [x, y]);
		} else {
			this.wirePath.push([x, y]);
		}
		this.wire = this.scene.creator.Wire({
			value: { positions: this.wirePath },
		});
		this.scene.add(this.wire);
	}

	async mousemove([x, y]: Pos) {
		if (this.wirePath.length === 0) {
			if (this.wire) {
				this.scene.remove(this.wire);
				this.wire.clear();
				this.wire = null;
			}
			this.wire = this.scene.creator.Wire({
				value: {
					positions: [
						[x, y],
						[x, y],
					],
				},
			});
			this.scene.add(this.wire);
			return;
		}

		const lastPos = this.wirePath[this.wirePath.length - 2];
		const [lastX, lastY] = lastPos;

		if (this.wire) {
			this.scene.remove(this.wire);
			this.wire.clear();
		}

		const xOffset = Math.abs(x - lastX);
		const yOffset = Math.abs(y - lastY);

		if (xOffset > yOffset) {
			this.wirePath[this.wirePath.length - 1][0] = x;
			this.wirePath[this.wirePath.length - 1][1] = lastY;
		} else {
			this.wirePath[this.wirePath.length - 1][1] = y;
			this.wirePath[this.wirePath.length - 1][0] = lastX;
		}
		this.wire = this.scene.creator.Wire({
			value: { positions: this.wirePath },
		});
		this.scene.add(this.wire);
	}

	async escape() {
		if (!this.wire) return;
		this.wirePath.pop();

		const wire = await this.db.addWire(this.wirePath);
		this.simulation.addWire({
			key: wire.key,
			value: { positions: this.wirePath },
		});

		this.scene.remove(this.wire);
		this.wirePath = [];
		this.wire.clear();
		this.wire = null;
	}
}
