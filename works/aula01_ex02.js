import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import {
    initRenderer,
    initCamera,
    InfoBox,
    onWindowResize
} from "../libs/util/util.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(15);
scene.add(axesHelper);

// create the ground plane
var planeGeometry = new THREE.PlaneGeometry(30, 30);
planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgba(150, 150, 150)",
    side: THREE.DoubleSide,
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// add the plane to the scene
scene.add(plane);

const Material = new THREE.MeshNormalMaterial(); // material padrao
const objects = []; // vetor de objetos

//Funcao para adicionar solido geométrico com material padrão
function addSolidGeometry(x, y, z, geometry) {
    const mesh = new THREE.Mesh(geometry, Material);
    addObject(x, y, z, mesh); //  geometry.parameters.height / 2
    //console.log(geometry.type);
}

//funcao para adicionar objeto a cena
function addObject(x, y, z, obj) {
    obj.position.set(x, y, z);
    scene.add(obj);
    objects.push(obj);
}

//Adicionando sólidos a cena
{
    addSolidGeometry(-6, -4, 2, new THREE.BoxGeometry(4, 4, 4));

    addSolidGeometry(0, 0, 3, new THREE.SphereGeometry(3, 100, 15));

    var radiusTop = 4,
        radiusBottom = 4,
        height = 5,
        radialSegments = 100;

    addSolidGeometry(8, 4, 4, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments));
}


// Use this to show information onscreen
var controls = new InfoBox();
controls.add("Basic Scene");
controls.addParagraph();
controls.add("Use mouse to interact:");
controls.add("* Left button to rotate");
controls.add("* Right button to translate (pan)");
controls.add("* Scroll to zoom in/out.");
controls.show();

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

render();

function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}