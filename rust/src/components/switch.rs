use crate::circuit_element::CircuitElement;
use crate::types::Position;

pub struct Switch {
    pub circuit_element: CircuitElement,
    pub output_position: Position,
    pub position: Position,
}

impl Switch {
    pub fn new(id: usize, position: Position) -> Self {
        Switch {
            circuit_element: CircuitElement::new(id),
            position,
            output_position: position,
        }
    }
}
