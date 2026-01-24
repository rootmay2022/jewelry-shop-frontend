import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Button, Table, Divider } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats } from '../../api/adminApi';
import formatCurrency from '../../utils/formatCurrency';
import * as XLSX from 'xlsx'; 
import dayjs from 'dayjs';

const { Title, Text } = Typography; 
const COLORS = ['#52c41a', '#1890ff', '#faad14', '#ff4d4f', '#722ed1'];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        totalRevenue: 0,
        successOrders: 0,
        pieData: [],
        deliveredList: [] // Danh sách đơn đã giao để xuất file chi tiết
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await getDashboardStats();
                if (response.success && response.data) {
                    const rawOrders = response.data.orders || response.data || [];
                    
                    let totalRev = 0;
                    let successCount = 0;
                    const statusMap = {};
                    const deliveredOrders = [];

                    rawOrders.forEach(order => {
                        const amount = Number(order.total_amount || order.totalAmount || 0);
                        const status = (order.status || '').toUpperCase();
                        
                        // 1. Chỉ lấy đơn DELIVERED vào danh sách doanh thu
                        if (status === 'DELIVERED') {
                            totalRev += amount;
                            successCount += 1;
                            deliveredOrders.push({
                                id: order.id,
                                date: dayjs(order.order_date || order.createdAt).format('DD/MM/YYYY HH:mm'),
                                amount: amount,
                                payment: order.payment_method || 'N/A'
                            });
                        }

                        // 2. Thống kê tất cả trạng thái cho biểu đồ tròn
                        const label = status === 'DELIVERED' ? 'Thành công' : 
                                      status === 'CANCELLED' ? 'Đã hủy' : 
                                      status === 'PENDING' ? 'Chờ duyệt' : status;
                        statusMap[label] = (statusMap[label] || 0) + 1;
                    });

                    setData({
                        totalRevenue: totalRev,
                        successOrders: successCount,
                        pieData: Object.keys(statusMap).map(name => ({ name, value: statusMap[name] })),
                        deliveredList: deliveredOrders
                    });
                }
            } catch (error) {
                message.error('Lỗi tải dữ liệu thống kê.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // HÀM XUẤT EXCEL CHI TIẾT
    const handleExportExcel = () => {
        if (data.deliveredList.length === 0) {
            return message.warning("Không có dữ liệu doanh thu để xuất!");
        }

        // Tạo dữ liệu chi tiết cho từng dòng trong Excel
        const excelData = data.deliveredList.map(item => ({
            "Mã Đơn Hàng": item.id,
            "Ngày Hoàn Tất": item.date,
            "Phương Thức": item.payment,
            "Số Tiền (VNĐ)": item.amount
        }));

        // Thêm dòng tổng cộng ở cuối
        excelData.push({
            "Mã Đơn Hàng": "TỔNG CỘNG",
            "Số Tiền (VNĐ)": data.totalRevenue
        });

        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Báo Cáo Doanh Thu");
        XLSX.writeFile(wb, `Bao_Cao_Doanh_Thu_${dayjs().format('DDMMYYYY')}.xlsx`);
        message.success("Đã xuất file báo cáo thành công!");
    };

    if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>💰 QUẢN LÝ DOANH THU & ĐƠN HÀNG</Title>
                <Button 
                    type="primary" 
                    size="large"
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel} 
                    danger
                >
                    XUẤT CHI TIẾT DOANH THU
                </Button>
            </div>

            <Row gutter={16}>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Statistic 
                            title="TỔNG DOANH THU THỰC"
                            value={data.totalRevenue} 
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
                            prefix={<DollarCircleOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Statistic 
                            title="ĐƠN GIAO THÀNH CÔNG"
                            value={data.successOrders} 
                            valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />} 
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} hoverable>
                        <Statistic 
                            title="TỔNG ĐƠN HÀNG HỆ THỐNG"
                            value={data.pieData.reduce((a, b) => a + b.value, 0)} 
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />} 
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: 24 }}>
                <Col span={10}>
                    <Card title="TỶ LỆ TRẠNG THÁI ĐƠN HÀNG" bordered={false} style={{ borderRadius: '8px' }}>
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={data.pieData} 
                                        dataKey="value" 
                                        cx="50%" cy="50%" 
                                        innerRadius={70} outerRadius={100} 
                                        paddingAngle={5} 
                                        label
                                    >
                                        {data.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                
                <Col span={14}>
                    <Card title="DANH SÁCH ĐƠN HÀNG TẠO DOANH THU" bordered={false} style={{ borderRadius: '8px' }}>
                        <Table 
                            dataSource={data.deliveredList} 
                            pagination={{ pageSize: 5 }}
                            rowKey="id"
                            size="small"
                            columns={[
                                { title: 'Mã Đơn', dataIndex: 'id', key: 'id' },
                                { title: 'Ngày Giao', dataIndex: 'date', key: 'date' },
                                { 
                                    title: 'Tiền', 
                                    dataIndex: 'amount', 
                                    render: (v) => <Text strong type="danger">{formatCurrency(v)}</Text> 
                                },
                            ]}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;