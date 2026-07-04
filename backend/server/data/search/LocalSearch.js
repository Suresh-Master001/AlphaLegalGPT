import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { GlobalHistory } from '../data/models/GlobalHistory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'to', 'in', 'for', 'it', 'if', 'this', 'that', 'with', 'by', 'of', 'how', 'what', 'where']);

/**
 * Tokenize and normalize a string
 */
const getTokens = (str) => {
  if (!str) return [];
  return str.toLowerCase()
    .replace(/[^\w\s]|_/g, "")
    .split(/\s+/)
    .filter(token => token.length >= 2 && !stopWords.has(token)); // Changed to >= 2 to include "IPC", "FIR", "420", etc.
};

/**
 * Calculate similarity score based on word intersection
 */
const calculateScore = (queryTokens, targetStr) => {
  if (!targetStr) return 0;
  const targetTokens = new Set(getTokens(targetStr));
  if (targetTokens.size === 0) return 0;
  
  let intersection = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) {
      intersection++;
    }
  }
  return intersection / Math.max(queryTokens.length, targetTokens.size);
};

export class LocalSearch {
    /**
     * Get template-based response for common legal document requests
     */
    static getTemplateResponse(query) {
        const queryLower = query.toLowerCase();
        
        // Rental Agreement Template
        if (queryLower.includes('rental') || queryLower.includes('rent agreement') || 
            queryLower.includes('lease') || queryLower.includes('rental agreement')) {
            return {
                answer: `RENTAL AGREEMENT TEMPLATE

This Rental Agreement is made on [Date] between:

LANDLORD: [Landlord Name], residing at [Landlord Address]

TENANT: [Tenant Name], residing at [Tenant Address]

PROPERTY: [Full address of the rental property]

TERMS AND CONDITIONS:

1. RENT: Monthly rent of [Amount in INR (₹)] payable on or before the 5th day of each month.

2. SECURITY DEPOSIT: [Amount] refundable deposit payable before occupancy.

3. DURATION: This agreement is valid for [11 months / 1 year] starting from [Start Date] to [End Date].

4. MAINTENANCE: Tenant responsible for [day-to-day maintenance / all repairs], Landlord responsible for [structural repairs].

5. UTILITIES: Electricity and water charges to be borne by [Tenant / Landlord].

6. TERMINATION: Either party may terminate this agreement with [30 days] written notice.

7. RESTRICTIONS: Tenant shall not sublet, make alterations, or use property for illegal purposes.

8. NOTICE PERIOD: [30 days] notice required for vacating the premises.

Signed and accepted by both parties:

Landlord Signature: _______________ Date: _______
Tenant Signature: _______________ Date: _______

Witness 1: _______________ Witness 2: _______________

Note: This is a basic template. Consult a lawyer for legally binding agreements and registration as per local laws.`,
                source: 'Template',
                score: 1
            };
        }

        // Legal Notice Template
        if (queryLower.includes('legal notice') || queryLower.includes('consumer complaint') ||
            queryLower.includes('notice template')) {
            return {
                answer: `LEGAL NOTICE TEMPLATE (Consumer Complaint)

From: [Your Full Name]
Address: [Your Complete Address]
Phone: [Your Contact Number]
Email: [Your Email]

Date: [Date]

To: [Recipient Name/Company Name]
Address: [Recipient Complete Address]

SUBJECT: LEGAL NOTICE FOR [Specific Issue - e.g., DEFECTIVE PRODUCT / NON-REFUND / SERVICE DEFICIENCY]

Dear Sir/Madam,

I/We, [Your Name], hereby serve this legal notice with the following facts:

1. On [Date], I purchased [Product/Service details] from you for [Amount] (Invoice No. [Number]).

2. The product/service [describe the problem - e.g., was found defective / was not as described / service was not rendered properly].

3. I/We attempted to resolve this issue informally on [Date(s) of communication] but received [no response / unsatisfactory response].

4. This amounts to deficiency in service / unfair trade practice under the Consumer Protection Act, 2019.

DEMAND:
I/We hereby demand:
a) Refund of [Amount] within 15 days of receiving this notice
OR
b) Replacement of the defective product/service
c) Compensation of [Amount] for mental agony/inconvenience

TAKE NOTICE that if you fail to comply with the above demand within the stipulated time, I/We will be constrained to initiate appropriate legal proceedings under the Consumer Protection Act, 2019, and you shall be liable for all costs, consequences, and damages.

This notice is issued without prejudice to any other rights and remedies available to me/us.

Yours faithfully,

[Your Signature]
[Your Name]

Copy kept for reference.

Note: Send this notice via registered post with acknowledgment due and keep copies of all communications.`,
                source: 'Template',
                score: 1
            };
        }

        // Affidavit Template
        if (queryLower.includes('affidavit') || queryLower.includes('sworn statement')) {
            return {
                answer: `AFFIDAVIT TEMPLATE

IN THE COURT OF [Court Name/Designation]
[Case Reference if applicable]

I, [Your Full Name], aged [Age] years, son/daughter of [Father's Name], residing at [Full Address], do hereby solemnly affirm and declare as under:

1. I am the [plaintiff/defendant/witness] in the above-mentioned case and I am well acquainted with the facts of the case.

2. [State facts sequentially and clearly - numbered paragraphs recommended]

3. [Continue with relevant facts]

4. That the facts stated above are true and correct to the best of my knowledge and belief. No part of this affidavit is false or misleading.

VERIFICATION:

I verify that the contents of this affidavit are true and correct. No part of it is false and no material information has been concealed there from.

Solemnly affirmed and signed at [Place] on this [Date].

Signature: _______________
Name: [Your Full Name]

Before me:

Notary Public / Oath Commissioner
[Signature and Seal]
Registration No.: [Number]`,
                source: 'Template',
                score: 1
            };
        }

        // Power of Attorney Template
        if (queryLower.includes('power of attorney') || queryLower.includes('poa') ||
            queryLower.includes('authorization letter')) {
            return {
                answer: `POWER OF ATTORNEY TEMPLATE

GENERAL/SPECIFIC POWER OF ATTORNEY

Know all men by these presents that I/We, [Name(s) of Principal(s)], aged [Age] years, son/daughter/wife of [Parent/Spouse Name], residing at [Address], do hereby appoint and constitute [Name of Attorney Holder], aged [Age] years, son/daughter of [Parent's Name], residing at [Attorney's Address] as my/our true and lawful attorney.

POWERS GRANTED:
[Specify powers - General Power of Attorney covers all matters, Special Power of Attorney is limited to specific tasks]

1. [Specify specific powers if Special POA - e.g., sale of property at XYZ address, managing bank accounts, etc.]

2. For General Power of Attorney, this includes: managing properties, handling financial affairs, legal proceedings, signing documents, etc.

TERMS:
- This Power of Attorney shall remain valid from [Start Date] to [End Date] or until revoked.
- I/We reserve the right to revoke this Power of Attorney at any time with written notice.
- The Attorney Holder shall act in good faith and in my/our best interests.

IN WITNESS WHEREOF, I/We have hereunto set my/our hand(s) on this [Date] at [Place].

Principal(s) Signature: _______________
Name: [Your Name]

ATTORNEY HOLDER ACKNOWLEDGMENT:

I, [Attorney Name], accept the above appointment and agree to act in accordance with the terms specified.

Attorney Holder Signature: _______________

WITNESSES:

1. Name: _______________ Address: _______________ Signature: _______________

2. Name: _______________ Address: _______________ Signature: _______________

Note: Register this document at the Sub-Registrar office for immovable property transactions.`,
                source: 'Template',
                score: 1
            };
        }

        return null;
    }

    /**
     * Search for a similar question in global history
     */
    static async findInHistory(query) {
        const history = await GlobalHistory.getAll();
        const queryTokens = getTokens(query);
        if (queryTokens.length === 0) return null;

        let bestMatch = null;
        let maxScore = 0;

        for (const item of history) {
            const score = calculateScore(queryTokens, item.question);
            // Threshold for match - 0.2 is quite loose but helpful for natural language
            if (score > maxScore && score > 0.2) { 
                maxScore = score;
                bestMatch = item;
            }
        }
        return bestMatch ? { ...bestMatch, source: 'History', score: maxScore } : null;
    }

    /**
     * Perform global local search across history and templates
     */
    static async search(query, language) {
        const isTamil = language === 'ta' || language === 'tamil';
        
        // First, try history (exact or similar Q&A matches)
        const historyMatch = await this.findInHistory(query);
        
        if (historyMatch) {
            return historyMatch;
        }

        // Second, try template-based responses
        const templateResponse = this.getTemplateResponse(query);
        
        if (templateResponse) {
            return templateResponse;
        }

        return {
            answer: isTamil 
                ? "மன்னிக்கவும், தற்காலிக ஆஃப்லைன் முறையில் இதற்கு என்னால் பதில் கிடைக்கவில்லை. உங்கள் இணையத்தைப் பார்க்கவும்." 
                : "I could not find a previous response for your question in our offline database. Please check your internet connection.",
            source: 'Offline Fallback',
            score: 0
        };
    }
}
