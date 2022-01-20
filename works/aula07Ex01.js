import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { GUI } from '../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    initCamera,
    initDefaultBasicLight,
    onWindowResize
} from "../libs/util/util.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position
initDefaultBasicLight(scene);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// const light = new THREE.DirectionalLight(0xfefefe);
// light.position.set(100, 90, 100);
// scene.add(light);

const ambientLight = new THREE.AmbientLight(0x442222);
scene.add(ambientLight);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// create the ground plane
var planeGeometry = new THREE.PlaneGeometry(10, 10);
planeGeometry.translate(0.0, 0.0, 0); // To avoid conflict with the axeshelper
// var planeMaterial = new THREE.MeshBasicMaterial({
//     color: "rgba(150, 150, 150)",
//     side: THREE.DoubleSide,
// });

//texture
const loader = new THREE.TextureLoader();
const marbleTexture = loader.load('../assets/textures/marble.png');

const marbleMaterial = new THREE.MeshLambertMaterial({
    map: marbleTexture
});

const woodTopMaterial = new THREE.MeshLambertMaterial({
    map: marbleTexture
});

var plane = [];

for (let i = 0; i < 5; i++) {
    plane[i] = new THREE.Mesh(planeGeometry, marbleMaterial);
    plane[i].material.side = THREE.DoubleSide;
}

plane[1].position.set(0.0, 5.0, 5.0);
plane[1].rotation.x = Math.PI / 2;
plane[2].position.set(0.0, -5.0, 5.0);
plane[2].rotation.x = Math.PI / 2;
plane[3].position.set(5.0, 0.0, 5.0);
plane[3].rotation.x = Math.PI / 2;
plane[3].rotation.y = Math.PI / 2;
plane[4].position.set(-5.0, 0.0, 5.0);
plane[4].rotation.x = Math.PI / 2;
plane[4].rotation.y = Math.PI / 2;

for (let i = 1; i < 5; i++) {
    plane[0].add(plane[i]);
}

scene.add(plane[0]);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

render();

function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}