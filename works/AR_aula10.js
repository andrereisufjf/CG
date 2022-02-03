import * as THREE from '../build/three.module.js';
import { GUI } from '../build/jsm/libs/dat.gui.module.js';
import { ARjs } from '../libs/AR/ar.js';
// import {InfoBox,
// 		initDefaultSpotlight} from "../libs/util/util.js";
import { GLTFLoader } from '../build/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../build/jsm/loaders/MTLLoader.js';
import Stats from '../build/jsm/libs/stats.module.js';
import {
    InfoBox,
    initRenderer,
    initDefaultSpotlight,
    createGroundPlane,
    degreesToRadians,
    getMaxSize,
    onWindowResize
} from "../libs/util/util.js";
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';

var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(640, 480);
document.body.appendChild(renderer.domElement);

var scene = new THREE.Scene(); // Create main scene
var clock = new THREE.Clock();
var stats = new Stats();
// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.Camera();
scene.add(camera);

// array of functions for the rendering loop
var onRenderFcts = [];

var planeGeometry = new THREE.BoxGeometry(2, 0.05, 2);

var phongMaterialBoxBottom = new THREE.MeshLambertMaterial({
    color: "rgb(180,180,180)",
});
var plane = new THREE.Mesh(planeGeometry, phongMaterialBoxBottom);
plane.position.set(-0.3, -.5, -0.5);
plane.castShadow = true;
scene.add(plane);
plane.material.transparent = true;
plane.material.opacity = 0.5;

// Show text information onscreen
showInformation();
// Enable mouse rotation, pan, zoom etc.

//----------------------------------------------------------------------------
// Handle arToolkitSource
// More info: https://ar-js-org.github.io/AR.js-Docs/marker-based/
//var arToolkitSource = new THREEx.ArToolkitSource({
var arToolkitSource = new ARjs.Source({
    // to read from the webcam
    //sourceType : 'webcam',

    // // to read from an image
    sourceType: 'image',
    sourceUrl: '../assets/AR/kanjiScene.jpg',
    transparent: true,
    opacity: 0.3,


})
arToolkitSource.transparent = true;
arToolkitSource.opacity = 0.3;

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
//var arToolkitContext = new THREEx.ArToolkitContext({
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
var markerControls = new ARjs.MarkerControls(arToolkitContext, camera, {
        type: 'pattern',
        patternUrl: '../libs/AR/data/patt.kanji',
        changeMatrixMode: 'cameraTransformMatrix' // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    })
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
scene.visible = false

//----------------------------------------------------------------------------


var man = null;
var playAction = true;
var time = 0;
var mixer = new Array();
loadGLTFFile('../assets/dog/', 'scene.gltf', true);
// scene.add(dog);
var mixer = new Array();


renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

var ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// //Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight(0xffffff, 1, 50);
light.position.set(0, 1, 0); //default; light shining from top
light.castShadow = true; // default false
scene.add(light)


light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

// const helper = new THREE.CameraHelper( light.shadow.camera );
// scene.add( helper );
render();
var torus = new THREE.Object3D();
createTorus();
scene.add(torus);




// controls which object should be rendered
var firstObject = true;

var controls = new function() {
    this.onChangeObject = function() {
        firstObject = !firstObject;
        if (firstObject) {
            cubeKnot.visible = true;
            torus.visible = false;
        } else {
            cubeKnot.visible = false;
            torus.visible = true;
        }
    };
};

// GUI interface
//var gui = new dat.GUI();
var gui = new GUI();
gui.add(controls, 'onChangeObject').name("Change Object");

//----------------------------------------------------------------------------
// Render the whole thing on the page

// render the scene
onRenderFcts.push(function() {
    renderer.render(scene, camera);
})

function createTorus() {
    var light = initDefaultSpotlight(scene, new THREE.Vector3(25, 30, 20)); // Use default light
    var geometry = new THREE.TorusGeometry(0.6, 0.2, 20, 20, Math.PI * 2);
    var objectMaterial = new THREE.MeshPhongMaterial({
        color: "rgb(255,0,0)", // Main color of the object
        shininess: "200", // Shininess of the object
        specular: "rgb(255,255,255)" // Color of the specular component

    });
    var object = new THREE.Mesh(geometry, objectMaterial);
    object.position.set(0.0, 0.2, 0.0);
    object.rotation.x = Math.PI / 2;

    torus.add(object);
    torus.visible = false;
}



function showInformation() {
    // Use this to show information onscreen
    controls = new InfoBox();
    controls.add("Augmented Reality - Basic Example");
    controls.addParagraph();
    controls.add("Put the 'KANJI' marker in front of the camera.");
    controls.show();
}

// run the rendering loop
requestAnimationFrame(function animate(nowMsec) {
    var lastTimeMsec = null;
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec = nowMsec
        // call each update function
    onRenderFcts.forEach(function(onRenderFct) {
        onRenderFct(deltaMsec / 1000, nowMsec / 1000)
    })
})


function loadGLTFFile(modelPath, modelName, centerObject) {
    var loader = new GLTFLoader();
    loader.load(modelPath + modelName, function(gltf) {
        var obj = gltf.scene;
        obj.traverse(function(child) {
            if (child) {
                child.castShadow = true;
            }
        });
        obj.traverse(function(node) {
            if (node.material) node.material.side = THREE.DoubleSide;
        });

        // Only fix the position of the centered object
        // The man around will have a different geometric transformation
        if (centerObject) {
            obj = normalizeAndRescale(obj, 2);
            obj = fixPosition(obj);
        } else {
            man = obj;
        }
        scene.add(obj);

        // Create animationMixer and push it in the array of mixers
        var mixerLocal = new THREE.AnimationMixer(obj);
        mixerLocal.clipAction(gltf.animations[0]).play();
        mixer.push(mixerLocal);
    }, onProgress, onError);
}

function onError() {};

function onProgress(xhr, model) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
    }
}
// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale) {
    var scale = getMaxSize(obj); // Available in 'utils.js'
    obj.scale.set(newScale * (1.0 / scale),
        newScale * (1.0 / scale),
        newScale * (1.0 / scale));
    return obj;
}

function fixPosition(obj) {
    // Fix position of the object over the ground plane
    var box = new THREE.Box3().setFromObject(obj);
    if (box.min.y > 0)
        obj.translateY(-box.min.y);
    else
        obj.translateY(-1 * box.min.y);
    return obj;
}

// Function to rotate the man around the center object
function rotateMan(delta) {
    if (man) {
        time += delta * 25;

        var mat4 = new THREE.Matrix4();
        var scale = 0.4;
        man.matrixAutoUpdate = false;
        man.matrix.identity(); // reset matrix
        man.matrix.multiply(mat4.makeRotationY(degreesToRadians(-time)));
        man.matrix.multiply(mat4.makeTranslation(2.0, 0.0, 0.0));
        man.matrix.multiply(mat4.makeScale(scale, scale, scale));
    }
}

function render() {
    stats.update();
    var delta = clock.getDelta(); // Get the seconds passed since the time 'oldTime' was set and sets 'oldTime' to the current time.
    //   trackballControls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    // Animation control
    if (playAction) {
        for (var i = 0; i < mixer.length; i++)
            mixer[i].update(delta);
        rotateMan(delta);
    }
}