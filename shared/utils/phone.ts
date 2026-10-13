import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/min'

// "0803 123 4567" uses the default country; "+1 ..." works for anywhere.
// Returns the number in +international form, or null if it isn't a real number.
export const normalizePhone = (raw: string, country: string): string | null => {
    const parsed = parsePhoneNumberFromString(raw, country as CountryCode)
    return parsed && parsed.isValid() ? parsed.number : null
}