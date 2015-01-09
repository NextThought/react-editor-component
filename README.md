#A Rich text editor ReactJS component
###### This component is _heavily_ inspired by: [frikille/react-rte][0] and https://speakerdeck.com/frikille/a-rich-text-editor-with-react


---
Progress:
- [x] Initial Editor (Starting from frikille/react-rte - javascript only parts)
- [ ] The interface will be: `<Editor value={...} onChange={}/>`
- [ ] There will be optional `render{Bottom|Top}Toolbar` callback props that will let the toolbars to be costomized. (added to, or substituted)
- [ ] Copy/Paste
- [ ] Undo/Redo


##### File naming conventions:
- Mixins and Partials: `lower-case-hyphenated.js` (in a sub-directory grouping realted ones together)
- Classes and Components: `PascalNameCase.js(x)`

### Development
This project uses ES6 JavaScript. ([WebPack][1] bundles and [6to5][2] transpiles)

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


   [0]: //github.com/frikille/react-rte
   [1]: //webpack.github.io
   [2]: //6to5.org
