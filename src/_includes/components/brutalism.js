(function () {
  "use strict";

  function initDialogs() {
    const triggers = document.querySelectorAll("[data-ui]");

    triggers.forEach((trigger) => {
      const targetSelector = trigger.getAttribute("data-ui");
      const targetDialog = document.querySelector(targetSelector);

      if (targetDialog) {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          toggleDialog(targetDialog);
        });
      }
    });

    const overlays = document.querySelectorAll(".overlay");
    overlays.forEach((overlay) => {
      overlay.addEventListener("click", () => {
        const sibling = overlay.nextElementSibling;
        if (sibling && sibling.tagName === "DIALOG" && sibling.open) {
          closeDialog(sibling);
        } else {
          closeAllDialogs();
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllDialogs();
      }
    });
  }

  function toggleDialog(dialog) {
    if (dialog.open) {
      closeDialog(dialog);
    } else {
      openDialog(dialog);
    }
  }

  function getOverlay(dialog) {
    const sibling = dialog.previousElementSibling;
    if (sibling && sibling.classList.contains("overlay")) {
      return sibling;
    }
    return null;
  }

  function openDialog(dialog) {
    dialog.showModal();
    dialog.classList.add("active");

    const overlay = getOverlay(dialog);
    if (overlay) {
      overlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";
  }

  function closeDialog(dialog) {
    dialog.close();
    dialog.classList.remove("active");

    const overlay = getOverlay(dialog);
    if (overlay) {
      overlay.classList.remove("active");
    }

    const openDialogs = document.querySelectorAll("dialog[open]");
    if (openDialogs.length === 0) {
      document.body.style.overflow = "";
    }
  }

  function closeAllDialogs() {
    const dialogs = document.querySelectorAll("dialog[open]");
    dialogs.forEach((dialog) => closeDialog(dialog));
  }

  function getSystemMode() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function setMode(mode) {
    if (mode === "light") {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    }
    localStorage.setItem("applied-mode", mode);
  }

  function toggleMode() {
    const currentMode = document.body.classList.contains("dark")
      ? "dark"
      : "light";
    const newMode = currentMode === "dark" ? "light" : "dark";
    setMode(newMode);
    return newMode;
  }

  function setTheme(color) {
    document.documentElement.style.setProperty("--primary-color", color);
    localStorage.setItem("applied-theme", color);
  }

  function initTheme() {
    const savedMode = localStorage.getItem("applied-mode") || getSystemMode();
    setMode(savedMode);

    const savedTheme = localStorage.getItem("applied-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }

  function initMenus() {
    const menuButtons = document.querySelectorAll(".brutal-icon-btn:has(menu)");

    menuButtons.forEach((button) => {
      const menu = button.querySelector("menu");
      if (menu) {
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleMenu(menu);
        });
      }
    });

    document.addEventListener("click", () => {
      closeAllMenus();
    });
  }

  function toggleMenu(menu) {
    const isActive = menu.classList.contains("active");

    closeAllMenus();

    if (!isActive) {
      menu.classList.add("active");
      menu.style.display = "block";
    }
  }

  function closeAllMenus() {
    const menus = document.querySelectorAll("menu.brutal-menu");
    menus.forEach((menu) => {
      menu.classList.remove("active");
      menu.style.display = "none";
    });
  }

  function initTocLinks() {
    const tocDialog = document.getElementById("dialog-toc");
    if (!tocDialog) return;

    tocDialog.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (link) {
        closeDialog(tocDialog);
      }
    });
  }

  window.mode = toggleMode;
  window.theme = setTheme;

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initDialogs();
    initMenus();
    initTocLinks();
  });
})();
