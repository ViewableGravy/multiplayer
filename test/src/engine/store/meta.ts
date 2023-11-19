/**
 * @file Meta Function Helpers
 * 
 * This file contains helper functions for accessing game/engine meta data. This should be used internally by the engine
 */

import { game } from "./game"

/**
 * Updates the game object with the current time. This should be run at the end of the current game loop
 */
export const setPreviousFrame = () => {
  game.meta.previousFrame = performance.now()
}

/**
 * Updates the game object with the current time. This should be run at the start of the current game loop
 */
export const setDeltaTime = () => {
  game.meta.deltaTime = performance.now() - game.meta.previousFrame;
}