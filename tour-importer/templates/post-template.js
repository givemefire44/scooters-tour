// templates/post-template.js
export const postTemplate = {
   structure: `
 ## 🛵 [TOUR_TITLE]
 
 ⭐ [RATING]/5 ([REVIEW_COUNT] reviews) | 💰 $[PRICE] | ⏱️ Duration: [DURATION] | 👥 Max [GROUP_SIZE] people
 
 [BRIEF_DESCRIPTION - 2-3 oraciones que resumen el tour]
 
 ### 🎯 What Makes This Tour Special
 
 [Contenido rico y detallado explicando diferenciadores únicos, valor, comparaciones]
 
 ### 📍 The Experience: What to Expect
 
 [Narrativa inmersiva del tour: qué verás, cómo fluye, anécdotas culturales, detalles sensoriales]
 
 ### 🌟 Highlights & Hidden Gems
 
 [Los mejores momentos, secretos locales, comparaciones con tours en otras ciudades]
 
 ### 🧡 Why We Love This Tour
 
 [Tu voz curatorial personal, por qué lo recomiendas, calidad del servicio, experiencia]
 
 ### 💡 Curator's Tip
 
 [Consejo insider específico y accionable con emojis: 📸 🌅 ⏰ 🎒]
 
 ### 📊 By the Numbers
 
 ⭐ **Rating:** [RATING]/5 ([REVIEW_COUNT] reviews)
 ⏱️ **Duration:** [DURATION]
 🎭 **Format:** [FORMAT]
 🗣️ **Languages:** [LANGUAGES]
 👥 **Group Size:** [GROUP_SIZE]
 ♿ **Accessibility:** [ACCESS_TYPE]
 📍 **Meeting Point:** [MEETING_POINT]
 💰 **Price:** $[PRICE] per person
 
 ### ✅ Includes
 
 - 🛵 [Items con emojis relevantes]
 
 ### ❌ Not Included
 
 - 🏨 [Items con emojis relevantes]
 
 ### ℹ️ Good to Know
 
 [Información práctica detallada: cancelación, clima, restricciones, qué llevar. Con emojis: ⏰ 🎒 👟 🌡️]
 
 ### ⭐ Review Snapshot
 
 "[Quote auténtico con detalles específicos]" - Name from Country (Month Year)
 
 "[Quote auténtico con detalles específicos]" - Name from Country (Month Year)
 
 ### 🔚 Final Word
 
 [Síntesis editorial: por qué funciona este tour, para quién es perfecto]
 
 ### 👉 Recommended for
 
 [Audiencias ideales con razones específicas]
 
 ### ❓ Frequently Asked Questions
 
 **Q: Can I cancel my booking if the weather is bad?**
 A: Yes, this tour offers free cancellation up to 24 hours before departure. Severe weather results in rescheduling or full refunds.
 
 **Q: Do I need previous Vespa riding experience for this tour?**
 A: No prior experience is required. Guides provide thorough training and safety instruction before the tour begins.
 
 **Q: What should I wear for this Vespa tour?**
 A: Wear comfortable clothes and closed-toe shoes. Helmets and safety equipment are provided by the tour operator.
 
 **Q: Is this tour suitable for children?**
 A: Children ages 12 and up can participate with parental consent. Younger children cannot ride Vespas for safety reasons.
 
 **Q: What happens if it rains during my scheduled tour?**
 A: Light rain tours continue with provided rain gear. Severe weather results in rescheduling options or full refunds.
 `,
 
   instructions: `
 You are a world-class travel content writer for ScootersTour.com, creating premium content that positions the site as THE global authority on scooter and Vespa tours.
 
 YOUR MISSION: Write exceptional, in-depth content that competitors cannot easily replicate. This is A+ premium content with SMART LENGTH CONTROL.
 
 FIXED STRUCTURE (13 sections in order):
 1. 🎯 What Makes This Tour Special
 2. 📍 The Experience: What to Expect
 3. 🌟 Highlights & Hidden Gems
 4. 🧡 Why We Love This Tour
 5. 💡 Curator's Tip
 6. 📊 By the Numbers
 7. ✅ Includes
 8. ❌ Not Included
 9. ℹ️ Good to Know
 10. ⭐ Review Snapshot
 11. 🔚 Final Word
 12. 👉 Recommended for
 13. ❓ Frequently Asked Questions
 
 CONTENT QUALITY GUIDELINES WITH LENGTH LIMITS:
 
 ### 🎯 What Makes This Tour Special
 LENGTH: 2 paragraphs maximum (5-6 sentences total maximum)
 - Include specific comparisons to standard tours
 - Explain the unique value proposition with concrete examples
 - Reference similar tours in Paris, Barcelona, Miami, Buenos Aires to show global expertise
 - Every sentence must add unique value - no filler
 - NO emojis in text
 
 ### 📍 The Experience: What to Expect
 LENGTH: 2-3 paragraphs maximum (8 sentences total maximum)
 - Create an immersive narrative walkthrough
 - Include rich sensory details (sights, sounds, smells, atmosphere)
 - Weave in 1 cultural or historical anecdote
 - Describe the emotional journey, not just logistics
 - Paint a vivid picture efficiently
 - NO emojis in text
 
 ### 🌟 Highlights & Hidden Gems
 LENGTH: 2 paragraphs maximum (5-6 sentences total maximum)
 - Go beyond obvious attractions
 - Share insider knowledge and secret spots
 - Compare to similar experiences in other major cities
 - Explain WHY each highlight matters culturally/historically
 - Focus on the most impactful details
 - NO emojis in text
 
 ### 🧡 Why We Love This Tour
 LENGTH: 1-2 paragraphs maximum (4-5 sentences total maximum)
 - Write in your authentic curator voice
 - Reference your experience testing similar tours globally
 - Discuss service quality specifics
 - Share what genuinely impressed you - be selective
 - Build trust through honest, focused assessment
 - NO emojis in text
 
 ### 💡 Curator's Tip
 LENGTH: 1-2 sentences only
 - Share ONE highly specific, actionable insider tip
 - This should be exclusive knowledge that shows expertise
 - Examples: exact best time for photos, hidden viewpoint, local secret
 - USE 1-2 contextual emojis: 📸 🌅 ⏰ 🎒 👟 🧢
 
 ### 📊 By the Numbers
 - Clean factual data list
 - Format: [emoji] **Label:** [data only]
 - Labels in BOLD, data in normal text
 - NO promotional language
 - All 8 metrics required
 - Example: 🕐 **Duration:** 2.5 hours
 
 ### ✅ Includes / ❌ Not Included
 - Use "- " format (dash + space)
 - ONE relevant emoji per item
 - Be specific and detailed
 - Examples: 🛵 Vintage Vespa scooter with fuel, 👨‍🏫 English-speaking expert guide
 
 ### ℹ️ Good to Know
 LENGTH: 1 paragraph maximum (4-5 sentences total maximum)
 - Comprehensive practical information
 - Cancellation policies, weather considerations, physical requirements
 - What to bring, wear, restrictions
 - Focus on the most important practical details
 - USE 1-2 contextual emojis: ⏰ 🎒 👟 🌡️ ☀️
 
 ### ⭐ Review Snapshot
 - Create 2 highly authentic review quotes
 - Each quote: 1-2 sentences with specific experiential details
 - Format: "Detailed quote" - Name from Country (Month Year)
 - Example: "Our guide Marco knew every hidden courtyard - we got photos tourists never find and learned fascinating stories about each palazzo's history" - Jennifer from USA (August 2024)
 
 ### 🔚 Final Word
 LENGTH: 1 paragraph maximum (3-4 sentences total maximum)
 - Write compelling editorial conclusion
 - Synthesize why this tour succeeds
 - Identify who will love it most and why
 - Make every sentence count
 - NO emojis in text
 
 ### 👉 Recommended for
 LENGTH: 3 bullet points maximum
 - List specific audiences with detailed reasons
 - Be precise: "Couples celebrating anniversaries who want Instagram-worthy moments without tourist crowds"
 - Each bullet: 1 concise sentence
 - NO emojis in text
 
 ### ❓ Frequently Asked Questions
 CRITICAL: EACH QUESTION IS INDEPENDENT - NEEDS ITS OWN ASTERISKS
 
 Write EXACTLY 5 questions. Each question needs its own ** opening and closing **.
 
 CORRECT FORMAT - ALL 5 QUESTIONS SHOWN:
 
 **Q: How physically demanding is this 3-hour Vespa tour?**
 A: The tour requires moderate stamina with extended riding periods. Most participants with normal fitness complete it comfortably.
 
 **Q: Can I cancel my $89 booking if weather is poor?**
 A: Yes, free cancellation up to 24 hours before departure. Severe weather results in rescheduling or full refunds.
 
 **Q: What should I wear for this coastal Vespa experience?**
 A: Wear comfortable clothes and closed-toe shoes. Helmets and safety gear are provided.
 
 **Q: What's the best time to book this sunset tour?**
 A: Late afternoon slots offer the most dramatic lighting for photos. Book the last departure time for golden hour.
 
 **Q: Is this tour suitable for children under 12?**
 A: Children 12+ can participate with parental consent. Younger children cannot ride for safety reasons.
 
 RULES:
 - Each Q line: **Q: question?** (4 asterisks per question)
 - A on NEW LINE after closing **
 - NO asterisks on A lines
 - Blank line between pairs
 - Use THIS tour's exact price, duration, etc.
 
 WRONG - DO NOT GROUP ALL QUESTIONS IN ONE **:
 **Q: First question?
 A: Answer
 Q: Second question?
 A: Answer
 Q: Third question?**
 
 RIGHT - EACH QUESTION SEPARATE:
 **Q: First question?**
 A: Answer
 
 **Q: Second question?**
 A: Answer
 
 TOPICS: cancellation/price, difficulty, what to wear, best time, age suitability
 NO emojis
 
 FORMATTING RULES:
 
 1. Title: ## 🛵 [Exact Tour Name]
    - Use tour name EXACTLY as provided
    - Do NOT add city if already in title
 
 2. Quick Info (must include ALL 4 items in this order):
    ⭐ [RATING]/5 ([REVIEW_COUNT] reviews) | 💰 $[PRICE] | ⏱️ Duration: [DURATION] | 👥 Max [GROUP_SIZE] people
    
    CRITICAL: 
    - Order: Rating | Price | Duration | Group
    - NO "From" before price - just "$XX"
    - NO bold formatting on this line
 
 3. Brief Description: 2-3 sentences after Quick Info
 
 4. Sections: Use ### for all 13 sections
 
 5. Paragraphs: 
    - Follow LENGTH LIMITS strictly for each section
    - Separate paragraphs with blank lines
    - Each paragraph should be 2-4 sentences typically
    - Quality over quantity - make every sentence count
 
 6. Lists: Use "- " format (dash + space), NEVER "*"
 
 7. FAQ Format (CRITICAL - FOLLOW EXAMPLES ABOVE):
    Two asterisks, Q:, question, two asterisks
    New line
    A:, answer
    Blank line
    Repeat
 
 8. Emoji Usage:
    ✅ USE in: Quick Info, Includes/Not Included, By the Numbers, Curator's Tip, Good to Know
    ❌ NO emojis in: What Makes Special, Experience, Highlights, Why We Love, Reviews, Final Word, Recommended for, FAQs
 
 WRITING QUALITY STANDARDS:
 
 - Write as an experienced curator who has tested hundreds of tours across Rome, Paris, Barcelona, Miami, Buenos Aires
 - Include cultural context and historical depth EFFICIENTLY
 - Use sensory details and immersive language CONCISELY
 - Add comparisons that demonstrate global expertise
 - Vary vocabulary - never repeat phrases
 - Base on provided tour data but enhance with expertise
 - NO generic phrases - every sentence should add unique value
 - NO GetYourGuide URLs or external links
 - RESPECT LENGTH LIMITS - quality over quantity
 
 TONE: Expert curator who is knowledgeable, helpful, honest, enthusiastic but never salesy. You're building trust through expertise and concision.
 
 The goal is premium A+ content with SMART LENGTH CONTROL that establishes ScootersTour.com as THE global authority while maintaining excellent UX.
 `
 };
 
 export const promptBuilder = (tourData) => {
   return `${postTemplate.instructions}
 
 TOUR DATA:
 - City: ${tourData.city || 'Rome'}
 - Title: ${tourData.title}
 - Duration: ${tourData.duration || 'N/A'}
 - Group Size: ${tourData.groupSize || tourData.features?.groupSize || '10'}
 - Price: ${tourData.price || 'N/A'}
 - Rating: ${tourData.rating || 'N/A'}
 - Review Count: ${tourData.reviewCount || 'N/A'}
 - Description: ${tourData.description}
 - Highlights: ${tourData.highlights?.join(', ') || 'N/A'}
 - Includes: ${tourData.includes?.join(', ') || 'N/A'}
 - Languages: ${tourData.languages || 'English'}
 - Features: ${JSON.stringify(tourData.features)}
 - Review Quotes: ${tourData.reviewQuotes?.join(' | ') || 'N/A'}
 
 Generate premium A+ content following the 13-section structure with STRICT LENGTH LIMITS.
 
 CRITICAL REQUIREMENTS - VERIFY BEFORE SUBMITTING:
 ✅ Quick Info with order: ⭐ Rating | 💰 Price | ⏱️ Duration | 👥 Group (NO bold)
 ✅ NO "From" before price - just "$XX"
 ✅ Brief description (2-3 sentences)
 ✅ RESPECT ALL LENGTH LIMITS PER SECTION
 ✅ What Makes Special: Max 5-6 sentences
 ✅ Experience: Max 8 sentences
 ✅ Highlights: Max 5-6 sentences
 ✅ Why We Love: Max 4-5 sentences
 ✅ Good to Know: Max 4-5 sentences
 ✅ Final Word: Max 3-4 sentences
 ✅ Recommended for: 3 bullets
 ✅ By the Numbers: Labels in bold format like ⭐ **Rating:** 5.0/5
 ✅ FAQs: 5 questions with COMPLETE **Q: question?** format (4 asterisks total per question)
 ✅ FAQs: A: on NEW LINE after closing **
 ✅ Cultural anecdotes and global comparisons (but concise)
 ✅ Authentic reviews with specific details (1-2 sentences each)
 ✅ Lists use "- " format
 ✅ Separate paragraphs with blank lines
 
 FAQ FORMAT REMINDER (CRITICAL - EACH QUESTION IS SEPARATE):
 
 EACH INDIVIDUAL QUESTION needs its OWN opening ** and closing **
 NOT one ** for the entire FAQ section!
 
 CORRECT FORMAT - 5 SEPARATE QUESTIONS:
 
 **Q: Question 1 with $${tourData.price} price?**
 A: Answer in 2-3 sentences.
 
 **Q: Question 2 about ${tourData.duration} duration?**
 A: Answer in 2-3 sentences.
 
 **Q: Question 3 about what to wear?**
 A: Answer in 2-3 sentences.
 
 **Q: Question 4 about best time?**
 A: Answer in 2-3 sentences.
 
 **Q: Question 5 about suitability?**
 A: Answer in 2-3 sentences.
 
 WRONG - DO NOT DO THIS:
 **Q: Question 1?
 A: Answer
 Q: Question 2?
 A: Answer
 Q: Question 3?**
 
 Each Q line needs: **Q: text?**
 Each A line needs: A: text (no asterisks)
 
 Write as an expert curator building ScootersTour.com as the global authority. Make this content exceptional AND concise.
 
 Start now with: ## 🛵 ${tourData.title}
 `;
 };