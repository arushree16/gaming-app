export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
}; 