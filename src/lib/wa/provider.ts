export interface WAProvider {
  sendMessage(to: string, text: string): Promise<void>;
}

export class TwilioWA implements WAProvider {
  private client: any;
  private from: string;
  constructor(opts: { accountSid: string; authToken: string; from: string }) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = require("twilio");
    this.client = twilio(opts.accountSid, opts.authToken);
    this.from = opts.from;
  }
  async sendMessage(to: string, text: string) {
    await this.client.messages.create({ from: this.from, to, body: text });
  }
}
