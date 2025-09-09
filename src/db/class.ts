import { type IDBPDatabase, openDB } from "idb";
import {
	type ComposantTypes,
	ElementTypes,
	type WirePos,
} from "../utils/types";
import type { GetComponents, GetWires, MyDB, getAllComponents } from "./types";

export class SimulationDb {
	private db!: IDBPDatabase<MyDB>;
	public async init() {
		this.db = await openDB<MyDB>("typestone", 2, {
			upgrade(db) {
				db.createObjectStore(ElementTypes.Wire, { autoIncrement: true });
				db.createObjectStore(ElementTypes.Component, {
					autoIncrement: true,
				});
			},
		});
	}

	public async addWire(positions: WirePos): Promise<GetWires[number]> {
		const wire = await this.db.add(ElementTypes.Wire, { positions });
		return {
			key: wire,
			value: { positions },
		};
	}

	public async addComponent(
		type: ComposantTypes,
		positions: GetComponents[number]["value"]["positions"],
		orientation: GetComponents[number]["value"]["orientation"],
		ticks?: number,
	) {
		const component = await this.db.add(ElementTypes.Component, {
			type,
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
			key: keys[index],
			value,
		}));
	}

	public async getComponents(): Promise<GetComponents> {
		const components = await this.db.getAll(ElementTypes.Component);
		const keys = await this.db.getAllKeys(ElementTypes.Component);
		return components.map((value, index) => ({
			key: keys[index],
			value,
		}));
	}

	public async getAllComponents(): Promise<getAllComponents> {
		return {
			[ElementTypes.Wire]: await this.getWires(),
			[ElementTypes.Component]: await this.getComponents(),
		};
	}

	public async getComponentByKey(
		key: number,
	): Promise<GetComponents[number] | null> {
		const value = await this.db.get(ElementTypes.Component, key);
		if (!value) return null;
		return { key, value };
	}

	public async getWireByKey(key: number): Promise<GetWires[number] | null> {
		const value = await this.db.get(ElementTypes.Wire, key);
		if (!value) return null;
		return { key, value };
	}

	public async deleteComponent(id: number) {
		await this.db.delete(ElementTypes.Component, id);
	}

	public async deleteWire(id: number) {
		return await this.db.delete(ElementTypes.Wire, id);
	}

	public async updateWire(id: number, positions: WirePos) {
		const existing = await this.db.get(ElementTypes.Wire, id);
		if (!existing) return null;

		const updated = { ...existing, positions };
		await this.db.put(ElementTypes.Wire, updated, id);

		return { key: id, value: updated };
	}

	public async updateComponent(
		id: number,
		data: {
			type?: ComposantTypes;
			positions?: [number, number];
			orientation?: number;
			ticks?: number;
		},
	) {
		const existing = await this.db.get(ElementTypes.Component, id);
		if (!existing) return null;

		const updated = { ...existing, ...data };
		await this.db.put(ElementTypes.Component, updated, id);

		return { key: id, value: updated };
	}

	public async getElementFromPosition(position: [number, number]) {
		const stores: ElementTypes[] = [ElementTypes.Wire, ElementTypes.Component];

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
			[ElementTypes.Wire, ElementTypes.Component],
			"readwrite",
		);

		await Promise.all([
			tx.objectStore(ElementTypes.Wire).clear(),
			tx.objectStore(ElementTypes.Component).clear(),
		]);

		await tx.done;
	}
}
