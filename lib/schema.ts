import { z } from 'zod';

export const quoteRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(1, 'Company name is required').max(100),
  phone: z.string().optional(),
  product: z.string().min(1, 'Please specify the product of interest'),
  quantity: z.string().optional(),
  message: z.string().min(10, 'Please provide more detail (min. 10 characters)').max(2000),
  leadSource: z.string().max(100).optional(),
  compareSlugs: z.string().max(300).optional(),
  compareNames: z.string().max(800).optional(),
  compareOnlyDiff: z.enum(['0', '1']).optional(),
  sourcePath: z.string().max(1200).optional(),
  landingPath: z.string().max(1200).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
  gclid: z.string().max(200).optional(),
  msclkid: z.string().max(200).optional(),
  fbclid: z.string().max(300).optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms to proceed' }),
  }),
});

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
  leadSource: z.string().max(100).optional(),
  compareSlugs: z.string().max(300).optional(),
  compareNames: z.string().max(800).optional(),
  compareOnlyDiff: z.enum(['0', '1']).optional(),
  sourcePath: z.string().max(1200).optional(),
  landingPath: z.string().max(1200).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
  gclid: z.string().max(200).optional(),
  msclkid: z.string().max(200).optional(),
  fbclid: z.string().max(300).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
