import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

// Nhận prop disableCheckout từ CartPage
const CartSummary = ({ totalAmount, disableCheckout }) => {
    const navigate = useNavigate();

    return (
        <Card>
            <Title level={4}>Tóm Tắt Đơn Hàng</Title>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text>Tổng cộng</Text>
                <Text strong style={{ color: '#C5A059', fontSize: '18px' }}>{formatCurrency(totalAmount)}</Text>
            </div>
            <Divider />
            
            {/* NÚT THANH TOÁN */}
            <Button 
                type="primary" 
                size="large" 
                block 
                // --- QUAN TRỌNG: Khóa nút nếu disableCheckout = true ---
                disabled={disableCheckout} 
                // -------------------------------------------------------
                onClick={() => navigate('/checkout')}
                style={{ 
                    height: '50px', 
                    backgroundColor: disableCheckout ? '#d9d9d9' : '#001529', // Đổi màu xám nếu bị khóa
                    borderColor: disableCheckout ? '#d9d9d9' : '#001529',
                    borderRadius: 0,
                    fontWeight: 'bold'
                }}
            >
                {disableCheckout ? 'VUI LÒNG CẬP NHẬT GIỎ' : 'TIẾN HÀNH THANH TOÁN'}
            </Button>

            {disableCheckout && (
                <Text type="danger" style={{ display: 'block', marginTop: 10, textAlign: 'center', fontSize: '12px' }}>
                    Số lượng sản phẩm vượt quá tồn kho.
                </Text>
            )}
        </Card>
    );
};

export default CartSummary;