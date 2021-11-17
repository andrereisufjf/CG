import * as THREE from '../build/three.module.js';
import { degreesToRadians } from "../libs/util/util.js";

export function createCarBody() {
    var materialAmarelo = new THREE.MeshPhongMaterial({ color: 'rgb(190, 195, 0)' });
    var materialAzul = new THREE.MeshPhongMaterial({ color: 'rgb(0, 0, 155)' });
    var materialCinza = new THREE.MeshPhongMaterial({ color: 'rgb(80, 80, 80)' });

    var comprimento = 20;
    var raio = 3;
    var corpo_principalGeom = new THREE.CylinderGeometry(raio, raio, comprimento, 100, 100);
    var corpo_principal = new THREE.Mesh(corpo_principalGeom, materialAzul);

    var corpo_traseiro1Geom = new THREE.CylinderGeometry(raio, raio / 2, comprimento / 3, 100, 100);
    var corpo_traseiro1 = new THREE.Mesh(corpo_traseiro1Geom, materialAzul);

    var corpo_traseiro2Geom = new THREE.CylinderGeometry(raio / 2, raio / 10, comprimento / 6, 100, 100);
    var corpo_traseiro2 = new THREE.Mesh(corpo_traseiro2Geom, materialAzul);

    var corpo_frontalGeom = new THREE.CylinderGeometry(raio * 0.8, raio, comprimento / 2, 100, 100);
    var corpo_frontal = new THREE.Mesh(corpo_frontalGeom, materialAzul);

    var esfera_frontalGeom = new THREE.SphereGeometry(raio * 0.8, 100, 100);
    var esfera_frontal = new THREE.Mesh(esfera_frontalGeom, materialAmarelo);

    var estabilizador_horizontalGeom = new THREE.BoxGeometry(10, 2, 0.2);
    var estabilizador_horizontal = new THREE.Mesh(estabilizador_horizontalGeom, materialAmarelo);

    var estabilizador_verticalGeom = new THREE.BoxGeometry(0.2, 2, 4);
    var estabilizador_vertical = new THREE.Mesh(estabilizador_verticalGeom, materialAmarelo);

    var apoioEstabilizadorGeom = new THREE.BoxGeometry(0.1, 2, 3);
    var apoioEstabilizadorVertical = new THREE.Mesh(apoioEstabilizadorGeom, materialAzul);

    var janela_geom = new THREE.SphereGeometry(raio - 1, 100, 100);
    var janela = new THREE.Mesh(janela_geom, materialCinza);

    var asas_fundoGeom = new THREE.CylinderGeometry(raio * 0.3, raio * 0.2, raio * 2, 100, 100);
    var asas_fundo = new THREE.Mesh(asas_fundoGeom, materialAmarelo);

    var asas_frenteGeom = new THREE.SphereGeometry(raio * 1.05, 100, 100);
    var asas_frente = new THREE.Mesh(asas_frenteGeom, materialAmarelo);

    var bico_geom = new THREE.SphereGeometry(raio * 0.8, 100, 100);
    var bico = new THREE.Mesh(bico_geom, materialAzul);
    bico.name = 'bico';

    var pa_geom = new THREE.SphereGeometry(raio * 0.4, 100, 100);
    var pa_1 = new THREE.Mesh(pa_geom, materialAzul);
    var pa_2 = new THREE.Mesh(pa_geom, materialAzul);

    corpo_principal.rotateX(degreesToRadians(-90));
    corpo_principal.add(corpo_traseiro1);
    corpo_principal.add(janela);
    corpo_principal.add(corpo_frontal);
    corpo_principal.add(asas_fundo);
    corpo_principal.add(asas_frente);
    corpo_frontal.add(esfera_frontal);
    corpo_traseiro1.add(corpo_traseiro2);
    corpo_traseiro2.add(estabilizador_horizontal);
    corpo_traseiro2.add(estabilizador_vertical);
    estabilizador_vertical.add(apoioEstabilizadorVertical);
    esfera_frontal.add(bico);
    bico.add(pa_1);
    bico.add(pa_2);

    corpo_principal.scale.x = 0.8;

    apoioEstabilizadorVertical.rotateX(degreesToRadians(45));
    apoioEstabilizadorVertical.translateZ(-1);
    apoioEstabilizadorVertical.translateY(0.5);

    estabilizador_horizontal.translateY(-1);

    estabilizador_vertical.translateY(-1);
    estabilizador_vertical.translateZ(2);

    corpo_traseiro2.translateY(-5);

    pa_1.translateY(raio * 0.4);
    pa_1.scale.z = 6;
    pa_1.scale.y = 0.2;

    pa_2.translateY(raio * 0.4);
    pa_2.scale.x = 6;
    pa_2.scale.y = 0.2;

    bico.translateY(raio * 0.7);
    bico.scale.x = 0.5;
    bico.scale.z = 0.5;

    asas_frente.scale.z = 0.3;
    asas_frente.scale.x = 7.5;
    asas_frente.translateY(6);

    asas_fundo.rotateY(degreesToRadians(-90));
    asas_fundo.scale.z = 25;
    asas_fundo.translateY(raio);

    esfera_frontal.translateY(comprimento / 4);

    corpo_frontal.translateY(comprimento / 2 + comprimento / 4);

    janela.translateZ(raio * 0.8);
    janela.translateY(raio);
    janela.scale.y = 2;

    corpo_traseiro1.translateY(-comprimento / 2 - comprimento / 6);

    return corpo_principal;
}