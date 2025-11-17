import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

// Initialize AI clients
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

// Get system prompt (generic, doesn't reveal which AI is being used)
function getSystemPrompt(language) {
  return `You are an expert code reviewer and security analyst. Analyze the following ${language} code and provide:

1. **Security Vulnerabilities**: Identify potential security issues (SQL injection, XSS, authentication flaws, etc.)
2. **Performance Issues**: Detect inefficient code patterns and suggest optimizations
3. **Code Quality**: Identify code smells, poor practices, and maintainability issues
4. **Refactoring Suggestions**: Provide specific refactoring recommendations with improved code examples

IMPORTANT: Do NOT mention your name, model, or provider in your response. Focus only on the code analysis.

Respond in the following JSON format:
{
  "summary": "Brief overview of the code quality",
  "severity": "low|medium|high|critical",
  "vulnerabilities": [
    {
      "type": "vulnerability type",
      "severity": "low|medium|high|critical",
      "line": line_number,
      "description": "detailed description",
      "recommendation": "how to fix it"
    }
  ],
  "optimizations": [
    {
      "type": "performance|readability|maintainability",
      "line": line_number,
      "issue": "what's wrong",
      "suggestion": "how to improve"
    }
  ],
  "refactoring": {
    "shouldRefactor": true|false,
    "suggestions": ["list of refactoring suggestions"],
    "improvedCode": "complete refactored version of the code (if applicable)"
  }
}

Be specific with line numbers and provide actionable recommendations.`;
}

// Analyze code using Claude (with thinking enabled)
async function analyzeWithClaude(code, language) {
  if (!anthropic) {
    throw new Error('Claude API key not configured');
  }

  const prompt = getSystemPrompt(language);
  const codePrompt = `${prompt}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

  const enableThinking = process.env.ENABLE_CLAUDE_THINKING === 'true';
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929';

  const messageParams = {
    model: model,
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: codePrompt
      }
    ]
  };

  // Enable thinking mode if configured
  if (enableThinking) {
    messageParams.thinking = {
      type: 'enabled',
      budget_tokens: 5000
    };
  }

  const message = await anthropic.messages.create(messageParams);

  // Extract the text response (skip thinking blocks)
  let responseText = '';
  for (const block of message.content) {
    if (block.type === 'text') {
      responseText += block.text;
    }
    // Skip thinking blocks - they're internal reasoning
  }

  return parseAnalysisResponse(responseText);
}

// Analyze code using OpenAI (GPT-4, GPT-3.5)
async function analyzeWithOpenAI(code, language) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = getSystemPrompt(language);
  const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: `Code to analyze:\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ],
    temperature: 0.3,
    max_tokens: 4000
  });

  const responseText = completion.choices[0].message.content;
  return parseAnalysisResponse(responseText);
}

// Analyze code using Google Gemini
async function analyzeWithGemini(code, language) {
  if (!genAI) {
    throw new Error('Google API key not configured');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = getSystemPrompt(language);
  const fullPrompt = `${prompt}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const responseText = response.text();

  return parseAnalysisResponse(responseText);
}

// Analyze code using Deepseek (OpenAI-compatible API)
async function analyzeWithDeepseek(code, language) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('Deepseek API key not configured');
  }

  const prompt = getSystemPrompt(language);
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: model,
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: `Code to analyze:\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ],
    temperature: 0.3,
    max_tokens: 4000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    }
  });

  const responseText = response.data.choices[0].message.content;
  return parseAnalysisResponse(responseText);
}

// Analyze code using Kimi (Moonshot AI - OpenAI-compatible API)
async function analyzeWithKimi(code, language) {
  if (!process.env.KIMI_API_KEY) {
    throw new Error('Kimi API key not configured');
  }

  const prompt = getSystemPrompt(language);
  const model = process.env.KIMI_MODEL || 'moonshot-v1-128k';

  const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
    model: model,
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: `Code to analyze:\n\`\`\`${language}\n${code}\n\`\`\``
      }
    ],
    temperature: 0.3,
    max_tokens: 4000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.KIMI_API_KEY}`
    }
  });

  const responseText = response.data.choices[0].message.content;
  return parseAnalysisResponse(responseText);
}

// Parse AI response and extract JSON
function parseAnalysisResponse(responseText) {
  let analysis;
  try {
    // Remove markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;
    analysis = JSON.parse(jsonText);
  } catch (parseError) {
    // If JSON parsing fails, create a structured response
    analysis = {
      summary: responseText,
      severity: 'medium',
      vulnerabilities: [],
      optimizations: [],
      refactoring: {
        shouldRefactor: false,
        suggestions: [],
        improvedCode: null
      }
    };
  }

  return analysis;
}

// Main function to analyze code with selected provider
export async function analyzeCode(code, language = 'javascript', provider = null) {
  try {
    // Use provided provider or default from env
    const aiProvider = provider || process.env.DEFAULT_AI_PROVIDER || 'claude';

    console.log(`Analyzing code with ${aiProvider}...`);

    let analysis;

    switch (aiProvider.toLowerCase()) {
      case 'claude':
        analysis = await analyzeWithClaude(code, language);
        break;

      case 'openai':
      case 'gpt':
        analysis = await analyzeWithOpenAI(code, language);
        break;

      case 'gemini':
      case 'google':
        analysis = await analyzeWithGemini(code, language);
        break;

      case 'deepseek':
        analysis = await analyzeWithDeepseek(code, language);
        break;

      case 'kimi':
      case 'moonshot':
        analysis = await analyzeWithKimi(code, language);
        break;

      default:
        throw new Error(`Unsupported AI provider: ${aiProvider}`);
    }

    return analysis;
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}

// Get list of available providers
export function getAvailableProviders() {
  const providers = [];

  if (process.env.ANTHROPIC_API_KEY) providers.push('claude');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.GOOGLE_API_KEY) providers.push('gemini');
  if (process.env.DEEPSEEK_API_KEY) providers.push('deepseek');
  if (process.env.KIMI_API_KEY) providers.push('kimi');

  return providers;
}
