import * as THREE from "three";
import { SIZE } from "../../../utils/const";
import { skewBoxGeometry } from "../../skew";
import { Gate } from "./gate";

export class OneInputGate extends Gate {
	protected createInputs() {
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const input = new THREE.Mesh(connectorGeometry, this.material.connector);

		input.translateX(-SIZE * 5);

		this.add(input);

		input.geometry.dispose();
	}
}
