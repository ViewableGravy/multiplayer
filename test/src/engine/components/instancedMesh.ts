/**
 * An instanced mesh provides the ability to render the same geometry multiple times with different transformations.
 * 
 * @see https://threejs.org/docs/#api/en/objects/InstancedMesh
 */

import { game } from "../store/game";
import * as THREE from "three";
import { asyncLoadGeometry } from "./loaders/geometryLoader";

/**
 * @public
 * 
 * Generates an unitialized instancedMesh
 */
export const generateInstancedMesh = ({
  path,
  texture,
  identifier
}: {
  path: string,
  texture: string,
  identifier: string
}) => ({
  type: 'instancedMesh',
  path,
  texture,
  loadGeometry: () => asyncLoadGeometry({ path, type: 'obj' }),
  loadTexture: () => new THREE.TextureLoader().loadAsync(texture),
  identifier
} as TPreInitializedInstancedMesh);

type TUnitializedMesh = {
  type: 'mesh' | 'instancedMesh'
  path: string,
  texture: string,
  loadGeometry: () => Promise<THREE.BufferGeometry>,
  loadTexture: () => Promise<THREE.Texture>
}

export type TPreInitializedInstancedMesh = TUnitializedMesh & {
  type: 'instancedMesh',
  identifier: string
}

export type TInstancedMesh = TPreInitializedInstancedMesh & {
  gameObject: THREE.Object3D
}

export type TEngineInstancedMeshIdentifier = {
  path: string,
  texture: string
}

export type TEngineInstancedMesh = TEngineInstancedMeshIdentifier & {
  mesh: THREE.InstancedMesh,
  registeredComponents: number
}

export type TUpdateInstancedMeshProps = TEngineInstancedMeshIdentifier & {
  mesh?: THREE.InstancedMesh
}

/**
 * @private
 * 
 * Creates a new instancedMesh and adds it to the engine
 */
export const createEngineInstancedMesh = ({
  path,
  texture,
  geometry,
  material,
  count = 1,
  registeredComponents = 0
}: {
  path: string,
  texture: string,
  geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[],
  count?: number,
  registeredComponents?: number
}) => {
  const mesh = {
    path,
    texture,
    mesh: new THREE.InstancedMesh(geometry, material, count),
    registeredComponents
  };

  // insert mesh to engine
  game.components.render.engine.meshes.instanced.push(mesh);

  if (!game.scene) {
    throw new Error('Scene not found');
  }
  // add meshes to scene
  game.scene?.add(mesh.mesh);
}

export const doesEngineInstancedMeshAlreadyExist = ({
  path,
  texture
}: TEngineInstancedMeshIdentifier) => game.components.render.engine.meshes.instanced.some(({ path: _path, texture: _texture }) => path === _path && texture === _texture);

export const getEngineInstancedMesh = ({
  path,
  texture
}: TEngineInstancedMeshIdentifier) => game.components.render.engine.meshes.instanced.find(({ path: _path, texture: _texture }) => path === _path && texture === _texture);

const findIndexEngineInstancedMesh = ({
  path,
  texture
}: TEngineInstancedMeshIdentifier) => game.components.render.engine.meshes.instanced.findIndex(({ path: _path, texture: _texture }) => path === _path && texture === _texture);

const popEngineInstancedMesh = ({
  path,
  texture
}: TEngineInstancedMeshIdentifier) => {
  const index = findIndexEngineInstancedMesh({ path, texture });

  if (index === -1) {
    throw new Error('Instanced mesh not found');
  }

  const mesh = game.components.render.engine.meshes.instanced.splice(index, 1)[0];

  game.scene?.remove(mesh.mesh);

  return mesh;
}

export const createComponentInstancedMesh = (mesh: TPreInitializedInstancedMesh) => {
  const _gameObject = new THREE.Object3D();

  game.components.render.component.meshes.instanced.push({
    ...mesh,
    gameObject: _gameObject,
  });
}

/**
 * @private
 * 
 * Updates the engines instancedMesh count to increase or decrease registered components.
 * During this process, it will also create new instancedMeshes if necessary
 */
export const updateEngineInstancedMesh = ({
  mesh,
  path,
  texture
}: TUpdateInstancedMeshProps) => {
  const instancedMesh = getEngineInstancedMesh({ path, texture });

  if (!instancedMesh) {
    throw new Error('Instanced mesh not found');
  }

  if (!mesh) {
    //decrease registered components by one
    instancedMesh.registeredComponents--;

    //only decrease if it is above 20%
    if (instancedMesh.mesh.count > instancedMesh.registeredComponents * 1.2) {
      //pop
      const popped = popEngineInstancedMesh({ path, texture });

      //pop and then create new instancedMesh with 20% less count
      const newCount = Math.ceil(popped.mesh.count * 0.8);

      createEngineInstancedMesh({
        path,
        texture,
        geometry: popped.mesh.geometry,
        material: popped.mesh.material,
        count: newCount,
        registeredComponents: popped.registeredComponents
      });
    }

    return;
  } 

  //increase registered components by one
  instancedMesh.registeredComponents++;
  
  if (instancedMesh.registeredComponents === instancedMesh.mesh.count) {
    //pop
    const popped = popEngineInstancedMesh({ path, texture });

    //then create new instancedMesh with 20% more count
    const newCount = Math.ceil(popped.mesh.count * 1.2);

    createEngineInstancedMesh({
      path,
      texture,
      geometry: popped.mesh.geometry,
      material: popped.mesh.material,
      count: newCount,
      registeredComponents: popped.registeredComponents
    });
  }
}
