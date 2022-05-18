module.exports = {
    core: {
        builder: "webpack5",
    },
    stories: ['../packages/**/src/**/*.story.mdx', '../packages/**/src/**/*.story.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        'storybook-stylesheet-toggle',
        '@storybook/preset-scss'
    ]
};
