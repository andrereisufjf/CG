import * as THREE from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';

// add the plane to the scene
//scene.add(plane);

const lado = 45;
const tam = 10;
const delta = 0.9;
const quant = (2 * lado) / tam - 1;
const z = -0.75;

let actualLane = 1;

// create the ground plane
var plane = createPlane();

// To use the keyboard
var keyboard = new KeyboardState();

let blocks = [];

class Blocks {
    constructor(x = 0, y = 0, z, tam, isInicial = false) {
        let color = isInicial ? { color: "rgba(255, 69, 0)" } : { color: "rgba(128, 128, 128)" };
        var cubeGeometry = new THREE.BoxGeometry(tam, tam, 0.3);
        var cubeMaterial = new THREE.MeshBasicMaterial(color);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, y, z);
        // scene.add(cube);
        return cube;
    }
}

function createPlane() {
    var planeGeometry = new THREE.PlaneGeometry(lado * 2.1, lado * 2.1);
    planeGeometry.translate(0.0, 0.0, -2); // To avoid conflict with the axeshelper
    var planeMaterial = new THREE.MeshBasicMaterial({
        color: "rgba(255, 160, 122)",
        side: THREE.DoubleSide,
    });
    return new THREE.Mesh(planeGeometry, planeMaterial);

}

function createBlocks() {
    for (let i = -lado; i < lado; i = i + tam) {
        if (i === -tam / 2) {
            blocks.push(new Blocks(i + tam / 2, -lado + tam / 2, z, tam * delta, true));
        } else {
            blocks.push(new Blocks(i + tam / 2, -lado + tam / 2, z, tam * delta, false));
        }
    }

    for (let i = -lado + tam; i < lado; i = i + tam) {
        blocks.push(new Blocks(lado - tam / 2, i + tam / 2, z, tam * delta, false));
    }

    for (let i = lado - tam; i > -lado; i = i - tam) {
        blocks.push(new Blocks(i - tam / 2, lado - tam / 2, z, tam * delta, false));
    }

    for (let i = lado - tam; i > -lado + tam; i = i - tam) {
        blocks.push(new Blocks(-lado + tam / 2, i - tam / 2, z, tam * delta, false));
    }


}

export function addPlanElements(scene) {
    createBlocks();
    blocks.forEach(block => scene.add(block));
    scene.add(plane);
}

export function getInicialPosition() {
    //blocks[Math.round(quant / 2)].material.color = "";
    return blocks[Math.round(quant / 2)].position;
}



export function changeLane(key) {

    //keyboard.update();

    if (key === 2 && actualLane === 1) {
        let start = Math.round(quant + quant / 2) + 1;
        let end = Math.round(2 * quant + quant / 2);
        let fator = Math.round((end - start) / 2);

        for (let i = start; i < end; i++) {
            let x, y;
            x = blocks[i].position.x;
            y = blocks[i].position.y;

            if (x === y) {
                fator = 0;
                blocks[i].position.set(tam * fator, tam * fator, z);
            } else if (x > y) {
                fator--;
                blocks[i].position.set(tam * fator, 0, z);
            } else {
                fator++;
                blocks[i].position.set(0, tam * fator, z);
            }
        }
        actualLane = 2;
    } else if (key === 1 && actualLane === 2) {
        let start = Math.round(quant + quant / 2) + 1;
        let end = Math.round(2 * quant + quant / 2);

        let fator = Math.round((end - start) / 2);

        //console.log("ola");
        //console.log(Math.round((end-start)/2));
        //console.log(end - start);

        for (let i = start; i < end; i++) {
            let x, y;
            x = blocks[i].position.x;
            y = blocks[i].position.y;

            if (x === y) {
                fator = 0;
                blocks[i].position.set(lado - tam / 2, lado - tam / 2, z);
            } else if (x > y) {
                fator--;
                blocks[i].position.set(lado - tam / 2, lado - tam / 2 - x, z);
            } else {
                fator++;
                blocks[i].position.set(lado - tam / 2 - y, lado - tam / 2, z);
            }

        }
        actualLane = 1;
    }
}

//returna true ou false se a posição passada se encontra na psita ou não
export function isOnLane(position) {

}