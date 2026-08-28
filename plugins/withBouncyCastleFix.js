const { withProjectBuildGradle } = require('@expo/config-plugins');

/**
 * expo-updates dépend (transitivement) d'une PLAGE de version pour bouncycastle
 * (org.bouncycastle:bcprov-jdk15to18:[1.81,1.82)). Une plage force Gradle à interroger le
 * maven-metadata.xml de jitpack.io pour lister les versions disponibles à chaque build — et ce
 * point précis de jitpack.io s'est révélé à plusieurs reprises très lent/indisponible en pratique
 * ("Read timed out"), faisant échouer ':app:mergeReleaseNativeLibs' avant même de compiler quoi
 * que ce soit côté app. Fixer la version exacte évite cette requête de listing : Gradle demande
 * alors directement le POM/JAR de la version 1.81 (satisfait la plage), résolvable via Maven
 * Central sans dépendre de la disponibilité de jitpack.
 */
const BOUNCYCASTLE_VERSION = '1.81';

module.exports = function withBouncyCastleFix(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }
    const block = `
allprojects {
    configurations.all {
        resolutionStrategy {
            force 'org.bouncycastle:bcprov-jdk15to18:${BOUNCYCASTLE_VERSION}'
            force 'org.bouncycastle:bcutil-jdk15to18:${BOUNCYCASTLE_VERSION}'
        }
    }
}
`;
    if (!config.modResults.contents.includes('bcprov-jdk15to18')) {
      config.modResults.contents += block;
    }
    return config;
  });
};
