import * as THREE from '../build/three.module.js';
import { degreesToRadians } from "../libs/util/util.js";
import { SecondaryBox, initRenderer } from "../libs/util/util.js";

import KeyboardState from '../libs/util/KeyboardState.js';
import { changeLane, changeVisible, isOnLane, atualizarQuadrante } from "./plano.js"


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
    vel: 0,
    angle: 0,
}


//Fuselagem
var fuselageGeometry = new THREE.ConeGeometry(1.0, 3.0, 3, 3);
var fuselageMaterial = new THREE.MeshPhongMaterial({ color: new THREE.Color('yellow'), });
var fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
fuselage.translateZ(0.6);

var fuselageAxesHelper = new THREE.AxesHelper(5);
fuselage.add(fuselageAxesHelper);
fuselageAxesHelper.visible = false;

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

const car = fuselage;


export function createCarBody() {
    return fuselage;
}

export function initMov(modoCameraAux, inicialPosition, cameraAux, sceneAux) {
    modoCamera = modoCameraAux;
    camera = cameraAux;
    fuselage.position.copy(inicialPosition);
    fuselage.position.z = 0;
    fuselage.rotateZ(degreesToRadians(90));
    camera.rotateZ(degreesToRadians(90));
    timer = setInterval(updateTime, 1000);
    fuselage.add(cameraAux);
    scene = sceneAux;
}


//Update das posições
export function definePosition() {

    if (modoCamera.simulacao) {
        //TESTES
        camera.matrixAutoUpdate = false;
    } else {
        camera.matrixAutoUpdate = true;
    }

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
    camera.matrix.identity();

    fuselage.translateY(speed);

    inLane = isOnLane(car.position); // verifica se o carro está na pista
    if (!inLane && !alterSpeed) { // se o carro estiver fora e o retardo não tive sido aplicado
        speedLimit = 0.5 * speedLimitConst;
        alterSpeed = true;
    } else if (inLane && alterSpeed) { //se o carro voltou pra pista é preciso restaurar o controle de retardo
        alterSpeed = false;
        speedLimit = speedLimitConst;
    }

    if (speed >= speedLimit * 0.05) {
        fuselage.rotateZ(angle);
    } else if (speed < -speedLimit * 0.05) {
        fuselage.rotateZ(-angle);
    }

    // Will execute T1 and then R1
    windshield.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.2)); // T1

    // Will execute T1 and then R1
    if (modoCamera.simulacao) {
        camera.matrix.multiply(mat4.makeRotationY(-(degreesToRadians(60)))); // R1
        camera.matrix.multiply(mat4.makeRotationZ(-(degreesToRadians(90)))); // R1
        camera.matrix.multiply(mat4.makeRotationX(-(degreesToRadians(15)))); // R1
        camera.matrix.multiply(mat4.makeTranslation(-30, 0, 70)); // T1
    }

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

    if (modoCamera.simulacao && playing) {

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
        } else if (keyboard.down("2")) {
            changeLane(2, scene);
        } else if (keyboard.down("3")) {
            changeLane(3, scene);
        } else if (keyboard.down("4")) {
            changeLane(4, scene);
        } else if (keyboard.down("5")) { // TESTAR AUMENTAR AS VOLTAS
            updateTurn();
        }

        //atualiza a velocidade
        speedometer.changeText("Velocidade: " + (20 * speed).toFixed(1) + "m/s");
        cameraMovement();

    } else {
        speed = 0.0;
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
            changeVisible(true);
            secondBox.visible = false;
        } else { //entra no modo de inspeção, guarda e seta parametros
            saveParameters();
            changeVisible(false);
            clearInterval(timer); // para o cronometro
            secondBox.changeMessage("MODO DE INSPEÇÃO");
            speedometer.changeText("MODO DE INSPEÇÃO");
        }
    }

}

//seta a pposição da camera baseado no quadrante atual

const cameraConfiguration = {
    "1": {
        "position": "",
        "outra": "",
        "outra": ""
    },
}

export function cameraMovement() {

    camera.translateZ(-speed);

    // if (speed >= speedLimit * 0.05) {
    //     camera.rotateY(angle);
    // } else if (speed < -speedLimit * 0.05) {
    //     camera.rotateY(-angle);
    // }



    //console.log(radians_to_degrees(car.rotation.z));
    //setCamera(cameraModel)
    //console.log("Quad:" + cameraModel)
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function setCamera(quadrantNumber) {
    let configuration = cameraConfiguration[quadrantNumber];
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
}

//restaura os parametros ao sair do modo de insperação
function restoreParameters() {
    car.position.copy(modoInsp.posicaoAnterior);
    camera.position.copy(modoInsp.posicaoAntCam);
    camera.up.copy(modoInsp.cameraUpAnt);
    car.rotation.copy(modoInsp.rotationAntObj);
    camera.rotation.copy(modoInsp.rotationAntCam);
    speed = modoInsp.vel;
    angle = modoInsp.angle;
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
//speedometer.changeText("Ok");

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
        //return padL(this.minute) + ":" + padL(this.second);
    },

    updateTurn: function() { // atualiza as variáveis de voltas

        let actual = padL(this.minuteActual) + ":" + padL(this.secondActual);
        if ((actual) < this.best)
            this.best = actual;
        //console.log(actual < this.best);
        this.secondActual = 0;
        this.minuteActual = 0;
    },
}


//gera o 0 a esquerda, se necessário, por padrão retorna tamanho 2 completado com 0
function padL(a, b = 2, c = '0') { //string/number, length, char
    return (new Array(b).join(c) + a).slice(-b)
}


function updateTime() {
    time.updateTime();
    //time++;
    timeActualTurn++;
    secondBox.changeMessage(time.stringify());
    //secondBox.changeMessage("Volta Atual: " + timeActualTurn + "s || " + "Tempo: " + time + "s || Voltas: " + turns);
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
    }
}

export function getTurn() {
    return turns;
}