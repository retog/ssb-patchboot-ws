#!/bin/sh
test -s ssb-client.js || browserify -r ssb-client -i bufferutil -i utf-8-validate -o ssb-client.js
browserify preload.js -u ssb-client -o preload.bundle.js
