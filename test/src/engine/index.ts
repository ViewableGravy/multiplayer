import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TPreinitializedEntity, TInitializedGame, TInternalEntity, game } from './store/game';
import {  KEYS, generateHandler, generateInput, generateInternalHandlers, getInputHandlers, keyHandler, pushHandler, registerControls, updatePreviousHandlerIds } from './components/keyboard';
import { setInnerFramerate, updateFrameRate } from '../helpers/frameRate';
import { setDeltaTime, setPreviousFrame } from './store/meta';
import { generateEntity } from './components/entity';
import { TInternalRenderComponent, generateRender } from './components/render';
import { getOverlay } from './dom';
import { handleMeshLoad } from './components/loaders/meshLoader';
import { generateScript, generateInternalScript, pushScript } from './components/script';

/**
 * Todo, create unmount function that removes all event listeners
 */

/**
 * Helper function that is used to generate all the scene data that has not yet been organized into the engine.
 * 
 * This can eventually be replaced with the relevant wrappers around each of these major components.
 */
const generateTemporarySceneData = ({ size, el }: {
  size: {
    width: number,
    height: number
  },
  el: HTMLElement
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

  const configureDom = (el: HTMLElement) => {
    renderer.setSize( size.width, size.height );

    if (el.children.length > 0) {
      el.removeChild(el.children[0]);
      cancelAnimationFrame(animationId);
    }

    el.appendChild( renderer.domElement );

    el.style.position = 'relative';
  }

  const registerSceneElements = (scene: THREE.Scene, elements: {
    lighting: {
      ambient: THREE.AmbientLight,
      directional: THREE.DirectionalLight
    }
  }) => {
    Object.values(elements).forEach(element => {
      Object.values(element).forEach(element => scene.add(element));
    })
  }

  //create scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, size.width / size.height, 0.1, 1000 );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  const controls = new OrbitControls( camera, renderer.domElement );

  camera.position.z = 5;

  registerSceneElements(scene, {
    lighting: {
      ambient: generateAmbientLight(),
      directional: generateDirectionalLight()
    },
  });

  configureDom(el);

  return {
    scene,
    camera,
    renderer,
    controls
  }
}

/**
 * Provides functionality for injecting entities into the game. Note that this function can be used on initialize or at any point during the game.
 */
const injectEntities = (entities: Array<TPreinitializedEntity>) => {
  Promise.all(entities.map(async (entity) => {
    const internalEntity = {
      ...entity,
      components: []
    } as TInternalEntity;

    //Map over components, inject them into the game and return 
    const newComponents = await Promise.all(entity.components.map(async (component) => {
      switch (component.name) {
        case 'input':
          return generateInternalHandlers({ component, entity: internalEntity }, pushHandler); 
        case 'script': {
          return generateInternalScript({
            script: component,
            entity: internalEntity,
            game: game as TInitializedGame
          }, pushScript);
        }
        case 'render': {
          if (component.type === 'instancedMesh') {
            return {
              ...component,
              render: await handleMeshLoad(component.render)
            } as TInternalRenderComponent
          }
          throw new Error(`Render component with type ${component.type} does not exist.`)
        }
        default: {
          throw new Error(`Encountered an error inserting entity into world. ${entity}`)
        }
      }
    }))

    internalEntity.components.push(...newComponents)

    return internalEntity;
  })).then((entities) => {
    game.entities.push(...entities);
  }).catch((err) => {
    //handle error
  });  
};

/**
 * Assigns an initialized game object to the global store. This function also orchestrates injecting the entities into the game and registering relevant handlers.
 */
const assignInitializedGame = (initialized: TInitializedGame, initializedEntities: Array<TPreinitializedEntity>) => {
  game.initialized = true;
  game.controls = initialized.controls;
  game.renderer = initialized.renderer;
  game.scene = initialized.scene;
  game.camera = initialized.camera;

  //insert entities
  injectEntities(initializedEntities);

  //register controls (with input components)
  registerControls({
    handlers: getInputHandlers(game as TInitializedGame)
  });
}

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
  initializedEntities: Array<TPreinitializedEntity>,
}) => {
  const {
    scene,
    camera,
    renderer,
    controls
  } = generateTemporarySceneData({ size, el });

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
    entities: []
  }, initializedEntities);
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
}

let animationId: number;
let intervalId: number;

const startEngine = () => {

  const renderLoop = () => {
    animationId = requestAnimationFrame( renderLoop );

    if (!game.initialized)
      return;

    // Framerate Counter
    updateFrameRate();
    setInnerFramerate(document.querySelector<HTMLDivElement>('#fps')!);

    preRender();

    game.renderer.render( game.scene, game.camera );

    postRender();
  }

  const gameLoop = () => {
    if (!game.initialized)
      return;

    const { controls } = game;

    preUpdate(game)

    game.components.render.component.meshes.instanced.forEach(({ gameObject }, i) => {
      const mesh = game.components.render.engine.meshes.instanced[i].mesh;

      mesh.setMatrixAt(i, gameObject.matrix);

      //look into a better system so it does not update every cycle
      mesh.instanceMatrix.needsUpdate = true;
    });

  

    game.components.scripts.forEach(script => {
      script.update();
    });

    controls.update();
  }

  intervalId = setInterval(gameLoop, 30)
  renderLoop();



  

  // if (!game.initialized)
  //   return;

  // preUpdate(game)
  
  // Game Logic
  // const { controls } = game;

	// game.sceneElements.objects.cube.rotation.x += 0.001;
	// game.sceneElements.objects.cube.rotation.y += 0.001;

  // game.components.render.component.meshes.instanced.forEach(({ gameObject, path, texture }, i) => {
  //   gameObject.rotateX(1);
  //   gameObject.updateMatrix();

  //   const { mesh } = getEngineInstancedMesh({
  //     path,
  //     texture
  //   }) ?? {};

  //   mesh?.setMatrixAt(i, gameObject.matrix);
  // });

  // game.components.scripts.forEach(script => {
  //   script.update();
  // });

  // controls.update();

  // Render
  // preRender();
	// game.renderer.render( game.scene, game.camera );

  // Post Render Actions
  // postRender();
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
  clearInterval(intervalId);
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
    },
    script: {
      generateScript
    }
  },
  entities: {
    generateEntity
  },
  dom: {
    getOverlay
  }
}