///////////////////////////////////////////////////////////////////////////
// Builtin uniform
//
// uniform mat4 modelMatrix;
// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
//
///////////////////////////////////////////////////////////////////////////

uniform sampler2D height_map;
uniform float scale;

uniform mat4 lightMViewMatrix;
uniform mat4 lightProjectionMatrix;

varying vec4 vWorldPos;
varying float vAmount;
varying float distance;
varying vec2 vUV;
varying vec4 shadowPos;

void main()
{
	vUV = uv;
	vec4 bumpData = texture2D(height_map, uv);
	vAmount = bumpData.r;
    vec3 newPosition = position + normal * scale * vAmount;

    vWorldPos = modelMatrix * vec4(newPosition, 1.0);

    shadowPos = lightProjectionMatrix * lightMViewMatrix * vWorldPos;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
	distance = gl_Position.w;
}
