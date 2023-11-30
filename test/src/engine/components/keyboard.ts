import { generateUUID } from "three/src/math/MathUtils.js";
import { TGeneratedInputComponent, TInitializedGame, TInternalEntity, TUninitializedInputComponent, game } from "../store/game";
import { ValueOf } from "../types/helpers";

/**
 * This can likely be attached to the main game object in the future
 */
// export const currentKeys = {} as Record<string, boolean>;

const KEY_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
} as const;

const STANDARD_KEYS = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  F: 'f',
  G: 'g',
  H: 'h',
  I: 'i',
  J: 'j',
  K: 'k',
  L: 'l',
  M: 'm',
  N: 'n',
  O: 'o',
  P: 'p',
  Q: 'q',
  R: 'r',
  S: 's',
  T: 't',
  U: 'u',
  V: 'v',
  W: 'w',
  X: 'x',
  Y: 'y',
  Z: 'z',
} as const;

const ARROW_KEYS = {
  ARROW_UP: 'ArrowUp',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_DOWN: 'ArrowDown',
  ARROW_RIGHT: 'ArrowRight',
} as const;

const SPECIAL_KEYS = {
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta',
  ENTER: 'Enter',
  BACKSPACE: 'Backspace',
  TAB: 'Tab',
  CAPS_LOCK: 'CapsLock',
  ESCAPE: 'Escape',
  SPACE: ' ',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  END: 'End',
  HOME: 'Home',
  INSERT: 'Insert',
  DELETE: 'Delete',
  SEMICOLON: ';',
  EQUAL: '=',
  COMMA: ',',
  MINUS: '-',
  PERIOD: '.',
  SLASH: '/',
  BACKTICK: '`',
  OPEN_BRACKET: '[',
  BACKSLASH: '\\',
  CLOSE_BRACKET: ']',
  QUOTE: '\'',
} as const;

export const KEYS = {
  ...STANDARD_KEYS,
  ...ARROW_KEYS,
  ...SPECIAL_KEYS,
} as const;

type TTriggers = 'update' | 'keydown' | 'keyup' | 'change';

export type THandlerCallback = (props: {
  /**
   * The keys that were pressed to activate the handler
   */
  keys: string | string[];

  /**
   * The current state of the game
   */
  game: TInitializedGame;

  /**
   * The time since the last frame
   */
  deltaTime: number;

  /**
   * dictates whether this handler was active in the previous frame.
   */
  activePreviousFrame: boolean;

  /**
   * The entity that this handler is attached to
   */
  entity: TInternalEntity
}) => void

export type THandler = {
  /**
   * The name of the handler
   */
  name: string,

  /**
   * The keys that should be pressed to activate the handler
   */
  keys: Array<string | string[]>,

  /**
   * The event that should trigger the handler
   */
  triggers: Array<TTriggers>,

  /**
   * The function to call when the keys are pressed
   */
  handler: THandlerCallback,

  /**
   * Used to identify the handler, this can be used when removing handlers from the game
   */
  identifier: string,

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
};

export type THandlers = Array<THandler>;

export const getInputHandlers = (game: TInitializedGame, trigger?: TTriggers) => game.components.input.components.reduce((acc, { handlers }) => {
  const filteredHandlers = trigger ? handlers.filter((handler) => handler.triggers.includes(trigger)) : handlers;

  return acc.concat(filteredHandlers)
}, [] as THandlers);

export const generateHandler = ({
  name, 
  keys,
  handler,
  description,
  priority,
  triggers,
  deescalations
}: {
  name: string,
  keys: Array<string | string[]>,
  handler: THandler['handler'],
  description?: string,
  priority?: number,
  triggers?: THandler['triggers'],
  deescalations?: Array<string>
}): THandlers[number] => ({
  name,
  keys,
  handler,
  identifier: generateUUID(),
  description: description ?? name,
  priority: priority ?? 0,
  triggers: triggers ?? ['update'],
  deescalations: deescalations ?? []
} as THandler); 


export const updatePreviousHandlerIds = () => {
  game.components.input.previousHandlerIDs = game.components.input.currentHandlerIDs;
  game.components.input.currentHandlerIDs = [];
}

const updateCurrentHandlerIds = (handler: THandler) => {
  const { currentHandlerIDs } = game.components.input

  if (!currentHandlerIDs.includes(handler.identifier)) {
    currentHandlerIDs.push(handler.identifier);
  }
}

/**
 * Calls the handler and enforces deescalations
 */
const onMatch = (handler: THandlers[number], enforedDeescalations: string[], keys: string | string[]) => {
  updateCurrentHandlerIds(handler);

  // note: the handler is wrapped in a function that provides the entity correlating to this handler so it is not provided. See injectEntities in src/engine/index.js
  handler.handler({
    activePreviousFrame: game.components.input.previousHandlerIDs.includes(handler.identifier),
    deltaTime: game.meta.deltaTime,
    game: game as TInitializedGame,
    keys
  } as any);

  if (handler.deescalations)
    enforedDeescalations.push(...handler.deescalations);
}

/**
 * Handles key presses for individual and combined keys, This function does not have a concept of "triggers"
 * And therefore does not change functionality based on the trigger type, this only handles whether the key is pressed or not
 * and calls each of the passed handlers that match
 */
export const keyHandler = (handlers: THandlers) => {
  const enforcedDeescalations = [] as string[];

  handlers.forEach((handler) => {
    if (enforcedDeescalations.includes(handler.name))
      return;

    for (let i = 0; i < handler.keys.length; ++i) {
      const match = handler.keys[i];
      
      if (Array.isArray(match)) {
        // match is an array of keys that must all be pressed
        if (!match.every((key) => game.components.input.currentKeys[key.toLowerCase()]))
          continue;

        return onMatch(handler, enforcedDeescalations, match);
      }

      if (!game.components.input.currentKeys[match.toLowerCase()])
        continue;

      return onMatch(handler, enforcedDeescalations, match);
    }
  });
}

const getEventHandler = ({ 
  direction, 
  handlers 
} : { 
  direction: ValueOf<typeof KEY_DIRECTION>, 
  handlers: THandlers 
}) => ({ key: caseKey }: KeyboardEvent) => {
  const key = caseKey.toLowerCase();

  if (direction === KEY_DIRECTION.UP) {
    if (game.components.input.currentKeys[key]) {
      delete game.components.input.currentKeys[key];
      keyHandler(handlers);
    }
  }

  if (direction === KEY_DIRECTION.DOWN) {
    if (!game.components.input.currentKeys[key]) {
      game.components.input.currentKeys[key] = true;
      keyHandler(handlers);
    }
  }
}

/***** Generators *****/
/**
 * @public
 * 
 * Function that should be used when generating an entity to generate an input component
 */
export const generateInput = (handlers: THandlers) => ({
  name: 'input',
  handlers,
  identifier: generateUUID()
} as const);


export const pushHandler = (handler: TGeneratedInputComponent) => game.components.input.components.push(handler)

/**
 * @private
 * 
 * Function that should be used within the @see injectEntities function to generate an input component. This also accepts a callback that by default pushes the handler to the game state.
 */
export const generateInternalHandlers = ({ component, entity } : { component: TGeneratedInputComponent, entity: TInternalEntity }, onGenerate = pushHandler) => {
  const input: TGeneratedInputComponent = {
    ...component,
    handlers: component.handlers.map((handler) => ({
      ...handler,
      handler: (options) => handler.handler({ ...options, entity })
    }))
  }

  onGenerate(input);

  return input;
}


/***** Initialize Functions *****/
/**
 * @private
 * 
 * Function
 */
export const registerControls = ({
  handlers
}: {
  handlers: THandlers
}) => {
  document.onkeydown = getEventHandler({ 
    direction: KEY_DIRECTION.DOWN, 
    handlers: handlers.filter(({ triggers }) => triggers.includes('keydown') || triggers.includes('change'))
  })
  document.onkeyup = getEventHandler({ 
    direction: KEY_DIRECTION.UP, 
    handlers: handlers.filter(({ triggers }) => triggers.includes('keyup') || triggers.includes('change'))
  })
}