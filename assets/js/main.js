/* =========================================================
   红苹果短剧 · Landing page interactions
   Vanilla JS only. No build step required.
   ========================================================= */
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Current year ---------- */
  const year = doc.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header on scroll ---------- */
  const header = doc.getElementById("site-header");
  const backTop = doc.querySelector(".back-top");

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 18);
    if (backTop) backTop.classList.toggle("is-visible", y > 700);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile navigation ---------- */
  const menuToggle = doc.querySelector(".menu-toggle");
  const mobileNav = doc.getElementById("mobile-nav");
  const backgroundRegions = [
    doc.getElementById("main"),
    doc.querySelector(".site-footer"),
    doc.querySelector(".mobile-dock")
  ].filter(Boolean);
  let lastMenuTrigger = null;

  const setBackgroundInert = (inert) => {
    backgroundRegions.forEach((region) => {
      region.inert = inert;
    });
  };

  const openMenu = () => {
    if (!mobileNav || !menuToggle) return;
    lastMenuTrigger = doc.activeElement;
    mobileNav.classList.add("is-open");
    mobileNav.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "关闭菜单");
    doc.body.classList.add("nav-open");
    setBackgroundInert(true);
    const firstLink = mobileNav.querySelector("a");
    if (firstLink) window.setTimeout(() => firstLink.focus(), 60);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!mobileNav || !menuToggle) return;
    mobileNav.classList.remove("is-open");
    mobileNav.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "打开菜单");
    doc.body.classList.remove("nav-open");
    setBackgroundInert(false);
    if (restoreFocus && lastMenuTrigger && typeof lastMenuTrigger.focus === "function") {
      lastMenuTrigger.focus();
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });
  }

  if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });
  }

  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNav && mobileNav.classList.contains("is-open")) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024 && mobileNav && mobileNav.classList.contains("is-open")) {
      closeMenu({ restoreFocus: false });
    }
  });

  /* ---------- Search jump / focus ---------- */
  const searchInput = doc.getElementById("drama-query");
  const searchClear = doc.querySelector(".search-clear");
  const searchForm = doc.getElementById("drama-search");

  const jumpToSearch = () => {
    const picks = doc.getElementById("picks");
    if (!picks) return;
    picks.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    if (searchInput) {
      window.setTimeout(() => searchInput.focus({ preventScroll: true }), prefersReducedMotion ? 0 : 420);
    }
  };

  const searchJump = doc.querySelector(".search-jump");
  if (searchJump) searchJump.addEventListener("click", jumpToSearch);

  /* ---------- Drama filtering ---------- */
  const cards = Array.from(doc.querySelectorAll(".drama-card"));
  const filterChips = Array.from(doc.querySelectorAll(".filter-chip"));
  const filterButtons = Array.from(doc.querySelectorAll("[data-filter]"));
  const grid = doc.getElementById("drama-grid");
  const resultCount = doc.getElementById("result-count");
  const emptyState = doc.getElementById("empty-state");
  const resetFilters = doc.getElementById("reset-filters");

  let activeFilter = "全部";
  let query = "";

  const normalize = (value) => String(value || "").toLocaleLowerCase("zh-CN").trim();

  const getHaystack = (card) => {
    const title = card.dataset.title || "";
    const cat = card.dataset.cat || "";
    const tags = card.dataset.tags || "";
    const extra = card.dataset.search || "";
    return normalize(`${title} ${cat} ${tags} ${extra}`);
  };

  const syncChips = () => {
    filterChips.forEach((chip) => {
      const selected = chip.dataset.filter === activeFilter;
      chip.classList.toggle("is-active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });

    // On mobile the chips scroll horizontally; keep the active one in view
    // after a genre card or footer link applies a filter.
    const activeChip = filterChips.find((chip) => chip.dataset.filter === activeFilter);
    if (activeChip) {
      const row = activeChip.closest(".filter-row");
      if (row && row.scrollWidth > row.clientWidth + 1) {
        const rowRect = row.getBoundingClientRect();
        const chipRect = activeChip.getBoundingClientRect();
        const targetLeft =
          row.scrollLeft + chipRect.left - rowRect.left - (rowRect.width - chipRect.width) / 2;
        row.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: prefersReducedMotion ? "auto" : "smooth"
        });
      }
    }
  };

  const applyFilters = () => {
    const needle = normalize(query);
    let visible = 0;

    cards.forEach((card) => {
      const categoryMatch = activeFilter === "全部" || card.dataset.cat === activeFilter;
      const queryMatch = !needle || getHaystack(card).includes(needle);
      const show = categoryMatch && queryMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (resultCount) resultCount.textContent = String(visible);
    if (emptyState) emptyState.hidden = visible !== 0;
    if (grid) grid.hidden = visible === 0;
    if (searchClear) searchClear.hidden = !searchInput || searchInput.value.length === 0;
    syncChips();
  };

  const setFilter = (filter, { scroll = false } = {}) => {
    activeFilter = filter || "全部";
    applyFilters();
    if (scroll) {
      const picks = doc.getElementById("picks");
      if (picks) picks.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  };

  filterButtons.forEach((button) => {
    const filter = button.dataset.filter;
    if (!filter) return;
    button.addEventListener("click", () => {
      setFilter(filter, { scroll: button.classList.contains("genre-card") || Boolean(button.dataset.footerFilter) });
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      query = searchInput.value;
      applyFilters();
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && searchInput.value) {
        searchInput.value = "";
        query = "";
        applyFilters();
      }
    });
  }

  if (searchClear) {
    searchClear.addEventListener("click", () => {
      if (!searchInput) return;
      searchInput.value = "";
      query = "";
      applyFilters();
      searchInput.focus();
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilters();
    });
  }

  if (resetFilters) {
    resetFilters.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      query = "";
      setFilter("全部");
    });
  }

  // Footer type links double as quick filters.
  doc.querySelectorAll("[data-footer-filter]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setFilter(link.dataset.footerFilter, { scroll: true });
    });
  });

  applyFilters();

  /* ---------- Drama detail dialog ---------- */
  const dialog = doc.getElementById("drama-dialog");
  const dialogCover = doc.getElementById("dialog-cover");
  const dialogEpisodes = doc.getElementById("dialog-episodes");
  const dialogTitle = doc.getElementById("dialog-title");
  const dialogTags = doc.getElementById("dialog-tags");
  const dialogSummary = doc.getElementById("dialog-summary");
  const dialogWatch = doc.getElementById("dialog-watch");
  const dialogClose = doc.querySelector(".dialog-close");
  let dialogTrigger = null;

  const getCard = (id) => cards.find((card) => card.dataset.id === id);

  const populateDialog = (card) => {
    if (!dialog || !card) return;
    if (dialogCover) {
      dialogCover.src = card.dataset.cover || "";
      dialogCover.alt = `《${card.dataset.title || ""}》短剧封面`;
    }
    if (dialogEpisodes) dialogEpisodes.textContent = `全 ${card.dataset.episodes || "—"} 集`;
    if (dialogTitle) dialogTitle.textContent = card.dataset.title || "";
    if (dialogTags) dialogTags.textContent = card.dataset.tags || card.dataset.cat || "";
    if (dialogSummary) dialogSummary.textContent = card.dataset.summary || "";
    if (dialogWatch && card.dataset.href) dialogWatch.href = card.dataset.href;
  };

  const openDialog = (card, trigger) => {
    if (!dialog || !card) return;
    populateDialog(card);
    dialogTrigger = trigger || doc.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    doc.body.classList.add("dialog-open");
  };

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      doc.body.classList.remove("dialog-open");
    }
  };

  doc.querySelectorAll("[data-open-id]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!dialog || typeof dialog.showModal !== "function") return;
      const card = getCard(link.dataset.openId);
      if (!card) return;
      event.preventDefault();
      openDialog(card, link);
    });
  });

  if (dialogClose) dialogClose.addEventListener("click", closeDialog);

  if (dialog) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inDialog) closeDialog();
    });

    dialog.addEventListener("close", () => {
      doc.body.classList.remove("dialog-open");
      if (dialogTrigger && typeof dialogTrigger.focus === "function") {
        dialogTrigger.focus({ preventScroll: true });
      }
      dialogTrigger = null;
    });

    dialog.addEventListener("cancel", () => {
      doc.body.classList.remove("dialog-open");
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  const faqItems = Array.from(doc.querySelectorAll(".faq-item"));
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Scroll spy for desktop nav ---------- */
  const sectionIds = ["ranking", "genres", "picks", "faq"];
  const navLinks = Array.from(doc.querySelectorAll('.main-nav a[href^="#"]'));

  const spySections = sectionIds
    .map((id) => doc.getElementById(id))
    .filter(Boolean);

  if (navLinks.length && spySections.length) {
    const syncNav = () => {
      // Compare against a reading line at 40% of the viewport instead of
      // IntersectionObserver state, so fast jumps and returns to the top
      // always produce a correct highlight. The active item is the last
      // section whose top has passed the reading line.
      const line = window.innerHeight * 0.4;
      let currentId = null;

      spySections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) {
          currentId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const current = currentId !== null && link.getAttribute("href") === `#${currentId}`;
        link.classList.toggle("is-current", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    syncNav();
    window.addEventListener("scroll", syncNav, { passive: true });
    window.addEventListener("resize", syncNav);
  }

  /* ---------- Reveal on scroll ---------- */
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealGroups = [
      ".section-head",
      ".rank-lead",
      ".rank-list li",
      ".genre-card",
      ".drama-card",
      ".feature-visual",
      ".feature-copy",
      ".benefit-card",
      ".encyclopedia-copy",
      ".encyclopedia-visual",
      ".faq-intro",
      ".faq-item",
      ".final-cta-inner"
    ];

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    revealGroups.forEach((selector) => {
      doc.querySelectorAll(selector).forEach((element, index) => {
        if (element.closest(".hero")) return;
        element.classList.add("reveal");
        if (selector === ".genre-card" || selector === ".drama-card" || selector === ".benefit-card") {
          element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
        }
        revealObserver.observe(element);
      });
    });
  }

  /* ---------- Keep filtered cards accessible to reveal observer ---------- */
  // When a previously hidden card becomes visible, IntersectionObserver will
  // naturally pick it up. This fallback handles browsers that don't observe
  // elements that were hidden at registration time.
  const revealFallback = () => {
    if (prefersReducedMotion) return;
    doc.querySelectorAll(".drama-card:not([hidden])").forEach((card) => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        card.classList.add("is-visible");
      }
    });
  };

  if (searchInput) searchInput.addEventListener("input", revealFallback);
  if (searchForm) searchForm.addEventListener("submit", revealFallback);

  /* ---------- Small helper: active section CSS fallback ---------- */
  root.classList.add("is-ready");
})();
