# LogXR

[![npm version](https://badge.fury.io/js/logxr.svg)](https://badge.fury.io/js/logxr)
[![language](https://badgen.net/badge/icon/typescript?icon=typescript&label)](https://www.typescriptlang.org/)
[![npm download](https://badgen.net/npm/dw/logxr)](https://www.npmjs.com/package/logxr)
[![license](https://badgen.net/github/license/felixtrz/logxr)](/LICENSE.md)

LogXR is a debugging utility that makes it easy to view console logs in WebXR experiences. It provides developers with a simple, straightforward way to debug and troubleshoot their WebXR applications, giving them clarity and insight into the console output. Currently, LogXR only supports Three.js, but support for Babylon.js will be added in the near future.

## Benefits

- **Effortless debugging**: LogXR makes it easy to debug WebXR experiences, providing clarity and insight into the console output.
- **Streamlined workflow**: By making it simple to view console logs in your XR environment, LogXR streamlines your development workflow and saves you time.
- **Better WebXR experiences**: With the ability to easily debug and troubleshoot your WebXR applications, you can build better experiences for your users.

## Installation

To install LogXR, simply run the following command in your terminal:

```sh
npm install logxr
```

Or if you prefer using Yarn:

```sh
$ yarn add logxr
```

## Usage

Using LogXR is simple. First, import the package in your WebXR project:

```js
import { XRConsoleFactory } from 'logxr';
```

Then, create an instance of the XR console:

```js
const xrConsole = XRConsoleFactory.getInstance().createConsole({
	pixelWidth: 1024,
	pixelHeight: 512,
	actualWidth: 2,
	actualHeight: 1,
});
```

The xrConsole object created extends [THREE.Object3D](https://threejs.org/docs/#api/en/core/Object3D), and can be used as such. After a console is set up, simply use console.log() as usual, and the logs will be intercepted and reflected on the xrConsole.

## API Reference

The following classes are exported by LogXR, and are available for use in your WebXR projects:

## `XRConsoleFactory`

The `XRConsoleFactory` class is a singleton factory that is used to create instances of the XR console.

### `getInstance()`

```js
static getInstance(): XRConsoleFactory
```

Returns the singleton instance of the `XRConsoleFactory`.

### `createLogger(options: XRConsoleOptions)`

```js
createLogger(options: XRConsoleOptions): XRConsole
```

Creates a new instance of the XR console with the specified options.

## `XRConsole`

The `XRConsole` class represents the XR console, and provides the necessary functionality for rendering console logs in a WebXR environment.

### `constructor(options?: XRConsoleOptions)`

```js
constructor(options?: XRConsoleOptions)
```

Creates a new instance of the XR console with the specified options.

### `render()`

```js
render(): void
```

Renders the console to the canvas.

## `XRConsoleOptions`

The `XRConsoleOptions` interface represents a set of options that can be passed to the `XRConsole` constructor to customize its appearance and behavior.

### Properties

- `pixelWidth?: number`: The width of the canvas in pixels. Default is 1024.
- `pixelHeight?: number`: The height of the canvas in pixels. Default is 512.
- `actualWidth?: number`: The width of the plane in meters. Default is 1.
- `actualHeight?: number`: The height of the plane in meters. Default is 1.
- `fontSize?: number`: The font size of the text in pixels. Default is 16.
- `horizontalPadding?: number`: The horizontal padding of the text in pixels. Default is 5.
- `verticalPadding?: number`: The vertical padding of the text in pixels. Default is 5.
- `showTimestamp?: boolean`: Whether or not to show the timestamp. Default is true.
- `messageType?: MessageType`: The type of messages to show. Default is `MessageType.All`.
- `backgroundColor?: string`: The background color of the canvas. Default is `'#222222'`.
- `logColor?: string`: The color of the log messages. Default is `'#FFFFFF'`.
- `errorColor?: string`: The color of the error messages. Default is `'#D0342C'`.
- `warningColor?: string`: The color of the warning messages. Default is `'#FF7900'`.

## `MessageType`

The `MessageType` enumeration is used to specify the type of messages that should be displayed in the XR console.

### Values

- `All`: Displays all messages.
- `Log`: Displays only log messages.
- `Error`: Displays only error messages.
- `Warning`: Displays only warning messages.

## License

[MIT License](/LICENSE.md) © 2023 Felix Zhang
