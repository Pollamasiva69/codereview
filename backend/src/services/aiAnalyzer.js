import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeCode(code, language = 'javascript') {
  try {
    const prompt = `You are an expert code reviewer and security analyst. Analyze the following ${language} code and provide:

1. **Security Vulnerabilities**: Identify potential security issues (SQL injection, XSS, authentication flaws, etc.)
2. **Performance Issues**: Detect inefficient code patterns and suggest optimizations
3. **Code Quality**: Identify code smells, poor practices, and maintainability issues
4. **Refactoring Suggestions**: Provide specific refactoring recommendations with improved code examples

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract the text response
    const responseText = message.content[0].text;

    // Try to parse JSON from the response
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
  } catch (error) {
    console.error('AI Analysis error:', error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
}
