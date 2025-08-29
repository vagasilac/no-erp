export interface WAProvider {
  sendMessage(to: string, text: string): Promise<void>;
}

export class TwilioProvider implements WAProvider {
  constructor(private from: string, private sid: string, private token: string) {}
  async sendMessage(to: string, text: string) {
    // TODO: call Twilio REST API
    console.log('Twilio send', { to, text });
  }
}

// TODO: MessageBird/Infobip EU implementations
