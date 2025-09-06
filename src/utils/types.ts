import { Orientation } from "../../rust/pkg";

export { Orientation };

export type Pos = [number, number];
export type PosOrientation = [number, number, Orientation];
export type WirePos = Pos[];

export enum ElementTypes {
	Wire = "Wire",
	AndGate = "AndGate",
	OrGate = "OrGate",
	XorGate = "XorGate",
	NotGate = "NotGate",
	BufferGate = "BufferGate",
	LatchGate = "LatchGate",
	TimerGate = "TimerGate",
	Switch = "Switch",
}
