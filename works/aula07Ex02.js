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

//texture
const loader = new THREE.TextureLoader();
const woodTexture = loader.load('../assets/textures/wood.png');
const woodTopTexture = loader.load('../assets/textures/woodtop.png');
const woodMaterial = new THREE.MeshLambertMaterial({
    map: woodTexture
});

const woodTopMaterial = new THREE.MeshLambertMaterial({
    map: woodTopTexture
});

// create a cylinder
var cylinderGeometry = new THREE.CylinderGeometry(2, 2, 10, 32, 32, true);
var cylinder = new THREE.Mesh(cylinderGeometry, woodMaterial);

// create a circle
var circleGeometry = new THREE.CircleGeometry(2, 32);
var circle = new THREE.Mesh(circleGeometry, woodTopMaterial);
var circle2 = new THREE.Mesh(circleGeometry, woodTopMaterial);

// position the cylinder
cylinder.position.set(0.0, 0.0, 5.0);
cylinder.rotation.x = Math.PI / 2;
circle.position.set(0.0, 5, 0);
circle.rotation.x = -Math.PI / 2;
circle2.position.set(0.0, -5, 0);
circle2.rotation.x = Math.PI / 2;

cylinder.add(circle);
cylinder.add(circle2);

// add the cylinder to the scene
scene.add(cylinder);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

render();

function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}