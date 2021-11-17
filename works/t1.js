import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    InfoBox,
    createGroundPlaneWired,
    onWindowResize,
    initDefaultBasicLight,
    initCamera,
} from "../libs/util/util.js";
import { createCarBody, } from "./carBody.js"
import { keyboardUpdate, movePlane, initMov } from "./carMovimentation.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, 40, 120)); // Init camera in this position
initDefaultBasicLight(scene, true);
camera.name = 'camera';
var modoCamera = { simulacao: true };

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
var plane = createGroundPlaneWired(100, 100, 100, 100);
// add the plane to the scene
scene.add(plane);

var car = createCarBody();
car.name = 'car';

var objetoVirtual = new THREE.Object3D();
objetoVirtual.add(camera);
objetoVirtual.add(car);
scene.add(objetoVirtual);

// Use this to show information onscreen
var controls = new InfoBox();
controls.add("Trabalho 1 - André Reis e Guilherme Machado");
controls.addParagraph();
controls.add("Use o teclado para interagir:");
controls.add("* Espaço altera o modo de câmera");
controls.add("* No modo Simulação utiliza as setas para movimentar e");
controls.add("* 'q' e 'a' para acelerar/desacelerar o avião");
controls.add("* No modo Inspeção, utilize o mouse para movimentar a câmera");
controls.show();

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);
initMov(objetoVirtual, modoCamera, scene, plane, axesHelper);

render();

function render() {
    stats.update(); // Update FPS
    if (!modoCamera.simulacao)
        trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    keyboardUpdate();
    movePlane();
    renderer.render(scene, camera); // Render scene
}