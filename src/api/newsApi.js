import axios from 'axios';

const API_KEY = '52e75cd447552f2436723f6d4286023a'; 
const BASE_URL = 'https://gnews.io/api/v4';

// Dữ liệu dự phòng cao cấp nếu API hết lượt hoặc lỗi
const FALLBACK_NEWS = [
    {
        title: "Xu hướng trang sức kim cương tự nhiên 2026",
        description: "Sự lên ngôi của các thiết kế cắt gọt tinh xảo và phong cách cá nhân hóa trong giới thượng lưu.",
        image: "https://locphuc.com.vn/Content/Images/Event/SlideBanner2_PC.jpg",
        url: "https://locphuc.com.vn/",
        source: { name: "Luxury Journal" },
        publishedAt: new Date().toISOString()
    },
    {
        title: "Đẳng cấp đồng hồ Haute Horlogerie",
        description: "Điểm lại những cỗ máy thời gian triệu đô vừa được ra mắt tại triển lãm quốc tế.",
        image: "https://vcdn1-giaitri.vnecdn.net/2023/04/01/rolex-1680345634-1680345648-5182-1680345719.jpg",
        url: "https://vneconomy.vn/",
        source: { name: "Boutique News" },
        publishedAt: new Date().toISOString()
    }
];

export const getLuxuryNews = async () => {
    try {
        // Query kết hợp cả tiếng Anh và tiếng Việt để tối ưu kết quả
        const query = '"trang sức xa xỉ" OR "luxury jewelry" OR "high fashion" OR "đồng hồ cao cấp"';
        
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                q: query,
                lang: 'vi',
                country: 'vn',
                max: 6, // Lấy 6 tin là vừa đẹp cho một row trên giao diện
                apikey: API_KEY
            },
            timeout: 5000 // Sau 5s không phản hồi thì ngắt để dùng fallback ngay
        });

        if (response.data && response.data.articles.length > 0) {
            return {
                success: true,
                data: response.data.articles
            };
        }
        
        throw new Error("Empty articles");

    } catch (error) {
        console.warn("⚠️ GNews API gặp sự cố, đang hiển thị tin tức độc quyền từ hệ thống.");
        return { 
            success: true, 
            data: FALLBACK_NEWS,
            isFallback: true // Flag này để ní có thể hiển thị một dòng thông báo nhỏ nếu muốn
        };
    }
};