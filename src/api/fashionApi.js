// src/api/fashionApi.js
import axios from 'axios';

// ⚠️ THAY "YOUR_NEWS_API_KEY" BẰNG API KEY THẬT CỦA NÍ NHÉ
const NEWS_API_KEY = '1cf3ddb2077b493ba705d70d68abdf10'; 
const BASE_URL = 'https://newsapi.org/v2';

export const getFashionNews = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/everything`, {
            params: {
                q: 'high-end fashion OR luxury jewelry OR haute couture OR chanel OR dior OR prada OR vogue', // Từ khóa chuyên biệt hơn
                language: 'en', // Lấy tin tiếng Anh
                sortBy: 'publishedAt', // Sắp xếp theo ngày mới nhất
                pageSize: 21, // Lấy 21 bài để chia lưới đẹp (7 hàng x 3 cột)
                apiKey: NEWS_API_KEY
            }
        });
        return response.data.articles;
    } catch (error) {
        console.error("❌ Lỗi khi lấy tin tức thời trang:", error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
};