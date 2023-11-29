import { TComponent, TPreinitializedEntity, TInitializedGame, TInternalEntity } from "../store/game";


type TScript = (entity: TInternalEntity, game: TInitializedGame) => void;

export const generateScript = (script: TScript, options?: Partial<{
  run: {
    initialize?: boolean,
    update?: boolean,
    destroy?: boolean,
  }
}>) => ({
  name: 'script' as const,
  script,
  run: options?.run ?? {
    update: true
  }
})

export type TPreinitializedScriptComponent = ReturnType<typeof generateScript>;
export type TScriptComponent = TComponent & TPreinitializedScriptComponent;
export type TInternalScriptComponent = TScriptComponent & {
  initialize: () => void,
  update: () => void,
  destroy: () => void,
}

export const injectScript = ({
  script,
  entity,
  game
}: {
  script: TScriptComponent,
  entity: TInternalEntity,
  game: TInitializedGame
}) => {
  // Create an internal script component
  const internalScriptComponent = {
    ...script,
    initialize: () => {
      script.run.initialize && script.script(entity, game);
    },
    update: () => {
      script.run.update && script.script(entity, game);
    },
    destroy: () => {
      script.run.destroy && script.script(entity, game);
    }
  } as TInternalScriptComponent;
  
  if (script.run.initialize) {
    script.script(entity, game);
  }

  // Inject the internal script component into the game
  game.components.scripts.push(internalScriptComponent);

  // return the internal script component (as this is used as part of the map from external to internal entity)
  return internalScriptComponent;
}
