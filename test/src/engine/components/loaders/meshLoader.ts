import * as THREE from 'three';
import { asyncLoadGeometry } from './geometryLoader';
import { generateUUID } from 'three/src/math/MathUtils.js';
import { TPreInitializedInstancedMesh, createComponentInstancedMesh, createEngineInstancedMesh, doesEngineInstancedMeshAlreadyExist, getEngineInstancedMesh, updateEngineInstancedMesh } from '../instancedMesh';


/**
 * @private
 * 
 * accepts a mesh, and performs the necessary operations to inject it into the scene
 */
export const handleMeshLoad = async (mesh: TPreInitializedInstancedMesh) => {
  const { loadGeometry, loadTexture } = mesh;

  //for now, we assume it's an instancedMesh, normal meshes can be handled later
  const doesInstanceAlreadyExist = doesEngineInstancedMeshAlreadyExist({ path: mesh.path, texture: mesh.texture });

  const [geometry, texture] = await Promise.all([
    loadGeometry(),
    loadTexture()
  ]);

  const material = new THREE.MeshPhongMaterial({ map: texture }); //hard coded for now

  if (!doesInstanceAlreadyExist) {
    // Insert raw mesh and identifiers into the engine
    createEngineInstancedMesh({ 
      path: mesh.path, 
      texture: mesh.texture, 
      geometry, 
      material 
    });

    // Insert game object and mesh into the game (this can be accessed by the user)
    createComponentInstancedMesh(mesh);
  } else {
    // Note: If this becomes a performance bottleneck, then .some and this can be used at the same time.
    const instancedMesh = getEngineInstancedMesh({ path: mesh.path, texture: mesh.texture });

    if (!instancedMesh) {
      throw new Error('Instanced mesh not found. This should never happen as we previously checked if it existed');
    }

    // Update the engine instancedMesh count
    updateEngineInstancedMesh({ 
      path: mesh.path, 
      texture: mesh.texture, 
      mesh: instancedMesh.mesh
    });

    // Update the component instancedMesh count
    createComponentInstancedMesh(mesh);
  }
} 

type TGenerateMeshLoaderOptions = {
  type: 'obj',
  path: string,
  texture: string,
  instanced?: true
};

type TGenerateMeshLoader = (options: TGenerateMeshLoaderOptions) => () => TPreInitializedInstancedMesh;

/**
 * @public
 * Generates a mesh loader for the engine. Note that by default this only supports OBJ files.
 * 
 * This function will automatically attempt to create an instanced mesh from the information provided
 */
export const generateMesh: TGenerateMeshLoader = ({
  type,
  path,
  texture,
  instanced = true
}) => {
  return () => ({
    type: instanced ? 'instancedMesh' : 'mesh',
    path,
    texture,
    loadGeometry: () => asyncLoadGeometry({ path, type }),
    loadTexture: () => new THREE.TextureLoader().loadAsync(texture), //create abstraction over this
    identifier: generateUUID(),
  }) as TPreInitializedInstancedMesh;
}