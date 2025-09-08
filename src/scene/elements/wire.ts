import * as THREE from "three";
import { CSG } from "three-csg-ts";
import type { CreateWire } from "../../db/types";
import { SIZE } from "../../utils/constants";
import { skewBoxGeometry } from "../geometry/skew";

export class Wire extends THREE.Group {
	public state: boolean;
	private material: {
		on: THREE.MeshStandardMaterial;
		off: THREE.MeshStandardMaterial;
		delete: THREE.MeshStandardMaterial;
	};
	public isDeteling = false;
	private originalMaterials = new Map<THREE.Object3D, THREE.Material>();
	public key?: number;
	constructor(
		{ key, value: { positions } }: CreateWire,
		material: {
			on: THREE.MeshStandardMaterial;
			off: THREE.MeshStandardMaterial;
			delete: THREE.MeshStandardMaterial;
		},
	) {
		super();
		this.material = material;
		this.createGeometry(positions);
		this.state = false;
		this.children.forEach((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.state ? this.material.on : this.material.off;
			}
		});
		this.key = key;
	}

	public setState(state: boolean) {
		this.state = state;
		this.children.forEach((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.state ? this.material.on : this.material.off;
			}
		});
	}

	private createGeometry(path: number[][]): void {
		const pairs = this.groupPointsIntoPairs(path);

		const linesGeometries = pairs.map(
			(pair) =>
				new THREE.Mesh(
					this.createLine(pair),
					this.state ? this.material.on : this.material.off,
				),
		);

		if (linesGeometries.length === 0) return;

		let unionCSG = CSG.fromMesh(linesGeometries[0]);

		for (let i = 1; i < linesGeometries.length; i++) {
			const mesh = linesGeometries[i];
			mesh.updateMatrix();
			const meshCSG = CSG.fromMesh(mesh);
			unionCSG = unionCSG.union(meshCSG);
		}

		const unionGeometry = CSG.toGeometry(unionCSG, linesGeometries[0].matrix);

		this.add(
			new THREE.Mesh(
				unionGeometry,
				this.state ? this.material.on : this.material.off,
			),
		);
		path.map((p, index) => {
			if (index === 0 || index === path.length - 1) return;

			const lastPath = path[index - 1];
			const nextPath = path[index + 1];

			if (
				(lastPath[1] !== p[1] || nextPath[1] !== p[1]) &&
				(lastPath[0] !== p[0] || nextPath[0] !== p[0])
			)
				return;

			this.add(new THREE.Mesh(this.createLine([p, p]), this.material.on));
		});

		linesGeometries.forEach((mesh) => {
			mesh.geometry.dispose();
		});
	}

	private createLine(points: number[][]) {
		const l = points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

		const isHorizontal = l[0][1] === l[1][1];
		const isVertical = l[0][0] === l[1][0];

		if (isHorizontal) {
			const size = Math.abs(l[0][0] - l[1][0]) + 1;
			const Geometry = new skewBoxGeometry(size, 1, 1, size / 2 - 0.5);
			Geometry.translate(l[0][0] * SIZE, l[0][1] * -SIZE, 0);
			return Geometry;
		}
		if (isVertical) {
			const size = Math.abs(l[0][1] - l[1][1]) + 1;
			const Geometry = new skewBoxGeometry(1, size, 1, 0, -(size / 2 - 0.5));
			Geometry.translate(l[0][0] * SIZE, l[0][1] * -SIZE, 0);
			return Geometry;
		}
		throw new Error("Invalid line");
	}

	private groupPointsIntoPairs(points: number[][]): number[][][] {
		return points
			.slice(0, -1)
			.map((point, index) => [point, points[index + 1]]);
	}

	public setDeleting(isDeleting: boolean) {
		this.isDeteling = isDeleting;
		this.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				if (isDeleting) {
					if (!this.originalMaterials.has(child)) {
						this.originalMaterials.set(child, child.material);
					}
					child.material = this.material.delete;
				} else {
					const orig = this.originalMaterials.get(child);
					if (orig) {
						child.material = orig;
					}
				}
			}
		});

		if (!isDeleting) {
			this.originalMaterials.clear();
		}
	}
}
