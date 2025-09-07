import type { DBSchema } from "idb";
import {
	ElementTypes,
	type Orientation,
	type Pos,
	type WirePos,
} from "../utils/types";

export interface getAllComponents {
	[ElementTypes.Wire]: GetWires;
	[ElementTypes.AndGate]: GetAndGates;
	[ElementTypes.OrGate]: GetOrGates;
	[ElementTypes.XorGate]: GetXorGates;
	[ElementTypes.NotGate]: GetNotGates;
	[ElementTypes.BufferGate]: GetBufferGates;
	[ElementTypes.LatchGate]: GetLatches;
	[ElementTypes.TimerGate]: GetTimer;
	[ElementTypes.Switch]: GetSwitch;
}

export type GetWires = {
	id: number;
	positions: WirePos;
}[];
export type GetAndGates = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetOrGates = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetXorGates = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetNotGates = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetBufferGates = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetLatches = {
	id: number;
	positions: Pos;
	orientation: Orientation;
}[];
export type GetTimer = {
	id: number;
	positions: Pos;
	orientation: Orientation;
	ticks: number;
}[];
export type GetSwitch = {
	id: number;
	positions: Pos;
}[];

export interface MyDB extends DBSchema {
	[ElementTypes.Wire]: {
		value: {
			positions: WirePos;
		};
		key: number;
	};
	[ElementTypes.AndGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.OrGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.XorGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.NotGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.BufferGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.LatchGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
	[ElementTypes.TimerGate]: {
		value: {
			positions: Pos;
			orientation: Orientation;
			ticks: number;
		};
		key: number;
	};
	[ElementTypes.Switch]: {
		value: {
			positions: Pos;
			orientation: Orientation;
		};
		key: number;
	};
}
