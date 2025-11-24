// app/data/categoryFAQs.ts

export interface FAQItem {
    question: string;
    answer: string;
  }
  
  export const getCategoryFAQs = (categoryTitle: string): FAQItem[] => [
    {
      question: `How much do ${categoryTitle} cost?`,
      answer: `${categoryTitle} typically range from $80 for 2-hour city tours to $180 for full-day countryside experiences. All tours include scooter/Vespa rental, helmet, insurance, fuel, and expert English-speaking guides. Premium tours add professional photography and gourmet food stops.`
    },
    {
      question: "What's included in scooter tours?",
      answer: "Tours include Vespa or scooter rental, helmet, insurance coverage, fuel, professional guide, and route planning. Many tours add extras like photo stops, gelato breaks, local restaurant visits, or professional photography packages. All safety equipment provided."
    },
    {
      question: "Do I need a license to ride a scooter in Rome?",
      answer: "Yes. You need a valid driver's license to drive a scooter. For scooters under 125cc, a standard car license works in most countries. For larger bikes, a motorcycle endorsement may be required. Don't have a license? Choose sidecar tours where you ride as a passenger."
    },
    {
      question: "How long are the scooter tours?",
      answer: "City tours typically run 2-3 hours covering Rome's iconic landmarks and hidden neighborhoods. Half-day tours last 4-5 hours including countryside routes. Full-day adventures run 6-8 hours exploring surrounding areas like Tivoli or the Appian Way."
    },
    {
      question: "Is it safe to ride a scooter in Rome?",
      answer: "Yes, with proper guidance. All tours provide safety briefings, quality helmets, and experienced guides who know the safest routes. Guides lead the way and navigate traffic. Tours avoid rush hours and stick to scooter-friendly streets. First-time riders welcome on beginner-friendly routes."
    },
    {
      question: "Are tours available in English?",
      answer: "Yes. All featured tours offer English-speaking guides. Many tours also provide Spanish, French, German, and Italian language options. Check individual tour details for specific language availability and guide expertise."
    },
    {
      question: "Can I ride as a passenger instead of driving?",
      answer: "Absolutely! Sidecar tours and tandem scooter options let you enjoy the experience without driving. Perfect for non-licensed riders, nervous beginners, or anyone who prefers to focus on sightseeing while a professional handles the scooter."
    },
    {
      question: "What should I wear for a scooter tour?",
      answer: "Wear comfortable, weather-appropriate clothing and closed-toe shoes (no sandals or flip-flops). Bring sunglasses and sunscreen for sunny days. In cooler months, layer up—riding creates wind chill. Helmets are always provided. Avoid loose scarves or clothing that could get caught."
    }
  ];