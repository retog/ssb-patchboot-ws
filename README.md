# ssb-patchboot-ws
A Patchboot plugin for the Scuttlebutt [ssb-server](https://github.com/ssbc/ssb-server).

Patchboot-ws provides a web app that allows executing in the browser small app retrieved via ssb.

## Usage

Note that this plugin requires Node.js >= 14.0.0

Install the plugin with:

    ssb-server plugins.install ssb-patchboot-ws -a 1

(the '-a 1' should actually not be needed, it's a workaround for an issue causing the error "Cannot set property 'module' of undefined")

You need to restart `ssb-server` for the plugin to be active.

When the plugin is active, you can access patchboot by default on port 5585, you can configure this port with the `port` property in the plugin config in ssb-server configuration (normally in `~/.ssb/config`). When you access this URI for the first time from a browser you will be given a key that you have to add to the ssb-server configuration as instructed in the browser. Once you have added the key you will need to restart the server one more time.

## Publishing apps

See the patchboot-install project.

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

## Credits

The original patch allowing to use Patchboot in a browser was proposed by Charles E. Lehner aka [cel-desktop](@lOUVT+Phkvai9a/cCS/RKo+S9hnPAQdVixms/7ldpPA=.ed25519) with this post: [%25Mv0Jr5X%2BujVmiVKyoRKHNKMvBSkrewundFLYFUsMLrg%3D.sha256](%25Mv0Jr5X%2BujVmiVKyoRKHNKMvBSkrewundFLYFUsMLrg%3D.sha256).


