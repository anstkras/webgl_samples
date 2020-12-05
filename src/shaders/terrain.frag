uniform sampler2D ocean_texture;
uniform sampler2D sandy_texture;
uniform sampler2D grass_texture;
uniform sampler2D rock_texture;
uniform sampler2D light_texture;
uniform mat4 camera_matrix;
uniform mat4 proj_matrix;

varying vec4 vWorldPos;

//uniform sampler2D snowyTexture;
in vec3 pos_world;

varying vec2 vUV;

varying float vAmount;

void main()
{
	vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.18, 0.26, vAmount)) * texture2D( ocean_texture, vUV * 10.0 );
	vec4 sandy = (smoothstep(0.21, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D( sandy_texture, vUV * 10.0 );
	vec4 grass = (smoothstep(0.28, 0.38, vAmount) - smoothstep(0.40, 0.50, vAmount)) * texture2D( grass_texture, vUV * 20.0 );
	vec4 rock = (smoothstep(0.38, 0.65, vAmount))  * texture2D( rock_texture, vUV * 10.0 );
	//vec4 snowy = (smoothstep(0.50, 0.65, vAmount))                                   * texture2D( snowyTexture, vUV * 10.0 );

//	  vec4 color = vec4(0.5, 0.5, 0.0, 0.0);

//    if (vUV.x < 0.5 && vUV.x > 0.0 && vUV.y < 0.6 && vUV.y > 0.05) {
         vec4 texc = proj_matrix * camera_matrix *  vWorldPos;
          vec2 uv = texc.xy / texc.w / 2.0 + 0.5;

          vec3 color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture2D(light_texture, uv).rgb : vec3(0.0);

	   gl_FragColor = vec4(0.0,0.0, 0.0, 1.0) + water + sandy + grass + rock + vec4(color, 0.0); //, 1.0);
//    } else {
//	   gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rock; //, 1.0);
//	}
}
