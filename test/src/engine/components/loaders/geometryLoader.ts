import * as THREE from "three";
import { BufferGeometryUtils, OBJLoader } from "three/examples/jsm/Addons.js";

const getGeometryFromObjGroup = (mesh: THREE.Group<THREE.Object3DEventMap> ) => {
  const geometries = [] as THREE.BufferGeometry[];

  for (const _mesh of mesh.children) {
    if (_mesh instanceof THREE.Mesh) {
      geometries.push(_mesh.geometry);
    }
  }

  console.log(geometries)

  return geometries;
}

export const asyncLoadGeometry = async ({
  type,
  path,
}: {
  path: string,
  type: 'obj'
}) => {
  console.log('here')
  if (!type) {
    throw new Error('No type provided');
  }

  const obj = await new OBJLoader().loadAsync(path);

  const geometries = getGeometryFromObjGroup(obj);
  const _mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  
  return _mergedGeometry;
}