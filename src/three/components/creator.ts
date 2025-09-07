import * as THREE from "three";
import {
	ComposantTypes,
	type Orientation,
	type Pos,
	type WirePos,
} from "../../utils/types";
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
	public AndGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.AndGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public OrGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.OrGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public XorGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.XorGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public NotGate([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.NotGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],

				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public BufferGate([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.BufferGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public Latch([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.LatchGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public Timer([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				input: this.material[MaterialType.Input],
				output: this.material[MaterialType.Output],
				gate: this.material[MaterialType.TimerGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
				delete: this.material[MaterialType.Delete],
			},
			orientation,
		);
	}
	public Switch([x, y]: Pos, comp_id: number) {
		return new Switch(x, y, comp_id, {
			output: this.material[MaterialType.Output],
			switch: this.material[MaterialType.Switch],
			topOn: this.material[MaterialType.SwitchOn],
			topOff: this.material[MaterialType.SwitchOff],
			delete: this.material[MaterialType.Delete],
		});
	}

	public createComponent(
		type: ComposantTypes,
		positions: Pos,
		orientation: Orientation,
	): Gate | Switch {
		switch (type) {
			case ComposantTypes.AndGate:
				return this.AndGate(positions, orientation);
			case ComposantTypes.OrGate:
				return this.OrGate(positions, orientation);
			case ComposantTypes.XorGate:
				return this.XorGate(positions, orientation);
			case ComposantTypes.NotGate:
				return this.NotGate(positions, orientation);
			case ComposantTypes.BufferGate:
				return this.BufferGate(positions, orientation);
			case ComposantTypes.LatchGate:
				return this.Latch(positions, orientation);
			case ComposantTypes.TimerGate:
				return this.Timer(positions, orientation);
			case ComposantTypes.Switch:
				return this.Switch(positions, 1);
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
				depthWrite: false,
			}),
			[MaterialType.Output]: new THREE.MeshStandardMaterial({
				color: 0xccddde,
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
			[MaterialType.Delete]: new THREE.MeshStandardMaterial({
				color: 0x999999,
				opacity: 0.3,
				transparent: true,
			}),
		};
	}
}
