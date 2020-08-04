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

The folder `play` contains some simple example apps allongside with scripts to publish them.

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

`ssb`: the [ssb client](https://github.com/ssbc/ssb-client)
`root`: the root of the shadow DOM

