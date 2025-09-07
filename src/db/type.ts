import type { DBSchema } from "idb";
import {
	type ComposantTypes,
	ElementTypes,
	type Orientation,
	type Pos,
	type WirePos,
} from "../utils/types";

export interface getAllComponents {
	[ElementTypes.Wire]: GetWires;
	[ElementTypes.Component]: GetComponents;
}

export type GetWires = {
	key: number;
	value: {
		positions: WirePos;
	};
}[];
export type GetComponents = {
	key: number;
	value:
		| {
				type: Omit<ComposantTypes, "TimerGate">;
				positions: Pos;
				orientation: Orientation;
		  }
		| {
				type: ComposantTypes.TimerGate;
				positions: Pos;
				orientation: Orientation;
				ticks: number;
		  };
}[];

export interface MyDB extends DBSchema {
	[ElementTypes.Wire]: {
		value: {
			positions: WirePos;
		};
		key: number;
	};
	[ElementTypes.Component]: {
		value:
			| {
					type: Omit<ComposantTypes, "TimerGate">;
					positions: Pos;
					orientation: Orientation;
			  }
			| {
					type: ComposantTypes.TimerGate;
					positions: Pos;
					orientation: Orientation;
					ticks: number;
			  };
		key: number;
	};
}
