/**
 * Type Imports
 */
import type { THandlerCallback, THandlers } from '../engine/components/keyboard.ts';
import type { ValueOf } from '../engine/types/helpers.ts';

/**
 * Asset imports
 */
import ianPNG from '../assets/ian.jpg';

/**
 * Engine Imports
 */
import { GravyEngine } from '../engine/index.ts';
import { TInternalRenderComponent } from '../engine/components/render.ts';
import { TInternalEntity } from '../engine/store/game.ts';
import * as THREE from 'three';
import { TScript } from '../engine/components/script.ts';


const SPEEDS = {
  CRAWL: 0.2,
  WALK: 0.5,
  RUN: 0.8,
  SPRINT: 1.2,
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

const applyMovement = (entity: TInternalEntity, direction: 'up' | 'left' | 'down' | 'right', speed?: ValueOf<typeof SPEEDS> ) => {
  const position = new THREE.Vector3(); //incorporate this into a "state" component once that is implemented.
  const comp = entity.components.find(({ name }) => name === 'render') as TInternalRenderComponent;

  const directions = {
    'up': ['z', -(speed ?? 0.01)],
    'left': ['x', -(speed ?? 0.01) * 0.7],
    'down': ['z', (speed ?? 0.01) * 0.5],
    'right': ['x', (speed ?? 0.01) * 0.7],
  } as const;

  position.setFromMatrixPosition( comp.render.gameObject.matrix );

  const [ axis, amount ] = directions[direction]
  position[axis] += amount;

  comp.render.gameObject.matrix.setPosition(position);
}

const events = {
  up: (speed: ValueOf<typeof SPEEDS> = SPEEDS.CRAWL ) => ({ activePreviousFrame, deltaTime, keys, entity }) => {
    applyMovement(entity, 'up', speed);
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed })
  },
  left: ({ activePreviousFrame, deltaTime, keys, entity }) => {
    applyMovement(entity, 'left', SPEEDS.CRAWL);
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed: SPEEDS.CRAWL })
  },
  down: ({ activePreviousFrame, deltaTime, keys, entity }) => {
    applyMovement(entity, 'down', SPEEDS.CRAWL);
    tempRenderToScreen({ activePreviousFrame, deltaTime, keys, speed: SPEEDS.CRAWL })
  },
  right: ({ activePreviousFrame, deltaTime, keys, entity }) => {
    applyMovement(entity, 'right', SPEEDS.CRAWL);
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
    handler: events.up(SPEEDS.RUN),
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


/**
 * Callback function that will be called on each render cycle.
 */
const myFirstEntityScript: TScript = (entity) => {
 
}

export const setupInitializer = (button: HTMLElement, gameEl: HTMLElement) => {
  const initializedEntities = [
    GravyEngine.entities.generateEntity({ 
      name: 'myFirstEntity', 
      components: [
        GravyEngine.component.input.generateInput(handlers),
        GravyEngine.component.render.generateRender({
          type: 'instancedMesh',
          texture: ianPNG,
          path: 'src/assets/giftBox.obj'
        }),
        GravyEngine.component.script.generateScript(myFirstEntityScript)
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

    const overlay = GravyEngine.dom.getOverlay();

    if (overlay) {
      const overlayElement = document.createElement('div')
      overlayElement.innerHTML = String.raw`
        <div id="inputs" style="inset: 10px 10px auto auto; height: 50px; width: 200px;"></div>
      `

      overlay.appendChild(overlayElement)
    }
  })
}

export const attachStopEngine = (button: HTMLButtonElement, gameEl: HTMLElement) => {
  button.addEventListener('click', () => {
    GravyEngine.stopEngine();

    gameEl.innerHTML = '';
  })
}