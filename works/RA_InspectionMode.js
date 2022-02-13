import * as THREE from '../build/three.module.js';
import { ARjs } from '../libs/AR/ar.js';
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import {
    InfoBox,
    degreesToRadians,
    getMaxSize,
    initDefaultSpotlight
} from "../libs/util/util.js";

import { createCarBody, definePosition } from "./carBody.js"

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(640, 480);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);
// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.Camera();
scene.add(camera);

var clock = new THREE.Clock();

// array of functions for the rendering loop
var onRenderFcts = [];
var mixer = new Array();

// Show text information onscreen
showInformation();

//criação do carro
var car = createCarBody();
car.name = 'car';
car = normalizeAndRescale(car, 2);
car.rotateX(-degreesToRadians(90));
car.rotateZ(-degreesToRadians(90));
scene.add(car);

definePosition();

//----------------------------------------------------------------------------
var arToolkitSource = new ARjs.Source({
    // to read from the webcam
    sourceType: 'webcam',

    // // to read from an image
    sourceType: 'image',
    sourceUrl: '../assets/AR/kanjiScene.jpg',

    // to read from a video
    // sourceType : 'video',
    // sourceUrl : '../assets/AR/kanjiScene.mp4'
})

arToolkitSource.init(function onReady() {
    setTimeout(() => {
        onResize()
    }, 2000);
})

// handle resize
window.addEventListener('resize', function() {
    onResize()
})

function onResize() {
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

//----------------------------------------------------------------------------
// initialize arToolkitContext
//
// create atToolkitContext
var arToolkitContext = new ARjs.Context({
    cameraParametersUrl: '../libs/AR/data/camera_para.dat',
    detectionMode: 'mono',
})

// initialize it
arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
})

// update artoolkit on every frame
onRenderFcts.push(function() {
    if (arToolkitSource.ready === false) return
    arToolkitContext.update(arToolkitSource.domElement)
        // update scene.visible if the marker is seen
    scene.visible = camera.visible
})

//----------------------------------------------------------------------------
// Create a ArMarkerControls
//
// init controls for camera
//var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
var markerControls = new ARjs.MarkerControls(arToolkitContext, camera, {
        type: 'pattern',
        patternUrl: '../libs/AR/data/patt.kanji',
        changeMatrixMode: 'cameraTransformMatrix' // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    })
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false

//----------------------------------------------------------------------------
// Adding object to the scene
var light = initDefaultSpotlight(scene, new THREE.Vector3(-5, 5, 5));
light.castShadow = true;

function normalizeAndRescale(obj, newScale) {
    var scale = getMaxSize(obj); // Available in 'utils.js'
    obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
    return obj;
}

var lightColor = "rgb(255,255,255)";
var spotLight = new THREE.SpotLight(lightColor, 1.1);

setSpotLight(camera.position)

function setSpotLight(position) {
    spotLight.position.copy(position);
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.angle = degreesToRadians(40);
    spotLight.castShadow = true;
    spotLight.decay = 2;
    spotLight.penumbra = 0.5;
    spotLight.name = "Spot Light"
    spotLight.visible = true;

    scene.add(spotLight);
}

function defineCamPosition() {
    //console.log("entrei");
    camera.matrixAutoUpdate = true;
    spotLight.target = car;
    spotLight.position.copy(camera.position);

}

//----------------------------------------------------------------------------
// Render the whole thing on the page

// render the scene
onRenderFcts.push(function() {
    renderer.render(scene, camera);
})

function showInformation() {
    // Use this to show information onscreen
    var controls = new InfoBox();
    controls.add("Grupo 07");
    controls.addParagraph();
    controls.add("A visualização pelo WebCam pode ser realizada " +
        "comentando a linha 53 e 54.");
    controls.show();
}

// run the rendering loop
requestAnimationFrame(function animate(nowMsec) {
    var delta = clock.getDelta();
    var lastTimeMsec = null;
    // keep looping
    requestAnimationFrame(animate);
    defineCamPosition();
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
        // call each update function
    onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)

        for (var i = 0; i < mixer.length; i++)
            mixer[i].update(delta)
    })
})