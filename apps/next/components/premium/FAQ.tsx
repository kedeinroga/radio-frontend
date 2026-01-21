/**
 * FAQ Component
 * 
 * Frequently Asked Questions about Premium subscription.
 */

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface FAQItem {
  questionKey: string
  answerKey: string
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useAppTranslation()

  const FAQ_ITEMS: FAQItem[] = [
    {
      questionKey: 'premium.faq.trial.question',
      answerKey: 'premium.faq.trial.answer',
    },
    {
      questionKey: 'premium.faq.cancel.question',
      answerKey: 'premium.faq.cancel.answer',
    },
    {
      questionKey: 'premium.faq.payment.question',
      answerKey: 'premium.faq.payment.answer',
    },
    {
      questionKey: 'premium.faq.changePlan.question',
      answerKey: 'premium.faq.changePlan.answer',
    },
    {
      questionKey: 'premium.faq.taxes.question',
      answerKey: 'premium.faq.taxes.answer',
    },
    {
      questionKey: 'premium.faq.multiDevice.question',
      answerKey: 'premium.faq.multiDevice.answer',
    },
    {
      questionKey: 'premium.faq.data.question',
      answerKey: 'premium.faq.data.answer',
    },
    {
      questionKey: 'premium.faq.student.question',
      answerKey: 'premium.faq.student.answer',
    },
  ]

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {FAQ_ITEMS.map((item, index) => (
        <div
          key={index}
          className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <span className="font-semibold pr-4">{t(item.questionKey)}</span>
            <ChevronDown
              className={`shrink-0 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
              size={20}
            />
          </button>
          {openIndex === index && (
            <div className="px-4 pb-4 text-neutral-600 dark:text-neutral-400">
              {t(item.answerKey)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
