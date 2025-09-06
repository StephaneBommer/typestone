use crate::circuit_element::CircuitElement;
use crate::types::Position;

pub struct TwoInputsGate {
    pub circuit_element: CircuitElement,
    pub output_position: Position,
    pub input_positions: [Position; 2],
    pub position: Position,
}

impl TwoInputsGate {
    pub fn new(id: usize, position: Position) -> Self {
        TwoInputsGate {
            circuit_element: CircuitElement::new(id),
            position,
            output_position: position,
            input_positions: [
                [position[0] - 5, position[1] - 1],
                [position[0] - 5, position[1] + 1],
            ],
        }
    }
}

pub struct OneInputGate {
    pub circuit_element: CircuitElement,
    pub output_position: Position,
    pub input_position: Position,
    pub position: Position,
}

impl OneInputGate {
    pub fn new(id: usize, position: Position) -> Self {
        OneInputGate {
            circuit_element: CircuitElement::new(id),
            position,
            output_position: position,
            input_position: [position[0] - 5, position[1]],
        }
    }
}
