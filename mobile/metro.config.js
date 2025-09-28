// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // usar o transformer pra .svg virar componente
  config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

  // tirar 'svg' da lista de assets e colocar em source
  config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
  config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

  return config;
})();
