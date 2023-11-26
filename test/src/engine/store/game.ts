import { OrbitControls } from "three/examples/jsm/Addons.js"
import { THandlers } from "../components/keyboard"
import { TEngineInstancedMesh, TInstancedMesh, TPreInitializedInstancedMesh } from "../components/instancedMesh"
import type { TRenderComponent } from "../components/render"

/*********************************************************************
 * Components
 *********************************************************************/
export type TComponent = {
  name: string,
  identifier: string,
  entity: TEntity
}

export type TUninitializedComponent = {
  identifier?: string,
}

export type TUninitializedComponentWithIdentifier = {
  identifier: string,
}

export type TUninitializedInputComponent = {
  name: 'input',
  handlers: THandlers,
} & TUninitializedComponent

export type TUninitializedScriptComponent = {
  name: 'script',
  script: () => void
} & TUninitializedComponent

export type TBaseUninitializedRenderComponent = {
  name: 'render'
}

export type TUninitializedRenderComponent = TBaseUninitializedRenderComponent & TUninitializedComponent & {
  type: 'instancedMesh',
  render: TPreInitializedInstancedMesh
}

export type TInputComponent = TComponent & TUninitializedInputComponent
export type TScriptComponent = TComponent & TUninitializedScriptComponent

/**
 * A Union of all Components
 */
export type TUnionComponents = TInputComponent | TScriptComponent | TRenderComponent

export type TEntity = {
  id: string,
  components: Array<TUnionComponents>
}

// temporary game state and assets
export type TInitializedGame = {
  initialized: true,
  controls: OrbitControls,
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  meta: {
    desiredFPS: number,
    previousFrame: number,
    deltaTime: number
  },
  dom: {
    overlay: HTMLElement,
  },
  components: {
    input: {
      /**
       * Input Components 
       */
      components: Array<TInputComponent>, 
      currentKeys: Record<string, boolean>,
      currentHandlerIDs: string[],
      previousHandlerIDs: string[]
    },
    /** 
     * Custom interaction scripts that are run per frame 
     */
    scripts: Array<TScriptComponent>,
    render: {
      /**
       * Render components specifically for the engine, the other render information from a component is stored in the component information
       */
      engine: {
        meshes: {
          instanced: Array<TEngineInstancedMesh>
        },
        lighting: {
          ambient: Array<THREE.AmbientLight>,
          directional: Array<THREE.DirectionalLight>
        }
      },

      /**
       * Render components that contain consumer information and properties
       */
      component: {
        meshes: {
          instanced: Array<TInstancedMesh>
        },
        lighting: Array<THREE.AmbientLight | THREE.DirectionalLight>
      }
    }
  },
  entities: Array<TEntity>
}

export type TUninitializedGame = {
  initialized: false,
  controls: null,
  renderer: null,
  scene: null,
  camera: null,
  meta: {
    desiredFPS: number,
    previousFrame: number,
    deltaTime: number
  },
  dom: {
    overlay: null,
  }
  components: {
    input: {
      components: Array<TInputComponent>, /* Input Components */
      currentKeys: Record<string, boolean>,
      currentHandlerIDs: string[],
      previousHandlerIDs: string[]
    },
    scripts: Array<TScriptComponent>,
    render: {
      engine: {
        meshes: {
          instanced: Array<TEngineInstancedMesh>
        },
        lighting: {
          ambient: Array<THREE.AmbientLight>,
          directional: Array<THREE.DirectionalLight>
        }
      },

      component: {
        meshes: {
          instanced: Array<TInstancedMesh>
        },
        lighting: Array<THREE.AmbientLight | THREE.DirectionalLight>
      }
    }
  },
  entities: Array<TEntity>
}

/**
 * The game state, everything in the world should reference this
 */
export const game = {
  initialized: false,
  controls: null,
  renderer: null,
  scene: null,
  camera: null,
  meta: {
    desiredFPS: 60,
    previousFrame: performance.now(),
    deltaTime: 0
  },
  dom: {
    overlay: null,
  },
  components: {
    input: {
      components: [],
      currentKeys: {},
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
  },
  entities: []
} as TInitializedGame | TUninitializedGame