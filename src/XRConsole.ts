import {
	CanvasTexture,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	PlaneGeometry,
} from 'three';

import { MessageType } from './Message';
import { XRConsoleFactory } from './XRConsoleFactory';

export type XRConsoleOptions = {
	pixelWidth?: number;
	pixelHeight?: number;
	actualWidth?: number;
	actualHeight?: number;
	fontSize?: number;
	showTimestamp?: boolean;
	messageType?: MessageType;
	backgroundColor?: string;
	logColor?: string;
	errorColor?: string;
	warningColor?: string;
};

const DEFAULT_OPTIONS: XRConsoleOptions = {
	pixelWidth: 512,
	pixelHeight: 512,
	actualWidth: 1,
	actualHeight: 1,
	fontSize: 16,
	showTimestamp: true,
	messageType: MessageType.All,
	backgroundColor: '#222222',
	logColor: '#FFFFFF',
	errorColor: '#D0342C',
	warningColor: '#FF7900',
};

export class XRConsole extends Object3D {
	private _canvas: HTMLCanvasElement;
	private _plane: Mesh;
	private _options: XRConsoleOptions;
	public needsUpdate: boolean = true;

	constructor(options: XRConsoleOptions = {}) {
		super();
		this._options = options;
		this._canvas = document.createElement('canvas');
		this._canvas.width = this._options.pixelWidth || DEFAULT_OPTIONS.pixelWidth;
		this._canvas.height =
			this._options.pixelHeight || DEFAULT_OPTIONS.pixelHeight;

		this._plane = new Mesh(
			new PlaneGeometry(
				options.actualWidth || DEFAULT_OPTIONS.actualWidth,
				options.actualHeight || DEFAULT_OPTIONS.actualHeight,
			),
			new MeshBasicMaterial({
				side: DoubleSide,
				map: new CanvasTexture(this._canvas),
			}),
		);

		this.add(this._plane);
	}

	public render() {
		// clear canvas
		const context = this._canvas.getContext('2d');
		context.clearRect(0, 0, this._canvas.width, this._canvas.height);
		context.fillStyle =
			this._options.backgroundColor || DEFAULT_OPTIONS.backgroundColor;
		context.fillRect(0, 0, this._canvas.width, this._canvas.height);

		// measure text
		context.font = `${
			this._options.fontSize || DEFAULT_OPTIONS.fontSize
		}px monospace`;
		context.textBaseline = 'bottom';
		const textMetrics = context.measureText('M');
		const lineHeight = textMetrics.actualBoundingBoxAscent * 1.2;
		const numLines = Math.ceil(this._canvas.height / lineHeight);
		const numCharsPerLine = Math.floor(this._canvas.width / textMetrics.width);

		const messages = XRConsoleFactory.getInstance().getMessages(
			this._options.messageType || DEFAULT_OPTIONS.messageType,
			numLines,
		);

		let lineIndex = 1;
		messages.forEach((message) => {
			switch (message.type) {
				case MessageType.Log:
					context.fillStyle =
						this._options.logColor || DEFAULT_OPTIONS.logColor;
					break;
				case MessageType.Error:
					context.fillStyle =
						this._options.errorColor || DEFAULT_OPTIONS.errorColor;
					break;
				case MessageType.Warning:
					context.fillStyle =
						this._options.warningColor || DEFAULT_OPTIONS.warningColor;
					break;
			}

			const content =
				(this._options.showTimestamp || DEFAULT_OPTIONS.showTimestamp
					? this._buildReadableTimestamp(message.timestamp) + ' '
					: '') + message.content;
			const lines = content.match(
				new RegExp('.{1,' + numCharsPerLine + '}', 'g'),
			);
			lines.forEach((line) => {
				context.fillText(line, 0, lineIndex++ * lineHeight);
			});
		});

		(this._plane.material as MeshBasicMaterial).map.dispose();
		(this._plane.material as MeshBasicMaterial).map = new CanvasTexture(
			this._canvas,
		);

		this.needsUpdate = false;
	}

	private _buildReadableTimestamp(timestamp: number): string {
		const pad = (n: number, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
		const d = new Date(timestamp);

		return `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
			d.getSeconds(),
		)}]`;
	}

	public updateMatrixWorld(force?: boolean): void {
		super.updateMatrixWorld(force);
		if (this.needsUpdate) {
			this.render();
		}
	}
}
