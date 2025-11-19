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

# Rebuild native modules (node-pty) that require compilation
echo "Rebuilding native modules (node-pty)..."
npm run pty:rebuild node || true

# Run husky install (from prepare script)
npx cross-env husky install || true

# Manually run compilation step from postinstall
echo "Running TypeScript compilation..."
npm run postinstall

# Add small delay to ensure async file operations complete
sleep 1

# Verify critical mdist files exist before proceeding
echo "Verifying compiled output exists..."
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if [ -f "packages/react/mdist/index.js" ] && [ -f "plugins/plugin-bash-like/mdist/index.js" ] && [ -f "packages/core/mdist/index.js" ]; then
    echo "Compilation verification successful"
    break
  fi

  echo "Waiting for compilation to complete... (attempt $((RETRY_COUNT + 1))/$MAX_RETRIES)"
  sleep 2
  RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "ERROR: Compilation did not complete within expected time"
  echo "Checking which files are missing:"
  [ ! -f "packages/react/mdist/index.js" ] && echo "  - packages/react/mdist/index.js"
  [ ! -f "plugins/plugin-bash-like/mdist/index.js" ] && echo "  - plugins/plugin-bash-like/mdist/index.js"
  [ ! -f "packages/core/mdist/index.js" ] && echo "  - packages/core/mdist/index.js"
  exit 1
fi
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
