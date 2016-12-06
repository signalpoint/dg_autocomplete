var dg_autocomplete = new dg.Module(); // Create the module.
dg.modules.dg_autocomplete = dg_autocomplete; // Attach it to DrupalGap.

// GLOBALS

// Done typing timer identifier.
dg_autocomplete._typingTimer = null;

// Time in milliseconds to wait after the user is done typing.
// @TODO make this configurable.
dg_autocomplete._doneTypingInterval = 175;
