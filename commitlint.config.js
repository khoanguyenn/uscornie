module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce blank line before body
    'body-leading-blank': [2, 'always'],
    // Body is always required
    'body-empty': [2, 'never'],
    // Custom body constraints
    'body-bullet-point-constraints': [2, 'always'],
    // Max 15 words in header
    'header-max-words': [2, 'always', 15],
  },
  plugins: [
    {
      rules: {
        'header-max-words': ({ header }, _, maxWords) => {
          if (!header) return [true];
          const words = header.split(/\s+/).filter(Boolean);
          return [
            words.length <= maxWords,
            `Commit header must have a maximum of ${maxWords} words (currently has ${words.length} words).`,
          ];
        },
        'body-bullet-point-constraints': ({ body }) => {
          if (!body) return [false, 'Commit body is required.'];

          const lines = body.split('\n').map(line => line.trim()).filter(Boolean);

          // 1. Check number of bullet points (must be between 3 and 5)
          if (lines.length < 3 || lines.length > 5) {
            return [
              false,
              `Commit body must contain between 3 and 5 bullet points (found ${lines.length}).`,
            ];
          }

          // Higher-order helper predicates
          const startsWithBullet = line => line.startsWith('- ');
          
          const hasValidSentenceCount = line => {
            const content = line.substring(2).trim();
            const sentences = content.split(/[.!?](?:\s+|$)/).filter(Boolean);
            return sentences.length <= 2;
          };

          const hasValidWordCount = line => {
            const content = line.substring(2).trim();
            const words = content.split(/\s+/).filter(Boolean);
            return words.length <= 10;
          };

          // Find index of any line failing formats
          const invalidFormatIndex = lines.findIndex(line => !startsWithBullet(line));
          if (invalidFormatIndex !== -1) {
            return [
              false,
              `Bullet point ${invalidFormatIndex + 1} must start with "- ". Got: "${lines[invalidFormatIndex]}"`,
            ];
          }

          // Find index of any line exceeding 2 sentences
          const invalidSentenceIndex = lines.findIndex(line => !hasValidSentenceCount(line));
          if (invalidSentenceIndex !== -1) {
            return [
              false,
              `Bullet point ${invalidSentenceIndex + 1} must have a maximum of 2 sentences.`,
            ];
          }

          // Find index of any line exceeding 10 words
          const invalidWordIndex = lines.findIndex(line => !hasValidWordCount(line));
          if (invalidWordIndex !== -1) {
            return [
              false,
              `Bullet point ${invalidWordIndex + 1} must have a maximum of 10 words.`,
            ];
          }

          return [true];
        },
      },
    },
  ],
};
