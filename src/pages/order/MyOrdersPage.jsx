import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message, Spin, Typography, Modal, Space, Card, Divider, Empty } from 'antd';
// Sửa dòng số 3 thành như sau:
import { 
  EyeOutlined, 
  CloseCircleOutlined, 
  Package重量Outlined, // Thay bằng BoxPlotOutlined hoặc dùng icon khác
  ClockCircleOutlined, // Đây là cái tên đúng của nó
  TruckOutlined, 
  CheckCircleOutlined,
  ShoppingOutlined 
} from '@ant-design/icons';import { getUserOrders, cancelOrder } from '../../api/orderApi';
import dayjs from 'dayjs';
import formatCurrency from '../../utils/formatCurrency';

const { Title, Text } = Typography;

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const gold = '#C5A059';
    const darkNavy = '#001529';

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await getUserOrders();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                message.error('Không thể tải lịch sử đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleCancelOrder = (orderId) => {
        Modal.confirm({
            title: 'Xác nhận hủy đơn hàng',
            content: 'Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.',
            okText: 'Xác nhận hủy',
            okType: 'danger',
            cancelText: 'Quay lại',
            onOk: async () => {
                try {
                    const response = await cancelOrder(orderId);
                    if (response.success) {
                        message.success('Hủy đơn hàng thành công.');
                        setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
                    }
                } catch (error) {
                    message.error(error.response?.data?.message || 'Không thể hủy đơn hàng.');
                }
            }
        });
    };

  const getStatusInfo = (status) => {
    const statusMap = {
        'PENDING': { color: 'gold', text: 'Chờ xác nhận', icon: <ClockCircleOutlined /> },
        'CONFIRMED': { color: 'blue', text: 'Đã xác nhận', icon: <ShoppingOutlined /> },
        'SHIPPING': { color: 'cyan', text: 'Đang giao hàng', icon: <TruckOutlined /> },
        'DELIVERED': { color: 'green', text: 'Đã hoàn thành', icon: <CheckCircleOutlined /> },
        'CANCELLED': { color: 'red', text: 'Đã hủy', icon: <CloseCircleOutlined /> }
    };
    return statusMap[status] || { color: 'default', text: status, icon: null };
};

    const columns = [
        { 
            title: 'MÃ ĐƠN', 
            dataIndex: 'id', 
            key: 'id', 
            render: (id) => <Text strong style={{ color: gold }}>#{id}</Text> 
        },
        { 
            title: 'NGÀY ĐẶT', 
            dataIndex: 'createdAt', 
            key: 'createdAt', 
            render: (text) => <Text type="secondary">{dayjs(text).format('DD/MM/YYYY HH:mm')}</Text> 
        },
        { 
            title: 'TỔNG TIỀN', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount', 
            render: (text) => <Text strong>{formatCurrency(text)}</Text> 
        },
        { 
            title: 'TRẠNG THÁI', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status) => {
                const info = getStatusInfo(status);
                return <Tag icon={info.icon} color={info.color} style={{ borderRadius: 0, padding: '2px 10px' }}>{info.text.toUpperCase()}</Tag>;
            }
        },
        {
            title: 'QUẢN LÝ',
            key: 'action',
            align: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => { setSelectedOrder(record); setIsModalVisible(true); }}
                        style={{ color: darkNavy }}
                    >
                        Chi tiết
                    </Button>
                    {record.status === 'PENDING' && (
                        <Button 
                            type="text" 
                            danger 
                            icon={<CloseCircleOutlined />} 
                            onClick={() => handleCancelOrder(record.id)}
                        >
                            Hủy đơn
                        </Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '60px 10%', background: '#fbfbfb', minHeight: '100vh' }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
                <Title level={1} style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '4px', marginBottom: 10 }}>
                    LỊCH SỬ MUA HÀNG
                </Title>
                <Text type="secondary">Theo dõi trạng thái và quản lý các đơn hàng trang sức của quý khách</Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 0, boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <Table 
                    columns={columns} 
                    dataSource={orders} 
                    rowKey="id" 
                    loading={loading}
                    pagination={{ pageSize: 8 }}
                    locale={{ emptyText: <Empty description="Quý khách chưa có đơn hàng nào" /> }}
                />
            </Card>

            {/* MODAL CHI TIẾT ĐƠN HÀNG - STYLE HÓA ĐƠN */}
            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 0 }}>ĐÓNG</Button>
                ]}
                width={600}
                centered
            >
                {selectedOrder && (
                    <div style={{ padding: '20px 10px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 30 }}>
                            <Title level={3} style={{ margin: 0, fontFamily: 'Playfair Display' }}>CHI TIẾT ĐƠN HÀNG</Title>
                            <Text type="secondary">Mã đơn: #{selectedOrder.id}</Text>
                        </div>

                        <Row gutter={[0, 16]}>
                            <Col span={12}>
                                <Text type="secondary">Ngày đặt:</Text><br/>
                                <Text strong>{dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                                <Text type="secondary">Trạng thái:</Text><br/>
                                {getStatusInfo(selectedOrder.status).text}
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Địa chỉ giao hàng:</Text><br/>
                                <Text strong>{selectedOrder.shippingAddress}</Text>
                            </Col>
                            <Col span={24}>
                                <Text type="secondary">Thanh toán:</Text><br/>
                                <Text strong>{selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản QR'}</Text>
                            </Col>
                        </Row>

                        <Divider style={{ margin: '24px 0' }}>SẢN PHẨM</Divider>

                        <div style={{ marginBottom: 30 }}>
                            {selectedOrder.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                                    <div>
                                        <Text strong>{item.productName}</Text><br/>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Số lượng: {item.quantity}</Text>
                                    </div>
                                    <Text>{formatCurrency(item.price * item.quantity)}</Text>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: '#f9f9f9', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={4} style={{ margin: 0 }}>TỔNG CỘNG</Title>
                            <Title level={4} style={{ margin: 0, color: gold }}>{formatCurrency(selectedOrder.totalAmount)}</Title>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .ant-table-thead > tr > th {
                    background: transparent !important;
                    border-bottom: 2px solid #f0f0f0 !important;
                    font-size: 11px !important;
                    letter-spacing: 2px !important;
                    color: #888 !important;
                }
                .ant-table-row:hover {
                    background-color: #fdfaf5 !important;
                }
                .ant-btn-text:hover {
                    background-color: rgba(197, 160, 89, 0.1) !important;
                }
            `}</style>
        </div>
    );
};

export default MyOrdersPage;