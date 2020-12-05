///////////////////////////////////////////////////////////////////////////
// Builtin uniform
//
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
///////////////////////////////////////////////////////////////////////////

out vec3 pos_world;

void main()
{
  pos_world = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}