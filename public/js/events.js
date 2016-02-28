(function () {
  'use strict';

  var eventsModule = {
    toggleMenu: function () {
      $(this).toggleClass('topnav-toggle-open');
      $('#topnav_menu').slideToggle();
    },

    toggleSidebarItem: function () {
      $(this).find('.sidebar-toggle').toggleClass('sidebar-toggle-open');
      $(this).find('.sidebar-submenu').slideToggle();
    },

    toggleSidebarSubItem: function (e) {
      e.stopPropagation();
      $(this).find('.sidebar-section-toggle').toggleClass('sidebar-section-toggle-open');
      $(this).find('.sidebar-submenu-links').slideToggle();
    }
  };

  $('#topnav_toggle').on('click', eventsModule.toggleMenu);
  $('.sidebar-item').on('click', eventsModule.toggleSidebarItem);
  $('.sidebar-submenu-section').on('click', eventsModule.toggleSidebarSubItem);
})();
