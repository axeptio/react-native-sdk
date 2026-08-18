const { withProjectBuildGradle } = require('expo/config-plugins');

// The Axeptio Android SDK is published on GitHub Packages, which requires
// authentication even for public packages. Inject the repository into the
// prebuild-generated android/build.gradle; credentials come from gradle
// properties or the environment (GITHUB_ACTOR/GITHUB_TOKEN work in CI).
const MAVEN_BLOCK = `
    maven {
      url = uri("https://maven.pkg.github.com/axeptio/axeptio-android-sdk")
      credentials {
        username = project.findProperty("GITHUB_USERNAME") ?: System.getenv("GITHUB_USERNAME") ?: System.getenv("GITHUB_ACTOR") ?: ""
        password = project.findProperty("GITHUB_TOKEN") ?: System.getenv("GITHUB_TOKEN") ?: ""
      }
    }`;

module.exports = function withAxeptioMaven(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (!cfg.modResults.contents.includes('maven.pkg.github.com/axeptio')) {
      cfg.modResults.contents = cfg.modResults.contents.replace(
        /(allprojects\s*\{\s*repositories\s*\{)/,
        `$1${MAVEN_BLOCK}`
      );
    }
    return cfg;
  });
};
