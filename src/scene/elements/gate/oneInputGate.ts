import * as THREE from "three";
import { Gate } from ".";
import { SIZE } from "../../../utils/constants";
import { Orientation } from "../../../utils/types";
import { skewBoxGeometry } from "../../geometry/skew";

export class OneInputGate extends Gate {
	protected createInputs() {
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const input = new THREE.Mesh(connectorGeometry, this.material.input);

		const { trans1 } = this.getTranslateParams();

		input.position.set(
			...(trans1.map((v) => v * SIZE) as [number, number, number]),
		);

		this.add(input);

		input.geometry.dispose();
	}

	private getTranslateParams(): {
		trans1: [number, number, number];
	} {
		switch (this.orientation) {
			case Orientation.Up:
				return {
					trans1: [0, 5, 0],
				};
			case Orientation.Right:
				return {
					trans1: [-5, 0, 0],
				};
			case Orientation.Down:
				return {
					trans1: [0, -5, 0],
				};
			case Orientation.Left:
				return {
					trans1: [5, 0, 0],
				};
		}
	}
}
