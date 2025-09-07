import * as THREE from "three";
import { CSG } from "three-csg-ts";
import { SIZE } from "../utils/const";
import { skewBoxGeometry } from "./skew";

export class WireMesh extends THREE.Mesh {
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
		this.material = this.state ? this.materialOn : this.materialOff;
	}

	public setState(state: boolean) {
		this.state = state;
		this.material = state ? this.materialOn : this.materialOff;
	}

	private createGeometry(path: number[][]): void {
		const pairs = this.groupPointsIntoPairs(path);

		const linesGeometries = pairs.map(
			(pair) => new THREE.Mesh(this.createLine(pair), this.material),
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

		this.geometry = unionGeometry;

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
