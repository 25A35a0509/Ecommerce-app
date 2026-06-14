/**
 * Email notification service.
 *
 * In production, configure SMTP credentials via environment variables
 * (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) and this will send
 * real emails using nodemailer. If credentials are not configured
 * (e.g. in local development), emails are simply logged to the console
 * so the rest of the application flow is not blocked.
 */

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null; // no email configured - fall back to console logging
  }

  // Lazy-import nodemailer only if email is actually configured,
  // so it's not a hard dependency for local development.
  const nodemailer = await import('nodemailer');

  transporter = nodemailer.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Sends an email or logs it to the console if SMTP is not configured.
 * @param {{ to: string, subject: string, html: string }} options
 */
export const sendEmail = async ({ to, subject, html }) => {
  const t = await getTransporter();

  if (!t) {
    console.log('--- EMAIL (dev mode, not actually sent) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log('--------------------------------------------');
    return;
  }

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

/**
 * Sends an order confirmation email after a successful checkout.
 */
export const sendOrderConfirmationEmail = async (user, order) => {
  const itemsHtml = order.orderItems
    .map(
      (item) =>
        `<li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
    )
    .join('');

  const html = `
    <h2>Thanks for your order, ${user.name}!</h2>
    <p>Your order <strong>#${order._id}</strong> has been placed successfully.</p>
    <ul>${itemsHtml}</ul>
    <p><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
    <p>We'll notify you when your order ships.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id}`,
    html,
  });
};

/**
 * Sends an email when an order's status changes (e.g. shipped, delivered).
 */
export const sendOrderStatusEmail = async (user, order) => {
  const html = `
    <h2>Order Update</h2>
    <p>Hi ${user.name}, your order <strong>#${order._id}</strong> status has been updated to:</p>
    <h3>${order.orderStatus.toUpperCase()}</h3>
  `;

  await sendEmail({
    to: user.email,
    subject: `Order #${order._id} - Status: ${order.orderStatus}`,
    html,
  });
};
