import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { GUI } from '../build/jsm/libs/dat.gui.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';
import {
    initRenderer,
    InfoBox,
    SecondaryBox,
    createGroundPlane,
    onWindowResize,
    degreesToRadians
    //createLightSphere
} from "../libs/util/util.js";

var scene = new THREE.Scene(); // Create main scene
var stats = new Stats(); // To show FPS information

var renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 42)");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(2.18, 1.62, 3.31);
camera.up.set(0, 1, 0);
var objColor = "rgb(255,255,255)";
var objShininess = 200;

// To use the keyboard
var keyboard = new KeyboardState();

//controles
var torusHeight = 1.5;

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

var groundPlane = createGroundPlane(4.0, 2.5, 50, 50); // width and height
groundPlane.rotateX(degreesToRadians(-90));
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(1.5);
axesHelper.visible = false;
scene.add(axesHelper);

var mat4 = new THREE.Matrix4();

// Show text information onscreen
showInformation();

var infoBox = new SecondaryBox("");

// Teapot
var geometry = new TeapotGeometry(0.5);
var material = new THREE.MeshPhongMaterial({ color: objColor, shininess: "200" });
material.side = THREE.DoubleSide;
var obj = new THREE.Mesh(geometry, material);
obj.castShadow = true;
obj.position.set(0.0, 0.5, 0.0);
scene.add(obj);

//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
// Control available light and set the active light
var lightArray = new Array();
var activeLight = 0; // View first Light
var lightIntensity = 1.0;

//---------------------------------------------------------
// Default light position, color, ambient color and intensity
var lightPosition = new THREE.Vector3(1.7, torusHeight, 1.1);
var lightColor = "rgb(255,255,255)";
var ambientColor = "rgb(50,50,50)";
var redColor = "rgb(255,0,0)";
var blueColor = "rgb(0,0,255)";
var greeColor = "rgb(0,255,0)";

// Sphere to represent the light
// var lightSphere = createLightSphere(scene, 0.05, 10, 10, lightPosition, "rgb(255,255,255)");

var sphereArray = [
    createLightSphere(scene, 0.05, 10, 10, lightPosition, "rgb(255,0,0)"),
    createLightSphere(scene, 0.05, 10, 10, lightPosition, "rgb(0,255,0)"),
    createLightSphere(scene, 0.05, 10, 10, lightPosition, "rgb(0,0,255)")
]

//---------------------------------------------------------
// Create and set all lights. Only Spot and ambient will be visible at first
// var spotLight = new THREE.SpotLight(lightColor);
// setSpotLight(lightPosition, spotLight);

var redspotLight = new THREE.SpotLight(redColor);
setSpotLight(lightPosition, redspotLight);

var greespotLight = new THREE.SpotLight(greeColor);
setSpotLight(lightPosition, greespotLight);

var bluespotLight = new THREE.SpotLight(blueColor);
setSpotLight(lightPosition, bluespotLight);

// var pointLight = new THREE.PointLight(lightColor);
// setPointLight(lightPosition);

// var dirLight = new THREE.DirectionalLight(lightColor);
// setDirectionalLighting(lightPosition);

// More info here: https://threejs.org/docs/#api/en/lights/AmbientLight
var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

// TESTE TORUS
const geometryTorus = new THREE.TorusGeometry(2, 2 / 80, 100, 100);
const materialTorus = new THREE.MeshBasicMaterial({ color: 0x7E5D7C });
const torus = new THREE.Mesh(geometryTorus, materialTorus);
torus.lookAt(0, 1, 0);
torus.position.set(0, torusHeight, 0);
scene.add(torus)

//torus.add(lightSphere)

buildInterface();
render();

// Set Point Light
// More info here: https://threejs.org/docs/#api/en/lights/PointLight
// function setPointLight(position) {
//     pointLight.position.copy(position);
//     pointLight.name = "Point Light"
//     pointLight.castShadow = true;
//     pointLight.visible = false;
//     spotLight.penumbra = 0.5;

//     scene.add(pointLight);
//     lightArray.push(pointLight);
// }

// Set Spotlight
// More info here: https://threejs.org/docs/#api/en/lights/SpotLight
function setSpotLight(position, spotLightAux) {
    spotLightAux.position.copy(position);
    spotLightAux.shadow.mapSize.width = 512;
    spotLightAux.shadow.mapSize.height = 512;
    spotLightAux.angle = degreesToRadians(40);
    spotLightAux.castShadow = true;
    spotLightAux.decay = 2;
    spotLightAux.penumbra = 0.5;
    spotLightAux.name = "Spot Light"

    scene.add(spotLightAux);
    lightArray.push(spotLightAux);
    //moveSphere(lightArray.length, 1)
}

// Set Directional Light
// More info here: https://threejs.org/docs/#api/en/lights/DirectionalLight
// function setDirectionalLighting(position) {
//     dirLight.position.copy(position);
//     dirLight.shadow.mapSize.width = 512;
//     dirLight.shadow.mapSize.height = 512;
//     dirLight.castShadow = true;

//     dirLight.shadow.camera.near = 1;
//     dirLight.shadow.camera.far = 20;
//     dirLight.shadow.camera.left = -5;
//     dirLight.shadow.camera.right = 5;
//     dirLight.shadow.camera.top = 5;
//     dirLight.shadow.camera.bottom = -5;
//     dirLight.name = "Direction Light";
//     dirLight.visible = false;

//     scene.add(dirLight);
//     lightArray.push(dirLight);
// }

// Update light position of the current light
function updateLightPosition(id) {


    // lightArray[id].position.copy(lightPosition);
    // lightSphere.position.copy(lightPosition);

    if (id == 0) {
        //console.log(sphereArray[id].position);
        //redspotLight.position.copy(sphereArray[id].position)
        //lightArray[id].position.copy(sphereArray[id].position);
        //lightSphere.position.copy(lightPosition);
    }

    // infoBox.changeMessage("Light Position: " + lightPosition.x.toFixed(2) + ", " +
    //     lightPosition.y.toFixed(2) + ", " + lightPosition.z.toFixed(2));

    //infoBox.changeMessage(sphereArray[id].positio);
}

// // Update light intensity of the current light
// function updateLightIntensity() {
//     lightArray[activeLight].intensity = lightIntensity;
// }

function buildInterface() {
    //------------------------------------------------------------
    // Interface
    var controls = new function() {
        this.viewAxes = false;
        this.color = objColor;
        this.shininess = objShininess;
        this.lightIntensity = lightIntensity;
        this.lightType = 'Spot'
        this.ambientLight = true;

        this.onViewAxes = function() {
            axesHelper.visible = this.viewAxes;
        };
        this.onEnableAmbientLight = function() {
            ambientLight.visible = this.ambientLight;
        };
        // this.updateColor = function() {
        //     material.color.set(this.color);
        // };
        // this.onUpdateShininess = function() {
        //     material.shininess = this.shininess;
        // };
        // this.onUpdateLightIntensity = function() {
        //     lightIntensity = this.lightIntensity;
        //     updateLightIntensity();
        // };
        this.onChangeLight = function() {
            lightArray[activeLight].visible = false;
            switch (this.lightType) {
                case 'Spot':
                    activeLight = 0;
                    break;
                case 'Point':
                    activeLight = 1;
                    break;
                case 'Direction':
                    activeLight = 2;
                    break;
            }
            lightArray[activeLight].visible = true;
            updateLightPosition();
            //updateLightIntensity();
        };
    };

    var gui = new GUI();
    // gui.addColor(controls, 'color')
    //     .name("Obj Color")
    //     .onChange(function(e) { controls.updateColor() });
    // gui.add(controls, 'shininess', 0, 1000)
    //     .name("Obj Shininess")
    //     .onChange(function(e) { controls.onUpdateShininess() });
    gui.add(controls, 'viewAxes', false)
        .name("View Axes")
        .onChange(function(e) { controls.onViewAxes() });
    // gui.add(controls, 'lightType', ['Spot', 'Point', 'Direction'])
    //     .name("Light Type")
    //     .onChange(function(e) { controls.onChangeLight(); });
    // gui.add(controls, 'lightIntensity', 0, 5)
    //     .name("Light Intensity")
    //     .onChange(function(e) { controls.onUpdateLightIntensity() });
    gui.add(controls, 'ambientLight', true)
        .name("Ambient Light")
        .onChange(function(e) { controls.onEnableAmbientLight() });
}

function keyboardUpdate() {
    keyboard.update();
    if (keyboard.pressed("D")) {
        updateLightPosition(1);
        moveSphere(1, 1);
    }
    if (keyboard.pressed("A")) {
        updateLightPosition(1);
        moveSphere(1, -1);
    }
    // if (keyboard.pressed("W")) {
    //     lightPosition.y += 0.05;
    //     updateLightPosition();
    // }
    if (keyboard.pressed("Q")) {
        updateLightPosition(2);
        moveSphere(2, -1);
    }
    if (keyboard.pressed("E")) {
        updateLightPosition(2);
        moveSphere(2, 1);
    }
    if (keyboard.pressed("X")) {
        updateLightPosition(0);
        moveSphere(0, 1);
    }
    if (keyboard.pressed("Z")) {
        //lightPosition.z += 0.05;
        updateLightPosition(0);
        moveSphere(0, -1);
    }
    if (keyboard.down("0")) {
        lightArray[0].visible = !lightArray[0].visible;
        //console.log("entrei");
    }
    if (keyboard.down("1")) {
        lightArray[1].visible = !lightArray[1].visible;
    }
    if (keyboard.down("2")) {
        lightArray[2].visible = !lightArray[2].visible;
    }
}

function showInformation() {
    // Use this to show information onscreen
    var controls = new InfoBox();
    controls.add("Lighting - Types of Lights");
    controls.addParagraph();
    controls.add("Use the WASD-QE keys to move the light");
    controls.show();
}

function render() {
    stats.update();
    trackballControls.update();
    keyboardUpdate();
    requestAnimationFrame(render);
    renderer.render(scene, camera)
}

function createLightSphere(scene, radius, widthSegments, heightSegments, position, myColor) {
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI);
    var material = new THREE.MeshBasicMaterial({ color: myColor });
    var object = new THREE.Mesh(geometry, material);
    object.visible = true;
    object.position.copy(position);
    scene.add(object);

    return object;
}

var time = [0, 0, 0];
var delta = 0.1;

function moveSphere(lightID, way) {
    time[lightID] += delta * 25;
    sphereArray[lightID].matrixAutoUpdate = false;
    sphereArray[lightID].matrix.identity(); // reset matrix
    sphereArray[lightID].matrix.multiply(mat4.makeRotationY(degreesToRadians(way * time[lightID])));
    sphereArray[lightID].matrix.multiply(mat4.makeTranslation(2.0, torusHeight, 0.0));

    //lightArray[id].position

    lightArray[lightID].matrixAutoUpdate = false;
    lightArray[lightID].matrix.identity(); // reset matrix
    lightArray[lightID].matrix.multiply(mat4.makeRotationY(degreesToRadians(way * time[lightID])));
    lightArray[lightID].matrix.multiply(mat4.makeTranslation(2.0, torusHeight, 0.0));

    //console.log(sphereArray[lightID]);
}