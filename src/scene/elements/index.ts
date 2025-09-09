import * as THREE from "three";

export abstract class ElementMesh extends THREE.Group {
	protected isDeteling = false;
	protected isSelected = false;
	public state = false;
	protected originalMaterials = new Map<THREE.Object3D, THREE.Material>();
	protected abstract material: Record<string, THREE.MeshStandardMaterial>;
	public key?: number;

	public setDeleting(isDeleting: boolean) {
		this.isDeteling = isDeleting;
		this.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				if (isDeleting) {
					if (!this.originalMaterials.has(child)) {
						this.originalMaterials.set(child, child.material);
					}
					child.material = this.material.delete;
				} else {
					const orig = this.originalMaterials.get(child);
					if (orig) {
						child.material = orig;
					}
				}
			}
		});

		if (!isDeleting) {
			this.originalMaterials.clear();
		}
	}

	public setSelected(isSelected: boolean) {
		this.isSelected = isSelected;

		if (this.parent && "addOutlineObject" in this.parent) {
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const scene = this.parent as any;
			if (isSelected) {
				scene.addOutlineObject(this);
			} else {
				scene.removeOutlineObject(this);
			}
		}
	}
}
