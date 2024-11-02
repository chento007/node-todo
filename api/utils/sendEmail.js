const nodemail = require("nodemailer")

const sendMail = async options => {

    const transporter = nodemail.createTransport({
        host: process.env.SMTP_MAIL_HOST,
        port: process.env.SMTP_MAIL_PORT,
        auth: {
            user: process.env.SMTP_MAIL_FROM_MAIL,
            pass: process.env.SMTP_MAIL_PASSWORD,
        }
    })

    const message = {
        form: `${process.env.SMTP_MAIL_FROM_NAME} <${process.env.SMTP_MAIL_FROM_MAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
    }

    await transporter.sendMail(message)

}

module.exports = sendMail;