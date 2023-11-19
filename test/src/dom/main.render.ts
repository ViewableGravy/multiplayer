import { controls } from "./logic.game";

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

export const renderControls = () => {
  return controls.map(({ description, keys }) => String.raw`
    <div class="control" style="margin-top: 10px;">
      <div class="control__description">${description}</div>
      <div class="control__keys">${keys.map((key) => renderControlKeybinds(key)).join('or')}</div>
    </div>
  `).join('')
}