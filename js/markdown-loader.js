(function () {
  var markdownPath = "./AI-Design-Jam-2026-brief.md";
  var mount = document.getElementById("markdown-content");

  if (!mount) {
    return;
  }

  function showError(message) {
    mount.innerHTML = "";

    var errorNode = document.createElement("p");
    errorNode.className = "markdown-error";
    errorNode.textContent = message;
    mount.appendChild(errorNode);
  }

  function removeFirstLevelOneHeading(tokens) {
    var index = tokens.findIndex(function (token) {
      return token.type === "heading" && token.depth === 1;
    });

    if (index === -1) {
      return tokens;
    }

    tokens.splice(index, 1);

    if (tokens[index] && tokens[index].type === "space") {
      tokens.splice(index, 1);
    }

    return tokens;
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function buildSectionModel(markdownText) {
    var sourceTokens = window.marked.lexer(markdownText, { gfm: true });
    var tokens = sourceTokens.slice();
    tokens.links = sourceTokens.links || Object.create(null);
    tokens = removeFirstLevelOneHeading(tokens);
    var sections = [];
    var currentSection = null;
    var usedIds = Object.create(null);

    tokens.forEach(function (token) {
      if (token.type === "heading" && token.depth === 2) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: token.text.trim(),
          tokens: [],
        };
        return;
      }

      if (!currentSection) {
        if (token.type === "space") {
          return;
        }

        currentSection = {
          title: "Overview",
          tokens: [],
        };
      }

      currentSection.tokens.push(token);
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections.map(function (section, index) {
      var baseId = slugify(section.title) || "section-" + (index + 1);
      var uniqueId = baseId;
      var suffix = 2;

      while (usedIds[uniqueId]) {
        uniqueId = baseId + "-" + suffix;
        suffix += 1;
      }

      usedIds[uniqueId] = true;

      var sectionTokens = section.tokens.length
        ? section.tokens.slice()
        : [{ type: "paragraph", text: "No content provided." }];
      sectionTokens.links = sourceTokens.links || Object.create(null);

      var html = window.marked.parser(sectionTokens, { gfm: true });

      return {
        id: uniqueId,
        title: section.title,
        html: html,
      };
    });
  }

  function wrapTables(root) {
    var tables = root.querySelectorAll("table");

    tables.forEach(function (table) {
      if (table.parentNode.classList.contains("markdown-table-wrap")) {
        return;
      }

      var wrapper = document.createElement("div");
      wrapper.className = "markdown-table-wrap";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function getRegistrationSectionFromHtml() {
    var source = document.getElementById("registration-content-template");
    var title = "Registration";
    var html = "";

    if (source) {
      var dataTitle = source.getAttribute("data-title");
      if (dataTitle && dataTitle.trim()) {
        title = dataTitle.trim();
      }

      html = source.innerHTML.trim();
    }

    if (!html) {
      html = "<p>Registration details will be announced here.</p>";
    }

    return {
      id: "registration-fixed",
      title: title,
      html: html,
      isRegistration: true,
    };
  }

  function setupRegistrationConsent(layoutNode) {
    var registrationPanel = layoutNode.querySelector("#registration-fixed");

    if (!registrationPanel) {
      return;
    }

    var consentCheckbox = registrationPanel.querySelector(
      "[data-registration-consent]"
    );
    var registrationButton = registrationPanel.querySelector(
      "[data-registration-button]"
    );

    if (!consentCheckbox || !registrationButton) {
      return;
    }

    var registrationUrl =
      (registrationButton.getAttribute("data-registration-url") || "").trim();
    var hasValidRegistrationUrl =
      registrationUrl !== "" && registrationUrl !== "#";

    function updateButtonState() {
      registrationButton.disabled =
        !consentCheckbox.checked || !hasValidRegistrationUrl;
      registrationButton.setAttribute(
        "aria-disabled",
        registrationButton.disabled ? "true" : "false"
      );
    }

    if (!hasValidRegistrationUrl) {
      registrationButton.title =
        "Set data-registration-url in index.html to enable this button.";
    }

    consentCheckbox.addEventListener("change", updateButtonState);

    registrationButton.addEventListener("click", function () {
      if (registrationButton.disabled) {
        return;
      }

      var newWindow = window.open(registrationUrl, "_blank", "noopener,noreferrer");

      if (newWindow) {
        newWindow.opener = null;
      }
    });

    updateButtonState();
  }

  function activateSection(layoutNode, sectionId) {
    layoutNode
      .querySelectorAll(".markdown-menu-item")
      .forEach(function (button) {
        var isActive = button.getAttribute("data-target") === sectionId;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        button.setAttribute("tabindex", isActive ? "0" : "-1");
      });

    layoutNode
      .querySelectorAll(".markdown-view-panel")
      .forEach(function (panel) {
        var isActive = panel.id === sectionId;
        panel.classList.toggle("is-active", isActive);
        panel.setAttribute("aria-hidden", isActive ? "false" : "true");
      });
  }

  function setupMenuScrollHint(menu, menuScroll, menuList) {
    function updateHintState() {
      var canScroll = menuList.scrollWidth - menuList.clientWidth > 4;
      var atStart = menuList.scrollLeft <= 2;
      var atEnd = menuList.scrollLeft + menuList.clientWidth >= menuList.scrollWidth - 2;

      menu.classList.toggle("menu-scrollable", canScroll);
      menu.classList.toggle("menu-at-start", !canScroll || atStart);
      menu.classList.toggle("menu-at-end", !canScroll || atEnd);

      menuScroll.classList.toggle("menu-scrollable", canScroll);
      menuScroll.classList.toggle("menu-at-start", !canScroll || atStart);
      menuScroll.classList.toggle("menu-at-end", !canScroll || atEnd);
    }

    menuList.addEventListener("scroll", updateHintState, { passive: true });
    window.addEventListener("resize", updateHintState);

    requestAnimationFrame(updateHintState);
    setTimeout(updateHintState, 250);
  }

  function renderSplitLayout(sections) {
    mount.innerHTML = "";

    var sectionsWithRegistration = sections
      .filter(function (section) {
        return section.title.trim().toLowerCase() !== "registration";
      })
      .map(function (section) {
        return {
          id: section.id,
          title: section.title,
          html: section.html,
          isRegistration: false,
        };
      });

    sectionsWithRegistration.push(getRegistrationSectionFromHtml());

    var layout = document.createElement("div");
    layout.className = "markdown-split";

    var menu = document.createElement("nav");
    menu.className = "markdown-menu";
    menu.setAttribute("aria-label", "Content sections");
    menu.setAttribute("role", "tablist");

    var menuHint = document.createElement("p");
    menuHint.className = "markdown-menu-hint";
    menuHint.textContent = "Swipe for more >";

    var menuScroll = document.createElement("div");
    menuScroll.className = "markdown-menu-scroll";

    var menuList = document.createElement("div");
    menuList.className = "markdown-menu-list";

    var viewer = document.createElement("div");
    viewer.className = "markdown-viewer";

    sectionsWithRegistration.forEach(function (section, index) {
      var buttonId = "menu-" + section.id;

      var button = document.createElement("button");
      button.type = "button";
      button.id = buttonId;
      button.className = "markdown-menu-item";
      if (section.isRegistration) {
        button.classList.add("is-registration");
      }
      button.textContent = section.title;
      button.setAttribute("data-target", section.id);
      button.setAttribute("role", "tab");
      button.setAttribute("aria-controls", section.id);
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");
      button.setAttribute("tabindex", index === 0 ? "0" : "-1");

      button.addEventListener("click", function () {
        activateSection(layout, section.id);

        if (menu.classList.contains("menu-scrollable")) {
          button.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      });

      menuList.appendChild(button);

      var panel = document.createElement("article");
      panel.id = section.id;
      panel.className = "markdown-view-panel";
      panel.innerHTML = section.html;
      panel.classList.toggle("is-active", index === 0);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", buttonId);
      panel.setAttribute("aria-hidden", index === 0 ? "false" : "true");

      wrapTables(panel);
      viewer.appendChild(panel);
    });

    menuScroll.appendChild(menuList);
    menu.appendChild(menuScroll);
    menu.appendChild(menuHint);
    layout.appendChild(menu);
    layout.appendChild(viewer);
    mount.appendChild(layout);

    setupRegistrationConsent(layout);

    setupMenuScrollHint(menu, menuScroll, menuList);

    if (sectionsWithRegistration.length) {
      activateSection(layout, sectionsWithRegistration[0].id);
    }
  }

  function renderMarkdown(markdownText) {
    if (!window.marked) {
      showError("Unable to load markdown parser.");
      return;
    }

    var sections = buildSectionModel(markdownText);

    if (!sections.length) {
      showError("No section headings found in markdown.");
      return;
    }

    renderSplitLayout(sections);
  }

  fetch(markdownPath, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Unable to load markdown file.");
      }
      return response.text();
    })
    .then(function (markdownText) {
      renderMarkdown(markdownText);
    })
    .catch(function () {
      showError(
        "Unable to load brief content. Please run the page from a local server and check the markdown file path."
      );
    });
})();
