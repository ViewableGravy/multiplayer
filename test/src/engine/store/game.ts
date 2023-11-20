import { OrbitControls } from "three/examples/jsm/Addons.js"
import { THandlers } from "../components/keyboard"

/*********************************************************************
 * Components
 *********************************************************************/
type TComponent = {
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

export type TUninitializedRenderComponent = {
  name: 'render',
  render: {
    mesh: THREE.Mesh
  }
} & TUninitializedComponent

export type TInputComponent = TComponent & TUninitializedInputComponent
export type TScriptComponent = TComponent & TUninitializedScriptComponent
export type TRenderComponent = TComponent & TUninitializedRenderComponent

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
      meshes: Array<THREE.Mesh>,
      lighting: Array<THREE.AmbientLight | THREE.DirectionalLight>
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
  components: {
    input: {
      components: Array<TInputComponent>, /* Input Components */
      currentKeys: Record<string, boolean>,
      currentHandlerIDs: string[],
      previousHandlerIDs: string[]
    },
    scripts: Array<TScriptComponent>,
    render: {
      meshes: Array<THREE.Mesh>,
      lighting: Array<THREE.AmbientLight | THREE.DirectionalLight>
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
  components: {
    input: {
      components: [],
      currentKeys: {},
      currentHandlerIDs: [],
      previousHandlerIDs: []
    },
    scripts: [],
    render: {
      meshes: [],
      lighting: []
    }
  },
  entities: []
} as TInitializedGame | TUninitializedGame