// @ts-check
/// <reference types="../index" />
// @ts-ignore
const { createElement: h } = X;

const $title = new X.ReactiveValue('hello, world'),
    $count = new X.ReactiveValue(0),
    /** @type {X.ReactiveList<string>} */
    $list = new X.ReactiveList();

const AddItemOnce = () => h(
    'button',
    {
        style: {
            marginTop: '1em',
            marginRight: '.5em',
            padding: '.3em .6em'
        },
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

document.body.appendChild(X.Utils.createFragment([
    h('h1', null, $title.map(title => `# ${title}`)),
    h('form', { action: 'javascript:;', style: { marginBottom: '1em' } },
        h('label', {
            for: 'title-input',
            style: 'display: inline-block; margin: .2em .6em;'
        }, 'title content:'),
        h('input', {
            id: 'title-input',
            style: {
                padding: '.2em .3em',
                border: 'none',
                boxShadow: '0 1px 0 #666'
            },
            bind: $title
        })
    ),
    h(
        'button',
        {
            style: {
                padding: '.5em 1em'
            },
            listeners: {
                click() {
                    $count.set(count => count + 1);
                }
            }
        },
        'click count: ',
        $count
    ),
    h('br'),
    AddItemOnce(),
    AddItemOnce(),
    AddItemOnce(),
    $list.toElement('ul', item => h('li', null, item))
]));
