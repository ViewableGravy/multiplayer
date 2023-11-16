import { controls } from './initializers/keyboard.ts';
import './style.css'
import { animate, initialize } from './temp.ts';

const setupInitializer = (button: HTMLElement, el: HTMLElement) => {
  button.addEventListener('click', () => {
    initialize({
      el,
      size: {
        height: 500,
        width: 500
      }
    });

    // This is where all the game happens
    animate();
  })
}

const renderControlKeybinds = (keys: string | string[]) => {
  if (Array.isArray(keys)) {
    return keys.map(key => String.raw`
      <span style="color: #04ff00;">
        ${key}
      </span>
    `).join(' + ');
  }

  return String.raw`
    <span style="color: #04ff00;">
      ${keys}
    </span>
  `;
}

const renderControls = () => {
  return controls.map(({ description, keys }) => String.raw`
    <div class="control" style="margin-top: 10px;">
      <div class="control__description">${description}</div>
      <div class="control__keys">${keys.map((key) => renderControlKeybinds(key)).join('or')}</div>
    </div>
  `).join('')
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = String.raw`
  <div className="Application">
    <button id="start">Click to get started!</button>
    <p id="fps"></p>
    <h2 style="font-weight: bold;">Controls</h2>
    ${renderControls()}
    <div id="game"></div>
  </div>
`;

setupInitializer(
  document.querySelector<HTMLButtonElement>('#start')!, 
  document.querySelector<HTMLDivElement>('#game')!
);