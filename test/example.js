const h = X.createElement;

function App() {
    const title = new X.Value('Hello, world!');
    return X.createFragment([
        h('h1', null, title),
        h('input', { bind: title })
    ]);
}

document.body.appendChild(App());
