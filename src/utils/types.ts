import { Orientation } from "../../rust/pkg";

export { Orientation };

export type Pos = [number, number];
export type PosOrientation = [number, number, Orientation];
export type WirePos = Pos[];

export enum ElementTypes {
	Wire = "Wire",
	Component = "Component",
}

export enum ComposantTypes {
	Switch = "Switch",
	BufferGate = "BufferGate",
	NotGate = "NotGate",
	TimerGate = "TimerGate",
	AndGate = "AndGate",
	OrGate = "OrGate",
	XorGate = "XorGate",
	LatchGate = "LatchGate",
}
