uniform vec3 baseColor;
uniform sampler2D texture;
uniform mat4 camera_matrix;
uniform mat4 proj_matrix;

varying vec4 vWorldPos;

void main() {

  vec4 texc = proj_matrix * camera_matrix * vWorldPos;
  vec2 uv = texc.xy / texc.w / 2.0 + 0.5;

  vec3 color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture2D(texture, uv).rgb : vec3(1.0);
  gl_FragColor = vec4(baseColor * color, 1.0);

}