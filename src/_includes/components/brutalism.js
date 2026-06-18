(function () {
  "use strict";

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
    var currentMode = document.body.classList.contains("dark") ? "dark" : "light";
    var newMode = currentMode === "dark" ? "light" : "dark";
    setMode(newMode);
    return newMode;
  }

  function setTheme(color) {
    document.documentElement.style.setProperty("--primary-color", color);
    localStorage.setItem("applied-theme", color);
  }

  function initTheme() {
    var savedMode = localStorage.getItem("applied-mode") || getSystemMode();
    setMode(savedMode);

    var savedTheme = localStorage.getItem("applied-theme");
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }

  function getOverlay(dialog) {
    var sibling = dialog.previousElementSibling;
    if (sibling && sibling.classList.contains("overlay")) {
      return sibling;
    }
    return null;
  }

  function openDialog(dialog) {
    dialog.showModal();
    dialog.classList.add("active");

    var overlay = getOverlay(dialog);
    if (overlay) {
      overlay.classList.add("active");
    }

    document.body.style.overflow = "hidden";
  }

  function closeDialog(dialog) {
    dialog.close();
    dialog.classList.remove("active");

    var overlay = getOverlay(dialog);
    if (overlay) {
      overlay.classList.remove("active");
    }

    var openDialogs = document.querySelectorAll("dialog[open]");
    if (openDialogs.length === 0) {
      document.body.style.overflow = "";
    }
  }

  function closeAllDialogs() {
    var dialogs = document.querySelectorAll("dialog[open]");
    for (var i = 0; i < dialogs.length; i++) {
      closeDialog(dialogs[i]);
    }
  }

  function closeAllMenus() {
    var menus = document.querySelectorAll("menu.brutal-menu");
    for (var i = 0; i < menus.length; i++) {
      menus[i].classList.remove("active");
      menus[i].style.display = "none";
    }
  }

  function toggleMenu(menu) {
    var isActive = menu.classList.contains("active");
    closeAllMenus();
    if (!isActive) {
      menu.classList.add("active");
      menu.style.display = "block";
    }
  }

  // Unified event delegation handler
  document.addEventListener("click", function (e) {
    // Dialog triggers: [data-ui]
    var dialogTrigger = e.target.closest("[data-ui]");
    if (dialogTrigger) {
      e.preventDefault();
      e.stopPropagation();
      var targetSelector = dialogTrigger.getAttribute("data-ui");
      var targetDialog = document.querySelector(targetSelector);
      if (targetDialog) {
        if (targetDialog.open) {
          closeDialog(targetDialog);
        } else {
          openDialog(targetDialog);
        }
      }
      return;
    }

    // Menu buttons: .brutal-icon-btn containing <menu>
    var menuBtn = e.target.closest(".brutal-icon-btn");
    if (menuBtn) {
      var menu = menuBtn.querySelector("menu.brutal-menu");
      if (menu) {
        e.stopPropagation();
        toggleMenu(menu);
        return;
      }
    }

    // Theme mode toggle: [data-action="toggle-mode"]
    var modeBtn = e.target.closest('[data-action="toggle-mode"]');
    if (modeBtn) {
      e.preventDefault();
      toggleMode();
      return;
    }

    // Theme color set: [data-action="set-theme"]
    var themeBtn = e.target.closest('[data-action="set-theme"]');
    if (themeBtn) {
      var color = themeBtn.getAttribute("data-theme-value");
      if (color) {
        setTheme(color);
      }
      return;
    }

    // Search toggle: [data-action="toggle-search"]
    var searchBtn = e.target.closest('[data-action="toggle-search"]');
    if (searchBtn) {
      var pfWrapper = document.getElementById("pf--wrapper");
      if (pfWrapper) {
        pfWrapper.classList.toggle("active");
      }
      return;
    }

    // Close all menus when clicking elsewhere
    closeAllMenus();
  });

  // Overlay clicks close dialogs
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("overlay")) {
      var sibling = e.target.nextElementSibling;
      if (sibling && sibling.tagName === "DIALOG" && sibling.open) {
        closeDialog(sibling);
      } else {
        closeAllDialogs();
      }
    }
  });

  // Escape key closes dialogs and menus
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllDialogs();
      closeAllMenus();
    }
  });

  // TOC link clicks close the TOC dialog
  document.addEventListener("click", function (e) {
    var tocDialog = document.getElementById("dialog-toc");
    if (!tocDialog) return;
    var link = e.target.closest("a[href^='#']");
    if (link && tocDialog.contains(link)) {
      closeDialog(tocDialog);
    }
  });

  // Initialize theme and saved mode on load
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
  });
})();
