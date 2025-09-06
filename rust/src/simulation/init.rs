use crate::circuit_element::CircuitElementEnum;
use crate::console_log;
use crate::wire::WireGroup;
use crate::ComposantsEnum;
use crate::Simulation;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Simulation {
    fn find_matching_wire(&mut self, wire_index: usize, wire_group_index: usize) {
        let wire_positions = self.wires[wire_index].positions.clone();

        let wire_set_snapshot: Vec<_> = self.wire_set.iter().copied().collect();

        for wire_in_set in wire_set_snapshot {
            if wire_in_set == wire_index {
                continue;
            }

            for pos in &wire_positions {
                let matching_pos = self.wires[wire_in_set]
                    .positions
                    .iter()
                    .any(|pos_in_set| pos_in_set == pos);

                if !matching_pos {
                    continue;
                }

                if !self.wire_set.contains(&wire_in_set) {
                    continue;
                }

                self.wire_groups[wire_group_index]
                    .add_wire(wire_in_set, self.wires[wire_in_set].positions.clone());
                self.wire_set.remove(&wire_in_set);

                self.find_matching_wire(wire_in_set, wire_group_index);
            }
        }
    }

    pub fn compute_connections(&mut self) {
        for wire in self.wires.iter() {
            self.wire_set.insert(wire.circuit_element.id);
        }

        let wires_to_map: Vec<usize> = self.wire_set.iter().map(|wire| wire.clone()).collect();

        for wire in wires_to_map {
            if !self.wire_set.contains(&wire) {
                continue;
            }
            self.wire_set.remove(&wire);

            let mut wire_group = WireGroup::new(self.wire_groups.len());
            wire_group.add_wire(wire, self.wires[wire].positions.clone());

            let wire_group_id = wire_group.circuit_element.id.clone();
            self.wire_groups.push(wire_group);
            self.find_matching_wire(wire, wire_group_id);
        }

        //
        //find connections between wires and components
        //

        for (composant_index, composant) in self.composants.iter_mut().enumerate() {
            match composant {
                ComposantsEnum::OrGate(or_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if or_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected (OR gate) gate output {} to wire {} ",
                                    composant_index, wire_group_index
                                ));
                                or_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }

                            for input_pos in or_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected (OR gate) gate input {} to wire {} ",
                                        composant_index, wire_group_index
                                    ));
                                    or_gate
                                        .gate
                                        .circuit_element
                                        .inputs
                                        .push(CircuitElementEnum::WireGroup(wire_group_index));
                                    wire.circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(composant_index));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::AndGate(and_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if and_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (AND gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                and_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            for input_pos in and_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected gate input (AND gate) {} to wire group {}",
                                        composant_index, wire_group_index
                                    ));
                                    and_gate
                                        .gate
                                        .circuit_element
                                        .inputs
                                        .push(CircuitElementEnum::WireGroup(wire_group_index));
                                    wire.circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(composant_index));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::XorGate(xor_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if xor_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (XOR gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                xor_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            for input_pos in xor_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected gate input (XOR gate) {} to wire group {}",
                                        composant_index, wire_group_index
                                    ));
                                    xor_gate
                                        .gate
                                        .circuit_element
                                        .inputs
                                        .push(CircuitElementEnum::WireGroup(wire_group_index));
                                    wire.circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(composant_index));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::LatchGate(latch_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if latch_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (Latch gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                latch_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            for input_pos in latch_gate.gate.input_positions.iter() {
                                if *input_pos == *pos {
                                    console_log(&format!(
                                        "Connected gate input (Latch gate) {} to wire group {}",
                                        composant_index, wire_group_index
                                    ));
                                    latch_gate
                                        .gate
                                        .circuit_element
                                        .inputs
                                        .push(CircuitElementEnum::WireGroup(wire_group_index));
                                    wire.circuit_element
                                        .outputs
                                        .push(CircuitElementEnum::Component(composant_index));
                                }
                            }
                        }
                    }
                }
                ComposantsEnum::BufferGate(buffer_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if buffer_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (Buffer gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                buffer_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            if buffer_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected gate input (Buffer gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                buffer_gate
                                    .gate
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                        }
                    }
                }
                ComposantsEnum::TimerGate(timer_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if timer_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (Timer gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                timer_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            if timer_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected gate input (Timer gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                timer_gate
                                    .gate
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                        }
                    }
                }
                ComposantsEnum::NotGate(not_gate) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if not_gate.gate.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate output (Not gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                not_gate
                                    .gate
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                            if not_gate.gate.input_position == *pos {
                                console_log(&format!(
                                    "Connected gate input (Not gate) {} to wire group {}",
                                    composant_index, wire_group_index
                                ));
                                not_gate
                                    .gate
                                    .circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                        }
                    }
                }
                ComposantsEnum::Switch(switch) => {
                    for (wire_group_index, wire) in self.wire_groups.iter_mut().enumerate() {
                        for pos in wire.positions.iter() {
                            if switch.output_position == *pos {
                                console_log(&format!(
                                    "Connected gate {} to wire group {} (switch)",
                                    composant_index, wire_group_index
                                ));
                                switch
                                    .circuit_element
                                    .outputs
                                    .push(CircuitElementEnum::WireGroup(wire_group_index));
                                wire.circuit_element
                                    .inputs
                                    .push(CircuitElementEnum::Component(composant_index));
                            }
                        }
                    }
                }
            }
        }
    }
}
