dg.autocompletePrepTextInput = function(variables) {
  // Extract and set defaults for text input. Migrate placeholder to text input if necessary.
  var textInput = variables._text_input ?  variables._text_input : {};
  dg.setRenderElementDefaults(textInput);
  textInput._attributes.type = 'text';
  if (!textInput._attributes.id) { textInput._attributes.id = 'autocomplete-' + jDrupal.userPassword(); }
  if (!textInput._title && variables._title && variables._title_placeholder) {
    textInput._attributes.placeholder = '' + variables._title;
  }
  return textInput;
};

dg.autocompletePrepListItem = function(results, i, value, text) {
  return {
    _theme: 'list_item',
    _i: i,
    _total: results.length,
    _text: text,
    _attributes: {
      value: value
    }
  };
};

dg.autocompleteAddClassToWidget = function(itemList, className) {
  if (!itemList._attributes) { itemList._attributes = {}; }
  if (!itemList._attributes.class) { itemList._attributes.class = []; }
  if (typeof itemList._attributes.class === 'string') { itemList._attributes.class = [itemList._attributes.class]; }
  if (jDrupal.isArray(itemList._attributes.class) && !jDrupal.inArray(className, itemList._attributes.class)) {
    itemList._attributes.class.push(className);
  }
};

dg.autocompleteAttachPostRender = function(itemList, variables, input, results) {
  // Attach a post render to the item list that attaches click listeners to the items.
  if (!itemList._postRender) { itemList._postRender = []; }
  itemList._postRender.push(function() {
    var hiddenInput = document.getElementById(variables._attributes.id);
    var selector = '[autocomplete="' + input.id + '"] ul.autocomplete li';
    var items = document.querySelectorAll(selector);
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('delta', i);
      items[i].onclick = function() {
        hiddenInput.setAttribute('value', this.getAttribute('value'));
        variables._clicker(hiddenInput, input, results, this);
      };
    }
  });
};

dg_autocomplete.run = function(variables, input) {
  if (input.val == '') { return; } // @TODO add a way for devs to react to empty
  // 1. Invoke the fetcher go get the server data
  // 2. Send the results to the handler
  // 3. Prep the post render
  // 4. Render the element from the handler
  // 5. Inject rendered results into placeholder and run post render
  variables._fetcher(input).then(function(results) {
    var element = variables._handler(input, results);
    if (!element.results) { return; }
    var itemList = element.results;
    dg.autocompleteAddClassToWidget(itemList, 'autocomplete');
    dg.autocompleteAttachPostRender(itemList, variables, input, results);
    document.querySelectorAll('[autocomplete="' + input.id + '"]')[0].innerHTML = dg.render(element);
    dg.runPostRenders();
  });
};

dg.autocompleteVerify = function(variables) {
  var id = variables._attributes.id;
  // Set up a default fetcher if one wasn't provided.
  if (!variables._fetcher) {
    console.log('dg.theme_autocomplete - no _fetcher provided for element: ' + id);
    // @TODO add default Views JSON based handler.
    //variables._fetcher = function(input) { };
    return false;
  }

  // Set up a default handler if one wasn't provided.
  if (!variables._handler) {
    console.log('dg.theme_autocomplete - no _handler provided for element: ' + id);
    // @TODO add default Views JSON based handler.
    //variables._handler = function(input) { };
    return false;
  }

  // Set up a default clicker if one wasn't provided.
  if (!variables._clicker) {
    console.log('dg.theme_autocomplete - no _clicker provided for element: ' + id);
    // @TODO add default Views JSON based handler.
    //variables._clicker = function(input) { };
    return false;
  }

  return true;
};

