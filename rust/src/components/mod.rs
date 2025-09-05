mod gates;
mod switch;

pub use gates::{
    AndGate, BufferGate, LatchGate, NotGate, OneInputGate, OrGate, TimerGate, TwoInputsGate,
    XorGate,
};
pub use switch::Switch;
