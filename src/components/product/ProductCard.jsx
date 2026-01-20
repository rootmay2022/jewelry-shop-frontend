// src/components/product/ProductCard.jsx
import React from 'react';
import { Card, Typography, Button, Tag } from 'antd';
import { Link } from 'react-router-dom';
import formatCurrency from '../../utils/formatCurrency';
import { EyeOutlined } from '@ant-design/icons'; // Thêm icon

const { Meta } = Card;
const { Text } = Typography;

const ProductCard = ({ product }) => {
  return (
    <Card
      hoverable
      cover={<img alt={product.name} src={product.imageUrl || 'https://via.placeholder.com/300'} style={{ height: 250, objectFit: 'cover' }} />}
      actions={[
        <Link to={`/products/${product.id}`}>
            <Button type="primary" icon={<EyeOutlined />} block>
                Xem Chi Tiết
            </Button>
        </Link>
      ]}
    >
      <Meta
        title={product.name}
        description={
            <>
                <Text strong style={{ color: '#0B3D91', fontSize: '1.2rem' }}>{formatCurrency(product.price)}</Text>
                <br />
                {product.stockQuantity === 0 && <Tag color="red">Hết hàng</Tag>}
            </>
        }
      />
    </Card>
  );
};

export default ProductCard;