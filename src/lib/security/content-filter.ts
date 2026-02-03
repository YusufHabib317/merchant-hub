/**
 * Content filtering utility to detect and reject inappropriate content
 * Focuses on violence, sexual content, and other offensive material
 */

const BAD_WORDS = [
  // Sexual content
  'sex', 'porn', 'xxx', 'nude', 'naked', 'erotic', 'sexual', 'penis', 'vagina', 'boobs', 'tits', 'ass', 'anal', 'orgasm', 'cum', 'dick', 'cock', 'pussy', 'bitch', 'whore', 'slut',

  // Violence
  'kill', 'murder', 'death', 'die', 'suicide', 'blood', 'gore', 'violent', 'attack', 'shoot', 'gun', 'knife', 'bomb', 'terrorist', 'rape', 'assault', 'abuse', 'torture',

  // Hate speech / Offensive
  'nigger', 'faggot', 'retard', 'spic', 'kike', 'chink', 'cunt', 'bastard', 'idiot', 'stupid',
];

/**
 * Check if the text contains any inappropriate content
 * @param text The text to check
 * @returns True if the text contains bad words, false otherwise
 */
export function containsBadWords(text: string): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();

  // Check for exact matches or words contained within the text
  // Using word boundary check for short words to avoid false positives (e.g., "ass" in "class")
  return BAD_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

/**
 * Validate AI context content
 * @param content The content to validate
 * @returns An object with valid status and optional error message
 */
export function validateAIContext(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (containsBadWords(content)) {
    return { valid: false, error: 'Content contains inappropriate language (violence, sexual content, etc.)' };
  }

  return { valid: true };
}
