const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

router.post('/', (req, res) => {
  const { message, subject, recipient } = req.body;

  async function main() {
    let transporter = nodemailer.createTransport({
      host: 'smtp.dreamhost.com',
      port: 465,
      secure: true,
      auth: {
        user: 'evan@epoint.io',
        pass: '3045Sarah',
      },
    });

    let info = await transporter.sendMail({
      from: '"Tyler" <evan@epoint.io>',
      to: `${recipient}`,
      subject: `${subject}`,
      html: `${message}`,
    });

    console.log({ 'Message sent: %s': info.messageId });
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    res.send({ message: 'Email has been sent successfully' });
  }

  main().catch(console.error);
});

module.exports = router;
