use crate::circuit_element::CircuitElementEnum;
use crate::console_log;
use crate::wire::WireGroup;
use crate::ComposantsEnum;
use crate::Simulation;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Simulation {
    fn find_matching_wire(&mut self, wire_index: usize, wire_group_index: usize) {
        // Récupère les positions du wire de départ
        let wire_positions = if let Some(w) = self.wires_map.get(&wire_index) {
            w.positions.clone()
        } else {
            return; // Wire introuvable -> on sort
        };

        let wire_set_snapshot: Vec<_> = self.wire_set.iter().copied().collect();

        for wire_in_set in wire_set_snapshot {
            if wire_in_set == wire_index {
                continue;
            }

            // Extraire une copie des positions du wire candidat
            let positions_opt = self
                .wires_map
                .get(&wire_in_set)
                .map(|w| w.positions.clone());
            if positions_opt.is_none() {
                continue;
            }
            let candidate_positions = positions_opt.unwrap();

            for pos in &wire_positions {
                let matching_pos = candidate_positions.iter().any(|p| p == pos);
                if !matching_pos {
                    continue;
                }

                if !self.wire_set.contains(&wire_in_set) {
                    continue;
                }

                // Ici plus aucun emprunt immuable → on peut muter
                self.wire_groups[wire_group_index]
                    .add_wire(wire_in_set, candidate_positions.clone());
                self.wire_set.remove(&wire_in_set);

                self.find_matching_wire(wire_in_set, wire_group_index);
            }
        }
    }

    pub fn compute_connections(&mut self) {
        // Remplir le set avec tous les wires
        for wire in self.wires_map.values() {
            self.wire_set.insert(wire.circuit_element.id);
        }

        let wires_to_map: Vec<usize> = self.wire_set.iter().copied().collect();

        // Construire les wire groups
        for wire in wires_to_map {
            if !self.wire_set.contains(&wire) {
                continue;
            }
            self.wire_set.remove(&wire);

            let mut wire_group = WireGroup::new(self.wire_groups.len());

            if let Some(w) = self.wires_map.get(&wire) {
                wire_group.add_wire(wire, w.positions.clone());
            }

            let wire_group_id = wire_group.circuit_element.id;
            self.wire_groups.push(wire_group);
            self.find_matching_wire(wire, wire_group_id);
        }

        //
        // Connecter les wires et les composants
        //
        for (composant_id, composant) in self.composants_map.iter_mut() {
            match composant {
                ComposantsEnum::OrGate(or_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if or_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (OR gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                or_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            for input_pos in or_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected (OR gate) input {} to wire group {}",
                                        composant_id, wire_group.circuit_element.id
                                    ));
                                    or_gate.gate.circuit_element.inputs.push(
                                        CircuitElementEnum::WireGroup(
                                            wire_group.circuit_element.id,
                                        ),
                                    );
                                    wire_group
                                        .circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(*composant_id));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::AndGate(and_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if and_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (AND gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                and_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            for input_pos in and_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected (AND gate) input {} to wire group {}",
                                        composant_id, wire_group.circuit_element.id
                                    ));
                                    and_gate.gate.circuit_element.inputs.push(
                                        CircuitElementEnum::WireGroup(
                                            wire_group.circuit_element.id,
                                        ),
                                    );
                                    wire_group
                                        .circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(*composant_id));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::XorGate(xor_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if xor_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (XOR gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                xor_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            for input_pos in xor_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected (XOR gate) input {} to wire group {}",
                                        composant_id, wire_group.circuit_element.id
                                    ));
                                    xor_gate.gate.circuit_element.inputs.push(
                                        CircuitElementEnum::WireGroup(
                                            wire_group.circuit_element.id,
                                        ),
                                    );
                                    wire_group
                                        .circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(*composant_id));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::LatchGate(latch_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if latch_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (Latch gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                latch_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            for input_pos in latch_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected (Latch gate) input {} to wire group {}",
                                        composant_id, wire_group.circuit_element.id
                                    ));
                                    latch_gate.gate.circuit_element.inputs.push(
                                        CircuitElementEnum::WireGroup(
                                            wire_group.circuit_element.id,
                                        ),
                                    );
                                    wire_group
                                        .circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(*composant_id));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::BufferGate(buffer_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if buffer_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (Buffer gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                buffer_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            if buffer_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected (Buffer gate) input {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                buffer_gate.gate.circuit_element.inputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                        }
                    }
                }
                ComposantsEnum::TimerGate(timer_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if timer_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (Timer gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                timer_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            if timer_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected (Timer gate) input {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                timer_gate.gate.circuit_element.inputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                        }
                    }
                }
                ComposantsEnum::NotGate(not_gate) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if not_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (Not gate) output {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                not_gate.gate.circuit_element.outputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                            if not_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected (Not gate) input {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                not_gate.gate.circuit_element.inputs.push(
                                    CircuitElementEnum::WireGroup(wire_group.circuit_element.id),
                                );
                                wire_group
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                        }
                    }
                }
                ComposantsEnum::Switch(switch) => {
                    for wire_group in self.wire_groups.iter_mut() {
                        for pos in wire_group.positions.iter() {
                            if switch.output_position == *pos {
                                console_log(&format!(
                                    "Connected (Switch) {} to wire group {}",
                                    composant_id, wire_group.circuit_element.id
                                ));
                                switch
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(
                                        wire_group.circuit_element.id,
                                    ));
                                wire_group
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(*composant_id));
                            }
                        }
                    }
                }
            }
        }
    }
}
