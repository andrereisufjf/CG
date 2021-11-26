import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { degreesToRadians } from "../libs/util/util.js";
import {
    initRenderer,
    initCamera,
    InfoBox,
    onWindowResize,
    initDefaultBasicLight
} from "../libs/util/util.js";

import KeyboardState from '../libs/util/KeyboardState.js';
import { changeLane } from "./plano.js"

// To use the keyboard
var keyboard = new KeyboardState();

var speed = 0.0;
var deltaSpeed = 0.003;
var speedLimit = 0.50;
var angle = 0.0;
var deltaAngle = degreesToRadians(0.5);
var angleLimit = degreesToRadians(5);

//controle da camera
var modoCamera;

//Modo Inspeção
var modoInsp = {
    posicao: new THREE.Vector3(0, 0, 0), // posição padrao de inspeção
    posicaoAnterior: new THREE.Vector3(), // posição anterior a inspeção
    rotationAviao: new THREE.Euler(-1.5707963267948963, 0, 0), //rotação padrão do modo de inspeção
    rotationObj: new THREE.Euler(0, 0, 0), //rotação padrão do modo de inspeção
    rotationAntAviao: new THREE.Euler(), //rotação anterior ao modo de inspeção
    rotationAntObj: new THREE.Euler(), //rotação anterior ao modo de inspeção
    rotationCam: new THREE.Euler(-0.3217505543966422, 0, 0),
    rotationAntCam: new THREE.Euler(),
    posicaoCam: new THREE.Vector3(0, 40, 120),
    posicaoAntCam: new THREE.Vector3(),
    vel: 0,
}

//Fuselagem

var fuselageGeometry = new THREE.ConeGeometry(1.0, 3.0, 3, 3);
var fuselageMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('yellow'), });
var fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
//scene.add(fuselage);
fuselage.translateZ(0.6);

var fuselageAxesHelper = new THREE.AxesHelper(5);
fuselage.add(fuselageAxesHelper);

var windshieldGeometry = new THREE.ConeGeometry(0.3, 0.9, 3, 3);
var windshieldMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
fuselage.add(windshield);

var airfoilGeometry = new THREE.BoxGeometry(2.0, 0.5, 0.05);
var airfoilMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('yellow'), });
var airfoil = new THREE.Mesh(airfoilGeometry, airfoilMaterial);
fuselage.add(airfoil);


//Eixo traseiro e rodas

var rearAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8); //Eixo traseiro
var rearAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var rearAxle = new THREE.Mesh(rearAxleGeometry, rearAxleMaterial);

fuselage.add(rearAxle);

var rightRearWheelGeometry = new THREE.TorusGeometry(0.25, 0.1, 20, 20); //Roda direita do eixo traseiro
var rightRearWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var rightRearWheel = new THREE.Mesh(rightRearWheelGeometry, rightRearWheelMaterial);

rearAxle.add(rightRearWheel);

var rightRearAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8); //Raio da roda direita do eixo traseiro
var rightRearAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var rightRearAxle = new THREE.Mesh(rightRearAxleGeometry, rightRearAxleMaterial);

rightRearWheel.add(rightRearAxle);


var leftRearWheelGeometry = new THREE.TorusGeometry(0.25, 0.1, 20, 20); //Roda esquerda do eixo traseiro
var leftRearWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var leftRearWheel = new THREE.Mesh(rightRearWheelGeometry, rightRearWheelMaterial);

rearAxle.add(leftRearWheel);

var leftRearAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8); //Raio da roda esquerda do eixo traseiro
var leftRearAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var leftRearAxle = new THREE.Mesh(leftRearAxleGeometry, leftRearAxleMaterial);

leftRearWheel.add(leftRearAxle);

var frontAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8); //Eixo dianteiro
var frontAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var frontAxle = new THREE.Mesh(frontAxleGeometry, frontAxleMaterial);

fuselage.add(frontAxle);

var rightFrontWheelGeometry = new THREE.TorusGeometry(0.25, 0.1, 20, 20); //Roda direita do eixo dianteiro
var rightFrontWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var rightFrontWheel = new THREE.Mesh(rightFrontWheelGeometry, rightFrontWheelMaterial);

frontAxle.add(rightFrontWheel);

var rightFrontAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8); //Raio da roda direita do eixo dianteiro
var rightFrontAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var rightFrontAxle = new THREE.Mesh(rightFrontAxleGeometry, rightFrontAxleMaterial);

rightFrontWheel.add(rightFrontAxle);

var leftFrontWheelGeometry = new THREE.TorusGeometry(0.25, 0.1, 20, 20); //Roda esquerda do eixo dianteiro
var leftFrontWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var leftFrontWheel = new THREE.Mesh(rightFrontWheelGeometry, rightFrontWheelMaterial);

frontAxle.add(leftFrontWheel);

var leftFrontAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8); //Raio da roda esquerda do eixo tranteiro
var leftFrontAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var leftFrontAxle = new THREE.Mesh(leftFrontAxleGeometry, leftFrontAxleMaterial);

leftFrontWheel.add(leftFrontAxle);

export function createCarBody() {
    return fuselage;
}

export function initMov(modoCameraAux, inicialPosition) {
    modoCamera = modoCameraAux;
    //console.log(inicialPosition);
    fuselage.position.copy(inicialPosition);
    fuselage.position.z = 0;
    fuselage.rotateZ(degreesToRadians(90));
}


//Update das posições
export function definePosition() {

    windshield.matrixAutoUpdate = false;
    airfoil.matrixAutoUpdate = false;
    rearAxle.matrixAutoUpdate = false;
    rightRearWheel.matrixAutoUpdate = false;
    leftRearWheel.matrixAutoUpdate = false;
    frontAxle.matrixAutoUpdate = false;
    rightFrontWheel.matrixAutoUpdate = false;
    leftFrontWheel.matrixAutoUpdate = false;
    rightRearAxle.matrixAutoUpdate = false;
    leftRearAxle.matrixAutoUpdate = false;
    rightFrontAxle.matrixAutoUpdate = false;
    leftFrontAxle.matrixAutoUpdate = false;

    var mat4 = new THREE.Matrix4();


    windshield.matrix.identity();
    airfoil.matrix.identity();
    rearAxle.matrix.identity();
    rightRearWheel.matrix.identity();
    leftRearWheel.matrix.identity();
    frontAxle.matrix.identity();
    rightFrontWheel.matrix.identity();
    leftFrontWheel.matrix.identity();
    rightRearAxle.matrix.identity();
    leftRearAxle.matrix.identity();
    rightFrontAxle.matrix.identity();
    leftFrontAxle.matrix.identity();

    fuselage.translateY(speed);

    if (speed >= speedLimit * 0.05) {
        fuselage.rotateZ(angle);
    } else if (speed < -speedLimit * 0.05) {
        fuselage.rotateZ(-angle);
    }

    // Will execute T1 and then R1
    windshield.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.2)); // T1

    // Will execute T1 and then R1
    airfoil.matrix.multiply(mat4.makeTranslation(0.0, -1.2, 0.8)); // T1

    // Will execute T1 and then R1
    rearAxle.matrix.multiply(mat4.makeRotationZ(-Math.PI / 2)); // R1
    rearAxle.matrix.multiply(mat4.makeTranslation(1.0, 0.0, -0.25)); // T1

    // Will execute T1 and then R1
    rightRearWheel.matrix.multiply(mat4.makeTranslation(0, 1.0, 0.)); // T1
    rightRearWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    rightRearWheel.matrix.multiply(mat4.makeRotationZ(-speed * 50)); // R1

    // Will execute T1 and then R1
    leftRearWheel.matrix.multiply(mat4.makeTranslation(0, -1.0, 0.)); // T1
    leftRearWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    leftRearWheel.matrix.multiply(mat4.makeRotationZ(-speed * 50)); // R1

    // Will execute T1 and then R1
    frontAxle.matrix.multiply(mat4.makeRotationZ(-Math.PI / 2)); // R1
    frontAxle.matrix.multiply(mat4.makeTranslation(-1.0, 0.0, -0.25)); // T1

    // Will execute T1 and then R1
    rightFrontWheel.matrix.multiply(mat4.makeTranslation(0, 0.75, 0.)); // T1
    rightFrontWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    rightFrontWheel.matrix.multiply(mat4.makeRotationY(-angle * 10)); // R1
    rightFrontWheel.matrix.multiply(mat4.makeRotationZ(-speed * 50)); // R1

    // Will execute T1 and then R1
    leftFrontWheel.matrix.multiply(mat4.makeTranslation(0, -0.75, 0.)); // T1
    leftFrontWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    leftFrontWheel.matrix.multiply(mat4.makeRotationY(-angle * 10)); // R1
    leftFrontWheel.matrix.multiply(mat4.makeRotationZ(-speed * 50)); // R1

    // Will execute T1 and then R1
    rightRearAxle.matrix.multiply(mat4.makeTranslation(0, 0, 0)); // T1

    // Will execute T1 and then R1
    leftRearAxle.matrix.multiply(mat4.makeTranslation(0, 0, 0)); // T1

    // Will execute T1 and then R1
    rightFrontAxle.matrix.multiply(mat4.makeTranslation(0, 0, 0)); // T1

    // Will execute T1 and then R1
    leftFrontAxle.matrix.multiply(mat4.makeTranslation(0, 0, 0)); // T1

}

//Configuração do teclado
export function keyboardUpdate() {

    keyboard.update();

    if (keyboard.pressed("X")) speed = Math.min(speed + 2 * deltaSpeed, speedLimit);
    if (keyboard.pressed("down")) speed = Math.max(speed - 2 * deltaSpeed, -speedLimit);
    if (keyboard.pressed("left")) angle = Math.min(angle + deltaAngle, angleLimit);
    if (keyboard.pressed("right")) angle = Math.max(angle - deltaAngle, -angleLimit);

    if (!keyboard.pressed("X") && !keyboard.pressed("down")) {
        if (speed > 0) {
            speed = Math.max(speed - deltaSpeed, 0);
        } else if (speed < 0) {
            speed = Math.min(speed + deltaSpeed, 0);
        }
    }

    if (!keyboard.pressed("left") && !keyboard.pressed("right")) {
        if (angle > 0) {
            angle = Math.max(angle - deltaAngle, 0);
        } else if (angle < 0) {
            angle = Math.min(angle + deltaAngle, 0);
        }
    }

    if (keyboard.down("1")) {
        changeLane(1);
    } else if (keyboard.down("2")) {
        changeLane(2);
    }


    /** PENDENTE - ALTERNAR ENTRE OS MODOS */
    if (keyboard.down("space")) {
        modoCamera.simulacao = !modoCamera.simulacao;
        if (modoCamera.simulacao) { // sai do modo de inspeção e retoma parametros
            // plane.visible = true;
            // objeto.position.copy(modoInsp.posicaoAnterior);
            // camera.position.copy(modoInsp.posicaoAntCam);
            // objeto.rotation.copy(modoInsp.rotationAntObj);
            // aviao.rotation.copy(modoInsp.rotationAntAviao);
            // camera.rotation.copy(modoInsp.rotationAntCam);
            // vel = modoInsp.vel;
        } else { //entra no modo de inspeção, guarda e seta parametros
            // modoInsp.posicaoAnterior.copy(objeto.position);
            // objeto.position.copy(modoInsp.posicao);
            // modoInsp.rotationAntCam.copy(camera.rotation);
            // modoInsp.posicaoAntCam.copy(camera.position);
            // camera.rotation.copy(modoInsp.rotationCam);
            // camera.position.copy(modoInsp.posicaoCam);
            // modoInsp.rotationAntObj.copy(objeto.rotation);
            // modoInsp.rotationAntAviao.copy(aviao.rotation);
            // objeto.rotation.copy(modoInsp.rotationObj);
            // aviao.rotation.copy(modoInsp.rotationAviao);
            // modoInsp.vel = vel; // correção a ser colocada
            // vel = 0;
            // plane.visible = false;
        }
    }



    //console.log(speed);
}

//retornar em qual quadrante o carro se encontra baseado no 0,0    
function quadrantNumber() {

}