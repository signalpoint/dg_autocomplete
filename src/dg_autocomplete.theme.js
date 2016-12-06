/**
 * Themes an autocomplete widget.
 * @param variables
 *  _fetcher - {Function}(input)
 *    Returns
 *    param {Object} input - The autocomplete text field.
 *    returns {Promise} A Promise that fetches data from Drupal, builds the results into an array and resolves them.
 *  _handler - {Function}(input, results)
 *      param {Object} input - The autocomplete text field.
 *      param {Array} results - The result set from the _fetcher.
 *      returns {Object} A DrupalGap Render Element with an `item_list` called `results` to be rendered into the
 *                       result container.
 *  _clicker - {Function}(input, results, item)
 *      param {Object} input - The autocomplete text field.
 *      param {Array} results - The result set from the _fetcher.
 *      param {Object} item - The list item that was clicked.
 *  _text_input {Object} (Optional)
 */
dg.theme_autocomplete = function(variables) {

  // We turn an autocomplete into a hidden element to hold onto its value, and add widgets next to it for the
  // actual search autocomplete widget.
  variables._attributes.type = 'hidden';
  var textInput = dg.autocompletePrepTextInput(variables);
  //variables._text_input = textInput;

  var id = textInput._attributes.id;
  return dg.render({
    _markup: '<div class="autocomplete-wrapper">' +
    '<input ' + dg.attributes(variables._attributes) + '/>' +
    '<input ' + dg.attributes(textInput._attributes) + '/>' +
    '<div autocomplete="' + id + '"></div>' +
    '</div>',
    _postRender: [function() {

      // Listen for the keyup event...
      document.getElementById(id).addEventListener("keyup", function() {
        if (!dg.autocompleteVerify(variables)) { return; }

        // Grab the input and make sure it isn't empty.
        var input = this;
        if (input.val == '') { return; }

        // 1. Invoke the fetcher
        // 2. send the results to the handler
        // 3. render the element from the handler
        // 4. inject rendered results into placeholder
        variables._fetcher(input).then(function(results) {

          // Grab the element from the handler, then pull out the 'results' item list and set its widget's class.
          var element = variables._handler(input, results);
          if (!element.results) { return; }
          var itemList = element.results;
          dg.autocompleteAddClassToWidget(itemList, 'autocomplete');


          dg.autocompleteAttachPostRender(itemList, variables, input, results);

          // Overwrite the results with the new item list.
          //element.results = itemList;

          // Render the results, inject them into the placeholder and run our post render.
          document.querySelectorAll('[autocomplete="' + input.id + '"]')[0].innerHTML = dg.render(element);
          dg.runPostRenders();

        });

      });
    }]
  });
};
