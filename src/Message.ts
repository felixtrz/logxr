export enum MessageType {
	Log = 1,
	Error = 2,
	Warning = 3,
	All = 4,
}

export type Message = {
	type: MessageType;
	timestamp: number;
	content: string;
};
