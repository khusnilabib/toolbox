// src/shared/lib/tool-content.ts — Structured content model for each tool.
// Sprint 14 Phase 1 — Every tool becomes a knowledge hub.
// This data is used to render rich SEO content on tool pages.

export interface ToolExample {
  input: string;
  output: string;
  explanation: string;
}

export interface ToolContent {
  slug: string;
  introduction: string;
  whatItDoes: string;
  whyUseIt: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  stepByStep: string[];
  examples: ToolExample[];
  bestPractices: string[];
  commonMistakes: string[];
  limitations: string[];
  privacyStatement: string;
}

export const toolContent: Record<string, ToolContent> = {
  'case-converter': {
    slug: 'case-converter',
    introduction: 'The Case Converter is a browser-based text transformation tool that instantly converts text between multiple casing conventions. It supports UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. All processing happens locally in your browser — no text is ever uploaded to a server.',
    whatItDoes: 'This tool takes any input text and transforms it into your selected casing style. It handles Unicode characters, preserves line breaks, and processes text of any length up to 10 MB.',
    whyUseIt: 'Developers, writers, and content creators frequently need to convert text between casing styles. Whether you are naming variables, formatting headings, or cleaning up imported data, this tool saves time and eliminates manual editing errors.',
    features: [
      '8 casing styles: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case',
      'Unicode-safe — handles emojis and international characters',
      'Preserves line breaks and paragraph structure',
      'No upload — all processing in your browser',
      'Supports up to 10 MB of text',
      'Instant results with copy and download',
    ],
    benefits: [
      'Save time on manual text formatting',
      'Ensure consistent naming conventions in code',
      'Convert headings and titles instantly',
      'No data leaves your device — fully private',
      'Works offline once loaded',
    ],
    useCases: [
      'Converting variable names from snake_case to camelCase',
      'Formatting article headlines to Title Case',
      'Creating URL slugs in kebab-case',
      'Generating constant names in UPPER_CASE',
      'Cleaning up data imported from spreadsheets',
    ],
    stepByStep: [
      'Enter or paste your text in the input field',
      'Select the desired casing mode from the dropdown',
      'Click "Run Tool" to convert',
      'Copy the result or download it as a text file',
    ],
    examples: [
      { input: 'hello world', output: 'HELLO WORLD', explanation: 'UPPER CASE converts all characters to uppercase.' },
      { input: 'Hello World', output: 'hello world', explanation: 'lower case converts all characters to lowercase.' },
      { input: 'hello world', output: 'Hello World', explanation: 'Title Case capitalizes the first letter of each word.' },
      { input: 'hello world', output: 'helloWorld', explanation: 'camelCase lowercases the first word and capitalizes subsequent words.' },
      { input: 'hello world', output: 'HelloWorld', explanation: 'PascalCase capitalizes the first letter of every word.' },
      { input: 'Hello World', output: 'hello-world', explanation: 'kebab-case joins words with hyphens, all lowercase.' },
    ],
    bestPractices: [
      'Use camelCase for JavaScript variable names',
      'Use PascalCase for TypeScript interfaces and classes',
      'Use snake_case for Python variables and database columns',
      'Use kebab-case for URLs and CSS class names',
      'Use UPPER_CASE for constants and environment variables',
    ],
    commonMistakes: [
      'Using Title Case for code identifiers (use camelCase or PascalCase instead)',
      'Mixing casing styles within the same codebase',
      'Forgetting that Sentence case only capitalizes the first letter of sentences',
    ],
    limitations: [
      'Maximum input size is 10 MB',
      'Does not detect language-specific capitalization rules',
      'Title Case uses a simple algorithm — some words like "the" and "of" may be capitalized',
    ],
    privacyStatement: 'All text conversion happens entirely in your browser. Your text is never uploaded, stored, or transmitted to any server.',
  },
  'word-counter': {
    slug: 'word-counter',
    introduction: 'The Word Counter is a browser-based text analysis tool that counts words, characters, sentences, paragraphs, and lines in real-time. It also estimates reading and speaking time. All processing happens locally — no text is uploaded.',
    whatItDoes: 'This tool analyzes your text and provides comprehensive statistics including word count, character count (with and without spaces), sentence count, paragraph count, line count, and estimated reading time based on 200 words per minute.',
    whyUseIt: 'Writers, students, and professionals need accurate word counts for essays, articles, reports, and social media posts. This tool provides instant, accurate counts without requiring any software installation or account creation.',
    features: [
      'Word count with accurate splitting',
      'Character count with and without spaces',
      'Sentence and paragraph detection',
      'Line count',
      'Estimated reading time (200 WPM)',
      'Real-time updates as you type',
    ],
    benefits: [
      'Meet word count requirements for essays and articles',
      'Estimate reading time for blog posts',
      'Track writing progress',
      'No data leaves your browser',
    ],
    useCases: [
      'Checking essay word counts for school assignments',
      'Estimating reading time for blog posts',
      'Counting characters for Twitter/X posts',
      'Analyzing text density for SEO',
    ],
    stepByStep: [
      'Paste or type your text in the input field',
      'Click "Run Tool" to analyze',
      'View detailed statistics including words, characters, sentences, and reading time',
      'Copy or download the results',
    ],
    examples: [
      { input: 'The quick brown fox', output: '4 words, 19 characters', explanation: 'Counts each space-separated token as a word.' },
      { input: 'Hello! How are you?', output: '3 sentences, 4 words', explanation: 'Sentences are detected by punctuation (. ! ?).' },
    ],
    bestPractices: [
      'Use for SEO content to ensure optimal length (300+ words for articles)',
      'Check reading time to ensure content is not too long or too short',
      'Use character count without spaces for social media limits',
    ],
    commonMistakes: [
      'Confusing word count with character count',
      'Not accounting for hyphenated words (counted as one word)',
    ],
    limitations: [
      'Reading time is an estimate based on 200 WPM average',
      'Hyphenated words are counted as single words',
      'Does not detect language or provide grammar analysis',
    ],
    privacyStatement: 'All text analysis happens entirely in your browser. Your text is never uploaded, stored, or transmitted to any server.',
  },
  'base64-encoder': {
    slug: 'base64-encoder',
    introduction: 'The Base64 Encoder/Decoder is a browser-based tool that converts text to and from Base64 encoding. It supports UTF-8 text, ensuring proper handling of international characters and emojis. All processing happens locally.',
    whatItDoes: 'This tool encodes plain text into Base64 format and decodes Base64 back to plain text. It handles UTF-8 encoding correctly, so international characters, emojis, and special symbols are preserved.',
    whyUseIt: 'Base64 encoding is used in data URIs, email attachments, JWT tokens, API authentication, and configuration files. Developers frequently need to encode or decode Base64 strings during development and debugging.',
    features: [
      'Encode text to Base64',
      'Decode Base64 to text',
      'Full UTF-8 support including emojis',
      'Instant conversion',
      'Copy and download results',
    ],
    benefits: [
      'Debug JWT tokens and API responses',
      'Create data URIs for inline images',
      'Encode credentials for HTTP Basic Auth',
      'No data leaves your browser',
    ],
    useCases: [
      'Decoding JWT token payloads',
      'Creating data URIs for embedded images',
      'Encoding API credentials',
      'Debugging email attachment encoding',
    ],
    stepByStep: [
      'Enter your text or Base64 string in the input field',
      'Select "encode" or "decode" mode',
      'Click "Run Tool" to convert',
      'Copy the result or download it',
    ],
    examples: [
      { input: 'Hello', output: 'SGVsbG8=', explanation: 'Each 3 bytes of text becomes 4 Base64 characters.' },
      { input: 'SGVsbG8=', output: 'Hello', explanation: 'Decoding reverses the encoding process.' },
      { input: 'café', output: 'Y2Fmw6k=', explanation: 'UTF-8 encoding preserves accented characters.' },
    ],
    bestPractices: [
      'Always use UTF-8 encoding for international text',
      'Validate Base64 strings before decoding',
      'Use URL-safe Base64 (replace +/ with -_) for URLs',
    ],
    commonMistakes: [
      'Forgetting that Base64 is not encryption — it is easily reversible',
      'Using ASCII-only encoding instead of UTF-8 for international text',
      'Not padding Base64 strings to a multiple of 4 characters',
    ],
    limitations: [
      'Base64 encoding increases size by approximately 33%',
      'Base64 is not encryption — do not use for sensitive data',
      'Maximum input size is 10 MB',
    ],
    privacyStatement: 'All encoding and decoding happens entirely in your browser. Your text is never uploaded, stored, or transmitted to any server.',
  },
  'uuid-generator': {
    slug: 'uuid-generator',
    introduction: 'The UUID Generator is a browser-based tool that creates RFC 4122 version 4 UUIDs (Universally Unique Identifiers). It uses the Web Crypto API for cryptographically secure random number generation. All generation happens locally.',
    whatItDoes: 'This tool generates one or more UUIDs using cryptographically secure random numbers. Each UUID is a 128-bit identifier represented as a 36-character string with hyphens.',
    whyUseIt: 'UUIDs are used as database primary keys, session IDs, API tokens, and distributed system identifiers. They eliminate the need for centralized ID generation and are guaranteed to be unique across systems.',
    features: [
      'Generates RFC 4122 v4 UUIDs',
      'Cryptographically secure (Web Crypto API)',
      'Bulk generation (up to 1000 at once)',
      'Copy individual or all UUIDs',
    ],
    benefits: [
      'Generate unique IDs without a database',
      'Use in distributed systems without coordination',
      'Cryptographically secure randomness',
      'No network calls needed',
    ],
    useCases: [
      'Database primary keys',
      'Session and token generation',
      'Distributed system identifiers',
      'Testing and mocking data',
    ],
    stepByStep: [
      'Enter the number of UUIDs to generate (default: 1)',
      'Click "Run Tool" to generate',
      'Copy individual UUIDs or all at once',
    ],
    examples: [
      { input: '1', output: '550e8400-e29b-41d4-a716-446655440000', explanation: 'A v4 UUID has random bits except for version (4) and variant fields.' },
    ],
    bestPractices: [
      'Use v4 UUIDs for most use cases',
      'Store UUIDs as UUID type in databases, not as strings',
      'Use UUIDs for public-facing IDs to prevent enumeration attacks',
    ],
    commonMistakes: [
      'Using sequential UUIDs (v1) which leak timing information',
      'Storing UUIDs as VARCHAR instead of native UUID type',
      'Truncating UUIDs which breaks uniqueness guarantees',
    ],
    limitations: [
      'Only generates v4 (random) UUIDs',
      'UUIDs are 128-bit (36 characters with hyphens)',
      'Collisions are theoretically possible but practically impossible',
    ],
    privacyStatement: 'UUID generation uses the Web Crypto API and happens entirely in your browser. No data is uploaded.',
  },
  'json-formatter': {
    slug: 'json-formatter',
    introduction: 'The JSON Formatter is a browser-based tool that validates, formats, and pretty-prints JSON data. It catches syntax errors instantly and lets you adjust indentation. All processing happens locally.',
    whatItDoes: 'This tool parses your JSON input, validates it against the JSON specification, and outputs properly formatted JSON with your chosen indentation. If the JSON is invalid, it shows the exact error location.',
    whyUseIt: 'Developers work with JSON daily — API responses, configuration files, and data interchange. This tool helps you read, validate, and fix JSON quickly without installing any software.',
    features: [
      'Validate JSON syntax with error messages',
      'Pretty-print with adjustable indentation (2, 4, or tab)',
      'Minify JSON to a single line',
      'Instant validation feedback',
      'Copy and download formatted output',
    ],
    benefits: [
      'Debug API responses quickly',
      'Validate configuration files',
      'Make minified JSON readable',
      'Catch syntax errors before deployment',
    ],
    useCases: [
      'Formatting API responses for debugging',
      'Validating configuration files',
      'Minifying JSON for production',
      'Learning JSON syntax',
    ],
    stepByStep: [
      'Paste your JSON in the input field',
      'Select indentation (2 spaces, 4 spaces, or tab)',
      'Click "Run Tool" to format',
      'Copy the formatted result or download it',
    ],
    examples: [
      { input: '{"name":"test","value":123}', output: '{\n  "name": "test",\n  "value": 123\n}', explanation: 'Pretty-prints with 2-space indentation.' },
      { input: '{\n  "a": 1\n}', output: '{"a":1}', explanation: 'Minify removes all whitespace.' },
    ],
    bestPractices: [
      'Always validate JSON before sending API requests',
      'Use 2-space indentation for most use cases',
      'Minify JSON for production to reduce transfer size',
    ],
    commonMistakes: [
      'Using single quotes instead of double quotes',
      'Including trailing commas (not valid JSON)',
      'Using comments in JSON (not supported)',
    ],
    limitations: [
      'Does not support JSONC (JSON with comments)',
      'Does not support JSON5 extensions',
      'Maximum input size is 10 MB',
    ],
    privacyStatement: 'All JSON processing happens entirely in your browser. Your data is never uploaded, stored, or transmitted to any server.',
  },
  'hash-generator': {
    slug: 'hash-generator',
    introduction: 'The Hash Generator is a browser-based tool that creates cryptographic hashes using SHA-1, SHA-256, SHA-384, and SHA-512 algorithms. It uses the Web Crypto API for secure hashing. All processing happens locally.',
    whatItDoes: 'This tool takes any text input and generates one or more cryptographic hash values. Hashes are one-way functions — you cannot reverse a hash back to the original text.',
    whyUseIt: 'Hashing is used for data integrity verification, password storage, file checksums, and blockchain. Developers need to generate hashes for debugging, verification, and security purposes.',
    features: [
      'SHA-1, SHA-256, SHA-384, and SHA-512 algorithms',
      'Uses Web Crypto API for secure hashing',
      'Instant hash generation',
      'Copy hash output',
      'Download as text file',
    ],
    benefits: [
      'Verify file integrity with checksums',
      'Debug authentication systems',
      'Generate fingerprints for data comparison',
      'No data leaves your browser',
    ],
    useCases: [
      'Verifying file download integrity',
      'Generating API request signatures',
      'Debugging password hash comparisons',
      'Creating data fingerprints',
    ],
    stepByStep: [
      'Enter your text in the input field',
      'Select the hash algorithm',
      'Click "Run Tool" to generate',
      'Copy the hash output',
    ],
    examples: [
      { input: 'test', output: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', explanation: 'SHA-256 produces a 64-character hex string.' },
      { input: 'test', output: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3', explanation: 'SHA-1 produces a 40-character hex string.' },
    ],
    bestPractices: [
      'Use SHA-256 or SHA-512 for new applications',
      'Do not use SHA-1 for security-critical applications',
      'Use salted hashes (bcrypt, scrypt) for password storage',
    ],
    commonMistakes: [
      'Using SHA-1 for password hashing (use bcrypt or scrypt instead)',
      'Comparing hashes without constant-time comparison',
      'Storing raw hashes without salt for passwords',
    ],
    limitations: [
      'Only supports SHA family algorithms',
      'Does not support MD5 (insecure)',
      'Hashing is one-way — cannot be reversed',
      'Maximum input size is 10 MB',
    ],
    privacyStatement: 'All hashing happens entirely in your browser using the Web Crypto API. Your text is never uploaded, stored, or transmitted to any server.',
  },
};

/**
 * Get content for a specific tool. Returns null if not found.
 */
export function getToolContent(slug: string): ToolContent | null {
  return toolContent[slug] ?? null;
}

/**
 * Get all tool slugs that have content.
 */
export function getToolsWithContent(): string[] {
  return Object.keys(toolContent);
}
