import antfu from '@antfu/eslint-config';

export default antfu({
    stylistic: {
        semi: true,
        indent: 4,
    },
}, {
    rules: {
        'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
});
