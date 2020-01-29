document.head.appendChild(
  Object.assign(document.createElement("script"), {
    type: "systemjs-importmap",
    textContent: `{"imports": {"react": "//cdn.jsdelivr.net/npm/react/umd/react.development.js"}}`
  })
);
