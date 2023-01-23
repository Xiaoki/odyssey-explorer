import { random, shuffle } from 'gsap';
import * as THREE from 'three';

// Define rules for placements of Odysseys.
let stakedCircleRadius = 10;
let standardCircleRadius = 30;
const circleRadiusIncreaseValue = 15;
let amountOfOdysseysInNextCircle = 10;
let ringCounter = 1;
let odysseyGroups = [];
const equatorMaxHeight = 5;
const minimalDistanceToEquator = 8;

const placeOdysseyInUniverse = (myOdyssey, listOfOddyseys) =>
{

    // Combine all arrays related to staking.
    let allStakedOdysseys = [...myOdyssey.iStakedInConnections, ...myOdyssey.mutualStakedConnections
, ...myOdyssey.stakedInMeConnections];

    // Shuffle the array. So the planets will be randomly mixed. 
    allStakedOdysseys = shuffleArray(allStakedOdysseys);

    // Collect all actually Odyssey objects in an array.
    const stakedOdysseysObject = [];
    for (let i = 0; i < allStakedOdysseys.length; i++ ) 
    {
        // Locate the actual Odyssey based on its ID number.
        const found = listOfOddyseys.find( item => item.number == allStakedOdysseys[i])
        stakedOdysseysObject.push(found)
    }

    
    // Remove all StakedOdysseys from the ALL Odysseys array. To prevent duplications
    stakedOdysseysObject.map( (item) => 
    {
        const found = listOfOddyseys.find(odyssey => odyssey == item);
        if(found)
        {
            // Remove duplicated Odyssey.
            const index = listOfOddyseys.indexOf(found);
            listOfOddyseys.splice(index, 1)
        }
    });

    // Process and place the staked Odysseys.
    const stakedOdysseyCircles = ProcessStakedOdysseys(myOdyssey, stakedOdysseysObject);

    // Add an X amount of random Odysseys to fill the Universe.
    const RandomOdysseyCircles = ProcessRandomOdysseys(listOfOddyseys);

    // the final object for the Universe. Must be returned and added to the scene in the index.js
    let theUniverse = new THREE.Group();
    theUniverse.add(stakedOdysseyCircles);

    //theUniverse.add(stakedOdysseyCircles);
    //theUniverse.add(randomOdysseysCircles); to be made.

    return theUniverse;
}

// Process given array of Odysseys
const ProcessStakedOdysseys = (myOddysey, stakedOdysseysObject) => 
{   

    // Set limit to amount for the first circle. To make sure we dont overcrowd.

    // Define the amount of Odyssey required to be placed.
    // Then define the space between them for a perfect circle. (offset)
    const amount = stakedOdysseysObject.length;
    const distanceBetweenOdyssey = 360 / amount;

    // Offset will define how far along the circle the odyssey will be placed. 
    let offset = 0;


    // Define a circle
    let circle = new THREE.Group();
    circle.name = "circle" + ringCounter;

    for (let i = 0; i < amount; i++)
    {
        const currentOdyssey = stakedOdysseysObject[i]

        // Calculate radian on circle.
        const radian = offset * (Math.PI / 180);

        // Create var for XZY. Generated below.
        let placementXYZ = new THREE.Vector3();

        // Define what type of stake it is and calculate position..
        if (myOddysey.mutualStakedConnections.includes(currentOdyssey.number)) 
        {   
            // on the equator.
            placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
            placementXYZ.y = 0 ;
            placementXYZ.z = Math.sin(radian) * stakedCircleRadius;


        } else if (myOddysey.iStakedInConnections.includes(currentOdyssey.number))
            {
                // Above the equator
                placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
                placementXYZ.y = minimalDistanceToEquator; //(Math.random() * equatorMaxHeight) + minimalDistanceToEquator;
                placementXYZ.z = Math.sin(radian) * stakedCircleRadius;
                

            } else if (myOddysey.stakedInMeConnections.includes(currentOdyssey.number)) 
                {
                    // Below the equator.
                    placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
                    placementXYZ.y = -minimalDistanceToEquator; //(Math.random() * -equatorMaxHeight) - minimalDistanceToEquator;
                    placementXYZ.z = Math.sin(radian) * stakedCircleRadius;
                    

                } else 
                    {
                      console.log(`Error: Odyssey ${[currentOdyssey.number]} is not related to My Odyssey.`)  
                    }

        // Set offset for the next odyssey.
        offset += distanceBetweenOdyssey;

        // Set position of current odyssey with new XYZ.
        currentOdyssey.position.set(placementXYZ.x, placementXYZ.y, placementXYZ.z);

        
        //console.log(currentOdyssey);

        // Add this Odyssey to circle group.
        circle.add(currentOdyssey);
    }

    // Return the circle group.

    return circle
}

const ProcessRandomOdysseys = (listOfOddyseys) =>
{
    // Setup variables
    let totalAmount = listOfOddyseys.length;
    let radius = 20;
    let amountOfOdysseysInNextRing = 10;
    circleCount = 1;
    let odysseyGroups = [];
    
    console.log(`I received: ${listOfOddyseys.length} unique Odysseys to place.`)
}

// Shuffle an given array.
const shuffleArray = (array) =>
{
    const shuffled = array.sort( (a,b) => 0.5 - Math.random() );

    return shuffled;
}

export {placeOdysseyInUniverse};