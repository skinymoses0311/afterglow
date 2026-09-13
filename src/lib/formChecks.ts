/**
 * Form validation, without a library.
 *
 * This replaced Zod, which was about a sixth of the site's JavaScript for four
 * short forms. The rules, their order and every message are unchanged — this
 * was checked against the old schemas, input for input — so nothing a visitor
 * sees is different. Each check trims text first, and reports the first problem
 * in field order, which is what the form's toast shows.
 */

export type CheckResult<T> = { success: true; data: T } | { success: false; message: string };

/** Zod's own email pattern, kept exactly so the same addresses pass and fail. */
const EMAIL = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;

const required = (value: string, message = "String must contain at least 1 character(s)") =>
  value.length < 1 ? message : null;

const atMost = (value: string, max: number) =>
  value.length > max ? `String must contain at most ${max} character(s)` : null;

const email = (value: string) => (EMAIL.test(value) ? atMost(value, 255) : "Please enter a valid email");

const wholeNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return "Expected number, received nan";
  if (!Number.isInteger(value)) return "Expected integer, received float";
  if (value < min) return `Number must be greater than or equal to ${min}`;
  if (value > max) return `Number must be less than or equal to ${max}`;
  return null;
};

const result = <T>(problem: string | null, data: T): CheckResult<T> =>
  problem === null ? { success: true, data } : { success: false, message: problem };

export function checkHomeEmail(input: string): CheckResult<string> {
  const value = input.trim();
  return result(email(value), value);
}

export function checkWaitlist(input: { name: string; email: string; city: string; treatments: string[] }) {
  const data = { name: input.name.trim(), email: input.email.trim(), city: input.city.trim(), treatments: input.treatments };
  return result(
    atMost(data.name, 100) ??
      email(data.email) ??
      atMost(data.city, 100) ??
      (data.treatments.length < 1 ? "Pick at least one treatment" : null),
    data,
  );
}

export function checkMerchant(input: {
  businessName: string;
  category: string;
  contactName: string;
  role: string;
  email: string;
  locations: number;
  message: string;
}) {
  const data = {
    businessName: input.businessName.trim(),
    category: input.category.trim(),
    contactName: input.contactName.trim(),
    role: input.role.trim(),
    email: input.email.trim(),
    locations: input.locations,
    message: input.message.trim(),
  };
  return result(
    (required(data.businessName, "Business name is required") ?? atMost(data.businessName, 200)) ??
      atMost(data.category, 100) ??
      (required(data.contactName, "Your name is required") ?? atMost(data.contactName, 100)) ??
      atMost(data.role, 100) ??
      email(data.email) ??
      wholeNumber(data.locations, 1, 10000) ??
      atMost(data.message, 2000),
    data,
  );
}

export function checkContact(input: { name: string; email: string; enquiryType: string; message: string }) {
  const data = {
    name: input.name.trim(),
    email: input.email.trim(),
    enquiryType: input.enquiryType.trim(),
    message: input.message.trim(),
  };
  return result(
    (required(data.name, "Please tell us your name") ?? atMost(data.name, 100)) ??
      email(data.email) ??
      required(data.enquiryType) ??
      (required(data.message, "Please add a message") ?? atMost(data.message, 2000)),
    data,
  );
}
