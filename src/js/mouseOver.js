//import { pointer, camera, referenceListOfOdysseys, scene } from "./index.js";
import * as THREE from 'three';
import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';

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
const infoObjectMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true, map: infoObjectTexture});
const infoObjectMesh = new THREE.Mesh(infoObjectGeo, infoObjectMat);
infoObjectMesh.visible = false;

// Construct name sign
const namePlaneGeo = new THREE.PlaneGeometry(1, 0.5);
const namePlaneMat = new THREE.MeshStandardMaterial({transparent: true, side: THREE.DoubleSide});
const namePlaneMesh = new THREE.Mesh(namePlaneGeo, namePlaneMat);
mouseOverMesh.add(namePlaneMesh);
namePlaneMesh.position.set(0,-0.6,0); //Local position. Is attached to mouseOverMesh.

const DrawNameOneCanvas = (name) =>
{
    // Draw name texture
    const odysseyNameCanvas = document.createElement('canvas');
    const odysseyNameContent = odysseyNameCanvas.getContext('2d');
    odysseyNameCanvas.width = 400;
    odysseyNameCanvas.height = 120;
    odysseyNameContent.font = "Bold 40px Trebuchet MS";


    // fill it.
    odysseyNameContent.fillStyle = "rgba(0, 0, 0, 0";
    odysseyNameContent.fillRect(0, 0, odysseyNameContent.width, odysseyNameContent.height);

    // Write name
    odysseyNameContent.textBaseline = "middle";
    odysseyNameContent.textAlign = "center";
    odysseyNameContent.fillStyle = "rgba(1, 255, 179, 1";
    odysseyNameContent.fillText(name, 200, 30);


    const odysseyNameTexture= new THREE.Texture(odysseyNameCanvas);
    odysseyNameTexture.needsUpdate = true;

    namePlaneMesh.material.map = odysseyNameTexture;
    //namePlaneMesh.material.map.wrapS = THREE.RepeatWrapping;
}




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

            // Set name under the Odyssey.
            DrawNameOneCanvas(highlightTarget.name);

             // if the highlight is set to invisble from previous selection set to visible now.
             if(!mouseOverMesh.visible)
             {
                 mouseOverMesh.visible = true;
             }



            // Set sizes for the highlights.

            if ( ray[0].distance > 50) {

                mouseOverMesh.scale.set(0.3, 0.3);
                namePlaneMesh.scale.set(2,2,2);
                namePlaneMesh.position.set(0, -0.8, 0.05) // Small Z value to prevent flickering.

            } else if (ray[0].distance > 25) {

                    mouseOverMesh.scale.set(0.5, 0.5);
                    namePlaneMesh.scale.set(1.5,1.5,1.5);
                    namePlaneMesh.position.set(0, -0.7, 0.05) // Small Z value to prevent flickering.

                } else if (ray[0].distance > 10) {

                    mouseOverMesh.scale.set(1, 1);
                    namePlaneMesh.scale.set(1,1,1);
                    namePlaneMesh.position.set(0, -0.6, 0.05)   // Small Z value to prevent flickering.

                    } else {
                        mouseOverMesh.scale.set(1.5, 1.5);
  
                    }

            // Set name under the Odyssey.
            DrawNameOneCanvas(highlightTarget.name);

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
    mouseOverMesh.position.set(mouseOverXYZ.x + 0.01, mouseOverXYZ.y + 0.01, mouseOverXYZ.z + 0.01) ;
    mouseOverMesh.lookAt(camera.position);

}


const renderOdysseyInformationPopup = (odyssey) => 
{   

    /*
    if(!infoObjectMesh.visible)
    {
        infoObjectMesh.visible = true;
    }

    // added a small offset +0.01 to prevent conflict with avatar image on the exact same position and orientation
    infoObjectMesh.position.set(odyssey.position.x , odyssey.position.y, odyssey.position.z);
    */
}




/**
 * Prepare 3D highlight.
 */
const highlighd3DMaterial = new THREE.MeshBasicMaterial({color: 0x01FFB3, transparent: true, opacity: 0.8});

const load3DHighlight = () => 
{
    const gltfLoader = new GLTFLoader();
    let model3D = gltfLoader.load('./images/highlight.glb', (gltf) => 
        {
        const model = gltf.scene;
        model.scale.set(1.2,1.2,1.2);
        model.scale.set(5,5,5);
        
        model.children.forEach( child => 
            {
                child.material = highlighd3DMaterial;
            });
        return model
        
        });

    return model3D;
        
}

const Place3DHighlight = (targetLocation) =>
{
    highlight3Dmodel.position.set(targetLocation.x, targetLocation.y, targetLocation.z);
}




export {Place3DHighlight, load3DHighlight, doHighlightRayTrace, calculateMouseOverLocation, highlightTarget, mouseOverMesh, setActiveOdyssey, renderOdysseyInformationPopup, infoObjectMesh, namePlaneMesh};


