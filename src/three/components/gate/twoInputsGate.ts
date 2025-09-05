import * as THREE from "three";
import { SIZE } from "../../../utils/const";
import { skewBoxGeometry } from "../../skew";
import { Gate } from "./gate";

export class TwoInputsGate extends Gate {
	protected createInputs() {
		const connectorGeometry = new skewBoxGeometry(1, 1, 1);
		const input1 = new THREE.Mesh(connectorGeometry, this.material.connector);
		const input2 = new THREE.Mesh(connectorGeometry, this.material.connector);

		input1.translateX(-SIZE * 5);
		input2.translateX(-SIZE * 5);
		input1.translateY(SIZE);
		input2.translateY(-SIZE);

		this.add(input1);
		this.add(input2);

		input1.geometry.dispose();
		input2.geometry.dispose();
	}
}
