import { renderControls } from './dom/main.render.ts';
import { attachStopEngine, setupIanCubeCube, setupInitializer } from './dom/logic.game.ts';
import './style.css'

/**
 * Component Start
 * 
 * Renders the application
 */
document.querySelector<HTMLDivElement>('#app')!.innerHTML = String.raw`
  <div className="Application">
    <button id="start">Click to see one cube!</button>
    <button id="cubecube">Click to see many cubes!</button>
    <button id="stop">Click to stop!</button>
    <p>warning - stopping game does not currently remove eventListeners</p>
    <p id="fps"></p>
    <h2 style="font-weight: bold;">Controls</h2>
    ${renderControls()}
    <h2>Current Input</h2>
    <p id="inputs"></p>
    <div id="game"></div>
  </div>
`;

/**
 * Attaches the start engine function to the relevant elements
 */
setupInitializer(
  document.querySelector<HTMLButtonElement>('#start')!, 
  document.querySelector<HTMLDivElement>('#game')!
);

setupIanCubeCube(
  document.querySelector<HTMLButtonElement>('#cubecube')!,
  document.querySelector<HTMLDivElement>('#game')!
);

/**
 * Attaches the stop engine function to the relevant elements
 */
attachStopEngine(
  document.querySelector<HTMLButtonElement>('#stop')!,
  document.querySelector<HTMLDivElement>('#game')!
);