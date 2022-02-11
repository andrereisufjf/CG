import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    onWindowResize,
    initDefaultBasicLight,
    initCamera,
    degreesToRadians,
} from "../libs/util/util.js";
import { createCarBody, definePosition, keyboardUpdate, initMov, defineCamPosition } from "./carBody.js"
import { addPlanElements, getInicialPosition, lado, controlledRender, addHelper } from "./plano.js"


const deltaCarAux = 4;

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
renderer.shadowMap.enabled = true;

var camera = initCamera(new THREE.Vector3(0, 0, lado / 3)); // Init camera in this position
initDefaultBasicLight(scene, true);
camera.name = 'camera';
var modoCamera = { simulacao: true };

// TESTE - SecondCamera
var cameraHeSheIt = initCamera(new THREE.Vector3(0, 0, lado / 3)); // Init camera in this position
cameraHeSheIt.name = 'cameraTerceiraPessoa';


// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis) The X axis is red. The Y axis is green. The Z axis is blue
var axesHelper = new THREE.AxesHelper(12);
axesHelper.visible = false;
scene.add(axesHelper);

var car = createCarBody();
car.name = 'car';

// teste camera terceira pessoa
//cameraHeSheIt.rotateZ(degreesToRadians(20));
cameraHeSheIt.translateY(-20);
cameraHeSheIt.translateZ(-10);
cameraHeSheIt.rotateX(degreesToRadians(80));
//cameraHeSheIt.position.set(25, 0, 5);
car.add(cameraHeSheIt);
//degreesToRadians(80)
//deltaMovCam.set(25, 0, 5, 80, 90);
// camera.matrix.multiply(mat4Cam.makeRotationZ(degreesToRadians(deltaMovCam.rotZ))); // R1
// camera.matrix.multiply(mat4Cam.makeRotationX(degreesToRadians(deltaMovCam.rotX))); // R1
// fim teste

var camSup = new THREE.Object3D();
scene.add(camSup);
var camSupAxesHelper = new THREE.AxesHelper(12);
camSupAxesHelper.visible = true;
camSup.add(camSupAxesHelper);
camSup.add(camera);
scene.add(car);
var carAux = new THREE.Object3D();
car.add(carAux);
carAux.translateY(deltaCarAux);
var carAuxAxesHelper = new THREE.AxesHelper(3);
carAuxAxesHelper.visible = true;
//carAux.add(carAuxAxesHelper);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

//adiciona elementos de plano e cenário à cena
addPlanElements(scene);

//possibilita modo de inspeção
initMov(modoCamera, getInicialPosition(), camera, scene, camSup, carAux);

render();

function render() {
    stats.update(); // Update FPS
    trackballControls.update();
    definePosition();
    defineCamPosition();
    keyboardUpdate();
    requestAnimationFrame(render);
    controlledRender(renderer, camera, scene, modoCamera.simulacao, cameraHeSheIt);
}