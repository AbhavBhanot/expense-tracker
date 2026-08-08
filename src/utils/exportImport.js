export const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (state) => {
  const dataStr = JSON.stringify(state, null, 2);
  downloadFile(dataStr, `budget-tracker-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
};

export const exportToCSV = (expenses, _categories) => {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method'];
  const rows = expenses.map(e => [
    e.date.split('T')[0],
    `"${e.category}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    e.amount,
    `"${e.paymentMethod}"`
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `expenses-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
};

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && data.categories && data.expenses) {
          resolve(data);
        } else {
          reject(new Error('Invalid file format. Missing categories or expenses.'));
        }
      } catch (err) {
        reject(new Error('Failed to parse JSON.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};
