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

export enum MaterialType {
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
	Input = "Input",
	Output = "Output",
	// Switch
	SwitchOn = "SwitchOn",
	SwitchOff = "SwitchOff",
	Switch = "Switch",
	// Editing
	Delete = "Delete",
	DeleteWire = "DeleteWire",
}
