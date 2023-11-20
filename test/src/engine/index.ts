import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TEntity, TInitializedGame, game } from './store/game';
import {  KEYS, generateHandler, generateInput, getInputHandlers, keyHandler, registerControls, updatePreviousHandlerIds } from './components/keyboard';
import { setInnerFramerate, updateFrameRate } from '../helpers/frameRate';
import { setDeltaTime, setPreviousFrame } from './store/meta';
import { generateEntity } from './components/entity';
import { generateRender } from './components/render';

/**
 * Todo, create unmount function that removes all event listeners
 */

/**
 * Initializes the game. This includes loading basic assets and setting up the scene.
 * @param params - Basic parameters to generate the game window 
 */
const initialize = ({
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
    // objects: {
    //   cube: new THREE.Mesh( geometries.box, getPhongMaterialFromTexture(textures.ian) )
    // }
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

  if (el.children.length > 0) {
    el.removeChild(el.children[0]);
    cancelAnimationFrame(animationId);
  }

  el.appendChild( renderer.domElement );

  camera.position.z = 5;

  const controls = new OrbitControls( camera, renderer.domElement );

  //register elements in scene
  Object.values(sceneElements).forEach(element => {
    Object.values(element).forEach(element => scene.add(element));
  })

  /**
   * function that pushes entities into the game state
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

        if (component.name === "render") {
          return game.components.render.meshes.push(component.render.mesh);
        }
      })
    });
  };

  const registerObjectsToScene = (meshes: Array<THREE.Mesh>) => {
    meshes.forEach(mesh => scene.add(mesh));
  }

  const assignInitializedGame = (initialized: TInitializedGame) => {
    game.initialized = true;
    game.controls = initialized.controls;
    game.renderer = initialized.renderer;
    game.scene = initialized.scene;
    game.camera = initialized.camera;

    //insert entities
    injectEntities(initialized.entities);

    //register objects to scene
    registerObjectsToScene(game.components.render.meshes);
  }

  assignInitializedGame({
    initialized: true,
    controls,
    renderer,
    scene,
    camera,
    meta: {
      deltaTime: 0,
      desiredFPS: 120,
      previousFrame: performance.now()
    },
    components: {
      input: {
        components: [],
        currentKeys: {}, //object of currently pressed keys
        currentHandlerIDs: [],
        previousHandlerIDs: []
      },
      scripts: [],
      render: {
        meshes: [],
        lighting: [generateAmbientLight(), generateDirectionalLight()]
      }
    },
    entities: initializedEntities
  });

  registerControls({
    handlers: getInputHandlers(game as TInitializedGame)
  });

}

const postRender = () => {
  updatePreviousHandlerIds();
};

const preRender = () => {
  setPreviousFrame();
}

const preUpdate = (game: TInitializedGame) => {
  // Update Meta
  setDeltaTime();

  // Input Controls
  keyHandler(getInputHandlers(game, 'update'));

  // Framerate Counter
  updateFrameRate();
  setInnerFramerate(document.querySelector<HTMLDivElement>('#fps')!);
}

let animationId: number;
const startEngine = () => {
  animationId = requestAnimationFrame( startEngine );

  if (!game.initialized)
    return;

  preUpdate(game)
  
  // Game Logic
  const { controls } = game;

	// game.sceneElements.objects.cube.rotation.x += 0.001;
	// game.sceneElements.objects.cube.rotation.y += 0.001;

  game.components.render.meshes.forEach(mesh => {
    mesh.rotation.x += 0.0001;
    mesh.rotation.y += 0.0001;
  });

  controls.update();

  // Render
  preRender();
	game.renderer.render( game.scene, game.camera );

  // Post Render Actions
  postRender();
}

const stopEngine = () => {
  game.initialized = false;

  game.scene?.clear();
  game.renderer?.dispose();
  game.components = {
    input: {
      components: [],
      currentKeys: {}, //object of currently pressed keys
      currentHandlerIDs: [],
      previousHandlerIDs: []
    },
    scripts: [],
    render: {
      meshes: [],
      lighting: []
    }
  }

  if (!animationId)
    return 

  cancelAnimationFrame(animationId);
}

/***************************************************************
 * EXPORTS
 ***************************************************************/

/**
 * Gravy Engine
 * 
 * This is the main engine that runs the game. It is responsible for
 * rendering the game, updating the game state, and handling input.
 */
export const GravyEngine = {
  initialize,
  startEngine,
  stopEngine,
  component: {
    input: {
      generateHandler,
      generateInput,
      KEYS
    },
    render: {
      generateRender
    }
  },
  entities: {
    generateEntity
  }
}