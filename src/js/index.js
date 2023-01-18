
/*

Project: Odyssey Explorer
Company: Odyssey B.V
Website: https://odyssey.org/
Author:  Frank Bloemendal

*/

import gsap, { normalize } from "gsap";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'dat.gui';
import {createOdyssey, buildConnectionLines} from "./odyssey.js";
import { ActivateFirstPerson, OnKeyDown, OnKeyUp } from './firstpersonlogic.js';
import { calculateMouseOverLocation, 
    doHighlightRayTrace, 
    highlightTarget, 
    mouseOverMesh, 
    renderOdysseyInformationPopup,
    setActiveOdyssey,
    renderOdysseyInformationPopup,
    infoObjectMesh 
} from "./mouseOver.js";


ActivateFirstPerson();

/**
 * For Dev Only
 */

let AmountOfGalaxyToGenereate = 100;
let maxOdysseyConnectionLineHeight = 20;
let MaxOrbitCameraDistance = 200;
let planetAreSpawnedHorizontal = false;
let planetsMaxVerticalSpawnHeight = 100;
const minimalDistanceToPlanetForCamera = 5;


/**
 * Setup the scene.
 */

let scene, canvas, renderer, controls, selectedOdyssey;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2;
const gui = new dat.GUI();
let updateCameraRotation = false;
gui.hide();
let transitionToPlanetFinished = true;
let activeLinesArray = [];
let leftMouseButtonIsDown = false;



let meshArray = [];
  
// Scene setup
canvas = document.querySelector(".webgl");
scene = new THREE.Scene();

scene.add(mouseOverMesh);
scene.add(infoObjectMesh);

// Camera Setup
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
camera.position.set(15,20,2);
camera.lookAt(0,0,0);
scene.add(camera);

// Light Setup
const ambient = new THREE.AmbientLight(0x404040, 5);
scene.add(ambient);


// Renderer Setup
renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: "high-performance"});
renderer.setClearColor(0x222222);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// Orbit Controls setup
controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.3;
controls.enableDamping = true;
controls.enablePan = true;
controls.maxDistance = MaxOrbitCameraDistance;
controls.minDistance = minimalDistanceToPlanetForCamera; 
controls.zoomSpeed = 1;


/**
 * Happyship skybox
 */
const backgroundImage = new THREE.TextureLoader().load('./images/small/BasicSkyboxHD.jpg');
backgroundImage.mapping = THREE.EquirectangularReflectionMapping;
scene.background = backgroundImage;



/**
 * Build Galaxy
 */
const parameters = {};
parameters.count = 100000;
parameters.size = 0.001;
parameters.radius = 100;
parameters.branches = 3;
parameters.spin = 1.3;
parameters.randomnes = 0.2;
parameters.randomnesPower = 3;
parameters.YHeight= 100;

let pointsGeometry = null;
let pointsMaterial = null;
let points = null;

const generateGalaxy = () => {

    /**
     * Clean previous renders of galaxy.
     */
    if(points !== null){
        pointsGeometry.dispose();
        pointsMaterial.dispose();
        scene.remove(points);
    };

    /**
     * Geometry
     */
    pointsGeometry = new THREE.BufferGeometry();
    const position = new Float32Array(parameters.count * 3);

    for(let i = 0; i < parameters.count; i++ ){

        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? parameters.YHeight : -parameters.YHeight);
        const randomZ = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);


        position[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; 
        position[i3 + 1] = randomY;
        position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    }

    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(position, 3)
    );

    /**
     * Material
     */
    pointsMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xFF5588,
        transparent: true,
        opacity: 0.5,
    });

    /**
     * Create stars in the universe.
     */
    points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);


};

//const axesHelper = new THREE.AxesHelper( 5 );
//scene.add( axesHelper );

generateGalaxy();

gui.add(parameters, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius").min(1).max(500).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "branches").min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-3).max(3).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnes").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnesPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "YHeight").min(1).max(150).step(1).onFinishChange(generateGalaxy);

// update mouse location on screen
function onPointerMove(event){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // Do raytrace to detect mouseOver for highlight.
    if(!leftMouseButtonIsDown)
    {
        doHighlightRayTrace(pointer, camera, referenceListOfOdysseys,scene);
    }
    
};

const onMouseUp = (event) =>
{   
    if(event.button == 0) 
    {
        leftMouseButtonIsDown = false;
    }
}

// Onclick event 

function onMouseDown(event){

    if(event.button != 0) {
        return;
    }


    // Set let mouse button to down.
    leftMouseButtonIsDown = true;

    // Create Raycast
    raycaster.setFromCamera(pointer, camera);
    const castRay = raycaster.intersectObjects(referenceListOfOdysseys, false);

    // Process the Raycast.
    if(castRay.length > 0){
        
        // Make sure transition to the newly clicked planet has finished.
        if (!transitionToPlanetFinished){
            return
        }

        // Only react to first raycast hit
        
        const targetPlanet = castRay[0];

        // If clicked planet is same as current selected one return
        if(targetPlanet.object === selectedOdyssey){
            return;
        }
        

        selectedOdyssey = targetPlanet.object;
      

        let targetVector = new THREE.Vector3();
        targetPlanet.object.getWorldPosition(targetVector);
    

        
        // Prepare fly to planets.
        const targetPlanetLocation = new THREE.Vector3(targetVector.x, targetVector.y, targetVector.z);;
        
        // Prepare rotation of camera animation.
        const startOrientation = camera.quaternion.clone();
        const targetOrientation = camera.quaternion.clone(camera.lookAt(targetVector)).normalize();

        // Get the direction for the new location.
        let direction = new THREE.Vector3();
        direction.subVectors(targetVector, camera.position).normalize();

        // Get distance from raycast minus minimal distance orbit control
        // const distance = targetPlanet.distance - minimalDistanceToPlanetForCamera;
        let targetVectorForDistance = new THREE.Vector3(targetVector.x,targetVector.y,targetVector.z);
        const distance = targetVectorForDistance.distanceTo(camera.position) - minimalDistanceToPlanetForCamera;

        // Create new target for the camera.
        let targetLocation = new THREE.Vector3();
        targetLocation.addVectors(camera.position, direction.multiplyScalar(distance));

        // Set active Odyssey for highlight with information.
        setActiveOdyssey(selectedOdyssey);

         //Animate using gsap module.
        gsap.to(camera.position, {
           duration: 1.5,
           x: targetLocation.x,
           y: targetLocation.y,
           z: targetLocation.z,

           onStart: function(){
                transitionToPlanetFinished = false;
                updateCameraRotation = true;
                controls.enabled = false;
                controls.autoRotate = false; 
                controls.enablePan = false;
                activeLinesArray = selectedOdyssey.buildConnectionLines(referenceListOfOdysseys, scene, activeLinesArray); 
                renderOdysseyInformationPopup(selectedOdyssey);               
           },
           onUpdate: function(){
               
               camera.quaternion.copy(startOrientation).slerp(targetOrientation, this.progress());

           },
           onComplete: function(){ 
                updateCameraRotation = false;
                controls.enabled = true;
                controls.enablePan = true;
                controls.autoRotate = true; 
                controls.target = targetPlanetLocation; 
                transitionToPlanetFinished = true;  
                
           }
       });
    
    }

}



window.addEventListener( 'pointermove', onPointerMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);




/**
* Create test array for odyssey
*/

 let listOfOddyseys = []
 let referenceListOfOdysseys = []

 const ProcessOdyssey = () => {
     
     const numberOfPlanets = AmountOfGalaxyToGenereate;

     //Build an odyssey for all given entries.
     for(let i = 0; i < numberOfPlanets; i++){
        const odyssey = createOdyssey(i, "Wallet Address", "VISIT " + "ODYSSEY " + i , "test.com");
        listOfOddyseys.push(odyssey);
     }

     referenceListOfOdysseys = [...listOfOddyseys];
 }

 ProcessOdyssey();




 /**
  * Create Circular Universe of Odysseys
  */

const buildUniverse = () => {
    
    let radius = 10;
    const radiusIncreaseValue = 15;
    let AmountOfOdysseyInNextRing = 10;
    let ringCount = 1;
    let odysseyGroups = [];

    // Build circles in groups.
    function createRing(){

        // if amount to be spawned bigger than available odyssey
        if(listOfOddyseys.length < AmountOfOdysseyInNextRing){
            AmountOfOdysseyInNextRing = listOfOddyseys.length;
        }

        let degreeBetweenOdyssey = 360 /AmountOfOdysseyInNextRing;
        let offset = 0;
        let currentOdyssey

        const odysseyCircle = new THREE.Group();
        odysseyCircle.name = "circle" + ringCount;


        // Fill circle with odysseys.
        for(let i = 0; i < AmountOfOdysseyInNextRing; i++){
            currentOdyssey = listOfOddyseys[i];
            const radian = offset * ( Math.PI / 180);
            offset += degreeBetweenOdyssey;

            const newX = Math.cos(radian) * radius;
            let newY
            if (planetAreSpawnedHorizontal){
                newY = 0;
            }else{
                newY =  (Math.random() * planetsMaxVerticalSpawnHeight) - (planetsMaxVerticalSpawnHeight /2);
            }
            const newZ = Math.sin(radian) * radius;

            currentOdyssey.position.set(newX, newY, newZ);
        
            currentOdyssey.randomConnection(AmountOfGalaxyToGenereate); // TEMP: Generate Random Connection in Class.

            odysseyCircle.add(currentOdyssey);
            
       } 

       listOfOddyseys.splice(0, AmountOfOdysseyInNextRing);
       
       radius += radiusIncreaseValue * (ringCount / 2);
       AmountOfOdysseyInNextRing = AmountOfOdysseyInNextRing * 1.5;
       ringCount++;
       
       // Add newly created ring of odysseys to the array.
       odysseyGroups.push(odysseyCircle);
       

    }


    /** Trigger While loop posting all odyssey. */
    while(listOfOddyseys.length > 0){
        createRing();
    }

    // Add all odyssey rings to the scene.
    odysseyGroups.forEach( circle => {
        scene.add(circle);

    })

    /**
     * ADD CENTER USER ODYSSEY. AFTER GENERATING UNIVERSE.
     */
    const userCenterOdyssey = createOdyssey(999, "Wallet Address", " Visit Frank", "test.com");
    if (userCenterOdyssey) {
        scene.add(userCenterOdyssey);
        referenceListOfOdysseys.push(userCenterOdyssey);
        userCenterOdyssey.randomConnection(AmountOfGalaxyToGenereate);
        activeLinesArray = userCenterOdyssey.buildConnectionLines(referenceListOfOdysseys, scene, activeLinesArray);
    };


 }

const lookAtCameraObjects = () =>
{
    infoObjectMesh.lookAt(camera.position);
}



/**
 * Handle fade out
 */

// TEMPORAL TRIGGER FOR FADE OUT: SPACEBAR
/*
window.addEventListener('keyup', event => 
{    
    if(event.code === 'Space')
    {        
        fadeOutScene();    
    }
});
*/






buildUniverse();

// Offset for ringNameAnimation
let nameRingOffset = 0;


// Animation
function animate(){

    // Time reference.
    const time = performance.now();
    lookAtCameraObjects();


    /**
     * Removing this comment will animate all name rings on every odyssey.
     */

    /* nameRingOffset += Math.sin(0.001);
    for(let i = 0; i < referenceListOfOdysseys.length; i++){
        referenceListOfOdysseys[i].nameRingMaterial.map.offset.x = nameRingOffset;
    }*/


    // Update controls for auto-rotate.
    if (!updateCameraRotation) {
        controls.update();
    }

    // Make all avatars face the camera.
    for(  let i = 0; i < referenceListOfOdysseys.length; i++){
        const odyssey = referenceListOfOdysseys[i].children;
        odyssey[0].lookAt(camera.position);
    }; 

    // Set the mouseOverEffect.
    calculateMouseOverLocation(highlightTarget,camera);
    

    // Render the scene
    renderer.render(scene, camera);

    // Re-call Animation
    window.requestAnimationFrame(animate);

};




// On window resize:
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight);
}

// EventListeners.
window.addEventListener('resize', onWindowResize, false); 
document.addEventListener('keydown', OnKeyDown);
document.addEventListener('keyup', OnKeyUp);

animate();