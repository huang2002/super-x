import rollupPluginBabel from "rollup-plugin-babel";

const input = 'raw/index.js';

export default [
    {
        input,
        plugins: [
            rollupPluginBabel()
        ],
        output: {
            format: 'umd',
            name: 'X',
            file: 'dist/super-x.umd.js'
        }
    },
    {
        input,
        output: {
            format: 'esm',
            file: 'dist/super-x.js'
        }
    }
];
