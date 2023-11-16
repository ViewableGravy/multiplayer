import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TInitializedGame, game } from './store/game';
import { currentKeys, registerControls } from './initializers/keyboard';
import { setInnerFramerate, updateFrameRate } from './helpers/frameRate';

/**
 * Initializes the game. This includes loading basic assets and setting up the scene.
 * @param params - Basic parameters to generate the game window 
 */
export const initialize = ({
  el,
  size
} : {
  el: HTMLElement,
  size: {
    width: number,
    height: number
  }
}) => {
  const getPhongMaterialFromTexture = (texture: THREE.Texture, color: THREE.ColorRepresentation = 0xffffff) => {
    return new THREE.MeshPhongMaterial( { color, map: texture } );
  }

  const generateDirectionalLight = (color: THREE.ColorRepresentation = 0xffffff, intensity: number = 0.5) => {
    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set(1, 1, 1);
    directionalLight.target.position.set(0, 0, 0);
    return directionalLight;
  }

  const generateAmbientLight = (color: THREE.ColorRepresentation = 0x404040) => {
    return new THREE.AmbientLight( color );
  }

  const textures = {
    ian: new THREE.TextureLoader().load('/src/assets/ian.jpg')
  }

  const geometries = {
    box: new THREE.BoxGeometry( 1, 1, 1 )
  }

  const sceneElements = {
    lighting: {
      ambient: generateAmbientLight(),
      directional: generateDirectionalLight()
    },
    objects: {
      cube: new THREE.Mesh( geometries.box, getPhongMaterialFromTexture(textures.ian) )
    }
  }

  //create scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, size.width / size.height, 0.1, 1000 );

  registerControls({ camera });

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  //configure dom element
  renderer.setSize( size.width, size.height );
  el.appendChild( renderer.domElement );

  camera.position.z = 5;

  const controls = new OrbitControls( camera, renderer.domElement );

  //register elements in scene
  Object.values(sceneElements).forEach(element => {
    Object.values(element).forEach(element => scene.add(element));
  })

  const assignInitializedGame = (initialized: TInitializedGame) =>
    Object.assign(game, initialized);

  assignInitializedGame({
    initialized: true,
    controls,
    sceneElements,
    renderer,
    scene,
    camera
  })
}

export const animate = () => {
  requestAnimationFrame( animate );

  updateFrameRate();
  setInnerFramerate(document.querySelector<HTMLDivElement>('#fps')!);

  if (!game.initialized)
    return;

  const { controls } = game;

	game.sceneElements.objects.cube.rotation.x += 0.001;
	game.sceneElements.objects.cube.rotation.y += 0.001;

  controls.update();

	game.renderer.render( game.scene, game.camera );
}