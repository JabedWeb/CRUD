import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendMail(
    to: string,
    subject: string,
    html: string,
    attachments?: any[],
  ) {
    return this.transporter.sendMail({
      from: '"Bookstore API" <no-reply@bookstore.com>',
      to,
      subject,
      html,
      attachments,
    });
  }
}
