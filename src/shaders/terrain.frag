uniform sampler2D ocean_texture;
uniform sampler2D sandy_texture;
uniform sampler2D grass_texture;
uniform sampler2D rock_texture;
uniform sampler2D light_texture;

uniform sampler2D rock_details_texture;
uniform sampler2D grass_details_texture;
uniform sampler2D ocean_details_texture;
uniform sampler2D sand_details_texture;

uniform mat4 camera_matrix;
uniform mat4 proj_matrix;

uniform sampler2D depthColorTexture;
uniform int hasTexture;

varying vec4 vWorldPos;
varying vec2 vUV;
varying float vAmount;
varying float distance;
varying vec4 shadowPos;

const float texelSize = 1.0 / 512.0;
const float detailRepeat = 40.0;
const float textureRepeat = 10.0;
const float maxDist = 250.0;


void main() {
    float amountInLight = 0.0;

    if (hasTexture == 0) {
        amountInLight = 1.0;
    } else {
        vec3 fragmentDepth = shadowPos.xyz / shadowPos.w / 2.0 + 0.5;
        float depth = (fragmentDepth.z - 0.999985) * 66000.0;

        for (int x = -1; x <= 1; x++) {
            for (int y = -1; y <= 1; y++) {
                float texelDepth = texture2D(depthColorTexture, fragmentDepth.xy+ vec2(x, y) * texelSize ).g;
                if (depth  < texelDepth) {
                    amountInLight += 1.0;
                }
            }
        }
        amountInLight /= 9.0;
    }
    vec4 water = (smoothstep(0.01, 0.25, vAmount) - smoothstep(0.18, 0.26, vAmount)) * texture2D( ocean_texture, vUV * textureRepeat);
    vec4 sandy = (smoothstep(0.21, 0.27, vAmount) - smoothstep(0.28, 0.31, vAmount)) * texture2D( sandy_texture, vUV * textureRepeat );
    vec4 grass = (smoothstep(0.28, 0.38, vAmount) - smoothstep(0.40, 0.50, vAmount)) * texture2D( grass_texture, vUV * textureRepeat );
    vec4 rock = (smoothstep(0.38, 0.65, vAmount))  * texture2D( rock_texture, vUV * 10.0 );

    if (distance < maxDist) {
        vec4 rock_details = 1.3 * texture2D(rock_details_texture, vUV * detailRepeat);
        vec4 ocean_details =  2.0 * texture2D(ocean_details_texture, vUV * detailRepeat);
        vec4 grass_details = 2.0  * texture2D(grass_details_texture, vUV * detailRepeat);
        vec4 sand_details =  1.3 * texture2D(sand_details_texture, vUV * detailRepeat);

        water *= ocean_details;
        sandy *= sand_details;
        grass *= grass_details;
        rock *= rock_details;
    }

    vec4 lightCoords = proj_matrix * camera_matrix *  vWorldPos;
    vec2 uv = lightCoords.xy / lightCoords.w / 2.0 + 0.5;

    vec3 light_color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture2D(light_texture, uv).rgb : vec3(0.0);

    vec4 color =  vec4(0.0,0.0, 0.0, 1.0) + water + sandy + grass + rock + vec4(light_color, 0.0);
    gl_FragColor = vec4(color.xyz * amountInLight, 1.0);
}