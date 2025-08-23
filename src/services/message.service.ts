

class MessageService {
  private messages: string[] = [];

  addMessage(message: string): void {
    this.messages.push(message);
  }

  getMessages(): string[] {
    return this.messages;
  }

  clearMessages(): void {
    this.messages = [];
  }
}
