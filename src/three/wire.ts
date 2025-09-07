import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { SIZE } from "../utils/const";
import { skewBoxGeometry } from "./skew";

export class WireMesh extends THREE.Group {
	public state: boolean;
	private materialOn: THREE.Material;
	private materialOff: THREE.Material;
	constructor(
		line: number[][],
		materialOn: THREE.Material,
		materialOff: THREE.Material,
	) {
		super();
		this.createGeometry(line);
		this.state = false;
		this.materialOn = materialOn;
		this.materialOff = materialOff;
		this.children.forEach((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.state ? this.materialOn : this.materialOff;
			}
		});
	}

	public setState(state: boolean) {
		this.state = state;
		this.children.forEach((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = this.state ? this.materialOn : this.materialOff;
			}
		});
	}

	private createGeometry(path: number[][]): void {
		const pairs = this.groupPointsIntoPairs(path);

		const linesGeometries = pairs.map(
			(pair) =>
				new THREE.Mesh(
					this.createLine(pair),
					this.state ? this.materialOn : this.materialOff,
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
				this.state ? this.materialOn : this.materialOff,
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

			this.add(new THREE.Mesh(this.createLine([p, p]), this.materialOn));
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
}
