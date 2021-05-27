import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { GUI } from '../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {
    initRenderer,
    InfoBox,
    onWindowResize,
    createGroundPlaneWired,
    degreesToRadians
} from "../libs/util/util.js";

var scene = new THREE.Scene(); // Create main scene
var stats = new Stats(); // To show FPS information
var renderer = initRenderer(); // View function in util/utils
var clock = new THREE.Clock();

// Main camera e definicioes pedidas no exercicio
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(0.0, 2.0, 0.0);
camera.up.set(0, 1, 0);

var cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0.0, 2.0, 0.0);
cameraHolder.lookAt(0, 0, 0);
cameraHolder.up.set(0, 1, 0);
scene.add(cameraHolder);
cameraHolder.add(camera);

// Show text information onscreen
showInformation();

// To use the keyboard
var keyboard = new KeyboardState();

scene.add(new THREE.HemisphereLight()); // Conforme pedido no exercicio
//var light = initDefaultLighting(scene, new THREE.Vector3(5.0, 5.0, 5.0)); // Use default light    

// Enable mouse rotation, pan, zoom etc.
//var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the Wired ground plane
var groundPlaneWired = createGroundPlaneWired(500, 500, 1000, 500, "rgb(96,10,127)");
scene.add(groundPlaneWired);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

render();

function keyboardUpdate() {

    keyboard.update();
    var angle = degreesToRadians(1);
    var rotX = new THREE.Vector3(1, 0, 0); // Set X axis
    var rotY = new THREE.Vector3(0, 1, 0); // Set Y axis
    var rotZ = new THREE.Vector3(0, 0, 1); // Set Z axis

    if (keyboard.pressed("left")) cameraHolder.rotateOnAxis(rotY, angle);
    if (keyboard.pressed("right")) cameraHolder.rotateOnAxis(rotY, -angle);
    if (keyboard.pressed("up")) cameraHolder.rotateOnAxis(rotX, -angle);
    if (keyboard.pressed("down")) cameraHolder.rotateOnAxis(rotX, angle);
    if (keyboard.pressed("<")) cameraHolder.rotateOnAxis(rotZ, angle);
    if (keyboard.pressed(">")) cameraHolder.rotateOnAxis(rotZ, -angle);
    if (keyboard.pressed(",")) cameraHolder.rotateOnAxis(rotZ, angle);
    if (keyboard.pressed(".")) cameraHolder.rotateOnAxis(rotZ, -angle);
    if (keyboard.pressed("space")) cameraHolder.translateZ(-0.2) //translateZ(0.2);
}

function showInformation() {
    // Use this to show information onscreen
    var controls = new InfoBox();
    controls.add("Uso do Teclado:");
    controls.addParagraph();
    controls.add("Pressione , ou < e . ou > para rotacionar a câmera em torno do eixo Z");
    controls.add("Pressione as setas para rotacionar a câmera para a direita/esquerda e cima/baixo");
    controls.add("Pressione ESPAÇO para mover a câmera para frente");
    controls.show();
}

function render() {
    stats.update(); // Update FPS
    requestAnimationFrame(render); // Show events
    //trackballControls.update();
    keyboardUpdate();
    renderer.setClearColor("rgb(32,219,217)");
    renderer.clear(); // Clean the window
    renderer.render(scene, camera) // Render scene
}