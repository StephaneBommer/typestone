use crate::components::TwoInputsGate;
use crate::Simulation;

pub struct AndGate {
    pub gate: TwoInputsGate,
}

impl AndGate {
    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let true_count = self
            .gate
            .circuit_element
            .inputs
            .iter()
            .filter(|input| input.get_state(sim))
            .count();
        let new_state = true_count >= 2;
        let is_different = new_state != self.gate.circuit_element.state;
        (new_state, is_different)
    }
}
