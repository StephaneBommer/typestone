import * as THREE from "three";
import type { Pos, WirePos } from "../../utils/types";
import { OneInputGate } from "../components/gate/oneInputGate";
import { TwoInputsGate } from "../components/gate/twoInputsGate";
import { Switch } from "../components/switch";
import { WireMesh } from "../wire";

enum MaterialType {
	WireOff = "WireOff",
	WireOn = "WireOn",
	// gates
	AndGate = "AndGate",
	OrGate = "OrGate",
	XorGate = "XorGate",
	NotGate = "NotGate",
	BufferGate = "BufferGate",
	LatchGate = "LatchGate",
	TimerGate = "TimerGate",
	GateOn = "GateOn",
	GateOff = "GateOff",
	// connectors
	Connector = "Connector",
	// Switch
	SwitchOn = "SwitchOn",
	SwitchOff = "SwitchOff",
	Switch = "Switch",
}

export class ComponentsCreator {
	private material: Record<MaterialType, THREE.MeshStandardMaterial>;

	constructor() {
		this.material = this.initMaterial();
	}

	public Wire(line: WirePos) {
		return new WireMesh(
			line,
			this.material[MaterialType.WireOn],
			this.material[MaterialType.WireOff],
		);
	}
	public AndGate([x, y]: Pos) {
		return new TwoInputsGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.AndGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public OrGate([x, y]: Pos) {
		return new TwoInputsGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.OrGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public XorGate([x, y]: Pos) {
		return new TwoInputsGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.XorGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public NotGate([x, y]: Pos) {
		return new OneInputGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.NotGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public BufferGate([x, y]: Pos) {
		return new OneInputGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.BufferGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public Latch([x, y]: Pos) {
		return new TwoInputsGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.LatchGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public Timer([x, y]: Pos) {
		return new OneInputGate(x, y, {
			connector: this.material[MaterialType.Connector],
			gate: this.material[MaterialType.TimerGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
		});
	}
	public Switch([x, y]: Pos) {
		return new Switch(x, y, {
			connector: this.material[MaterialType.Connector],
			switch: this.material[MaterialType.Switch],
			topOn: this.material[MaterialType.SwitchOn],
			topOff: this.material[MaterialType.SwitchOff],
		});
	}

	private initMaterial() {
		return {
			[MaterialType.WireOff]: new THREE.MeshStandardMaterial({
				color: 0xffffff,
				opacity: 0.05,
				transparent: true,
				depthWrite: false,
			}),
			[MaterialType.WireOn]: new THREE.MeshStandardMaterial({
				color: 0xffffff,
				opacity: 0.8,
				transparent: true,
				depthWrite: false,
			}),
			[MaterialType.AndGate]: new THREE.MeshStandardMaterial({
				color: 0xe87d3e,
			}),
			[MaterialType.OrGate]: new THREE.MeshStandardMaterial({
				color: 0x6c99bb,
			}),
			[MaterialType.XorGate]: new THREE.MeshStandardMaterial({
				color: 0x9e86c8,
			}),
			[MaterialType.NotGate]: new THREE.MeshStandardMaterial({
				color: 0xf2a541,
			}),
			[MaterialType.BufferGate]: new THREE.MeshStandardMaterial({
				color: 0xffd866,
			}),
			[MaterialType.LatchGate]: new THREE.MeshStandardMaterial({
				color: 0xc17379,
			}),
			[MaterialType.TimerGate]: new THREE.MeshStandardMaterial({
				color: 0xb4d273,
			}),
			[MaterialType.GateOn]: new THREE.MeshStandardMaterial({
				color: 0xb4d273,
			}),
			[MaterialType.GateOff]: new THREE.MeshStandardMaterial({
				color: 0x666666,
			}),
			[MaterialType.Connector]: new THREE.MeshStandardMaterial({
				color: 0xe5b567,
				depthWrite: false,
			}),
			[MaterialType.SwitchOn]: new THREE.MeshStandardMaterial({
				color: 0xb4d273,
			}),
			[MaterialType.SwitchOff]: new THREE.MeshStandardMaterial({
				color: 0x797979,
			}),
			[MaterialType.Switch]: new THREE.MeshStandardMaterial({
				color: 0x45474a,
			}),
		};
	}
}
