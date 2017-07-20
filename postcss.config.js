module.exports = (config) => [
    require("stylelint")(),
    require("postcss-cssnext")({
      browsers: "last 2 versions",
      features: {
        customProperties: {
          variables: {
            maxWidth: "1000px",
            colorPrimaryDark: "#107491",
            colorPrimary: "white",
            colorSecondaryDark: "#22846C",
            colorSecondary: "grey",
            colorNeutralDark: "#111",
            colorNeutral: "#8C8D91",
            colorNeutralLight: "#FBFCFC",
            colorText: "555",
            colorGold: "#ccb551",
            colorRed: "#8e3333"
          },
        },
      },
    }),
    require("postcss-reporter")(),
    ...!config.production ? [
      require("postcss-browser-reporter")(),
    ] : [],
  ]
