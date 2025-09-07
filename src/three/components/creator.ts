import * as THREE from "three";
import {
	ElementTypes,
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
	public AndGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.AndGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public OrGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.OrGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public XorGate([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.XorGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public NotGate([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.NotGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public BufferGate([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.BufferGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public Latch([x, y]: Pos, orientation: Orientation) {
		return new TwoInputsGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.LatchGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public Timer([x, y]: Pos, orientation: Orientation) {
		return new OneInputGate(
			x,
			y,
			{
				connector: this.material[MaterialType.Connector],
				gate: this.material[MaterialType.TimerGate],
				topOn: this.material[MaterialType.GateOn],
				topOff: this.material[MaterialType.GateOff],
			},
			orientation,
		);
	}
	public Switch([x, y]: Pos, comp_id: number) {
		return new Switch(x, y, comp_id, {
			connector: this.material[MaterialType.Connector],
			switch: this.material[MaterialType.Switch],
			topOn: this.material[MaterialType.SwitchOn],
			topOff: this.material[MaterialType.SwitchOff],
		});
	}

	public createComponent(
		type: ElementTypes,
		positions: Pos,
		orientation: Orientation,
	): Gate | Switch {
		switch (type) {
			case ElementTypes.AndGate:
				return this.AndGate(positions, orientation);
			case ElementTypes.OrGate:
				return this.OrGate(positions, orientation);
			case ElementTypes.XorGate:
				return this.XorGate(positions, orientation);
			case ElementTypes.NotGate:
				return this.NotGate(positions, orientation);
			case ElementTypes.BufferGate:
				return this.BufferGate(positions, orientation);
			case ElementTypes.LatchGate:
				return this.Latch(positions, orientation);
			case ElementTypes.TimerGate:
				return this.Timer(positions, orientation);
			case ElementTypes.Switch:
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
