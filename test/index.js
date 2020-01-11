// @ts-check
/// <reference types="../index" />
// @ts-ignore
const { createElement: h } = X;

const $title = X.toReactive({
    content: 'hello, world',
    color: '#00F'
});
const $count = X.toReactive(0);
/** @type {X.ReactiveList<string>} */
const $list = X.toReactive([]);

document.body.style.padding = '.5em 1em';

const ADD_ITEM_ONCE_CLASS = X.createClass({
    marginTop: '1em',
    marginRight: '.5em',
    padding: '.3em .6em'
});

/**
 * @param {number} id
 */
const AddItemOnce = id => h(
    'button',
    {
        class: ADD_ITEM_ONCE_CLASS,
        listeners: {
            click: {
                listener(event) {
                    $list.push('item-' + id);
                    event.target.style.color = '#666';
                },
                options: {
                    once: true
                }
            }
        }
    },
    'add item ' + id
);

const LINE_THROUGH_CLASS = X.createClass({
    textDecoration: 'line-through'
});

const Item = X.createComponent(
    /**
     * @param {X.ReactiveValue<string>} $content
     * @param {X.ReactiveValue<number>} $index
     */
    ($content, $index) => {
        const $finished = new X.ReactiveValue(false);
        return h('li', null,
            $index.toText(index => `#${index} `),
            h('span', {
                class: $finished.map(finished => ({
                    [LINE_THROUGH_CLASS]: finished
                }))
            },
                $content.toText()
            ),
            ' ',
            h('a', {
                href: 'javascript:;',
                listeners: {
                    click() {
                        $finished.set(finished => !finished);
                    }
                }
            },
                $finished.toText(finished => finished ? 'unmark' : 'mark')
            ),
            ' ',
            h('a', {
                href: 'javascript:;',
                listeners: {
                    click() {
                        const newContent = prompt('new content', $content.current);
                        if (newContent) {
                            $list.replace($index, newContent);
                        }
                    }
                }
            },
                'modify'
            ),
            ' ',
            h('a', {
                href: 'javascript:;',
                listeners: {
                    click() {
                        $list.delete($index);
                    }
                }
            },
                'delete'
            ),
        );
    }
);

const LABEL_CLASS = X.createClass({
    display: 'inline-block',
    width: '7em',
    margin: '.5em .2em;'
}), INPUT_CLASS = X.createClass({
    padding: '.2em .3em',
    border: 'none',
    boxShadow: '0 1px 0 #666',
    outline: 'none'
});

X.insertStyle(`.${INPUT_CLASS}:focus`, {
    boxShadow: '0 1px 0 #111'
});

document.body.appendChild(X.Utils.createFragment([
    h('h1', { style: { color: $title.color } }, $title.content.map(title => `# ${title}`)),
    h('form', { action: 'javascript:;', style: { marginBottom: '1em' } },
        h('label', { for: 'color-input', class: LABEL_CLASS }, 'title color:'),
        h('input', { id: 'color-input', class: INPUT_CLASS, bind: $title.color }),
        h('br'),
        h('label', { for: 'content-input', class: LABEL_CLASS }, 'title content:'),
        h('input', { id: 'content-input', class: INPUT_CLASS, bind: $title.content })
    ),
    h('button', {
        style: 'padding: .5em 1em;',
        listeners: {
            click() {
                $count.set(count => count + 1);
            }
        }
    }, [
        'click count: ',
        $count.toText()
    ]),
    h('br'),
    AddItemOnce(0),
    AddItemOnce(1),
    AddItemOnce(2),
    $list.toElement('ul', Item),
    h('p', null,
        '$list: ',
        $list.toValue(list => h('span', null, list.join(', ')))
    )
]));
