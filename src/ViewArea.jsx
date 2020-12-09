import React, {Component} from "react";

import * as THREE from 'three-full';
import vxShader from './shaders/terrain.vert';
import fragShader from './shaders/terrain.frag';

import * as dat from 'dat.gui'
import parse from 'color-parse';

import height_map from './resources/heightmap.jpg'
import sand from './resources/sand.jpeg'
import ocean from './resources/ocean.jpeg'
import grass from './resources/grass.jpg'
import rock from './resources/rock.jpeg'
import lighthouse from './resources/lighthouse.obj'

import rock_details from './resources/rock_details.jpeg';
import ocean_details from './resources/ocean_details.jpeg';
import grass_details from './resources/grass_details.jpg'
import sand_details from './resources/sand_details.jpg'

import light_image from './resources/light.jpeg'

let image_height = 1312;
let image_width = 2000;
let scale = 300.0;

function optionColorToVec3(color) {
    let parsedColor = parse(color);

    let values = parsedColor.values;

    return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
}

function getImageData(image) {

    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
}

function getPixel(imagedata, x, y) {
    let i = Math.round((y + image_height / 2) / 4);
    let j = Math.round((x + image_width / 2) / 4);
    let data = imagedata.data;
    let position = (j + 500 * i) * 4;
    return data[position];
}

export class ViewArea extends Component {
    constructor() {
        super();

        this.canvasRef = React.createRef();
        this.divRef = React.createRef();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(90, 1, 0.1, 10000);

        this.camera.position.z = 1000;
        this.camera.position.x = 400;
        this.camera.position.y = 400;
        this.light_rotation = 0;

        this.options = {
            color: "#87DDFC",
            rotationSpeed: 60,
            lighthouse_x: 716,
            lighthouse_z: -309,
        };

        this.loadTerrain();
        this.loadLightHouse();
    }

    loadTerrain() {
        let directionalLight = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
        this.directionalLight = directionalLight;
        directionalLight.position.z = 1400;
        directionalLight.position.x = 0;
        directionalLight.position.y = 3000;
        directionalLight.lookAt(200, 100, 200);

        let arena = this;
        this.projCamera = new THREE.PerspectiveCamera(25, 1.2, 0.01, 50);
        this.projCamera.position.set(371, 80, 371);
        this.projCamera.lookAt(1, 1, 1);
        this.projCamera.updateMatrixWorld();
        this.projCamera.updateProjectionMatrix();

        let textureLoader = new THREE.TextureLoader();
        let heightmap = textureLoader.load(height_map, function (texture) {
            arena.imagedata = getImageData(texture.image);
            arena.options.lighthouse_y = get_lighthouse_y(arena);
        });

        heightmap.wrapS = THREE.RepeatWrapping;
        heightmap.wrapT = THREE.RepeatWrapping;

        let sand_texture = textureLoader.load(sand);
        sand_texture.wrapS = THREE.RepeatWrapping;
        sand_texture.wrapT = THREE.RepeatWrapping;

        let ocean_texture = textureLoader.load(ocean);
        ocean_texture.wrapS = THREE.RepeatWrapping;
        ocean_texture.wrapT = THREE.RepeatWrapping;

        let grass_texture = textureLoader.load(grass);
        grass_texture.wrapS = THREE.RepeatWrapping;
        grass_texture.wrapT = THREE.RepeatWrapping;

        let rock_texture = textureLoader.load(rock);
        rock_texture.wrapS = THREE.RepeatWrapping;
        rock_texture.wrapT = THREE.RepeatWrapping;

        let rock_details_texture = textureLoader.load(rock_details);
        rock_details_texture.wrapS = THREE.RepeatWrapping;
        rock_details_texture.wrapT = THREE.RepeatWrapping;

        let ocean_details_texture = textureLoader.load(ocean_details);
        ocean_details_texture.wrapS = THREE.RepeatWrapping;
        ocean_details_texture.wrapT = THREE.RepeatWrapping;

        let grass_details_texture = textureLoader.load(grass_details);
        grass_details_texture.wrapS = THREE.RepeatWrapping;
        grass_details_texture.wrapT = THREE.RepeatWrapping;

        let sand_details_texture = textureLoader.load(sand_details);
        sand_details_texture.wrapS = THREE.RepeatWrapping;
        sand_details_texture.wrapT = THREE.RepeatWrapping;

        let light_texture = textureLoader.load(light_image);

        this.terrainMaterial = new THREE.ShaderMaterial({
            uniforms:
                {
                    height_map: {value: heightmap},
                    sandy_texture: {value: sand_texture},
                    ocean_texture: {value: ocean_texture},
                    rock_texture: {value: rock_texture},
                    grass_texture: {value: grass_texture},
                    light_texture: {value: light_texture},
                    ocean_details_texture: {value: ocean_details_texture},
                    rock_details_texture: {value: rock_details_texture},
                    grass_details_texture: {value: grass_details_texture},
                    sand_details_texture: {value: sand_details_texture},
                    lightMViewMatrix: {type: 'm4', value: directionalLight.matrixWorldInverse},
                    lightProjectionMatrix: {type: 'm4', value: directionalLight.projectionMatrix},
                    scale: {value: scale},
                    camera_matrix: {type: 'm4', value: this.projCamera.matrixWorldInverse},
                    proj_matrix: {type: 'm4', value: this.projCamera.projectionMatrix},
                    depthColorTexture: {value: null},
                    hasTexture: {value: 0}
                },

            vertexShader: vxShader,
            fragmentShader: fragShader
        });

        let geometryTerrain = new THREE.PlaneGeometry(image_width, image_height, 500, 328);

        let terrain = new THREE.Mesh(geometryTerrain, this.terrainMaterial);

        terrain.position.set(0, -125, 0);
        terrain.rotation.x = -Math.PI / 2;

        this.scene.add(terrain);
    }

    loadLightHouse() {
        let arena = this;
        let scene = this.scene;

        let lightAmb = new THREE.AmbientLight(0xffffff);
        scene.add(lightAmb);

        let mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('./resources/lighthouse.mtl', function (materials) {
            materials.preload();
            let objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            arena.lighthouseObject = objLoader.parse(lighthouse);
            arena.scene.add(arena.lighthouseObject);
        });
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        this.controls = new THREE.MapControls(this.camera, this.canvasRef.current);
        this.controls.update();

        const gl = canvas.getContext('webgl2');
        if (!gl) {
            return;
        }

        this.addDatGUI();

        var renderer = new THREE.WebGLRenderer({canvas: canvas, context: gl});
        renderer.setSize(canvas.width, canvas.height);

        this.prevTime = new Date();
        var renderTargetDepth = new THREE.WebGLRenderTarget(2000, 2000);

        var depthMaterial = new THREE.MeshDepthMaterial({depthPacking: THREE.RGBADepthPacking});
        const renderLoopTick = () => {
            // Handle resize
            if (this.divRef.current.offsetWidth != canvas.width ||
                this.divRef.current.offsetHeight != canvas.height) {
                console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);

                canvas.width = this.divRef.current.offsetWidth;
                canvas.height = this.divRef.current.offsetHeight;

                renderer.setSize(canvas.width, canvas.height);

                const d = new THREE.Vector3();
                const q = new THREE.Quaternion();
                const s = new THREE.Vector3();
                this.camera.matrixWorld.decompose(d, q, s);
                this.camera.position.copy(d);
                this.camera.quaternion.copy(q);
                this.camera.scale.copy(s);

                this.camera = new THREE.PerspectiveCamera(90, canvas.width / canvas.height, this.camera.near, this.camera.far);

                this.camera.position.set(d.x, d.y, d.z);
                this.camera.quaternion.clone(q);
                this.camera.scale.set(s.x, s.y, s.z);
                this.controls = new THREE.MapControls(this.camera, canvas);
            }

            const curTime = new Date();

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(optionColorToVec3(this.options.color).x, optionColorToVec3(this.options.color).y, optionColorToVec3(this.options.color).z, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);

            this.controls.update();
            if (typeof this.lighthouseObject != "undefined" && typeof this.imagedata != "undefined") {
                this.options.lighthouse_y = get_lighthouse_y(this);
                this.lighthouseObject.position.set(this.options.lighthouse_x, this.options.lighthouse_y, this.options.lighthouse_z);

                this.projCamera.position.set(this.options.lighthouse_x, this.options.lighthouse_y + 150, this.options.lighthouse_z);
                this.projCamera.updateMatrixWorld();
                this.projCamera.updateProjectionMatrix();
                this.light_rotation = this.light_rotation + (curTime.getTime() - this.prevTime.getTime()) / 1000 * this.options.rotationSpeed * Math.PI / 180;
                this.projCamera.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.light_rotation);
                this.projCamera.rotateOnAxis(new THREE.Vector3(1, 0, 0), -0.5);
                this.terrainMaterial.uniforms.proj_matrix.value = this.projCamera.projectionMatrix;
                this.terrainMaterial.uniforms.camera_matrix.value = this.projCamera.matrixWorldInverse;

                this.lighthouseObject.scale.set(0.25, 0.25, 0.25);
            }
            this.scene.overrideMaterial = depthMaterial;
            this.terrainMaterial.uniforms.hasTexture.value = 0;

            renderer.setRenderTarget(renderTargetDepth);
            renderer.clear();
            renderer.render(this.scene, this.directionalLight);
            this.terrainMaterial.uniforms.depthColorTexture.value = renderTargetDepth.texture;
            this.terrainMaterial.uniforms.hasTexture.value = 1;
            renderer.setRenderTarget(null);
            this.scene.overrideMaterial = null;
            renderer.render(this.scene, this.camera);

            this.prevTime = curTime;

            requestAnimationFrame(renderLoopTick);
        };

        requestAnimationFrame(renderLoopTick);

    }

    addDatGUI = () => {
        this.gui = new dat.GUI({name: "My GUI"});

        var fields = this.gui.addFolder("Field");
        fields.add(this.options, "rotationSpeed", 0, 360, 1);
        fields.add(this.options, "lighthouse_x", -1000, 1000, 1);
        fields.add(this.options, "lighthouse_z", -650, 650, 1);
        fields.open();
    };

    render() {
        return (
            <div ref={this.divRef} style={{width: "100%", height: "100vh"}}>
                <canvas
                    ref={this.canvasRef}
                    style={{width: "100%", height: "100%"}}
                />
            </div>
        );
    }
}

function get_lighthouse_y(arena) {
    let color = getPixel(arena.imagedata, arena.options.lighthouse_x, arena.options.lighthouse_z);
    return (color / 255) * scale - 150;
}
