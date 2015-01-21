#A rich text editor component, for ReactJS

---
Progress:
- [x] Initial Editor
- [x] Get the editor's base functionality working in React 0.12.x
- [x] The interface is: `<Editor value={...} onChange={}/>`
- [x] Copy (it's built in 😉)
- [ ] Paste
- [ ] There will be optional `render{Bottom|Top}Toolbar` callback props that will let the toolbars to be costomized. (added to, or substituted)


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


   [1]: //webpack.github.io
   [2]: //6to5.org
