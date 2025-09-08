import * as THREE from "three";
import type { CreateComponent } from "../../../db/type";
import { SIZE } from "../../../utils/const";
import { Orientation } from "../../../utils/types";
import { skewBoxGeometry } from "../../skew";

export abstract class Gate extends THREE.Group {
	protected topMesh: THREE.Mesh;
	protected material: {
		input: THREE.MeshStandardMaterial;
		output: THREE.MeshStandardMaterial;
		gate: THREE.MeshStandardMaterial;
		topOn: THREE.MeshStandardMaterial;
		topOff: THREE.MeshStandardMaterial;
		delete: THREE.MeshStandardMaterial;
	};
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
			input: THREE.MeshStandardMaterial;
			output: THREE.MeshStandardMaterial;
			gate: THREE.MeshStandardMaterial;
			topOn: THREE.MeshStandardMaterial;
			topOff: THREE.MeshStandardMaterial;
			delete: THREE.MeshStandardMaterial;
		},
	) {
		super();
		this.material = material;
		this.orientation = orientation;
		this.topMesh = this.createGate();
		this.createInputs();
		this.translateX(x * SIZE);
		this.translateY(y * -SIZE);
		this.state = false;
		this.key = key;
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

	protected abstract createInputs(): void;

	private createGate() {
		const params = this.getGeometryParams();

		const gateGeometry = new skewBoxGeometry(...params.gate);
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const topGeometry = new skewBoxGeometry(...params.top);

		const output = new THREE.Mesh(connectorGeometry, this.material.output);
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
