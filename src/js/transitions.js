function fadeOutScene(){

    // Add new DIV to the HTML for fadeOut
    
    const fadeOutDiv = document.createElement('div');
    fadeOutDiv.classList.add("fadeDiv"); 

    // Setup elemt style.
    fadeOutDiv.style.backgroundColor = 'black';
    fadeOutDiv.style.opacity = 0;
    fadeOutDiv.style.position = 'absolute';
    fadeOutDiv.style.width = '100vw';
    fadeOutDiv.style.height = '100vh';
    document.body.appendChild(fadeOutDiv);


    //Fade out  with interval
    const divToFade = document.querySelector('.fadeDiv');
    let fadeTimer = 0;

    // Setup interval
    const fadeOutTimer = setInterval( () => {

        // Check if timer is finished.
        if(fadeTimer >= 1){
            clearInterval(fadeOutTimer);
        }
        
        fadeTimer += 0.01;
        divToFade.style.opacity = fadeTimer;
    }, 10);

}

export {fadeOutScene};