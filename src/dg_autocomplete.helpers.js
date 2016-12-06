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

dg.autocompleteVerify = function(variables) {
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
