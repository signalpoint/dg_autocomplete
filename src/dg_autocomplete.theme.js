/**
 * Themes an autocomplete widget.
 * @param variables
 *
 *  _fetcher - {Function}(input)
 *    param {Object} input - The autocomplete text field.
 *    returns {Promise} A Promise that fetches data from Drupal, builds the results into an array and resolves them.
 *
 *  _handler - {Function}(input, results)
 *      param {Object} input - The autocomplete text field.
 *      param {Array} results - The result set from the _fetcher.
 *      returns {Object} A DrupalGap Render Element with an `item_list` called `results` to be rendered into the
 *                       result container.
 *
 *  _clicker - {Function}(input, results, item) - optional
 *      param {Object} input - The autocomplete text field.
 *      param {Array} results - The result set from the _fetcher.
 *      param {Object} item - The list item that was clicked.
 *
 *  _text_input {Object} (Optional) Render element properties to be merged into the autocomplete text input.
 *
 *  _friends {Array} (Optional) An array of document.querySelector strings whose element's value changing should
 *      trigger the autocomplete to run again.
 *
 */
dg.theme_autocomplete = function(variables) {

  // We turn an autocomplete into a hidden element to hold onto its value, and then add widgets next to it for the
  // actual text input and results placeholder.
  variables._attributes.type = 'hidden';
  var textInput = dg.autocompletePrepTextInput(variables);
  if (!dg.autocompleteVerify(variables)) { return; }
  var id = textInput._attributes.id;

  return dg.render({
    _markup: '<div class="autocomplete-wrapper">' +
      '<input ' + dg.attributes(variables._attributes) + '/>' +
      '<input ' + dg.attributes(textInput._attributes) + '/>' +
      '<div autocomplete="' + id + '"></div>' +
    '</div>',
    _postRender: [function() {

      // When the user is done typing, run the autocomplete.
      document.getElementById(id).addEventListener("keyup", function() {
        clearTimeout(dg_autocomplete._typingTimer);
        var input = this;
        dg_autocomplete._typingTimer = setTimeout(function() {
          dg_autocomplete.run(variables, input);
        }, dg_autocomplete._doneTypingInterval);
      });

      // If there are any friend elements for this autocomplete, attach listeners to them so any changes on those
      // friend elements will also trigger the autocomplete.
      if (variables._friends) {
        var friends = variables._friends;
        for (var i = 0; i < friends.length; i++) {
          var friend = friends[i];
          var elements = document.querySelectorAll(friend);
          for (var j = 0; j < elements.length; j++) {
            elements[j].addEventListener('change', function() {
              dg_autocomplete.run(variables, document.getElementById(id));
            });
          }
        }
      }

    }]
  });
};
