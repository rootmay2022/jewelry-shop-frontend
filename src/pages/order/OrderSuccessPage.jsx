// src/pages/order/OrderSuccessPage.jsx
import React from 'react';
import { Result, Button } from 'antd';
import { Link, useParams } from 'react-router-dom';

const OrderSuccessPage = () => {
    const { id } = useParams();

    return (
        <Result
            status="success"
            title="Đặt hàng thành công!"
            subTitle={`Mã đơn hàng của bạn là: #${id}. Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.`}
            // Sửa lỗi: Cung cấp JSX hợp lệ cho prop 'extra'
            extra={[
                <Button type="primary" key="my-orders">
                    <Link to="/my-orders">Xem đơn hàng của tôi</Link>
                </Button>,
                <Button key="home">
                    <Link to="/">Tiếp tục mua sắm</Link>
                </Button>
            ]}
        />
    );
};

export default OrderSuccessPage;