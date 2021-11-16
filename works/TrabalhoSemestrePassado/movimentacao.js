import * as THREE from '../build/three.module.js';
import { degreesToRadians } from "../libs/util/util.js";
import KeyboardState from '../libs/util/KeyboardState.js';

// To use the keyboard
var keyboard = new KeyboardState();

var vel = 0, // velocidade atual e seta inicial
    velHelice = 0, // velocidade da helice
    velMax = 5, //define velocidade maxima do objeto
    modoInsp = {
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
    },
    objeto, modoCamera, scene, plane, axes, aviao, camera, bicoAux,
    angle = degreesToRadians(0.5),
    rotX = new THREE.Vector3(1, 0, 0), // Set X axis
    rotY = new THREE.Vector3(0, 1, 0); // Set Y axis

const aceleracao = 0.1, //constate de aceleracao
    correcaoAviao = degreesToRadians(0.5),
    rotationAviaoX = -1.5707963267948963,
    correcaoCam = degreesToRadians(0.08),
    rotationCameraX = -0.3217505543966422;

export function initMov(objetoAux, modoCameraAux, sceneAux, planeAux, axesAux) {
    objeto = objetoAux;
    modoCamera = modoCameraAux;
    scene = sceneAux;
    plane = planeAux;
    axes = axesAux;
    aviao = objeto.getObjectByName('aviao');
    camera = objeto.getObjectByName('camera');
    bicoAux = objeto.getObjectByName('bico');
    bicoAux.matrix.autoUpdate = false;
    bicoAux.matrix.identity();
}

export function keyboardUpdate() {

    keyboard.update();

    if (modoCamera.simulacao) {
        if (keyboard.pressed("up")) {
            objeto.translateY(-vel / 5);

            if (camera.rotation.x > -0.35)
                camera.rotation.x -= correcaoCam;

            if (aviao.rotation.x > -2.0)
                aviao.rotateOnAxis(rotX, -2 * angle);
        }
        if (keyboard.pressed("down")) {
            objeto.translateY(vel / 5);
            if (camera.rotation.x < -0.28)
                camera.rotation.x += correcaoCam;

            if (aviao.rotation.x < -1.0)
                aviao.rotateOnAxis(rotX, 2 * angle);
        }
        if (keyboard.pressed("left")) {
            objeto.rotateOnAxis(rotY, angle);

            if (aviao.rotation.y > -0.7)
                aviao.rotateOnAxis(rotY, -angle);
        }
        if (keyboard.pressed("right")) {
            objeto.rotateOnAxis(rotY, -angle);
            if (aviao.rotation.y < 0.7)
                aviao.rotateOnAxis(rotY, angle);
        }

        // voltar para a posição padrao automaticamente
        if (!(keyboard.pressed("up") || keyboard.pressed("down"))) {

            if (aviao.rotation.x !== rotationAviaoX)
                rotationAviaoX - aviao.rotation.x < correcaoAviao && rotationAviaoX - aviao.rotation.x > -correcaoAviao ?
                aviao.rotation.x = rotationAviaoX :
                aviao.rotation.x > rotationAviaoX ? aviao.rotation.x -= correcaoAviao : aviao.rotation.x += correcaoAviao;

            if (aviao.rotation.z !== 0)
                aviao.rotation.z > 0 ? aviao.rotation.z -= correcaoAviao : aviao.rotation.z += correcaoAviao;

            if (camera.rotation.x !== rotationCameraX)
                camera.rotation.x < correcaoCam && camera.rotation.x > -correcaoCam ?
                camera.rotation.x = rotationCameraX :
                camera.rotation.x > rotationCameraX ? camera.rotation.x -= correcaoCam : camera.rotation.x += correcaoCam;
        }

        if (!(keyboard.pressed("left") || keyboard.pressed("right"))) {
            if (aviao.rotation.y !== 0)
                aviao.rotation.y < correcaoAviao && aviao.rotation.y > -correcaoAviao ?
                aviao.rotation.y = 0 :
                aviao.rotation.y > 0 ? aviao.rotation.y -= correcaoAviao : aviao.rotation.y += correcaoAviao;
            if (aviao.rotation.z !== 0)
                aviao.rotation.z > 0 ? aviao.rotation.z -= correcaoAviao : aviao.rotation.z += correcaoAviao;
        }

        if (keyboard.pressed("Q")) vel + aceleracao < velMax ? vel += aceleracao : vel = velMax;
        if (keyboard.pressed("A")) vel - aceleracao > 0 ? vel -= aceleracao : vel = 0;
    }

    if (keyboard.down("space")) {
        modoCamera.simulacao = !modoCamera.simulacao;
        if (modoCamera.simulacao) { // sai do modo de inspeção e retoma parametros
            plane.visible = true;
            objeto.position.copy(modoInsp.posicaoAnterior);
            camera.position.copy(modoInsp.posicaoAntCam);
            objeto.rotation.copy(modoInsp.rotationAntObj);
            aviao.rotation.copy(modoInsp.rotationAntAviao);
            camera.rotation.copy(modoInsp.rotationAntCam);
            vel = modoInsp.vel;
        } else { //entra no modo de inspeção, guarda e seta parametros
            modoInsp.posicaoAnterior.copy(objeto.position);
            objeto.position.copy(modoInsp.posicao);
            modoInsp.rotationAntCam.copy(camera.rotation);
            modoInsp.posicaoAntCam.copy(camera.position);
            camera.rotation.copy(modoInsp.rotationCam);
            camera.position.copy(modoInsp.posicaoCam);
            modoInsp.rotationAntObj.copy(objeto.rotation);
            modoInsp.rotationAntAviao.copy(aviao.rotation);
            objeto.rotation.copy(modoInsp.rotationObj);
            aviao.rotation.copy(modoInsp.rotationAviao);
            modoInsp.vel = vel; // correção a ser colocada
            vel = 0;
            plane.visible = false;
        }
    }
}

//move o aviao
export function movePlane() {
    objeto.translateZ(-vel);
    rotacionarBico();
}

function rotacionarBico() {
    velHelice = vel * 3;
    bicoAux.rotateY(-degreesToRadians(velHelice));
}