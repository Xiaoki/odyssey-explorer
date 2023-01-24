import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier.js';
import { FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import Bender from './Bender.js';
import { DoubleSide, Line, RepeatWrapping } from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

/**
 * The Odyssey class extend from THREE.MESH.
 */

class Odyssey extends THREE.Mesh {

    constructor(geometry, material, number, wallet, name, url, nameRingMaterial)
    {
        // Reference THREE.Mesh
        super(geometry, material);

        this.material = material;
        this.geometry = geometry;
        this.number = number;
        this.wallet = wallet;
        this.name = name;
        this.url = url;
        this.isOdyssey = true;
        this.nameRingMaterial = nameRingMaterial;

        this.temporallyFillStakeArrays();
    }

    // Material for connections.
    lineMaterial = new LineMaterial({ color: 0xdda4de, linewidth: 2, transparent: true, opacity: 0.5});
    mutualLineMaterial = new LineMaterial({color: 0x01FFB3, linewidth: 2, transparent: true, opacity: 0.5})
    iStakedInMaterial = new LineMaterial({ color: 0xFF8801, linewidth: 2, transparent: true, opacity: 0.5})


    // Array to hold all connected Odysseys.
    allRandomNumbers = [];

    // Arrays for connected Odysseys.
    mutualStakedConnections = [];
    stakedInMeConnections = [];
    iStakedInConnections = [];

    // FOR TESTING: FILL ARRAYS ABOVE.
    temporallyFillStakeArrays = () =>
    {
        let numbers = 50; // ID will be between 0 and this number.
        const allRandomNumbers = []; // Used to check for duplicated.

        // Check if the random generate ID is a duplicate or not.
        const checkIfNumberIsUsed = (number) => {
            if (allRandomNumbers.includes(number))
            {   
                return true;
            } else {
                return false;
            }
        }

        // Populate every Odyssey with 5 connections per array.
        for (let i = 0; i < 5; i++) {
            
            let randomId;

            do {
                randomId = Math.floor(Math.random() * numbers);
            } while (checkIfNumberIsUsed(randomId))
            this.mutualStakedConnections.push(randomId);
            allRandomNumbers.push(randomId);
            
            do {
                randomId = Math.floor(Math.random() * numbers);
            } while (checkIfNumberIsUsed(randomId))
            this.iStakedInConnections.push(randomId);
            allRandomNumbers.push(randomId);

            do {
                randomId = Math.floor(Math.random() * numbers);
            } while (checkIfNumberIsUsed(randomId))
            this.stakedInMeConnections.push(randomId);
            allRandomNumbers.push(randomId);



            
        }


    }

    /**
     * For dev only:
     * Generate random ID's to link to other Odysseys.
     */

    // MaxAmount = amount of Odysseys in the world.
    randomConnection = (maxAmount) => 
    {
        const amountToGenerate = 10;

        for (let i = 0; i < amountToGenerate; i++ )
        {
            const object = {
                id: Math.floor(Math.random() * maxAmount),
            }

            this.allRandomNumbers.push(object); 
        }
    }

    buildConnectionLines = (referenceArray, scene, activeLinesArray) =>
    {
    
        const maxOdysseyConnectionLineHeight = 10;
        const newActivelinesArray = [];
        
        if (activeLinesArray) 
        {
            for(let i = 0; i < activeLinesArray.length; i++)
            {
                scene.remove(activeLinesArray[i]);
            }
        };
        
        const linesToBeDrawnArray = [...this.mutualStakedConnections, ...this.iStakedInConnections, ...this.stakedInMeConnections];


        for (let i = 0; i < linesToBeDrawnArray.length; i++) 
        {

            
            // Get the connected Odessey from global reference.
            //const foundOdyssey = referenceArray.filter( planet => planet.number === this.linesToBeDrawnArray[i].id)[0];
            const foundOdyssey = referenceArray.find( item => item.number == linesToBeDrawnArray[i] );

            // Process if found.
            if (foundOdyssey) 
            {
                // Create random line hight and calculate middle position
                //const randomLineHeight = (Math.random() * maxOdysseyConnectionLineHeight ) * (Math.random() > 0.5 ? 1 : -1 );
                const randomLineHeight = -20 //(Math.random() * maxOdysseyConnectionLineHeight ) * -1;
                let middlePosition = new THREE.Vector3((this.position.x + foundOdyssey.position.x) /2, randomLineHeight, (this.position.z + foundOdyssey.position.z) /2);
                
                // calculate start XYZ for the line.
                //const direction = this.isObject3D.lookAt(foundOdyssey);

                //console.log(foundOdyssey.position);
                const direction = new THREE.Vector3();
                direction.subVectors(this.position, foundOdyssey.position ).normalize();
                const startVector = new THREE.Vector3();
                startVector.addVectors(this.position, direction.multiplyScalar(-0.7));

                const newY = this.position.y - 0.8;
                //const beginVector = new THREE.Vector3(this.position.x, newY, this.position.z)
                startVector.y = newY;
                const secondVector = new THREE.Vector3(startVector.x, newY - 1, startVector.z);
                


                // Create the curve                
                const curve = new THREE.CubicBezierCurve3(
                    startVector,
                    secondVector,
                    middlePosition,
                    foundOdyssey.position,
                );    

                // Get XYZ along the curve.
                const curvePoints = curve.getSpacedPoints(50);
        

                // Prepare array of numbers for line geometry ( doesnt accept vectors)
                const linePoints = [];
                

                // Build the array for Line from curve Points.
                for (let i = 0; i < curvePoints.length; i++) 
                {
                    linePoints.push(curvePoints[i].x, curvePoints[i].y, curvePoints[i].z);
                }
                
                const lineGeometry = new LineGeometry();
                lineGeometry.setPositions(linePoints);

                let materialToUseForLine = this.lineMaterial;

                // Filter what type for color:
                if(this.mutualStakedConnections.includes(foundOdyssey.number))
                {
                    materialToUseForLine = this.mutualLineMaterial;
                } else if(this.iStakedInConnections.includes(foundOdyssey.number))
                {
                    materialToUseForLine = this.iStakedInMaterial;
                }

                // If staked in me use standard material
                materialToUseForLine.resolution.set(window.innerWidth, window.innerHeight);              
                const drawLine = new Line2(lineGeometry,materialToUseForLine);
                
                // Add lines to array
                newActivelinesArray.push(drawLine);
                // Add line to the scene.
                scene.add(drawLine);

            }

            
            
        }
        
        return newActivelinesArray;
    }


}



    /**
     * Build the curve and bend text for the animation.
     * 
     * @param {Vector3} position 
     */


/**
 * Create a new Odyssey. Returns an Odyssey object.
 */

//Setup texture reflection for the glass effect of the Odyssey
const environmentReflectionImage = new THREE.TextureLoader().load('./images/small/BasicSkyboxHD.jpg')
environmentReflectionImage.mapping = THREE.EquirectangularRefractionMapping;

// Setup Base geometry and material for the Odysseys.
const avatarGeometry = new THREE.CircleGeometry(0.8, 26); //Standard for all avatars.
const odysseySphereGeometry = new THREE.SphereGeometry( 1,16,16);
const odysseyMaterial = new THREE.MeshPhysicalMaterial(
    {
        color: 0xFFFFFF,
        envMap: environmentReflectionImage,
        transmission: 1,
        opacity: 0.3,
        side: THREE.BackSide,
        ior: 1.5,
        metalness: 0.3,
        roughness: 0,
        specularIntensity: 1,
        transparent: false,
    }
)

// Setup ring around odyssey mesh
const nameRingGeometry = new THREE.CylinderGeometry(1.2,1.2,0.5,22,1, true);


const createOdyssey = (id, wallet, name, url) =>
{

    //TEMP: Setup URL for temp avatars.
    const standardTextures = [
        "./images/small/temp1.jpg", 
        "./images/small/temp2.jpg", 
        "./images/small/temp3.jpg", 
        "./images/small/temp4.jpg",
        "./images/small/temp5.jpg",
        "./images/small/avatarTest.jpg", 
    ];   

    //TEMP: Load random texture from the standard textures array.
    const randNum = Math.floor(Math.random() * (standardTextures.length));
    const randTexture = standardTextures[randNum];
    const texture = new THREE.TextureLoader().load(randTexture);
    texture.wrapS = THREE.RepeatWrapping;
    const avatarMaterial = new THREE.MeshBasicMaterial(
        {
            side: THREE.DoubleSide,
            map: texture
        });

    // Construct avatar Mesh.
    const avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
    
    // Create custom material for name ring.
    const nameRingMaterial = new THREE.MeshBasicMaterial({transparent: true, side: THREE.DoubleSide});

    // Construct odyssey ring mesh.
    const nameRingMesh = new THREE.Mesh(nameRingGeometry, nameRingMaterial);

    /** 
     * Build text texture for around the odyssey
     */
    const drawCanvas = document.createElement('canvas');
    const drawContent = drawCanvas.getContext('2d');
    drawCanvas.width = 1000;
    drawCanvas.height = 100;
    drawContent.font = "Bold 40px Trebuchet MS";
    
    
    drawContent.fillStyle = "rgba(0, 0, 0, 0.1)";
    drawContent.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

    // Draw the title once.
    drawContent.fillStyle = "rgba(245, 199, 255, 0.9";
    drawContent.fillText(name, 0, 60);
    drawContent.strokeStyle = "rgba(124, 86, 133)";
    drawContent.strokeText(name, 0, 60);

    // Draw the name a second time.
    drawContent.fillStyle = "rgba(245, 199, 255, 0.9";;
    drawContent.fillText(name, 500, 60);
    drawContent.strokeStyle = "rgba(124, 86, 133)";
    drawContent.strokeText(name, 500, 60);





    const nameTexture = new THREE.Texture(drawCanvas);
    nameTexture.needsUpdate = true;

    nameRingMesh.material.map = nameTexture;
    nameRingMesh.material.map.wrapS = RepeatWrapping;
    
 

    // Create new Odyssey from class.
    const odyssey = new Odyssey(odysseySphereGeometry, odysseyMaterial, id, wallet, name, url, nameRingMaterial)
    
    // Add the custom avatar image mesh to the odyssey.
    odyssey.add(avatarMesh);
    //odyssey.add(nameRingMesh);

    return odyssey;
};




export { Odyssey, createOdyssey };
