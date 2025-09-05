use crate::circuit_element::CircuitElement;
use crate::types::Position;
use crate::Simulation;

pub struct Wire {
    pub circuit_element: CircuitElement,
    pub positions: Vec<Position>,
}

impl Wire {
    pub fn new(id: usize, positions: Vec<Position>, tsid: usize) -> Self {
        Wire {
            circuit_element: CircuitElement::new(id, tsid),
            positions,
        }
    }
}

pub struct WireGroup {
    pub circuit_element: CircuitElement,
    pub positions: Vec<Position>,
    pub wires: Vec<(usize, usize)>,
}

impl WireGroup {
    pub fn new(id: usize) -> Self {
        WireGroup {
            circuit_element: CircuitElement::new(id, 0),
            wires: Vec::new(),
            positions: Vec::new(),
        }
    }

    pub fn add_wire(&mut self, wire: (usize, usize), positions: Vec<Position>) {
        self.positions.extend(positions);
        self.wires.push(wire)
    }

    pub fn compute_next_state(&self, sim: &Simulation) -> (bool, bool) {
        let new_state = self
            .circuit_element
            .inputs
            .iter()
            .any(|input| input.get_state(sim));
        let is_different = new_state != self.circuit_element.state;
        (new_state, is_different)
    }
}
