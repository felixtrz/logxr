export enum MessageType {
	Log = 1,
	Error = 2,
	Warning = 3,
	Info = 4,
	Debug = 5,
	All = 6,
}

export type Message = {
	type: MessageType;
	timestamp: number;
	content: string;
};
