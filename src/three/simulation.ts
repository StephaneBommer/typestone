import type {
	Simulation as RustSimulation,
	TickResults,
} from "../../rust/pkg/rust_counter";
import * as RUST from "../../rust/pkg/rust_counter";
import type { SimulationDb } from "../db/class";
import type {
	GetAndGates,
	GetBufferGates,
	GetLatches,
	GetNotGates,
	GetOrGates,
	GetSwitch,
	GetTimer,
	GetWires,
	GetXorGates,
	getAllComponents,
} from "../db/type";
import type { WirePos } from "../utils/types";
import { ElementTypes } from "../utils/types";
import type { OneInputGate } from "./components/gate/oneInputGate";
import type { TwoInputsGate } from "./components/gate/twoInputsGate";
import { Switch } from "./components/switch";
import type { SimulationScene } from "./scene";
import type { WireMesh } from "./wire";

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
	public Wire(wire: GetWires[number], edit = false) {
		const mesh = this.scene.creator.Wire(wire.positions);
		this.scene.add(mesh);
		if (edit) return mesh;
		this.rust_simulation.add_wire(wire.positions, wire.id);
		this.wires[wire.id] = mesh;
		return mesh;
	}
	public WireEdit(line: WirePos) {
		const mesh = this.scene.creator.Wire(line);
		this.scene.add(mesh);
		return mesh;
	}
	public AndGate(andGate: GetAndGates[number]) {
		this.rust_simulation.add_and_gate(
			new Int32Array(andGate.positions),
			andGate.orientation,
			andGate.id,
		);
		const mesh = this.scene.creator.AndGate(
			andGate.positions,
			andGate.orientation,
		);
		this.scene.add(mesh);
		this.components[andGate.id] = mesh;
	}
	public OrGate(orGate: GetOrGates[number]) {
		this.rust_simulation.add_or_gate(
			new Int32Array(orGate.positions),
			orGate.orientation,
			orGate.id,
		);
		const mesh = this.scene.creator.OrGate(
			orGate.positions,
			orGate.orientation,
		);
		this.scene.add(mesh);
		this.components[orGate.id] = mesh;
	}
	public XorGate(xorGate: GetXorGates[number]) {
		this.rust_simulation.add_xor_gate(
			new Int32Array(xorGate.positions),
			xorGate.orientation,
			xorGate.id,
		);
		const mesh = this.scene.creator.XorGate(
			xorGate.positions,
			xorGate.orientation,
		);
		this.scene.add(mesh);
		this.components[xorGate.id] = mesh;
	}
	public NotGate(notGate: GetNotGates[number]) {
		this.rust_simulation.add_not_gate(
			new Int32Array(notGate.positions),
			notGate.orientation,
			notGate.id,
		);
		const mesh = this.scene.creator.NotGate(
			notGate.positions,
			notGate.orientation,
		);
		this.scene.add(mesh);
		this.components[notGate.id] = mesh;
	}
	public BufferGate(bufferGate: GetBufferGates[number]) {
		this.rust_simulation.add_buffer_gate(
			new Int32Array(bufferGate.positions),
			bufferGate.orientation,
			bufferGate.id,
		);
		const mesh = this.scene.creator.BufferGate(
			bufferGate.positions,
			bufferGate.orientation,
		);
		this.scene.add(mesh);
		this.components[bufferGate.id] = mesh;
	}
	public Latch(latchGate: GetLatches[number]) {
		this.rust_simulation.add_latch_gate(
			new Int32Array(latchGate.positions),
			latchGate.orientation,
			latchGate.id,
		);
		const mesh = this.scene.creator.Latch(
			latchGate.positions,
			latchGate.orientation,
		);
		this.scene.add(mesh);
		this.components[latchGate.id] = mesh;
	}
	public Timer(timer: GetTimer[number]) {
		this.rust_simulation.add_timer(
			new Int32Array(timer.positions),
			timer.ticks,
			timer.orientation,
			timer.id,
		);
		const mesh = this.scene.creator.Timer(timer.positions, timer.orientation);
		this.scene.add(mesh);
		this.components[timer.id] = mesh;
	}
	public Switch(switch_: GetSwitch[number]) {
		const id = this.rust_simulation.add_switch(
			new Int32Array(switch_.positions),
			switch_.id,
		);
		const mesh = this.scene.creator.Switch(switch_.positions, id);
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

		wires.forEach((wire) => this.Wire(wire));
		and_gates.forEach((gate) => this.AndGate(gate));
		or_gates.forEach((gate) => this.OrGate(gate));
		xor_gates.forEach((gate) => this.XorGate(gate));
		not_gates.forEach((gate) => this.NotGate(gate));
		buffer_gates.forEach((gate) => this.BufferGate(gate));
		latches.forEach((gate) => this.Latch(gate));
		timer.forEach((gate) => this.Timer(gate));
		switches.forEach((gate) => this.Switch(gate));
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
