'use client'

import { useAppTranslation } from '@/hooks/useAppTranslation'

interface FAQ {
  question: string
  answer: string
}

/**
 * FAQ Section Component
 * Displays frequently asked questions with JSON-LD schema for rich snippets
 */
export function FAQSection() {
  const { t } = useAppTranslation()
  
  // Get FAQs from translations
  const faqs: FAQ[] = [
    {
      question: t('seo.faq.q1.question'),
      answer: t('seo.faq.q1.answer')
    },
    {
      question: t('seo.faq.q2.question'),
      answer: t('seo.faq.q2.answer')
    },
    {
      question: t('seo.faq.q3.question'),
      answer: t('seo.faq.q3.answer')
    },
    {
      question: t('seo.faq.q4.question'),
      answer: t('seo.faq.q4.answer')
    },
    {
      question: t('seo.faq.q5.question'),
      answer: t('seo.faq.q5.answer')
    }
  ]

  // Generate FAQ Schema for Google Rich Results
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Visual FAQ */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details 
            key={index} 
            className="group bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              <span>{faq.question}</span>
              <svg 
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </>
  )
}
