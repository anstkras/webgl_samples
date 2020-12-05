///////////////////////////////////////////////////////////////////////////
// Builtin uniform
//
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
///////////////////////////////////////////////////////////////////////////

out vec3 pos_world;
uniform sampler2D height_map;
varying vec4 vWorldPos;

varying float vAmount;
varying vec2 vUV;

void main()
{
	vUV = uv;
	vec4 bumpData = texture2D(height_map, uv);
  vWorldPos = modelMatrix * vec4(position, 1.0);

	vAmount = bumpData.r; // assuming map is grayscale it doesn't matter if you use r, g, or b.
    pos_world = (modelMatrix * vec4(position, 1.0)).xyz;

	// move the position along the normal
    vec3 newPosition = position + normal * float(300) * vAmount;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
