# hyper-x

> A lightweight front-end lib.

## Introduction

`hyper-x` is a front-end lib that helps you create reactive UIs easily by providing many helpers to deal with

- element manipulation
- custom attributes and directives
- view routing
- component styling
- ...

and is rather lightweight. (LESS than 10KB after minification WITHOUT zipping)

## Links

- [Documentation](https://github.com/huang2002/hyper-x/wiki)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [License (MIT)](./LICENSE)

## Example

Here is the example code which creates a heading and an input on the page where the content of the heading will be synchronized with the value of the input.

```js
const h = X.createElement;

function App() {
    const title = X.Value.of('Hello, world!');
    return X.createFragment([
        h('h1', null, title),
        h('input', { bind: title })
    ]);
}

document.body.appendChild(App());
```
