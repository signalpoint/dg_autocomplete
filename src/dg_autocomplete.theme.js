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
 *  _clicker - {Function}(input, results, item)
 *      param {Object} input - The autocomplete text field.
 *      param {Array} results - The result set from the _fetcher.
 *      param {Object} item - The list item that was clicked.
 *
 *  _text_input {Object} (Optional) Render element properties to be merged into the autocomplete text input.
 *
 */
dg.theme_autocomplete = function(variables) {

  // We turn an autocomplete into a hidden element to hold onto its value, and then add widgets next to it for the
  // actual text input and results placeholder.
  // @TODO utilize children render elements instead of flat markup if possible, better for form alterations.
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

    }]
  });
};
