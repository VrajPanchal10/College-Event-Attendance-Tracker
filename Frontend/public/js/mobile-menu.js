/**
 * mobile-menu.js
 * Hamburger menu toggle for all topbars
 * Works on: student-dashboard, faculty-dashboard,
 *           attendance, analytics, profile, event-details, calendar
 *
 * Requires: .hamburger button + .mobile-nav div inside .topbar
 */

(function () {
  'use strict';

  /**
   * Initialize hamburger menu for a given topbar
   * @param {HTMLElement} topbar
   */
  function initHamburger(topbar) {
    const hamburger = topbar.querySelector('.hamburger');
    const mobileNav = topbar.querySelector('.mobile-nav');

    if (!hamburger || !mobileNav) return;

    // Toggle menu open/close
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = topbar.classList.toggle('mobile-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on overlay click (anywhere outside topbar)
    document.addEventListener('click', function (e) {
      if (!topbar.contains(e.target)) {
        closeMenu(topbar, hamburger);
      }
    });

    // Close when any nav link inside mobile-nav is clicked
    mobileNav.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('click', function () {
        closeMenu(topbar, hamburger);
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeMenu(topbar, hamburger);
      }
    });

    // Close on window resize to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeMenu(topbar, hamburger);
      }
    });
  }

  /**
   * Close the mobile menu
   * @param {HTMLElement} topbar
   * @param {HTMLElement} hamburger
   */
  function closeMenu(topbar, hamburger) {
    topbar.classList.remove('mobile-open');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Initialize all topbars on the page
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.topbar').forEach(initHamburger);
  });

  // Fallback if DOM already loaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    document.querySelectorAll('.topbar').forEach(initHamburger);
  }

  // ── Fix #18: Active nav link highlighting ──────────────
  // Detects current page and marks matching nav links as active
  function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.mobile-nav a.nav-link, .top-actions a.nav-link').forEach(function (link) {
      const href = (link.getAttribute('href') || '').split('/').pop();
      if (href === currentPage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', highlightActiveNav);
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    highlightActiveNav();
  }

})();
