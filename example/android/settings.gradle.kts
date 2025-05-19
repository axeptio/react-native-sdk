pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    includeBuild("../node_modules/@react-native/gradle-plugin")
}

dependencyResolutionManagement {
        repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/axeptio/axeptio-android-sdk")
            credentials {
                username = System.getenv("GITHUB_ACTOR")
                password = System.getenv("GITHUB_TOKEN") // Read package token
            }
        }
    }
}

rootProject.name = "AxeptioSdkExample"

include(":app")
include(":axeptio_react-native-sdk")
project(":axeptio_react-native-sdk").projectDir = File(rootDir, "../../android")
include(":react-native-google-mobile-ads")
project(":react-native-google-mobile-ads").projectDir = File(rootDir, "../node_modules/react-native-google-mobile-ads/android")
