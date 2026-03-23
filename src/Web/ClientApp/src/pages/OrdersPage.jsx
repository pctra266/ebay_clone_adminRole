import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import { 
  Card, CardBody, CardHeader, Table, Badge, Button, 
  Input, InputGroup, InputGroupText, Pagination, PaginationItem, PaginationLink,
  Modal, ModalHeader, ModalBody, ModalFooter, Spinner, Row, Col
} from 'reactstrap';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  
  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [pageNumber, status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        pageNumber,
        pageSize,
        status,
        search
      });
      setOrders(data.items);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPageNumber(1);
      fetchOrders();
    }
  };

  const handleViewDetails = async (id) => {
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const data = await orderService.getOrderById(id);
      setSelectedOrder(data);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleModal = () => setModalOpen(!modalOpen);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge color="warning" pill>Pending</Badge>;
      case 'Shipped': return <Badge color="primary" pill>Shipped</Badge>;
      case 'Delivered': return <Badge color="success" pill>Delivered</Badge>;
      case 'Canceled': return <Badge color="danger" pill>Canceled</Badge>;
      case 'Completed': return <Badge color="info" pill>Completed</Badge>;
      default: return <Badge color="secondary" pill>{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Order Management</h2>
          <p className="text-secondary small">Review and manage platform customer orders</p>
        </div>
        <div className="d-flex gap-2">
           <Button color="outline-primary" onClick={fetchOrders}><i className="bi bi-arrow-clockwise"></i> Refresh</Button>
        </div>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <CardBody className="p-0">
          <div className="p-3 border-bottom bg-light d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="btn-group">
                {['All', 'Pending', 'Shipped', 'Delivered', 'Canceled'].map(s => (
                  <Button 
                    key={s} 
                    color={status === s ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => { setStatus(s); setPageNumber(1); }}
                  >
                    {s}
                  </Button>
                ))}
            </div>
            <div style={{ minWidth: '300px' }}>
              <InputGroup size="sm">
                <InputGroupText className="bg-white border-end-0"><i className="bi bi-search"></i></InputGroupText>
                <Input 
                  className="border-start-0"
                  placeholder="Search by Order ID or Buyer Name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </InputGroup>
            </div>
          </div>
          
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-3">Order ID</th>
                <th>Date</th>
                <th>Buyer</th>
                <th>Total Price</th>
                <th>Items</th>
                <th>Status</th>
                <th className="text-end px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner color="primary" />
                    <p className="mt-2 mb-0">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-secondary">
                    No orders found matching the criteria.
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-3 fw-medium">#{order.id}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>{order.buyerName}</td>
                    <td className="fw-bold">${order.totalPrice?.toFixed(2)}</td>
                    <td><Badge color="light" text="dark border">{order.itemCount} items</Badge></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-end px-3">
                      <Button color="link" size="sm" className="text-primary p-0" onClick={() => handleViewDetails(order.id)}>View Details</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-secondary">
                Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} orders
              </span>
              <Pagination size="sm" className="mb-0">
                <PaginationItem disabled={pageNumber === 1}>
                  <PaginationLink previous onClick={() => setPageNumber(p => p - 1)} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                   <PaginationItem key={p} active={pageNumber === p}>
                     <PaginationLink onClick={() => setPageNumber(p)}>{p}</PaginationLink>
                   </PaginationItem>
                ))}
                <PaginationItem disabled={pageNumber === totalPages}>
                  <PaginationLink next onClick={() => setPageNumber(p => p + 1)} />
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>

      {/* --- Order Detail Modal --- */}
      <Modal isOpen={modalOpen} toggle={toggleModal} size="lg" centered>
        <ModalHeader toggle={toggleModal} className="border-bottom-0">
          Order Details {selectedOrder && <span className="text-secondary fw-normal ms-2">#{selectedOrder.id}</span>}
        </ModalHeader>
        <ModalBody className="pt-0">
          {detailLoading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md="6">
                   <p className="mb-1 text-secondary small">Buyer Info</p>
                   <p className="mb-0 fw-bold">{selectedOrder.buyerName}</p>
                   <p className="mb-0 text-secondary small">{selectedOrder.buyerEmail}</p>
                </Col>
                <Col md="6" className="text-md-end">
                   <p className="mb-1 text-secondary small">Order Dates & Status</p>
                   <p className="mb-0 fw-bold">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                   {getStatusBadge(selectedOrder.status)}
                </Col>
              </Row>
              
              <div className="mb-4 p-3 bg-light rounded border">
                 <p className="mb-1 text-secondary small fw-bold text-uppercase">Shipping Address</p>
                 <p className="mb-0"><i className="bi bi-geo-alt me-2"></i>{selectedOrder.shippingAddress}</p>
              </div>

              <p className="fw-bold mb-2">Items Overview</p>
              <Table responsive borderless className="align-middle mb-0">
                <thead className="border-bottom small text-uppercase text-secondary">
                   <tr>
                     <th>Product</th>
                     <th>Seller</th>
                     <th className="text-center">Qty</th>
                     <th className="text-end">Unit Price</th>
                     <th className="text-end">Total</th>
                   </tr>
                </thead>
                <tbody>
                   {selectedOrder.items.map(item => (
                     <tr key={item.id} className="border-bottom-light">
                        <td className="fw-medium">{item.productName}</td>
                        <td className="small text-secondary">{item.sellerName}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">${item.unitPrice?.toFixed(2)}</td>
                        <td className="text-end fw-bold">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                     </tr>
                   ))}
                </tbody>
                <tfoot>
                   <tr>
                     <td colSpan="4" className="text-end text-secondary pt-3">Subtotal:</td>
                     <td className="text-end pt-3 fw-bold">${selectedOrder.totalPrice?.toFixed(2)}</td>
                   </tr>
                </tfoot>
              </Table>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-top-0">
          <Button color="secondary" outline onClick={toggleModal}>Close</Button>
          <Button color="primary">Manage Returns</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default OrdersPage;
