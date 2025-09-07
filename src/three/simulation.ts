import type {
	Simulation as RustSimulation,
	TickResults,
} from "../../rust/pkg/rust_counter";
import * as RUST from "../../rust/pkg/rust_counter";
import type { SimulationDb } from "../db/class";
import type { GetWires, getAllComponents } from "../db/type";
import type { Pos, WirePos } from "../utils/types";
import { ElementTypes, Orientation } from "../utils/types";
import type { OneInputGate } from "./components/gate/oneInputGate";
import type { TwoInputsGate } from "./components/gate/twoInputsGate";
import { Switch } from "./components/switch";
import type { SimulationScene } from "./scene";
import type { WireMesh } from "./wire";

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

type ComponentMesh = TwoInputsGate | OneInputGate | Switch;

export class Simulation {
	public scene: SimulationScene;
	public db: SimulationDb;
	private wires: Record<number, WireMesh> = {};
	public components: Record<number, ComponentMesh> = {};
	public rust_simulation: RustSimulation;

	constructor(scene: SimulationScene, db: SimulationDb) {
		this.scene = scene;
		this.db = db;
		this.rust_simulation = RUST.Simulation.new();
	}
	public Wire(wire: GetWires[number]["positions"], edit = false) {
		const mesh = this.scene.creator.Wire(wire);
		this.scene.add(mesh);
		if (edit) return mesh;
		const id = this.rust_simulation.add_wire(wire);
		this.wires[id] = mesh;
		return mesh;
	}
	public WireEdit(line: WirePos) {
		const mesh = this.scene.creator.Wire(line);
		this.scene.add(mesh);
		return mesh;
	}
	public AndGate(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_and_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.AndGate(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public OrGate(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_or_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.OrGate(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public XorGate(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_xor_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.XorGate(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public NotGate(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_not_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.NotGate(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public BufferGate(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_buffer_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.BufferGate(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public Latch(pos: Pos, orientation: Orientation = Orientation.Right) {
		const id = this.rust_simulation.add_latch_gate(
			new Int32Array(pos),
			orientation,
		);
		const mesh = this.scene.creator.Latch(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public Timer(
		pos: Pos,
		ticks: number,
		orientation: Orientation = Orientation.Right,
	) {
		const id = this.rust_simulation.add_timer(
			new Int32Array(pos),
			ticks,
			orientation,
		);
		const mesh = this.scene.creator.Timer(pos, orientation);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}
	public Switch(pos: Pos) {
		const id = this.rust_simulation.add_switch(new Int32Array(pos));
		const mesh = this.scene.creator.Switch(pos, id);
		this.scene.add(mesh);
		this.components[id] = mesh;
	}

	public update_simulation(tickResult: TickResults) {
		if (tickResult.wires.length === 0 && tickResult.components.length === 0) {
			return;
		}
		tickResult.wires.forEach((wire: { index: number; state: boolean }) => {
			const wireMesh = this.wires[wire.index];
			if (!wireMesh) {
				console.error("wire not found", wire.index, this.wires);
				return;
			}
			this.wires[wire.index].setState(wire.state);
		});
		tickResult.components.forEach(
			(component: { index: number; state: boolean }) => {
				this.components[component.index].setState(component.state);
			},
		);
		tickResult.free();
	}

	public toggle_switch(id: number) {
		const switch_ = this.components[id];
		if (!switch_) {
			throw new Error(`Switch with id ${id} not found`);
		}
		switch_.setState(!switch_.state);
		this.rust_simulation.update_switch_state(id, switch_.state);
		return switch_.state;
	}

	public get_switchs(): Switch[] {
		return Object.keys(this.components)
			.filter((key) => {
				const component = this.components[Number.parseInt(key)];
				return component instanceof Switch;
			})
			.map((key) => {
				return this.components[Number.parseInt(key)] as Switch;
			});
	}

	public addComponents(dbComponents: getAllComponents) {
		const {
			[ElementTypes.Wire]: wires,
			[ElementTypes.AndGate]: and_gates,
			[ElementTypes.OrGate]: or_gates,
			[ElementTypes.XorGate]: xor_gates,
			[ElementTypes.NotGate]: not_gates,
			[ElementTypes.BufferGate]: buffer_gates,
			[ElementTypes.LatchGate]: latches,
			[ElementTypes.TimerGate]: timer,
			[ElementTypes.Switch]: switches,
		} = dbComponents;

		wires.forEach((wire) => this.Wire(wire.positions));
		and_gates.forEach((gate) => this.AndGate(gate.positions, gate.orientation));
		or_gates.forEach((gate) => this.OrGate(gate.positions, gate.orientation));
		xor_gates.forEach((gate) => this.XorGate(gate.positions, gate.orientation));
		not_gates.forEach((gate) => this.NotGate(gate.positions, gate.orientation));
		buffer_gates.forEach((gate) =>
			this.BufferGate(gate.positions, gate.orientation),
		);
		latches.forEach((gate) => this.Latch(gate.positions, gate.orientation));
		timer.forEach((gate) =>
			this.Timer(gate.positions, gate.ticks, gate.orientation),
		);
		switches.forEach((gate) => this.Switch(gate.positions));
	}

	public reset() {
		this.rust_simulation.reset();
		Object.values(this.wires).forEach((wire) => {
			this.scene.remove(wire);
			wire.clear?.();
		});
		Object.values(this.components).forEach((component) => {
			this.scene.remove(component);
			component.clear?.();
		});
		this.wires = {};
		this.components = {};
	}
}
