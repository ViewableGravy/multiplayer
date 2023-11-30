import { generateUUID } from "three/src/math/MathUtils.js";
import { TUninitializedComponent } from "../store/game";
import { TInstancedMesh, TPreInitializedInstancedMesh, generateInstancedMesh } from "./instancedMesh";
import type { TComponent } from "../store/game";
import { handleMeshLoad } from "./loaders/meshLoader";

// expand this with new types in the future
type TGenerateRender = (props: {
  path: string,
  texture: string,
  type: 'instancedMesh'
}) => TUninitializedRenderComponent;

export const generateRender: TGenerateRender = ({
  path,
  texture,
  type,
}) => {
  switch(type) {
    case 'instancedMesh': {
      const identifier = generateUUID();
    
      return {
        name: 'render',
        type: 'instancedMesh',
        identifier,
        render: generateInstancedMesh({
          path,
          texture,
          identifier
        }),
      }
    }
    default:
      throw new Error('Invalid type provided');
  }
}

export const generateInternalRenderComponent = async ({ component }: { component: TRenderComponent }): Promise<TInternalRenderComponent> => {
  return await {
    ...component,
    render: await handleMeshLoad(component.render)
  } as TInternalRenderComponent;
}

export type TUninitializedRenderComponent = TUninitializedComponent & {
  name: 'render',
  type: 'instancedMesh',
  render: TPreInitializedInstancedMesh
};

export type TInternalRenderComponent = TComponent & {
  name: 'render',
  type: 'instancedMesh',
  render: TInstancedMesh
}

export type TRenderComponent = TComponent & TUninitializedRenderComponent

export type TPreInitializedRenderComponent = ReturnType<typeof generateRender>;