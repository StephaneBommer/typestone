import type { SimulationDb } from "../../db/class";
import type { SimulationScene } from "../../scene";
import type { Pos } from "../../utils/types";
import type { Simulation } from "../simulation";

export interface EditHandler {
	click(pos: Pos, event?: MouseEvent): Promise<void>;
	mousemove(pos: Pos, event?: MouseEvent): Promise<void>;
	escape(): Promise<void>;
	setShift?(multi: boolean): void;
	right?(): void;
	left?(): void;
	up?(): void;
	down?(): void;
	copy?(): void;
	paste?(): void;
	apply?(): void;
	delete?(): void;
	setSelection?(start: Pos, end: Pos): void;
	releaseSelection?(start: Pos, end: Pos): void;
}

export abstract class BaseEditHandler implements EditHandler {
	protected scene: SimulationScene;
	protected db: SimulationDb;
	protected simulation: Simulation;

	constructor(
		scene: SimulationScene,
		db: SimulationDb,
		simulation: Simulation,
	) {
		this.scene = scene;
		this.db = db;
		this.simulation = simulation;
	}

	abstract click(pos: Pos): Promise<void>;
	abstract mousemove(pos: Pos): Promise<void>;
	abstract escape(): Promise<void>;
}
