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
    var selectorPrefix = variables._target ?
      variables._target :
      '[autocomplete="' + input.id + '"]';
    var selector = selectorPrefix + ' ul.autocomplete li';
    var items = document.querySelectorAll(selector);
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('delta', i);
      items[i].onclick = function() {

        // Set the value on the hidden input.
        if (hiddenInput) {
          hiddenInput.setAttribute('value', this.getAttribute('value'));
        }

        // If the item has a label, place it into the text field input.
        var label = this.getAttribute('data-label');
        if (label) { input.value = label; }

        // Hide the items.
        dg.hide(dg.qs(selectorPrefix));

        // If they provided a click handler, use it.
        if (variables._clicker) {
          variables._clicker(hiddenInput, input, results, this);
        }
        else {

          // They didn't provide a click handler...

        }


      };
    }
  });
};

dg_autocomplete.run = function(variables, input) {

  // Grab the results placeholder.
  var target = !variables._target ? '[autocomplete="' + input.id + '"]' : variables._target;
  var placeholder = dg.qs(target);

  // Prep a done handler to inject the html and run post renders.
  var done = function(html) {
    placeholder.innerHTML = html;
    dg.runPostRenders();
    dg.show(placeholder);
  };

  // Handle an empty input (aka text cleared out).
  if (input.value == '') {
    done('');
    return;
  }

  // 1. Invoke the fetcher to go get the server data
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

  if (!variables._fetcher) {
    console.log('missing _fetcher for autocomplete: ' + id);
    return false;
  }

  if (!variables._handler) {
    console.log('missing _handler for autocomplete: ' + id);
    return false;
  }

  // We don't require a _clicker, since a _handler's rendering of an item can have its own click handling.

  return true;
};

dg_autocomplete.show = function(textInputId, hide) {
  var selector = 'div[autocomplete="' + textInputId  + '"]';
  var autocompleteDiv = dg.qs(selector);
  hide ? dg.hide(autocompleteDiv) : dg.show(autocompleteDiv);
};

dg_autocomplete.hide = function(textInputId) {
  dg_autocomplete.show(textInputId, true);
};
