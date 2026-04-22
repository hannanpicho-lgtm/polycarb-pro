import { z } from 'zod';

export const distributorSignupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  companyName: z.string().min(3, 'Company name must be at least 3 characters').max(100),
  jobTitle: z.string().min(2, 'Job title required').max(100),
  businessType: z.enum(['importer', 'distributor', 'fabricator', 'reseller', 'other'], {
    errorMap: () => ({ message: 'Please select a business type' }),
  }),
  countries: z.array(z.string()).min(1, 'Please select at least one country'),
  estimatedAnnualVolume: z.enum(['under-10t', '10-50t', '50-100t', '100t+'], {
    errorMap: () => ({ message: 'Please select an estimated volume' }),
  }),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  message: z.string().max(500, 'Message must be under 500 characters').optional(),
});

export type DistributorSignupForm = z.infer<typeof distributorSignupSchema>;

export const businessTypeOptions = [
  { value: 'importer', label: 'Importer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'fabricator', label: 'Fabricator / Converter' },
  { value: 'reseller', label: 'Reseller' },
  { value: 'other', label: 'Other' },
];

export const volumeOptions = [
  { value: 'under-10t', label: 'Under 10 tonnes/year' },
  { value: '10-50t', label: '10-50 tonnes/year' },
  { value: '50-100t', label: '50-100 tonnes/year' },
  { value: '100t+', label: '100+ tonnes/year' },
];

export const countryList = [
  'United States',
  'Canada',
  'Mexico',
  'United Kingdom',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Belgium',
  'Sweden',
  'Switzerland',
  'Poland',
  'Japan',
  'China',
  'India',
  'Australia',
  'South Africa',
  'Brazil',
  'Argentina',
  'Other',
];
