const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email using the Resend API
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} html - The HTML content of the email
 * @returns {Promise<any>} - The response from the Resend API
 */
const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not defined. Email will not be sent.');
            return;
        }

        const data = await resend.emails.send({
            from: 'SHO App <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html,
        });

        console.log(`Email sent successfully to ${to}`);
        return data;
    } catch (error) {
        console.error('Error sending email via Resend:', error.message);
        throw error;
    }
};

module.exports = { sendEmail };
