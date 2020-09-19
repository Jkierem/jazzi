import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

import pkg from './package.json';

const config = {
    input: 'src/index.js',
    output: [
        {
            file: pkg.main,
            sourceMaps: true,
            format: 'cjs'
        },
        {
            file: pkg.module,
            sourceMaps: true,
            format: 'esm'
        },
        {
            file: pkg.browser,
            sourceMaps: true,
            format: "umd",
            name: "JuanRamdaStructures",
            globals: {
                ramda: "ramda"
            }
        }
    ],
    external: [ "ramda" ],
    plugins: [
        resolve(),
        babel({
            exclude: ['node_modules/**'],
            sourceMaps: false,
            babelHelpers: "bundled"
        })
    ]
}

export default config;