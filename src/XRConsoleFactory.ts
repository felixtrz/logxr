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

	private constructor() {
		const log = console.log.bind(console);
		console.log = (...args) => {
			const message = buildMessage(MessageType.Log, ...args);
			this._messageQueue.unshift(message);
			log(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const error = console.error.bind(console);
		console.error = (...args) => {
			const message = buildMessage(MessageType.Error, ...args);
			this._messageQueue.unshift(message);
			error(...args);
			this._consoleInstances.forEach((consoleInstance) => {
				consoleInstance.needsUpdate = true;
			});
		};

		const warn = console.warn.bind(console);
		console.warn = (...args) => {
			const message = buildMessage(MessageType.Warning, ...args);
			this._messageQueue.unshift(message);
			warn(...args);
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
