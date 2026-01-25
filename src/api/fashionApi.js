import axios from 'axios';

const API_KEY = '52e75cd447552f2436723f6d4286023a'; // Key GNews của ní
const BASE_URL = 'https://gnews.io/api/v4';

export const getLuxuryNews = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                // Tui đã mix các từ khóa xịn xò của ní vào đây
                q: 'thời trang cao cấp OR trang sức xa xỉ OR chanel OR dior OR vogue việt nam',
                lang: 'vi', 
                country: 'vn',
                max: 10, 
                apikey: API_KEY
            }
        });
        
        return {
            success: true,
            data: response.data.articles
        };
    } catch (error) {
        console.error("❌ Lỗi GNews:", error);
        return { success: false, data: [] };
    }
};