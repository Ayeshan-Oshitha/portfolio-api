import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Env } from '../config/env.js';

type ContactNotification = {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
};

// Escape user text before putting it into HTML.
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly from: string;
  private readonly notifyTo: string;

  constructor(config: ConfigService<Env, true>) {
    this.resend = new Resend(config.get('RESEND_API_KEY', { infer: true }));
    this.from = config.get('RESEND_FROM', { infer: true });
    this.notifyTo = config.get('CONTACT_NOTIFY_TO', { infer: true });
  }

  // Email the owner about a new contact message; returns false instead of throwing on failure.
  async sendContactNotification(msg: ContactNotification): Promise<boolean> {
    const subject = `New message from ${msg.name}${msg.subject ? ` – ${msg.subject}` : ''}`;
    const html = `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
      ${msg.subject ? `<p><strong>Subject:</strong> ${escapeHtml(msg.subject)}</p>` : ''}
      <p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p>
    `;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: this.notifyTo,
      replyTo: msg.email,
      subject: subject.slice(0, 200),
      html,
      text: `${msg.name} <${msg.email}>\n\n${msg.message}`,
    });

    if (error) {
      this.logger.error(`Contact email failed: ${error.message}`);
      return false;
    }
    return true;
  }
}
