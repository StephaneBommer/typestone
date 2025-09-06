mod circuit_element;
mod components;
mod js;
mod simulation;
mod types;
mod utils;
mod wire;

use std::collections::HashSet;
use wasm_bindgen::prelude::*;

use crate::components::*;
use crate::js::TickResults;
use crate::types::{ChangedElement, OldComponents, OldWireGroup};
use crate::utils::console_log;
use crate::wire::{Wire, WireGroup};

pub enum ComposantsEnum {
    OrGate(OrGate),
    AndGate(AndGate),
    Switch(Switch),
    XorGate(XorGate),
    NotGate(NotGate),
    BufferGate(BufferGate),
    LatchGate(LatchGate),
    TimerGate(TimerGate),
}

#[wasm_bindgen]
pub struct Simulation {
    composants: Vec<ComposantsEnum>,
    wires: Vec<Wire>,
    wire_set: HashSet<usize>,
    wire_groups: Vec<WireGroup>,
    tick_counter: u32,
}

#[wasm_bindgen]
impl Simulation {
    pub fn new() -> Self {
        Simulation {
            composants: Vec::new(),
            wires: Vec::new(),
            wire_set: HashSet::new(),
            wire_groups: Vec::new(),
            tick_counter: 0,
        }
    }

    fn tick(&mut self) -> bool {
        let mut is_something_different: bool = false;

        let mut new_wire_group_states = Vec::with_capacity(self.wire_groups.len());
        for wire_group in self.wire_groups.iter() {
            let new_state = wire_group.compute_next_state(self);
            new_wire_group_states.push(new_state);
            is_something_different |= new_state.1;
        }

        let mut new_composant_state = Vec::with_capacity(self.composants.len());
        for composant in self.composants.iter() {
            match composant {
                ComposantsEnum::OrGate(or_gate) => {
                    let new_state = or_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::AndGate(and_gate) => {
                    let new_state = and_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::XorGate(xor_gate) => {
                    let new_state = xor_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::NotGate(not_gate) => {
                    let new_state = not_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::BufferGate(buffer_gate) => {
                    let new_state = buffer_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::LatchGate(latch_gate) => {
                    let new_state = latch_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::TimerGate(timer_gate) => {
                    let new_state = timer_gate.compute_next_state(self);
                    new_composant_state.push(new_state);
                }
                ComposantsEnum::Switch(switch) => {
                    new_composant_state.push((switch.circuit_element.state, false));
                }
            };
        }

        for (index, &wire_group_state) in new_wire_group_states.iter().enumerate() {
            self.wire_groups[index]
                .circuit_element
                .set_state(wire_group_state.0);
        }
        for (index, &comp_state) in new_composant_state.iter().enumerate() {
            match &mut self.composants[index] {
                ComposantsEnum::OrGate(or_gate) => {
                    or_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::AndGate(and_gate) => {
                    and_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::XorGate(xor_gate) => {
                    xor_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::NotGate(not_gate) => {
                    not_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::BufferGate(buffer_gate) => {
                    buffer_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::LatchGate(latch_gate) => {
                    latch_gate.gate.circuit_element.set_state(comp_state.0)
                }
                ComposantsEnum::TimerGate(timer_gate) => {
                    timer_gate.update_input(comp_state.0);
                    let new_state = timer_gate.check_stack_and_update();
                    is_something_different |= new_state.1;
                }
                ComposantsEnum::Switch(_) => (),
            }
        }

        self.tick_counter += 1;
        is_something_different
    }

    fn create_old_components_copy(&self) -> Vec<OldComponents> {
        self.composants
            .iter()
            .map(|composant| match composant {
                ComposantsEnum::OrGate(or_gate) => OldComponents {
                    index: or_gate.gate.circuit_element.id,
                    state: or_gate.gate.circuit_element.state,
                },
                ComposantsEnum::AndGate(and_gate) => OldComponents {
                    index: and_gate.gate.circuit_element.id,
                    state: and_gate.gate.circuit_element.state,
                },
                ComposantsEnum::XorGate(xor_gate) => OldComponents {
                    index: xor_gate.gate.circuit_element.id,
                    state: xor_gate.gate.circuit_element.state,
                },
                ComposantsEnum::NotGate(not_gate) => OldComponents {
                    index: not_gate.gate.circuit_element.id,
                    state: not_gate.gate.circuit_element.state,
                },
                ComposantsEnum::BufferGate(buffer_gate) => OldComponents {
                    index: buffer_gate.gate.circuit_element.id,
                    state: buffer_gate.gate.circuit_element.state,
                },
                ComposantsEnum::LatchGate(latch_gate) => OldComponents {
                    index: latch_gate.gate.circuit_element.id,
                    state: latch_gate.gate.circuit_element.state,
                },
                ComposantsEnum::TimerGate(timer_gate) => OldComponents {
                    index: timer_gate.gate.circuit_element.id,
                    state: timer_gate.gate.circuit_element.state,
                },
                ComposantsEnum::Switch(switch) => OldComponents {
                    index: switch.circuit_element.id,
                    state: switch.circuit_element.state,
                },
            })
            .collect()
    }

    fn create_old_wires_group_copy(&self) -> Vec<OldWireGroup> {
        self.wire_groups
            .iter()
            .map(|wire_group| OldWireGroup {
                index: wire_group.circuit_element.id,
                state: wire_group.circuit_element.state,
            })
            .collect()
    }

    fn create_changed_wires_copy(
        &self,
        old_wires_groups: Vec<OldWireGroup>,
    ) -> Vec<ChangedElement> {
        let changed_wires_groups: Vec<ChangedElement> = self
            .wire_groups
            .iter()
            .enumerate()
            .filter_map(|(index, wires_group)| {
                let old_wire_group = &old_wires_groups[index];
                if wires_group.circuit_element.state != old_wire_group.state {
                    Some(ChangedElement::new(
                        index,
                        wires_group.circuit_element.state,
                    ))
                } else {
                    None
                }
            })
            .collect();

        changed_wires_groups
            .iter()
            .flat_map(|changed_wire_group| {
                let wire_group = &self.wire_groups[changed_wire_group.index];
                let state = wire_group.circuit_element.state;

                wire_group
                    .wires
                    .iter()
                    .map(move |wire| ChangedElement::new(wire.clone(), state))
            })
            .collect()
    }

    fn create_changed_components_copy(
        &self,
        old_components: Vec<OldComponents>,
    ) -> Vec<ChangedElement> {
        self.composants
            .iter()
            .enumerate()
            .filter_map(|(index, composant)| {
                let old_component = &old_components[index];
                let new_state = match composant {
                    ComposantsEnum::OrGate(or_gate) => or_gate.gate.circuit_element.state,
                    ComposantsEnum::AndGate(and_gate) => and_gate.gate.circuit_element.state,
                    ComposantsEnum::XorGate(xor_gate) => xor_gate.gate.circuit_element.state,
                    ComposantsEnum::NotGate(not_gate) => not_gate.gate.circuit_element.state,
                    ComposantsEnum::BufferGate(buffer_gate) => {
                        buffer_gate.gate.circuit_element.state
                    }
                    ComposantsEnum::LatchGate(latch_gate) => latch_gate.gate.circuit_element.state,
                    ComposantsEnum::TimerGate(timer_gate) => timer_gate.gate.circuit_element.state,
                    ComposantsEnum::Switch(switch) => switch.circuit_element.state,
                };
                if new_state != old_component.state {
                    Some(ChangedElement::new(old_component.index, new_state))
                } else {
                    None
                }
            })
            .collect()
    }

    fn run_until_stabilizes(&mut self, max_depth: u32) {
        let mut counter: u32 = 0;

        while counter < max_depth {
            counter += 1;

            let is_something_different = self.tick();
            if !is_something_different {
                break;
            }
        }

        self.composants.iter_mut().for_each(|composant| {
            if let ComposantsEnum::TimerGate(timer_gate) = composant {
                timer_gate.decrement_ticks();
            }
        });

        if counter == max_depth {
            console_log("!!!!!!!!! Reached max_depth !!!!!!!!!!!!");
        }
    }

    pub fn compute_frame(&mut self, max_depth: u32, tick_per_frame: u32) -> TickResults {
        let old_wires_group = self.create_old_wires_group_copy();
        let old_components = self.create_old_components_copy();

        for _ in 0..tick_per_frame {
            self.run_until_stabilizes(max_depth);
        }

        let changed_wires = self.create_changed_wires_copy(old_wires_group);
        let changed_components: Vec<ChangedElement> =
            self.create_changed_components_copy(old_components);

        TickResults::new(changed_wires, changed_components)
    }

    pub fn update_switch_state(&mut self, component_index: usize, state: bool) {
        if let Some(composant) = self.composants.get_mut(component_index) {
            match composant {
                ComposantsEnum::Switch(switch) => {
                    switch.circuit_element.set_state(state);
                }
                _ => console_log("Invalid gate index"),
            }
        } else {
            console_log("Invalid gate index");
        }
    }
}
