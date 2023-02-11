import { Message, MessageType } from './Message';
import { XRConsole, XRConsoleOptions } from './XRConsole';

const buildMessage = (messageType: MessageType, ...args: any[]) => {
	return {
		type: messageType,
		timestamp: Date.now(),
		content: args.join(' '),
	};
};

export class XRConsoleFactory {
	private static _instance: XRConsoleFactory;
	private _messageQueue: Message[] = [];
	private _consoleInstances: XRConsole[] = [];
	private _maxNumMessages = 100;

	private constructor() {
		const log = console.log.bind(console);
		console.log = (...args) => {
			const message = buildMessage(MessageType.Log, ...args);
			this._pushMessage(message);
			log(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const error = console.error.bind(console);
		console.error = (...args) => {
			const message = buildMessage(MessageType.Error, ...args);
			this._pushMessage(message);
			error(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const warn = console.warn.bind(console);
		console.warn = (...args) => {
			const message = buildMessage(MessageType.Warning, ...args);
			this._pushMessage(message);
			warn(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const info = console.info.bind(console);
		console.info = (...args) => {
			const message = buildMessage(MessageType.Info, ...args);
			this._pushMessage(message);
			info(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const debug = console.debug.bind(console);
		console.debug = (...args) => {
			const message = buildMessage(MessageType.Debug, ...args);
			this._pushMessage(message);
			debug(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const clear = console.clear.bind(console);
		console.clear = () => {
			this._messageQueue = [];
			clear();
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};
	}

	public static getInstance(): XRConsoleFactory {
		if (!this._instance) {
			this._instance = new XRConsoleFactory();
		}
		return this._instance;
	}

	private _pushMessage(message: Message) {
		this._messageQueue.unshift(message);
		this._messageQueue = this._messageQueue.slice(0, this._maxNumMessages);
	}

	get maxNumMessages(): number {
		return this._maxNumMessages;
	}

	set maxNumMessages(value: number) {
		this._maxNumMessages = value;
		this._messageQueue = this._messageQueue.slice(0, value);
	}

	public createConsole(options: XRConsoleOptions): XRConsole {
		const consoleInstance = new XRConsole(options);
		this._consoleInstances.push(consoleInstance);
		return consoleInstance;
	}

	public getMessages(messageType: MessageType, count: number): Message[] {
		return messageType === MessageType.All
			? this._messageQueue
			: this._messageQueue
					.filter((message) => {
						return message.type === messageType;
					})
					.slice(0, count);
	}
}
