const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidSupportExclusions(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Check if exclusions already exist
    if (buildGradle.includes("exclude group: 'com.android.support'")) {
      return config;
    }

    // Add configurations.all block before dependencies block
    const exclusionsBlock = `
configurations.all {
    // Exclude old Android Support Library to fix duplicate class errors with AndroidX
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-core-ui'
    exclude group: 'com.android.support', module: 'support-fragment'
    exclude group: 'com.android.support', module: 'support-media-compat'
    exclude group: 'com.android.support', module: 'appcompat-v7'
}

`;

    // Insert before dependencies block
    config.modResults.contents = buildGradle.replace(
      /^dependencies\s*\{/m,
      exclusionsBlock + 'dependencies {'
    );

    return config;
  });
};
