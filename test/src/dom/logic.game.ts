/**
 * Type Imports
 */
import type { THandlerCallback, THandlers } from '../engine/components/keyboard.ts';
import type { TEntity } from '../engine/store/game.ts';
import type { ValueOf } from '../engine/types/helpers.ts';
import * as THREE from 'three';

/**
 * Engine Imports
 */
import { GravyEngine } from '../engine/index.ts';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

const SPEEDS = {
  CRAWL: 0.1,
  WALK: 0.2,
  RUN: 0.5,
  SPRINT: 1,
} as const;

const HANDLER_NAMES = {
  WALK_UP: 'walkUp',
  RUN_UP: 'runUp',
  WALK_LEFT: 'walkLeft',
  WALK_DOWN: 'walkDown',
  WALK_RIGHT: 'walkRight',
} as const;

type TEvents = {
  up: (speed?: ValueOf<typeof SPEEDS>) => THandlerCallback,
  left: THandlerCallback,
  down: THandlerCallback,
  right: THandlerCallback,
}

type TVisualControls = {
  name: string;
  keys: (string | string[])[];
  description: string;
}[];

const tempRenderToScreen = ({ activePreviousFrame, deltaTime, keys, speed }: {
  activePreviousFrame: boolean,
  deltaTime: number,
  keys: string | string[],
  speed: ValueOf<typeof SPEEDS>
}) => {
  const inputs = document.querySelector<HTMLDivElement>('#inputs')!

  inputs.innerHTML = String.raw`
    <p>up: ${speed}</p>
    <p>activePreviousFrame: ${activePreviousFrame}</p>
    <p>deltaTime: ${deltaTime}</p>
    <p>keys: ${keys}</p>
  `;
}

const events = {
  up: (speed: ValueOf<typeof SPEEDS> = SPEEDS.WALK ) => ({ activePreviousFrame, deltaTime, keys }) => {
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed })
  },
  left: ({ activePreviousFrame, deltaTime, keys }) => {
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed: SPEEDS.CRAWL })
  },
  down: ({ activePreviousFrame, deltaTime, keys }) => {
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed: SPEEDS.CRAWL })
  },
  right: ({ activePreviousFrame, deltaTime, keys }) => {
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed: SPEEDS.CRAWL })
  },
} as TEvents;


const { KEYS , generateHandler} = GravyEngine.component.input;

/**
 * An array of event handlers, these are sorted by their respective priorities for now but will likely be automatically
 * sorted within the engine in the future.
 */
const handlers: THandlers = [
  generateHandler({
    name: HANDLER_NAMES.WALK_UP,
    keys: [ KEYS.W, KEYS.ARROW_UP ],
    handler: events.up()
  }),
  generateHandler({
    name: HANDLER_NAMES.RUN_UP,
    keys: [
      [ KEYS.SHIFT, KEYS.W ], 
      [ KEYS.SHIFT, KEYS.ARROW_UP ]
    ],
    handler: events.up(SPEEDS.SPRINT),
    priority: 1,
    deescalations: [HANDLER_NAMES.WALK_UP],
  }),
  generateHandler({
    name: HANDLER_NAMES.WALK_LEFT,
    keys: [ KEYS.A, KEYS.ARROW_LEFT ],
    handler: events.left
  }),
  generateHandler({
    name: HANDLER_NAMES.WALK_DOWN,
    keys: [ KEYS.S, KEYS.ARROW_DOWN ],
    handler: events.down
  }),
  generateHandler({
    name: HANDLER_NAMES.WALK_RIGHT,
    keys: [ KEYS.D, KEYS.ARROW_RIGHT ],
    handler: events.right
  })
].sort((a, b) => b.priority - a.priority);

export const controls = handlers.map(({ name, keys, description }) => ({ name, keys, description })) as TVisualControls;

const getPhongMaterialFromTexture = (texture: THREE.Texture, color: THREE.ColorRepresentation = 0xffffff) => {
  return new THREE.MeshPhongMaterial( { color, map: texture } );
}



const createNewMesh = () => new THREE.Mesh(
  new THREE.BoxGeometry( 1, 1, 1 ), 
  getPhongMaterialFromTexture(
    new THREE.TextureLoader().load('/src/assets/ian.jpg')
  )
)




const getInitialEntities = (): Array<TEntity> => 
  Array(10).fill(undefined).map(_ => GravyEngine.entities.generateEntity({ 
    name: 'myFirstEntity', 
    components: [
      GravyEngine.component.input.generateInput(handlers),
      GravyEngine.component.render.generateRender({ mesh: createNewMesh() })
    ]
  }))


export const setupInitializer = (button: HTMLElement, gameEl: HTMLElement) => {
  const initializedEntities = getInitialEntities();

  button.addEventListener('click', () => {
    GravyEngine.initialize({
      el: gameEl,
      size: {
        height: 500,
        width: 500
      },
      initializedEntities
    });

    GravyEngine.startEngine();
  })
}


export const setupIanCubeCube = (button: HTMLElement, gameEl: HTMLElement) => {
  const createNewInstancedMesh = (count: number) => {
    const instanced = new THREE.InstancedMesh(
      new THREE.BoxGeometry( 1, 1, 1 ), 
      getPhongMaterialFromTexture(
        new THREE.TextureLoader().load('/src/assets/ian.jpg')
      ),
      count
    );
    
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set( Math.random() * 60 - 30, Math.random() * 60 - 30, Math.random() * 60 - 30 );
    
      dummy.updateMatrix();
      instanced.setMatrixAt( i, dummy.matrix );
    }
  
    return instanced;
  }

  const initializedEntities = [
    GravyEngine.entities.generateEntity({ 
      name: 'myFirstEntity', 
      components: [
        GravyEngine.component.input.generateInput(handlers),
        GravyEngine.component.render.generateRender({ mesh: createNewInstancedMesh(10000) })
      ]
    })
  ]

  button.addEventListener('click', () => {
    GravyEngine.initialize({
      el: gameEl,
      size: {
        height: 500,
        width: 500
      },
      initializedEntities
    });

    GravyEngine.startEngine();
  })
}

export const attachStopEngine = (button: HTMLButtonElement, gameEl: HTMLElement) => {
  button.addEventListener('click', () => {
    GravyEngine.stopEngine();

    gameEl.innerHTML = '';
  })
}