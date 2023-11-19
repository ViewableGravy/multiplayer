import { generateUUID } from "three/src/math/MathUtils.js";
import { TEntity, TUnionComponents } from "../store/game";

export const generateEntity = ({ name, components }: {
  name: string,
  components: Array<Partial<TUnionComponents>>
}) => {
  const entity = {
    name,
    id: generateUUID(),
    components: []
  } as TEntity;

  entity.components.push(...components.map((component) => ({
    ...component,
    entity
  } as TUnionComponents)));

  return entity;
}