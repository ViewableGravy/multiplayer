import * as THREE from "three";
import { game } from "../engine/store/game";
import { TUninitializedRenderComponent } from "../engine/components/render";

const getPhongMaterialFromTexture = (texture: THREE.Texture, color: THREE.ColorRepresentation = 0xffffff) => {
  return new THREE.MeshPhongMaterial( { color, map: texture } );
}

export const test = (render: TUninitializedRenderComponent) => {
  render.render.loadGeometry().then(geometry => {
    render.render.loadTexture().then(texture => {
      const mesh = new THREE.Mesh(
        geometry,
        getPhongMaterialFromTexture(texture)
      );

      setTimeout(() => {
        console.log(game.scene)
        game.scene?.add(mesh);
      }, 1000);
    });
  });
}