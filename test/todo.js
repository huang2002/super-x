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
                $list.replace($index.current, {
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

// append the app instance to the body
document.body.appendChild(TodoApp());
