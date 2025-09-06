use crate::utils::console_log;
use crate::ComposantsEnum;
use crate::Simulation;

pub struct CircuitElement {
    pub state: bool,
    pub inputs: Vec<CircuitElementEnum>,
    pub outputs: Vec<CircuitElementEnum>,
    pub id: usize,
}

impl CircuitElement {
    pub fn new(id: usize) -> Self {
        CircuitElement {
            state: false,
            inputs: Vec::new(),
            outputs: Vec::new(),
            id,
        }
    }

    pub fn set_state(&mut self, new_state: bool) {
        if self.state == new_state {
            return;
        }
        // console_log(&format!("Set element {} to {}", self.id, new_state));
        self.state = new_state;
    }
}

pub enum CircuitElementEnum {
    WireGroup(usize),
    Component(usize),
}

impl CircuitElementEnum {
    pub fn get_state(&self, sim: &Simulation) -> bool {
        match self {
            CircuitElementEnum::WireGroup(id) => sim.wire_groups[*id].circuit_element.state,
            CircuitElementEnum::Component(id) => match &sim.composants[*id] {
                ComposantsEnum::OrGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::AndGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::Switch(switch) => switch.circuit_element.state,
                ComposantsEnum::XorGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::LatchGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::NotGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::BufferGate(gate) => gate.gate.circuit_element.state,
                ComposantsEnum::TimerGate(gate) => gate.gate.circuit_element.state,
            },
        }
    }
}
