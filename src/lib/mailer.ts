import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
    }
});


interface MailOptions {
    to: string;
    subject: string;
    html: string;
}
export const sendEmail = async (options: MailOptions & { replyTo?: string }) => {
    const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || process.env.MAIL_SENDER,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true
    } catch (error) {
        console.error('Error sending email:', error);
        return false
    }
};
