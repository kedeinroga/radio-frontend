'use client'

import { useAppTranslation } from '@/hooks/useAppTranslation'

interface FAQ {
  question: string
  answer: string
}

/**
 * FAQ accordion — Late Night FM aesthetic.
 * Uses native <details>/<summary> for accessibility + zero JS.
 * JSON-LD schema preserved for Google Rich Results.
 */
export function FAQSection() {
  const { t } = useAppTranslation()

  const faqs: FAQ[] = [
    { question: t('seo.faq.q1.question'), answer: t('seo.faq.q1.answer') },
    { question: t('seo.faq.q2.question'), answer: t('seo.faq.q2.answer') },
    { question: t('seo.faq.q3.question'), answer: t('seo.faq.q3.answer') },
    { question: t('seo.faq.q4.question'), answer: t('seo.faq.q4.answer') },
    { question: t('seo.faq.q5.question'), answer: t('seo.faq.q5.answer') },
  ]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="
              group
              bg-white/[0.04] hover:bg-white/[0.06]
              border border-white/[0.06] hover:border-white/[0.10]
              open:border-amber-500/20 open:bg-white/[0.05]
              rounded-xl overflow-hidden
              transition-colors duration-200
            "
          >
            <summary
              className="
                flex items-center justify-between gap-4
                px-5 py-4 cursor-pointer list-none
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset
              "
            >
              <span className="font-display text-sm font-semibold text-neutral-200 group-open:text-amber-400 transition-colors leading-snug">
                {faq.question}
              </span>

              {/* Chevron — rotates when open */}
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full border border-white/[0.10] group-open:border-amber-500/30 flex items-center justify-center transition-all duration-200"
                aria-hidden="true"
              >
                <svg
                  className="w-2.5 h-2.5 text-neutral-600 group-open:text-amber-500 group-open:rotate-180 transition-all duration-200"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </span>
            </summary>

            <div className="px-5 pb-5 pt-1">
              <div className="w-full h-px bg-white/[0.06] mb-4" aria-hidden="true" />
              <p className="font-broadcast text-[11px] text-neutral-500 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </>
  )
}
