const mailer = require("nodemailer");
const smtp = require("nodemailer-smtp-transport");
module.exports = {
    sendEmail: async function(to, subject, text, more={}) {
        const transport = mailer.createTransport(
            smtp({
                host: 'smtp.gmail.com',
                port: 465,
                auth: {
                    user: process.env.GMAIL_ADDRESS,
                    pass: process.env.GMAIL_PASS,
                },
            })
        );

        let message = {
            from: '"NC Hack" team@nchack.org',
            to: to.map(u => `"${u.global.name}" ${u.global.email}`).join(", "),
            subject: subject,
            text: text,
            html: `<h1>This is the top</h1><br>${text}<br><h1>This is the bottom</h1>`
        };

        Object.keys(more).forEach(k => message[k] = more[k]);

        transport.sendMail(message, (err, info) => {
            if (err) console.log(err);
        });
    }
};
