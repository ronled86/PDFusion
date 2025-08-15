// Custom cursor styles for annotation tools
export const setCursor = (tool: string | null) => {
  const body = document.body;
  
  // Remove any existing cursor classes
  body.classList.remove('cursor-marker', 'cursor-pen', 'cursor-default', 'cursor-text-select', 'cursor-hand-grab');
  
  switch (tool) {
    case 'select':
      body.classList.add('cursor-text-select');
      break;
    case 'text':
      body.classList.add('cursor-text-select');
      break;
    case 'hand':
      body.classList.add('cursor-hand-grab');
      break;
    case 'highlight':
      body.classList.add('cursor-marker');
      break;
    case 'draw':
      body.classList.add('cursor-pen');
      break;
    default:
      body.classList.add('cursor-default');
      break;
  }
};

// CSS for custom cursors (to be added to styles.css)
export const customCursorStyles = `
.cursor-text-select {
  cursor: text !important;
}

.cursor-hand-grab {
  cursor: grab !important;
}

.cursor-hand-grab:active {
  cursor: grabbing !important;
}

.cursor-marker {
  cursor: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23FFEB3B' stroke-width='2'%3E%3Cpath d='M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1h-2m2 3v16l-7-3-7 3V7'/%3E%3C/svg%3E") 12 12, crosshair !important;
}

.cursor-pen {
  cursor: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000000' stroke-width='2'%3E%3Cpath d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'/%3E%3C/svg%3E") 2 22, crosshair !important;
}

.cursor-default {
  cursor: default !important;
}
`;
