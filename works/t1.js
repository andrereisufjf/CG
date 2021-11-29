import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    onWindowResize,
    initDefaultBasicLight,
    initCamera,
} from "../libs/util/util.js";
import { createCarBody, definePosition, keyboardUpdate, initMov } from "./carBody.js"
import { addPlanElements, getInicialPosition, lado } from "./plano.js"

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils

var camera = initCamera(new THREE.Vector3(0, 0, lado / 3)); // Init camera in this position
//camera.rotation = "";
//camera.lookAt(100, -lado, lado);
initDefaultBasicLight(scene, true);
camera.name = 'camera';
var modoCamera = { simulacao: true };

// console.log(camera.position)
// console.log(camera.rotation)
// console.log(camera.up)


// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis) The X axis is red. The Y axis is green. The Z axis is blue
var axesHelper = new THREE.AxesHelper(12);
axesHelper.visible = true;
scene.add(axesHelper);

var car = createCarBody();
car.name = 'car';

var objetoVirtual = new THREE.Object3D();
objetoVirtual.add(camera);
objetoVirtual.add(car);
scene.add(objetoVirtual);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

//adiciona elementos de plano e cenário à cena
addPlanElements(scene);

//possibilita modo de inspeção
initMov(modoCamera, getInicialPosition(), camera, );

render();

function render() {
    stats.update(); // Update FPS
    //OFICIAL
    // if (!modoCamera.simulacao) {
    //     trackballControls.update(); // Enable mouse movements
    // } {
    //     definePosition();
    //     keyboardUpdate();
    // }

    //PARA TESTES
    trackballControls.update();
    definePosition();
    keyboardUpdate();

    requestAnimationFrame(render);
    renderer.render(scene, camera); // Render scene
}