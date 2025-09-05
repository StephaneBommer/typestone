use crate::Simulation;

use super::TwoInputsGate;

pub struct LatchGate {
    pub gate: TwoInputsGate,
}

impl LatchGate {
    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let mut new_state = self.gate.circuit_element.state;
        if let Some(input) = self.gate.circuit_element.inputs.get(0) {
            if !input.get_state(sim) {
                return (self.gate.circuit_element.state, false);
            }
        }
        if let Some(input) = self.gate.circuit_element.inputs.get(1) {
            new_state = input.get_state(sim);
        }

        (new_state, new_state != self.gate.circuit_element.state)
    }
}
