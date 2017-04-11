attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexture;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uObjectMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uObjectNormalMatrix;

varying vec3 vLight;
varying vec3 vNormal;
varying vec2 vTexture;

void main(void) {
    vec4 pos = uViewMatrix * uObjectMatrix * vec4(aPosition, 1.0);

    gl_Position = uProjectionMatrix * pos;
    // vLight = (uViewMatrix * vec4(0.0,0.0,0.0,1.0) - pos).xyz;
    vLight = -pos.xyz;
    vNormal = uNormalMatrix * uObjectNormalMatrix * aNormal;
    vTexture = aTexture;
}