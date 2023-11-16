import { OrbitControls } from "three/examples/jsm/Addons.js"

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
  camera: THREE.Camera
}

export type TUninitializedGame = {
  initialized: false,
  controls: null,
  sceneElements: null,
  renderer: null,
  scene: null,
  camera: null
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
  camera: null
} as TInitializedGame | TUninitializedGame