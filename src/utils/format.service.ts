export const formatService = {
  /**
   * Converts a slug (capitalized with underscores) to human-readable text.
   * Example: "SUPER_ADMIN" -> "Super Admin"
   * Handles cases where it might already be human readable.
   */
  slugToHuman: (slug: string): string => {
    if (!slug) return "";

    // If it doesn't contain underscores and has some lowercase, it might already be human readable
    if (!slug.includes("_") && /[a-z]/.test(slug)) {
      return slug;
    }

    return slug
      .split("_")
      .map((word) => {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  },

  /**
   * Capitalizes the first letter of a string.
   */
  capitalize: (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
};
