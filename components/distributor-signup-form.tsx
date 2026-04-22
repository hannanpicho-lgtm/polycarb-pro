'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  distributorSignupSchema,
  type DistributorSignupForm,
  businessTypeOptions,
  volumeOptions,
  countryList,
} from '@/lib/distributor-validation';
import { distributorPromoMarkApplicationSubmitted } from '@/lib/distributor-promo';

interface DistributorSignupFormProps {
  onSuccess: () => void;
  onError?: (error: string) => void;
}

export function DistributorSignupFormComponent({ onSuccess, onError }: DistributorSignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DistributorSignupForm>({
    resolver: zodResolver(distributorSignupSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      jobTitle: '',
      businessType: undefined,
      countries: [],
      estimatedAnnualVolume: undefined,
      email: '',
      phone: '',
      message: '',
    },
  });

  const handleCountryToggle = (country: string) => {
    setSelectedCountries((prev) => {
      const next = prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country];
      // Keep react-hook-form in sync so Zod validation sees the current selection
      setValue('countries', next, { shouldValidate: true });
      return next;
    });
  };

  const filteredCountries = countryList.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const onSubmit = async (data: DistributorSignupForm) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/distributor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // countries is now part of validated data
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((result as { error?: string }).error || 'Submission failed');
      }

      distributorPromoMarkApplicationSubmitted();
      reset();
      setSelectedCountries([]);
      setValue('countries', []);
      onSuccess();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Row 1: Full Name & Company Name */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-bold text-slate-900 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('fullName')}
            type="text"
            id="fullName"
            placeholder="John Smith"
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500 font-semibold">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-bold text-slate-900 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('companyName')}
            type="text"
            id="companyName"
            placeholder="Your Company Ltd."
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-500 font-semibold">{errors.companyName.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: Job Title & Business Type */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-bold text-slate-900 mb-2">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            {...register('jobTitle')}
            type="text"
            id="jobTitle"
            placeholder="Sales Director"
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          />
          {errors.jobTitle && (
            <p className="mt-1 text-sm text-red-500 font-semibold">{errors.jobTitle.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-bold text-slate-900 mb-2">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('businessType')}
            id="businessType"
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          >
            <option value="">Select business type...</option>
            {businessTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-500 font-semibold">{errors.businessType.message}</p>
          )}
        </div>
      </div>

      {/* Row 3: Email & Phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-2">
            Business Email <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder="john@company.com"
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-slate-900 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('phone')}
            type="tel"
            id="phone"
            placeholder="+1 (555) 123-4567"
            className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Countries - Multi-select */}
      <div>
        <label htmlFor="countries" className="block text-sm font-bold text-slate-900 mb-2">
          Countries/Territories <span className="text-red-500">*</span>
        </label>
        <div className="mb-3 rounded-lg border-2 border-slate-200 bg-white p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all hover:border-slate-300">
          <input
            type="text"
            id="countries"
            placeholder="Search countries..."
            value={countrySearch}
            onChange={(e) => setCountrySearch(e.target.value)}
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none mb-3 font-semibold"
          />
          <div className="max-h-40 overflow-y-auto space-y-2 border-t border-slate-200 pt-3">
            {filteredCountries.map((country) => (
              <label key={country} className="flex items-center gap-2 cursor-pointer hover:bg-blue-50 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country)}
                  onChange={() => handleCountryToggle(country)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-slate-700 font-medium">{country}</span>
              </label>
            ))}
          </div>
        </div>
        {selectedCountries.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedCountries.map((country) => (
              <span
                key={country}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-900"
              >
                {country}
                <button
                  type="button"
                  onClick={() => handleCountryToggle(country)}
                  className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.countries && (
          <p className="mt-1 text-sm text-red-500 font-semibold">{errors.countries.message}</p>
        )}
      </div>

      {/* Estimated Annual Volume */}
      <div>
        <label htmlFor="volume" className="block text-sm font-bold text-slate-900 mb-2">
          Estimated Annual Volume <span className="text-red-500">*</span>
        </label>
        <select
          {...register('estimatedAnnualVolume')}
          id="volume"
          className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-slate-300"
        >
          <option value="">Select estimated volume...</option>
          {volumeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.estimatedAnnualVolume && (
          <p className="mt-1 text-sm text-red-500 font-semibold">{errors.estimatedAnnualVolume.message}</p>
        )}
      </div>

      {/* Optional Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-bold text-slate-900 mb-2">
          Additional Message <span className="text-slate-500 font-normal">(Optional)</span>
        </label>
        <textarea
          {...register('message')}
          id="message"
          rows={3}
          placeholder="Tell us about your distribution network, experience, or specific interests..."
          className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none hover:border-slate-300"
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-500 font-semibold">{errors.message.message}</p>
        )}
      </div>

      {/* Submit Button - BOLD */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white font-black text-lg py-4 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
      >
        {isSubmitting ? '⏳ Securing Your Spot...' : '🚀 Secure My Distributor Spot'}
      </Button>

      {/* Legal note */}
      <p className="text-xs text-slate-500 text-center leading-relaxed">
        By submitting, you agree to be contacted by Covestro about partnership opportunities. We respect your privacy and never share your information.
      </p>
    </form>
  );
}
