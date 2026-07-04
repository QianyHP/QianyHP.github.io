(function () {
  const STORAGE_KEY = 'theme';
  const root = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const isDark = theme === 'dark';
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
  }

  function initThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') || 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    updateToggleButton(getPreferredTheme());
  }

  function markActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    var isHome = page === '' || page === 'index.html';

    if (isHome) {
      var homeLink = document.querySelector('.site-title a');
      if (homeLink) {
        homeLink.setAttribute('aria-current', 'page');
      }
    }

    document.querySelectorAll('.main-nav a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initSectionJumper() {
    var nav = document.querySelector('.section-jumper');
    if (!nav) return;

    var sections = Array.prototype.slice.call(
      document.querySelectorAll('.right-column .section-block[id]')
    );
    if (!sections.length) return;

    var prevBtn = nav.querySelector('[data-dir="prev"]');
    var nextBtn = nav.querySelector('[data-dir="next"]');
    var topBtn = nav.querySelector('[data-action="top"]');
    var bottomBtn = nav.querySelector('[data-action="bottom"]');
    var toggle = nav.querySelector('.section-jumper__toggle');
    var handle = nav.querySelector('.section-jumper__handle');
    var dropdown = nav.querySelector('.section-jumper__dropdown');
    var links = dropdown ? dropdown.querySelectorAll('a[href^="#"]') : [];
    var currentIndex = 0;
    var open = false;
    var dockExpanded = false;
    var mobileMq = window.matchMedia('(max-width: 768px)');

    function isMobileNav() {
      return mobileMq.matches;
    }

    function setDockExpanded(expanded) {
      if (!isMobileNav()) {
        nav.classList.remove('is-expanded');
        dockExpanded = false;
        if (handle) {
          handle.setAttribute('aria-expanded', 'false');
          handle.setAttribute('aria-label', 'Open page navigation');
        }
        return;
      }

      dockExpanded = expanded;
      nav.classList.toggle('is-expanded', expanded);
      if (handle) {
        handle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        handle.setAttribute('aria-label', expanded ? 'Close page navigation' : 'Open page navigation');
      }
      if (!expanded) closeDropdown();
    }

    function prefersReducedMotion() {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function closeDropdown() {
      if (!dropdown || !toggle) return;
      open = false;
      dropdown.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    }

    function openDropdown() {
      if (!dropdown || !toggle) return;
      open = true;
      dropdown.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('is-open');
    }

    function updateControls() {
      var doc = document.documentElement;
      var atTop = window.scrollY <= 120;
      var atBottom = window.scrollY + window.innerHeight >= doc.scrollHeight - 120;

      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= sections.length - 1;
      if (topBtn) topBtn.disabled = atTop;
      if (bottomBtn) bottomBtn.disabled = atBottom;

      links.forEach(function (link) {
        var id = link.getAttribute('href').slice(1);
        link.classList.toggle('is-active', sections[currentIndex] && sections[currentIndex].id === id);
      });
    }

    function scrollToIndex(index) {
      index = Math.max(0, Math.min(sections.length - 1, index));
      currentIndex = index;
      sections[index].scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
      updateControls();
      closeDropdown();
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
      closeDropdown();
    }

    function scrollToBottom() {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
      closeDropdown();
    }

    if (handle) {
      handle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!isMobileNav()) return;
        setDockExpanded(!dockExpanded);
      });
    }

    mobileMq.addEventListener('change', function () {
      if (!isMobileNav()) setDockExpanded(false);
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        scrollToIndex(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        scrollToIndex(currentIndex + 1);
      });
    }

    if (topBtn) {
      topBtn.addEventListener('click', scrollToTop);
    }

    if (bottomBtn) {
      bottomBtn.addEventListener('click', scrollToBottom);
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (open) closeDropdown();
        else openDropdown();
      });
    }

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var id = link.getAttribute('href').slice(1);
        var idx = sections.findIndex(function (section) { return section.id === id; });
        if (idx >= 0) scrollToIndex(idx);
      });
    });

    document.addEventListener('click', function (e) {
      if (!open || nav.contains(e.target)) return;
      closeDropdown();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDropdown();
    });

    window.addEventListener('scroll', function () {
      updateControls();
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        var visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (!visible.length) return;

        var idx = sections.indexOf(visible[0].target);
        if (idx >= 0) {
          currentIndex = idx;
          updateControls();
        }
      }, {
        root: null,
        rootMargin: '-80px 0px -52% 0px',
        threshold: [0, 0.15, 0.35, 0.55]
      });

      sections.forEach(function (section) { observer.observe(section); });
    }

    updateControls();
  }

  function initDragScroll() {
    document.querySelectorAll('.project-images-scroll-container').forEach(function (el) {
      var isDragging = false;
      var startX = 0;
      var startScroll = 0;
      var moved = false;

      el.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isDragging = true;
        moved = false;
        startX = e.pageX;
        startScroll = el.scrollLeft;
        el.classList.add('is-dragging');
      });

      el.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        var delta = e.pageX - startX;
        if (Math.abs(delta) > 3) moved = true;
        el.scrollLeft = startScroll - delta;
      });

      function stopDrag() {
        isDragging = false;
        el.classList.remove('is-dragging');
      }

      el.addEventListener('mouseup', stopDrag);
      el.addEventListener('mouseleave', stopDrag);

      el.addEventListener('click', function (e) {
        if (moved) e.preventDefault();
      }, true);
    });
  }

  function isMobileLayout() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function pdfViewerUrl(pdfPath) {
    var absolute = new URL(pdfPath, window.location.href).href;
    if (isMobileLayout()) {
      var viewer = new URL('assets/pdfjs/web/viewer.html', window.location.href).href;
      return viewer + '?file=' + encodeURIComponent(absolute);
    }
    return pdfPath;
  }

  function loadPdfIframe(iframe) {
    if (!iframe || iframe.dataset.loaded === 'true') return;
    var src = iframe.getAttribute('data-src');
    if (!src) return;
    iframe.src = pdfViewerUrl(src);
    iframe.dataset.loaded = 'true';
  }

  function initPdfViewers() {
    var readers = document.querySelectorAll('.cv-reader');
    if (!readers.length) return;

    var tabs = document.querySelectorAll('.cv-tab');
    var mobile = isMobileLayout();

    function activatePanel(panelId) {
      readers.forEach(function (reader) {
        var active = reader.id === panelId;
        reader.classList.toggle('is-active', active);
        reader.hidden = mobile && !active;
        if (active) {
          loadPdfIframe(reader.querySelector('iframe[data-src]'));
        }
      });

      tabs.forEach(function (tab) {
        var selected = tab.dataset.panel === panelId;
        tab.classList.toggle('is-active', selected);
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      });
    }

    if (mobile) {
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          activatePanel(tab.dataset.panel);
        });
      });
      activatePanel('cv-panel');
      return;
    }

    readers.forEach(function (reader) {
      reader.hidden = false;
      loadPdfIframe(reader.querySelector('iframe[data-src]'));
    });
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    initThemeToggle();
    markActiveNav();
    initDragScroll();
    initPdfViewers();
    initSectionJumper();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (localStorage.getItem(STORAGE_KEY)) return;
    applyTheme(e.matches ? 'dark' : 'light');
  });
})();
