#A rich text editor component, for ReactJS [![Build Status](https://travis-ci.org/NextThought/react-editor-component.svg?branch=master)](https://travis-ci.org/NextThought/react-editor-component)

---
Progress:
- [x] Initial Editor
- [x] Get the editor's base functionality working in React 0.12.x
- [x] The interface is: `<Editor value={...} onChange={}/>`
- [x] Flexible Toolbars/Format-buttons
- [x] Copy (it's built in 😉)
- [ ] Paste


##### File naming conventions:
- Mixins and Partials: `lower-case-hyphenated.js` (in a sub-directory grouping realted ones together)
- Classes and Components: `PascalNameCase.js(x)`

### Development
This project uses ES6 JavaScript. ([WebPack][1] bundles and [babel][2] transpiles)

Please do not checkin dist bundles. This project is intended to be included into a larger project using a packager like [WebPack][1].


##### Setup:
```bash
$ npm install grunt-cli karma-cli --global
$ npm install
```

##### Testing:
```bash
$ grunt test
```

##### Running the test harness app:
```bash
$ grunt
```


   [1]: //webpack.github.io
   [2]: //babeljs.org


##### Toolbars

```scss
.editor {
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;

    -webkit-flex-flow: row wrap;
    flex-flow: row wrap;
}

.editor-pane {
    margin:0;
    padding:1em;
    border : 1px solid #ccc;

    &.north,
    &.south {
      flex: 1 100%;
    }

    &.east, &.west {
      flex: 0 0 3em;
    }

    &.north { order: 0; }
    &.south { order: 4; }
    &.east { order: 3; }
    &.west { order: 1; }

    &.center {
        flex: 1 1 auto;
        order: 2;
    }
}
```
