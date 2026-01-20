// src/utils/formatCurrency.js
const formatCurrency = (value) => {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export default formatCurrency;