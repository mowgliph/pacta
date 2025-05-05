module.exports = {
  // specify an alternate main src directory, defaults to 'main'
  mainSrcDir: "main",
  // specify an alternate renderer src directory, defaults to 'renderer'
  rendererSrcDir: "renderer",

  // main process' webpack config
  webpack: (config, env) => {
    // Configuración específica para el renderer
    if (env === "renderer") {
      config.externals = {
        ...config.externals,
        electron: "electron",
      };
    }
    return config;
  },
};
