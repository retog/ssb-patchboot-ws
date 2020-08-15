# PatchBoot Electron

Bootstrapp your Secure Scuttlebutt Client.

## Functionality

PatchBoot Electron provides an electron app that allows executing small app retrieved via ssb.

## Usage

You need to have an instance of [ssb-server](https://github.com/ssbc/ssb-server) running. If you have [Patchwork](https://github.com/ssbc/patchwork/) installed and running you have this already. If the data and keys are not stored in `~/.ssb` you need to set `ssb_appname` accordingly.

    npm install
    npm run start

The UI will show all apps it finds in the ScuttleVerse visible to you.

## Publishing apps

The folder `demo-apps` contains some simple example apps allongside with scripts to publish them.

Aletrnatived `patchboot-install` can be used to deploy any js-file. It can be used within the `script` of npm projects as with the following `package.json`:

```
{
  "name": "patchboot-example-app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "deploy-app": "patchboot-install FeedApp.js 'Feed App' 'An app deployed with patchboot-install'"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "patchboot": "0.0.1"
  }
}
```

## How does it work?

Apps are advertised using mesages of the type `patchboot-app` like the followig

```
{
    "type": "patchboot-app",
    "name": "WomBat Launcher",
    "comment": "A friendly new launcher",
    "link": "&CKrrSh72rXhgCzeTKekAPf7fiwtmNml/yFjXCe4ovnE=.sha256",
}
```

The link points to the JavaScript comprising the app. The JavaScript code has access to the following variables:

- `sbot`: an [rpc connection](https://ssbc.github.io/scuttlebutt-protocol-guide/#rpc-protocol) to an sbot
- `root`: the root of the shadow DOM
- `pull`: the [pull-stream](https://github.com/pull-stream/pull-stream) function object
- `ssb`: [*deprecated: use `sbot` instead*] the [ssb client](https://github.com/ssbc/ssb-client)


