import * as THREE from 'three';
import { pointer, camera, referenceListOfOdysseys, scene} from "./index.js";

// Construct the highlight object
const mouseOverGeo = new THREE.PlaneGeometry(1,1);
const mouseOverTexture = new THREE.TextureLoader().load('./images/crossair.png');
const mouseOverMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF, transparent: true, opacity: 1, map: mouseOverTexture});
const mouseOverMesh = new THREE.Mesh(mouseOverGeo, mouseOverMat);

// Const Variables for Development.
const mouseOverDistancefromCamera = 5;

let highlightTarget;

// Call every frame to do a raytrace for the mouse over effect.
const doHighlightRayTrace = () =>
{
    
    // Create raycaster.
    const highlightRaycaster = new THREE.Raycaster()
    
    // Set start en direction for raycast.
    highlightRaycaster.setFromCamera(pointer, camera);

    // Execute Raycast and respond only to objects in the referelist list.
    const ray = highlightRaycaster.intersectObjects(referenceListOfOdysseys, false);

    if(ray.length > 0)
    {   
        
        
        if (ray[0].object == highlightTarget) 
        {
            return;

        } else {
            
            // Set the new Odyssey as highlight target.
            highlightTarget = ray[0].object;
            
            // calculate new mouseOver XYZ.
            calculateMouseOverLocation(highlightTarget);
        }
        
    }

}



const calculateMouseOverLocation= () =>
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
    
    // find a better solution for this.
    scene.add(mouseOverMesh);
}

export {doHighlightRayTrace, calculateMouseOverLocation};

/**
 * Overlay plan
*/
    // Raycast calls this function on a hit. Sends hit object here.
    // Calculate the distance between camera XYZ and Planet XYZ.
    // Move X amount over into that direction and return the XYZ.
    // Spawnm a plane on that XYZ and make it lookat() the camera.