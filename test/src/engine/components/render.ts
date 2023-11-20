import { generateUUID } from "three/src/math/MathUtils.js";
import { TUninitializedComponent, TUninitializedRenderComponent } from "../store/game";

export const assignIdentifier = <T>(component: TUninitializedComponent & Record<string, any>) => {
  component.identifier = generateUUID();

  return component as T & { identifier: string };
};

export const generateRender = ({
  mesh
}: {
  mesh: THREE.Mesh
}) => assignIdentifier<TUninitializedRenderComponent>(({
  name: 'render',
  render: {
    mesh 
  },
}));