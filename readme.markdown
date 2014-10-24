# Lars

A simple client-side view library written in CoffeeScript. Great for some quick prototyping or bigger projects.
Requires underscore and jQuery (for views) and provides an Object class with events and get/set, a View class with templating, outlets, actions, and several more specific view classes.

No docs for now, but some quick pointers:

- Templates must be in an element with a "templates" class and have a `data-template="[name]"` attribute.
- Views can be created programatically, or by adding a `data-view="[ViewClassName]:[name]:[optional:templateName]"` attribute (note: View is automatically after the ViewClassName). E.g. data-view="CompanyList:companies"
- Actions can be created by adding `data-action="[event]:[name]([PropertyOfView],["string"]);[...]"`. E.g. `data-action="click:select(object,'fromList');hover:showPopover(object)"` Actions will traverse through the tree of views until they are handled. An action handler method should be named as follows: `[name]Action` (e.g. MyView.showPopoverAction).
- Outlets can be created by adding `data-outlet="[name]"`. Calling `get([name])` or `set([name], [value])` on a view will retrieve or change the corresponding outlet. Outlets behave differently for images (setting src) and checkboxes. Additional behaviours for other element types can be added. And custom outlets (not DOM-element-bound) can be created for each view.

Enjoy.