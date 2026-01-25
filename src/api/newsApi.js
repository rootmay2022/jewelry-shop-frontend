import axios from 'axios';

// DÁN CÁI KEY NÍ LẤY TRÊN WEB GNEWS VÀO ĐÂY
const API_KEY = '52e75cd447552f2436723f6d4286023a'; 
const BASE_URL = 'https://gnews.io/api/v4';

export const getLuxuryNews = async () => {
    try {
        // Kiểm tra xem đã có Key chưa trước khi gọi
        if (!API_KEY) {
            console.error("Ní ơi, chưa có API Key kìa!");
            return { success: false, data: [] };
        }

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                q: 'luxury fashion jewelry watches',
                lang: 'vi',
                max: 10, // Lấy 10 bài cho đẹp layout
                apikey: API_KEY // Đây là chỗ quan trọng nhất ní cần truyền vào
            }
        });

        return { 
            success: true, 
            data: response.data.articles || [] 
        };
    } catch (error) {
        console.error("Lỗi API GNews:", error.response?.data || error.message);
        return { success: false, data: [] };
    }
};