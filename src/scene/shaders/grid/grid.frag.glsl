uniform vec3 uColor;
uniform float uSize1;
uniform float uSize2;
uniform float uThickness1;
uniform float uThickness2;
varying vec3 worldPos;

float grid(float size, float thickness) {
    vec2 r = worldPos.xy / size;
    vec2 g = abs(fract(r - 0.5) - 0.5) / (fwidth(r) * thickness);
    float line = min(g.x, g.y);
    return 1.0 - min(line, 1.0);
}

void main() {
    float gSmall = grid(uSize1, uThickness1);
    float gLarge = grid(uSize2, uThickness2);

    float gridAlpha = max(gSmall, gLarge);

    if (gridAlpha < 0.01) discard;
    gl_FragColor = vec4(uColor, gridAlpha);
}
