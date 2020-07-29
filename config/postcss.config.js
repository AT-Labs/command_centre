module.exports = ({ file, options, env }) => ({
    ident: 'postcss',
    parser: 'postcss-scss',
    plugins: {
        'postcss-preset-env': options['postcss-preset-env'] ? options['postcss-preset-env'] : false,
        cssnano: env === 'production' ? options.cssnano : false,
    },
});
