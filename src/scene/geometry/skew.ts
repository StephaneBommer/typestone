import * as THREE from "three";
import { DISABLE_ISOMETRIC, SIZE, SKEW } from "../../utils/constants";

export class skewBoxGeometry extends THREE.BoxGeometry {
	constructor(
		width: number,
		height: number,
		depth: number,
		offsetX?: number,
		offsetY?: number,
		offsetZ?: number,
	) {
		super();
		this.scale(width * SIZE, height * SIZE, depth * SIZE);
		!DISABLE_ISOMETRIC && this.skew(depth);
		this.translateToGridGeometry(offsetX, offsetY, offsetZ, depth);
	}

	private skew(depth = 1) {
		const positionAttribute = this.attributes.position;

		const maxZ = Math.max(
			...positionAttribute.array.filter((_, i) => i % 3 === 2),
		);
		for (let i = 0; i < positionAttribute.count; i++) {
			const x = positionAttribute.getX(i);
			const y = positionAttribute.getY(i);
			const z = positionAttribute.getZ(i);

			if (z === maxZ) {
				positionAttribute.setY(i, y + SKEW * depth);
				positionAttribute.setX(i, x + SKEW * depth);
			}
		}

		positionAttribute.needsUpdate = true;
	}

	private translateToGridGeometry(
		offsetX?: number,
		offsetY?: number,
		offsetZ?: number,
		depth = 1,
	) {
		this.translate(
			SIZE / 2 +
				(offsetX ? offsetX * SIZE : 0) +
				(offsetZ && !DISABLE_ISOMETRIC ? SKEW * offsetZ : 0),
			SIZE * 0.5 +
				(offsetY ? offsetY * SIZE : 0) +
				(offsetZ && !DISABLE_ISOMETRIC ? SKEW * offsetZ : 0),
			(depth * SIZE) / 2 + (offsetZ ? offsetZ * SIZE : 0),
		);
	}
}
