import { Orientation } from "../utils/types";

const FullAdderwiresArrayFullAdder: [number, number][][] = [
	[
		[60, 3],
		[58, 3],
		[58, 7],
		[60, 7],
	],
	[
		[56, 0],
		[56, 5],
		[60, 5],
	],
	[
		[56, 5],
		[56, 9],
		[60, 9],
	],
	[
		[6, 3],
		[6, 2],
		[72, 2],
		[72, 4],
	],
	[
		[65, 4],
		[72, 4],
	],
	[
		[11, 4],
		[11, 8],
		[15, 8],
	],
	[
		[6, 5],
		[4, 5],
	],
	[
		[6, 9],
		[2, 9],
	],
	[
		[15, 6],
		[13, 6],
	],
	[
		[20, 7],
		[22, 7],
	],
];

const FullAdderandsArray: [number, number][] = [
	[65, 8],
	[11, 8],
	[11, 4],
];

const fullAddeerXorArray: [number, number][] = [[65, 4]];

const FullAdderlatchArray: [number, number, boolean, Orientation][] = [
	[20, 7, false, Orientation.Right],
];

const FullAddertimerArray: [number, number, number][] = [[27, 7, 100]];

const adjustPoint = (
	point: [number, number],
	baseX: number,
	baseY: number,
): [number, number] => [point[0] + baseX, point[1] + baseY];

const fullAdders = [
	[290, 10],
	[290, 21],
	[290, 32],
	[290, 43],
	[290, 54],
	[290, 65],
	[290, 76],
	[290, 87],
	[290, 98],
	[290, 109],
];

export const adjustedWiresArray = fullAdders.flatMap((fullAdder) =>
	FullAdderwiresArrayFullAdder.map((wire) =>
		wire.map((wire) => adjustPoint(wire, fullAdder[0], fullAdder[1])),
	),
);

export const adjustedAndsArray = fullAdders.flatMap((fullAdder) =>
	FullAdderandsArray.map((and) => adjustPoint(and, fullAdder[0], fullAdder[1])),
);

export const adjustedLatchArray = fullAdders.flatMap((fullAdder) =>
	FullAdderlatchArray.map((latch) => {
		return {
			pos: adjustPoint([latch[0], latch[1]], fullAdder[0], fullAdder[1]),
			orientation: latch[3],
		};
	}),
);

export const adjustedTimerArray = fullAdders.flatMap((fullAdder) =>
	FullAddertimerArray.map((timer) => [
		...adjustPoint([timer[0], timer[1]], fullAdder[0], fullAdder[1]),
		timer[2],
	]),
);

export const adjustedXorArray = fullAdders.flatMap((fullAdder) =>
	fullAddeerXorArray.map((xor) => adjustPoint(xor, fullAdder[0], fullAdder[1])),
);

export const clockWiresArray: [number, number][][] = [
	//carry
	[
		[355, 18],
		[355, 21],
		[346, 21],
	],
	[
		[355, 29],
		[355, 32],
		[346, 32],
	],
	[
		[355, 40],
		[355, 43],
		[346, 43],
	],
	[
		[355, 51],
		[355, 54],
		[346, 54],
	],
	[
		[355, 62],
		[355, 65],
		[346, 65],
	],
	[
		[355, 73],
		[355, 76],
		[346, 76],
	],
	[
		[355, 84],
		[355, 87],
		[346, 87],
	],
	[
		[355, 95],
		[355, 98],
		[346, 98],
	],
	[
		[355, 106],
		[355, 109],
		[346, 109],
	],
	//clock
	[
		[303, 16],
		[303, 27],
		[303, 38],
		[303, 49],
		[303, 60],
		[303, 71],
		[303, 82],
		[303, 93],
		[303, 104],
		[303, 115],
	],
	//increment loop multiplexer
	[
		[294, 15],
		[294, 26],
		[294, 37],
		[294, 48],
		[294, 59],
		[294, 70],
		[294, 81],
		[294, 92],
		[294, 103],
		[294, 114],
		[294, 121],
	],
	//data multiplexer
	[
		[292, 19],
		[292, 30],
		[292, 41],
		[292, 52],
		[292, 63],
		[292, 74],
		[292, 85],
		[292, 96],
		[292, 107],
		[292, 118],
	],
	//other
	[
		[303, 115],
		[303, 124],
	],
	[
		[303, 124],
		[303, 148],
	],

	//clock to memory
	[
		[322, 17],
		[322, 125],
		[270, 125],
	],
	[
		[324, 28],
		[324, 127],
		[270, 127],
	],
	[
		[326, 39],
		[326, 129],
		[270, 129],
	],
	[
		[328, 50],
		[328, 131],
		[270, 131],
	],
	[
		[330, 61],
		[330, 133],
		[270, 133],
	],
	[
		[332, 72],
		[332, 135],
		[270, 135],
	],
	[
		[334, 83],
		[334, 137],
		[270, 137],
	],
	[
		[336, 94],
		[336, 139],
		[270, 139],
	],
	[
		[338, 105],
		[338, 141],
		[270, 141],
	],
	[
		[340, 116],
		[340, 143],
		[270, 143],
	],
	//
	[
		[294, 10],
		[346, 10],
	],
	//latch to adder
	[
		[317, 17],
		[322, 17],
		[348, 17],
	],
	[
		[317, 28],
		[324, 28],
		[348, 28],
	],
	[
		[317, 39],
		[326, 39],
		[348, 39],
	],
	[
		[317, 50],
		[328, 50],
		[348, 50],
	],
	[
		[317, 61],
		[330, 61],
		[348, 61],
	],
	[
		[317, 72],
		[332, 72],
		[348, 72],
	],
	[
		[317, 83],
		[334, 83],
		[348, 83],
	],
	[
		[317, 94],
		[336, 94],
		[348, 94],
	],
	[
		[317, 105],
		[338, 105],
		[348, 105],
	],
	[
		[317, 116],
		[340, 116],
		[348, 116],
	],
];

export const clockNotArray: [number, number][] = [
	[294, 121],
	[294, 10],
];
