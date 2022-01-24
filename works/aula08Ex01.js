import * as THREE from '../libs/other/three.module.r82.js';
import { RaytracingRenderer } from '../libs/other/raytracingRenderer.js';
import { degreesToRadians } from "../libs/util/util.js";

var scene, renderer;

var container = document.createElement('div');
document.body.appendChild(container);

var scene = new THREE.Scene();

// The canvas is in the XY plane.
// Hint: put the camera in the positive side of the Z axis and the
// objects in the negative side
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
//var camera = new THREE.PerspectiveCamera( 60, 2 / 1, 1, 1000 );
camera.position.z = 3.5;
camera.position.y = 1.5; // height is 3, so 3 / 2 = 1.5

// light
var intensity = 0.5;
var light = new THREE.PointLight(0xffffff, intensity);
light.position.set(0, 2.50, 0);
scene.add(light);

var light = new THREE.PointLight(0x55aaff, intensity);
light.position.set(-1.00, 1.50, 2.00);
scene.add(light);

var light = new THREE.PointLight(0xffffff, intensity);
light.position.set(1.00, 1.50, 2.00);
scene.add(light);

renderer = new RaytracingRenderer(window.innerWidth, window.innerHeight, 32, camera);
//renderer = new RaytracingRenderer(800, 400, 32, camera);
container.appendChild(renderer.domElement);

// materials
var phongMaterialBox = new THREE.MeshLambertMaterial({
    //color: "rgb(255,255,255)",
    color: "rgb(180,180,180)", // grey
});

var phongMaterialBoxBack = new THREE.MeshLambertMaterial({
    color: "rgb(254,255,210)", // white
    //color: "rgb(180,180,180)", // grey
});

var phongMaterialBoxBottom = new THREE.MeshLambertMaterial({
    color: "rgb(160,160,160)", // grey
});

var phongMaterialBoxLeft = new THREE.MeshLambertMaterial({
    //color: "rgb(200,0,0)",
    color: "rgb(41,125,252)", // blue
});

var phongMaterialBoxRight = new THREE.MeshLambertMaterial({
    //color: "rgb(0,200,0)",
    color: "rgb(41,125,252)", // blue
});

var phongMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(150,190,220)",
    specular: "rgb(255,255,255)",
    shininess: 1000,
});

var mirrorMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(0,0,0)",
    specular: "rgb(255,255,255)",
    shininess: 800,
});
mirrorMaterial.mirror = true;
mirrorMaterial.reflectivity = 1;

var cylindersMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(150,190,220)",
    //specular: "rgb(255,255,255)",
    //shininess: 1000,
});

var knotMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(240,194,41)", // brown
    shininess: 1000,
});

var vaseMaterial = new THREE.MeshPhongMaterial({
    color: "rgb(255,47,47)",
    specular: "rgb(255,255,255)",
    shininess: 10000,
    opacity: "0.25",
});
vaseMaterial.glass = true;
vaseMaterial.reflectivity = 0.05;
vaseMaterial.refractionRatio = 2.5;

// geometries
var sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
var planeGeometry = new THREE.BoxGeometry(6.00, 0.05, 6.00);
var planeGeometry2 = new THREE.BoxGeometry(6.00, 0.05, 3.00);
var cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.0, 80);
//var torusKnotHolderGeometry = new THREE.CylinderGeometry(0.025, 0.025, 0.75, 80);
var torusKnotGeometry = new THREE.TorusKnotGeometry(0.15, 0.05, 120, 10, 2, 3);
var baseVaseGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.15, 80);
var vaseGeometry = new THREE.CylinderGeometry(0.35, 0.2, 0.5, 80);

// Base Cylinders
var cylinders = [];
// create the cylinders
for (let i = 0; i < 3; i++) {
    cylinders[i] = new THREE.Mesh(cylinderGeometry, cylindersMaterial);
    scene.add(cylinders[i]);
}
// cylinder positioning
cylinders[0].position.set(0.0, 0.5, -3.0); // back-center
cylinders[1].position.set(2.0, 0.5, -1.5); // right
cylinders[2].position.set(-2.0, 0.5, -1.5); // left

// Sphere
var sphere = new THREE.Mesh(sphereGeometry, mirrorMaterial);
sphere.scale.multiplyScalar(0.4);
sphere.position.set(0.0, 0.9, 0.0);
cylinders[0].add(sphere);

// Vase
var baseVase = new THREE.Mesh(baseVaseGeometry, vaseMaterial);
var vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
baseVase.position.set(0.0, 0.6, 0.0);
baseVase.add(vase);
vase.position.set(0.0, 0.3, 0.0);
cylinders[1].add(baseVase);

// Torus Knot
//var torusKnotHolder = new THREE.Mesh( torusKnotHolderGeometry, phongMaterial ); 
var torusKnot = new THREE.Mesh(torusKnotGeometry, knotMaterial);
//torusKnotHolder.position.set( 0.0, 0.75, 0.0 );
torusKnot.position.set(0.0, 0.8, 0.0);
//torusKnotHolder.add(torusKnot);
cylinders[2].add(torusKnot);

// bottom
var plane = new THREE.Mesh(planeGeometry, phongMaterialBoxBottom);
//plane.position.set( 0, -.5, -3.00 );
plane.position.set(0, -.0, -3.00);
scene.add(plane);

// top
var plane = new THREE.Mesh(planeGeometry, phongMaterialBox);
//plane.position.set( 0, 5.5, -3.00 );
//plane.position.set( 0, 2.75, -3.00 );
plane.position.set(0, 3.0, -3.00);
scene.add(plane);

// back
var plane = new THREE.Mesh(planeGeometry2, phongMaterialBoxBack);
plane.rotation.x = 1.57;
//plane.position.set( 0, 2.50, -3.00 );
//plane.position.set( 0, 1.50, -4.00 );
plane.position.set(0, 1.50, -6.00);
scene.add(plane);

// left
var plane = new THREE.Mesh(planeGeometry2, phongMaterialBoxLeft);
plane.rotation.z = 1.57;
plane.rotation.x = 1.57;
//plane.position.set( -3.00, 2.50, -3.00 )
plane.position.set(-3.00, 1.50, -3.00)
scene.add(plane);

// right
var plane = new THREE.Mesh(planeGeometry2, phongMaterialBoxRight);
plane.rotation.z = 1.57;
plane.rotation.x = 1.57;
//plane.position.set( 3.00, 2.50, -3.00 )
plane.position.set(3.00, 1.50, -3.00)
scene.add(plane);

render();

function render() {
    renderer.render(scene, camera);
}