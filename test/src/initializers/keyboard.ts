import { TInitializedGame, game } from "../store/game";
import { ValueOf } from "../types/helpers";

/**
 * This can likely be attached to the main game object in the future
 */
// export const currentKeys = {} as Record<string, boolean>;

const KEY_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type THandlers = {
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
  triggers: Array<'update' | 'keydown' | 'keyup' | 'change'>,

  /**
   * The function to call when the keys are pressed
   */
  handler: (props: {
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
  }) => void,

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
}[];

export const getInputHandlers = (game: TInitializedGame) => game.components.input.components.reduce((acc, { handlers }) => acc.concat(handlers), [] as THandlers);

//todo: I've added a lot of props in this object, this is mainly to allow for more flexibility in the future
// specifically, triggers which specify when the handler should be called - I might need to change this to an array in case they want it triggered on keydown/keyup and on render

// I also need the properties to pass to the callback. This should generally be a matter of adding some more meta to the "currentKeys" object on the game (ie. previousKeys to calculate activePreviousFrame)
// as well as delta time which I can calculate in the main loop and store on the game object.

/**
 * Calls the handler and enforces deescalations
 */
const onMatch = (handler: THandlers[number], enforedDeescalations: string[]) => {
  //todo proper implementation
  handler.handler({
    activePreviousFrame: false,
    deltaTime: 0,
    game: game as TInitializedGame,
    keys: 'w'
  });

  if (handler.deescalations)
    enforedDeescalations.push(...handler.deescalations);
}

/**
 * Handles key presses for individual and combined keys
 */
export const keyHandler = (handlers: THandlers,) => {
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

        return onMatch(handler, enforcedDeescalations);
      }

      if (!game.components.input.currentKeys[match.toLowerCase()])
        continue;

      return onMatch(handler, enforcedDeescalations);
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

export const registerControls = ({
  handlers
}: {
  handlers: THandlers
}) => {
  document.onkeydown = getEventHandler({ direction: KEY_DIRECTION.DOWN, handlers })
  document.onkeyup = getEventHandler({ direction: KEY_DIRECTION.UP, handlers })
}