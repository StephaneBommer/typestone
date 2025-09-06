import * as THREE from "three";
import { SIZE } from "../../../utils/const";
import { Orientation } from "../../../utils/types";
import { skewBoxGeometry } from "../../skew";

export abstract class Gate extends THREE.Group {
	protected topMesh: THREE.Mesh;
	protected material: {
		connector: THREE.MeshStandardMaterial;
		gate: THREE.MeshStandardMaterial;
		topOn: THREE.MeshStandardMaterial;
		topOff: THREE.MeshStandardMaterial;
	};
	public state: boolean;
	public orientation: Orientation;

	constructor(
		x: number,
		y: number,
		material: {
			connector: THREE.MeshStandardMaterial;
			gate: THREE.MeshStandardMaterial;
			topOn: THREE.MeshStandardMaterial;
			topOff: THREE.MeshStandardMaterial;
		},
		orientation?: Orientation,
	) {
		super();
		this.material = material;
		this.orientation = orientation ?? Orientation.Right;
		this.topMesh = this.createGate();
		this.createInputs();
		this.translateX(x * SIZE);
		this.translateY(y * -SIZE);
		this.state = false;
	}

	public setState(state: boolean) {
		this.state = state;
		this.topMesh.material = state ? this.material.topOn : this.material.topOff;
	}

	protected abstract createInputs(): void;

	private createGate() {
		const params = this.getGeometryParams();

		const gateGeometry = new skewBoxGeometry(...params.gate);
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const topGeometry = new skewBoxGeometry(...params.top);

		const output = new THREE.Mesh(connectorGeometry, this.material.connector);
		const box = new THREE.Mesh(gateGeometry, this.material.gate);
		const top = new THREE.Mesh(topGeometry, this.material.topOff);

		this.add(output);
		this.add(box);
		this.add(top);

		output.geometry.dispose();
		box.geometry.dispose();

		return top;
	}

	private getGeometryParams(): {
		gate: [number, number, number, number, number, number];
		top: [number, number, number, number, number, number];
	} {
		switch (this.orientation) {
			case Orientation.Up:
				return {
					gate: [3, 4, 2, 0, 2.5, 0],
					top: [1, 2, 0.25, 0, 2.5, 2],
				};
			case Orientation.Right:
				return {
					gate: [4, 3, 2, -2.5, 0, 0],
					top: [2, 1, 0.25, -2.5, 0, 2],
				};
			case Orientation.Down:
				return {
					gate: [3, 4, 2, 0, -2.5, 0],
					top: [1, 2, 0.25, 0, -2.5, 2],
				};
			case Orientation.Left:
				return {
					gate: [4, 3, 2, 2.5, 0, 0],
					top: [2, 1, 0.25, 2.5, 0, 2],
				};
		}
	}
}
