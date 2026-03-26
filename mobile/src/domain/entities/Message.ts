export class Message {
  constructor(
    public readonly id: number,
    public readonly conversationId: number,
    public readonly senderId: number,
    public readonly content: string,
    public readonly sentAt: Date,
    public readonly isRead: boolean = false,
  ) {}

  static fromJSON(json: any): Message {
    return new Message(
      json.id,
      json.conversationId,
      json.senderId,
      json.content,
      new Date(json.sentAt),
      json.isRead,
    );
  }
}
