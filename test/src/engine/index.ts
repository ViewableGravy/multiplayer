import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TEntity, TInitializedGame, game } from './store/game';
import {  KEYS, generateHandler, generateInput, getInputHandlers, keyHandler, registerControls, updatePreviousHandlerIds } from './components/keyboard';
import { setInnerFramerate, updateFrameRate } from '../helpers/frameRate';
import { setDeltaTime, setPreviousFrame } from './store/meta';
import { generateEntity } from './components/entity';
import { generateRender } from './components/render';
import { getOverlay } from './dom';
import { handleMeshLoad } from './components/loaders/meshLoader';
import { getEngineInstancedMesh } from './components/instancedMesh';

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

  const generateDirectionalLight = (color: THREE.ColorRepresentation = 0xffffff, intensity: number = 0.5) => {
    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set(1, 1, 1);
    directionalLight.target.position.set(0, 0, 0);
    return directionalLight;
  }

  const generateAmbientLight = (color: THREE.ColorRepresentation = 0x404040) => {
    return new THREE.AmbientLight( color );
  }

  const sceneElements = {
    lighting: {
      ambient: generateAmbientLight(),
      directional: generateDirectionalLight()
    },
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

  el.style.position = 'relative';



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
          if (component.type === 'instancedMesh') {
            return handleMeshLoad(component.render);
          }

          throw new Error('Render component type not found');
        }
      })
    });
  };

  // const registerObjectsToScene = (meshes: Array<THREE.Mesh | THREE.InstancedMesh>) => {
  //   meshes.forEach(mesh => scene.add(mesh));
  // }

  const assignInitializedGame = (initialized: TInitializedGame) => {
    game.initialized = true;
    game.controls = initialized.controls;
    game.renderer = initialized.renderer;
    game.scene = initialized.scene;
    game.camera = initialized.camera;

    //insert entities
    injectEntities(initialized.entities);

    //register objects to scene - fix this up later
    // registerObjectsToScene(game.components.render.engine.meshes.instanced.map(({ mesh }) => mesh));
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
    dom: {
      overlay: el
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
        engine: {
          meshes: {
            instanced: []
          },
          lighting: {
            ambient: [],
            directional: []
          }
        },
        component: {
          meshes: {
            instanced: [],
          },
          lighting: []
        }
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

  game.components.render.component.meshes.instanced.forEach(({ gameObject, path, texture }, i) => {
    gameObject.rotateX(1);
    gameObject.updateMatrix();

    const { mesh } = getEngineInstancedMesh({
      path,
      texture
    }) ?? {};

    mesh?.setMatrixAt(i, gameObject.matrix);
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
      engine: {
        meshes: {
          instanced: []
        },
        lighting: {
          ambient: [],
          directional: []
        }
      },

      component: {
        meshes: {
          instanced: []
        },
        lighting: []
      }
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
  },
  dom: {
    getOverlay
  }
}