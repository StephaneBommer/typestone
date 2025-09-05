use crate::circuit_element::CircuitElement;
use crate::types::Position;

pub struct Switch {
    pub circuit_element: CircuitElement,
    pub output_position: Position,
    pub position: Position,
}

impl Switch {
    pub fn new(id: usize, position: Position, tsid: usize) -> Self {
        Switch {
            circuit_element: CircuitElement::new(id, tsid),
            position,
            output_position: position,
        }
    }
}
