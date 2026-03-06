const fetch = require('cross-fetch');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'projectshaca@gmail.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'SHO App';

/**
 * Sends an email using the Brevo (Sendinblue) API
 * @param {string|string[]} to - Recipient email(s)
 * @param {string} subject - Subject line
 * @param {string} html - HTML body
 */
const sendEmail = async (to, subject, html) => {
    if (!BREVO_API_KEY) {
        console.warn('BREVO_API_KEY is not defined. Email will not be sent.');
        return;
    }

    // Normalise to array of { email } objects
    const toList = Array.isArray(to)
        ? to.map(t => (typeof t === 'string' ? { email: t } : t))
        : [{ email: to }];

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: { name: BREVO_SENDER_NAME, email: BREVO_SENDER_EMAIL },
            to: toList,
            subject,
            htmlContent: html
        })
    });

    if (!response.ok) {
        const err = await response.text();
        console.error('Brevo email error:', err);
        throw new Error(`Brevo: ${err}`);
    }

    console.log(`Email sent via Brevo to: ${toList.map(t => t.email).join(', ')}`);
    return response.json();
};

module.exports = { sendEmail };

