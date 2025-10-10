const { Resend } = require('resend');

const resend = new Resend('re_NN3LVXm5_7uMDUdam7UQuJPKFthkAkxip');

async function sendEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ListUp <noreply@listup.ng>',
      to: 'benedictnnaoma0@gmail.com',
      subject: 'Welcome to ListUp!',
      html: '<p>Thanks for joining us!</p>',
    });

    if (error) {
      console.error('Resend Error:', error);
    } else {
      console.log('Email sent successfully:', data);
    }
  } catch (err) {
    console.error('Unexpected Error:', err);
  }
}

sendEmail();
