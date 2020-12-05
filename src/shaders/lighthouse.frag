in vec3 pos_world;

uniform vec3 u_color;

void main()
{
  vec3 vec_x = dFdx(pos_world);
  vec3 vec_y = dFdy(pos_world);

  vec3 normal = normalize(cross(vec_x, vec_y));

  float dot_val = 0.1 + 0.9 * clamp(dot(normal, vec3(0, 1, 0)), 0.0, 1.0);

  gl_FragColor = vec4(u_color * vec3(dot_val), 1);
}