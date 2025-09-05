use crate::components::OneInputGate;
use crate::Simulation;

pub struct NotGate {
    pub gate: OneInputGate,
}

impl NotGate {
    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let new_state = !self
            .gate
            .circuit_element
            .inputs
            .iter()
            .any(|input| input.get_state(sim));
        let is_different = new_state != self.gate.circuit_element.state;
        (new_state, is_different)
    }
}
