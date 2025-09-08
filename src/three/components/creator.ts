import * as THREE from "three";
import type { CreateComponent, CreateWire } from "../../db/type";
import { ComposantTypes } from "../../utils/types";
import { OneInputGate } from "../components/gate/oneInputGate";
import { TwoInputsGate } from "../components/gate/twoInputsGate";
import { Switch } from "../components/switch";
import { WireMesh } from "../wire";
import type { Gate } from "./gate/gate";

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
	Input = "Input",
	Output = "Output",
	// Switch
	SwitchOn = "SwitchOn",
	SwitchOff = "SwitchOff",
	Switch = "Switch",
	// Editing
	Delete = "Delete",
	DeleteWire = "DeleteWire",
}

export class ComponentsCreator {
	private material: Record<MaterialType, THREE.MeshStandardMaterial>;

	constructor() {
		this.material = this.initMaterial();
	}

	public Wire(wire: CreateWire) {
		return new WireMesh(wire, {
			off: this.material[MaterialType.WireOff],
			on: this.material[MaterialType.WireOn],
			delete: this.material[MaterialType.DeleteWire],
		});
	}
	public AndGate(component: CreateComponent) {
		return new TwoInputsGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.AndGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public OrGate(component: CreateComponent) {
		return new TwoInputsGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.OrGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public XorGate(component: CreateComponent) {
		return new TwoInputsGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.XorGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public NotGate(component: CreateComponent) {
		return new OneInputGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.NotGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],

			delete: this.material[MaterialType.Delete],
		});
	}
	public BufferGate(component: CreateComponent) {
		return new OneInputGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.BufferGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public Latch(component: CreateComponent) {
		return new TwoInputsGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.LatchGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public Timer(component: CreateComponent) {
		return new OneInputGate(component, {
			input: this.material[MaterialType.Input],
			output: this.material[MaterialType.Output],
			gate: this.material[MaterialType.TimerGate],
			topOn: this.material[MaterialType.GateOn],
			topOff: this.material[MaterialType.GateOff],
			delete: this.material[MaterialType.Delete],
		});
	}
	public Switch(component: CreateComponent) {
		return new Switch(component, {
			output: this.material[MaterialType.Output],
			switch: this.material[MaterialType.Switch],
			topOn: this.material[MaterialType.SwitchOn],
			topOff: this.material[MaterialType.SwitchOff],
			delete: this.material[MaterialType.Delete],
		});
	}

	public createComponent(component: CreateComponent): Gate | Switch {
		switch (component.value.type) {
			case ComposantTypes.AndGate:
				return this.AndGate(component);
			case ComposantTypes.OrGate:
				return this.OrGate(component);
			case ComposantTypes.XorGate:
				return this.XorGate(component);
			case ComposantTypes.NotGate:
				return this.NotGate(component);
			case ComposantTypes.BufferGate:
				return this.BufferGate(component);
			case ComposantTypes.LatchGate:
				return this.Latch(component);
			case ComposantTypes.TimerGate:
				return this.Timer(component);
			case ComposantTypes.Switch:
				return this.Switch(component);
			default:
				throw new Error("Unknown component type");
		}
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
			[MaterialType.Input]: new THREE.MeshStandardMaterial({
				color: 0xe5b567,
				// depthWrite: false,
			}),
			[MaterialType.Output]: new THREE.MeshStandardMaterial({
				color: 0xccddde,
				// depthWrite: false,
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
			[MaterialType.Delete]: new THREE.MeshStandardMaterial({
				color: 0x999999,
				opacity: 0.3,
				transparent: true,
			}),
			[MaterialType.DeleteWire]: new THREE.MeshStandardMaterial({
				color: 0xffffff,
				opacity: 0.03,
				transparent: true,
				depthWrite: false,
			}),
		};
	}
}
