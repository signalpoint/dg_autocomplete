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
  // Attach a post render to the item list that attaches click listeners to the items, if there is a handler.
  if (!itemList._postRender) { itemList._postRender = []; }
  itemList._postRender.push(function() {
    var hiddenInput = document.getElementById(variables._attributes.id);
    var selector = '[autocomplete="' + input.id + '"] ul.autocomplete li';
    var items = document.querySelectorAll(selector);
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('delta', i);
      if (variables._clicker) {
        items[i].onclick = function() {
          if (hiddenInput) {
            hiddenInput.setAttribute('value', this.getAttribute('value'));
          }
          variables._clicker(hiddenInput, input, results, this);
        };
      }
    }
  });
};

dg_autocomplete.run = function(variables, input) {
  // Grab the results placeholder.
  var placeholder = document.querySelectorAll('[autocomplete="' + input.id + '"]')[0];

  // Prep a done handler to inject the html and run post renders.
  var done = function(html) {
    placeholder.innerHTML = html;
    dg.runPostRenders();
  };

  // Handle an empty input (aka text cleared out).
  if (input.value == '') {
    done('');
    return;
  }

  // 1. Invoke the fetcher go get the server data
  // 2. Send the results to the handler
  // 3. Prep the post render
  // 4. Render the element from the handler
  // 5. Inject rendered results into placeholder and run post render
  variables._fetcher(input).then(function(results) {
    var element = variables._handler(input, results);
    if (element.results) {
      var itemList = element.results;
      dg.autocompleteAddClassToWidget(itemList, 'autocomplete');
      dg.autocompleteAttachPostRender(itemList, variables, input, results);
    }
    done(dg.render(element));
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

  // We don't require a _clicker, since a _handler's rendering of an item can have its own click handling.

  return true;
};

