import * as THREE from '../build/three.module.js';
import { createGroundPlane, degreesToRadians, radiansToDegrees } from "../libs/util/util.js";
import { SecondaryBox, initRenderer, createLightSphere } from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';
import { changeLane, changeVisible, isOnLane, atualizarQuadrante, getInicialPosition, objectsBox } from "./plano.js"

import { GUI } from '../build/jsm/libs/dat.gui.module.js';

import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';

// To use the keyboard
var keyboard = new KeyboardState();

var speed = 0.0;
var deltaSpeed = 0.003;
var speedLimit = 0.50;
var speedLimitConst = speedLimit; // usado para evitar acesso e operações simultaneas em speedLimit ao controlar a saida da pista
var speedLimitWithColision = 0.1 * speedLimitConst;
var speedLimitOutSideLane = 0.5 * speedLimitConst;
var angle = 0.0;
var deltaAngle = degreesToRadians(0.4);
var angleLimit = degreesToRadians(4);
var scene;
var camSup, carAux;
var rotation;
var variation = 0;
var cameraHeSheIt;
var deltaMovCam = {
    "x": 15,
    "y": -15,
    "z": 15,
    "rotX": 50,
    "rotZ": 50,

    // teste modo he/she/it
    // "x": 25,
    // "y": 0,
    // "z": 5,
    // "rotX": 80,
    // "rotZ": 90,

    reset: function() { // retorna o tempo total 
        this.x = this.y = this.z = 15;
        this.y *= -1;
        this.rotX = this.rotZ = 50;
    },

    set: function(x, y, z, rotX, rotZ) { // retorna o tempo total 
        this.x = x;
        this.y = y;
        this.z = z;
        this.rotX = rotX;
        this.rotZ = rotZ;
    },
};
var camMode = 1;


//joyStick
var joyStickMode = false;
import { Buttons } from "../libs/other/buttons.js";
var buttons = new Buttons(onButtonDown, onButtonUp);
var lastTime = 0;

// actions - JSON
var actions = {};
actions.exchange = false;
// Fim Joy

//controle da camera
var modoCamera;

//camera
var camera;
export var cameraHeSheItActived = false;
let oldcameraModel = -1;
let cameraModel = 3;

//contador de time e voltas 
let timeActualTurn = -1,
    turns = 1,
    timer;
var secondBox;

//controle da aplicação de retardo
var inLane = true;
var alterSpeed = false;
var alterColisionSpeed = false;

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
carCgAxesHelper.visible = false;
//carCg.add(carCgAxesHelper);


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
fuselage.translateY(0.0);
fuselage.translateZ(1.55);
fuselage.translateX(1.25);

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

//back

var backExtrudeSettings = {
    depth: 2.0,
    bevelEnabled: false,
};

var backMaterial = new THREE.MeshPhongMaterial({ color: "grey" });
backMaterial.side = THREE.DoubleSide; // Show front and back polygons

var backGeometry = new THREE.ExtrudeGeometry(backShape(), backExtrudeSettings);
backGeometry.rotateZ(degreesToRadians(-90));
backGeometry.rotateY(degreesToRadians(-90));

var back = new THREE.Mesh(backGeometry, backMaterial);
back.castShadow = true;

back.translateX(-0.25);
fuselage.add(back);

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
parachoque.translateY(0.80);
parachoque.translateZ(0.05);
fuselage.add(parachoque);

//Rodas
var tireExtrudeSettings = {
    depth: 0.3,
    bevelEnabled: false,
};
var rimExtrudeSettings = {
    depth: 0.05,
    bevelEnabled: false,
};

//led Dianteiro
var ledDianteiroMaterial = new THREE.MeshPhongMaterial({ color: "white" });
ledDianteiroMaterial.side = THREE.DoubleSide; // Show front and back polygons

var ledDianteiroExtrudeSettings = {
    depth: 2.65,
    bevelEnabledDianteiro: false,
};

var ledDianteiroGeometry = new THREE.ExtrudeGeometry(ledDianteiroShape(), fuselageExtrudeSettings);
var ledDianteiro = new THREE.Mesh(ledDianteiroGeometry, ledDianteiroMaterial);
ledDianteiro.castShadow = true;

ledDianteiroGeometry.rotateZ(degreesToRadians(-90));
ledDianteiroGeometry.rotateY(degreesToRadians(-90));
ledDianteiro.translateZ(-0.40);

fuselage.add(ledDianteiro);

//led Traseiro
var ledTraseiro = new THREE.Mesh(ledTraseiroGeometry, ledTraseiroMaterial);
var ledTraseiroMaterial = new THREE.MeshPhongMaterial({ color: "red" });
ledTraseiroMaterial.side = THREE.DoubleSide; // Show front and back polygons

var ledTraseiroExtrudeSettings = {
    depth: 2.65,
    bevelEnabledTraseiro: false,
};

var ledTraseiroGeometry = new THREE.ExtrudeGeometry(ledTraseiroShape(), fuselageExtrudeSettings);
ledTraseiro.castShadow = true;

ledTraseiroGeometry.rotateZ(degreesToRadians(-90));
ledTraseiroGeometry.rotateY(degreesToRadians(-90));

fuselage.add(ledTraseiro);

//Rodas



// Roda traseira direita
var wheelRR = new THREE.Object3D();
var rightRearTireGeometry = new THREE.ExtrudeGeometry(tireShape(), tireExtrudeSettings);
var rightRearTireMaterial = new THREE.MeshPhongMaterial({ color: "black" });
var rightRearTire = new THREE.Mesh(rightRearTireGeometry, rightRearTireMaterial);
carCg.add(rightRearTire);
var rightRearRimGeometry = new THREE.CircleGeometry(0.3, 100);
var rightRearRimMaterial = new THREE.MeshPhongMaterial();
var rightRearRim = new THREE.Mesh(rightRearRimGeometry, rightRearRimMaterial);
rightRearRimMaterial.side = THREE.DoubleSide;
wheelRR.position.set(1.25, -1.40, 0.45)
wheelRR.rotateY(degreesToRadians(-90))
wheelRR.add(rightRearTire);
wheelRR.add(rightRearRim);
carCg.add(wheelRR);

// Roda traseira esquerda raio 0.3
var wheelLR = new THREE.Object3D();
var leftRearTireGeometry = new THREE.ExtrudeGeometry(tireShape(), tireExtrudeSettings);
var leftRearTireMaterial = new THREE.MeshPhongMaterial({ color: "black" });
var leftRearTire = new THREE.Mesh(rightRearTireGeometry, rightRearTireMaterial);
var leftRearRimGeometry = new THREE.CircleGeometry(0.3, 100);
var leftRearRimMaterial = new THREE.MeshPhongMaterial();
leftRearRimMaterial.side = THREE.DoubleSide;
var leftRearRim = new THREE.Mesh(leftRearRimGeometry, leftRearRimMaterial);
wheelLR.position.set(-1.25, -1.40, 0.45)
wheelLR.rotateY(degreesToRadians(90))
wheelLR.add(leftRearTire);
wheelLR.add(leftRearRim);
carCg.add(wheelLR);

//Roda dianteira Direita
var turnAuxFR = new THREE.Object3D();
var wheelFR = new THREE.Object3D();
var rightFrontTireGeometry = new THREE.ExtrudeGeometry(tireShape(), tireExtrudeSettings);
rightFrontTireGeometry.rotateZ(degreesToRadians(90));
var rightFrontTireMaterial = new THREE.MeshPhongMaterial({ color: "black" });
var rightFrontTire = new THREE.Mesh(rightFrontTireGeometry, rightFrontTireMaterial);
carCg.add(rightFrontTire);
var rightFrontRimGeometry = new THREE.CircleGeometry(0.3, 100);
var rightFrontRimMaterial = new THREE.MeshPhongMaterial();
var rightFrontRim = new THREE.Mesh(rightFrontRimGeometry, rightFrontRimMaterial);
rightFrontRimMaterial.side = THREE.DoubleSide;
turnAuxFR.add(wheelFR);
wheelFR.rotateY(degreesToRadians(-90));
wheelFR.add(rightFrontTire);
wheelFR.add(rightFrontRim);
carCg.add(turnAuxFR);

//Roda dianteira esquerda
var turnAuxFL = new THREE.Object3D();
var wheelFL = new THREE.Object3D();
var leftFrontTireGeometry = new THREE.ExtrudeGeometry(tireShape(), tireExtrudeSettings);
leftFrontTireGeometry.rotateZ(degreesToRadians(90));
var leftFrontTireMaterial = new THREE.MeshPhongMaterial({ color: "black" });
var leftFrontTire = new THREE.Mesh(rightFrontTireGeometry, rightFrontTireMaterial);
carCg.add(leftFrontTire);
var leftFrontRimGeometry = new THREE.CircleGeometry(0.3, 100);
var leftFrontRimMaterial = new THREE.MeshPhongMaterial();
var leftFrontRim = new THREE.Mesh(leftFrontRimGeometry, leftFrontRimMaterial);
leftFrontRimMaterial.side = THREE.DoubleSide;
turnAuxFL.add(wheelFL);
wheelFL.rotateY(degreesToRadians(90));
wheelFL.add(leftFrontTire);
wheelFL.add(leftFrontRim);
carCg.add(turnAuxFL);

createTextures();

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

function createTextures() {
    //Texturas Back Prof: 2.0
    var textureLoader = new THREE.TextureLoader();
    var rimTexture = textureLoader.load('./textures/rim.jpg');
    var backTexture = textureLoader.load('./textures/persiana.jpg');
    var plateTexture = textureLoader.load('./textures/plate.jpg');

    // Roda traseira esquerda
    var backPlaneTextureGeometry = new THREE.PlaneGeometry(3.0, 2.0)
    var backPlaneTextureMaterial = new THREE.MeshPhongMaterial({ map: backTexture });
    var backPlaneTexture = new THREE.Mesh(backPlaneTextureGeometry, backPlaneTextureMaterial);
    backPlaneTexture.rotation.z = degreesToRadians(90)
    backPlaneTexture.rotation.x = degreesToRadians(13)
    backPlaneTexture.position.set(-1.0, -1.00, 0.35)
    back.add(backPlaneTexture);

    leftRearRimMaterial.map = rimTexture;
    leftFrontRimMaterial.map = rimTexture;
    rightRearRimMaterial.map = rimTexture;
    rightFrontRimMaterial.map = rimTexture;

    //Placa dianteira
    var frontPlateTextureGeometry = new THREE.PlaneGeometry(0.9, 0.3)
    var frontPlateTextureMaterial = new THREE.MeshPhongMaterial({ map: plateTexture });
    frontPlateTextureMaterial.side = THREE.DoubleSide;
    var frontPlateTexture = new THREE.Mesh(frontPlateTextureGeometry, frontPlateTextureMaterial);
    frontPlateTexture.rotation.x = degreesToRadians(-90)
    frontPlateTexture.rotation.z = degreesToRadians(180)
    frontPlateTexture.position.set(1.25, 2.62, -0.9)
    parachoque.add(frontPlateTexture);

    //Placa dianteira
    var rearPlateTextureGeometry = new THREE.PlaneGeometry(0.9, 0.3)
    var rearPlateTextureMaterial = new THREE.MeshPhongMaterial({ map: plateTexture });
    rearPlateTextureMaterial.side = THREE.DoubleSide;
    var rearPlateTexture = new THREE.Mesh(rearPlateTextureGeometry, rearPlateTextureMaterial);
    rearPlateTexture.rotation.x = degreesToRadians(90)
    rearPlateTexture.position.set(1.25, -3.42, -0.9)
    parachoque.add(rearPlateTexture);




}

export function initMov(modoCameraAux, inicialPosition, cameraAux, sceneAux, camSupAux, carAuxParameter, cameraHeSheItAux) {
    // inicia infos de tela
    secondBox = new SecondaryBox("Iniciando...");
    speedometer.show();

    //inicia módulo
    modoCamera = modoCameraAux;
    camera = cameraAux;
    carCg.position.copy(inicialPosition);
    carCg.position.z = 0;
    carCg.rotateZ(degreesToRadians(90));
    timer = setInterval(updateTime, 1000);
    scene = sceneAux;
    camSup = camSupAux;
    carAux = carAuxParameter;
    cameraHeSheIt = cameraHeSheItAux;
    //lightSphere = createLightSphere(scene, 0.5, 10, 10, lightPosition);
    initLights();

}


//Update das posições
export function definePosition() {

    turnAuxFL.matrixAutoUpdate = false;
    turnAuxFR.matrixAutoUpdate = false;
    rightFrontTire.matrixAutoUpdate = false;
    leftFrontTire.matrixAutoUpdate = false;

    var mat4 = new THREE.Matrix4();

    turnAuxFL.matrix.identity();
    turnAuxFR.matrix.identity();
    rightFrontTire.matrix.identity();
    leftFrontTire.matrix.identity();

    if (modoCamera && modoCamera.simulacao && playing) {
        carCg.translateY(speed);

        if (speed >= speedLimit * 0.05) {
            carCg.rotateZ(angle);
            //camSup.rotateZ(angle / 100);
        } else if (speed < -speedLimit * 0.05) {
            carCg.rotateZ(-angle);
            // cameraHeSheIt.rotateY(angle / 3);
            //camSup.rotateZ(-angle / 100);
        }

        //verifica a colisão
        checkCollision();
    }

    inLane = isOnLane(car.position); // verifica se o carro está na pista
    if (!inLane && !alterSpeed) { // se o carro estiver fora e o retardo não tive sido aplicado
        speedLimit = speedLimitOutSideLane;
        alterSpeed = true;
    } else if (inLane && alterSpeed) { //se o carro voltou pra pista é preciso restaurar o controle de retardo
        alterSpeed = false;
        speedLimit = speedLimitConst;
    }

    rotation = 2 * speed;

    // Will execute T1 and then R1
    wheelRR.rotation.z += rotation;

    // Will execute T1 and then R1
    wheelLR.rotation.z -= rotation;
    // Will execute T1 and then R1
    turnAuxFL.matrix.multiply(mat4.makeTranslation(-1.25, 2.20, 0.45));
    turnAuxFL.matrix.multiply(mat4.makeRotationZ(angle * 10)); // R1
    wheelFL.rotation.z -= rotation;

    // Will execute T1 and then R1
    turnAuxFR.matrix.multiply(mat4.makeTranslation(1.25, 2.20, 0.45));
    turnAuxFR.matrix.multiply(mat4.makeRotationZ(angle * 10)); // R1
    wheelFR.rotation.z += rotation;

}

function checkCollision() {
    //console.log("entrei");
    let carBB = new THREE.Box3().setFromObject(carCg);

    // const box = new THREE.BoxHelper(carCg, 0xffff00);
    // scene.add(box);

    //let boxesCollision = false;
    let collision = objectsBox.some(function(objBB) {
        // if (self.body.BBox.intersectsBox(mesh.BBox)) {
        //     boxesCollision = true;
        //     console.log("Colisão");
        //     return true;
        // }
        // self.body.BBoxHelper.update();
        //console.log("func");
        if (objBB.intersectsBox(carBB)) {
            //onsole.log("COLISÃO");
            speedLimit = speedLimitWithColision;
            alterColisionSpeed = true;
            return true;
        }

    });

    if (!collision && alterColisionSpeed) {
        speedLimit = speedLimitConst;
        alterColisionSpeed = false;
    }


    // if (boxesCollision) {
    //     this.body.position.copy(this.tmpPosition); // last position
    // }
}

//Configuração do teclado
export function keyboardUpdate() {

    if (!joyStickMode) {
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

    } else {
        updateAction();
    }

    //console.log("cond: " + (actions.exchange && time.second > lastTime));
    if (keyboard.down("space") || (actions.exchange && time.second > lastTime)) {

        /** MODO DE CAMERA
         *  1- Normal
         *  2- He/She/It
         *  3- Inspeção
         */
        if (joyStickMode) {
            lastTime = (time.second < 58 ? time.second : 0) + 1;
        }

        switch (camMode) {
            case 1:
                camMode++;
                cameraHeSheItActived = true;
                // deltaMovCam.set(25, 0, 5, 80, 90);
                // var cwd = new THREE.Vector3();
                // carAux.getWorldPosition(cwd);
                // camSup.position.set(cwd.x + deltaMovCam.x, cwd.y + deltaMovCam.y, cwd.z + deltaMovCam.z);
                return; // paleativo por preguiça
                break; // por prevenção
            case 2:
                cameraHeSheItActived = false;
                if (joyStickMode) {
                    camMode = 1;
                    deltaMovCam.reset();
                    return;
                } else {
                    camMode++;
                }
                break;
            case 3:
                camMode = 1;
                deltaMovCam.reset();
                break;
        }


        // não deixa entrar no modo de inspeção para o modo celular
        if (joyStickMode && camMode == 3) {
            camMode = 1;
        }

        //console.log("Modo de camera a ser ativado: " + camMode);

        // if (camMode == 2) {
        //     // trocar camera
        //     camMode.set(15, -15, 15);
        //     return; 
        // }

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
}

function updateAction() {
    if (playing) {
        atualizarQuadrante(car.position.x, car.position.y);

        //console.log(actions.acceleration)

        if (actions.acceleration) speed = Math.min(speed + 2 * deltaSpeed, speedLimit);
        if (actions.braking) speed = Math.max(speed - 2 * deltaSpeed, -speedLimit);
        if (actions.left) angle = Math.min(angle + deltaAngle, angleLimit);
        if (actions.right) angle = Math.max(angle - deltaAngle, -angleLimit);

        if (!actions.acceleration && !actions.braking) {
            if (speed > 0) {
                speed = Math.max(speed - deltaSpeed, 0);
            } else if (speed < 0) {
                speed = Math.min(speed + deltaSpeed, 0);
            }
        }

        if (!actions.active) {
            if (angle > 0) {
                angle = Math.max(angle - deltaAngle, 0);
            } else if (angle < 0) {
                angle = Math.min(angle + deltaAngle, 0);
            }
        }

        //atualiza a velocidade
        speedometer.changeText("Velocidade: " + (20 * speed).toFixed(1) + "m/s");
        //console.log(actions.exchange);
    } else {
        speed = 0;
    }
}
//console.log(actions.active);

// if (actions.acceleration) {
//     if (speed < -1)
//         breakingForce = maxBreakingForce;
//     else engineForce = maxEngineForce;
// }
// if (actions.braking) {
//     if (speed > 1)
//         breakingForce = maxBreakingForce;
//     else engineForce = -maxEngineForce / 2;
// }
// if (actions.left) {
//     if (vehicleSteering < steeringClamp)
//         vehicleSteering += steeringIncrement;
// } else {
//     if (actions.right) {
//         if (vehicleSteering > -steeringClamp)
//             vehicleSteering -= steeringIncrement;
//     } else {
//         if (vehicleSteering < -steeringIncrement)
//             vehicleSteering += steeringIncrement;
//         else {
//             if (vehicleSteering > steeringIncrement)
//                 vehicleSteering -= steeringIncrement;
//             else {
//                 vehicleSteering = 0;
//             }
//         }
//     }
// }


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




//seta a pposição da camera baseado no quadrante atual

function carInicialParameters() {
    speed = 0;
    angle = 0;
    carCg.position.copy(getInicialPosition());
    //carCg.rotateZ(degreesToRadians(90));
    carCg.rotation.z = 1.57;
    turns = 1;
    time.reset();
    //FALTA ARRUMAR A ROTAÇÃO
}

//Traslação da camera de acordo com o movimento do carro
export function defineCamPosition() {
    if (modoCamera.simulacao) { // fora modo simu
        camera.matrixAutoUpdate = false;
        var mat4Cam = new THREE.Matrix4();
        camera.matrix.identity();
        // Will execute T1 and then R1
        //if (modoCamera.simulacao) {
        camera.matrix.multiply(mat4Cam.makeRotationZ(degreesToRadians(deltaMovCam.rotZ))); // R1
        camera.matrix.multiply(mat4Cam.makeRotationX(degreesToRadians(deltaMovCam.rotX))); // R1
        //}

        var cwd = new THREE.Vector3();
        carAux.getWorldPosition(cwd);

        // TESTE PARA MODO HE/SHE/IT
        // if (camMode == 2) {
        //     camSup.position.set(cwd.x, cwd.y, cwd.z);
        // } else { // MODO 1 - NORMAL
        camSup.position.set(cwd.x + deltaMovCam.x, cwd.y + deltaMovCam.y, cwd.z + deltaMovCam.z);
        //}

        //TESTE LUZ
        let lightPositionaAux = new THREE.Vector3(cwd.x + 10, cwd.y - 4, cwd.z + 6.5);
        updateLightPosition(lightPositionaAux);

        //updateLightPosition(lightPosition);
        //console.log(lightPosition)
        //console.log(cwd);
    } else { // modo simulação
        camera.matrixAutoUpdate = true;
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
        return joyStickMode ? " Total: " + padL(this.minute) + ":" + padL(this.second) + " || " + "Atual: " + padL(this.minuteActual) + ":" + padL(this.secondActual) + " || Melhor: " + this.best + " || Voltas: " + turns :
            "Tempo Total: " + padL(this.minute) + ":" + padL(this.second) + " || " + "Volta Atual: " + padL(this.minuteActual) + ":" + padL(this.secondActual) + " || Melhor Volta: " + this.best + " || Voltas: " + turns;
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
//Contorno da fuselagem
function backShape() {
    var backShape = new THREE.Shape();
    backShape.moveTo(-1.0, 0.8);
    backShape.lineTo(2.5, 0.0);
    backShape.lineTo(-1.0, 0.72);

    return backShape;
}

function tireShape() {

    var tireShape = new THREE.Shape();
    tireShape.absarc(0.0, 0.0, 0.45, 0, Math.PI * 2, false);

    var tirePath = new THREE.Path();
    tirePath.absellipse(0, 0, 0.3, 0.3, 0, Math.PI * 2, true);

    tireShape.holes.push(tirePath);

    return tireShape;
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
    fuseBaseShape.lineTo(-1.7, -1.0);
    fuseBaseShape.lineTo(-1.8, -0.8);
    fuseBaseShape.lineTo(-1.9, -0.7);
    fuseBaseShape.lineTo(-2.0, -0.6);
    fuseBaseShape.lineTo(-2.3, -0.6);
    fuseBaseShape.lineTo(-2.5, -0.7);
    fuseBaseShape.lineTo(-2.6, -0.8);
    fuseBaseShape.lineTo(-2.7, -1.0);
    fuseBaseShape.lineTo(-3.3, -1.0);
    fuseBaseShape.lineTo(-3.3, -0.40);

    return fuseBaseShape;
}

function ledDianteiroShape() {
    var ledDianteiroShape = new THREE.Shape();
    ledDianteiroShape.moveTo(-3.3, 0.);
    ledDianteiroShape.lineTo(-3.32, 0);
    ledDianteiroShape.lineTo(-3.32, -0.05);
    ledDianteiroShape.lineTo(-3.3, -0.05);

    return ledDianteiroShape;
}

function ledTraseiroShape() {
    var ledTraseiroShape = new THREE.Shape();
    ledTraseiroShape.moveTo(2.5, 0.0);
    ledTraseiroShape.lineTo(2.52, 0.0);
    ledTraseiroShape.lineTo(2.52, -0.05);
    ledTraseiroShape.lineTo(2.5, -0.05);
    return ledTraseiroShape;
}

function parachoqueShape() {
    //Contorno da Fuselagem
    var parachoqueShape = new THREE.Shape();
    parachoqueShape.moveTo(2.6, -0.8);
    parachoqueShape.lineTo(2.6, -1);
    parachoqueShape.lineTo(1.9, -1.0);
    parachoqueShape.lineTo(1.8, -0.8);
    parachoqueShape.lineTo(1.7, -0.7);
    parachoqueShape.lineTo(1.6, -0.6);
    parachoqueShape.lineTo(1.3, -0.6);
    parachoqueShape.lineTo(1.1, -0.7);
    parachoqueShape.lineTo(1.0, -0.8);
    parachoqueShape.lineTo(0.9, -1.0);
    parachoqueShape.lineTo(-1.7, -1.0);
    parachoqueShape.lineTo(-1.8, -0.8);
    parachoqueShape.lineTo(-1.9, -0.7);
    parachoqueShape.lineTo(-2.0, -0.6);
    parachoqueShape.lineTo(-2.3, -0.6);
    parachoqueShape.lineTo(-2.5, -0.7);
    parachoqueShape.lineTo(-2.6, -0.8);
    parachoqueShape.lineTo(-2.7, -1.0);
    parachoqueShape.lineTo(-3.4, -1.0);
    parachoqueShape.lineTo(-3.4, -0.8);
    parachoqueShape.lineTo(-2.9, -0.8);
    parachoqueShape.lineTo(-2.6, -0.4);
    parachoqueShape.lineTo(-1.7, -0.4);
    parachoqueShape.lineTo(-1.5, -0.8);
    parachoqueShape.lineTo(0.7, -0.8);
    parachoqueShape.lineTo(1.0, -0.4);
    parachoqueShape.lineTo(1.9, -0.4);
    parachoqueShape.lineTo(2.1, -0.8);

    return parachoqueShape;
}

function windshieldShape() {
    var wsShape = new THREE.Shape();
    wsShape.moveTo(-2.5, 0.0);
    wsShape.lineTo(-1.0, 0.8);
    wsShape.lineTo(-1.0, 0.79);
    wsShape.lineTo(-2.5, -0.01);

    //wsShape.lineTo(-1.0,0.75);
    //wsShape.lineTo(-2.5,-0.1);

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


//TESTE JOY

export function activeJoyStickMode() {
    joyStickMode = true;
    deltaAngle = degreesToRadians(0.1);
    addJoysticks();
}

function addJoysticks() {
    // Details in the link bellow:
    // https://yoannmoi.net/nipplejs/

    let joystickL = nipplejs.create({
        zone: document.getElementById('joystickWrapper1'),
        mode: 'static',
        lockX: true, // only move on the Y axis				
        position: { top: '-100px', left: '80px' }
    });

    joystickL.on('move', function(evt, data) {
        actions.active = true;
        const steer = data.vector.x;
        actions.left = actions.right = false;
        if (steer > 0) actions.right = true;
        if (steer < 0) actions.left = true;
    })

    joystickL.on('end', function(evt) {
        actions.left = actions.right = false;
        actions.active = false;
    })
}

function onButtonDown(event) {
    switch (event.target.id) {
        case "A":
            actions.braking = false;
            actions.acceleration = true;
            break;
        case "B":
            actions.braking = true;
            actions.acceleration = false;
            break;
        case "C":


            //actions.exchange = true;
            //console.log("teste " + time.second + " " + lastTime);
            // controla a troca de camera
            if (!actions.exchange && time.second > lastTime) {
                //console.log("entrei");
                actions.exchange = true;
                // lastTime = (time.second < 58 ? time.second : 0) + 4;

            } else {
                actions.exchange = false;
            }
            actions.braking = false;
            actions.acceleration = false;
            break;
        case "full":
            buttons.setFullScreen();
            break;
    }
}

function onButtonUp(event) {
    actions.acceleration = false;
    actions.braking = false;
    actions.exchange = false
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