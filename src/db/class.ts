import { type IDBPDatabase, openDB } from "idb";
import { ElementTypes, type WirePos } from "../utils/types";
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
	MyDB,
	getAllComponents,
} from "./type";

export class SimulationDb {
	private db!: IDBPDatabase<MyDB>;
	public async init() {
		this.db = await openDB<MyDB>("typestone", 2, {
			upgrade(db) {
				db.createObjectStore(ElementTypes.Wire, { autoIncrement: true });
				db.createObjectStore(ElementTypes.AndGate, {
					autoIncrement: true,
				});
				db.createObjectStore(ElementTypes.OrGate, { autoIncrement: true });
				db.createObjectStore(ElementTypes.XorGate, { autoIncrement: true });
				db.createObjectStore(ElementTypes.NotGate, { autoIncrement: true });
				db.createObjectStore(ElementTypes.BufferGate, {
					autoIncrement: true,
				});
				db.createObjectStore(ElementTypes.LatchGate, { autoIncrement: true });
				db.createObjectStore(ElementTypes.TimerGate, { autoIncrement: true });
				db.createObjectStore(ElementTypes.Switch, { autoIncrement: true });
			},
		});
	}

	public async addWire(positions: WirePos): Promise<GetWires[number]> {
		const wire = await this.db.add(ElementTypes.Wire, { positions });
		return {
			id: wire,
			positions,
		};
	}

	public async addComponent(
		type: ElementTypes,
		positions: GetAndGates[number]["positions"],
		orientation: GetAndGates[number]["orientation"],
		ticks?: number,
	) {
		const component = await this.db.add(type, {
			positions,
			orientation,
			...(ticks !== undefined ? { ticks } : {}),
		});
		return {
			id: component,
			positions,
		};
	}

	public async getWires(): Promise<GetWires> {
		const wires = await this.db.getAll(ElementTypes.Wire);
		const keys = await this.db.getAllKeys(ElementTypes.Wire);
		return wires.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
		}));
	}
	public async getAndGates(): Promise<GetAndGates> {
		const and_gates = await this.db.getAll(ElementTypes.AndGate);
		const keys = await this.db.getAllKeys(ElementTypes.AndGate);
		return and_gates.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getOrGates(): Promise<GetOrGates> {
		const or_gates = await this.db.getAll(ElementTypes.OrGate);
		const keys = await this.db.getAllKeys(ElementTypes.OrGate);
		return or_gates.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getXorGates(): Promise<GetXorGates> {
		const xor_gates = await this.db.getAll(ElementTypes.XorGate);
		const keys = await this.db.getAllKeys(ElementTypes.XorGate);
		return xor_gates.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getNotGates(): Promise<GetNotGates> {
		const not_gates = await this.db.getAll(ElementTypes.NotGate);
		const keys = await this.db.getAllKeys(ElementTypes.NotGate);
		return not_gates.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getBufferGates(): Promise<GetBufferGates> {
		const buffer_gates = await this.db.getAll(ElementTypes.BufferGate);
		const keys = await this.db.getAllKeys(ElementTypes.BufferGate);
		return buffer_gates.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getLatches(): Promise<GetLatches> {
		const latches = await this.db.getAll(ElementTypes.LatchGate);
		const keys = await this.db.getAllKeys(ElementTypes.LatchGate);
		return latches.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}
	public async getTimer(): Promise<GetTimer> {
		const timer = await this.db.getAll(ElementTypes.TimerGate);
		const keys = await this.db.getAllKeys(ElementTypes.TimerGate);
		return timer.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			ticks: value.ticks,
			orientation: value.orientation,
		}));
	}
	public async getSwitches(): Promise<GetSwitch> {
		const timer = await this.db.getAll(ElementTypes.Switch);
		const keys = await this.db.getAllKeys(ElementTypes.Switch);
		return timer.map((value, index) => ({
			id: keys[index],
			positions: value.positions,
			orientation: value.orientation,
		}));
	}

	public async getAllComponents(): Promise<getAllComponents> {
		return {
			[ElementTypes.Wire]: await this.getWires(),
			[ElementTypes.AndGate]: await this.getAndGates(),
			[ElementTypes.OrGate]: await this.getOrGates(),
			[ElementTypes.XorGate]: await this.getXorGates(),
			[ElementTypes.NotGate]: await this.getNotGates(),
			[ElementTypes.BufferGate]: await this.getBufferGates(),
			[ElementTypes.LatchGate]: await this.getLatches(),
			[ElementTypes.TimerGate]: await this.getTimer(),
			[ElementTypes.Switch]: await this.getSwitches(),
		};
	}

	public async getElementFromPosition(position: [number, number]) {
		const stores: ElementTypes[] = [
			ElementTypes.Wire,
			ElementTypes.AndGate,
			ElementTypes.OrGate,
			ElementTypes.XorGate,
			ElementTypes.NotGate,
			ElementTypes.BufferGate,
			ElementTypes.LatchGate,
			ElementTypes.TimerGate,
			ElementTypes.Switch,
		];

		for (const type of stores) {
			if (type === ElementTypes.Wire) continue;
			const values = await this.db.getAll(type);
			const keys = await this.db.getAllKeys(type);

			for (let i = 0; i < values.length; i++) {
				const comp = values[i];
				if (
					comp.positions[0] === position[0] &&
					comp.positions[1] === position[1]
				) {
					return { id: keys[i] as number, type, values, keys };
				}
			}
		}

		return null;
	}

	public async resetDb() {
		const tx = this.db.transaction(
			[
				ElementTypes.Wire,
				ElementTypes.AndGate,
				ElementTypes.OrGate,
				ElementTypes.XorGate,
				ElementTypes.NotGate,
				ElementTypes.BufferGate,
				ElementTypes.LatchGate,
				ElementTypes.TimerGate,
				ElementTypes.Switch,
			],
			"readwrite",
		);

		await Promise.all([
			tx.objectStore(ElementTypes.Wire).clear(),
			tx.objectStore(ElementTypes.AndGate).clear(),
			tx.objectStore(ElementTypes.OrGate).clear(),
			tx.objectStore(ElementTypes.XorGate).clear(),
			tx.objectStore(ElementTypes.NotGate).clear(),
			tx.objectStore(ElementTypes.BufferGate).clear(),
			tx.objectStore(ElementTypes.LatchGate).clear(),
			tx.objectStore(ElementTypes.TimerGate).clear(),
			tx.objectStore(ElementTypes.Switch).clear(),
		]);

		await tx.done;
	}
}
