import * as THREE from "three";
import { SIZE } from "../utils/const";

export class Grid extends THREE.Group {
	private materialLine: THREE.LineBasicMaterial;
	private materialLineEdit: THREE.LineBasicMaterial;
	constructor(width: number, height: number, color = 0x303030) {
		super();

		this.materialLine = new THREE.LineBasicMaterial({
			color: 0x202020,
		});
		this.materialLineEdit = new THREE.LineBasicMaterial({
			color: 0x404040,
		});
		this.createGrid(width, height, SIZE, color);
	}

	private createGrid(
		width: number,
		height: number,
		step: number,
		color: number,
	): void {
		const pointsHorizontal = [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(width, 0, 0),
		];
		const geometryLineHorizontal = new THREE.BufferGeometry().setFromPoints(
			pointsHorizontal,
		);
		const lineHorizontal = new THREE.Line(
			geometryLineHorizontal,
			this.materialLine,
		);

		for (let i = 0; i >= -height; i -= step) {
			const lineCloned = lineHorizontal.clone();
			lineCloned.position.y = i;
			this.add(lineCloned);
		}

		const pointsVertical = [
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, -height, 0),
		];
		const geometryLineVertical = new THREE.BufferGeometry().setFromPoints(
			pointsVertical,
		);
		const lineVertical = new THREE.Line(
			geometryLineVertical,
			this.materialLine,
		);

		for (let i = 0; i < width; i += step) {
			const lineCloned = lineVertical.clone();
			lineCloned.position.x = i;
			this.add(lineCloned);
		}
	}

	public editMode(mode: boolean) {
		this.children.forEach((line) => {
			(line as THREE.Line).material = mode
				? this.materialLineEdit
				: this.materialLine;
		});
	}
}
