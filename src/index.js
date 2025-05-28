import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as lilGui from 'lil-gui';
import { LoaderService } from './services/LoaderService';
import { TooltipManager } from './services/TooltipManager';

const canvas = document.querySelector('canvas');
const tooltipElem = document.querySelector('.tooltip');

// Scene
const scene = new THREE.Scene();

const axesHelper = new THREE.AxesHelper(5); // 5 = longueur des axes
scene.add(axesHelper);


// Renderer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 127, 0);


scene.add(camera);

// Controls
const controls = new PointerLockControls(camera, renderer.domElement);

controls.enableDamping = true; // Activation de l'amortissement pour un mouvement plus fluide
controls.dampingFactor = 0.1; // Facteur d'amortissement
controls.rotateSpeed = 0.5; // Vitesse de rotation
controls.zoomSpeed = 1.0; // Vitesse de zoom
controls.panSpeed = 0.5; // Vitesse de déplacement latéral
controls.zoomEnabled = true; // Activation du zoom
controls.enableZoom = true; // Permet le zoom avec la molette de la souris
controls.enablePan = true; // Permet le déplacement latéral avec le clic droit de la souris


scene.add(controls.object);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1));
const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(500, 500, 500);
scene.add(light);

const loaderService = new LoaderService();
const tooltipManager = new TooltipManager(scene, canvas, loaderService);


// Load GLTF
const gltfLoader = new GLTFLoader();
gltfLoader.load(
  'assets/models/red_house_gltf/scene.gltf',
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    const helper = new THREE.BoxHelper(model, 0xff0000);
    scene.add(helper);

    fitCameraToObject(camera, model, controls);


    tooltipManager.addTooltip(
      {
        position: new THREE.Vector3(-140, 104.58, -46.61),
        name: 'Porte 1',
        onClick: () => undefined
      }
    );

    tooltipManager.addTooltip(
      {
        position: new THREE.Vector3(-140, 104.58, 15),
        name: 'Porte 2'
      }
    );


    document.addEventListener('mouseup', (event) => {
      console.log(camera.position);
      console.log(camera.rotation);
    });
  },
  (xhr) => console.log((xhr.loaded / xhr.total * 100) + '% chargé'),
  (err) => console.error('Erreur de chargement GLTF :', err)
);

function fitCameraToObject(camera, object, controls) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3(0, 0, 0));
  // console.log('Center of the object:', center);

  // camera.position.set(-643.82, 116.76, 0.63); // Positionne la caméra au-dessus de l'objet
  camera.position.set(69.77, 116.76, -117.74); // Positionne la caméra au-dessus de l'objet
  camera.rotation.set(-0.46, -1.51, -0.46); // Rotation de la caméra
  camera.lookAt(center);
}



// Gestion du raycaster global
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function updateMouse(event) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function handleClick(event) {
  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);
  const hit = intersects.find(i => i.object.userData.callback);
  // if (hit) hit.object.userData.callback();
}

function handleMouseMove(event) {
  updateMouse(event);
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, false);
  // console.log(intersects);

  const found = intersects.find(i => i.object instanceof THREE.Sprite);
  if (found) {
    const p = found.object.position.clone().project(camera);
    tooltipElem.style.top = ((-p.y + 1) * window.innerHeight / 2) + 'px';
    tooltipElem.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px';
    tooltipElem.textContent = found.object.name;
    tooltipElem.classList.add('is-active');
  } else {
    tooltipElem.classList.remove('is-active');
  }
}


// Mouvement
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 100.0;

const keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyE: false, // Monter
  KeyQ: false  // Descendre
};

// Gestion clavier
document.addEventListener('keydown', (event) => {
  keysPressed[event.code] = true;
});

document.addEventListener('keyup', (event) => {
  keysPressed[event.code] = false;
});

const clock = new THREE.Clock();

const animate = () => {
  const delta = clock.getDelta();

  // Réinitialise les vitesses
  velocity.set(0, 0, 0);

  // Direction de la caméra
  const frontVector = new THREE.Vector3(0, 0, Number(keysPressed.ArrowDown) - Number(keysPressed.ArrowUp));
  const sideVector = new THREE.Vector3(Number(keysPressed.ArrowRight) - Number(keysPressed.ArrowLeft), 0, 0);
  const verticalVector = new THREE.Vector3(0, Number(keysPressed.KeyE) - Number(keysPressed.KeyQ), 0);

  // Combine
  direction.addVectors(frontVector, sideVector).normalize();

  // Appliquer la direction dans l’espace de la caméra
  if (direction.length() > 0) {
    const move = new THREE.Vector3();
    controls.getDirection(move); // renvoie un vecteur unitaire vers l’avant
    move.y = 0;
    move.normalize();
    move.multiplyScalar(direction.z * speed * delta);

    const strafe = new THREE.Vector3();
    strafe.crossVectors(camera.up, move).normalize();
    strafe.multiplyScalar(direction.x * speed * delta);

    controls.moveRight(strafe.x);
    controls.moveForward(move.length());
  }


  // Monter / Descendre
  if (keysPressed.KeyE) {
    controls.getObject().position.y += speed * delta;
  }
  if (keysPressed.KeyQ) {
    controls.getObject().position.y -= speed * delta;
  }
  controls.update();
  renderer.render(scene, camera);
}

// Animation loop
renderer.setAnimationLoop(animate);


// Events

renderer.domElement.addEventListener('click', handleClick);
renderer.domElement.addEventListener('mousemove', handleMouseMove);


canvas.addEventListener('mousemove', handleMouseMove);

document.addEventListener('mousedown', () => {
  controls.lock();
});

document.addEventListener('mouseup', () => {
  controls.unlock();
});


// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('Fenêtre redimensionnée :', window.innerWidth, window.innerHeight);
});

// window.addEventListener('keydown', (event) => {
//   if (event.key === 'f') {
//     // Toggle fullscreen
//     if (!document.fullscreenElement) {
//       canvas.requestFullscreen().catch(err => console.error('Erreur de passage en plein écran :', err));
//     } else {
//       document.exitFullscreen();
//     }
//   }

//   if (event.key === 'r') {
//     // Reset camera position and rotation
//     camera.position.set(0, -100, 0);
//     camera.rotation.set(0, 0, 0);
//     controls.update();
//     console.log('Camera réinitialisée');
//   }

//   // move camera 
//   if (event.key === 'ArrowDown') {
//     camera.position.y -= 1; // Move forward
//     console.log('Camera moved down');
//   } else if (event.key === 'ArrowUp') {
//     camera.position.y += 1; // Move backward
//     console.log('Camera moved up');
//   }
//   // move camera left/right
//   if (event.key === 'ArrowLeft') {
//     camera.position.x -= 1; // Move left
//     console.log('Camera moved left');
//   } else if (event.key === 'ArrowRight') {
//     camera.position.x += 1; // Move right
//     console.log('Camera moved right');
//   }

// });


controls.addEventListener('change', () => {
  // console.log('Position de la caméra :', camera.position);
  // console.log('Position de la rotation :', camera.rotation);
});
