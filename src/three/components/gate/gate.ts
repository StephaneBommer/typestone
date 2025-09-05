import * as THREE from "three";
import { SIZE } from "../../../utils/const";
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
	constructor(
		x: number,
		y: number,
		material: {
			connector: THREE.MeshStandardMaterial;
			gate: THREE.MeshStandardMaterial;
			topOn: THREE.MeshStandardMaterial;
			topOff: THREE.MeshStandardMaterial;
		},
	) {
		super();
		this.material = material;
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
		const gateGeometry = new skewBoxGeometry(4, 3, 2, -2.5);
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const topGeometry = new skewBoxGeometry(2, 1, 0.25, -2.5, 0, 2);

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
}
