//import { pointer, camera, referenceListOfOdysseys, scene } from "./index.js";
import * as THREE from 'three';

/**
 * Important variables.
 */

 let activeOdyssey, highlightTarget;

// Construct the highlight object
const mouseOverGeo = new THREE.PlaneGeometry(1,1);
const mouseOverTexture = new THREE.TextureLoader().load('./images/test3.png');
const mouseOverMat = new THREE.MeshBasicMaterial({color: 0xFFFFFF, transparent: true, map: mouseOverTexture});
const mouseOverMesh = new THREE.Mesh(mouseOverGeo, mouseOverMat);

// Construct the information object to display Odyssey info.
const infoObjectGeo = new THREE.PlaneGeometry(3,3);
const infoObjectTexture = new THREE.TextureLoader().load('./images/Nearby.png');
const infoObjectMat = new THREE.MeshBasicMaterial({color: 0xFFFFFF, transparent: true, map: infoObjectTexture});
const infoObjectMesh = new THREE.Mesh(infoObjectGeo, infoObjectMat);
infoObjectMesh.visible = false;


// Const Variables for Development.
const mouseOverDistancefromCamera = 5;

// set active Odyssey for the second highlight.
const setActiveOdyssey = (Odyssey) => 
{
    activeOdyssey = Odyssey;

    // Removed the mouse over highlight on click.
    mouseOverMesh.visible = false;
}

// Call every frame to do a raytrace for the mouse over effect.
const doHighlightRayTrace = (pointer, camera, referenceListOfOdysseys, scene) =>
{
    
    // Create raycaster.
    const highlightRaycaster = new THREE.Raycaster()
    
    // Set start en direction for raycast.
    highlightRaycaster.setFromCamera(pointer, camera);

    // Execute Raycast and respond only to objects in the referelist list.
    const ray = highlightRaycaster.intersectObjects(referenceListOfOdysseys, false);

    if(ray.length > 0)
    {   
        // Ignore the active Odyssey.
        if (ray[0].object == activeOdyssey)
            {
                return
            }
        
        // if the ray hits the same Odyssey. Ignore it.
        if (ray[0].object == highlightTarget) 
        {
            return;

        } else {
            

            // Set the new Odyssey as highlight target.
            highlightTarget = ray[0].object;

             // if the highlight is set to invisble from previous selection set to visible now.
             if(!mouseOverMesh.visible)
             {
                 mouseOverMesh.visible = true;
             }



            // Set the size of the mouseOverMesh based on raytrace distance.

            if ( ray[0].distance > 50) {
                mouseOverMesh.scale.set(0.3, 0.3);
            } else if (ray[0].distance > 25) {
                    mouseOverMesh.scale.set(0.5, 0.5);
                } else if (ray[0].distance > 10) {
                    mouseOverMesh.scale.set(1, 1);
                    } else {
                        mouseOverMesh.scale.set(1.5, 1.5);
                    }

            
            // calculate new mouseOver XYZ.
            calculateMouseOverLocation(highlightTarget, camera);
        }
        
    }

}



const calculateMouseOverLocation= (highlightTarget, camera) =>
{
    if (highlightTarget == undefined)
    {
        return;
    }

    // Calculate the new position for the mouseOver.
    const direction = new THREE.Vector3;
    direction.subVectors(highlightTarget.position, camera.position).normalize();

    const mouseOverXYZ = new THREE.Vector3();
    mouseOverXYZ.addVectors(camera.position, direction.multiplyScalar(mouseOverDistancefromCamera));

    // Set the world location of the mouseOverImage.
    mouseOverMesh.position.set(mouseOverXYZ.x, mouseOverXYZ.y, mouseOverXYZ.z);
    mouseOverMesh.lookAt(camera.position);

}


const renderOdysseyInformationPopup = (odyssey) => 
{   
    if(!infoObjectMesh.visible)
    {
        infoObjectMesh.visible = true;
    }
    infoObjectMesh.position.set(odyssey.position.x, odyssey.position.y, odyssey.position.z);
}


export {doHighlightRayTrace, calculateMouseOverLocation, highlightTarget, mouseOverMesh, setActiveOdyssey, renderOdysseyInformationPopup, infoObjectMesh};


