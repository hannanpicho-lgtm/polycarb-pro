'use client';

import { Star, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    quote: 'Covestro PC materials have been critical to our automotive light-weighting strategy. Their technical support team is exceptional.',
    author: 'Sarah Chen',
    role: 'Materials Engineer',
    company: 'Global Automotive Supplier',
    rating: 5,
  },
  {
    quote: 'We trust SABIC Lexan for high-security applications. The consistency and quality are unmatched in the industry.',
    author: 'Michael Rodriguez',
    role: 'Product Development Lead',
    company: 'Security Systems Manufacturer',
    rating: 5,
  },
  {
    quote: 'Medical-grade polycarbonate is non-negotiable. This supplier provides the documentation and certifications we need.',
    author: 'Dr. James Patterson',
    role: 'Chief Technology Officer',
    company: 'Medical Device Company',
    rating: 5,
  },
  {
    quote: 'The technical advisory service has saved us thousands in material waste and processing optimization.',
    author: 'Lisa Thompson',
    role: 'Manufacturing Manager',
    company: 'Precision Plastics',
    rating: 5,
  },
];

const stats = [
  {
    value: '25+',
    label: 'Years Industry Experience',
    icon: CheckCircle,
  },
  {
    value: '500+',
    label: 'Enterprise Clients',
    icon: CheckCircle,
  },
  {
    value: '40+',
    label: 'Countries Served',
    icon: CheckCircle,
  },
  {
    value: '98%',
    label: 'Customer Satisfaction',
    icon: CheckCircle,
  },
];

const certifications = [
  { name: 'ISO 9001', desc: 'Quality Management' },
  { name: 'ISO 14001', desc: 'Environmental' },
  { name: 'IATF 16949', desc: 'Automotive Quality' },
  { name: 'FDA Registered', desc: 'Medical Grade' },
];

export function SocialProof() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-0">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
              TRUSTED BY INDUSTRY LEADERS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Leading Companies Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From automotive manufacturers to medical device companies, enterprises rely on our materials and expertise.
            </p>
          </div>

          {/* Testimonial Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm font-medium text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 md:px-0 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center">
                  <Icon className="w-12 h-12 text-blue-200 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 px-4 md:px-0">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Certified & Compliant
            </h2>
            <p className="text-lg text-gray-600">
              Meeting the highest standards across industries
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 text-center hover:shadow-md transition"
              >
                <div className="text-2xl font-bold text-blue-900 mb-2">{cert.name}</div>
                <div className="text-sm text-blue-700">{cert.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badge Section */}
      <section className="py-16 px-4 md:px-0 bg-gray-100">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Preferred Partner of Leading Manufacturers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              'Automotive',
              'Medical Devices',
              'Construction',
              'Electronics',
              'Aerospace',
              'Security',
            ].map((industry) => (
              <div
                key={industry}
                className="px-4 py-6 bg-white rounded-lg border border-gray-300 text-center text-sm font-medium text-gray-700"
              >
                ✓ {industry}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
