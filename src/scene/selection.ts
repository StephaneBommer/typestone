import * as THREE from "three";
import { SIZE } from "../utils/constants";
import type { Pos } from "../utils/types";

export class SelectionMesh extends THREE.Mesh {
	private outline: THREE.LineSegments;

	constructor() {
		const geometry = new THREE.PlaneGeometry(1, 1);
		const material = new THREE.MeshBasicMaterial({
			color: 0x333333,
			transparent: true,
			opacity: 0.2,
			side: THREE.DoubleSide,
			depthWrite: false,
		});

		super(geometry, material);

		const edges = new THREE.EdgesGeometry(geometry);
		const lineMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			opacity: 0.5,
			transparent: true,
			depthWrite: false,
		});
		this.outline = new THREE.LineSegments(edges, lineMaterial);
		this.add(this.outline);

		this.renderOrder = 999;
		this.outline.renderOrder = 1000;
	}

	public updateCorners(start: Pos, end: Pos) {
		const width = Math.abs(end[0] * SIZE - start[0] * SIZE);
		const height = Math.abs(end[1] * SIZE - start[1] * SIZE);

		this.position.set(
			(start[0] * SIZE + end[0] * SIZE) / 2,
			-(start[1] * SIZE + end[1] * SIZE) / 2,
			10,
		);

		this.scale.set(width, height, 1);
	}
}
