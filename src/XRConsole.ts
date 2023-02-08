import {
	CanvasTexture,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
} from 'three';
import { Message, MessageType } from './Message';

import { XRConsoleFactory } from './XRConsoleFactory';
import wrap from 'word-wrap';

export type XRConsoleOptions = {
	/**
	 * The width of the canvas in pixels.
	 * @default 1024
	 */
	pixelWidth?: number;
	/**
	 * The height of the canvas in pixels.
	 * @default 512
	 */
	pixelHeight?: number;
	/**
	 * The width of the plane in meters.
	 * @default 1
	 */
	actualWidth?: number;
	/**
	 * The height of the plane in meters.
	 * @default 1
	 */
	actualHeight?: number;
	/**
	 * The font size of the text in pixels.
	 * @default 16
	 */
	fontSize?: number;
	/**
	 * The horizontal padding of the text in pixels.
	 * @default 5
	 */
	horizontalPadding?: number;
	/**
	 * The vertical padding of the text in pixels.
	 * @default 5
	 */
	verticalPadding?: number;
	/**
	 * Whether or not to show the timestamp.
	 * @default true
	 */
	showTimestamp?: boolean;
	/**
	 * The type of messages to show.
	 * @default MessageType.All
	 * @see MessageType
	 */
	messageType?: MessageType;
	/**
	 * The background color of the canvas.
	 * @default '#222222'
	 */
	backgroundColor?: string;
	/**
	 * The color of the log messages.
	 * @default '#FFFFFF'
	 */
	logColor?: string;
	/**
	 * The color of the error messages.
	 * @default '#D0342C'
	 */
	errorColor?: string;
	/**
	 * The color of the warning messages.
	 * @default '#FF7900'
	 */
	warningColor?: string;
};

const DEFAULT_OPTIONS: XRConsoleOptions = {
	pixelWidth: 1024,
	pixelHeight: 512,
	actualWidth: 1,
	actualHeight: 1,
	horizontalPadding: 5,
	verticalPadding: 5,
	fontSize: 16,
	showTimestamp: true,
	messageType: MessageType.All,
	backgroundColor: '#222222',
	logColor: '#FFFFFF',
	errorColor: '#D0342C',
	warningColor: '#FF7900',
};

type Line = {
	text: string;
	color: string;
	indent: number;
};

export class XRConsole extends Object3D {
	private _canvas: HTMLCanvasElement;
	private _plane: Mesh;
	private _options: XRConsoleOptions;
	/**
	 * flag to indicate that the console canvas needs to be updated
	 */
	public needsUpdate: boolean = true;

	constructor(options: XRConsoleOptions = {}) {
		super();
		this._options = {
			pixelWidth: options.pixelWidth ?? DEFAULT_OPTIONS.pixelWidth,
			pixelHeight: options.pixelHeight ?? DEFAULT_OPTIONS.pixelHeight,
			actualWidth: options.actualWidth ?? DEFAULT_OPTIONS.actualWidth,
			actualHeight: options.actualHeight ?? DEFAULT_OPTIONS.actualHeight,
			horizontalPadding:
				options.horizontalPadding ?? DEFAULT_OPTIONS.horizontalPadding,
			verticalPadding:
				options.verticalPadding ?? DEFAULT_OPTIONS.verticalPadding,
			fontSize: options.fontSize ?? DEFAULT_OPTIONS.fontSize,
			showTimestamp: options.showTimestamp ?? DEFAULT_OPTIONS.showTimestamp,
			messageType: options.messageType || DEFAULT_OPTIONS.messageType,
			backgroundColor:
				options.backgroundColor ?? DEFAULT_OPTIONS.backgroundColor,
			logColor: options.logColor ?? DEFAULT_OPTIONS.logColor,
			errorColor: options.errorColor ?? DEFAULT_OPTIONS.errorColor,
			warningColor: options.warningColor ?? DEFAULT_OPTIONS.warningColor,
		};
		this._canvas = document.createElement('canvas');
		this._canvas.width = this._options.pixelWidth;
		this._canvas.height = this._options.pixelHeight;

		this._plane = new Mesh(
			new PlaneGeometry(options.actualWidth, options.actualHeight),
			new MeshBasicMaterial({
				side: DoubleSide,
				map: new CanvasTexture(this._canvas),
			}),
		);

		this.add(this._plane);
	}

	get innerHeight() {
		return this._options.pixelHeight - this._options.verticalPadding * 2;
	}

	get innerWidth() {
		return this._options.pixelWidth - this._options.horizontalPadding * 2;
	}

	/**
	 * Renders the console to the canvas
	 * @returns void
	 */
	public render() {
		// clear canvas
		const context = this._canvas.getContext('2d');
		context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		context.fillStyle = this._options.backgroundColor;
		context.fillRect(0, 0, this._canvas.width, this._canvas.height);

		// measure text
		context.font = `${this._options.fontSize}px monospace`;
		context.textBaseline = 'bottom';
		const textMetrics = context.measureText('M');
		const lineHeight = textMetrics.actualBoundingBoxAscent * 1.2;
		const numLines = Math.ceil(this.innerHeight / lineHeight);
		const numCharsPerLine = Math.floor(this.innerWidth / textMetrics.width);

		const messages = XRConsoleFactory.getInstance().getMessages(
			this._options.messageType,
			numLines,
		);

		const lines = this._generateLines(messages, numCharsPerLine);
		this._renderLines(lines, lineHeight, textMetrics.width, context);

		(this._plane.material as MeshBasicMaterial).map.dispose();
		(this._plane.material as MeshBasicMaterial).map = new CanvasTexture(
			this._canvas,
		);

		this.needsUpdate = false;
	}

	/**
	 * Renders lines of text to the canvas
	 * @param lines - The lines to render
	 * @param lineHeight - The height of a line in pixels
	 * @param charWidth - The width of a character in pixels
	 * @param context - The canvas context to render to
	 * @returns void
	 */
	private _getColorForMessageType(messageType: MessageType): string {
		switch (messageType) {
			case MessageType.Log:
				return this._options.logColor;
			case MessageType.Error:
				return this._options.errorColor;
			case MessageType.Warning:
				return this._options.warningColor;
		}
		throw new Error('Invalid message type');
	}

	/**
	 * Generates lines of text to render
	 * @param messages - The messages to generate lines for
	 * @param numCharsPerLine - The number of characters that can fit on a line
	 * @returns lines - The lines to render
	 */
	private _generateLines(messages: Message[], numCharsPerLine: number): Line[] {
		const lines: Line[] = [];
		messages.forEach((message) => {
			const timestamp = this._options.showTimestamp
				? buildReadableTimestamp(message.timestamp) + ' '
				: '';
			const textLines = wrapText(
				message.content,
				numCharsPerLine - timestamp.length,
			);
			const localLines: Line[] = [];
			textLines.forEach((textLine, index) => {
				localLines.unshift({
					text: index == 0 ? timestamp + textLine : textLine,
					color: this._getColorForMessageType(message.type),
					indent: index == 0 ? 0 : timestamp.length,
				});
			});
			lines.push(...localLines);
		});
		return lines;
	}

	/**
	 * Renders lines of text to the canvas
	 * @param lines - The lines to render
	 * @param lineHeight - The height of a line
	 * @param charWidth - The width of a character
	 * @param context - The canvas context to render to
	 */
	private _renderLines(
		lines: Line[],
		lineHeight: number,
		charWidth: number,
		context: CanvasRenderingContext2D,
	) {
		let y =
			Math.min(this.innerHeight, lines.length * lineHeight) +
			this._options.verticalPadding;
		lines.forEach((line) => {
			context.fillStyle = line.color;
			context.fillText(
				line.text,
				line.indent * charWidth + this._options.horizontalPadding,
				y,
			);
			y -= lineHeight;
		});
	}

	public updateMatrixWorld(force?: boolean): void {
		super.updateMatrixWorld(force);
		if (this.needsUpdate) {
			this.render();
		}
	}
}

/**
 * Wraps text to a given number of characters per line
 * @param text - text to wrap
 * @param numCharsPerLine - number of characters per line
 * @returns array of lines
 */
const wrapText = (text: string, numCharsPerLine: number): string[] => {
	const lines: string[] = [];
	const unwrappedLines = text.split('\n');
	unwrappedLines.forEach((line) => {
		const wrappedLines = wrap(line, {
			width: numCharsPerLine,
			indent: '',
			trim: true,
		}).split('\n');
		wrappedLines.forEach((wrappedLine) => {
			lines.push(wrappedLine);
		});
	});
	return lines;
};

/**
 * builds a readable timestamp from a timestamp in milliseconds
 * @param timestamp - timestamp in milliseconds
 * @returns readable timestamp
 */
const buildReadableTimestamp = (timestamp: number): string => {
	const pad = (n: number, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
	const d = new Date(timestamp);
	return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
};
