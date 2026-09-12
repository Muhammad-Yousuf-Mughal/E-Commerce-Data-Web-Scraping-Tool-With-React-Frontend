export const formatPrice = (price: number | null, currency?: string | null) => {
  if (price == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${price}`;
  }
};

export const formatRating = (rating: number | null) => {
  if (rating == null) return "—";
  return rating.toFixed(1);
};

export const formatCount = (n: number | null | undefined) => {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US").format(n);
};

export const formatPercent = (value: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

export const truncate = (text: string | null | undefined, len = 60) => {
  if (!text) return "";
  return text.length <= len ? text : `${text.slice(0, len)}…`;
};
