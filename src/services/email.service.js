import nodemailer from "nodemailer";

 class EmailService {
  constructor() {
    this.emailUser = process.env.EMAIL_USER;
    this.emailPass = process.env.EMAIL_PASS;
    this.emailFrom = process.env.EMAIL_FROM || `"My App" <${this.emailUser}>`;

    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: this.emailUser,
        pass: this.emailPass,
      },
    });
  }

  
  async sendOtp(to, otp) {
    const subject = "Your OTP Code";
    const text = `Your OTP code is: ${otp} .This code will expire in 10 minutes. `;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <h2>OTP Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2d89ef;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    try {
      const info = await this.transporter.sendMail({
        from: this.emailFrom,
        to,
        subject,
        text,
        html,
      });

      console.log(`✅ OTP email sent to ${to} (Message ID: ${info.messageId})`);
      return info;
    } catch (error) {
      console.error("❌ Failed to send OTP email:", error.message);
      throw error;
    }
  }
}

export default new EmailService()