import * as THREE from "three";
import type { CreateComponent } from "../../db/types";
import { SIZE } from "../../utils/constants";
import { Orientation, type Pos } from "../../utils/types";
import { skewBoxGeometry } from "../geometry/skew";

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
	public orientation: Orientation;
	public isDeteling = false;
	private originalMaterials = new Map<THREE.Object3D, THREE.Material>();
	public key?: number;
	constructor(
		{
			key,
			value: {
				positions: [x, y],
				orientation,
			},
		}: CreateComponent,
		material: {
			output: THREE.MeshStandardMaterial;
			switch: THREE.MeshStandardMaterial;
			topOn: THREE.MeshStandardMaterial;
			topOff: THREE.MeshStandardMaterial;
			delete: THREE.MeshStandardMaterial;
		},
	) {
		super();
		this.key = key;
		this.pos = [x, y];
		this.material = material;
		this.orientation = orientation;
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

	private createGate() {
		const params = this.getGeometryParams();

		const gateGeometry = new skewBoxGeometry(...params.gate);
		const topGeometry = new skewBoxGeometry(...params.top);
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);

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

	private getGeometryParams(): {
		gate: [number, number, number, number, number, number];
		top: [number, number, number, number, number, number];
	} {
		switch (this.orientation) {
			case Orientation.Up:
				return {
					gate: [3, 3, 2, 0, 2, 0],
					top: [1, 1, 0.25, 0, 2, 2],
				};
			case Orientation.Right:
				return {
					gate: [3, 3, 2, -2, 0, 0],
					top: [1, 1, 0.25, -2, 0, 2],
				};
			case Orientation.Down:
				return {
					gate: [3, 3, 2, 0, -2, 0],
					top: [1, 1, 0.25, 0, -2, 2],
				};
			case Orientation.Left:
				return {
					gate: [3, 3, 2, 2, 0, 0],
					top: [1, 1, 0.25, 2, 0, 2],
				};
		}
	}

	public isClicked(pos: Pos) {
		switch (this.orientation) {
			case Orientation.Up:
				return (
					pos[0] >= this.pos[0] - 1 &&
					pos[0] <= this.pos[0] + 1 &&
					pos[1] <= this.pos[1] - 1 &&
					pos[1] >= this.pos[1] - 3
				);
			case Orientation.Right:
				return (
					pos[0] >= this.pos[0] - 3 &&
					pos[0] <= this.pos[0] - 1 &&
					pos[1] >= this.pos[1] - 1 &&
					pos[1] <= this.pos[1] + 1
				);
			case Orientation.Down:
				return (
					pos[0] >= this.pos[0] - 1 &&
					pos[0] <= this.pos[0] + 1 &&
					pos[1] >= this.pos[1] + 1 &&
					pos[1] <= this.pos[1] + 3
				);
			case Orientation.Left:
				return (
					pos[0] <= this.pos[0] + 3 &&
					pos[0] >= this.pos[0] + 1 &&
					pos[1] >= this.pos[1] - 1 &&
					pos[1] <= this.pos[1] + 1
				);
		}
	}
}
