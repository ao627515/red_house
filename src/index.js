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
const controls = new OrbitControls(camera, renderer.domElement);
// const controls = new TrackballControls(camera, renderer.domElement);
// controls.enableDamping = true;
// const controls = new FirstPersonControls(camera, renderer.domElement);
// const controls = new MapControls(camera, renderer.domElement);
// const controls = new PointerLockControls(camera, renderer.domElement);

controls.target.set(0, 0, 0); // Point de focus des contrôles
controls.enableDamping = true; // Activation de l'amortissement pour un mouvement plus fluide
controls.dampingFactor = 0.1; // Facteur d'amortissement
controls.rotateSpeed = 0.5; // Vitesse de rotation
controls.zoomSpeed = 1.0; // Vitesse de zoom
controls.panSpeed = 0.5; // Vitesse de déplacement latéral
// document.addEventListener('mousedown', () => {
//   controls.lock();
// });

// document.addEventListener('mouseup', () => {
//   controls.unlock();
// });
// 
// Rotation verticale limitée à entre 45° et 90°
// controls.minPolarAngle = Math.PI / 2;
// controls.maxPolarAngle = Math.PI / 2;

// // Rotation horizontale limitée à ±45°
// controls.minAzimuthAngle = -Math.PI / 2;
// controls.maxAzimuthAngle = Math.PI / 2;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1));
const light = new THREE.DirectionalLight(0xffffff, 1);
// light.position.set(500, 500, 500);
scene.add(light);

const loaderService = new LoaderService();
const tooltipManager = new TooltipManager(scene, canvas, loaderService);

// {
//   "x": -263.66568636406544,
//     "y": 124.69607971772206,
//       "z": -19.14024539855381
// }

// {
//   "x": -300.0694525729905,
//     "y": 125.64799439483083,
//       "z": -17.24689430641657
// }


// // GUI configurator
// const gui = new lilGui.GUI();

// gui.add(camera.position, "x")
//   .setValue(camera.position.x)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("X Position");

// gui.add(camera.position, "y")
//   .setValue(camera.position.y)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("Y Position");

// gui.add(camera.position, "z")
//   .setValue(camera.position.z)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("Z Position");


// gui.add(camera.rotation, "x")
//   .setValue(camera.rotation.x)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("X rotation");

// gui.add(camera.rotation, "y")
//   .setValue(camera.rotation.y)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("Y rotation");

// gui.add(camera.rotation, "z")
//   .setValue(camera.rotation.z)
//   .min(-1000)
//   .max(1000)
//   .step(1)
//   .name("Z rotation");

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
  console.log('Center of the object:', center);

  camera.position.set(-643.82, 116.76, 0.63); // Positionne la caméra au-dessus de l'objet
  camera.rotation.set(-0.46, -1.51, -0.46); // Rotation de la caméra
  camera.lookAt(center);

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
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
  console.log(intersects);

  const found = intersects.find(i => i.object instanceof THREE.Sprite);
  if (found) {
    const p = found.object.position.clone().project(camera);
    tooltipElem.style.top = ((-p.y + 1) * window.innerHeight / 2) + 'px';
    tooltipElem.style.left = ((p.x + 1) * window.innerWidth / 2) + 'px';
    tooltipElem.textContent = found.object.name;
    tooltipElem.classList.add('is-active');
    console.log('found');

  } else {
    tooltipElem.classList.remove('is-active');
    console.log('not found');

  }
}


// Animation loop
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});


renderer.domElement.addEventListener('click', handleClick);
renderer.domElement.addEventListener('mousemove', handleMouseMove);


canvas.addEventListener('mousemove', handleMouseMove);



// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('Fenêtre redimensionnée :', window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'f') {
    // Toggle fullscreen
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(err => console.error('Erreur de passage en plein écran :', err));
    } else {
      document.exitFullscreen();
    }
  }

  if (event.key === 'r') {
    // Reset camera position and rotation
    camera.position.set(0, -100, 0);
    camera.rotation.set(0, 0, 0);
    controls.update();
    console.log('Camera réinitialisée');
  }

  if (event.key === 'c') {
    // Toggle camera controls
    if (controls.enabled) {
      controls.enabled = false;
      console.log('Contrôles désactivés');
    } else {
      controls.enabled = true;
      console.log('Contrôles activés');
    }
  }


  if (event.key === 'k') {
    // Save camera position and rotation to localStorage
    const cameraData = {
      position: camera.position.toArray(),
      rotation: camera.rotation.toArray()
    };
    localStorage.setItem('cameraData', JSON.stringify(cameraData));
    console.log('Position et rotation de la caméra sauvegardées');
  }

  if (event.key === 'l') {
    // Load camera position and rotation from localStorage
    const cameraData = JSON.parse(localStorage.getItem('cameraData'));
    if (cameraData) {
      camera.position.fromArray(cameraData.position);
      camera.rotation.fromArray(cameraData.rotation);
      // controls.update();
      console.log('Position et rotation de la caméra chargées');
    } else {
      console.warn('Aucune donnée de caméra trouvée dans localStorage');
    }
  }

  if (event.key === 'd') {
    // Toggle debug mode
    const debugMode = scene.getObjectByName('DebugMode');
    if (debugMode) {
      scene.remove(debugMode);
      console.log('Mode debug désactivé');
    } else {
      const debugGeometry = new THREE.BoxGeometry(1, 1, 1);
      const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
      const debugCube = new THREE.Mesh(debugGeometry, debugMaterial);
      debugCube.name = 'DebugMode';
      scene.add(debugCube);
      console.log('Mode debug activé');
    }
  }




  if (event.key === 'x') {
    // Toggle axes helper
    const axesHelper = scene.getObjectByName('AxesHelper');
    if (axesHelper) {
      scene.remove(axesHelper);
      console.log('Axes helper désactivé');
    } else {
      const newAxesHelper = new THREE.AxesHelper(5);
      newAxesHelper.name = 'AxesHelper';
      scene.add(newAxesHelper);
      console.log('Axes helper activé');
    }
  }
  if (event.key === 'g') {
    // Toggle grid helper
    const gridHelper = scene.getObjectByName('GridHelper');
    if (gridHelper) {
      scene.remove(gridHelper);
      console.log('Grid helper désactivé');
    } else {
      const newGridHelper = new THREE.GridHelper(10, 10);
      newGridHelper.name = 'GridHelper';
      scene.add(newGridHelper);
      console.log('Grid helper activé');
    }
  }

  if (event.key === 'v') {
    // Toggle visibility of all objects
    const objects = scene.children;
    objects.forEach(object => {
      object.visible = !object.visible;
      console.log(`Objet ${object.name} ${object.visible ? 'visible' : 'invisible'}`);
    });
  }

  if (event.key === 'z') {
    // Toggle zoom
    const zoomEnabled = camera.zoom !== 1;
    camera.zoom = zoomEnabled ? 1 : 2; // Toggle between normal and zoomed
    camera.updateProjectionMatrix();
    console.log(`Zoom ${zoomEnabled ? 'désactivé' : 'activé'}`);
  }
  if (event.key === 'y') {
    // Toggle Y-axis rotation
    const yRotationEnabled = camera.rotation.y !== 0;
    camera.rotation.y = yRotationEnabled ? 0 : Math.PI / 4; // Toggle between no rotation and 45 degrees
    controls.update();
    console.log(`Rotation Y ${yRotationEnabled ? 'désactivée' : 'activée'}`);
  }

  // move camera 
  if (event.key === 'ArrowDown') {
    camera.position.y -= 1; // Move forward
    console.log('Camera moved down');
  } else if (event.key === 'ArrowUp') {
    camera.position.y += 1; // Move backward
    console.log('Camera moved up');
  }
  // move camera left/right
  if (event.key === 'ArrowLeft') {
    camera.position.x -= 1; // Move left
    console.log('Camera moved left');
  } else if (event.key === 'ArrowRight') {
    camera.position.x += 1; // Move right
    console.log('Camera moved right');
  }

});


controls.addEventListener('change', () => {
  console.log('Position de la caméra :', camera.position);
  console.log('Position de la rotation :', camera.rotation);
});
