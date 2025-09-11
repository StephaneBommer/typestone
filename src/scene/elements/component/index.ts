import type * as THREE from "three";
import { SIZE } from "../../../utils/constants";
import type { ComposantTypes, Orientation, Pos } from "../../../utils/types";
import { ElementMesh } from "../index";

export abstract class Component extends ElementMesh {
	public abstract orientation: Orientation;
	public abstract pos: Pos;
	public abstract type: ComposantTypes;
	public abstract ticks?: number;
	protected abstract topMesh: THREE.Mesh;

	public translate(x: number, y: number) {
		this.translateX(x * SIZE);
		this.translateY(y * -SIZE);
		this.pos = [this.pos[0] + x, this.pos[1] + y];
	}

	public setState(state: boolean) {
		this.state = state;
		this.topMesh.material = state ? this.material.topOn : this.material.topOff;
	}
}
