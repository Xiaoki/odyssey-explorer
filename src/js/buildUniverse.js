import { random, shuffle } from 'gsap';
import * as THREE from 'three';

// Define rules for placements of Odysseys.
let stakedCircleRadius = 10;
let standardCircleRadius = 30;
let circleRadiusIncreaseValue = 10;
let amountOfRandomOdysseysInNextCircle = 10;
let amountOfStakedOdysseysInNextRound = 5;
let ringCounter = 1;
let odysseyGroups = []; // This is for both staked and non-staked.
const equatorMaxHeight = 5;
const minimalDistanceToEquator = 8;
const randomOdysseyMaxSpawnHeight = 20;

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
    while (stakedOdysseysObject.length > 0)
    {
        ProcessStakedOdysseys(myOdyssey, stakedOdysseysObject);
    }

    // Process and place the Random Odysseys.
    while(listOfOddyseys.length > 0)
    {
        ProcessRandomOdysseys(listOfOddyseys);
    }
    

    // the final object for the Universe. Must be returned and added to the scene in the index.js
    let theUniverse = new THREE.Group();


    // Add all circles to the Universe group.
    odysseyGroups.map( (ring) =>
    {
        theUniverse.add(ring);
    });

    return theUniverse;
}

// Process given array of Odysseys
const ProcessStakedOdysseys = (myOddysey, stakedOdysseysObject) => 
{   
    // If there are less Odysseys available than set for next round. Adapt the amount.
    if( stakedOdysseysObject.length < amountOfStakedOdysseysInNextRound) 
    {
        amountOfStakedOdysseysInNextRound = stakedOdysseysObject.length
    }
    
    // Define the amount of Odyssey required to be placed.
    // Then define the space between them for a perfect circle. (offset)
    const amount = amountOfStakedOdysseysInNextRound;
    const distanceBetweenOdyssey = 360 / amount;

    // Offset will define how far along the circle the odyssey will be placed. 
    let offset = 0;

    // Define a circle
    let circle = new THREE.Group();
    circle.name = "circle" + ringCounter;

    // Process the Odyssey location and add them to a ring.
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
            placementXYZ.y = -5 ;
            placementXYZ.z = Math.sin(radian) * stakedCircleRadius;


        } else if (myOddysey.iStakedInConnections.includes(currentOdyssey.number))
            {
                // Above the equator
                placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
                placementXYZ.y =  -10//minimalDistanceToEquator; //(Math.random() * equatorMaxHeight) + minimalDistanceToEquator;
                placementXYZ.z = Math.sin(radian) * stakedCircleRadius;
                

            } else if (myOddysey.stakedInMeConnections.includes(currentOdyssey.number)) 
                {
                    // Below the equator.
                    placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
                    placementXYZ.y =  -15//-minimalDistanceToEquator; //(Math.random() * -equatorMaxHeight) - minimalDistanceToEquator;
                    placementXYZ.z = Math.sin(radian) * stakedCircleRadius;
                    

                } else 
                    {
                      // Random placement
                    placementXYZ.x = Math.cos(radian) * stakedCircleRadius;
                    placementXYZ.y = (Math.random() * equatorMaxHeight) - minimalDistanceToEquator;
                    placementXYZ.z = Math.sin(radian) * stakedCircleRadius;
                    }

        // Set offset for the next odyssey.
        offset += distanceBetweenOdyssey;

        // Set position of current odyssey with new XYZ.
        currentOdyssey.position.set(placementXYZ.x, placementXYZ.y, placementXYZ.z);

        // Add this Odyssey to circle group.
        circle.add(currentOdyssey);

       

    }

     // Remove processed Odysseys from staked array.
     stakedOdysseysObject.splice(0, amount);

     // Increase Amount to place
     amountOfStakedOdysseysInNextRound += amountOfStakedOdysseysInNextRound * 1.5

     // Increase radius
     stakedCircleRadius += circleRadiusIncreaseValue * ( ringCounter / 2);

     // Increase the ringCounter.
     ringCounter++;
    
    // Return the circle group.
    odysseyGroups.push(circle);
}

const ProcessRandomOdysseys = (listOfOddyseys) =>
{

    // Check if there are enough odyssey left. If not adapt the amount ot the amount that is left.
    if ( listOfOddyseys.length < amountOfRandomOdysseysInNextCircle)
    {
        amountOfRandomOdysseysInNextCircle = listOfOddyseys.length;
    }

    // Define the distance between Odysseys based on current amount.
    let amount = amountOfRandomOdysseysInNextCircle;
    const distanceBetweenOdyssey = 360 / amount;

    // The offset will be increased after setting the XYZ of a Odyssey.
    let offset = 0;

    // Create a ring to add Odysseys to.
    let circle = new THREE.Group();
    circle.name = "circle" + ringCounter;
    
    // Calculate the XYZ and place the Odyssey.
    for (let i = 0; i < amountOfRandomOdysseysInNextCircle; i++) 
    {
        // Set current Odyssey.
        const currentOdyssey = listOfOddyseys[i];

        // Calculate Radian
        let radian = offset * (Math.PI / 180);

        // new XYZ Vector3
        const placementXYZ = new THREE.Vector3;

        // Calculate the XYZ.
        placementXYZ.x = Math.cos(radian) * standardCircleRadius;
        placementXYZ.y = -30 //( Math.random() * randomOdysseyMaxSpawnHeight ) - (randomOdysseyMaxSpawnHeight / 2);
        placementXYZ.z = Math.sin(radian) * standardCircleRadius;

        // Increase the offset for the next Odyssye.
        offset += distanceBetweenOdyssey;

        // Set the position of the current Odyssey.
        currentOdyssey.position.set(placementXYZ.x, placementXYZ.y, placementXYZ.z);

        // Add the current Odyssey to the group.
        circle.add(currentOdyssey);
    }

    // Remove the Odyssey from the array.
    listOfOddyseys.splice(0, amount);

    // Increase the amount to place in the next circle.
    amountOfRandomOdysseysInNextCircle = amountOfRandomOdysseysInNextCircle * 1.5;

    // Increas the circle radius for the next ring.
    standardCircleRadius += circleRadiusIncreaseValue * (ringCounter /2);

    // Increasa the ring counter
    ringCounter++;

    // Add the circle to the total amount of rings array
    odysseyGroups.push(circle);

}

// Shuffle an given array.
const shuffleArray = (array) =>
{
    const shuffled = array.sort( (a,b) => 0.5 - Math.random() );

    return shuffled;
}

export {placeOdysseyInUniverse};