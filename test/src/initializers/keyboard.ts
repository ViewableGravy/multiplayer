import { PerspectiveCamera } from "three"

const KEY_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
} as const;

const SPEEDS = {
  CRAWL: 0.1,
  WALK: 0.2,
  RUN: 0.5,
  SPRINT: 1,
}

const HANDLER_NAMES = {
  WALK_UP: 'walkUp',
  RUN_UP: 'runUp',
} as const;

/**
 * This can likely be attached to the main game object in the future
 */
export const currentKeys = {} as Record<string, boolean>;

type ValueOf<T> = T[keyof T];

type THandlers = {
  /**
   * The name of the handler
   */
  name: ValueOf<typeof HANDLER_NAMES>,

  /**
   * The keys that should be pressed to activate the handler
   */
  keys: Array<string | string[]>,

  /**
   * The function to call when the keys are pressed
   */
  handler: () => void,
  /**
   * Higher number means that this handler will take precendence over other handlers
   */
  priority: number,

  /**
   * Handlers that should be deescalated when this handler is activated
   */
  deescalations?: string[],

  /**
   * A description of the handler, this is used for displaying in an interface for now
   */
  description: string,
}[];

const events = {
  up: (speed: ValueOf<typeof SPEEDS> = SPEEDS.WALK ) => () => {
    console.log('up: ', speed)
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
}

/**
 * An array of event handlers, these are sorted by their respective priorities
 */
const handlers: THandlers = [
  {
    name: HANDLER_NAMES.WALK_UP,
    keys: [ 'w', 'ArrowUp' ],
    handler: events.up(),
    description: 'Walk Forward',
    priority: 0,
  },
  {
    name: HANDLER_NAMES.RUN_UP,
    keys: [[ 'Shift', 'w' ], [ 'Shift', 'ArrowUp' ]],
    handler: events.up(SPEEDS.SPRINT),
    priority: 1,
    description: 'Run Forward',
    deescalations: [HANDLER_NAMES.WALK_UP]
  }
].sort((a, b) => b.priority - a.priority);

export const controls = handlers.map(({ name, keys, description }) => ({ name, keys, description }))

/**
 * Calls the handler and enforces deescalations
 */
const onMatch = (handler: THandlers[number], enforedDeescalations: string[]) => {
  handler.handler();

  if (handler.deescalations)
    enforedDeescalations.push(...handler.deescalations);
}

/**
 * Handles key presses for individual and combined keys
 */
const keyHandler = (handlers: THandlers) => {
  const enforedDeescalations = [] as string[]; 

  handlers.forEach((handler) => {
    if (enforedDeescalations.includes(handler.name))
      return;

    for (const match of handler.keys) {
      if (Array.isArray(match)) {
        // match is an array of keys that must all be pressed
        if (!match.every((key) => currentKeys[key.toLowerCase()]))
          return;

        return onMatch(handler, enforedDeescalations);
      }

      if (!currentKeys[match.toLowerCase()])
        return;

      return onMatch(handler, enforedDeescalations);
    }
  });
}

const getEventHandler = (direction: ValueOf<typeof KEY_DIRECTION>) => ({ key: caseKey }: KeyboardEvent) => {
  const key = caseKey.toLowerCase();

  if (direction === KEY_DIRECTION.UP) {
    if (currentKeys[key]) {
      delete currentKeys[key];
      keyHandler(handlers);
    }
  }

  if (direction === KEY_DIRECTION.DOWN) {
    if (!currentKeys[key]) {
      currentKeys[key] = true;
      keyHandler(handlers);
    }
  }
}

export const registerControls = ({
  camera
}: {
  camera: PerspectiveCamera
}) => {
  document.onkeydown = getEventHandler(KEY_DIRECTION.DOWN)
  document.onkeyup = getEventHandler(KEY_DIRECTION.UP)
}