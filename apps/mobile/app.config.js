export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      serverUrl: process.env.EXPO_PUBLIC_SERVER_URL || 'https://scatty-production.up.railway.app',
    },
  };
};
