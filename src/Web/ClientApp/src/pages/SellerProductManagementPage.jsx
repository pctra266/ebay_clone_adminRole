import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Form, Row, Col, Modal, Alert } from 'react-bootstrap';
import { productService } from '../services/productService';
import { useAuth } from '../services/useAuth'; // Giả sử có hook này để lấy thông tin user

const SellerProductManagementPage = () => {
    const { user } = useAuth(); // Lấy thông tin user đăng nhập, ví dụ { id: 1, role: 'Seller' }
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Thêm test user ID nếu chưa đăng nhập để dễ debug
    const sellerId = user?.id || 1; 

    // Add modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', categoryId: 1, images: '', isAuction: false });
    const [addError, setAddError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [sellerId]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getSellerProducts(sellerId);
            setProducts(data.items || []); // PaginatedList trả về .items
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setAddError('');
        try {
            await productService.createProduct({
                ...newProduct,
                sellerId: sellerId
            });
            setShowAddModal(false);
            setNewProduct({ title: '', description: '', price: '', categoryId: 1, images: '', isAuction: false });
            fetchProducts();
        } catch (err) {
            setAddError("Không thể thêm sản phẩm. Vui lòng thử lại.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <Badge bg="success">Đang bán</Badge>;
            case 'InActive': return <Badge bg="secondary">Chưa kích hoạt</Badge>;
            case 'Hidden': return <Badge bg="danger">Bị Ẩn (Vi Phạm)</Badge>;
            case 'PendingReview': return <Badge bg="warning">Chờ duyệt</Badge>;
            default: return <Badge bg="info">{status}</Badge>;
        }
    };

    return (
        <Container fluid className="px-5 py-4" style={{ backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 style={{ fontWeight: 700, color: '#111827' }}>Quản lý Sản Phẩm (Seller)</h2>
                    <p className="text-muted">Xem, thêm và quản lý các sản phẩm bạn đang bán.</p>
                </div>
                <Button variant="dark" style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 600 }} onClick={() => setShowAddModal(true)}>
                    + Thêm Sản Phẩm Mới
                </Button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '24px' }}>
                <Table hover responsive style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                        <tr style={{ color: '#6B7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ borderBottom: 'none' }}>ID</th>
                            <th style={{ borderBottom: 'none' }}>Sản Phẩm</th>
                            <th style={{ borderBottom: 'none' }}>Giá</th>
                            <th style={{ borderBottom: 'none' }}>Trạng Thái</th>
                            <th style={{ borderBottom: 'none' }}>Ghi Chú Yêu Cầu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Đang tải...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">Chưa có sản phẩm nào.</td></tr>
                        ) : (
                            products.map(p => (
                                <tr key={p.id} style={{ backgroundColor: p.status === 'Hidden' ? '#FEF2F2' : 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                                    <td style={{ verticalAlign: 'middle', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                                        #{p.id}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', fontWeight: 500, color: '#111827' }}>
                                        {p.title}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                                        ${p.price?.toFixed(2)}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6' }}>
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', borderTop: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', color: '#DC2626', fontSize: '14px' }}>
                                        {p.status === 'Hidden' && "Vi phạm quy định: " + (p.violationType || p.moderationNotes || "Nội dung phản cảm/Spam")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal Thêm Sản Phẩm */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                    <Modal.Title style={{ fontWeight: 700 }}>Thêm Sản Phẩm Mới</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddProduct}>
                    <Modal.Body>
                        {addError && <Alert variant="danger">{addError}</Alert>}
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: 600, fontSize: '14px' }}>Tên Sản Phẩm (Sẽ được AI duyệt tự động)</Form.Label>
                            <Form.Control required type="text" placeholder="Nhập tên sản phẩm..." value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '14px' }}>Giá ($)</Form.Label>
                                    <Form.Control required type="number" step="0.01" min="0" placeholder="0.00" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: 600, fontSize: '14px' }}>Category ID</Form.Label>
                                    <Form.Control required type="number" min="1" value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: parseInt(e.target.value)})} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: 600, fontSize: '14px' }}>Mô tả bổ sung</Form.Label>
                            <Form.Control as="textarea" rows={3} placeholder="Mô tả sản phẩm" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: 'none' }}>
                        <Button variant="light" onClick={() => setShowAddModal(false)}>Hủy</Button>
                        <Button variant="dark" type="submit" style={{ borderRadius: '8px', fontWeight: 600 }}>Tạo Sản Phẩm Mới</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default SellerProductManagementPage;
