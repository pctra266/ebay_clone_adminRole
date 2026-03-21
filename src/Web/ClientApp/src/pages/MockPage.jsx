import React, { useState } from "react";
import { ToastMessage } from "../components/ToastMessage";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { apiRequest } from '../services/httpClient';

const GlassCard = ({ children, className = "", stagger = "" }) => (
    <div className={`glass-panel rounded-4 p-4 ${className} animate-fade-in-up ${stagger}`}>
        {children}
    </div>
);

export function MockPage() {
    const [purchaseData, setPurchaseData] = useState({
        sellerId: '',
        orderType: 'Normal',
        amount: 500000,
        settleImmediately: true,
        ensureBankLinked: true
    });
    const [payoutData, setPayoutData] = useState({
        sellerId: '',
        amount: 50000
    });
    const [loading, setLoading] = useState(false);
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutResult, setPayoutResult] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [defectData, setDefectData] = useState({ sellerId: '' });
    const [defectLoading, setDefectLoading] = useState(false);
    const [evalLoading, setEvalLoading] = useState(false);

    const handlePurchaseChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPurchaseData({ ...purchaseData, [name]: type === 'checkbox' ? checked : value });
    };

    const handlePayoutChange = (e) => {
        const { name, value } = e.target;
        setPayoutData({ ...payoutData, [name]: value });
    };

    const handlePurchaseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiRequest('/api/Mocking/generate-seller-order', {
                method: 'POST',
                body: {
                    sellerId: parseInt(purchaseData.sellerId, 10),
                    orderType: purchaseData.orderType,
                    amount: parseFloat(purchaseData.amount),
                    settleImmediately: purchaseData.settleImmediately,
                    ensureBankLinked: purchaseData.ensureBankLinked
                },
            });
            setToast({ message: purchaseData.settleImmediately ? "Purchase settled! Fund is now in Available Balance." : "Mock order generated.", type: 'success' });
            setPurchaseData({ ...purchaseData, sellerId: '' });
        } catch (err) {
            setToast({ message: err.message || "Failed to generate mock order.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePayoutSubmit = async (e) => {
        e.preventDefault();
        setPayoutLoading(true);
        setPayoutResult(null);
        try {
            const res = await apiRequest('/api/Mocking/push-payout', {
                method: 'POST',
                body: {
                    sellerId: parseInt(payoutData.sellerId, 10),
                    amount: parseFloat(payoutData.amount)
                },
            });
            setPayoutResult(res);
            setToast({ message: `Payout push processed! Status: ${res.success > 0 ? 'Success' : 'Check results below'}`, type: res.success > 0 ? 'success' : 'warning' });
        } catch (err) {
            setToast({ message: err.message || "Payout push failed.", type: 'error' });
        } finally {
            setPayoutLoading(false);
        }
    };

    const handleDefectSubmit = async (e) => {
        e.preventDefault();
        setDefectLoading(true);
        try {
            await apiRequest('/api/Mocking/generate-mock-defect', {
                method: 'POST',
                body: { sellerId: parseInt(defectData.sellerId, 10) },
            });
            setToast({ message: "Mock defect generated! The seller now has an unresolved dispute & refunded return.", type: 'warning' });
            setDefectData({ sellerId: '' });
        } catch (err) {
            setToast({ message: err.message || "Failed to generate defect.", type: 'error' });
        } finally {
            setDefectLoading(false);
        }
    };

    const handleSetDemoTime = async (minutesFromNow) => {
        try {
            setEvalLoading(true);
            const criteria = await apiRequest('/api/Users/seller-level-criteria');
            const target = new Date(Date.now() + minutesFromNow * 60000);
            await apiRequest('/api/Users/seller-level-criteria', {
                method: 'PUT',
                body: { ...criteria, nextEvaluationDate: target.toISOString() }
            });
            setToast({ message: `Evaluation scheduled in ${minutesFromNow} min! Check the Sellers Overview.`, type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to schedule evaluation time', type: 'error' });
        } finally {
            setEvalLoading(false);
        }
    };

    return (
        <section className="py-2 px-3">
            <ToastMessage 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ ...toast, message: '' })} 
            />

            <div className="d-flex justify-content-between align-items-center mb-4 p-3">
                <div>
                    <h1 className="h3 fw-bold mb-1">Developer Simulation Toolbox</h1>
                    <div className="text-secondary small">
                        <i className="bi bi-tools me-2"></i>
                        Inject purchases and trigger manual payout settlements for testing
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Purchase Column */}
                <div className="col-lg-4">
                    <GlassCard stagger="stagger-1" className="h-100">
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">1. Generate Mock Purchase</h5>
                            <p className="text-muted small">
                                Simulate an order from a buyer to a specific seller. This generates revenue and populates the seller's wallet.
                            </p>
                        </div>

                        <form onSubmit={handlePurchaseSubmit} className="d-flex flex-column gap-3">
                            <div className="pe-input-group">
                                <label className="pe-input-label">Seller ID</label>
                                <input type="number" className="pe-form-control" name="sellerId" value={purchaseData.sellerId} onChange={handlePurchaseChange} placeholder="Enter Seller ID" min="1" required />
                            </div>

                            <div className="pe-input-group">
                                <label className="pe-input-label">Order Type</label>
                                <select className="pe-form-control pe-select" name="orderType" value={purchaseData.orderType} onChange={handlePurchaseChange}>
                                    <option value="Normal">Normal (Successful)</option>
                                    <option value="DisputeUnresolved">Open Dispute (Risk Test)</option>
                                    <option value="LateShipment">Late Delivery</option>
                                    <option value="ReturnRefunded">Return/Refund</option>
                                </select>
                            </div>

                            <div className="pe-input-group">
                                <label className="pe-input-label">Amount (VND)</label>
                                <input type="number" className="pe-form-control" name="amount" value={purchaseData.amount} onChange={handlePurchaseChange} min="1000" required />
                            </div>

                            <div className="bg-light p-3 rounded-3">
                                <div className="form-check form-switch mb-2">
                                    <input className="form-check-input" type="checkbox" id="settleImmediate" name="settleImmediately" checked={purchaseData.settleImmediately} onChange={handlePurchaseChange} />
                                    <label className="form-check-label small ms-2" htmlFor="settleImmediate">Settle Immediately (Skip hold period)</label>
                                </div>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id="autoBank" name="ensureBankLinked" checked={purchaseData.ensureBankLinked} onChange={handlePurchaseChange} />
                                    <label className="form-check-label small ms-2" htmlFor="autoBank">Auto-link Mock Bank Account</label>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary rounded-pill mt-2" disabled={loading}>
                                {loading ? "Generating..." : "Generate Purchase"}
                            </button>
                        </form>
                    </GlassCard>
                </div>

                {/* Payout Column */}
                <div className="col-lg-4">
                    <GlassCard stagger="stagger-2" className="h-100 border-primary" style={{ borderTop: '4px solid var(--ebay-blue)' }}>
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">2. Push Manual Payout</h5>
                            <p className="text-muted small">
                                Simulate a direct withdrawal request. This injects <strong>Available Balance</strong> (if needed) and immediately triggers a targeted run of the Payout Engine for this seller.
                            </p>
                        </div>

                        <form onSubmit={handlePayoutSubmit} className="d-flex flex-column gap-3">
                            <div className="pe-input-group">
                                <label className="pe-input-label">Seller ID</label>
                                <input type="number" className="pe-form-control" name="sellerId" value={payoutData.sellerId} onChange={handlePayoutChange} placeholder="Enter Seller ID" min="1" required />
                            </div>

                            <div className="pe-input-group">
                                <label className="pe-input-label">Withdrawal Amount (VND)</label>
                                <input type="number" className="pe-form-control" name="amount" value={payoutData.amount} onChange={handlePayoutChange} min="1000" required />
                            </div>

                            <button type="submit" className="btn btn-outline-primary rounded-pill mt-4" disabled={payoutLoading}>
                                {payoutLoading ? "Pushing Payout..." : "Simulate Withdrawal Request"}
                            </button>
                        </form>

                        {payoutResult && (
                            <div className="mt-4 p-3 bg-light rounded-4 animate-fade-in">
                                <h6 className="fw-bold mb-3 small text-uppercase">Engine Response:</h6>
                                <div className="row g-2 text-center small">
                                    <div className="col-4 border-end">
                                        <div className={`fw-bold ${payoutResult.success > 0 ? 'text-success' : 'text-danger'}`}>
                                            {payoutResult.success > 0 ? 'SUCCESS' : 'NO SUCCESS'}
                                        </div>
                                        <div className="text-muted x-small">Status</div>
                                    </div>
                                    <div className="col-4 border-end">
                                        <div className="fw-bold">{payoutResult.onHold > 0 ? 'HOLD' : payoutResult.failed > 0 ? 'FAILED' : 'NONE'}</div>
                                        <div className="text-muted x-small">Exception</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold">{payoutResult.skipped > 0 ? 'YES' : 'NO'}</div>
                                        <div className="text-muted x-small">Skipped</div>
                                    </div>
                                </div>
                                <div className="mt-3 x-small text-secondary text-center">
                                    {payoutResult.message && (
                                        <div className="mb-2 p-2 bg-white rounded border border-warning text-dark text-start">
                                            <strong>Reason:</strong> {payoutResult.message}
                                        </div>
                                    )}
                                    Check <a href="/payout-engine" target="_blank">Payout Engine</a> for full logs & transaction ID.
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Defect Column */}
                <div className="col-lg-4">
                    <GlassCard stagger="stagger-3" className="h-100 border-danger" style={{ borderTop: '4px solid var(--bs-danger)' }}>
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2 text-danger">3. Generate Account Defect</h5>
                            <p className="text-muted small">
                                Simulate an <strong>unresolved dispute</strong> and a <strong>refunded return</strong> to instantly spike the seller's defect rate and force a Below Standard downgrade.
                            </p>
                        </div>

                        <form onSubmit={handleDefectSubmit} className="d-flex flex-column gap-3">
                            <div className="pe-input-group">
                                <label className="pe-input-label">Seller ID</label>
                                <input type="number" className="pe-form-control" name="sellerId" value={defectData.sellerId} onChange={(e) => setDefectData({ sellerId: e.target.value })} placeholder="Enter Seller ID" min="1" required />
                            </div>

                            <button type="submit" className="btn btn-outline-danger rounded-pill mt-4" disabled={defectLoading}>
                                {defectLoading ? "Generating Defect..." : "Inject Account Defects"}
                            </button>
                        </form>
                    </GlassCard>
                </div>

                {/* Schedule Column */}
                <div className="col-lg-4">
                    <GlassCard stagger="stagger-4" className="h-100 border-info" style={{ borderTop: '4px solid var(--bs-info)' }}>
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2 text-info">4. Schedule Auto-Evaluation</h5>
                            <p className="text-muted small">
                                Override the Background Service's target schedule (normally runs the 20th of the month) to demo mass dynamic evaluation.
                            </p>
                        </div>
                        <div className="d-flex flex-column gap-3 mt-4">
                            <button type="button" className="btn btn-outline-info rounded-pill" onClick={() => handleSetDemoTime(1)} disabled={evalLoading}>
                                {evalLoading ? "Scheduling..." : "Evaluate in 1 Minute"}
                            </button>
                            <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => handleSetDemoTime(1440)} disabled={evalLoading}>
                                Evaluate Tomorrow
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>

            <style>{`
                .x-small { font-size: 0.7rem; }
            `}</style>
        </section>
    );
}
