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

function updateTrayClocks() {
  const now = new Date();
  const formattedTime = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  document.querySelectorAll(".taskbar-tray time").forEach((clock) => {
    clock.textContent = formattedTime;
    clock.setAttribute("datetime", now.toISOString());
  });
}

updateTrayClocks();
setInterval(updateTrayClocks, 1000);

const windowStyleProperties = ["position", "left", "top", "width", "height", "maxWidth", "margin", "zIndex"];
let activeZIndex = 40;

function getTaskbarHeight() {
  const taskbar = document.querySelector(".win95-start");

  return taskbar?.getBoundingClientRect().height || 38;
}

function getTaskButton(windowName) {
  return document.querySelector(`[data-task-window="${windowName}"]`);
}

function setActiveWindow(targetWindow) {
  document.querySelectorAll("[data-window]").forEach((desktopWindow) => {
    const taskButton = getTaskButton(desktopWindow.dataset.window);
    const isActive = desktopWindow === targetWindow && !desktopWindow.classList.contains("is-minimized") && !desktopWindow.classList.contains("is-closed");

    taskButton?.classList.toggle("is-active", isActive);
  });

  if (!targetWindow || targetWindow.classList.contains("is-minimized") || targetWindow.classList.contains("is-closed")) {
    return;
  }

  activeZIndex += 1;
  targetWindow.style.zIndex = String(activeZIndex);
}

function saveWindowStyle(desktopWindow) {
  desktopWindow.dataset.savedStyle = JSON.stringify(windowStyleProperties.reduce((style, property) => {
    style[property] = desktopWindow.style[property];
    return style;
  }, {}));
}

function applySavedWindowStyle(desktopWindow) {
  if (!desktopWindow.dataset.savedStyle) {
    return;
  }

  const savedStyle = JSON.parse(desktopWindow.dataset.savedStyle);

  windowStyleProperties.forEach((property) => {
    desktopWindow.style[property] = savedStyle[property] || "";
  });

  delete desktopWindow.dataset.savedStyle;
}

function setMaximizeButtonState(desktopWindow, isMaximized) {
  const maximizeButton = desktopWindow.querySelector('[aria-label="Maximize"], [aria-label="Restore"]');

  if (!maximizeButton) {
    return;
  }

  maximizeButton.textContent = isMaximized ? "❐" : "⬜";
  maximizeButton.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
}

function restoreWindow(desktopWindow) {
  const taskButton = getTaskButton(desktopWindow.dataset.window);

  desktopWindow.classList.remove("is-closed", "is-minimized");
  taskButton?.classList.remove("is-hidden", "is-minimized");
  setActiveWindow(desktopWindow);
}

function maximizeWindow(desktopWindow) {
  if (!desktopWindow.classList.contains("is-maximized")) {
    saveWindowStyle(desktopWindow);
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
  setMaximizeButtonState(desktopWindow, true);
  setActiveWindow(desktopWindow);
}

function restoreMaximizedWindow(desktopWindow) {
  desktopWindow.classList.remove("is-maximized");
  applySavedWindowStyle(desktopWindow);
  setMaximizeButtonState(desktopWindow, false);
}

function toggleMaximizeWindow(desktopWindow) {
  if (desktopWindow.classList.contains("is-minimized") || desktopWindow.classList.contains("is-closed")) {
    return;
  }

  if (desktopWindow.classList.contains("is-maximized")) {
    restoreMaximizedWindow(desktopWindow);
    setActiveWindow(desktopWindow);
  } else {
    maximizeWindow(desktopWindow);
  }
}

function minimizeWindow(desktopWindow) {
  const taskButton = getTaskButton(desktopWindow.dataset.window);

  desktopWindow.classList.add("is-minimized");
  taskButton?.classList.remove("is-hidden", "is-active");
  taskButton?.classList.add("is-minimized");
}

function closeWindow(desktopWindow) {
  const taskButton = getTaskButton(desktopWindow.dataset.window);

  if (desktopWindow.classList.contains("is-maximized")) {
    restoreMaximizedWindow(desktopWindow);
  }

  desktopWindow.classList.add("is-closed");
  desktopWindow.classList.remove("is-minimized");
  taskButton?.classList.add("is-hidden");
  taskButton?.classList.remove("is-active", "is-minimized");
}

document.querySelectorAll("[data-open-window]").forEach((desktopIcon) => {
  desktopIcon.addEventListener("click", () => {
    const targetWindow = document.querySelector(`[data-window="${desktopIcon.dataset.openWindow}"]`);

    if (targetWindow) {
      restoreWindow(targetWindow);
    }
  });
});

document.querySelectorAll("[data-task-window]").forEach((taskButton) => {
  taskButton.addEventListener("click", () => {
    const targetWindow = document.querySelector(`[data-window="${taskButton.dataset.taskWindow}"]`);

    if (targetWindow) {
      restoreWindow(targetWindow);
    }
  });
});

document.querySelectorAll("[data-window]").forEach((desktopWindow) => {
  const titlebar = desktopWindow.querySelector(".win95-titlebar");
  let dragState = null;

  desktopWindow.addEventListener("pointerdown", () => setActiveWindow(desktopWindow));
  desktopWindow.querySelector('[aria-label="Minimize"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    minimizeWindow(desktopWindow);
  });
  desktopWindow.querySelector('[aria-label="Maximize"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleMaximizeWindow(desktopWindow);
  });
  desktopWindow.querySelector('[aria-label="Close"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeWindow(desktopWindow);
  });

  titlebar?.addEventListener("pointerdown", (event) => {
    const clickedControl = event.target instanceof Element && event.target.closest(".titlebar-controls");

    if (event.button !== 0 || clickedControl || desktopWindow.classList.contains("is-minimized") || desktopWindow.classList.contains("is-closed") || desktopWindow.classList.contains("is-maximized")) {
      return;
    }

    setActiveWindow(desktopWindow);

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

  titlebar?.addEventListener("pointermove", (event) => {
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

  titlebar?.addEventListener("pointerup", (event) => {
    if (!dragState) {
      return;
    }

    dragState = null;
    desktopWindow.classList.remove("is-dragging");
    titlebar.releasePointerCapture(event.pointerId);
  });

  titlebar?.addEventListener("pointercancel", () => {
    dragState = null;
    desktopWindow.classList.remove("is-dragging");
  });

  titlebar?.addEventListener("dblclick", (event) => {
    const clickedControl = event.target instanceof Element && event.target.closest(".titlebar-controls");

    if (!clickedControl) {
      toggleMaximizeWindow(desktopWindow);
    }
  });
});

window.addEventListener("resize", () => {
  document.querySelectorAll("[data-window].is-maximized").forEach((desktopWindow) => {
    desktopWindow.style.height = `calc(100vh - ${getTaskbarHeight()}px)`;
  });
});

/* --- Boot splash: shown once per browser session --- */
function showBootSplash() {
  let alreadyBooted = false;
  try {
    alreadyBooted = sessionStorage.getItem("xp-booted") === "1";
  } catch (error) {
    alreadyBooted = false;
  }

  if (alreadyBooted) {
    return;
  }

  const boot = document.createElement("div");
  boot.className = "xp-boot";
  boot.setAttribute("role", "status");
  boot.setAttribute("aria-label", "Starting Windows");
  boot.innerHTML = `
    <div class="xp-boot-logo">
      <span class="xp-boot-flag" aria-hidden="true"></span>
      <span class="xp-boot-wordmark">
        <span class="micro">Zil&nbsp;Rahman</span><br>
        <span class="xp">portfolio XP</span>
      </span>
    </div>
    <div class="xp-boot-bar" aria-hidden="true"></div>
    <div class="xp-boot-footer">
      <span>Copyright &copy; Calgary, AB</span>
      <span>Professional</span>
    </div>`;

  document.body.appendChild(boot);

  try {
    sessionStorage.setItem("xp-booted", "1");
  } catch (error) {
    /* storage unavailable — splash simply shows every load */
  }

  const dismiss = () => {
    boot.classList.add("is-hiding");
    setTimeout(() => boot.remove(), 700);
  };

  setTimeout(dismiss, 2400);
  boot.addEventListener("click", dismiss);
}

showBootSplash();

/* --- Windows Picture and Fax Viewer (photo lightbox) --- */
function initPhotoViewer() {
  const thumbs = Array.from(document.querySelectorAll("[data-photo]"));

  if (!thumbs.length) {
    return;
  }

  const photos = thumbs.map((thumb) => ({
    src: thumb.dataset.photo,
    caption: thumb.dataset.caption || "",
  }));

  const viewer = document.createElement("div");
  viewer.className = "photo-viewer";
  viewer.hidden = true;
  viewer.innerHTML = `
    <div class="win95-window win95-outset photo-viewer-window" role="dialog" aria-modal="true" aria-label="Picture viewer">
      <header class="win95-titlebar">
        <div class="title-text">
          <svg class="title-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-11zM3 11l3-3.5L8 10l2.5-3L13 11H3z"/></svg>
          <span class="photo-viewer-title">Windows Picture and Fax Viewer</span>
        </div>
        <div class="titlebar-controls">
          <button class="win95-btn" type="button" data-photo-close aria-label="Close">&#10005;</button>
        </div>
      </header>
      <div class="photo-viewer-stage win95-inset">
        <img alt="">
      </div>
      <div class="photo-viewer-toolbar">
        <button class="photo-nav" type="button" data-photo-prev aria-label="Previous">&#8249;</button>
        <span class="photo-viewer-caption"></span>
        <button class="photo-nav" type="button" data-photo-next aria-label="Next">&#8250;</button>
      </div>
    </div>`;

  document.body.appendChild(viewer);

  const image = viewer.querySelector(".photo-viewer-stage img");
  const caption = viewer.querySelector(".photo-viewer-caption");
  const titleText = viewer.querySelector(".photo-viewer-title");
  let current = 0;

  function render() {
    const photo = photos[current];
    image.src = photo.src;
    image.alt = photo.caption || "";
    const position = `${current + 1} / ${photos.length}`;
    caption.textContent = photo.caption ? `${photo.caption} · ${position}` : position;
    titleText.textContent = photo.caption
      ? `${photo.caption} — Windows Picture and Fax Viewer`
      : "Windows Picture and Fax Viewer";
  }

  function open(index) {
    current = index;
    render();
    viewer.hidden = false;
  }

  function close() {
    viewer.hidden = true;
  }

  function step(delta) {
    current = (current + delta + photos.length) % photos.length;
    render();
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => open(index));
  });

  viewer.querySelector("[data-photo-close]").addEventListener("click", close);
  viewer.querySelector("[data-photo-prev]").addEventListener("click", () => step(-1));
  viewer.querySelector("[data-photo-next]").addEventListener("click", () => step(1));

  viewer.addEventListener("click", (event) => {
    if (event.target === viewer) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (viewer.hidden) {
      return;
    }

    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowLeft") {
      step(-1);
    } else if (event.key === "ArrowRight") {
      step(1);
    }
  });
}

initPhotoViewer();
