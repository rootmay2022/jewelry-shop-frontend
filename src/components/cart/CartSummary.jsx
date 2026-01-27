import React from 'react';
import { Card, Typography, Button, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const CartSummary = ({ totalAmount, disableCheckout }) => {
    const navigate = useNavigate();

    return (
        <Card>
            <Title level={4}>Tóm Tắt Đơn Hàng</Title>
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text>Tạm tính</Text>
                <Text>{formatCurrency(totalAmount)}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>Tổng cộng</Text>
                <Text strong style={{ color: '#C5A059', fontSize: '18px' }}>
                    {formatCurrency(totalAmount)}
                </Text>
            </div>
            <Divider />
            
            <Button 
                type="primary" 
                size="large" 
                block 
                disabled={disableCheckout}
                onClick={() => navigate('/checkout')}
                style={{ 
                    height: '50px',
                    backgroundColor: disableCheckout ? '#d9d9d9' : '#001529',
                    borderColor: disableCheckout ? '#d9d9d9' : '#001529'
                }}
            >
                {disableCheckout ? 'GIỎ HÀNG LỖI' : 'Tiến hành thanh toán'}
            </Button>
            
            {disableCheckout && (
                <Text type="danger" style={{ fontSize: '12px', display: 'block', textAlign: 'center', marginTop: 10 }}>
                    Vui lòng giảm số lượng sản phẩm quá tồn kho
                </Text>
            )}
        </Card>
    );
};

export default CartSummary;