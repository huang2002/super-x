# super-x

> A reactive UI lib.

## Introduction

`super-x` is a reactive UI lib which aims at being lightweight. To create interactive UIs, just declare them in a reactive way, and this lib will do the rest. More specifically, instead of using diff algorithm to find out what needs to be updated, `super-x` employs reactive declaration to directly declare reactive data in views.

## Links

- [Documentation](https://github.com/huang2002/super-x/wiki)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [License (MIT)](./LICENSE)

## Example

Here is an example of a todo app:

```js
const h = X.createElement;

// the item list
const $list = X.toReactive([]);

const ListItem = X.createComponent(($item, $index) => (
    h('li', {
        style: {
            textDecoration: $item.finished.map(
               finished => finished ? 'line-through' : 'none'
            ),
        },
        listeners: {
            click() {
                $list.replace($index, {
                    content: $item.content.current,
                    finished: !$item.finished.current,
                });
            },
        },
    },
        $item.content,
    )
));

function TodoApp() {
    // the reference of the input element
    const $inputRef = new X.ReactiveValue(null);
    // submission handler
    function submit() {
        const input = $inputRef.current,
            content = input.value;
        if (content) {
            $list.push({ content, finished: false });
            input.value = '';
        } else {
            input.focus();
        }
    }
    // create DOM structure
    return X.Utils.createFragment([
        h('h1', null, 'TODO LIST'),
        h('form', { action: 'javascript:;', listeners: { submit } },
            h('input', { ref: $inputRef, placeholder: 'content' }),
            h('input', { type: 'submit', value: 'add' }),
        ),
        $list.toElement('ul', null, ListItem),
    ]);
}
```
