import * as THREE from '../build/three.module.js';
import { degreesToRadians} from "../libs/util/util.js";

var barRadius = 0.8;
var barLength = 1.6;
var boxSize=1;

export function buildBarrel(pos){
    //Textura do corpo do barril
    var textureLoader = new THREE.TextureLoader();
    var cylinderTexture  = textureLoader.load('./textures/barril.jpg');

    // Cilindro
    var cylinderGeometry = new THREE.CylinderGeometry(barRadius,barRadius,barLength,100,100,true)
    var cylinderMaterial = new THREE.MeshPhongMaterial();
    cylinderMaterial.side =  THREE.DoubleSide;
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.castShadow = true;
    cylinder.position.set(pos[0], pos[1], 0.2);
    cylinder.rotateX(degreesToRadians(90))
    cylinder.material.map = cylinderTexture;
    
    //-- Textura do topo do barril
    var textureLoader = new THREE.TextureLoader();
    var circleTexture  = textureLoader.load('./textures/barriltop.jpg');
    
    // Circulo de cima
    var topCircleGeometry = new THREE.CircleGeometry(barRadius,100,100)
    var topCircleMaterial = new THREE.MeshPhongMaterial();
    topCircleMaterial.side =  THREE.DoubleSide;
    var topCircle = new THREE.Mesh(topCircleGeometry, topCircleMaterial);
    topCircle.position.set(0.0, barLength/2, 0.0);
    topCircle.rotateX(degreesToRadians(90))
    topCircle.material.map = circleTexture;
    cylinder.add(topCircle)
    
    // Circulo de cbaixo
    var bottomCircleGeometry = new THREE.CircleGeometry(barRadius,100,100)
    var bottomCircleMaterial = new THREE.MeshPhongMaterial();
    bottomCircleMaterial.side =  THREE.DoubleSide;
    var bottomCircle = new THREE.Mesh(bottomCircleGeometry, bottomCircleMaterial);
    bottomCircle.position.set(0.0, -barLength/2, 0.0);
    bottomCircle.rotateX(degreesToRadians(90))
    bottomCircle.material.map = circleTexture;
    cylinder.add(bottomCircle)
    
    
    return cylinder;
}

export function buildBox(pos){
    //Textura do corpo do barril
    var textureLoader = new THREE.TextureLoader();
    var boxTexture  = textureLoader.load('./textures/woodBox.jpg');
    
    // Cilindro
    var boxGeometry = new THREE.BoxGeometry(boxSize,boxSize,boxSize)
    var boxMaterial = new THREE.MeshPhongMaterial();
    boxMaterial.side =  THREE.DoubleSide;
    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    box.position.set(pos[0], pos[1], 0.0);
    box.rotateX(degreesToRadians(90))
    box.material.map = boxTexture;
    
    return box;
}