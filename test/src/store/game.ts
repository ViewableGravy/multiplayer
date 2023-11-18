import { OrbitControls } from "three/examples/jsm/Addons.js"
import { THandlers } from "../initializers/keyboard"

/*********************************************************************
 * Components
 *********************************************************************/
type TComponent = {
  name: string,
  identifier: string,
  entity: TEntity
}

export type TUninitializedInputComponent = {
  name: 'input',
  handlers: THandlers
}

export type TUninitializedScriptComponent = {
  name: 'script',
  script: () => void
}

export type TInputComponent = TComponent & TUninitializedInputComponent
export type TScriptComponent = TComponent & TUninitializedScriptComponent

/**
 * A Union of all Components
 */
export type TUnionComponents = TInputComponent | TScriptComponent

export type TEntity = {
  id: string,
  components: Array<TUnionComponents>
}

// temporary game state and assets
export type TInitializedGame = {
  initialized: true,
  controls: OrbitControls,
  sceneElements: {
    lighting: {
      ambient: THREE.AmbientLight,
      directional: THREE.DirectionalLight
    },
    objects: {
      cube: THREE.Mesh
    }
  },
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  components: {
    input: {
      /**
       * Input Components 
       */
      components: Array<TInputComponent>, 
      currentKeys: Record<string, boolean>
    },
    /** 
     * Custom interaction scripts that are run per frame 
     */
    scripts: Array<TScriptComponent> 
  },
  entities: Array<TEntity>
}

export type TUninitializedGame = {
  initialized: false,
  controls: null,
  sceneElements: null,
  renderer: null,
  scene: null,
  camera: null,
  components: {
    input: {
      components: Array<TInputComponent>, /* Input Components */
      currentKeys: Record<string, boolean>
    },
    scripts: Array<TScriptComponent>
  },
  entities: Array<TEntity>
}
/**
 * The game state, everything in the world should reference this
 */
export const game = {
  initialized: false,
  controls: null,
  sceneElements: null,
  renderer: null,
  scene: null,
  camera: null,
  components: {
    input: {
      components: [],
      currentKeys: {}
    },
    scripts: []
  },
  entities: []
} as TInitializedGame | TUninitializedGame