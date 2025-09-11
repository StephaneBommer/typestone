varying vec3 worldPos;

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    worldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
