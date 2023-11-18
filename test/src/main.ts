import { THandlers } from './initializers/keyboard.ts';
import { animate, initialize } from './temp.ts';
import './style.css'
import { generateUUID } from 'three/src/math/MathUtils.js';
import { TEntity, TInputComponent, TUninitializedInputComponent, TUnionComponents } from './store/game.ts';
import { ValueOf } from './types/helpers.ts';

const SPEEDS = {
  CRAWL: 0.1,
  WALK: 0.2,
  RUN: 0.5,
  SPRINT: 1,
}

const HANDLER_NAMES = {
  WALK_UP: 'walkUp',
  RUN_UP: 'runUp',
} as const;

const events = {
  up: (speed: ValueOf<typeof SPEEDS> = SPEEDS.WALK ) => () => {
    console.log('up: ', speed)
  },
  left: () => {
    console.log('left')
  },
  down: () => {
    console.log('down')
  },
  right: () => {
    console.log('right')
  },
}

/**
 * An array of event handlers, these are sorted by their respective priorities
 */
const handlers: THandlers = [
  {
    name: HANDLER_NAMES.WALK_UP,
    keys: [ 'w', 'ArrowUp' ],
    handler: events.up(),
    identifier: generateUUID(),
    description: 'Walk Forward',
    priority: 0,
  },
  {
    name: HANDLER_NAMES.RUN_UP,
    keys: [[ 'Shift', 'w' ], [ 'Shift', 'ArrowUp' ]],
    handler: events.up(SPEEDS.SPRINT),
    identifier: generateUUID(),
    priority: 1,
    description: 'Run Forward',
    deescalations: [HANDLER_NAMES.WALK_UP]
  }
].sort((a, b) => b.priority - a.priority);

export const controls = handlers.map(({ name, keys, description }) => ({ name, keys, description }))

const generateEntity = ({ name, components }: {
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

const generateInput = (handlers: THandlers): TUninitializedInputComponent => ({
  name: 'input',
  handlers
});

const getInitialEntities = (): Array<TEntity> => [
  generateEntity({ 
    name: 'random', 
    components: [
      generateInput(handlers)
    ] 
  })
];

const setupInitializer = (button: HTMLElement, el: HTMLElement) => {
  const initializedEntities = getInitialEntities();

  button.addEventListener('click', () => {
    initialize({
      el,
      size: {
        height: 500,
        width: 500
      },
      initializedEntities
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