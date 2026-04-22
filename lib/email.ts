import { Resend } from 'resend';
import { DistributorSignupForm } from '@/lib/distributor-validation';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@covestroppc.com';
const TO_EMAIL = process.env.RESEND_TO_EMAIL || 'distributors@covestroppc.com';

export async function sendDistributorConfirmationEmail(data: DistributorSignupForm) {
  const subject = '✅ Your Covestro Distributor Application – What\'s Next?';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #f9fafb; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { background: white; padding: 30px 20px; }
          .step { margin: 20px 0; padding: 15px; background: #f3f4f6; border-left: 4px solid #3b82f6; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Received! 🎉</h1>
            <p>Thank you for your interest in joining Covestro</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${data.fullName}</strong>,</p>
            
            <p>We've received your distributor application and are excited about the possibility of partnering with <strong>${data.companyName}</strong>!</p>
            
            <h3>What Happens Next:</h3>
            
            <div class="step">
              <strong>📋 Step 1: Application Review (24-48 hours)</strong>
              <p>Our partnership team is reviewing your application to ensure alignment with Covestro standards.</p>
            </div>
            
            <div class="step">
              <strong>📞 Step 2: Initial Call</strong>
              <p>A Covestro representative will contact you at <strong>${data.phone}</strong> or <strong>${data.email}</strong> to discuss partnership opportunities and answer your questions.</p>
            </div>
            
            <div class="step">
              <strong>🤝 Step 3: Agreement & Onboarding</strong>
              <p>If both parties are aligned, we'll proceed with partnership agreements and provide full product training, pricing, and support.</p>
            </div>
            
            <h3>In the Meantime:</h3>
            <ul>
              <li><a href="https://covestroppc.com/products">Explore our complete product catalog</a></li>
              <li><a href="https://covestroppc.com/resources">Review technical resources and guides</a></li>
              <li><a href="https://covestroppc.com/about">Learn more about Covestro</a></li>
            </ul>
            
            <p><strong>Questions?</strong> Reply to this email or contact us at +1 (713) 555-0172</p>
            
            <p>Best regards,<br><strong>The Covestro Partnership Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 Covestro PC. All rights reserved.</p>
            <p>You're receiving this because you submitted a distributor application.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html: htmlContent,
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send distributor confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendDistributorNotificationEmail(data: DistributorSignupForm & { countries: string[] }) {
  const subject = `🚀 New Distributor Application: ${data.companyName}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: monospace; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; background: #f9fafb; padding: 20px; }
          .header { background: #1e3a8a; color: white; padding: 20px; border-radius: 6px 6px 0 0; }
          .content { background: white; padding: 20px; border-radius: 0 0 6px 6px; }
          .field { margin: 15px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #1e3a8a; }
          .value { margin-top: 5px; }
          .priority { background: #fef3c7; padding: 10px; border-radius: 4px; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📌 New Distributor Application Received</h2>
          </div>
          
          <div class="content">
            <div class="priority">
              <strong>⚠️ Action Required:</strong> Review and follow up within 24 hours
            </div>
            
            <h3>Applicant Information:</h3>
            
            <div class="field">
              <div class="label">Full Name:</div>
              <div class="value">${data.fullName}</div>
            </div>
            
            <div class="field">
              <div class="label">Company Name:</div>
              <div class="value">${data.companyName}</div>
            </div>
            
            <div class="field">
              <div class="label">Job Title:</div>
              <div class="value">${data.jobTitle}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value"><a href="tel:${data.phone}">${data.phone}</a></div>
            </div>
            
            <div class="field">
              <div class="label">Business Type:</div>
              <div class="value">${data.businessType}</div>
            </div>
            
            <div class="field">
              <div class="label">Target Countries/Territories:</div>
              <div class="value">${data.countries.join(', ')}</div>
            </div>
            
            <div class="field">
              <div class="label">Estimated Annual Volume:</div>
              <div class="value">${data.estimatedAnnualVolume}</div>
            </div>
            
            ${data.message ? `
              <div class="field">
                <div class="label">Additional Message:</div>
                <div class="value">${data.message}</div>
              </div>
            ` : ''}
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Review the application details above</li>
              <li>Assess fit with Covestro partnership criteria</li>
              <li>Contact applicant within 24 hours</li>
              <li>Log outcome in CRM/database</li>
            </ol>
            
            <p style="background: #f0f9ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
              <strong>💡 Tip:</strong> This is submission #<timestamp>${Date.now()}</timestamp>. Keep records organized for follow-up tracking.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html: htmlContent,
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send distributor notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendContactConfirmationEmail(email: string, name: string) {
  const subject = '✅ We Received Your Message';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 6px 6px 0 0; }
          .content { background: white; padding: 30px 20px; border-radius: 0 0 6px 6px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Message Received! 📬</h1>
          </div>
          
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <p>Thank you for reaching out to Covestro. We've received your message and appreciate your interest.</p>
            
            <p>Our team will review your inquiry and get back to you as soon as possible – typically within 24 business hours.</p>
            
            <p>In the meantime, feel free to explore our <a href="https://covestroppc.com/products">product catalog</a> or <a href="https://covestroppc.com/resources">technical resources</a>.</p>
            
            <p>Best regards,<br><strong>Covestro Team</strong></p>
          </div>
          
          <div class="footer">
            <p>© 2026 Covestro PC. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
    });

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send contact confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
