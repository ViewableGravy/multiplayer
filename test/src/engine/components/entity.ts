import { generateUUID } from "three/src/math/MathUtils.js";
import { TPreinitializedEntity, TUnionPreinitializedComponents } from "../store/game";

export const generateEntity = ({ name, components }: {
  name: string,
  components: Array<Partial<TUnionPreinitializedComponents>>
}) => {
  const entity = {
    name,
    id: generateUUID(),
    components: []
  } as TPreinitializedEntity;

  entity.components.push(...components.map((component) => ({
    ...component,
    entity,
  } as TUnionPreinitializedComponents)));

  return entity;
}
