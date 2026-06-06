// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateSettings') {
    if (message.enabled) {
      applyColorFilter(message.mode, message.intensity);
    } else {
      removeColorFilter();
    }
  }
});

function applyColorFilter(mode, intensity) {
  // Remove existing filter
  removeColorFilter();

  // Create SVG filter
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('id', 'sightbridge-svg');
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

  if (mode === 'protanopia' || mode === 'both') {
    defs.innerHTML += `
      <filter id="protanopia-filter">
        <feColorMatrix type="matrix" values="
          0.567, 0.433, 0,     0, 0
          0.558, 0.442, 0,     0, 0
          0,     0.242, 0.758, 0, 0
          0,     0,     0,     1, 0"/>
      </filter>`;
  }

  if (mode === 'deuteranopia' || mode === 'both') {
    defs.innerHTML += `
      <filter id="deuteranopia-filter">
        <feColorMatrix type="matrix" values="
          0.625, 0.375, 0,   0, 0
          0.7,   0.3,   0,   0, 0
          0,     0.3,   0.7, 0, 0
          0,     0,     0,   1, 0"/>
      </filter>`;
  }

  svg.appendChild(defs);
  document.body.appendChild(svg);

  const filterId = mode === 'both' ? 'protanopia-filter' : `${mode}-filter`;
  document.documentElement.style.filter = `url(#${filterId})`;
  document.documentElement.style.webkitFilter = `url(#${filterId})`;
}

function removeColorFilter() {
  document.documentElement.style.filter = '';
  document.documentElement.style.webkitFilter = '';
  const existing = document.getElementById('sightbridge-svg');
  if (existing) existing.remove();
}

// Apply on load if settings exist
chrome.storage.local.get(['enabled', 'mode', 'intensity'], (data) => {
  if (data.enabled !== false && data.mode) {
    applyColorFilter(data.mode, data.intensity || 100);
  }
});

