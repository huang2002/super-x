// @ts-check
/// <reference types="../index" />
// @ts-ignore
const { createElement: h } = X;

const $titleContent = new X.ReactiveValue('hello, world'),
    $titleColor = new X.ReactiveValue('#000'),
    $count = new X.ReactiveValue(0),
    /** @type {X.ReactiveList<string>} */
    $list = new X.ReactiveList();

const ADD_ITEM_ONCE_CLASS = X.createClass({
    marginTop: '1em',
    marginRight: '.5em',
    padding: '.3em .6em'
});

const AddItemOnce = () => h(
    'button',
    {
        class: ADD_ITEM_ONCE_CLASS,
        listeners: {
            click: {
                listener(event) {
                    $list.push('list item');
                    event.target.style.color = '#666';
                },
                options: {
                    once: true
                }
            }
        }
    },
    'add item once'
);

document.body.style.padding = '.5em 1em';

const LABEL_CLASS = X.createClass({
    display: 'inline-block',
    width: '7em',
    margin: '.5em .2em;'
}), INPUT_CLASS = X.createClass({
    padding: '.2em .3em',
    border: 'none',
    boxShadow: '0 1px 0 #666'
});

document.body.appendChild(X.Utils.createFragment([
    h('h1', { style: { color: $titleColor } }, $titleContent.map(title => `# ${title}`)),
    h('form', { action: 'javascript:;', style: { marginBottom: '1em' } },
        h('label', { for: 'color-input', class: LABEL_CLASS }, 'title color:'),
        h('input', { id: 'color-input', class: INPUT_CLASS, bind: $titleColor }),
        h('br'),
        h('label', { for: 'content-input', class: LABEL_CLASS }, 'title content:'),
        h('input', { id: 'content-input', class: INPUT_CLASS, bind: $titleContent })
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
        $count
    ]),
    h('br'),
    AddItemOnce(),
    AddItemOnce(),
    AddItemOnce(),
    $list.toElement('ul', item => h('li', null, item))
]));
