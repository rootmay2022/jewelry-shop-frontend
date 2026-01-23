import React, { useState } from 'react';
import { Button, message, Input } from 'antd';
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons';

const LocationPicker = ({ onAddressFound }) => {
    const [loading, setLoading] = useState(false);

    const getAddressFromOSM = async (lat, lng) => {
        try {
            // Đây là API miễn phí của OpenStreetMap (Nominatim)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
                onAddressFound(data.display_name);
                message.success('Đã lấy địa chỉ từ vệ tinh xong rồi đó ní!');
            } else {
                message.error('Không tìm thấy địa chỉ rồi, ní tự gõ giúp tui nha.');
            }
        } catch (error) {
            console.error('Lỗi lấy địa chỉ:', error);
            message.error('Lỗi mạng rồi ní ơi!');
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    getAddressFromOSM(latitude, longitude);
                },
                () => {
                    setLoading(false);
                    message.error('Ní phải bấm "Cho phép" lấy vị trí thì tui mới biết đường mà giao chớ!');
                }
            );
        } else {
            setLoading(false);
            message.error('Trình duyệt của ní cũ quá rồi, không hỗ trợ định vị đâu.');
        }
    };

    return (
        <Button 
            type="primary" 
            icon={loading ? <LoadingOutlined /> : <EnvironmentOutlined />} 
            onClick={handleGetLocation}
            disabled={loading}
            style={{ 
                marginBottom: '10px', 
                background: '#d4af37', 
                borderColor: '#b8860b',
                fontWeight: 'bold'
            }}
        >
            {loading ? 'Đang quét địa chỉ...' : '📍 Định vị giao hàng nhanh'}
        </Button>
    );
};

export default LocationPicker;