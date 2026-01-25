import axios from 'axios';

const NEWS_API_KEY = 'YOUR_API_KEY_HERE'; // Ní đăng ký lấy key free nhé
const BASE_URL = 'https://newsapi.org/v2';

export const getFashionNews = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/everything`, {
            params: {
                q: 'high-end fashion OR luxury jewelry OR vogue',
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: NEWS_API_KEY
            }
        });
        return response.data.articles;
    } catch (error) {
        console.error("Lỗi lấy tin tức:", error);
        return [];
    }
};