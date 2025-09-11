import * as THREE from "three";
import init from "../rust/pkg/rust_counter";
import { EditMode } from "./core/edit";
import { InputHandler } from "./core/input";
import { Simulation } from "./core/simulation";
import { SimulationDb } from "./db/class";
import { SimulationScene } from "./scene";
import { AIM_HZ, MAX_DEEP, SIZE } from "./utils/constants";

(async () => {
	await init();

	const db = new SimulationDb();
	await db.init();
	const dbComponents = await db.getAllComponents();

	const scene = new SimulationScene();

	const simulation = new Simulation(scene, db);
	simulation.addComponents(dbComponents);
	simulation.rust_simulation.compute_connections();

	const reset = async () => {
		const newDbComponents = await db.getAllComponents();
		simulation.reset();
		simulation.addComponents(newDbComponents);
		simulation.rust_simulation.compute_connections();
	};

	const editMode = new EditMode(scene, db, simulation);
	editMode.onStopEditing(reset);

	new InputHandler(scene, SIZE, editMode, simulation, db);

	const clock = new THREE.Clock();
	let fraction = 0;

	const tick = () => {
		const deltaHz = AIM_HZ * clock.getDelta();
		fraction += deltaHz;

		const nextHz = Math.floor(fraction);
		fraction -= nextHz;

		scene.stats.begin();
		scene.stats.end();

		if (nextHz >= 1) {
			const new_simulation_state = simulation.rust_simulation.compute_frame(
				MAX_DEEP,
				nextHz,
			);
			simulation.update_simulation(new_simulation_state);
		}

		scene.grid.update(scene.camera);

		scene.controls.update();
		scene.composer.render();
		window.requestAnimationFrame(tick);
	};

	tick();
})();
