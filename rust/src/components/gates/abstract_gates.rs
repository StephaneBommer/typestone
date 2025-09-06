use crate::circuit_element::CircuitElement;
use crate::types::{Orientation, Position};

pub struct TwoInputsGate {
    pub circuit_element: CircuitElement,
    pub output_position: Position,
    pub input_positions: [Position; 2],
    pub position: Position,
}

impl TwoInputsGate {
    pub fn new(id: usize, position: Position, orientation: Orientation) -> Self {
        let input_positions = match orientation {
            Orientation::Up => [
                [position[0] - 1, position[1] - 5],
                [position[0] + 1, position[1] - 5],
            ],
            Orientation::Right => [
                [position[0] - 5, position[1] + 1],
                [position[0] - 5, position[1] - 1],
            ],
            Orientation::Down => [
                [position[0] - 1, position[1] + 5],
                [position[0] + 1, position[1] + 5],
            ],
            Orientation::Left => [
                [position[0] + 5, position[1] - 1],
                [position[0] + 5, position[1] + 1],
            ],
        };

        TwoInputsGate {
            circuit_element: CircuitElement::new(id),
            position,
            output_position: position,
            input_positions,
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
    pub fn new(id: usize, position: Position, orientation: Orientation) -> Self {
        let input_position = match orientation {
            Orientation::Up => [position[0], position[1] - 5],
            Orientation::Right => [position[0] - 5, position[1]],
            Orientation::Down => [position[0], position[1] + 5],
            Orientation::Left => [position[0] + 5, position[1]],
        };

        OneInputGate {
            circuit_element: CircuitElement::new(id),
            position,
            output_position: position,
            input_position,
        }
    }
}
