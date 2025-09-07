import * as THREE from "three";
import { SIZE } from "../../utils/const";
import { skewBoxGeometry } from "../skew";

export class Switch extends THREE.Group {
	protected topMesh: THREE.Mesh;
	protected material: {
		output: THREE.MeshStandardMaterial;
		switch: THREE.MeshStandardMaterial;
		topOn: THREE.MeshStandardMaterial;
		topOff: THREE.MeshStandardMaterial;
		delete: THREE.MeshStandardMaterial;
	};
	public pos: [number, number];
	public state: boolean;
	public isDeteling = false;
	public comp_id: number;
	constructor(
		x: number,
		y: number,
		comp_id: number,
		material: {
			output: THREE.MeshStandardMaterial;
			switch: THREE.MeshStandardMaterial;
			topOn: THREE.MeshStandardMaterial;
			topOff: THREE.MeshStandardMaterial;
			delete: THREE.MeshStandardMaterial;
		},
	) {
		super();
		this.comp_id = comp_id;
		this.pos = [x, y];
		this.material = material;
		this.topMesh = this.createGate();
		this.translateX(x * SIZE);
		this.translateY(y * -SIZE);
		this.state = false;
	}

	public setState(state: boolean) {
		this.state = state;
		this.topMesh.material = state ? this.material.topOn : this.material.topOff;
	}

	public setDeleting(isDeleting: boolean) {
		this.isDeteling = isDeleting;
		if (isDeleting) {
			(this.topMesh.material as THREE.MeshStandardMaterial).emissive.setHex(
				0xff0000,
			);
		}
	}

	private createGate() {
		const gateGeometry = new skewBoxGeometry(3, 3, 2, -2);
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const topGeometry = new skewBoxGeometry(1, 1, 0.25, -2, 0, 2);

		const output = new THREE.Mesh(connectorGeometry, this.material.output);
		const box = new THREE.Mesh(gateGeometry, this.material.switch);
		const top = new THREE.Mesh(topGeometry, this.material.topOff);

		this.add(output);
		this.add(box);
		this.add(top);

		output.geometry.dispose();
		box.geometry.dispose();

		return top;
	}
}
