export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  dialCode: string; // e.g. "+92"
  flag: string;
  placeholder: string;
  minLength: number;
  maxLength: number;
}

export const COUNTRIES: Country[] = [
  { name: "Pakistan", code: "PK", dialCode: "+92", flag: "🇵🇰", placeholder: "300 1234567", minLength: 9, maxLength: 10 },
  { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸", placeholder: "555 123 4567", minLength: 10, maxLength: 10 },
  { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧", placeholder: "7911 123456", minLength: 10, maxLength: 11 },
  { name: "India", code: "IN", dialCode: "+91", flag: "🇮🇳", placeholder: "98765 43210", minLength: 10, maxLength: 10 },
  { name: "United Arab Emirates", code: "AE", dialCode: "+971", flag: "🇦🇪", placeholder: "50 123 4567", minLength: 9, maxLength: 9 },
  { name: "Saudi Arabia", code: "SA", dialCode: "+966", flag: "🇸🇦", placeholder: "50 123 4567", minLength: 9, maxLength: 9 },
  { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦", placeholder: "416 123 4567", minLength: 10, maxLength: 10 },
  { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪", placeholder: "151 12345678", minLength: 10, maxLength: 11 },
  { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺", placeholder: "412 345 678", minLength: 9, maxLength: 9 },
  { name: "Turkey", code: "TR", dialCode: "+90", flag: "🇹🇷", placeholder: "532 123 4567", minLength: 10, maxLength: 10 },
  { name: "Bangladesh", code: "BD", dialCode: "+880", flag: "🇧🇩", placeholder: "1712 345678", minLength: 10, maxLength: 10 },
  { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷", placeholder: "6 12 34 56 78", minLength: 9, maxLength: 9 },
  { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬", placeholder: "8123 4567", minLength: 8, maxLength: 8 },
  { name: "Malaysia", code: "MY", dialCode: "+60", flag: "🇲🇾", placeholder: "12 345 6789", minLength: 9, maxLength: 10 },
];

/**
 * Normalizes phone number into standard E.164 format (+[countryCode][digits])
 * Strips leading zeros, spaces, dashes, parentheses
 */
export function formatToE164(dialCode: string, rawNumber: string): string {
  // Strip all non-digit characters
  let digits = rawNumber.replace(/\D/g, "");

  // If user included leading '0' (common in UK, Pakistan, etc.), remove it
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  const cleanDialCode = dialCode.startsWith("+") ? dialCode : `+${dialCode.replace(/\D/g, "")}`;
  return `${cleanDialCode}${digits}`;
}

/**
 * Validates E.164 phone number: + followed by 8 to 15 digits
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

/**
 * Formats E.164 number for pleasant display e.g. +92 300 1234567
 */
export function formatPhoneNumberDisplay(phone?: string | null): string {
  if (!phone) return "";
  if (!phone.startsWith("+")) return phone;

  // Try to match known dial codes
  for (const c of COUNTRIES) {
    if (phone.startsWith(c.dialCode)) {
      const rest = phone.slice(c.dialCode.length);
      return `${c.dialCode} ${rest}`;
    }
  }
  return phone;
}
