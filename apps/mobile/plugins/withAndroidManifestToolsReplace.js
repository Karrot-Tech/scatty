const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withAndroidManifestToolsReplace(config) {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const application = androidManifest.manifest.application[0];

        // Ensure 'tools' namespace is defined
        if (!androidManifest.manifest.$['xmlns:tools']) {
            androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
        }

        // Add tools:replace="android:appComponentFactory" and the explicit value
        if (application.$['tools:replace']) {
            const existingRecplace = application.$['tools:replace'];
            if (!existingRecplace.includes('android:appComponentFactory')) {
                application.$['tools:replace'] = `${existingRecplace},android:appComponentFactory`;
            }
        } else {
            application.$['tools:replace'] = 'android:appComponentFactory';
        }

        // Explicitly set the value to the AndroidX one to resolve the conflict
        application.$['android:appComponentFactory'] = 'androidx.core.app.CoreComponentFactory';

        // Also likely need to perform a replace for 'android:allowBackup' if that conflicts often,
        // but the error specifically mentioned appComponentFactory.

        return config;
    });
};
