import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { fadeOutScene } from "./transitions";
import gsap from "gsap";

let scene;
let previouslySelectedOdyssey
let camera;
let controls

/**
 * Handle the incoming click.
 * @param {scene} mainScene 
 * @param {odyssey} targetOdyssey 
 */
const HandleOdysseyClick = (mainScene, targetOdyssey, mainCamera, mainControls) => 
{
    scene = mainScene; // the main scene object from index.js.
    camera = mainCamera; // the main camera object.
    controls = mainControls;

    // if second click. Handle zoom and fade.
    if (previouslySelectedOdyssey == targetOdyssey) 
    {
        HandleSecondClickOnOdyssey(previouslySelectedOdyssey);
    }

    // if first click. Generate object placement.
    if( !previouslySelectedOdyssey || previouslySelectedOdyssey != targetOdyssey) 
    {      
        previouslySelectedOdyssey = targetOdyssey;
        GenerateInfoObject(targetOdyssey);
    }




}

const GenerateInfoObject = (odyssey) => {
    

    /**
     * Calculate points.
     * 1. Odyssey side
     * 2. Odyssey side upwards
     * 3. Upwards to the side.
     */

    /**
     * Draw shape from point 1 to 3.
     */

    /** 
     * Create mesh from the shape.
     */

    /**
     * Add 3D text.
     * 1. Name
     * 2. Click to enter.
     */

    /**
     * Add to scene.
     */
    
}

const HandleSecondClickOnOdyssey = (odyssey) => 
{
    
    // Start the fade out.
    fadeOutScene();
    
    // Start the zoom.
    gsap.to(camera.position, {
        duration: 1,
        x: odyssey.position.x,
        y: odyssey.position.y,
        z: odyssey.position.z,
        
        onStart: function() {
            console.log(camera.position);
            controls.enabled = false;
            controls.autoRotate = false; 
            controls.enablePan = false;
        },

        onUpdate: function() {
            console.log(camera.position);
        }
    });

    // Make the Unity call

    
}


export { HandleOdysseyClick };