/**
 * Type Imports
 */
import type { THandlerCallback, THandlers } from '../engine/components/keyboard.ts';
import type { TEntity } from '../engine/store/game.ts';
import type { ValueOf } from '../engine/types/helpers.ts';

/**
 * Engine Imports
 */
import { GravyEngine } from '../engine/index.ts';

const SPEEDS = {
  CRAWL: 0.1,
  WALK: 0.2,
  RUN: 0.5,
  SPRINT: 1,
} as const;

const HANDLER_NAMES = {
  WALK_UP: 'walkUp',
  RUN_UP: 'runUp',
} as const;

type TEvents = {
  up: (speed?: ValueOf<typeof SPEEDS>) => THandlerCallback,
  left: () => void,
  down: () => void,
  right: () => void,
}

type TVisualControls = {
  name: string;
  keys: (string | string[])[];
  description: string;
}[];

const events = {
  up: (speed: ValueOf<typeof SPEEDS> = SPEEDS.WALK ) => ({ activePreviousFrame, deltaTime, keys }) => {
    console.log('up: ', speed)
    console.log('activePreviousFrame: ', activePreviousFrame)
    console.log('deltaTime: ', deltaTime)
    console.log('keys: ', keys)
  },
  left: () => {
    console.log('left')
  },
  down: () => {
    console.log('down')
  },
  right: () => {
    console.log('right')
  },
} as TEvents;

/**
 * An array of event handlers, these are sorted by their respective priorities
 */
const handlers: THandlers = [
  GravyEngine.input.generateHandler({
    name: HANDLER_NAMES.WALK_UP,
    keys: [ 'w', 'ArrowUp' ],
    handler: events.up()
  }),
  GravyEngine.input.generateHandler({
    name: HANDLER_NAMES.RUN_UP,
    keys: [[ 'Shift', 'w' ], [ 'Shift', 'ArrowUp' ]],
    handler: events.up(SPEEDS.SPRINT),
    priority: 1,
    deescalations: [HANDLER_NAMES.WALK_UP],
  })
].sort((a, b) => b.priority - a.priority);

export const controls = handlers.map(({ name, keys, description }) => ({ name, keys, description })) as TVisualControls;

const getInitialEntities = (): Array<TEntity> => [
  GravyEngine.entities.generateEntity({ 
    name: 'myFirstEntity', 
    components: [
      GravyEngine.input.generateInput(handlers)
    ] 
  })
];

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

export const attachStopEngine = (button: HTMLButtonElement, gameEl: HTMLElement) => {
  button.addEventListener('click', () => {
    GravyEngine.stopEngine();

    gameEl.innerHTML = '';
  })
}