import { renderControls } from './dom/main.render.ts';
import { attachStopEngine, setupInitializer } from './dom/logic.game.ts';
import './style.css'

/**
 * Component Start
 * 
 * Renders the application
 */
document.querySelector<HTMLDivElement>('#app')!.innerHTML = String.raw`
  <div className="Application">
    <button id="start">Click to get started!</button>
    <button id="stop">Click to stop!</button>
    <p id="fps"></p>
    <h2 style="font-weight: bold;">Controls</h2>
    ${renderControls()}
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

/**
 * Attaches the stop engine function to the relevant elements
 */
attachStopEngine(
  document.querySelector<HTMLButtonElement>('#stop')!,
  document.querySelector<HTMLDivElement>('#game')!
);