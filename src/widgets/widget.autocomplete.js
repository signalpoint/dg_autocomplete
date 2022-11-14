/**
 * Themes an autocomplete widget.
 * @param variables
 *
 *  _wrapper - {Object}
 *    _attributes - {Object} Any attributes to place on the wrapper.
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
 *  _target - {String} Optional, a documentQuerySelector string identifying the target element to place the rendered
 *                     results from the "_handler". If a value is not provided, a target div is automatically created
 *                     for you directly below the text input field.
 *
 *  _clicker - {Function}(hiddenInput, input, results, item) - optional
 *      param {Object} hiddenInput - The hidden input for form state values assembly, validation and submission.
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

  var wrapper = variables._wrapper ? variables._wrapper : {};
  dg.attributesInit(wrapper);
  wrapper._attributes.class.push('autocomplete-wrapper');

  // Let's build the markup now...

  // Open the container.
  var markup = '<div ' + dg.attributes(wrapper._attributes) + '>';

  // Add the hidden input.
  markup += '<input ' + dg.attributes(variables._attributes) + '/>';

  // Add the text input.
  markup += '<input ' + dg.attributes(textInput._attributes) + '/>';

  // If no target is specified, add a div input.
  if (!variables._target) { markup += '<div autocomplete="' + id + '"></div>'; }

  // Close the container.
  markup += '</div>';

  return dg.render({
    _markup: markup,
    _postRender: [function() {

      // When the user is done typing, run the autocomplete.
      document.getElementById(id).addEventListener('keyup', function() {
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
