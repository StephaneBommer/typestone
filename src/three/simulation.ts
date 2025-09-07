import type {
	Simulation as RustSimulation,
	TickResults,
} from "../../rust/pkg/rust_counter";
import * as RUST from "../../rust/pkg/rust_counter";
import type { SimulationDb } from "../db/class";
import type { GetComponents, GetWires, getAllComponents } from "../db/type";
import type { WirePos } from "../utils/types";
import { ComposantTypes, ElementTypes } from "../utils/types";
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
	public Wire({ value: wire, key }: GetWires[number], edit = false) {
		const mesh = this.scene.creator.Wire(wire.positions);
		this.scene.add(mesh);
		if (edit) return mesh;
		this.rust_simulation.add_wire(wire.positions, key);
		this.wires[key] = mesh;
		return mesh;
	}
	public WireEdit(line: WirePos) {
		const mesh = this.scene.creator.Wire(line);
		this.scene.add(mesh);
		return mesh;
	}
	public AndGate({ value: andGate, key }: GetComponents[number]) {
		this.rust_simulation.add_and_gate(
			new Int32Array(andGate.positions),
			andGate.orientation,
			key,
		);
		const mesh = this.scene.creator.AndGate(
			andGate.positions,
			andGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public OrGate({ value: orGate, key }: GetComponents[number]) {
		this.rust_simulation.add_or_gate(
			new Int32Array(orGate.positions),
			orGate.orientation,
			key,
		);
		const mesh = this.scene.creator.OrGate(
			orGate.positions,
			orGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public XorGate({ value: xorGate, key }: GetComponents[number]) {
		this.rust_simulation.add_xor_gate(
			new Int32Array(xorGate.positions),
			xorGate.orientation,
			key,
		);
		const mesh = this.scene.creator.XorGate(
			xorGate.positions,
			xorGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public NotGate({ value: notGate, key }: GetComponents[number]) {
		this.rust_simulation.add_not_gate(
			new Int32Array(notGate.positions),
			notGate.orientation,
			key,
		);
		const mesh = this.scene.creator.NotGate(
			notGate.positions,
			notGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public BufferGate({ value: bufferGate, key }: GetComponents[number]) {
		this.rust_simulation.add_buffer_gate(
			new Int32Array(bufferGate.positions),
			bufferGate.orientation,
			key,
		);
		const mesh = this.scene.creator.BufferGate(
			bufferGate.positions,
			bufferGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public Latch({ value: latchGate, key }: GetComponents[number]) {
		this.rust_simulation.add_latch_gate(
			new Int32Array(latchGate.positions),
			latchGate.orientation,
			key,
		);
		const mesh = this.scene.creator.Latch(
			latchGate.positions,
			latchGate.orientation,
		);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public Timer({ value: timer, key }: GetComponents[number]) {
		if (!("ticks" in timer)) return;
		this.rust_simulation.add_timer(
			new Int32Array(timer.positions),
			timer.ticks,
			timer.orientation,
			key,
		);
		const mesh = this.scene.creator.Timer(timer.positions, timer.orientation);
		this.scene.add(mesh);
		this.components[key] = mesh;
	}
	public Switch({ value: switch_, key }: GetComponents[number]) {
		this.rust_simulation.add_switch(new Int32Array(switch_.positions), key);
		const mesh = this.scene.creator.Switch(switch_.positions, key);
		this.scene.add(mesh);
		this.components[key] = mesh;
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
		const { [ElementTypes.Wire]: wires, [ElementTypes.Component]: components } =
			dbComponents;

		wires.forEach((wire) => this.Wire(wire));
		components.forEach((component) => {
			switch (component.value.type) {
				case ComposantTypes.AndGate:
					this.AndGate(component);
					break;
				case ComposantTypes.OrGate:
					this.OrGate(component);
					break;
				case ComposantTypes.XorGate:
					this.XorGate(component);
					break;
				case ComposantTypes.NotGate:
					this.NotGate(component);
					break;
				case ComposantTypes.BufferGate:
					this.BufferGate(component);
					break;
				case ComposantTypes.LatchGate:
					this.Latch(component);
					break;
				case ComposantTypes.TimerGate:
					this.Timer(component);
					break;
				case ComposantTypes.Switch:
					this.Switch(component);
					break;
			}
		});
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
