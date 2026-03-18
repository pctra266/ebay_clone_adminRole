import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import EbayHeader from '../components/EbayHeader';
import EbayFooter from '../components/EbayFooter';
import { productService } from '../services/productService';
import { reviewsService } from '../services/reviewsService';
import { useAuth } from '../services/useAuth';
import '../components/EbayProductDetail.css';

const EbayProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const { user, isAuth } = useAuth();
    
    // States for Review Modal/Forms
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    
    // States for Seller Actions
    const [replyingTo, setReplyingTo] = useState(null); // Review ID
    const [sellerReplyText, setSellerReplyText] = useState('');
    const [reportingReview, setReportingReview] = useState(null); // Review ID
    const [reportReason, setReportReason] = useState('Other');
    const [reportDescription, setReportDescription] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                
                // Initialize active image
                if (data && data.images) {
                    try {
                        const parsed = JSON.parse(data.images);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setActiveImage(parsed[0]);
                        } else {
                            setActiveImage(data.images);
                        }
                    } catch (e) {
                         setActiveImage(data.images);
                    }
                }
            } catch (error) {
                console.error("Error loading product details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const formatPrice = (price) => {
        return price ? `$${price.toFixed(2)}` : 'N/A';
    };

    const parseImages = (imgStr) => {
        if (!imgStr) return [];
        try {
            const parsed = JSON.parse(imgStr);
            if (Array.isArray(parsed)) return parsed;
            return [imgStr];
        } catch (e) {
            return [imgStr];
        }
    };

    const handleCreateReview = async (e) => {
        e.preventDefault();
        try {
            await reviewsService.createReview({
                productId: parseInt(id),
                reviewerId: user.userId,
                rating: reviewRating,
                comment: reviewComment
            });
            alert("Your review has been sent!");
            window.location.reload();
        } catch (error) {
            alert(error.response?.data || "An error occurred while sending the review. Please check if you have purchased this product.");
        }
    };

    const handleSellerReply = async (reviewId) => {
        try {
            await reviewsService.replyToReview(reviewId, {
                sellerId: user.userId,
                reply: sellerReplyText
            });
            alert("Response sent!");
            setReplyingTo(null);
            setSellerReplyText('');
            // Refresh data
            const updated = await productService.getProductById(id);
            setProduct(updated);
        } catch (error) {
            alert("Error while responding.");
        }
    };

    const handleReportReview = async (reviewId) => {
        try {
            await reviewsService.reportReview(reviewId, {
                reporterId: user.userId || null,
                reason: reportReason,
                description: reportDescription
            });
            alert("Reported this review to admin.");
            setReportingReview(null);
            setReportReason('Other');
            setReportDescription('');
            // Optional: refresh or just keep as is since it's a report
        } catch (error) {
            alert("Error while reporting.");
        }
    };

    if (loading) {
        return (
            <div className="ebay-container">
                <EbayHeader />
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading product details...</div>
                <EbayFooter />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="ebay-container">
                <EbayHeader />
                <div style={{ padding: '40px', textAlign: 'center' }}>Product not found.</div>
                <EbayFooter />
            </div>
        );
    }

    const images = parseImages(product.images);
    const primaryImage = activeImage || images[0] || 'https://via.placeholder.com/500';

    return (
        <div className="ebay-container ebay-product-page">
            <EbayHeader />
            <main className="ebay-product-main">
                <nav className="ebay-breadcrumbs" aria-label="breadcrumb">
                    <ol>
                        <li><Link to="/home">Home</Link></li>
                        <li>&gt;</li>
                        <li>Products</li>
                        <li>&gt;</li>
                        <li aria-current="page">{product.title}</li>
                    </ol>
                </nav>

                <div className="ebay-product-content">
                    {/* Left: Images */}
                    <div className="ebay-product-gallery">
                        <div className="ebay-product-thumbnails">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    className={`thumbnail-btn ${activeImage === img ? 'active' : ''}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                        <div className="ebay-product-main-image">
                            <img src={primaryImage} alt={product.title} />
                        </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="ebay-product-info">
                        <h1 className="ebay-product-title">{product.title}</h1>
                        <div className="ebay-product-rating-overview">
                            <span className="stars">
                                {'★'.repeat(5)}{' '}
                                <span className="review-count">({product.reviews?.length || 0} product ratings)</span>
                            </span>
                        </div>
                        <div className="ebay-product-condition">
                            <span className="condition-label">Condition: </span>
                            <span className="condition-value">Brand New</span>
                        </div>

                        <div className="ebay-product-price-box">
                            <div className="price-row">
                                <span className="price-label">Price:</span>
                                <span className="price-value">{formatPrice(product.price)}</span>
                            </div>
                            <div className="buy-actions">
                                <button className="btn-buy-now">Buy It Now</button>
                                <button className="btn-add-cart">Add to cart</button>
                                <button className="btn-add-watchlist">
                                    <i className="bi bi-heart"></i> Add to Watchlist
                                </button>
                            </div>
                        </div>

                        <div className="ebay-product-shipping">
                            <div className="shipping-row">
                                <span className="shipping-icon"><i className="bi bi-truck"></i></span>
                                <div className="shipping-details">
                                    <strong>Free 3 day shipping</strong>
                                    <p>Get it by <strong>3 days from today</strong></p>
                                </div>
                            </div>
                            <div className="returns-row">
                                <span className="returns-icon"><i className="bi bi-arrow-return-left"></i></span>
                                <div className="returns-details">
                                    <strong>Free 30 day returns</strong>
                                    <p>Buyer pays for return shipping</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Seller Info */}
                    <div className="ebay-product-seller">
                        <div className="seller-box">
                            <h2 className="seller-title">Seller information</h2>
                            <div className="seller-name-row">
                                <span className="seller-username">
                                    <Link to={`/seller/${product.sellerId}`}>{product.sellerName}</Link>
                                </span>
                                <span className="seller-feedback">(100% positive feedback)</span>
                            </div>
                            <div className="seller-actions">
                                <button className="btn-save-seller"><i className="bi bi-heart"></i> Save this seller</button>
                                <button className="btn-contact-seller">Contact seller</button>
                                <button className="btn-visit-store">Visit store</button>
                                <button className="btn-see-other-items">See other items</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom: Tabs (Description & Reviews) */}
                <div className="ebay-product-tabs">
                    <ul className="tab-headers">
                        <li className="active">Description</li>
                        <li>Reviews ({product.reviews?.length || 0})</li>
                    </ul>
                    <div className="tab-content">
                        <div className="description-section">
                            <h3>Product Description</h3>
                            <p>{product.description || 'No description provided for this product.'}</p>
                        </div>

                        <div className="reviews-section" style={{ marginTop: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3>Customer Reviews</h3>
                                {isAuth && user.userId !== product.sellerId && (
                                    <button 
                                        className="btn-write-review"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        Write a review
                                    </button>
                                )}
                            </div>

                            {showReviewForm && (
                                <div className="review-form-box" style={{ background: '#f7f7f7', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                                    <h4>Write your review</h4>
                                    <form onSubmit={handleCreateReview}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Rating:</label>
                                            <select 
                                                value={reviewRating} 
                                                onChange={(e) => setReviewRating(parseInt(e.target.value))}
                                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            >
                                                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Comment:</label>
                                            <textarea 
                                                className="ebay-textarea"
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                placeholder="What did you think of this product?"
                                                required
                                                style={{ width: '100%', height: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                            ></textarea>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button type="submit" className="btn-submit-review">Submit Review</button>
                                            <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {product.reviews && product.reviews.length > 0 ? (
                                <ul className="review-list" style={{ listStyle: 'none', padding: 0 }}>
                                    {product.reviews.map(review => (
                                        <li key={review.id} className="review-item" style={{ borderBottom: '1px solid #eee', padding: '20px 0' }}>
                                            <div className="review-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                                <span className="review-rating" style={{ color: '#ffb520', fontSize: '18px', marginRight: '10px' }}>
                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                </span>
                                                <span className="reviewer-name" style={{ fontWeight: 'bold', marginRight: '10px' }}>
                                                    {review.reviewerName}
                                                </span>
                                                <span className="review-date" style={{ color: '#767676', fontSize: '12px' }}>
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="review-comment" style={{ margin: '0 0 10px 0', color: '#333', fontSize: '15px' }}>
                                                {review.comment}
                                            </p>

                                            {/* Seller Reply Display */}
                                            {review.sellerReply && (
                                                <div className="seller-reply-box" style={{ marginLeft: '30px', background: '#f9f9f9', padding: '15px', borderRadius: '4px', borderLeft: '4px solid #3665f3', marginTop: '10px' }}>
                                                    <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>
                                                        Seller Response <span style={{ color: '#767676', fontWeight: 'normal', fontSize: '12px' }}>on {new Date(review.sellerReplyCreatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '14px' }}>{review.sellerReply}</p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="review-actions" style={{ marginTop: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                {isAuth && user.userId === product.sellerId && !review.sellerReply && (
                                                    <button 
                                                        className="link-action" 
                                                        style={{ background: 'none', border: 'none', color: '#3665f3', cursor: 'pointer', padding: 0 }}
                                                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                                                    >
                                                        {replyingTo === review.id ? 'Cancel Reply' : 'Reply'}
                                                    </button>
                                                )}
                                                
                                                {/* Report allowed for all users (or just logged in) */}
                                                <button 
                                                    className="link-action" 
                                                    style={{ background: 'none', border: 'none', color: '#767676', cursor: 'pointer', padding: 0, fontSize: '13px' }}
                                                    onClick={() => {
                                                        if (!isAuth) {
                                                            alert("Please login to report.");
                                                            return;
                                                        }
                                                        setReportingReview(reportingReview === review.id ? null : review.id);
                                                    }}
                                                >
                                                    {reportingReview === review.id ? 'Cancel Report' : 'Report'}
                                                </button>
                                            </div>

                                            {/* Inline Seller Reply Form */}
                                            {replyingTo === review.id && (
                                                <div style={{ marginTop: '15px', marginLeft: '30px' }}>
                                                    <textarea 
                                                        placeholder="Write your response to this buyer..."
                                                        className="ebay-textarea"
                                                        value={sellerReplyText}
                                                        onChange={(e) => setSellerReplyText(e.target.value)}
                                                        style={{ width: '100%', height: '60px', marginBottom: '10px' }}
                                                    ></textarea>
                                                    <button className="btn-reply-submit" onClick={() => handleSellerReply(review.id)}>Send Reply</button>
                                                </div>
                                            )}

                                            {/* Inline Report Form */}
                                            {reportingReview === review.id && (
                                                <div style={{ marginTop: '15px', padding: '15px', border: '1px solid #ddd', background: '#fcfcfc', borderRadius: '4px' }}>
                                                    <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>Report inappropriate review</p>
                                                    
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px' }}>Reason:</label>
                                                        <select 
                                                            value={reportReason} 
                                                            onChange={(e) => setReportReason(e.target.value)}
                                                            style={{ width: '100%', padding: '5px' }}
                                                        >
                                                            <option value="Spam">Spam</option>
                                                            <option value="Fake">Fake Review</option>
                                                            <option value="Inappropriate">Inappropriate Language</option>
                                                            <option value="Harassment">Harassment</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>

                                                    <textarea 
                                                        placeholder="Provide more details (optional)..."
                                                        className="ebay-textarea"
                                                        value={reportDescription}
                                                        onChange={(e) => setReportDescription(e.target.value)}
                                                        style={{ width: '100%', height: '60px', marginBottom: '10px' }}
                                                    ></textarea>
                                                    <button className="btn-report-submit" onClick={() => handleReportReview(review.id)}>Submit Report</button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No reviews yet for this product.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <EbayFooter />
        </div>
    );
};

export default EbayProductDetail;
