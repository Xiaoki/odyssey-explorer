import * as THREE from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { Flow } from 'three/examples/jsm/modifiers/CurveModifier.js';
import { FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { ClampToEdgeWrapping, DoubleSide, Line, RepeatWrapping, Vector3 } from 'three';
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
    lineMaterial = new LineMaterial({ color: 0xFCF200, linewidth: 2, transparent: true, opacity: 0.8}); // before was 0xdda4de
    mutualLineMaterial = new LineMaterial({color: 0x01FFB3, linewidth: 2, transparent: true, opacity: 0.8,})
    iStakedInMaterial = new LineMaterial({ color: 0x0abaff, linewidth: 2, transparent: true, opacity: 0.8})
    secondaryConnectionMaterial = new LineMaterial({color: 0xFFFFFF, linewidth: 1, transparent: true, opacity: 0.2 })
    generalLineMaterial = new LineMaterial({ color: 0x01FFB3, linewidth: 2, transparent: true, opacity: 0.8})



    // Array to hold all connected Odysseys.
    allRandomNumbers = [];

    // Arrays for connected Odysseys.
    mutualStakedConnections = [];
    stakedInMeConnections = [];
    iStakedInConnections = [];

    // FOR TESTING: FILL ARRAYS ABOVE.
    temporallyFillStakeArrays = () =>
    {
        let numbers = 200; // ID will be between 0 and this number.
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
                let materialToUseForLine;
                // Filter what type for color:
                if(this.mutualStakedConnections.includes(foundOdyssey.number))
                {
                    materialToUseForLine = this.mutualLineMaterial;
                } else if(this.iStakedInConnections.includes(foundOdyssey.number))
                {
                    materialToUseForLine = this.iStakedInMaterial;
                } else {
                    materialToUseForLine = this.lineMaterial;
                }
            
                // Draw the actual line.
                this.drawLine(this.position, foundOdyssey.position, scene, newActivelinesArray, materialToUseForLine );
                
            } 
            

            
            this.buildSecondaryConnectionLines(foundOdyssey, referenceArray, scene, newActivelinesArray);
        }

        
        return newActivelinesArray;
    }

    buildSecondaryConnectionLines = (odyssey, referenceArray, scene, newActivelinesArray) => 
    {
        // Collect all connection from the current Odyssey.
        //const collectionOfOdysseys = [...odyssey.mutualStakedConnections, ...odyssey.iStakedInConnections, ...odyssey.stakedInMeConnections];
        const collectionOfOdysseys = odyssey.mutualStakedConnections;

        for (let i = 0; i < collectionOfOdysseys.length; i++) 
        {
            const startPointOdyssey = odyssey.position;
            const EndPointOdyssey = referenceArray.find( item => item.number == collectionOfOdysseys[i] ).position;
            
            this.drawLine(startPointOdyssey, EndPointOdyssey, scene, newActivelinesArray, this.secondaryConnectionMaterial)
        }
        

    }

    drawLine = (startPointOdyssey, EndPointOdyssey, scene, newActivelinesArray, lineMaterialToUse) => 
    {   
        // set XYZ for middle point.
        // const curveDepth = -80;
        const curveDepth = calculateLineMiddlePointDepth(startPointOdyssey, EndPointOdyssey);
        
        const middlePoint= new THREE.Vector3(( startPointOdyssey.x + EndPointOdyssey.x ) /2, curveDepth, ( startPointOdyssey.z + EndPointOdyssey.z) / 2 );

        // Calculate startpoint( a little below the Odysseys.)
        const direction = new THREE.Vector3;
        direction.subVectors(startPointOdyssey, EndPointOdyssey).normalize();
        const startPoint = new THREE.Vector3();
        startPoint.addVectors(startPointOdyssey, direction.multiplyScalar(-0.7)); // Move sideways away from Odyssey center.
        
        // Check if it is the center odyssey or not. Ifso move start position futher down.
        if(startPointOdyssey.y == 0 && startPointOdyssey.x == 0 && startPointOdyssey.z == 0 ) {
            startPoint.y = startPoint.y - 2.5;
        }else{
            startPoint.y = startPoint.y - 0.8;         // Move down away from Odyssey center
        }

        //Calculate endpoint ( little below the endPoint );
        direction.subVectors(EndPointOdyssey, startPointOdyssey).normalize();
        const endPoint = new THREE.Vector3();
        endPoint.addVectors(EndPointOdyssey, direction.multiplyScalar(-0.7));
        endPoint.y = endPoint.y - 0.8;

        //Calculate second point
        const secondPoint = new THREE.Vector3(startPoint.x, (startPoint.y - 1), startPoint.z);

        // Draw the curve and set points along the line.             
        const curve = new THREE.CubicBezierCurve3( // build curve
            startPoint,
            secondPoint,
            middlePoint,
            endPoint,
        );   
        
        const pointsAlongTheLine = curve.getSpacedPoints(50); // get points

        // Prepare the points in an array. (because the geometry doesn't accept Vectors);
        let arrayOfPoints = []
        for (let i = 0; i < pointsAlongTheLine.length; i++) 
        {
            arrayOfPoints.push(pointsAlongTheLine[i].x, pointsAlongTheLine[i].y, pointsAlongTheLine[i].z);
        }
        
        // Create Line geometry.
        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(arrayOfPoints);


        let materialToUseForLine = lineMaterialToUse;
        materialToUseForLine.resolution.set(window.innerWidth, window.innerHeight);              
        const drawLine = new Line2(lineGeometry, materialToUseForLine);
        
        // Add lines to array
        newActivelinesArray.push(drawLine);
        // Add line to the scene.
        scene.add(drawLine);

        
    }


}





/**
 * Create a new Odyssey. Returns an Odyssey object.
 */

//Setup texture reflection for the glass effect of the Odyssey
const environmentReflectionImage = new THREE.TextureLoader().load('./images/odyssey.orb.pattern.jpg')
environmentReflectionImage.mapping = THREE.EquirectangularRefractionMapping;

// Setup Base geometry and material for the Odysseys.
const avatarGeometry = new THREE.CircleGeometry(0.7, 26); //Standard for all avatars.
const odysseySphereGeometry = new THREE.SphereGeometry( 1,32,32);
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




const calculateLineMiddlePointDepth = ( startVector, endVector) =>
{
    const lineDistance = startVector.distanceTo(endVector);


    const middlePoint = new Vector3( (startVector.x + endVector.x) /2, (startVector.y + endVector.y) /2, (startVector.z + endVector.z) /2, );

    let curveDepth

    if (lineDistance < 30) {
        curveDepth = middlePoint.y - 5;
    } else if (lineDistance < 50) {
        curveDepth = middlePoint.y - 20;
    } else if (lineDistance < 80) {
        curveDepth = middlePoint.y - 30;
    } else {
        curveDepth = -40;
    }


    return curveDepth
}

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
 
    // Create new Odyssey from class.
    const odyssey = new Odyssey(odysseySphereGeometry, odysseyMaterial, id, wallet, name, url, nameRingMaterial)
    
    // Add the custom avatar image mesh to the odyssey.
    odyssey.add(avatarMesh);
    //odyssey.add(nameRingMesh);


    return odyssey;
};




export { Odyssey, createOdyssey };
