use wasm_bindgen::prelude::*;

pub type Position = [u32; 2];
pub struct OldWireGroup {
    pub index: usize,
    pub state: bool,
}

pub struct OldComponents {
    pub index: usize,
    pub state: bool,
}

#[wasm_bindgen]
pub struct ChangedElement {
    pub index: usize,
    pub state: bool,
}
