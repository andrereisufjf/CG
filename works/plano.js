import * as THREE from '../build/three.module.js';


// add the plane to the scene
//scene.add(plane);

const lado = 90;
const tam = 10;
const delta = 0.9;
const quant = (2 * lado) / tam - 1;
const z = -0.75;

// create the ground plane
var plane = createPlane();

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

//console.log(Math.round(quant/2 + quant));

// scene.add(blocks);
//blocks.forEach(block => scene.add(block));
//blocks[Math.round(quant + quant / 2)].position.set(0 + tam / 2, 0 - tam / 2, 4); // descomentar

// blocks.forEach(block=>scene.add(block));

function createBlocks() {
    for (let i = -lado; i < lado; i = i + tam) {
        blocks.push(new Blocks(i + tam / 2, -lado + tam / 2, z, tam * delta, false));
    }

    for (let i = -lado; i < lado; i = i + tam) {
        blocks.push(new Blocks(lado - tam / 2, i + tam / 2, z, tam * delta, false));
    }

    for (let i = lado; i > -lado; i = i - tam) {
        blocks.push(new Blocks(i - tam / 2, lado - tam / 2, z, tam * delta, false));
    }

    for (let i = lado; i > -lado; i = i - tam) {
        blocks.push(new Blocks(-lado + tam / 2, i - tam / 2, z, tam * delta, false));
    }

}

export function addPlanElements(scene) {
    createBlocks();
    blocks.forEach(block => scene.add(block));
    scene.add(plane);
}

export function getInicialPosition() {
    blocks[Math.round(quant / 2)].material.color = "";
    return blocks[Math.round(quant / 2)].position;
}