use crate::components::OneInputGate;
use crate::utils::console_log;
use crate::Simulation;

pub struct TimerGate {
    pub gate: OneInputGate,
    pub ticks: u32,
    pub input_state: bool,
    pub stack: Vec<(u32, bool)>,
}

impl TimerGate {
    pub fn new(gate: OneInputGate, ticks: u32) -> TimerGate {
        TimerGate {
            gate,
            ticks,
            stack: Vec::new(),
            input_state: false,
        }
    }

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

    pub fn update_input(&mut self, new_input_state: bool) {
        if self.input_state == new_input_state {
            return;
        }
        self.input_state = new_input_state;
        self.stack.push((self.ticks.clone(), new_input_state));
    }

    pub fn check_stack_and_update(&mut self) -> (bool, bool) {
        let zero_elements: Vec<(u32, bool)> = self
            .stack
            .iter()
            .filter(|(ticks, _)| *ticks == 0)
            .cloned()
            .collect();
        for element in &zero_elements {
            self.gate.circuit_element.state = element.1;
        }
        self.stack.retain(|(ticks, _)| *ticks != 0);

        let changed = !zero_elements.is_empty();
        (self.gate.circuit_element.state, changed)
    }

    pub fn decrement_ticks(&mut self) {
        for (ticks, _) in self.stack.iter_mut() {
            if *ticks > 0 {
                *ticks -= 1;
            }
        }
    }
}
