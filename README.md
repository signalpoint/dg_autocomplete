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

      // Get the data, then send it to the handler..
      example.searchStuff(
        input.value
      ).then(ok);

    });
  },

  // Receive the data from the fetcher, then decide how it should be rendered...
  _handler: function(input, data) {

    var element = {};

    if (!data.length) {

      element.empty = {
        _theme: 'message',
        _message: dg.t('No results found.'),
        _type: 'warning'
      };

    }
    else {

      var items = [];
      for (var i = 0; i < data.length; i++) {
        items.push(data[i]);
      }
      element.results = {
        _theme: 'item_list',
        _items: items
      };

    }

    return element;

  },
  
  // Optional, decide what should be done when a user clicks on an autocomplete result...
  _clicker: function(hiddenInput, input, data, item) {

    // Grab the delta value for the clicked row, and then get the result data for the row.
    var delta = item.getAttribute('delta');
    var row = data[delta];
    console.log('Clicked on', row);

    // Grab the value that was set on the hidden input.
    var myGroupId = hiddenInput.getAttribute('value');
    
    // Go to a page.
    dg.goto('group/' + myGroupId);
  }
  
};
```

## "Friend" elements

It's possible to have other form elements trigger an autocomplete to run again when their value changes. A simple example is two radio buttons next to an autocomplete that let's the user toggle between to search buckets:

```
form.which = {
  _title: dg.t('Search by'),
  _type: 'radios',
  _options: {
    relevance: dg.t('Relevance'),
    date: dg.t('Date')
  },
  _default_value: 'relevance'
};
```

Just attach the `_friends` property to the autocomplete element, then any changes to the radios will trigger the autocomplete to run again:

```
_friends: ['input[name=which]']
```

The `_friends` property utilizes [`document.querySelectorAll()`](https://www.w3schools.com/jsref/met_document_queryselectorall.asp), so it is easy to choose your friends, ha.

You can select one more more friends to trigger the autocomplete to run again:

```
_friends: [
  'input[name=which]',
  'input[id=foo]'
]
```
