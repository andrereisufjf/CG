import * as THREE from '../build/three.module.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import { updateTurn, getTurn } from './carBody.js';

export const lado = 45; //Tamanho do quadrado inferior
const tam = 10; //Tamanho dos quadrados da pista
const delta = 0.95; //Distancia entre os quadrados?
const quant = (2 * lado) / tam - 1; //quantidade de blocos por aresta da pista
const z = -0.75; // Z do quadrado
const inicialArrayPosition = quant / 2; //posição do bloco inicial
const tamReal = tam * delta; //tamanho real do bloco a ser usado
const limiteInterno = lado - tam; //limite interior do bloco

let actualLane = 1; //pista selecionado

// create the ground plane
var plane = createPlane();
var axesHelper = new THREE.AxesHelper(12);

// To use the keyboard
//var keyboard = new KeyboardState();

//blocos da pista
let blocks = [];

//controle de voltas
//let squares = [];
let beginIndex = 0;
let indexAtual = 0;

//Classe dos blocos da corrida
class Blocks {
    constructor(x = 0, y = 0, z, tamBloco, isInicial = false) {
        let color = isInicial ? { color: "rgba(255, 69, 0)" } : { color: "rgba(128, 128, 128)" };
        var cubeGeometry = new THREE.BoxGeometry(tamBloco, tamBloco, 0.3);
        var cubeMaterial = new THREE.MeshBasicMaterial(color);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, y, z);
        // scene.add(cube);
        return cube;
    }
}

//Cria o plano inferior
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
            beginIndex = indexAtual - 1;
            blocks.push(new Blocks(i + tam / 2, -lado + tam / 2, z, tamReal, true));
        } else {
            blocks.push(new Blocks(i + tam / 2, -lado + tam / 2, z, tamReal, false));
        }
        indexAtual += 1;
    }

    for (let i = -lado + tam; i < lado; i = i + tam) {
        indexAtual += 1;
        blocks.push(new Blocks(lado - tam / 2, i + tam / 2, z, tamReal, false));
    }

    for (let i = lado - tam; i > -lado; i = i - tam) {
        indexAtual += 1;
        blocks.push(new Blocks(i - tam / 2, lado - tam / 2, z, tamReal, false));
    }

    for (let i = lado - tam; i > -lado + tam; i = i - tam) {
        indexAtual += 1;
        blocks.push(new Blocks(-lado + tam / 2, i - tam / 2, z, tamReal, false));
    }
    indexAtual = beginIndex;

}

export function addPlanElements(scene) {
    createBlocks();
    blocks.forEach(block => scene.add(block));
    scene.add(plane);
    axesHelper.visible = false;
    scene.add(axesHelper);
}

export function getInicialPosition() {
    return blocks[Math.round(quant / 2)].position;
}

export function atualizarQuadrante(x, y) {

    if (x <= ((blocks[indexAtual].position.x) + tamReal / 2) && x >= ((blocks[indexAtual].position.x) - tamReal / 2) && y <= ((blocks[indexAtual].position.y) + tamReal / 2) && y >= ((blocks[indexAtual].position.y) - tamReal / 2)) {
        if (indexAtual !== inicialArrayPosition) {

            changeColor(blocks[indexAtual]);
        }

        if (indexAtual == 0) {
            indexAtual = blocks.length - 1;
        } else {
            indexAtual = (indexAtual - 1);

        }
        if (indexAtual === beginIndex) {
            updateTurn();
        }
    }
}



export function changeLane(key) {

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
    let carAbsX = Math.abs(position.x);
    let carAbsY = Math.abs(position.y);
    let x = position.x;
    let y = position.y;

    //pista quadrada
    if (actualLane === 1) {
        //verifica retangulo horizontal
        if (carAbsX >= 0 && carAbsX <= lado && carAbsY >= limiteInterno && carAbsY <= lado) {
            return true;
            //verifica retangulo vertical
        } else if (carAbsX >= limiteInterno && carAbsX <= lado && carAbsY >= 0 && carAbsY <= limiteInterno) {
            return true;
        }
    } else if (actualLane === 2) {

        //verifica retangulo horizontal inferior
        if (carAbsX >= 0 && carAbsX <= lado && y >= -lado && y <= -limiteInterno) {
            //console.log("entrei");
            return true;
            //verifica retangulo vertical esquerdo
        } else if (x <= -limiteInterno && x >= -lado && carAbsY >= 0 && carAbsY <= limiteInterno) {
            return true;
            //horizontal superior
        } else if (x <= tamReal && x >= -lado && y >= limiteInterno && y <= lado) {
            return true;
            // horizontal meio
        } else if (x <= lado && x >= -tamReal && y >= -tamReal && y <= tamReal) {
            return true;
            // vertical meio
        } else if (x <= tamReal && x >= -tamReal && y >= -tamReal && y <= lado) {
            return true;
        } // vertical direita
        else if (x <= lado && x >= limiteInterno && y >= -lado && y <= tamReal) {
            return true;
        }
    }

    return false;
}

export function changeVisible(visibility) {
    blocks.forEach(block => block.visible = visibility);
    plane.visible = visibility;
    axesHelper.visible = !visibility;
}

function changeColor(obj) {
    let color = getTurn() % 2 ? "rgb(16, 75, 205)" : "rgba(128, 128, 128)";
    obj.material.color.set(color);
}