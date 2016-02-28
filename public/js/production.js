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

(function () {
  'use strict';

  var formModule = (function () {
    var errMsg = function (msg) {
      var errMsgBox = $('#error_msg');

      if (Array.isArray(msg)) {
        errMsgBox.find('span').html('<ul class="errors-list">' + msg.join('') + '</ul>');
      } else {
        errMsgBox.find('span').text(msg);
      }

      errMsgBox.slideDown();
    };

    var bookHtml = function (book) {
      var html = '';

      html += '<strong>Product ID:</strong> ' + book.product_id + '</strong><br>';
      html += '<strong>Title:</strong> ' + book.title + '</strong><br>';
      html += '<strong>First Name:</strong> ' + book.author.first_name + '</strong><br>';
      html += '<strong>Last Name:</strong> ' + book.author.last_name + '</strong><br>';
      html += '<strong>MSRP:</strong> ' + book.msrp + '</strong><br>';
      html += '<strong>Our Price:</strong> ' + book.ourprice + '</strong><br>';
      html += '<strong>Tags:</strong> ' + book.tags.join(', ') + '</strong><br>';
      html += '<strong>Pages:</strong> ' + book.pages + '</strong><br>';
      html += '<strong>Year Published:</strong> ' + book.publication.year + '</strong><br>';
      html += '<strong>Publisher:</strong> ' + book.publication.publisher + '</strong><br>';
      html += '<strong>Type:</strong> ' + book.publication.type + '</strong><br>';
      html += '<strong>Qty Stock:</strong> ' + book.qty_stock + '</strong><br>';

      return html;
    };

    var validateForm = function (form) {
      var errors = [];

      form.find(':input').each(function (index, input) {
        if (!$(input).val() && $(input).data('name')) {
          errors.push('<li><strong>' + $(input).data('name') + '</strong> is a required field</li>');
        }
      });

      return errors;
    };

    var msgClose = function (e) {
      e.preventDefault();
      $(this).parent().fadeOut();
    };

    var scrollToMsg = function (div) {
      $('html, body').animate({
        scrollTop: div.offset().top
      });
    };

    var displayResults = function (results, div, form) {
      div.find('.results').html(results);
      form.trigger('reset');
      div.slideDown();
      scrollToMsg(div);
    };

    var resultsClose = function (e) {
      e.preventDefault();
      $('#search_results').slideUp();
      scrollToMsg($('#search_title'));
    };

    var searchBooksById = function (e) {
      e.preventDefault();

      var self = $(this),
          resultsBox = $('#search_results'),
          bookId = self.find('#book_id').val();

      resultsBox.slideUp();

      $.get('/api/books/' + bookId)
        .done(function (data) {
          displayResults(bookHtml(data), resultsBox, self);
        }).fail(function () {
          errMsg('The requested book could not be found');
        });
    };

    var searchBooksByPublisher = function (e) {
      e.preventDefault();

      var self = $(this),
          resultsBox = $('#search_results'),
          pubName = self.find('#publisher').val();

      resultsBox.slideUp();

      $.get('/api/publishers/' + pubName)
        .done(function (data) {
          var html = '';

          data.forEach(function (book) {
            html += '<div class="results-book">' + bookHtml(book) + '</div>';
          });

          displayResults(html, resultsBox, self);
        })
        .fail(function () {
          errMsg('No results found for this publisher');
        });
    };

    var addBook = function (e) {
      e.preventDefault();

      var self = $(this),
          book = {},
          errors = validateForm(self);

      if (errors.length) {
        errMsg(errors);
      } else {
        $.each(self.serializeArray(), function (i, field) {
          book[field.name] = field.value;
        });

        $.post('/api/books', book)
          .done(function (data) {
            self.trigger('reset');
            $('#success_text').html('<strong>' + data.title + '</strong> was successfully added!');
            $('#success_msg').slideDown();
            scrollToMsg($('#success_msg'));
          })
          .fail(function () {
            errMsg('There was an error submitting the book');
          });
      }
    };

    return {
      addBook: addBook,
      msgClose: msgClose,
      resultsClose: resultsClose,
      searchBooksById: searchBooksById,
      searchBooksByPublisher: searchBooksByPublisher
    };
  })();

  // Error and success messages
  $('.msg-close').on('click', formModule.msgClose);
  $('#results_close').on('click', formModule.resultsClose);

  // Handle forms
  $('#search_id').on('submit', formModule.searchBooksById);
  $('#search_publisher').on('submit', formModule.searchBooksByPublisher);
  $('#add_book').on('submit', formModule.addBook);
})();
