# dg_autocomplete

The DrupalGap 8 Autocomplete module.

When used as a [Form Element](http://docs.drupalgap.org/8/Forms/Form_Elements), an Autocomplete input is very useful indeed.

```
form.title = {

  // Set up the form element basics.
  _type: 'autocomplete',
  _title: 'Search',
  _title_placeholder: true,
  
  // Query Drupal (or any API) for the external data...
  _fetcher: function(input) {
    return new Promise(function(ok, error) {
    
      // Get the data, then send it back.
      example.searchStuff(
        input.value
      ).then(ok);
    
    });
  },
  
  // Receive that external data back, and decide how it should be rendered...
  _handler: function(input, results) {
  
    // Make an items list of the results.
    var items = [];
    for (var i = 0; i < results.length; i++) {
      items.push(result[i]);
    }
  
    // Build and return a render element with a "results" item list widget.
    var element = {};
    if (items.length) {
      element.results = {
        _theme: 'item_list',
        _items: items
      };
    }
    else {
      element.empty = {
        _theme: 'message',
        _message: dg.t('No results found.'),
        _type: 'warning'
      };
    }
      
    return element;
    
  },
  
  // Decide what should be done when a user clicks on an autocomplete result...
  _clicker: function(hiddenInput, input, results, item) {
    cw_go.autocompleteClicker(input, 'group/' + hiddenInput.getAttribute('value'));
  }
  
};
```
