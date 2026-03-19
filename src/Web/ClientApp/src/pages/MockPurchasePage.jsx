import React, { useState } from "react";
import { ToastMessage } from "../components/ToastMessage";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { apiRequest } from '../services/httpClient';

export function MockPurchasePage() {
    const [formData, setFormData] = useState({
        sellerId: '',
        orderType: 'Normal',
        amount: 500000
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiRequest('/api/Mocking/generate-seller-order', {
                method: 'POST',
                body: {
                    sellerId: parseInt(formData.sellerId, 10),
                    orderType: formData.orderType,
                    amount: parseFloat(formData.amount)
                },
            });
            
            setToast({ message: "Mock order generated successfully. Check pending settlements!", type: 'success' });
            setFormData({ ...formData, sellerId: '' }); // Clear partly
        } catch (err) {
            setToast({ message: err.message || "Failed to generate mock order.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <ToastMessage 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, message: '' })} 
            />

            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">Simulate Buyer Purchase</h4>
                        </div>
                        <div className="card-body p-4">
                            <p className="text-muted mb-4">
                                Use this tool to generate mock orders for a specific seller without needing to log in or go through checkout. The transaction funds will be reflected in the seller's wallet as Pending Balance.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Seller ID</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="sellerId"
                                        value={formData.sellerId}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 15"
                                        min="1"
                                        required 
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Order Type</label>
                                    <select 
                                        className="form-select" 
                                        name="orderType"
                                        value={formData.orderType}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Normal">Normal (Delivered smoothly)</option>
                                        <option value="LateShipment">Late Shipment (Delivered late)</option>
                                        <option value="DisputeUnresolved">Dispute Escalatated (Unresolved)</option>
                                        <option value="ReturnRefunded">Return Refunded (Defect)</option>
                                    </select>
                                    <div className="form-text">Choose how this order resolves to test Performance metrics.</div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Order Amount (VND)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        min="10000"
                                        required 
                                    />
                                    <div className="form-text">This total includes the 5% platform fee. The remainder goes to the Seller's Pending Balance.</div>
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                        {loading ? "Generating..." : "Generate Mock Purchase"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
