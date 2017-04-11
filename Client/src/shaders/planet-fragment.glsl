precision highp float;

uniform mat3 uNormalMatrix;
uniform vec3 uColor;

varying vec3 vLight;
varying vec3 vNormal;
varying vec2 vTexture;

uniform sampler2D uTexture;

void main(void) {

    vec4 color = texture2D(uTexture, vTexture);

    vec3 l = normalize(vLight);
    vec3 n = normalize(vNormal);
    float diffuseLambert = dot(l,n);

    gl_FragColor = vec4((0.3 + diffuseLambert * 0.7) * color.xyz, color.a);
}