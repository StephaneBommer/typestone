use crate::components::*;
use crate::types::Position;
use crate::wire::Wire;
use crate::ComposantsEnum;
use crate::Simulation;

use js_sys::Array;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Simulation {
    pub fn add_wire(&mut self, positions: Array, tsid: usize) -> u32 {
        let positions_vec: Vec<Position> = positions
            .iter()
            .map(|js_val| {
                let tuple = js_val.dyn_into::<Array>().unwrap();
                [
                    tuple.get(0).as_f64().unwrap() as u32,
                    tuple.get(1).as_f64().unwrap() as u32,
                ]
            })
            .collect();
        let wire = Wire::new(self.wires.len(), positions_vec, tsid);
        self.wires.push(wire);
        self.wires.len() as u32 - 1
    }

    pub fn add_and_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let and_gate = AndGate {
            gate: TwoInputsGate::new(self.composants.len(), position, tsid),
        };
        self.composants.push(ComposantsEnum::AndGate(and_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_or_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let or_gate = OrGate {
            gate: TwoInputsGate::new(self.composants.len(), position, tsid),
        };
        self.composants.push(ComposantsEnum::OrGate(or_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_xor_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let xor_gate = XorGate {
            gate: TwoInputsGate::new(self.composants.len(), position, tsid),
        };
        self.composants.push(ComposantsEnum::XorGate(xor_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_not_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let not_gate = NotGate {
            gate: OneInputGate::new(self.composants.len(), position, tsid),
        };
        self.composants.push(ComposantsEnum::NotGate(not_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_buffer_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let buffer_gate = BufferGate {
            gate: OneInputGate::new(self.composants.len(), position, tsid),
        };
        self.composants
            .push(ComposantsEnum::BufferGate(buffer_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_latch_gate(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let latch_gate = LatchGate {
            gate: TwoInputsGate::new(self.composants.len(), position, tsid),
        };
        self.composants.push(ComposantsEnum::LatchGate(latch_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_timer(&mut self, position: Vec<u32>, ticks: u32, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let timer_gate = TimerGate::new(
            OneInputGate::new(self.composants.len(), position, tsid),
            ticks,
        );
        self.composants.push(ComposantsEnum::TimerGate(timer_gate));
        self.composants.len() as u32 - 1
    }

    pub fn add_switch(&mut self, position: Vec<u32>, tsid: usize) -> u32 {
        let position = [position[0], position[1]];
        let switch = Switch::new(self.composants.len(), position, tsid);
        self.composants.push(ComposantsEnum::Switch(switch));
        self.composants.len() as u32 - 1
    }
}
