
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, AnalysisType, AdvancedOptions, UrlAdvancedOptions, EmailAdvancedOptions } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ["SAFE", "SUSPICIOUS", "DANGEROUS"],
      description: "The final verdict on the security risk."
    },
    overallScore: {
      type: Type.NUMBER,
      description: "A score from 0 (safe) to 100 (dangerous)."
    },
    analysis: {
      type: Type.ARRAY,
      description: "A detailed breakdown of the security checks performed.",
      items: {
        type: Type.OBJECT,
        properties: {
          check: {
            type: Type.STRING,
            description: "The name of the security check."
          },
          description: {
            type: Type.STRING,
            description: "A brief explanation of the findings for this check."
          },
          score: {
            type: Type.NUMBER,
            description: "A risk score from 0 to 100 for this specific check."
          }
        },
        required: ["check", "description", "score"]
      }
    }
  },
  required: ["verdict", "overallScore", "analysis"]
};

const generatePrompt = (type: AnalysisType, content: string, options: AdvancedOptions = {}): string => {
  const commonInstruction = `You are a world-class cybersecurity expert specializing in phishing detection. Your goal is to analyze user-submitted content to identify potential threats. Provide a clear verdict and a detailed, structured breakdown of your findings.`;

  if (type === 'url') {
    const urlOptions = options as UrlAdvancedOptions;
    let prompt = `${commonInstruction}\nAnalyze the following URL for phishing indicators: ${content}.`;

    let context = [];
    if (urlOptions.simulationMode) {
      context.push(`The analysis should be performed as if the request is coming from a **${urlOptions.simulationMode}** device.`);
    }
    if (urlOptions.countryCode && urlOptions.countryCode.trim()) {
       context.push(`The analysis should be performed as if the request is originating from the country with code: **${urlOptions.countryCode.trim().toUpperCase()}**.`);
    }
    if(context.length > 0) {
      prompt += `\n\n**Analysis Context**:\n${context.join('\n')}`;
    }

    prompt += `\n\nYour analysis MUST include the following specific checks in the detailed breakdown:
1.  **Threat Intelligence & Blacklists**: Cross-reference the URL against multiple real-time threat intelligence databases and public blacklists (e.g., Google Safe Browsing, PhishTank) for known malicious URLs, domains, and phishing kits.
2.  **URL Structure Analysis**: Scrutinize the URL for typosquatting, subdomaining attacks, misleading characters (e.g., homoglyphs), excessive length, or suspicious parameters.
3.  **Domain & WHOIS Analysis**: Analyze the domain's registration date and expiration. Simulate a WHOIS lookup to check for red flags like very recent registration or use of privacy protection services on a supposed corporate site.
4.  **SSL/TLS Certificate Validation**: Validate the SSL/TLS certificate's issuer, validity period, and type (DV, OV, EV). Check for use of basic DV certificates on sensitive login pages, which is a common tactic for phishing sites.
5.  **Redirection Chain Analysis**: Trace the full redirection path from the initial URL. Report on the number of hops and the final destination, flagging any attempts at cloaking or redirection to unexpected domains.
6.  **On-Page Content Analysis**: Simulate a scan of the landing page's content. Look for suspicious elements like password input fields, cloned login forms, urgent or threatening language, and mismatched branding (e.g., using a known company's logo on an unrelated domain).
7.  **Certificate Transparency Log Analysis**: Simulate a check of Certificate Transparency (CT) logs for the domain. Note any unusual issuance activity, such as multiple certificates being issued in a short period, which could indicate an impending attack or a compromised domain.
8.  **Visual Content Analysis (Screenshot Simulation)**: Describe the visual elements of the landing page as if you were looking at a screenshot. Mention the logo, color scheme, presence of login forms, and overall branding consistency. Identify any visual cues that suggest it's a clone of a legitimate site.

Provide a definitive risk assessment based on these comprehensive checks.`;
    return prompt;
  } else { // 'email' type
    const emailOptions = options as EmailAdvancedOptions;
    let prompt = `${commonInstruction}\nAnalyze the following email content (including headers if provided) for phishing indicators: ${content}.

Your analysis MUST include the following specific checks in the detailed breakdown, simulating the verification process where direct lookups are not possible:
1.  **Sender Authentication (SPF Record Analysis)**: Simulate a check of the Sender Policy Framework (SPF) record for the sender's domain (from the 'From' header). Determine if the sending IP address is authorized to send emails for that domain. Note any failures ('Fail'), soft failures ('SoftFail'), or misconfigurations.
2.  **Email Integrity (DKIM Signature Analysis)**: Verify the DomainKeys Identified Mail (DKIM) signature in the email headers. Report whether the signature is valid, indicating that the email has not been tampered with in transit.
3.  **Domain Policy (DMARC Record Analysis)**: Simulate a lookup of the Domain-based Message Authentication, Reporting, and Conformance (DMARC) record for the sender's domain. Analyze its policy (e.g., 'p=reject', 'p=quarantine', 'p=none') and how the email aligns with it based on the SPF and DKIM results.
4.  **Header Analysis**: Examine the email headers for signs of spoofing, unusual routing (e.g., many hops through unexpected servers), or inconsistencies between 'From', 'Reply-To', and 'Return-Path' headers.
5.  **Content and Language Analysis**: Scan the email body for suspicious language (e.g., urgency, threats), grammatical errors, and deceptive elements.`;

    if (emailOptions.extractAllLinks) {
        prompt += `\n6.  **Comprehensive Link Extraction & Analysis**: Extract every single URL from the email body, including those in anchor text, plain text, and from behind URL shorteners. Analyze each unique link for phishing indicators and summarize the collective risk they present.`;
    } else {
        prompt += `\n6.  **Link Analysis**: Scan for deceptive links (e.g., URL shorteners, mismatched anchor text and href).`;
    }

    prompt += `\n\nProvide a definitive risk assessment based on these comprehensive checks.`;
    return prompt;
  }
};

export const performAnalysis = async (type: AnalysisType, content: string, options?: AdvancedOptions): Promise<AnalysisResult> => {
  try {
    const prompt = generatePrompt(type, content, options);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Validate the parsed object to match AnalysisResult
    if (result && typeof result.verdict === 'string' && typeof result.overallScore === 'number' && Array.isArray(result.analysis)) {
      return result as AnalysisResult;
    } else {
      throw new Error("Invalid response structure from API");
    }

  } catch (error) {
    console.error("Error performing analysis with Gemini API:", error);
    throw new Error("Failed to get analysis from AI. The API might be overloaded or the response was malformed.");
  }
};

let chat: Chat | null = null;

export const getChatbotResponse = async (message: string, history: {role: "user" | "model", parts: {text: string}[]}[]): Promise<string> => {
  if (!chat) {
    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction: 'You are a friendly and helpful cybersecurity assistant for the PhishGuard AI app. Your name is GuardBot. Keep your answers concise and relevant to cybersecurity, phishing, and online safety. After answering the user\'s primary question, occasionally and proactively offer a short, useful security tip. Make it feel natural, not forced.',
      },
    });
  }
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error getting chat response from Gemini API:", error);
    // Reset chat session on error
    chat = null;
    throw new Error("Failed to get response from AI assistant.");
  }
};