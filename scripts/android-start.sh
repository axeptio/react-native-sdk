#!/bin/bash

set -e

cd example
(cd android && ./gradlew clean)
yarn android
