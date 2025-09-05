use crate::components::TwoInputsGate;
use crate::Simulation;

pub struct OrGate {
    pub gate: TwoInputsGate,
}

impl OrGate {
    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let new_state = self
            .gate
            .circuit_element
            .inputs
            .iter()
            .any(|input| input.get_state(sim));
        let is_different = new_state != self.gate.circuit_element.state;
        (new_state, is_different)
    }
}
