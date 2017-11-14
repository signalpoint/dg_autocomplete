# dg_autocomplete

The DrupalGap 8 Autocomplete module.

When used as a [Form Element](http://docs.drupalgap.org/8/Forms/Form_Elements), an Autocomplete input is very useful indeed.

The three main properties of an autocomplete are its `_fetcher`, `_handler` and an optional `_clicker`.

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
    console.log('Clicked on', delta, row);

    // Grab the value that was set on the hidden input.
    var myGroupId = hiddenInput.getAttribute('value');
    
    // Go to a page.
    dg.goto('group/' + myGroupId);
  }
  
};
```

The `_clicker` property is provided for convenience, and is optional. Alternatively, you can design your result items in the `_handler` in such a way that they themselves can be clicked, e.g. maybe a link on some text of image, etc, enjoy the flexibility here and be creative with the display of your results.

## "Friend" elements

It's possible to have other form elements trigger an autocomplete to run again when their value changes.

A simple example would be two radio buttons next to an autocomplete input, which let's the user toggle between two different search routines:

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

When the autocomplete runs again, your `_fetcher`, `_handler`, and optional `_clicker` all have access to the value of the radios, so you can make dynamic decisions about what to do. To get the value of the radio, you can use a `document.querySelector()`:

```
var which = document.querySelector('input[name=which]:checked').value;
```

Using radio buttons is only an example, you can use any inputs you like, and adjust the query selector accordingly.

### Multiple friends

The `_friends` property utilizes [`document.querySelectorAll()`](https://www.w3schools.com/jsref/met_document_queryselectorall.asp), so it is easy to choose your friends, ha.

You can select one more more friends to trigger the autocomplete to run again:

```
_friends: [
  'input[name=which]',
  'input[id=foo]'
]
```
