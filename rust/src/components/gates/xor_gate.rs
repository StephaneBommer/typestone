use crate::components::TwoInputsGate;
use crate::Simulation;

pub struct XorGate {
    pub gate: TwoInputsGate,
}

impl XorGate {
    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let new_state = self
            .gate
            .circuit_element
            .inputs
            .iter()
            .map(|input| input.get_state(sim))
            .fold(false, |acc, state| acc ^ state);

        let is_different = new_state != self.gate.circuit_element.state;
        (new_state, is_different)
    }
}
