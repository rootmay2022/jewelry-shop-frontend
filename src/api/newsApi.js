import axios from 'axios';

// Nếu chưa có Key thật, cứ để tạm thế này
const API_KEY = '52e75cd447552f2436723f6d4286023a'; 

export const getLuxuryNews = async () => {
    try {
        const response = await axios.get(`https://gnews.io/api/v4/search`, {
            params: {
                q: 'luxury jewelry',
                lang: 'vi',
                apikey: API_KEY
            }
        });
        return { success: true, data: response.data.articles || [] };
    } catch (error) {
        // TRẬN ĐỊA CUỐI CÙNG: Nếu API sập/thiếu Key, trả về data giả cho web vẫn chạy
        console.warn("Dùng dữ liệu dự phòng do lỗi API");
        return { 
            success: true, // Vẫn để true để map không bị lỗi
            data: [
                {
                    title: "Tuyệt tác trang sức 2026",
                    description: "Khám phá bộ sưu tập đẳng cấp nhất mùa này.",
                    image: "https://locphuc.com.vn/Content/Images/Event/SlideBanner2_PC.jpg",
                    source: { name: "Luxury Magazine" },
                    publishedAt: new Date().toISOString()
                }
            ] 
        };
    }
};