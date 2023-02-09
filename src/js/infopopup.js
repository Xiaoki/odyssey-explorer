import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { fadeOutScene } from "./transitions";
import gsap from "gsap";
import { Vector3 } from "three";
import { font } from "./mouseOver";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let scene;
let previouslySelectedOdyssey
let camera;
let controls

// Line Geometry for info popup
const infoLineMaterial = new LineMaterial({color: 0xFFFFFF, linewidth: 1, transparent: true, opacity: 0.8});

/**
 * Handle the incoming click.
 * @param {scene} mainScene 
 * @param {odyssey} targetOdyssey 
 */
const HandleOdysseyClick = (mainScene, targetOdyssey, mainCamera, mainControls, turnOfforOnControlsUpdate, activeInfoObject) => 
{
    scene = mainScene; // the main scene object from index.js.
    camera = mainCamera; // the main camera object.
    controls = mainControls;


    // if second click. Handle zoom and fade.
    if (previouslySelectedOdyssey == targetOdyssey) 
    {
        HandleSecondClickOnOdyssey(previouslySelectedOdyssey, turnOfforOnControlsUpdate);
    }

    // if first click. Generate object placement.
    if( !previouslySelectedOdyssey || previouslySelectedOdyssey != targetOdyssey) 
    {      
        previouslySelectedOdyssey = targetOdyssey;

        if(activeInfoObject){
            activeInfoObject.removeFromParent();
            console.log(activeInfoObject);
        }

        return GenerateInfoObject(targetOdyssey);
    }




}

const GenerateInfoObject = (odyssey) => {
    
    // Group to hold all drawn objects.
    const infoObjectGroup = new THREE.Group();

    // Build up the line shape.
    const lineVectors = [];
    const firstPoint = new Vector3(1.2, 0, 0);
    const secondPoint = new Vector3(1.6, 0 ,0);
    const thirdPoint = new Vector3(1.9, 2, 0)
    const fourthPoint = new Vector3(2.2, 2, 0);

    

    lineVectors.push(firstPoint,secondPoint,thirdPoint,fourthPoint);

    // LineGeo does not take Vectors. Convert to array with numbers.
    const pointsArray = [];
    for( let i = 0; i < lineVectors.length; i++)
    {
        pointsArray.push(lineVectors[i].x, lineVectors[i].y, lineVectors[i].z);
    }

    // Create Line geometry.
    const infoLineGeometry = new LineGeometry();
	infoLineGeometry.setPositions(pointsArray);
    infoLineMaterial.resolution.set(window.innerWidth, window.innerHeight); // LineMaterial requires this otherwise its a big blob.

    // Create underline for call to action.
    const underLinePoints = [2.5, 2, 0, 5, 2, 0 ] // Array with vectors as numbers because LineGeometry doesnt accept vectors.
    const underLineGeometry = new LineGeometry();
    underLineGeometry.setPositions(underLinePoints);
    const underlineMesh = new Line2(underLineGeometry, infoLineMaterial);
    underlineMesh.computeLineDistances();
    underlineMesh.scale.set(1,1,1);
    infoObjectGroup.add(underlineMesh);

    // Create arrow head
    const arrowPoints = [1.2, -0.15 , 0, 1.05, 0, 0, 1.2, 0.15, 0] // Array with vectors as numbers because LineGeometry doesn't accept vectors.
    const arrowHeadGeometry = new LineGeometry();
    arrowHeadGeometry.setPositions(arrowPoints);
    const arrowHeadMesh = new Line2(arrowHeadGeometry, infoLineMaterial);
    arrowHeadMesh.computeLineDistances();
    arrowHeadMesh.scale.set(1,1,1);
    infoObjectGroup.add(arrowHeadMesh);


    // Construct the line mesh and add to group.
    const infoLine = new Line2( infoLineGeometry, infoLineMaterial );
	infoLine.computeLineDistances();
	infoLine.scale.set( 1, 1, 1 );
	infoObjectGroup.add( infoLine );

    // Generate Name of the Odyssey.
    const nameObject = generateTheNameObject(odyssey.name, 0.3);
    const subtitleObject = generateTheNameObject(`Click to enter`, 0.2)
    const connectedTitle = generateTheNameObject(`Connections:`, 0.15);
    const momStakedTitle = generateTheNameObject(`MOM Staked:`, 0.15);

    // Calculate and generate total connections.
    let amountOfConnections = odyssey.iStakedInConnections.length + odyssey.mutualStakedConnections.length + odyssey.mutualStakedConnections.length;
    amountOfConnections = amountOfConnections.toString();
    const amountOfConnectionsObject = generateTheNameObject(amountOfConnections, 0.15);

    // Generate total amount staked text
    let totalAmountStaked = odyssey.momStaked;

    // Safety check if staked moms is valid if not make it 0.
    if ( totalAmountStaked ) {
        totalAmountStaked = totalAmountStaked.toString();
    } else {
        totalAmountStaked = 0;
        totalAmountStaked = totalAmountStaked.toString();
    }  
    const totalAmountStakedObject = generateTheNameObject(totalAmountStaked, 0.15);


    // Set position of all Object in the group.
    nameObject.position.set(2.5, 2.6, 0);
    subtitleObject.position.set(2.53,2.2,0);
    connectedTitle.position.set(2.5, 1.7, 0)
    momStakedTitle.position.set(2.5, 1.4, 0);
    amountOfConnectionsObject.position.set(4.1, 1.7, 0);
    totalAmountStakedObject.position.set(4.1, 1.4, 0);

    // Add objects to the group.
    infoObjectGroup.add(nameObject);
    infoObjectGroup.add(subtitleObject);
    infoObjectGroup.add(connectedTitle);
    infoObjectGroup.add(momStakedTitle);
    infoObjectGroup.add(amountOfConnectionsObject);
    infoObjectGroup.add(totalAmountStakedObject);
   

    // Place the grup at the center of the selected Odyssey.
    if(odyssey.position.x == 0 || odyssey.position.y == 0 || odyssey.position.z == 0) {
        console.log(`triggered`)
        infoObjectGroup.position.set((odyssey.position.x + 2), odyssey.position.y, odyssey.position.z);
    } else {
        infoObjectGroup.position.set(odyssey.position.x, odyssey.position.y, odyssey.position.z);
    }
    
    // Calculate the Y rotation to start looking towards the direction of the camera.
   


    // Return the build info object.
    return infoObjectGroup

    
    
}

const HandleSecondClickOnOdyssey = (odyssey, turnOfforOnControlsUpdate) => 
{
    
    // Start the fade out.
    fadeOutScene();
    
    // Start the zoom.
    gsap.to(camera.position, {
        duration: 1.5,
        x: odyssey.position.x,
        y: odyssey.position.y,
        z: odyssey.position.z,
        
        onStart: function() {
            turnOfforOnControlsUpdate(true);
            console.log(`Target is: `)
            console.log(odyssey.position);
            controls.enabled = false;
            controls.autoRotate = false; 
            controls.enablePan = false;
        },

        onUpdate: function() {
        },

        onComplete: function() {
            turnOfforOnControlsUpdate(false);
        }


    });

    // Forward user to Unity endpoint.
    
}

const generateTheNameObject = (textToGenerate, textSize) => {

    const print = textToGenerate;	
    const size = textSize;
    
    const textGeometry = new TextGeometry(print, 
        {
            font: font,
            size: size, 
            height: 0.02,
            curveSegments: 12,
            bevelEnabled: false,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 1
        });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.7 });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    
    return text;
     
}



export { HandleOdysseyClick };