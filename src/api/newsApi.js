import axios from 'axios';

const API_KEY = '52e75cd447552f2436723f6d4286023a'; 

export const getLuxuryNews = async () => {
    try {
        const response = await axios.get(`https://gnews.io/api/v4/search`, {
            params: {
                q: 'luxury jewelry fashion',
                lang: 'vi',
                apikey: API_KEY
            }
        });
        // GNews trả về articles, mình bọc lại cho chắc
        return { 
            success: true, 
            data: response.data.articles || [] 
        };
    } catch (error) {
        console.error("Lỗi API:", error);
        // TRẢ VỀ DỮ LIỆU GIẢ NẾU LỖI ĐỂ KHÔNG BỊ ĐEN MÀN HÌNH
        return { 
            success: true, 
            data: [{
                title: "Đang cập nhật tin tức xa xỉ...",
                description: "Vui lòng kiểm tra lại kết nối hoặc API Key.",
                image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338",
                publishedAt: new Date().toISOString(),
                source: { name: "System" },
                url: "#"
            }] 
        };
    }
};