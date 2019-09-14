// @ts-check
///<reference types=".." />

const h = X.createElement,
    $ = X.Value.of;

const $title = X.Value.wrap({
    content: 'Hello, world!',
    color: '#000000'
});

const LABEL_CLASS = X.createStyleClass({
    _: {
        display: 'inline-block',
        width: '8em',
        margin: '0 0 1em'
    }
});

const $inputWidth = $(10);

const INPUT_CLASS = X.createStyleClass({
    _: {
        width: X.Value.joinSync([$inputWidth, 'em']),
        padding: '.2em .4em',
        border: 'solid 1px #666',
        'border-radius': '3px'
    },
    '_:focus': {
        'box-shadow': '0 0 5px #999',
        outline: 'none'
    }
});

const RANGE_CLASS = X.createStyleClass({
    _: {
        position: 'relative',
        overflow: 'visible'
    },
    '_:focus::after': {
        content: 'attr(data-value)',
        position: 'absolute',
        display: 'inline-block',
        left: '0',
        right: '0',
        top: '100%',
        'text-align': 'center',
        color: '#444'
    }
});

function Label(options, content) {
    return h('label', Object.assign({ class: LABEL_CLASS }, options), content + ': ');
}

function Input(options) {
    return h('input', Object.assign({ class: INPUT_CLASS }, options));
}

function LabelledInput(id, label, inputOptions) {
    return [
        Label({ for: id }, label),
        Input(Object.assign({ id: id }, inputOptions))
    ];
}

function TitleTest() {
    return X.createFragment([
        h('h1', {
            id: 'title',
            style: {
                color: $title.color
            }
        }, $title.content),
        LabelledInput('title-content-input', 'title content', {
            bind: $title.content,
            listeners: {
                input: [
                    function () {
                        console.log('title changed')
                    },
                    { once: true }
                ]
            }
        }),
        h('br'),
        LabelledInput('title-color-input', 'title color', {
            class: '',
            type: 'color',
            bindSync: $title.color
        }),
        h('br'),
        LabelledInput('input-width-input', 'input width', {
            class: [],
            'data-value': $inputWidth,
            bind: $inputWidth,
            type: 'range',
            max: 20,
            min: 6
        }),
        ' (em)'
    ]);
}

function TextareaTest() {
    const $content = $('<h1>Textarea Test</h1>');
    return [
        h('div', { html: $content }),
        h('textarea', {
            cols: 50,
            rows: 15,
            bind: $content
        })
    ];
}

function AsyncTest() {
    return [
        'test0:　',
        X.createPlaceholder(
            new Promise(function (resolve) {
                setTimeout(resolve, 1000, 'success');
            }),
            'pending'
        ),
        h('br'),
        'test1:　',
        X.createPlaceholder(
            new Promise(function (resolve, reject) {
                setTimeout(reject, 3000, 'none');
            }),
            'pending',
            function (reason) {
                return 'failure (reason:' + reason + ')';
            }
        )
    ];
}

const FAKE_HREF = 'javascript:;';

function RouterTest() {
    function RouteA(matched, $history) {
        return h('p', null,
            '/a (',
            matched ? 'matched' : 'not matched',
            '"',
            $history.getSync(),
            '")'
        );
    }
    function Nav($history) {
        return h('nav', null,
            ['/a', '/b', '/ab'].map(function (path) {
                return X.createFragment([
                    h('a', { href: path, history: $history }, path),
                    ' '
                ]);
            }),
            h('a', { href: FAKE_HREF, back: '', history: $history }, 'back'),
            ' ',
            h('a', { href: FAKE_HREF, forward: '', history: $history }, 'forward')
        );
    }
    const routes = [
        { path: '/a', render: RouteA },
        { path: '/a', exact: true, use: function () { return h('p', null, '/a (exact)'); } },
        { path: '/b', use: function () { return h('p', null, '/b'); } },
        { path: '/', use: Nav }
    ];
    return [
        h('h2', null, 'history routing'),
        X.createRouter(X.getHistory(), routes),
        h('h2', null, 'view routing'),
        X.createRouter(X.createHistory('/a'), routes)
    ];
}

function ListTest() {
    const $items = $([]);
    const input = h('input', { placeholder: 'text' });
    return [
        h('form', {
            action: FAKE_HREF,
            listeners: {
                submit: function () {
                    const content = input.value;
                    $items.set(items => items.concat({ text: content }));
                    input.value = '';
                }
            }
        },
            input,
            h('button', { type: 'submit' }, 'Add')
        ),
        $items.mapSync(function (items) {
            return items.map(function (item) {
                return h('p', null,
                    item.text,
                    ' ',
                    h('a', {
                        href: FAKE_HREF,
                        listeners: {
                            click: function () {
                                $items.set(items => items.filter(function (_item) {
                                    return _item !== item;
                                }));
                            }
                        }
                    }, 'Del')
                );
            });
        })
    ];
}

const $hashbang = X.getHashbang('/title'),
    testRoutes = [
        { path: '/title', exact: true, use: TitleTest },
        { path: '/textarea', exact: true, use: TextareaTest },
        { path: '/async', exact: true, use: AsyncTest },
        { path: '/router', exact: true, use: RouterTest },
        { path: '/list', exact: true, use: ListTest }
    ];

X.appendChildren(
    document.body, [
        X.createElement('div', null, X.createRouter($hashbang, testRoutes)),
        X.createElement('div', { style: 'margin-top: 1em;' },
            'Select test:　',
            X.createElement('select', {
                bind: $hashbang,
                listeners: {
                    change: function () {
                        console.log('test changed');
                    }
                }
            }, testRoutes.map(function (route) {
                return h('option', { value: route.path }, route.path.slice(1) + ' test');
            })),
            ' ',
            h('a', { href: FAKE_HREF, back: '', history: $hashbang }, 'back'),
            ' ',
            h('a', { href: FAKE_HREF, forward: '', history: $hashbang }, 'forward')
        )
    ]
);
