import * as THREE from "three";
import init from "../rust/pkg";
import { SimulationDb } from "./db/class";
import { GridClickHandler } from "./three/click";
import { EditMode } from "./three/edit";
import { SimulationScene } from "./three/scene";
import { Simulation } from "./three/simulation";
import {
	adjustedAndsArray,
	adjustedLatchArray,
	adjustedTimerArray,
	adjustedWiresArray,
	adjustedXorArray,
	clockNotArray,
	clockWiresArray,
} from "./three/test";
import { SIZE } from "./utils/const";

(async () => {
	await init();

	const db = new SimulationDb();
	await db.init();
	const dbComponents = await db.getAllComponents();

	const scene = new SimulationScene();
	const simulation = new Simulation(scene, db);

	// dbComponents.Wire.forEach((wire) => simulation.Wire(wire.positions));

	simulation.Switch([40, 32]);
	const editMode = new EditMode(scene, db);

	[...adjustedWiresArray, ...clockWiresArray].forEach((wire) => {
		simulation.Wire(wire);
	});
	adjustedAndsArray.forEach((not) => {
		simulation.AndGate(not);
	});
	adjustedLatchArray.forEach((latch) => {
		simulation.Latch(latch);
	});
	adjustedTimerArray.forEach((timer) => {
		simulation.Timer([timer[0], timer[1]], 1);
	});
	clockNotArray.forEach((not) => {
		simulation.NotGate(not);
	});
	adjustedXorArray.forEach((xor) => {
		simulation.XorGate(xor);
	});

	simulation.Switch([5, 14]);
	simulation.Switch([5, 18]);
	simulation.Latch([14, 15]);
	simulation.Timer([11, 4], 1);
	simulation.Timer([25, 4], 1);
	simulation.Timer([32, 4], 1);

	simulation.Wire([
		[5, 14],
		[9, 14],
	]);

	simulation.Wire([
		[5, 18],
		[9, 18],
		[9, 16],
	]);

	simulation.Switch([5, 4]);
	simulation.NotGate([11, 8]);
	simulation.Switch([277, 148]);
	simulation.NotGate([285, 148]);
	simulation.NotGate([293, 148]);
	simulation.Timer([285, 152], 1);

	simulation.Wire([
		[277, 148],
		[280, 148],
		[280, 152],
	]);
	simulation.Wire([
		[285, 152],
		[285, 148],
		[288, 148],
	]);
	simulation.Wire([
		[293, 148],
		[293, 152],
		[289, 152],
		[289, 155],
	]);
	simulation.Wire([
		[294, 155],
		[296, 155],
	]);
	simulation.Switch([276, 157]);
	simulation.Wire([
		[301, 155],
		[301, 152],
		[293, 152],
	]);
	simulation.Wire([
		[301, 152],
		[303, 152],
		[303, 148],
	]);

	simulation.Switch([303, 148]);
	simulation.Timer([301, 155], 1);
	simulation.Timer([294, 155], 1);
	simulation.Wire([
		[5, 4],
		[6, 4],
		[6, 8],
	]);

	simulation.Wire([
		[11, 8],
		[11, 4],
		[13, 4],
	]);

	simulation.Wire([
		[18, 4],
		[20, 4],
	]);

	simulation.NotGate([18, 4]);
	simulation.Wire([
		[25, 4],
		[27, 4],
	]);

	simulation.Wire([
		[32, 4],
		[32, 7],
		[20, 7],
		[20, 4],
	]);

	// scene.addComponents(dbComponents);

	simulation.rust_simulation.compute_connections();

	new GridClickHandler(scene, SIZE, simulation, editMode);

	const clock = new THREE.Clock();

	const aimHz = 5000;
	let fraction = 0;

	const tick = () => {
		const deltaHz = aimHz * clock.getDelta();
		fraction += deltaHz;

		const nextHz = Math.floor(fraction);
		fraction -= nextHz;

		scene.stats.begin();
		scene.stats.end();

		if (nextHz >= 1) {
			const new_simulation_state = simulation.rust_simulation.compute_frame(
				100,
				nextHz,
			);
			// console.log(new_simulation_state);
			simulation.update_simulation(new_simulation_state);
		}

		scene.controls.update();
		scene.composer.render();
		window.requestAnimationFrame(tick);
	};

	tick();
})();
