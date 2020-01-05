# super-x

> A reactive UI lib.

## Introduction

`super-x` is a reactive UI lib which aims at being lightweight. To create interactive UIs, just declare them in a reactive way, and this lib will do the rest.

## Links

- [Documentation](https://github.com/huang2002/super-x/wiki)
- [Contributing Guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [License (MIT)](./LICENSE)

## Example

Here is an example of a todo app:

```js
const h = X.createElement;

const ListItem = ({ item, index, $list }) => h(
    'li',
    {
        style: {
            textDecoration: item.finished ? 'line-through' : 'none'
        },
        listeners: {
            click() {
                $list.replace(index, {
                    content: item.content,
                    finished: !item.finished
                });
            }
        }
    },
    item.content
);

function TodoApp() {
    // init the item list and the input element reference
    const $list = new X.ReactiveList(),
        $inputRef = new X.ReactiveValue();
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
            h('input', { type: 'submit', value: 'add' })
        ),
        $list.toElement('ul', (item, index) => ListItem({ item, index, $list }))
    ]);
}

// append the app instance to the body
document.body.appendChild(TodoApp());
```
