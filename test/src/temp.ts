import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TEntity, TInitializedGame, game } from './store/game';
import {  THandlers, getInputHandlers, keyHandler, registerControls } from './initializers/keyboard';
import { setInnerFramerate, updateFrameRate } from './helpers/frameRate';



/**
 * Initializes the game. This includes loading basic assets and setting up the scene.
 * @param params - Basic parameters to generate the game window 
 */
export const initialize = ({
  el,
  size,
  initializedEntities
} : {
  el: HTMLElement,
  size: {
    width: number,
    height: number
  },
  initializedEntities: Array<TEntity>,
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

  /**
   * Proxy function that pushes entities into the game state
   */
  const injectEntities = (entities: Array<TEntity>) => {
    entities.forEach(entity => {
      game.entities.push(entity);

      entity.components.forEach(component => {
        if (component.name === "input") {
          return game.components.input.components.push(component);
        }

        if (component.name === "script") {
          return game.components.scripts.push(component);
        }
      })
    });
  };

  const assignInitializedGame = (initialized: TInitializedGame) => {
    game.initialized = true;
    game.controls = initialized.controls;
    game.sceneElements = initialized.sceneElements;
    game.renderer = initialized.renderer;
    game.scene = initialized.scene;
    game.camera = initialized.camera;

    //insert entities
    injectEntities(initialized.entities);
  }

  assignInitializedGame({
    initialized: true,
    controls,
    sceneElements,
    renderer,
    scene,
    camera,
    components: {
      input: {
        components: [],
        currentKeys: {}
      },
      scripts: []
    },
    entities: initializedEntities
  });

  registerControls({
    handlers: getInputHandlers(game as TInitializedGame)
  });

}

export const animate = () => {
  requestAnimationFrame( animate );

  updateFrameRate();
  setInnerFramerate(document.querySelector<HTMLDivElement>('#fps')!);

  if (!game.initialized)
    return;

  const { controls } = game;

  keyHandler(getInputHandlers(game));

	game.sceneElements.objects.cube.rotation.x += 0.001;
	game.sceneElements.objects.cube.rotation.y += 0.001;

  controls.update();

	game.renderer.render( game.scene, game.camera );
}