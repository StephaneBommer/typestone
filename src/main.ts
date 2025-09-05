import * as THREE from "three";
import init from "../rust/pkg";
import { SimulationDb } from "./db/class";
import { GridClickHandler } from "./three/click";
import { EditMode } from "./three/edit";
import { SimulationScene } from "./three/scene";
import { Simulation } from "./three/simulation";
import { SIZE } from "./utils/const";

(async () => {
	await init();

	const db = new SimulationDb();
	await db.init();
	const dbComponents = await db.getAllComponents();

	const scene = new SimulationScene();
	const simulation = new Simulation(scene, db);

	dbComponents.Wire.forEach((wire) => simulation.Wire(wire));
	simulation.Switch([40, 32]);
	const editMode = new EditMode(scene, db);

	scene.addComponents(dbComponents);

	simulation.rust_simulation.compute_connections();

	new GridClickHandler(scene, SIZE, simulation, editMode);

	const clock = new THREE.Clock();

	const aimHz = 100;
	let fraction = 0;

	const tick = () => {
		const deltaHz = aimHz * clock.getDelta();
		fraction += deltaHz;

		const nextHz = Math.floor(fraction);
		fraction -= nextHz;

		scene.stats.begin();
		scene.stats.end();

		// if (nextHz >= 1) {
		// 	const new_simulation_state = simulation.rust_simulation.compute_frame(
		// 		100,
		// 		nextHz,
		// 	);
		// 	console.log(new_simulation_state);
		// 	simulation.update_simulation(new_simulation_state);
		// }

		scene.controls.update();
		scene.composer.render();
		window.requestAnimationFrame(tick);
	};

	tick();
})();
