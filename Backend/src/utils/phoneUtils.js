/**
 * Normalizes Nigerian phone numbers to international format (234...)
 * @param {string} phone 
 * @returns {string}
 */
function normalizePhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle 070... or 080... format
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = '234' + cleaned.substring(1);
    }
    
    // Handle 70... or 80... format (missing leading 0)
    if (cleaned.length === 10 && (cleaned.startsWith('7') || cleaned.startsWith('8') || cleaned.startsWith('9'))) {
        cleaned = '234' + cleaned;
    }

    // If it already starts with 234 and is the right length, keep it
    // Otherwise, we return the cleaned numeric string and hope for the best
    
    return cleaned;
}

module.exports = { normalizePhoneNumber };
