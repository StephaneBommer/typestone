import * as THREE from "three";
import { Component } from ".";
import type { CreateComponent } from "../../../db/types";
import { SIZE } from "../../../utils/constants";
import {
	type ComposantTypes,
	Orientation,
	type Pos,
} from "../../../utils/types";
import { skewBoxGeometry } from "../../geometry/skew";

export class Switch extends Component {
	protected topMesh: THREE.Mesh;
	protected material: {
		output: THREE.MeshStandardMaterial;
		switch: THREE.MeshStandardMaterial;
		topOn: THREE.MeshStandardMaterial;
		topOff: THREE.MeshStandardMaterial;
		delete: THREE.MeshStandardMaterial;
	};
	public pos: Pos;
	public orientation: Orientation;
	public type: ComposantTypes;
	public ticks?: number;

	constructor(
		{
			key,
			value: {
				type,
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
		this.type = type as ComposantTypes;
		this.material = material;
		this.orientation = orientation;
		this.topMesh = this.createGate();
		this.translateX(x * SIZE);
		this.translateY(y * -SIZE);
	}

	public setState(state: boolean) {
		this.state = state;
		this.topMesh.material = state ? this.material.topOn : this.material.topOff;
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
