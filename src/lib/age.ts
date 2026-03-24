/** Calculate age in years from a date of birth */
export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

/** Format age for display: "Age 3" / "גיל 3" / "Little Artist" */
export function formatAge(
  dob: Date | string | null | undefined,
  locale: "en" | "he" = "en"
): string {
  const age = calculateAge(dob);
  if (age === null) return locale === "he" ? "אמן/ית צעיר/ה" : "Little Artist";
  return locale === "he" ? `גיל ${age}` : `Age ${age}`;
}

/** Short age label for pills: "(3)" or "" if no DOB */
export function ageTag(dob: Date | string | null | undefined): string {
  const age = calculateAge(dob);
  return age !== null ? `(${age})` : "";
}
