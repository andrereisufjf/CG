import * as THREE from '../build/three.module.js';
import { createGroundPlane, degreesToRadians, radiansToDegrees } from "../libs/util/util.js";
import { SecondaryBox, initRenderer, createLightSphere } from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import { changeLane, changeVisible, isOnLane, atualizarQuadrante, getInicialPosition } from "./plano.js"

import { GUI } from '../build/jsm/libs/dat.gui.module.js';

import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';

// To use the keyboard
var keyboard = new KeyboardState();

var speed = 0.0;
var deltaSpeed = 0.003;
var speedLimit = 0.50;
var speedLimitConst = speedLimit; // usado para evitar acesso e operações simultaneas em speedLimit ao controlar a saida da pista
var angle = 0.0;
var deltaAngle = degreesToRadians(0.4);
var angleLimit = degreesToRadians(4);
var scene;
var camSup, carAux;
var rotation;
var variation = 0;

//controle da camera
var modoCamera;

//camera
var camera;
let oldcameraModel = -1;
let cameraModel = 3;

//contador de time e voltas 
let timeActualTurn = -1,
    turns = 1,
    timer;
var secondBox = new SecondaryBox("Iniciando...");

//controle da aplicação de retardo
var inLane = true;
var alterSpeed = false;

//controla se o jogo está rodando
var playing = true;

//Modo Inspeção
var modoInsp = {
    posicao: new THREE.Vector3(0, 0, 0), // posição padrao de inspeção
    posicaoAnterior: new THREE.Vector3(), // posição anterior a inspeção
    rotationObj: new THREE.Euler(0, 0, 0), //rotação padrão do modo de inspeção
    rotationAntObj: new THREE.Euler(), //rotação anterior ao modo de inspeção
    rotationCam: new THREE.Euler(0.50, 0, 0),
    rotationAntCam: new THREE.Euler(),
    posicaoCam: new THREE.Vector3(0, -40, 50),
    posicaoAntCam: new THREE.Vector3(),
    cameraUp: new THREE.Vector3(0, 1, 0), // camera up padrao de inspeção
    cameraUpAnt: new THREE.Vector3(), //camera up anterior ao modo de inspeção
    cameraAuxPosition: new THREE.Vector3(),
    vel: 0,
    angle: 0,
}


var carCg = new THREE.Object3D(); //CG do carro
var carCgAxesHelper = new THREE.AxesHelper(5);
carCg.add(carCgAxesHelper);
carCgAxesHelper.visible = false;

//Fuselagem
//Base
var fuselageMaterial = new THREE.MeshPhongMaterial({ color: "grey" });
fuselageMaterial.side = THREE.DoubleSide; // Show front and back polygons

var fuselageExtrudeSettings = {
    depth: 2.5,
    bevelEnabled: false,
};

var fuselageGeometry = new THREE.ExtrudeGeometry(fuselageBaseShape(), fuselageExtrudeSettings);
fuselageGeometry.rotateZ(degreesToRadians(-90));
fuselageGeometry.rotateY(degreesToRadians(-90));

var fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
fuselage.castShadow = true;

fuselage.translateY(1.5);
fuselage.translateZ(-1.25);

carCg.add(fuselage);

//Parte Superior

var fsSupExtrudeSettings = {
    depth: 0.25,
    bevelEnabled: false,
};

//Lado Direito
var fsSupDMaterial = new THREE.MeshPhongMaterial({ color: "grey" });
fsSupDMaterial.side = THREE.DoubleSide; // Show front and back polygons

var fsSupDGeometry = new THREE.ExtrudeGeometry(fuselageSupShape(), fsSupExtrudeSettings);
fsSupDGeometry.rotateZ(degreesToRadians(-90));
fsSupDGeometry.rotateY(degreesToRadians(-90));

var fsSupD = new THREE.Mesh(fsSupDGeometry, fsSupDMaterial);
fsSupD.castShadow = true;

fuselage.add(fsSupD);

//Lado Esquerdo
var fsSupEMaterial = new THREE.MeshPhongMaterial({ color: "grey" });
fsSupEMaterial.side = THREE.DoubleSide; // Show front and back polygons

var fsSupEGeometry = new THREE.ExtrudeGeometry(fuselageSupShape(), fsSupExtrudeSettings);
fsSupEGeometry.rotateZ(degreesToRadians(-90));
fsSupEGeometry.rotateY(degreesToRadians(-90));

var fsSupE = new THREE.Mesh(fsSupEGeometry, fsSupEMaterial);
fsSupE.castShadow = true;

fsSupE.translateX(-2.25);
fuselage.add(fsSupE);

//Tampa traseira

var tampaExtrudeSettings = {
    depth: 2.0,
    bevelEnabled: false,
};

var tampaMaterial = new THREE.MeshPhongMaterial({ color: "grey" });
tampaMaterial.side = THREE.DoubleSide; // Show front and back polygons

var tampaGeometry = new THREE.ExtrudeGeometry(tampaShape(), tampaExtrudeSettings);
tampaGeometry.rotateZ(degreesToRadians(-90));
tampaGeometry.rotateY(degreesToRadians(-90));

var tampa = new THREE.Mesh(tampaGeometry, tampaMaterial);
tampa.castShadow = true;

tampa.translateX(-0.25);
fuselage.add(tampa);

//Vidros
var windowMaterial = new THREE.MeshLambertMaterial({ color: "black", transparent: true, opacity: 0.8 });
windowMaterial.side = THREE.DoubleSide; // Show front and back polygons

var windowExtrudeSettings = {
    depth: 2.5,
    bevelEnabled: false,
};

var windowGeometry = new THREE.ExtrudeGeometry(vidroShape(), windowExtrudeSettings);
windowGeometry.rotateZ(degreesToRadians(-90));
windowGeometry.rotateY(degreesToRadians(-90));

var window = new THREE.Mesh(windowGeometry, windowMaterial);
window.castShadow = true;

fuselage.add(window);

//parachoque
var parachoqueMaterial = new THREE.MeshPhongMaterial({ color: "black" });
parachoqueMaterial.side = THREE.DoubleSide; // Show front and back polygons

var parachoqueExtrudeSettings = {
    depth: 2.65,
    bevelEnabled: false,
};

var parachoqueGeometry = new THREE.ExtrudeGeometry(parachoqueShape(), parachoqueExtrudeSettings);
parachoqueGeometry.rotateX(degreesToRadians(90));
parachoqueGeometry.rotateZ(degreesToRadians(90));

var parachoque = new THREE.Mesh(parachoqueGeometry, parachoqueMaterial);
parachoque.castShadow = true;

parachoque.translateX(-2.57);
parachoque.translateY(0.06);
parachoque.translateZ(0.02);
fuselage.add(parachoque);

//Rodas traseiras
var rightRearWheelGeometry = new THREE.TorusGeometry(0.35, 0.1, 20, 20); //Roda direita do eixo traseiro
var rightRearWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var rightRearWheel = new THREE.Mesh(rightRearWheelGeometry, rightRearWheelMaterial);
carCg.add(rightRearWheel);
var rightRearAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8); //Raio da roda direita do eixo traseiro
var rightRearAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var rightRearAxle = new THREE.Mesh(rightRearAxleGeometry, rightRearAxleMaterial);
rightRearWheel.add(rightRearAxle);
var leftRearWheelGeometry = new THREE.TorusGeometry(0.35, 0.1, 20, 20); //Roda esquerda do eixo traseiro
var leftRearWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var leftRearWheel = new THREE.Mesh(rightRearWheelGeometry, rightRearWheelMaterial);
carCg.add(leftRearWheel);
var leftRearAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8); //Raio da roda esquerda do eixo traseiro
var leftRearAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var leftRearAxle = new THREE.Mesh(leftRearAxleGeometry, leftRearAxleMaterial);
leftRearWheel.add(leftRearAxle);
var rightFrontWheelGeometry = new THREE.TorusGeometry(0.35, 0.1, 20, 20); //Roda direita do eixo dianteiro
var rightFrontWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var rightFrontWheel = new THREE.Mesh(rightFrontWheelGeometry, rightFrontWheelMaterial);
carCg.add(rightFrontWheel);
var rightFrontAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8); //Raio da roda direita do eixo dianteiro
var rightFrontAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var rightFrontAxle = new THREE.Mesh(rightFrontAxleGeometry, rightFrontAxleMaterial);
rightFrontWheel.add(rightFrontAxle);
var leftFrontWheelGeometry = new THREE.TorusGeometry(0.35, 0.1, 20, 20); //Roda esquerda do eixo dianteiro
var leftFrontWheelMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('black'), });
var leftFrontWheel = new THREE.Mesh(rightFrontWheelGeometry, rightFrontWheelMaterial);
carCg.add(leftFrontWheel);
var leftFrontAxleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8); //Raio da roda esquerda do eixo tranteiro
var leftFrontAxleMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('grey'), });
var leftFrontAxle = new THREE.Mesh(leftFrontAxleGeometry, leftFrontAxleMaterial);
leftFrontWheel.add(leftFrontAxle);
carCg.castShadow = true;
const car = carCg;

// // Teapot
// var geometry = new TeapotGeometry(0.5);
// var material = new THREE.MeshPhongMaterial({ color: "rgb(255,20,20)", shininess: "200" });
// material.side = THREE.DoubleSide;
// var obj = new THREE.Mesh(geometry, material);
// obj.castShadow = true;
// obj.position.set(10, 5, 0);

export function createCarBody() {
    return carCg;
}

export function initMov(modoCameraAux, inicialPosition, cameraAux, sceneAux, camSupAux, carAuxParameter) {
    modoCamera = modoCameraAux;
    camera = cameraAux;
    carCg.position.copy(inicialPosition);
    carCg.position.z = 0;
    carCg.rotateZ(degreesToRadians(90));
    timer = setInterval(updateTime, 1000);
    scene = sceneAux;
    camSup = camSupAux;
    carAux = carAuxParameter;
    //lightSphere = createLightSphere(scene, 0.5, 10, 10, lightPosition);
    initLights();
}


//Update das posições
export function definePosition() {

    fuselage.matrixAutoUpdate = false;
    window.matrixAutoUpdate = false;
    rightRearWheel.matrixAutoUpdate = false;
    leftRearWheel.matrixAutoUpdate = false;
    rightFrontWheel.matrixAutoUpdate = false;
    leftFrontWheel.matrixAutoUpdate = false;
    rightRearAxle.matrixAutoUpdate = false;
    leftRearAxle.matrixAutoUpdate = false;
    rightFrontAxle.matrixAutoUpdate = false;
    leftFrontAxle.matrixAutoUpdate = false;

    var mat4 = new THREE.Matrix4();

    fuselage.matrix.identity();
    window.matrix.identity();
    rightRearWheel.matrix.identity();
    leftRearWheel.matrix.identity();
    rightFrontWheel.matrix.identity();
    leftFrontWheel.matrix.identity();
    rightRearAxle.matrix.identity();
    leftRearAxle.matrix.identity();
    rightFrontAxle.matrix.identity();
    leftFrontAxle.matrix.identity();

    if (modoCamera.simulacao && playing) {
        carCg.translateY(speed);

        if (speed >= speedLimit * 0.05) {
            carCg.rotateZ(angle);
        } else if (speed < -speedLimit * 0.05) {
            carCg.rotateZ(-angle);
        }
    }

    inLane = isOnLane(car.position); // verifica se o carro está na pista
    if (!inLane && !alterSpeed) { // se o carro estiver fora e o retardo não tive sido aplicado
        speedLimit = 0.5 * speedLimitConst;
        alterSpeed = true;
    } else if (inLane && alterSpeed) { //se o carro voltou pra pista é preciso restaurar o controle de retardo
        alterSpeed = false;
        speedLimit = speedLimitConst;
    }

    // Will execute T1 and then R1
    fuselage.matrix.multiply(mat4.makeTranslation(1.25, 0.0, 1.5)); // T1
    rotation = speed * 50

    // Will execute T1 and then R1
    rightRearWheel.matrix.multiply(mat4.makeTranslation(1.25, -1.40, 0.45)); // T1
    rightRearWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    rightRearWheel.matrix.multiply(mat4.makeRotationY(-Math.PI / 2)); // R1
    rightRearWheel.matrix.multiply(mat4.makeRotationZ(rotation)); // R1
    //console.log(speed);

    // Will execute T1 and then R1
    leftRearWheel.matrix.multiply(mat4.makeTranslation(-1.25, -1.40, 0.45)); // T1
    leftRearWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    leftRearWheel.matrix.multiply(mat4.makeRotationY(-Math.PI / 2)); // R1
    leftRearWheel.matrix.multiply(mat4.makeRotationZ(rotation)); // R1

    // Will execute T1 and then R1
    rightFrontWheel.matrix.multiply(mat4.makeTranslation(1.25, 1.40, 0.45)); // T1
    rightFrontWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    rightFrontWheel.matrix.multiply(mat4.makeRotationY(-Math.PI / 2)); // R1
    rightFrontWheel.matrix.multiply(mat4.makeRotationY(-angle * 10)); // R1
    rightFrontWheel.matrix.multiply(mat4.makeRotationZ(rotation)); // R1

    // Will execute T1 and then R1
    leftFrontWheel.matrix.multiply(mat4.makeTranslation(-1.25, 1.40, 0.45)); // T1
    leftFrontWheel.matrix.multiply(mat4.makeRotationX(-Math.PI / 2)); // R1
    leftFrontWheel.matrix.multiply(mat4.makeRotationY(-Math.PI / 2)); // R1
    leftFrontWheel.matrix.multiply(mat4.makeRotationY(-angle * 10)); // R1
    leftFrontWheel.matrix.multiply(mat4.makeRotationZ(rotation)); // R1
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


    if (modoCamera.simulacao) { // CONTROLE JOGO 

        if (playing) {
            atualizarQuadrante(car.position.x, car.position.y);

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
                changeLane(1, scene);
                carInicialParameters();
            } else if (keyboard.down("2")) {
                changeLane(2, scene);
                carInicialParameters();
            } else if (keyboard.down("3")) {
                changeLane(3, scene);
                carInicialParameters();
            } else if (keyboard.down("4")) {
                changeLane(4, scene);
                carInicialParameters();
            } else if (keyboard.down("5")) { // TESTAR AUMENTAR AS VOLTAS
                updateTurn();
            }

            //atualiza a velocidade
            speedometer.changeText("Velocidade: " + (20 * speed).toFixed(1) + "m/s");
        } else {
            speed = 0;
        }
    } else { // CONTROLE NO MODO DE SIMULAÇÃO
        //xspeed = 0.0;
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
    }

    if (keyboard.down("space")) {
        modoCamera.simulacao = !modoCamera.simulacao;
        if (modoCamera.simulacao) { // sai do modo de inspeção e retoma parametros

            if (playing) {
                secondBox.changeMessage(time.stringify());
                timer = setInterval(updateTime, 1000); // volta o cronometro
            } else {
                secondBox.changeMessage("FIM DE JOGO! Tempo total: " + time.stringifyTime());
            }

            restoreParameters();
            changeVisible(true, scene);
            secondBox.visible = false;
        } else { //entra no modo de inspeção, guarda e seta parametros
            saveParameters();
            clearInterval(timer); // para o cronometro
            changeVisible(false);
            secondBox.changeMessage("MODO DE INSPEÇÃO");
            speedometer.changeText("MODO DE INSPEÇÃO");
        }
    }


    // //TESTE LUZ
    // if (keyboard.pressed("D")) {
    //     lightPosition.x += 0.05;
    //     updateLightPosition(lightPosition);
    // }
    // if (keyboard.pressed("A")) {
    //     lightPosition.x -= 0.05;
    //     updateLightPosition(lightPosition);
    // }
    // if (keyboard.pressed("W")) {
    //     lightPosition.y += 0.05;
    //     updateLightPosition(lightPosition);
    // }
    // if (keyboard.pressed("S")) {
    //     lightPosition.y -= 0.05;
    //     updateLightPosition(lightPosition);
    // }
    // if (keyboard.pressed("E")) {
    //     lightPosition.z -= 0.05;
    //     updateLightPosition(lightPosition);
    // }
    // if (keyboard.pressed("Q")) {
    //     lightPosition.z += 0.05;
    //     updateLightPosition(lightPosition);
    // }


}

//seta a pposição da camera baseado no quadrante atual

function carInicialParameters() {
    speed = 0;
    angle = 0;
    carCg.position.copy(getInicialPosition());
    //carCg.rotateZ(degreesToRadians(90));
    turns = 1;
    time.reset();
    //FALTA ARRUMAR A ROTAÇÃO
}

//Traslação da camera de acordo com o movimento do carro
export function defineCamPosition() {
    if (modoCamera.simulacao) { //
        camera.matrixAutoUpdate = false;
        var mat4Cam = new THREE.Matrix4();
        camera.matrix.identity();
        // Will execute T1 and then R1
        if (modoCamera.simulacao) {
            camera.matrix.multiply(mat4Cam.makeRotationZ(degreesToRadians(50))); // R1
            camera.matrix.multiply(mat4Cam.makeRotationX(degreesToRadians(50))); // R1
        }
        var cwd = new THREE.Vector3();
        carAux.getWorldPosition(cwd);
        camSup.position.set(cwd.x + 30, cwd.y - 30, cwd.z + 30);
        //TESTE LUZ
        let lightPositionaAux = new THREE.Vector3(cwd.x + 10, cwd.y - 4, cwd.z + 6.5);
        updateLightPosition(lightPositionaAux);
        //updateLightPosition(lightPosition);
        //console.log(lightPosition)
        //console.log(cwd);
    } else {
        camera.matrixAutoUpdate = true;
        //TESTE LUZ
        updateLightPosition(camera.position);
    }



}

//salva os parametros ao entrar no modo de insperação e seta os valores padrões
function saveParameters() {
    modoInsp.posicaoAnterior.copy(car.position);
    car.position.copy(modoInsp.posicao);
    modoInsp.rotationAntObj.copy(car.rotation);
    car.rotation.copy(modoInsp.rotationObj);

    //camera
    modoInsp.rotationAntCam.copy(camera.rotation);
    modoInsp.posicaoAntCam.copy(camera.position);
    modoInsp.cameraUpAnt.copy(camera.up);
    camera.position.copy(modoInsp.posicaoCam);
    camera.rotation.copy(modoInsp.rotationCam);
    camera.up.copy(modoInsp.cameraUp);
    car.rotation.copy(modoInsp.rotationObj);
    modoInsp.vel = speed; // correção a ser colocada
    speed = 0;
    modoInsp.angle = angle;
    angle = 0;
    camSup.position.copy(modoInsp.cameraAuxPosition);

    lightArray[activeLight].visible = false;
    activeLight = 0; // SPOT
    lightArray[activeLight].visible = true;
    ambientLight.visible = false; //desativa a luz ambiente
}

//restaura os parametros ao sair do modo de insperação
function restoreParameters() {
    modoInsp.posicaoCam.copy(camera.position);
    modoInsp.rotationCam.copy(camera.rotation);
    modoInsp.cameraUp.copy(camera.up);
    car.position.copy(modoInsp.posicaoAnterior);
    camera.position.copy(modoInsp.posicaoAntCam);
    camera.up.copy(modoInsp.cameraUpAnt);
    car.rotation.copy(modoInsp.rotationAntObj);
    camera.rotation.copy(modoInsp.rotationAntCam);
    speed = modoInsp.vel;
    angle = modoInsp.angle;

    lightArray[activeLight].visible = false;
    activeLight = 1; // DIRECIONAL
    lightArray[activeLight].visible = true;
    ambientLight.visible = true; // ativa a luz ambiente
}


// CONTROLE DE TEMPO E VELOCIDADE
class InfoBox {
    constructor() {
        this.infoBox = document.createElement('div');
        this.infoBox.id = "InfoxBox";
        this.infoBox.style.padding = "6px 14px";
        this.infoBox.style.position = "fixed";
        this.infoBox.style.bottom = "0";
        this.infoBox.style.right = "0";
        this.infoBox.style.backgroundColor = "rgba(255,255,255,0.2)";
        this.infoBox.style.color = "white";
        this.infoBox.style.fontFamily = "sans-serif";
        this.infoBox.style.userSelect = "none";
        this.infoBox.style.textAlign = "left";
        var textnode;
    }

    changeText(text) {
        this.textnode.nodeValue = text;
    }

    add(text) {
        this.textnode = document.createTextNode(text);
        this.infoBox.appendChild(this.textnode);
    }

    show() {
        document.body.appendChild(this.infoBox);
    }
}

var speedometer = new InfoBox();
speedometer.add("Velocidade: " + speed + "m/s");
speedometer.show();

var time = {
    minute: 0,
    second: -1,

    minuteActual: 0,
    secondActual: -1,

    best: "~~:~~",

    updateTime: function() { // Método que ira mostrar o tipo de Animal
        if ((this.second += 1) == 60) {
            this.second = 0;
            this.minute++;
        }

        if ((this.secondActual += 1) == 60) {
            this.secondActual = 0;
            this.minuteActual++;
        }
    },

    stringifyTime: function() { // retorna o tempo total 
        return padL(this.minute) + ":" + padL(this.second);
    },

    stringify: function() { // retorna as métricas gerais (durante o jogo)
        return "Tempo Total: " + padL(this.minute) + ":" + padL(this.second) + " || " + "Volta Atual: " + padL(this.minuteActual) + ":" + padL(this.secondActual) + " || Melhor Volta: " + this.best + " || Voltas: " + turns;
    },

    updateTurn: function() { // atualiza as variáveis de voltas

        let actual = padL(this.minuteActual) + ":" + padL(this.secondActual);
        if ((actual) < this.best)
            this.best = actual;
        this.secondActual = 0;
        this.minuteActual = 0;
    },

    reset: function() {
        this.minute = 0;
        this.second = -1;
        this.minuteActual = 0;
        this.secondActual = -1;
        this.best = "~~:~~";
    }
}

//gera o 0 a esquerda, se necessário, por padrão retorna tamanho 2 completado com 0
function padL(a, b = 2, c = '0') { //string/number, length, char
    return (new Array(b).join(c) + a).slice(-b)
}


function updateTime() {
    time.updateTime();
    timeActualTurn++;
    secondBox.changeMessage(time.stringify());
}

export function updateTurn() {
    timeActualTurn = 0;
    time.updateTurn();
    turns++;
    if (turns > 4) {
        speed = 0;
        clearInterval(timer);
        secondBox.changeMessage("FIM DE JOGO! Tempo total: " + time.stringifyTime());
        playing = false;
        speed = 0;
    }

}

export function getTurn() {
    return turns;
}

//Contorno da fuselagem
function tampaShape() {
    var tampaShape = new THREE.Shape();
    tampaShape.moveTo(-1.0, 0.8);
    tampaShape.lineTo(2.5, 0.0);
    tampaShape.lineTo(-1.0, 0.72);

    return tampaShape;
}

function fuselageSupShape() {
    var fuseSupShape = new THREE.Shape();
    fuseSupShape.moveTo(-2.5, 0.0);
    fuseSupShape.lineTo(-1.0, 0.8);
    fuseSupShape.lineTo(2.5, 0.0);

    //Contorno do buraco das janelas
    let windowsPath = new THREE.Path();
    windowsPath.moveTo(-2.4, 0.0);
    windowsPath.lineTo(-1.0, 0.72);
    windowsPath.lineTo(1.5, 0.2);
    windowsPath.lineTo(1.5, 0.0);
    fuseSupShape.holes.push(windowsPath);
    return fuseSupShape;
}

function fuselageBaseShape() {
    //Contorno da Fuselagem
    var fuseBaseShape = new THREE.Shape();
    fuseBaseShape.moveTo(-2.5, 0.0);
    fuseBaseShape.lineTo(2.5, 0);
    fuseBaseShape.lineTo(2.5, -1);
    fuseBaseShape.lineTo(1.9, -1.0);
    fuseBaseShape.lineTo(1.8, -0.8);
    fuseBaseShape.lineTo(1.7, -0.7);
    fuseBaseShape.lineTo(1.6, -0.6);
    fuseBaseShape.lineTo(1.3, -0.6);
    fuseBaseShape.lineTo(1.1, -0.7);
    fuseBaseShape.lineTo(1.0, -0.8);
    fuseBaseShape.lineTo(0.9, -1.0);
    fuseBaseShape.lineTo(-1.0, -1.0);
    fuseBaseShape.lineTo(-1.1, -0.8);
    fuseBaseShape.lineTo(-1.2, -0.7);
    fuseBaseShape.lineTo(-1.3, -0.6);
    fuseBaseShape.lineTo(-1.6, -0.6);
    fuseBaseShape.lineTo(-1.8, -0.7);
    fuseBaseShape.lineTo(-1.9, -0.8);
    fuseBaseShape.lineTo(-2.0, -1.0);
    fuseBaseShape.lineTo(-2.5, -1.0);

    return fuseBaseShape;
}

function parachoqueShape() {
    //Contorno da Fuselagem
    var fuseBaseShape = new THREE.Shape();
    fuseBaseShape.moveTo(2.6, -0.8);
    fuseBaseShape.lineTo(2.6, -1);
    fuseBaseShape.lineTo(1.9, -1.0);
    fuseBaseShape.lineTo(1.8, -0.8);
    fuseBaseShape.lineTo(1.7, -0.7);
    fuseBaseShape.lineTo(1.6, -0.6);
    fuseBaseShape.lineTo(1.3, -0.6);
    fuseBaseShape.lineTo(1.1, -0.7);
    fuseBaseShape.lineTo(1.0, -0.8);
    fuseBaseShape.lineTo(0.9, -1.0);
    fuseBaseShape.lineTo(-1.0, -1.0);
    fuseBaseShape.lineTo(-1.1, -0.8);
    fuseBaseShape.lineTo(-1.2, -0.7);
    fuseBaseShape.lineTo(-1.3, -0.6);
    fuseBaseShape.lineTo(-1.6, -0.6);
    fuseBaseShape.lineTo(-1.8, -0.7);
    fuseBaseShape.lineTo(-1.9, -0.8);
    fuseBaseShape.lineTo(-2.0, -1.0);
    fuseBaseShape.lineTo(-2.6, -1.0);
    fuseBaseShape.lineTo(-2.6, -0.8);
    fuseBaseShape.lineTo(-2.2, -0.8);
    fuseBaseShape.lineTo(-1.9, -0.4);
    fuseBaseShape.lineTo(-1.0, -0.4);
    fuseBaseShape.lineTo(-0.8, -0.8);
    fuseBaseShape.lineTo(0.7, -0.8);
    fuseBaseShape.lineTo(1.0, -0.4);
    fuseBaseShape.lineTo(1.9, -0.4);
    fuseBaseShape.lineTo(2.1, -0.8);

    return fuseBaseShape;
}

function windshieldShape() {
    var wsShape = new THREE.Shape();
    wsShape.moveTo(-2.5, 0.0);
    wsShape.lineTo(-1.0, 0.8);
    wsShape.lineTo(-1.0, 0.79);
    wsShape.lineTo(-2.5, -0.01);

    return wsShape;
}

function vidroShape() {
    var fuseShape = new THREE.Shape();
    fuseShape.moveTo(-2.4, 0.0)
    fuseShape.lineTo(-1.0, 0.72);
    fuseShape.lineTo(1.5, 0.2);
    fuseShape.lineTo(1.5, 0.0);

    return fuseShape;
}



// TESTE ILUMINAÇÃO

//NORMAL - DIRECIONAL
// INSP - spotlight

// Control available light and set the active light
var lightArray = new Array();
var activeLight = 1; // View first Light
var lightIntensity = 1.0;

//---------------------------------------------------------
// Default light position, color, ambient color and intensity
var lightPosition = new THREE.Vector3(45, 5, 0);
var lightColor = "rgb(255,255,255)";
var ambientColor = "rgb(50,50,50)";

// Sphere to represent the light
var lightSphere; // = createLightSphere(scene, 0.05, 10, 10, lightPosition);

//---------------------------------------------------------
// Create and set all lights. Only Spot and ambient will be visible at first
var spotLight = new THREE.SpotLight(lightColor, 1.1);


// var pointLight = new THREE.PointLight(lightColor);
// setPointLight(lightPosition);

var dirLight = new THREE.DirectionalLight(lightColor, 0.15);


//CRIAÇÃO DA LUZ AMBIENTE
// More info here: https://threejs.org/docs/#api/en/lights/AmbientLight
var ambientLight = new THREE.AmbientLight(ambientColor, 0.55);


function initLights() {
    setSpotLight(lightPosition);
    setDirectionalLighting(lightPosition);
    scene.add(ambientLight);
    lightArray[activeLight].visible = true;

    //TESTE SOMBRA
    //buildInterface();
    //scene.add(obj);
}

// Set Spotlight
// More info here: https://threejs.org/docs/#api/en/lights/SpotLight
function setSpotLight(position) {
    spotLight.position.copy(position);
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.angle = degreesToRadians(40);
    spotLight.castShadow = true;
    spotLight.decay = 2;
    spotLight.penumbra = 0.5;
    spotLight.name = "Spot Light"
    spotLight.visible = false;

    scene.add(spotLight);
    lightArray.push(spotLight);
}

// Set Directional Light
// More info here: https://threejs.org/docs/#api/en/lights/DirectionalLight
function setDirectionalLighting(position) {
    dirLight.position.copy(position);
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.castShadow = true;

    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    dirLight.name = "Direction Light";
    dirLight.visible = false;

    scene.add(dirLight);
    lightArray.push(dirLight);
}

// Update light position of the current light
function updateLightPosition(position) {
    lightArray[activeLight].target = carCg;
    lightArray[activeLight].position.copy(position);

    //lightSphere.position.copy(position);
    //console.log(activeLight, lightArray[activeLight].position, lightSphere.position)
}


//TESTE PARAMETROS

// Update light intensity of the current light
// function updateLightIntensity() {
//     lightArray[activeLight].intensity = lightIntensity;
// }

// function buildInterface() {
//     //------------------------------------------------------------
//     // Interface
//     var controls = new function() {
//         this.lightIntensity = lightIntensity;
//         this.lightType = 'Spot'
//         this.ambientLight = true;

//         this.onEnableAmbientLight = function() {
//             ambientLight.visible = this.ambientLight;
//         };
//         this.onUpdateLightIntensity = function() {
//             lightIntensity = this.lightIntensity;
//             updateLightIntensity();
//         };
//         this.onChangeLight = function() {
//             lightArray[activeLight].visible = false;
//             switch (this.lightType) {
//                 case 'Spot':
//                     activeLight = 0;
//                     break;
//                 case 'Direction':
//                     activeLight = 1;
//                     break;
//             }
//             lightArray[activeLight].visible = true;
//             //updateLightPosition();
//             updateLightIntensity();
//         };
//     };

//     var gui = new GUI();
//     gui.add(controls, 'lightType', ['Spot', 'Direction'])
//         .name("Light Type")
//         .onChange(function(e) { controls.onChangeLight(); });
//     gui.add(controls, 'lightIntensity', 0, 5)
//         .name("Light Intensity")
//         .onChange(function(e) { controls.onUpdateLightIntensity() });
//     gui.add(controls, 'ambientLight', true)
//         .name("Ambient Light")
//         .onChange(function(e) { controls.onEnableAmbientLight() });
// }