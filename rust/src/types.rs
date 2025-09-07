use wasm_bindgen::prelude::*;

pub type Position = [i32; 2];

#[wasm_bindgen]
pub enum Orientation {
    Up,
    Right,
    Down,
    Left,
}

pub struct OldWireGroup {
    pub index: usize,
    pub state: bool,
}

pub struct OldComponents {
    pub id: usize,
    pub state: bool,
}

#[wasm_bindgen]
pub struct ChangedElement {
    pub id: usize,
    pub state: bool,
}
