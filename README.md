# hyper-x

> A lightweight front-end lib.

## Introduction

`hyper-x` is a lightweight front-end lib that helps you create reactive UIs easily.

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
    const title = new X.Value('Hello, world!');
    return X.createFragment([
        h('h1', null, title),
        h('input', { bind: title })
    ]);
}

document.body.appendChild(App());
```
