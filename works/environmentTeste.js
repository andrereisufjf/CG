import * as THREE from '../build/three.module.js';
import Stats from '../build/jsm/libs/stats.module.js';
import { TrackballControls } from '../build/jsm/controls/TrackballControls.js';
import KeyboardState from '../libs/util/KeyboardState.js';
import {
    initRenderer,
    initCamera,
    InfoBox,
    onWindowResize
} from "../libs/util/util.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, -180, 100)); // Init camera in this position

// To use the keyboard
var keyboard = new KeyboardState();

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// create the ground plane
let lado = 95; //lado must be odd
var planeGeometry = new THREE.PlaneGeometry(lado * 2.1, lado * 2.1);
planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgba(255, 160, 122)",
    side: THREE.DoubleSide,
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// add the plane to the scene
scene.add(plane);

const tam = 10;
const delta = 0.9;
const z = 4;
const quant = (2 * lado)/tam - 1;


class Blocks{
    constructor(x = 0, y = 0, z = 2, tam, isInicial = false){
        let color = isInicial ? { color: "rgba(255, 69, 0)" } : { color: "rgba(128, 128, 128)" };
        var cubeGeometry = new THREE.BoxGeometry(tam, tam, 0.3);
        var cubeMaterial = new THREE.MeshBasicMaterial(color);
        var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(x, y, z);
        // scene.add(cube);
        return cube;
    }
}

// var b1 = new Blocks(2, 2, 4, true);

let blocks = [];
// let j = 10; 
/* for(let i = 0; i < 16; i++)
{
    blocks.push(new Blocks(86 - j, -82, 4, false)); // deitado embaixo
    if(i < 15) 
    {
        blocks.push(new Blocks(-74, 78 - j, 4, false)); // em pé esquerda
        blocks.push(new Blocks(86 - j, 68, 4, false)); // deitado em cima 
    }
    if(i < 14)
    {
        blocks.push(new Blocks(76, 68 - j, 4, false)); // em pé direita
    }
    j = j + 10;
} */

for(let i = -lado; i < lado; i = i + tam)
{
    if(i === -tam/2)
    {
        blocks.push(new Blocks(i + tam/2, -lado + tam/2, 4, tam * delta, true));     
    }
    else
    {
        blocks.push(new Blocks(i + tam/2, -lado + tam/2, 4, tam * delta, false)); 
    }
}

for(let i = -lado + tam; i < lado; i = i + tam)
{
    blocks.push(new Blocks(lado - tam/2, i + tam/2, 4, tam * delta, false)); 
}

for(let i = lado - tam; i > -lado; i = i - tam)
{
    blocks.push(new Blocks(i - tam/2, lado - tam/2, 4, tam * delta, false)); 
}

for(let i = lado - tam; i > -lado + tam; i = i - tam)
{
   blocks.push(new Blocks(- lado + tam/2, i - tam/2, 4, tam * delta, false)); 
}


// scene.add(blocks);
blocks.forEach(block=>scene.add(block));
//blocks[Math.round(quant / 2)].material.color = "";
console.log(quant)

function keyboardUpdate() {

keyboard.update();


if (keyboard.down("2")) 
{
    let start = Math.round(quant + quant/2) + 1;
    let end = Math.round(2 * quant + quant/2);

    let fator = Math.round((end-start)/2);

    //console.log("ola");
    //console.log(Math.round((end-start)/2));
    //console.log(end - start);

    for(let i = start; i < end; i++)
    {
        let x, y;
        x = blocks[i].position.x;
        y = blocks[i].position.y;
        
        if(x === y)
        {
            fator = 0;
            blocks[i].position.set(tam*fator, tam*fator, z);
        } 
        else if(x > y)
        {
            fator--;
            blocks[i].position.set(tam*fator, 0, z);
        } 
        else
        {
            fator++;
            blocks[i].position.set(0, tam*fator, z);
        }
        
        /*blocks[Math.round(quant + quant/2) + 1].position.set(tam*3, 0, 4);
        blocks[Math.round(quant + quant/2) + 2].position.set(tam*2, 0, 4);
        blocks[Math.round(quant + quant/2) + 3].position.set(tam, 0, 4);
        blocks[Math.round(quant + quant/2) + 4].position.set(0, 0, 4);
        blocks[Math.round(quant + quant/2) + 5].position.set(0, tam, 4);
        blocks[Math.round(quant + quant/2) + 6].position.set(0, tam*2, 4);
        blocks[Math.round(quant + quant/2) + 7].position.set(0, tam*3, 4); */
    }
}

if (keyboard.down("1")) 
{
    let start = Math.round(quant + quant/2) + 1;
    let end = Math.round(2 * quant + quant/2);

    let fator = Math.round((end-start)/2);

    //console.log("ola");
    //console.log(Math.round((end-start)/2));
    //console.log(end - start);

    for(let i = start; i < end; i++)
    {
        let x, y;
        x = blocks[i].position.x;
        y = blocks[i].position.y;
        
        if(x === y)
        {
            fator = 0;
            blocks[i].position.set(lado - tam/2, lado - tam/2, z);
        } 
        else if(x > y)
        {
            fator--;
            blocks[i].position.set(lado - tam/2, lado - tam/2 - x, z);
        } 
        else
        {
            fator++;
            blocks[i].position.set(lado - tam/2 - y, lado - tam/2, z);
        }
        
        /*blocks[Math.round(quant + quant/2) + 1].position.set(tam*3, 0, 4);
        blocks[Math.round(quant + quant/2) + 2].position.set(tam*2, 0, 4);
        blocks[Math.round(quant + quant/2) + 3].position.set(tam, 0, 4);
        blocks[Math.round(quant + quant/2) + 4].position.set(0, 0, 4);
        blocks[Math.round(quant + quant/2) + 5].position.set(0, tam, 4);
        blocks[Math.round(quant + quant/2) + 6].position.set(0, tam*2, 4);
        blocks[Math.round(quant + quant/2) + 7].position.set(0, tam*3, 4); */
    }

}

}
// blocks.forEach(block=>scene.add(block));



// Listen window size changes
window.addEventListener('resize', function() { onWindowResize(camera, renderer) }, false);

render();

function render() {
    stats.update(); // Update FPS
    trackballControls.update(); // Enable mouse movements
    keyboardUpdate();
    requestAnimationFrame(render);
    renderer.render(scene, camera) // Render scene
}