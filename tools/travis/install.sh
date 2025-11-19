#!/usr/bin/env bash

# see https://github.com/IBM/kui/issues/5608
./tools/travis/check-error-handlers.sh

echo "Launching Wayland compositor (Weston)"
if [ "$TRAVIS_OS_NAME" = "linux" ]; then
    # Start Weston in headless mode for Wayland support
    # Multiple instances for parallel test execution
    export WAYLAND_DISPLAY=wayland-0
    weston --backend=headless-backend.so --width=${WINDOW_WIDTH} --height=${WINDOW_HEIGHT} > /dev/null 2>&1 &

    export WAYLAND_DISPLAY=wayland-1
    weston --backend=headless-backend.so --width=${WINDOW_WIDTH} --height=${WINDOW_HEIGHT} > /dev/null 2>&1 &

    export WAYLAND_DISPLAY=wayland-2
    weston --backend=headless-backend.so --width=${WINDOW_WIDTH} --height=${WINDOW_HEIGHT} > /dev/null 2>&1 &

    export WAYLAND_DISPLAY=wayland-3
    weston --backend=headless-backend.so --width=${WINDOW_WIDTH} --height=${WINDOW_HEIGHT} > /dev/null 2>&1 &

    export WAYLAND_DISPLAY=wayland-4
    weston --backend=headless-backend.so --width=${WINDOW_WIDTH} --height=${WINDOW_HEIGHT} > /dev/null 2>&1 &

    # Set default Wayland display
    export WAYLAND_DISPLAY=wayland-0

    # Force GTK to use Wayland backend
    export GDK_BACKEND=wayland

    # Wait for Weston to start
    sleep 2
fi

./tools/travis/cleanupNvm.sh

if [ -n "$NEEDS_OPENWHISK" ]; then ./tools/travis/openwhisk/start.sh & ow=$!; fi
if [ -n "$NEEDS_K8S" ]; then ./tools/travis/microk8s.sh & k8s=$!; fi
if [ -n "$NEEDS_MINIO" ]; then ./tools/travis/minio.sh & minio=$!; fi
# Install dependencies without running scripts to avoid electron-chromedriver download issues
npm ci --ignore-scripts
# Manually run compilation step from postinstall
npm run compile
if [ "$CLIENT" != "default" ]; then ./bin/switch-client.sh ${CLIENT-default}; fi
./tools/codecov/instrument.sh
if [ "$MOCHA_RUN_TARGET" = "webpack" ]; then export KUI_USE_PROXY=true; if [ "$DEPLOY" = "cluster" ]; then npx kui-build-webpack && npx kui-build-docker-with-proxy && (kui-run-cproxy &); else npm run watch:webpack; fi; elif [ -z "$TEST_FROM_BUILD" ]; then npm run watch:electron; else npm run build:electron:$TRAVIS_OS_NAME:${TRAVIS_CPU_ARCH-amd64}; fi
if [ -n "$ow" ]; then wait $ow; fi
if [ -n "$k8s" ]; then wait $k8s; fi
if [ -n "$minio" ]; then wait $minio; fi

if [ -n "$NEEDS_GIT" ]; then
    git config --global user.name "GitHub Actions Bot"
    git config --global user.email "<>"
fi

if [ -n "$NEEDS_BASH_PREP" ]; then
    sudo apt-get install wbritish
    ls /usr/share/dict/words
fi
