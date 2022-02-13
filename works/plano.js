import * as THREE from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { updateTurn, getTurn, cameraHeSheItActived } from './carBody.js';
import * as OBJ from './objects.js';

export const lado = 45; //Tamanho do quadrado inferior
const tam = 10; //Tamanho dos quadrados da pista
const delta = 1.00; //Distancia entre os quadrados?
const quant = (2 * lado) / tam - 1; //quantidade de blocos por aresta da pista
const tamMatriz = 9;
const z = -0.75; // Z do quadrado
const inicialArrayPosition = quant / 2; //posição do bloco inicial
const tamReal = tam * delta; //tamanho real do bloco a ser usado
const limiteInterno = lado - tam; //limite interior do bloco
let actualLane = 1; //pista selecionado
var objPerTrack = 10; // Quantidade de cada objeto
var barPositions = []; //Vetor de posição dos barris
var boxPositions = []; //Vetor de posição das caixas
var objects = [];
export var objectsBox = [];
let boxHelperActive = false;

//Texturas da pista
var textureLoader = new THREE.TextureLoader();
var trackTextures = [textureLoader.load('./textures/asphalt.jpg'),
textureLoader.load('./textures/land.jfif'),
textureLoader.load('./textures/metalFloor.jpg'),
textureLoader.load('./textures/trackRock.png')];

//Texturas do terreno
var planeTextures = [textureLoader.load('./textures/dune.jfif'),
                     textureLoader.load('./textures/grass.jpg'),
                     textureLoader.load('./textures/rock.jpg'),
                     textureLoader.load('./textures/gravel.jpg')];

var skyTexture  = textureLoader.load('./textures/sky.jpg');

// create the ground plane
var plane = createPlane();
plane.receiveShadow = true;
var axesHelper = new THREE.AxesHelper(12);

// To use the keyboard
//var keyboard = new KeyboardState();

//blocos da pista
let blocks = [];

//Classe dos blocos da corrida
class Blocks {
    constructor(x = 0, y = 0, z, tamBloco, isInicial = false, visibility = true) {

        var cubeGeometry = new THREE.BoxGeometry(tamBloco, tamBloco, 0.3);
        var cubeMaterial = new THREE.MeshLambertMaterial();

        cubeMaterial.map = trackTextures[actualLane-1];
        plane.material.map = planeTextures[actualLane-1];

        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, y, z);
        cube.visible = visibility;
        cube.receiveShadow = true;
        return cube;
    }
}

//Cria o plano inferior
function createPlane() {
    var planeGeometry = new THREE.CircleGeometry(100,100,100)
    planeGeometry.translate(45, 45, -0.7);
    var planeMaterial = new THREE.MeshLambertMaterial({ map: planeTextures[actualLane-1], side: THREE.DoubleSide });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    return plane;
}

function createBlocks() {
    createTrack(1);

}

//Cria o cenario
export function addPlanElements(scene) {
    createBlocks();
    blocks.forEach(block => scene.add(block));
    scene.add(plane);
    addObjects(scene);
    createSkyDome(scene);
    axesHelper.visible = false;
    scene.add(axesHelper);
}

//Criação do Sky Dome
function createSkyDome(scene){
 
    var skyDomeGeometry = new THREE.SphereGeometry(100,100,100)
    var skyDomeMaterial =  new THREE.MeshPhongMaterial({map: skyTexture});
    skyDomeMaterial.side = THREE.DoubleSide;
    var skyDome = new THREE.Mesh(skyDomeGeometry,skyDomeMaterial);
    
    skyDome.translateX(45)
    skyDome.translateY(45)

    scene.add(skyDome);

}

//Adiciona objetos ao cenario
function addObjects(scene) {
    objectsBox = [];

    //Adicionando Barris
    for (let i = 0; i < objPerTrack; i++) {

        var randomBlocks = [Math.floor(Math.random() * tamMatriz), Math.floor(Math.random() * tamMatriz)];

        while (tracks[actualLane][randomBlocks[0]][randomBlocks[1]] != 1) {
            randomBlocks = [Math.floor(Math.random() * tamMatriz), Math.floor(Math.random() * tamMatriz)];
        }

        barPositions[i] = [randomBlocks[0] * (tam) + pertObjPos(), randomBlocks[1] * (tam) + pertObjPos()]
        var barrel = OBJ.buildBarrel(barPositions[i]);
        objects.push(barrel);
        objectsBox.push(new THREE.Box3().setFromObject(barrel));
        scene.add(barrel);

        if (boxHelperActive)
            scene.add(new THREE.BoxHelper(barrel, 0xffff00));

    }

    //Adicionando Caixas
    for (let i = 0; i < objPerTrack; i++) {

        var randomBlocks = [Math.floor(Math.random() * tamMatriz), Math.floor(Math.random() * tamMatriz)];

        while (tracks[actualLane][randomBlocks[0]][randomBlocks[1]] != 1) {
            randomBlocks = [Math.floor(Math.random() * tamMatriz), Math.floor(Math.random() * tamMatriz)];
        }

        boxPositions[i] = [randomBlocks[0] * (tam) + pertObjPos(), randomBlocks[1] * (tam) + pertObjPos()]
        var box = OBJ.buildBox(boxPositions[i]);
        objects.push(box);
        objectsBox.push(new THREE.Box3().setFromObject(box));
        scene.add(box);

        if (boxHelperActive)
            scene.add(new THREE.BoxHelper(box, 0xffff00));
    }
}

//Perturba a posição do objeto no quadrante para que ele nao fique sempre no meio
function pertObjPos() {

    if (Math.random < 0.5) {
        return 5 * (1 + Math.random());
    } else {
        return 5 * (1 - Math.random());
    }
}

export function getInicialPosition() {
    return new THREE.Vector3(lado + tam, 5, 0);
}

export function activateBlock(x, y) {

    if (y < 0) return;

    x = parseInt(x / 10);
    y = parseInt(y / 10);

    if (x > 8 || x < 0) return;
    // // vamos achar a posição na matriz, se existir
    let onLand = tracks[actualLane][x][y] || 0;
    if (onLand != 0) {
        let index = x * (tam - 1) + y;
        if (index != 45) { // bloco não inicial
            changeTexture(blocks[index], x, y);
        } else if (index == 45) { // bloco inicial
            if (count >= tracksMinCount[actualLane]) {
                //validar se houve uma volta e 
                updateTurn();
                //reinicia as variáveis de controle
                tracksCounter = JSON.parse(JSON.stringify(tracks[actualLane]));
                count = 0;
            }
        }
    }
    return;

}

//
var tracks = {
    1: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [2, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    2: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 1, 1, 1],
        [2, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0]
    ],
    3: [
        [0, 0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 0, 0, 0, 1],
        [0, 0, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 0, 0, 1, 0, 0, 1],
        [2, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    4: [
        [0, 0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 1, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0, 0],
        [2, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0, 0]
    ]

}

var tracksCounter = JSON.parse(JSON.stringify(tracks[1]));
var count = 0;

var tracksMinCount = {
    1: 31,
    2: 31,
    3: 31,
    4: 29
}



function createTrack(key) {
    let pista = tracks[key];
    for (let i = 0; i < tamMatriz; i++) {
        for (let j = 0; j < tamMatriz; j++) {

            if (pista[i][j] === 1) {
                blocks.push(new Blocks(tam * i + 5, tam * j + 5, z, tamReal, false));
            } else if (pista[i][j] === 2) {
                blocks.push(new Blocks(tam * i + 5, tam * j + 5, z, tamReal, true));
            } else { // caso vazio, deve estar invisível
                blocks.push(new Blocks(tam * i + 5, tam * j + 5, z, tamReal, false, false));
            }

        }

    }
}


export function changeLane(key, scene) {
    //recria os blocos
    blocks.forEach(block => block.visible = false);
    blocks = [];

    //recria os objetos
    objects.forEach(obj => obj.visible = false);
    objects = [];

    actualLane = key;
    createTrack(key);
    blocks.forEach(block => scene.add(block));

    tracksCounter = JSON.parse(JSON.stringify(tracks[actualLane]));
    count = 0;

    //recria os blocks
    addObjects(scene);

}

//returna true ou false se a posição passada se encontra na psita ou não
export function isOnLane(position) {
    if (position.x < 0 || position.y < 0) {
        return false;
    }

    let x = parseInt(position.x / 10);
    let y = parseInt(position.y / 10);

    if (x > 8) return false;
    let onLand = tracks[actualLane][x][y] || 0;

    return onLand == 0 ? false : true;
}

export function changeVisible(visibility, scene = null) {
    if (visibility === false) {
        blocks.forEach(block => block.visible = visibility);
        objects.forEach(obj => obj.visible = visibility);
        plane.visible = visibility;
        axesHelper.visible = !visibility;
    } else {
        changeLane(actualLane, scene)
        plane.visible = visibility;
        axesHelper.visible = !visibility;
    }
}

function changeTexture(obj, x, y) {

    let passControl = tracksCounter[x][y]
    if (passControl != 0 && passControl != 8) {
        tracksCounter[x][y] = 8;
        count++;
    }

}

//MINI MAPA
var lookAtVec = new THREE.Vector3(45, 45, 0.0);
var camPosition = new THREE.Vector3(45, 45, 80);
var upVec = new THREE.Vector3(0.0, 1.0, 0.0);
var vcWidth = 200;
var vcHeidth = 200;
var projectionChanged = false;
var virtualCamera = new THREE.PerspectiveCamera(65, vcWidth / vcHeidth, 1, 100);
virtualCamera.position.copy(camPosition);
virtualCamera.up.copy(upVec);
virtualCamera.lookAt(lookAtVec);

const cameraHelper = new THREE.CameraHelper(virtualCamera);

export function addHelper(scene) {
    scene.add(cameraHelper);
}


export function controlledRender(renderer, camera, scene, inspMode, cameraHeSheIt) {
    var width = window.innerWidth;
    var height = window.innerHeight;

    //Set main viewport
    renderer.setViewport(0, 0, width, height); // Reset viewport    
    renderer.setScissorTest(false); // Disable scissor to paint the entire window

    // deixar fundo preto no modo de insp para melhorar visualização
    inspMode ? renderer.setClearColor("rgb(80, 70, 170)") : renderer.setClearColor("rgb(0,0,0)");
    renderer.clear(); // Clean the window

    // valida qual render usar
    cameraHeSheItActived ? renderer.render(scene, cameraHeSheIt) : renderer.render(scene, camera);

    if (inspMode) {
        // Set virtual camera viewport 
        var offset = 20;
        var offsetX = width - vcHeidth - offset / 2;
        var offsetY = 2 * height / 3 - offset;
       
        renderer.setViewport(offset, height - vcHeidth - offset, vcWidth, vcHeidth); // Set virtual camera viewport  
        renderer.setScissor(offset, height - vcHeidth - offset, vcWidth, vcHeidth); // Set scissor with the same size as the viewport

        renderer.setScissorTest(true); // Enable scissor to paint only the scissor are (i.e., the small viewport)
        renderer.setClearColor("rgb(0, 0, 0)"); // Use a darker clear color in the small viewport 
        renderer.clear(); // Clean the small viewport
        renderer.render(scene, virtualCamera); // Render scene of the virtual camera
    }
}