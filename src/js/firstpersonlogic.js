const ActivateFirstPerson = () => 
{
    console.log('First Person is activated.')
}

const OnKeyDown = (event) => 
{
    
    // Check input codes.
    //console.log("Pressed: " + event.code);

    switch ( event.code) 
    {
        case "ArrowUp":
        case "KeyW":
            console.log('forward');
            break; 
            
        case "ArrowDown" :
        case "KeyS" :
            console.log("backwards");
            break;

        case "ArrowLeft" :
        case "KeyA" :
            console.log("left")
            break;

        case "ArrowRight" :
        case "KeyD" :
            console.log("Right.")
            break;

        case "KeyE" :
            console.log("Upwards")
            break;

        case "KeyQ" :
            console.log("Downwards.")
            break;
    }
}

const OnKeyUp = (event) => 
{
    switch (event.code) 
    {
        case "ArrowUp" :
        case "KeyW" :
            console.log("Stopped moving forward.")
            break;

        case "ArrowDown" :
        case "KeyS" :
            console.log("Stopped moving backwards.")
            break;
        case "ArrowLeft" :
        case "KeyA" :
            console.log('Stopped moving left.');
            break;

        case "ArrowRight" :
        case "KeyD" :
            console.log("Stopped moving right.")
            break;

        case "KeyE" :
            console.log('Stopped moving upwards.');
            break;

        case "KeyQ" :
            console.log('Stopped moving downwards.');
    } 
}





export {ActivateFirstPerson, OnKeyDown, OnKeyUp};