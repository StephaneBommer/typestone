import * as THREE from "three";
import { Gate } from ".";
import { SIZE } from "../../../../utils/constants";
import { Orientation } from "../../../../utils/types";
import { skewBoxGeometry } from "../../../geometry/skew";

export class TwoInputsGate extends Gate {
	protected createInputs() {
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const input1 = new THREE.Mesh(connectorGeometry, this.material.input);
		const input2 = new THREE.Mesh(connectorGeometry, this.material.input);

		const { trans1, trans2 } = this.getTranslateParams();

		input1.position.set(
			...(trans1.map((v) => v * SIZE) as [number, number, number]),
		);
		input2.position.set(
			...(trans2.map((v) => v * SIZE) as [number, number, number]),
		);

		this.add(input1);
		this.add(input2);

		input1.geometry.dispose();
		input2.geometry.dispose();
	}

	private getTranslateParams(): {
		trans1: [number, number, number];
		trans2: [number, number, number];
	} {
		switch (this.orientation) {
			case Orientation.Up:
				return {
					trans1: [-1, 5, 0],
					trans2: [1, 5, 0],
				};
			case Orientation.Right:
				return {
					trans1: [-5, 1, 0],
					trans2: [-5, -1, 0],
				};
			case Orientation.Down:
				return {
					trans1: [-1, -5, 0],
					trans2: [1, -5, 0],
				};
			case Orientation.Left:
				return {
					trans1: [5, -1, 0],
					trans2: [5, 1, 0],
				};
		}
	}
}
