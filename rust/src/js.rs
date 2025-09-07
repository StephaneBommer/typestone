use crate::types::ChangedElement;
use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct TickResults {
    wires: Vec<ChangedElement>,
    components: Vec<ChangedElement>,
}

#[wasm_bindgen]
impl TickResults {
    pub fn new(wires: Vec<ChangedElement>, components: Vec<ChangedElement>) -> Self {
        TickResults { wires, components }
    }

    fn elements_to_js_array(elements: &[ChangedElement]) -> Array {
        let arr = Array::new();
        for e in elements {
            let obj = Object::new();
            js_sys::Reflect::set(
                &obj,
                &JsValue::from_str("index"),
                &JsValue::from_f64(e.id as f64),
            )
            .unwrap();
            js_sys::Reflect::set(
                &obj,
                &JsValue::from_str("state"),
                &JsValue::from_bool(e.state),
            )
            .unwrap();
            arr.push(&obj);
        }
        arr
    }

    #[wasm_bindgen(getter)]
    pub fn wires(&self) -> Array {
        Self::elements_to_js_array(&self.wires)
    }

    #[wasm_bindgen(getter)]
    pub fn components(&self) -> Array {
        Self::elements_to_js_array(&self.components)
    }
}

#[wasm_bindgen]
impl ChangedElement {
    #[wasm_bindgen(constructor)]
    pub fn new(id: usize, state: bool) -> Self {
        ChangedElement { id, state }
    }
}
