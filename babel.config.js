module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    // Disable reanimated plugin due to worklets compatibility issue
                    reanimated: false,
                },
            ],
        ],
        plugins: [],
    };
};
