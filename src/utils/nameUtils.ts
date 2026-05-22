export interface NameLike {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  workEmail?: string | null;
}

const getDisplayNameFromNameLike = (user?: NameLike | null): string => {
  if (!user) {
    return "";
  }

  const first = user.firstName?.trim() ?? "";
  const last = user.lastName?.trim() ?? "";
  const combined = `${first} ${last}`.trim().replace(/\s+/g, " ");
  if (combined) {
    return combined;
  }
  if (user.username?.trim()) {
    return user.username.trim();
  }
  if (user.workEmail?.trim()) {
    return user.workEmail.trim();
  }
  return "";
};

const getDisplayNameFromLegacy = (user: {
  firstName?: string;
  lastName?: string;
  username?: string;
}): string => {
  const fullName = getFullName(user.firstName, user.lastName);
  return fullName || user.username || "Unknown User";
};

export const getDisplayName = (
  user:
    | NameLike
    | {
        firstName?: string;
        lastName?: string;
        username?: string;
      }
    | null
    | undefined
): string => {
  if (!user) {
    return "";
  }

  if ("workEmail" in user) {
    return getDisplayNameFromNameLike(user);
  }

  const legacyUser = {
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    username: user.username ?? undefined,
  };

  return getDisplayNameFromLegacy(legacyUser);
};
/**
 * Utility functions for handling user names
 */

/**
 * Combines firstName and lastName into a full name
 * @param firstName - The user's first name
 * @param lastName - The user's last name
 * @returns The combined full name, or empty string if both are empty
 */
export const getFullName = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim() || "";
  const last = lastName?.trim() || "";

  if (!first && !last) {
    return "";
  }

  return `${first} ${last}`.trim();
};

/**
 * Gets the display name for a user, falling back to username if no name is available
 * @param user - User object with firstName, lastName, and username
 * @returns Display name for the user
 */
/**
 * Gets the first name from a full name string
 * @param fullName - The full name string
 * @returns The first name
 */
export const getFirstName = (fullName: string): string => {
  return fullName.split(" ")[0] || "";
};

/**
 * Gets the last name from a full name string (everything after the first word)
 * @param fullName - The full name string
 * @returns The last name
 */
export const getLastName = (fullName: string): string => {
  const parts = fullName.split(" ");
  return parts.slice(1).join(" ") || "";
};

/**
 * Capitalizes the first letter of each word in a string
 * @param text - The text to capitalize
 * @returns The capitalized text
 */
export const capitalizeWords = (text?: string): string => {
  if (!text) return "";

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Converts text to uppercase
 * @param text - The text to convert to uppercase
 * @returns The uppercase text
 */
export const toUpperCase = (text?: string): string => {
  return text?.toUpperCase() || "";
};
