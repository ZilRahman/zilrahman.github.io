// Tiny desktop interactions for the XP shell.
console.log("Welcome to Zil Rahman's 1995 Portfolio. Systems: 100% stable.");

document.addEventListener("click", (event) => {
  const startToggle = document.getElementById("start-toggle");
  const clickTarget = event.target;
  const clickedStartControl =
    clickTarget instanceof Element &&
    clickTarget.closest(".start-toggle, .start-button, .start-items");

  if (!startToggle) {
    return;
  }

  if (!clickedStartControl) {
    startToggle.checked = false;
  }
});

document.addEventListener("keydown", (event) => {
  const startToggle = document.getElementById("start-toggle");

  if (event.key === "Escape" && startToggle) {
    startToggle.checked = false;
  }
});

const desktopWindow = document.querySelector(".win95-window");
const titlebar = document.querySelector(".win95-titlebar");
const minimizeButton = document.querySelector('.win95-btn[aria-label="Minimize"]');
const maximizeButton = document.querySelector('.win95-btn[aria-label="Maximize"]');
const closeButton = document.querySelector('.win95-btn[aria-label="Close"]');
const taskbarWindow = document.querySelector(".taskbar-window");
const desktopIcon = document.querySelector(".desktop-icon");
const windowStyleProperties = ["position", "left", "top", "width", "height", "maxWidth", "margin", "zIndex"];
let savedWindowStyle = null;

function getTaskbarHeight() {
  const taskbar = document.querySelector(".win95-start");

  return taskbar?.getBoundingClientRect().height || 38;
}

function saveWindowStyle() {
  if (!desktopWindow) {
    return;
  }

  savedWindowStyle = windowStyleProperties.reduce((style, property) => {
    style[property] = desktopWindow.style[property];
    return style;
  }, {});
}

function applySavedWindowStyle() {
  if (!desktopWindow || !savedWindowStyle) {
    return;
  }

  windowStyleProperties.forEach((property) => {
    desktopWindow.style[property] = savedWindowStyle[property];
  });

  savedWindowStyle = null;
}

function setMaximizeButtonState(isMaximized) {
  if (!maximizeButton) {
    return;
  }

  maximizeButton.textContent = isMaximized ? "❐" : "⬜";
  maximizeButton.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
}

function restoreWindow() {
  if (!desktopWindow || !taskbarWindow) {
    return;
  }

  desktopWindow.classList.remove("is-closed");
  desktopWindow.classList.remove("is-minimized");
  taskbarWindow.style.removeProperty("display");
  taskbarWindow.classList.remove("is-minimized");
  taskbarWindow.classList.add("is-active");
}

function maximizeWindow() {
  if (!desktopWindow) {
    return;
  }

  if (!desktopWindow.classList.contains("is-maximized")) {
    saveWindowStyle();
  }

  desktopWindow.classList.remove("is-minimized", "is-closed");
  desktopWindow.classList.add("is-maximized");
  desktopWindow.style.position = "fixed";
  desktopWindow.style.left = "0";
  desktopWindow.style.top = "0";
  desktopWindow.style.width = "100vw";
  desktopWindow.style.height = `calc(100vh - ${getTaskbarHeight()}px)`;
  desktopWindow.style.maxWidth = "none";
  desktopWindow.style.margin = "0";
  desktopWindow.style.zIndex = "40";
  setMaximizeButtonState(true);
}

function restoreMaximizedWindow() {
  if (!desktopWindow) {
    return;
  }

  desktopWindow.classList.remove("is-maximized");
  applySavedWindowStyle();
  setMaximizeButtonState(false);
}

function toggleMaximizeWindow() {
  if (!desktopWindow || desktopWindow.classList.contains("is-minimized") || desktopWindow.classList.contains("is-closed")) {
    return;
  }

  if (desktopWindow.classList.contains("is-maximized")) {
    restoreMaximizedWindow();
  } else {
    maximizeWindow();
  }
}

function minimizeWindow() {
  if (!desktopWindow || !taskbarWindow) {
    return;
  }

  desktopWindow.classList.add("is-minimized");
  taskbarWindow.classList.add("is-minimized");
  taskbarWindow.classList.remove("is-active");
}

function closeWindow() {
  if (!desktopWindow || !taskbarWindow) {
    return;
  }

  restoreMaximizedWindow();
  desktopWindow.classList.add("is-closed");
  desktopWindow.classList.remove("is-minimized");
  taskbarWindow.classList.remove("is-active", "is-minimized");
}

minimizeButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  minimizeWindow();
});

maximizeButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleMaximizeWindow();
});

closeButton?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeWindow();
});

taskbarWindow?.addEventListener("click", (event) => {
  event.preventDefault();
  restoreWindow();
});

desktopIcon?.addEventListener("click", () => {
  restoreWindow();
});

desktopIcon?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    restoreWindow();
  }
});

if (desktopWindow && titlebar) {
  let dragState = null;

  titlebar.addEventListener("pointerdown", (event) => {
    const clickedControl = event.target instanceof Element && event.target.closest(".titlebar-controls");

    if (
      event.button !== 0 ||
      clickedControl ||
      desktopWindow.classList.contains("is-minimized") ||
      desktopWindow.classList.contains("is-closed") ||
      desktopWindow.classList.contains("is-maximized")
    ) {
      return;
    }

    const rect = desktopWindow.getBoundingClientRect();

    desktopWindow.style.position = "fixed";
    desktopWindow.style.left = `${rect.left}px`;
    desktopWindow.style.top = `${rect.top}px`;
    desktopWindow.style.width = `${rect.width}px`;
    desktopWindow.style.maxWidth = "none";
    desktopWindow.style.margin = "0";
    desktopWindow.style.zIndex = "40";
    desktopWindow.classList.add("is-dragging");

    dragState = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };

    titlebar.setPointerCapture(event.pointerId);
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragState) {
      return;
    }

    const minVisible = 80;
    const taskbarHeight = 42;
    const maxLeft = window.innerWidth - minVisible;
    const maxTop = Math.max(0, window.innerHeight - taskbarHeight - 30);
    const nextLeft = Math.min(Math.max(event.clientX - dragState.offsetX, minVisible - dragState.width), maxLeft);
    const nextTop = Math.min(Math.max(event.clientY - dragState.offsetY, 0), maxTop);

    desktopWindow.style.left = `${nextLeft}px`;
    desktopWindow.style.top = `${nextTop}px`;
  });

  titlebar.addEventListener("pointerup", (event) => {
    if (!dragState) {
      return;
    }

    dragState = null;
    desktopWindow.classList.remove("is-dragging");
    titlebar.releasePointerCapture(event.pointerId);
  });

  titlebar.addEventListener("pointercancel", () => {
    dragState = null;
    desktopWindow.classList.remove("is-dragging");
  });

  titlebar.addEventListener("dblclick", (event) => {
    const clickedControl = event.target instanceof Element && event.target.closest(".titlebar-controls");

    if (!clickedControl) {
      toggleMaximizeWindow();
    }
  });
}

window.addEventListener("resize", () => {
  if (desktopWindow?.classList.contains("is-maximized")) {
    desktopWindow.style.height = `calc(100vh - ${getTaskbarHeight()}px)`;
  }
});
