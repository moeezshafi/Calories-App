export const formatCalories = (cal: number): string => {
  return Math.round(cal).toLocaleString();
};

export const formatGrams = (g: number): string => {
  return `${Math.round(g)}g`;
};

export const formatMl = (ml: number): string => {
  return `${Math.round(ml)} ml`;
};

export const formatKg = (kg: number): string => {
  return `${kg.toFixed(1)} kg`;
};

export const formatCm = (cm: number): string => {
  return `${Math.round(cm)} cm`;
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
