import React, { Component } from "react";

import * as THREE from 'three-full';
import vxShader from './shaders/terrain.vert';
import fragShader from './shaders/terrain.frag';

import * as dat from 'dat.gui'
import parse from 'color-parse';

import height_map from './resources/h.jpg'
import sand from './resources/sand.jpeg'
import ocean from './resources/ocean.jpeg'
import grass from './resources/grass.jpg'
import rock from './resources/rock.jpeg'
import lighthouse_mtl from './resources/lighthouse.mtl'
import lighthouse from './resources/lighthouse.obj'
import vxLightHouseShader from './shaders/lighthouse.vert'
import fragLightHouseShader from './shaders/lighthouse.frag'

import vxLightShader from './shaders/light.vert'
import fragLightShader from './shaders/light.frag'


import light_image from './resources/light.jpeg'

let image_height = 1312;
let image_width = 2000;

function optionColorToVec3(color){
  let parsedColor = parse(color);

  let values = parsedColor.values;

  return new THREE.Vector3(values[0] / 255, values[1] / 255, values[2] / 255);
}

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function getPixel( imagedata, x, y ) {
    let yy = Math.round((y + image_height/2)/4);
    let xx = Math.round((x + image_width/2)/4);
    var data = imagedata.data;
    var position = ( xx + 500 * yy ) * 4;
    return data[ position ];

}


export class ViewArea extends Component {
  constructor() {
    super();

    this.canvasRef = React.createRef();
    this.divRef = React.createRef();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 90, 1, 0.1, 10000 );

    this.camera.position.z = 400;
    this.camera.position.x = 400;
    this.camera.position.y = 400;
    this.bunnyRotation = 0;

      this.options = {
          color: "#ffae23",
          rotationSpeed: 60,
          lighthouse_x: 371,
          lighthouse_y: 3,
          lighthouse_z: 371
      };

    this.loadTerrain();
    this.loadLightHouse();

  }

    loadTerrain() {
      let arena = this;
      this.projCamera = new THREE.PerspectiveCamera(25, 1.2, 0.01, 50);
      this.projCamera.position.set(371, 80, 371);
      this.projCamera.lookAt(1, 1, 1);
      this.projCamera.updateMatrixWorld();
      this.projCamera.updateProjectionMatrix();

      let helper = new THREE.CameraHelper(this.projCamera);
      this.scene.add(helper);

        let textureLoader = new THREE.TextureLoader();
        let heightmap = textureLoader.load(height_map, function(texture) {
            arena.imagedata = getImageData( texture.image);
            var color = getPixel( arena.imagedata, arena.options.lighthouse_x, arena.options.lighthouse_z);
            arena.options.lighthouse_y = (color / 255) * 300;
        });

        this.heightmap = heightmap;

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


        let light_texture = textureLoader.load(light_image);
        light_texture.wrapS = THREE.RepeatWrapping;
        light_texture.wrapT = THREE.RepeatWrapping;

        this.customMaterial = new THREE.ShaderMaterial({
            uniforms:
                {
                    u_color: {value: new THREE.Vector3()},
                    height_map: {value: heightmap},
                    sandy_texture: {value: sand_texture},
                    ocean_texture: {value: ocean_texture},
                    rock_texture: {value: rock_texture},
                    grass_texture: {value: grass_texture},
                    light_texture: {value: light_texture},
                    scale: {value: 100},
                    camera_matrix: {type: 'm4', value: this.projCamera.matrixWorldInverse},
                    proj_matrix: {type: 'm4', value: this.projCamera.projectionMatrix},
                },

            vertexShader: vxShader,
            fragmentShader: fragShader
        });

        // this.lightMaterial = new THREE.ShaderMaterial({
        //     uniforms:
        //         {
        //             camera_matrix: {type: 'm4', value: projCamera.matrixWorldInverse},
        //             proj_matrix: {type: 'm4', value: projCamera.projectionMatrix},
        //         },
        //
        //     vertexShader: vxLightShader,
        //     fragmentShader: fragLightShader
        // });


        let geometryTerrain = new THREE.PlaneGeometry(2000, 1312, 500, 328);

        let terrain = new THREE.Mesh(geometryTerrain, this.customMaterial);

        terrain.position.set(0, -125, 0);
        terrain.rotation.x = -Math.PI / 2;

        this.scene.add(terrain);
    }

    loadLightHouse() {
        let arena = this;

        let scene = this.scene;
        var light = new THREE.PointLight(0xeeeeee);
        light.position.set(10, 50, 20);
        scene.add(light);

        var lightAmb = new THREE.AmbientLight(0xffffff);
        scene.add(lightAmb);

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('./resources/lighthouse.mtl', function(materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
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
      // this.controls.movementSpeed = 25;
      // this.controls.rollSpeed = Math.PI / 24;
      // this.controls.autoForward = true;
      // this.controls.dragToLook = false;
    this.controls.update();

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      return;
    }

    this.addDatGUI();

    var renderer = new THREE.WebGLRenderer( { canvas: canvas, context: gl } );
    renderer.setSize(canvas.width, canvas.height );

    this.prevTime = new Date();

    const renderLoopTick = () => {
      // Handle resize
      if (this.divRef.current.offsetWidth != canvas.width ||
          this.divRef.current.offsetHeight != canvas.height) {
            console.log(`Resizing canvas: ${this.divRef.current.offsetWidth}x${this.divRef.current.offsetHeight}`);

            canvas.width = this.divRef.current.offsetWidth;
            canvas.height = this.divRef.current.offsetHeight;

            renderer.setSize(canvas.width, canvas.height );

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
            console.log(this.controls);
            // this.controls = new THREE.OrbitControls(this.camera, canvas);
      }

      const curTime = new Date();

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.2, 0.2, 0.2, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.controls.update();
      if (typeof this.lighthouseObject != "undefined") {
          var color = getPixel( this.imagedata, this.options.lighthouse_x, this.options.lighthouse_z);
          this.options.lighthouse_y = (color / 255) * 300 - 150;

          this.lighthouseObject.position.set(this.options.lighthouse_x, this.options.lighthouse_y, this.options.lighthouse_z);

          this.projCamera.position.set(this.options.lighthouse_x, this.options.lighthouse_y + 150, this.options.lighthouse_z);
          // this.projCamera.lookAt(1, 1, 1);
          this.projCamera.updateMatrixWorld();
          this.projCamera.updateProjectionMatrix();
          this.bunnyRotation = this.bunnyRotation + (curTime.getTime() - this.prevTime.getTime()) / 1000 * this.options.rotationSpeed * Math.PI / 180;
          this.projCamera.quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), this.bunnyRotation);
          this.projCamera.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), -0.5);
          this.customMaterial.uniforms.proj_matrix.value = this.projCamera.projectionMatrix;
          this.customMaterial.uniforms.camera_matrix.value = this.projCamera.matrixWorldInverse;
          // this.projCamera.updateMatrixWorld();


          this.lighthouseObject.scale.set(0.25, 0.25, 0.25);


      }



      this.customMaterial.uniforms.u_color.value = optionColorToVec3(this.options.color);

      renderer.render( this.scene, this.camera );

      this.prevTime = curTime;

      requestAnimationFrame(renderLoopTick);
    };

    requestAnimationFrame(renderLoopTick);

  }

  addDatGUI = () => {
    this.gui = new dat.GUI({ name: "My GUI" });

    var fields = this.gui.addFolder("Field");
    fields.addColor(this.options, "color");
    fields.add(this.options, "rotationSpeed", 0, 360, 1);
    fields.add(this.options, "lighthouse_x", -1000, 1000, 1);
    fields.add(this.options, "lighthouse_y", -200, 500, 1);
    fields.add(this.options, "lighthouse_z", -650 ,650, 1);
    fields.open();
  };

  render() {
    return (
      <div ref={this.divRef} style={{width: "100%",height: "100vh"}}>
        <canvas
          ref={this.canvasRef}
          style={{width: "100%",height: "100%"}}
        />
      </div>
  );
  }
}
