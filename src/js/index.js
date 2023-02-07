
/*

Project: Odyssey Explorer
Company: Odyssey B.V
Website: https://odyssey.org/
Author:  Frank Bloemendal

*/

import gsap, { normalize } from "gsap";
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {createOdyssey, buildConnectionLines} from "./odyssey.js";
import { ActivateFirstPerson, OnKeyDown, OnKeyUp } from './firstpersonlogic.js';
import { calculateMouseOverLocation, 
    doHighlightRayTrace, 
    setActiveOdyssey,
    load3DHighlight,
    HighlightHandleLookAt,
    odysseyNameObject,
} from "./mouseOver.js";
import { placeOdysseyInUniverse, drawConnectionsBetweenOdysseys } from "./buildUniverse.js"; 
import { generateGalaxy } from "./galaxy.js";
import { HandleOdysseyClick,  } from "./infopopup.js";



ActivateFirstPerson();

/**
 * For Dev Only
 */

let AmountOfGalaxyToGenereate = 200;
let maxOdysseyConnectionLineHeight = 20;
let MaxOrbitCameraDistance = 200;
let planetAreSpawnedHorizontal = false;
let planetsMaxVerticalSpawnHeight = 100;
const minimalDistanceToPlanetForCamera = 12;



/**
 * Setup the scene.
 */

let scene, canvas, renderer, controls, selectedOdyssey;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2;

let updateCameraRotation = false;

let transitionToPlanetFinished = true;
let activeLinesArray = [];
let leftMouseButtonIsDown = false;
let activeInfoObject;



let meshArray = [];
  
// Scene setup
canvas = document.querySelector(".webgl");
scene = new THREE.Scene();

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
//const backgroundImage = new THREE.TextureLoader().load('./images/small/BasicSkyboxHD.jpg');
//backgroundImage.mapping = THREE.EquirectangularReflectionMapping;
//scene.background = backgroundImage;

const backgroundImage = new THREE.TextureLoader().load('./images/galaxy.jpg');
backgroundImage.mapping = THREE.EquirectangularReflectionMapping;
backgroundImage.needsUpdate = true;
//backgroundImage.encoding = THREE.sRGBEncoding;
scene.background = backgroundImage;


/*
CUSTOM ODYSSEY OPEN SOURCE Skybox
*/
/*
const skyboxGeo = new THREE.BoxGeometry(500,500,500);


const ft = new THREE.TextureLoader().load('./images/skybox_front.png')
const bk = new THREE.TextureLoader().load('./images/skybox_back.png')
const up = new THREE.TextureLoader().load('./images/skybox_up.png')
const dn = new THREE.TextureLoader().load('./images/skybox_down.png')
const rt = new THREE.TextureLoader().load('./images/skybox_right.png')
const lf = new THREE.TextureLoader().load('./images/skybox_left.png')
const skyboxTextures = [ft, bk, up, dn, rt, lf];

const skyboxMaterialArray = skyboxTextures.map( texture => 
  {
      return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
   });

const skyboxMesh = new THREE.Mesh(skyboxGeo, skyboxMaterialArray);
scene.add(skyboxMesh);
*/


/**
 * Add noise to the galaxy.
 */
//scene.add(generateGalaxy());



// update mouse location on screen
function onPointerMove(event){
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    
    // Do raytrace to detect mouseOver for highlight.
    if(!leftMouseButtonIsDown)
    {
        doHighlightRayTrace(pointer, camera, referenceListOfOdysseys, scene, Highlight3DModel);
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
            HandleOdysseyClick(scene, selectedOdyssey, camera, controls, turnOfforOnControlsUpdate, activeInfoObject); 
            return;
        }
        

        selectedOdyssey = targetPlanet.object;
        console.log(selectedOdyssey);

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
        //Highlight3DModel.visible = false;

         //Animate using gsap module.
        gsap.to(camera.position, {
           duration: 1.5,
           x: targetLocation.x,
           y: targetLocation.y,
           z: targetLocation.z,

           onStart: function(){
                transitionToPlanetFinished = false;
                turnOfforOnControlsUpdate(true);
                controls.enabled = false;
                controls.autoRotate = false; 
                controls.enablePan = false;
                activeLinesArray = selectedOdyssey.buildConnectionLines(referenceListOfOdysseys, scene, activeLinesArray); 
                activeInfoObject =  HandleOdysseyClick(scene, selectedOdyssey, camera, controls, turnOfforOnControlsUpdate, activeInfoObject); 
                if(activeInfoObject) 
                {
                    // hide mouseOver on the selected ojbect.
                    Highlight3DModel.visible = false;
                    odysseyNameObject.visible = false;;
                    scene.add(activeInfoObject);
                } 
                        
           },
           onUpdate: function(){
               
               camera.quaternion.copy(startOrientation).slerp(targetOrientation, this.progress());

           },
           onComplete: function(){ 
                turnOfforOnControlsUpdate(false);
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
        const odyssey = createOdyssey(i, "Wallet Address", "ODYSSEY " + i , "test.com");
        listOfOddyseys.push(odyssey);
     }

     referenceListOfOdysseys = [...listOfOddyseys];
 }

 ProcessOdyssey();




// Triggered per frame. All objects will look at the camera.
const lookAtCameraObjects = () =>
{
   
   //Highlight3DModel.rotateY(0.005);
   //Highlight3DModel.rotateX(0.005);
   //Highlight3DModel.rotateZ(0.005);

   if(Highlight3DModel.children.length) {
    //Highlight3DModel.children[0].rotateX(0.003);
    Highlight3DModel.children[0].rotateY(0.01);
    //Highlight3DModel.children[0].rotateZ(0.01);

    Highlight3DModel.children[1].rotateX(-0.005);
    Highlight3DModel.children[1].rotateY(-0.005);
    Highlight3DModel.children[1].rotateZ(-0.005);
   }

   HighlightHandleLookAt();

    
   if(myOdyssey)
    {
        myOdyssey.children[0].lookAt(camera.position);
    }
    
}


// Setup Center Odyssey.
const myOdyssey = createOdyssey(999, "Wallet Address", "My Odyssey", "test.com");
referenceListOfOdysseys.push(myOdyssey);
myOdyssey.scale.set(3,3,3);
scene.add(myOdyssey);

// Construct the universe and add to the scene.
const theUniverse = placeOdysseyInUniverse(myOdyssey, listOfOddyseys);
scene.add(theUniverse);


/**
 * TESTING
 *
 */

const Highlight3DModel = load3DHighlight(scene);
Highlight3DModel.visible = false
Highlight3DModel.scale.set(1.2 , 1.2 , 1.2);


// Build Connection lines for my center odyssey
activeLinesArray = myOdyssey.buildConnectionLines(referenceListOfOdysseys, scene, activeLinesArray);

const turnOfforOnControlsUpdate = (state) => {
    updateCameraRotation = state;
}

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
    //calculateMouseOverLocation(highlightTarget,camera);
    

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
