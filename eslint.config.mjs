import antfu from '@antfu/eslint-config';

export default antfu({
    stylistic: {
        semi: true,
        indent: 4,
    },
}, {
    rules: {
        'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],

        'vue/max-attributes-per-line': ['error', {
            singleline: { max: 2 },
            multiline: { max: 1 },
        }],

        'vue/first-attribute-linebreak': ['error', {
            singleline: 'ignore',
            multiline: 'below',
        }],
    },
});
