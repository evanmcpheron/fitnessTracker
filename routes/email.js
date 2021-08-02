const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

// @route    POST api/email
// @desc     Sends an email from admin email ()
// @access   Private

// TODO: EXPAND TO HAVE MORE FLUID FUNCTIONALITY
router.post('/', (req, res) => {
  const { sentFrom, message, subject, recipient } = req.body;

  async function main() {

    // Setting up the connection for what sends the email
    let transporter = nodemailer.createTransport({
      host: 'smtp.dreamhost.com',
      port: 465,
      secure: true,
      auth: {
        user: 'evan@epoint.io',
        pass: '0114Ashley!',
      },
    });

    // This is the info that is being sent.
    let info = await transporter.sendMail({
      // sentFrom is what will be displayed that the recipient will see.
      from: `${sentFrom}`,
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
