use crate::components::*;
use crate::types::Orientation;
use crate::types::Position;
use crate::wire::Wire;
use crate::ComposantsEnum;
use crate::Simulation;

use js_sys::Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Simulation {
    pub fn add_wire(&mut self, positions: Array, id: usize) -> usize {
        let positions_vec: Vec<Position> = positions
            .iter()
            .map(|js_val| {
                let tuple = js_val.dyn_into::<Array>().unwrap();
                [
                    tuple.get(0).as_f64().unwrap() as i32,
                    tuple.get(1).as_f64().unwrap() as i32,
                ]
            })
            .collect();
        let wire = Wire::new(id, positions_vec);
        self.wires_map.insert(id, wire);
        id
    }

    pub fn add_and_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let and_gate = AndGate {
            gate: TwoInputsGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::AndGate(and_gate));
        id
    }

    pub fn add_or_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let or_gate = OrGate {
            gate: TwoInputsGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::OrGate(or_gate));
        id
    }

    pub fn add_xor_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let xor_gate = XorGate {
            gate: TwoInputsGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::XorGate(xor_gate));
        id
    }

    pub fn add_not_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let not_gate = NotGate {
            gate: OneInputGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::NotGate(not_gate));
        id
    }

    pub fn add_buffer_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let buffer_gate = BufferGate {
            gate: OneInputGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::BufferGate(buffer_gate));
        id
    }

    pub fn add_latch_gate(
        &mut self,
        position: Vec<i32>,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let latch_gate = LatchGate {
            gate: TwoInputsGate::new(id, position, orientation),
        };
        self.composants_map
            .insert(id, ComposantsEnum::LatchGate(latch_gate));
        id
    }

    pub fn add_timer(
        &mut self,
        position: Vec<i32>,
        ticks: u32,
        orientation: Orientation,
        id: usize,
    ) -> usize {
        let position = [position[0], position[1]];
        let timer_gate = TimerGate::new(OneInputGate::new(id, position, orientation), ticks);
        self.composants_map
            .insert(id, ComposantsEnum::TimerGate(timer_gate));
        id
    }

    pub fn add_switch(&mut self, position: Vec<i32>, id: usize) -> usize {
        let position = [position[0], position[1]];
        let switch = Switch::new(id, position);
        self.composants_map
            .insert(id, ComposantsEnum::Switch(switch));
        id
    }
}
