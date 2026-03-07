import React from 'react';
import { Link } from 'react-router-dom';
import './Ebay.css';

const EbayHeader = () => {
    return (
        <header className="ebay-header">
            <div className="ebay-header-utility">
                <div className="ebay-utility-left">
                    <span>Hi! <Link to="/login">Sign in</Link> or <Link to="#">register</Link></span>
                    <Link to="#">Daily Deals</Link>
                    <Link to="#">Brand Outlet</Link>
                    <Link to="#">Help & Contact</Link>
                </div>
                <div className="ebay-utility-right">
                    <Link to="#">Ship to</Link>
                    <Link to="#">Sell</Link>
                    <Link to="#">Watchlist</Link>
                    <Link to="#">My eBay</Link>
                    <i className="bi bi-bell"></i>
                    <i className="bi bi-cart"></i>
                </div>
            </div>

            <div className="ebay-header-main">
                <Link to="/home" className="ebay-logo">
                    <span style={{ color: '#e53238' }}>e</span>
                    <span style={{ color: '#0064d2' }}>b</span>
                    <span style={{ color: '#f5af02' }}>a</span>
                    <span style={{ color: '#86b817' }}>y</span>
                </Link>

                <div className="ebay-shop-by-category">
                    <span>Shop by category <i className="bi bi-chevron-down"></i></span>
                </div>

                <div className="ebay-search-bar">
                    <div className="ebay-search-input-wrapper">
                        <i className="bi bi-search"></i>
                        <input type="text" placeholder="Search for anything" />
                    </div>
                    <select className="ebay-category-select">
                        <option>All Categories</option>
                        <option>Antiques</option>
                        <option>Art</option>
                    </select>
                    <button className="ebay-search-btn">Search</button>
                </div>
                <span className="ebay-advanced-search">Advanced</span>
            </div>

            <nav className="ebay-main-nav">
                <ul>
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="#">Saved</Link></li>
                    <li><Link to="#">Motors</Link></li>
                    <li><Link to="#">Electronics</Link></li>
                    <li><Link to="#">Collectibles</Link></li>
                    <li><Link to="#">Home & Garden</Link></li>
                    <li><Link to="#">Fashion</Link></li>
                    <li><Link to="#">Toys</Link></li>
                    <li><Link to="#">Sporting Goods</Link></li>
                    <li><Link to="#">Business & Industrial</Link></li>
                    <li><Link to="#">Jewelry & Watches</Link></li>
                    <li><Link to="#">eBay Refurbished</Link></li>
                    {/* Link to dashboard for the user */}
                    <li><Link to="/dashboard" style={{ color: '#0064d2', fontWeight: 'bold' }}>Admin Dashboard</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default EbayHeader;
