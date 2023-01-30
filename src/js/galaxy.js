import * as THREE from "three";
import * as dat from 'dat.gui';



/**
 * Build Galaxy
 */

const gui = new dat.GUI();
gui.hide();

const parameters = {};
parameters.count = 100000;
parameters.size = 0.001;
parameters.radius = 100;
parameters.branches = 3;
parameters.spin = 1.3;
parameters.randomnes = 0.2;
parameters.randomnesPower = 3;
parameters.YHeight= 100;

let pointsGeometry = null;
let pointsMaterial = null;
let points = null;



const generateGalaxy = () => {

    
    
    /**
     * Clean previous renders of galaxy.
     */
    if(points !== null){
        pointsGeometry.dispose();
        pointsMaterial.dispose();
        scene.remove(points);
    };

    /**
     * Geometry
     */
    pointsGeometry = new THREE.BufferGeometry();
    const position = new Float32Array(parameters.count * 3);

    for(let i = 0; i < parameters.count; i++ ){

        const i3 = i * 3;

        const radius = Math.random() * parameters.radius;
        const spinAngle = radius * parameters.spin;
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? parameters.YHeight : -parameters.YHeight);
        const randomZ = Math.pow(Math.random(), parameters.randomnesPower) * (Math.random() < 0.5 ? 1 : -1);


        position[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX; 
        position[i3 + 1] = randomY;
        position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    }

    pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(position, 3)
    );

    /**
     * Material
     */
    pointsMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: 0xFF5588,
        transparent: true,
        opacity: 0.5,
    });

    /**
     * Create stars in the universe.
     */
    points = new THREE.Points(pointsGeometry, pointsMaterial);
    return points;


};

gui.add(parameters, "count").min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "radius").min(1).max(500).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "branches").min(2).max(10).step(1).onFinishChange(generateGalaxy);
gui.add(parameters, "spin").min(-3).max(3).step(0.1).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnes").min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "randomnesPower").min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
gui.add(parameters, "YHeight").min(1).max(150).step(1).onFinishChange(generateGalaxy);

export {generateGalaxy};