    //import { pointer, camera, referenceListOfOdysseys, scene } from "./index.js";
    import * as THREE from 'three';
    import { MeshBasicMaterial, Vector3 } from 'three';
    import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
	import { TextGeometry, TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

    /**
     * Important variables.
     */

    let activeOdyssey, highlightTarget;
    let font;
    let odysseyNameObject;
    let cameraObject;
    let rayDistance;


    // Material for 3D highlight mesh.
    const mat3DHighlight = new THREE.MeshBasicMaterial({color: 0x9EEEFF, transparent: true, opacity: 0.8})

    // Const Variables for Development.
    const mouseOverDistancefromCamera = 5;

    // set active Odyssey for the second highlight.
    const setActiveOdyssey = (Odyssey) => 
    {
        activeOdyssey = Odyssey;

    }

    // Call every frame to do a raytrace for the mouse over effect.
    const doHighlightRayTrace = (pointer, camera, referenceListOfOdysseys, scene, Highlight3DModel) =>
    {
        if(!cameraObject)
        {
            cameraObject = camera;
        }
        
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
                
                rayDistance = ray[0].distance;

                // Set the new Odyssey as highlight target.
                highlightTarget = ray[0].object;

                if(!Highlight3DModel.visible)
                {
                    Highlight3DModel.visible = true;
                }
                
                // Set 3D highlight model on the oddyssey        
                Highlight3DModel.position.set(highlightTarget.position.x, highlightTarget.position.y, highlightTarget.position.z);

                // Set scale of highlight based on distance,.
                if(ray[0].distance < 45){
                    Highlight3DModel.scale.set(1.5,1.5,1.5);
                   
                } else if(ray[0].distance < 100) 
                {
                    Highlight3DModel.scale.set(2,2,2);
                    
                } else {
                    Highlight3DModel.scale.set(2.5,2.5,2.5);
                    
                }

                // if it is the center odyssey ( your own. Set bigger highlight);
                const pos3D = highlightTarget.position; 
                if(highlightTarget.name == 'My Odyssey' || pos3D.x === 0 && pos3D.y === 0 && pos3D.z === 0) 
                {

                    Highlight3DModel.scale.set(3,3,3);
                }

                if (odysseyNameObject) {
                    scene.remove(odysseyNameObject);
                }
                
                odysseyNameObject = generateOdysseyName(highlightTarget.name);
                handleNamePlacement(odysseyNameObject, camera);
                

                scene.add(odysseyNameObject);


            }
            
        }

    }

    const LoadFont = () =>
    {

        const loader = new FontLoader();
        loader.load('fonts/' + 'Poppins_Regular.json', (response) =>
        {
            font = response;
        })
    }
    LoadFont(); // Get the font for the text


    const generateOdysseyName = (text) =>
    {
        const print = text;	
        const size = 0.5;
        
        if (font) {
            const textGeometry = new TextGeometry(print, 
                {
                    font: font,
                    size: size, 
                    height: 0.2,
                    curveSegments: 12,
                    bevelEnabled: false,
                    bevelThickness: 0.03,
                    bevelSize: 0.02,
                    bevelOffset: 0,
                    bevelSegments: 1
                });

            // Center the text
            textGeometry.computeBoundingBox();
            textGeometry.translate(
                - textGeometry.boundingBox.max.x * 0.5,
                - textGeometry.boundingBox.max.y * 0.5,
                - textGeometry.boundingBox.max.z * 0.5
            )
            const textMaterial = new THREE.MeshBasicMaterial({ color: 0x9EEEFF, });
            const text = new THREE.Mesh(textGeometry, textMaterial);
            return text;
        } 

    }

    const handleNamePlacement = (nameObject) => 
    {

        // Set object scale based on distance.
        let offsetNameLocationVertical;


        if (highlightTarget.position.x == 0 && highlightTarget.position.y == 0 && highlightTarget.position.z == 0)
        {
            nameObject.scale.set(1.2, 1.2, 1.2);
            offsetNameLocationVertical = 6;
            

        } else if (rayDistance < 45) {
            nameObject.scale.set(1.2, 1.2, 1.2);
            offsetNameLocationVertical = 3;

        } else if( rayDistance < 80) 
        {
            nameObject.scale.set(2,2,2);
            offsetNameLocationVertical = 3;
        } else if( rayDistance < 120) 
        {
            nameObject.scale.set( 2.5, 2.5, 2.5)
            offsetNameLocationVertical = 4;      
        } else {
            nameObject.scale.set(3,3,3)
            offsetNameLocationVertical = 5;
        }

        
        const pos = new Vector3(highlightTarget.position.x, highlightTarget.position.y, highlightTarget.position.z)
        nameObject.position.set(pos.x, pos.y + offsetNameLocationVertical, pos.z);
        
        HighlightHandleLookAt();
        
    }


    const HighlightHandleLookAt = () => 
    {
        if(odysseyNameObject) 
        {
            odysseyNameObject.lookAt(cameraObject.position);
        }
        
    }




    /**
     * Prepare 3D highlight.
     */
    const highlighd3DMaterial = new THREE.MeshBasicMaterial({color: 0x01FFB3, transparent: true, opacity: 0.8});
    // let testModel = new THREE.Object3D;

    const load3DHighlight = (scene) => 
    {
        const gltfLoader = new GLTFLoader();
        const highlightModel = new THREE.Group();

        const test = gltfLoader.load('./images/highlight.glb', (gltf) => 
            {   
                gltf.scene.traverse( child => 
                    {
                        child.material = mat3DHighlight;
                    })
                const children = [... gltf.scene.children];

                for (const child of children)
                {   
                    highlightModel.add(child);
                }

                scene.add(highlightModel);

            });

        return highlightModel;
    
    }

    



    export {HighlightHandleLookAt, load3DHighlight, doHighlightRayTrace, calculateMouseOverLocation, highlightTarget, setActiveOdyssey, renderOdysseyInformationPopup, font, odysseyNameObject};


