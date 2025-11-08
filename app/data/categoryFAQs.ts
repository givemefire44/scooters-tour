// app/data/categoryFAQs.ts

export interface FAQItem {
    question: string;
    answer: string;
  }
  
  export const getCategoryFAQs = (categoryTitle: string): FAQItem[] => [
    {
      question: `How much do ${categoryTitle} tours cost?`,
      answer: `${categoryTitle} tours typically range from $20 for basic skip-the-line access to $95 for comprehensive experiences with underground and arena access. All tours include priority entry and expert English-speaking guides.`
    },
    {
      question: "What's included in the tours?",
      answer: "Tours include skip-the-line entry, professional guide, headsets for groups, and access to main areas. Premium tours add underground chambers, arena floor access, and smaller group sizes (10-15 people max)."
    },
    {
      question: "How long are the tours?",
      answer: "Standard tours last 2-3 hours covering the main arena and upper levels. Underground tours run 3-4 hours including restricted areas. Express tours take 1.5-2 hours focusing on highlights."
    },
    {
      question: "Can I skip the line?",
      answer: "Yes. All tours on this page include skip-the-line access via priority gates. You'll enter in 10-15 minutes instead of waiting 2+ hours in the general queue. Security screening still required for all visitors."
    },
    {
      question: "Are tours available in English?",
      answer: "Yes. All featured tours offer English-speaking guides. Many tours also provide Spanish, French, German, Portuguese, and other languages. Check individual tour details for specific language availability."
    }
  ];