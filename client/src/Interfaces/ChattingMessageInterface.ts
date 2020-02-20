export interface ChatMessage {
  socketId: string;
  author: string;
  message: string;
}

export interface ChatState {
  input: string;
  messages: ChatMessage[];
}
