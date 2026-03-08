import React from 'react';
import { Link } from 'react-router-dom';
import './Ebay.css';

const EbayHeader = () => (
    <header className="ebay-header">
        <div className="ebay-header-utility">
            <div className="ebay-utility-left">
                <span>
                    Hi! <Link to="/login">Sign in</Link> or <Link to="#">register</Link>
                </span>
                <Link to="#">Deals</Link>
                <Link to="#">Brand Outlet</Link>
                <Link to="#">Gift Cards</Link>
                <Link to="#">Help & Contact</Link>
            </div>
            <div className="ebay-utility-right">
                <Link to="#">Ship to</Link>
                <Link to="#">Sell</Link>
                <Link to="#">Watchlist <i className="bi bi-chevron-down" aria-hidden="true" /></Link>
                <Link to="#">My eBay <i className="bi bi-chevron-down" aria-hidden="true" /></Link>
                <i className="bi bi-bell" aria-hidden="true" />
                <i className="bi bi-cart" aria-hidden="true" />
            </div>
        </div>

        <div className="ebay-header-main">
            <Link to="/home" className="ebay-logo" aria-label="eBay Home">
                <span style={{ color: '#e53238' }}>e</span>
                <span style={{ color: '#0064d2' }}>b</span>
                <span style={{ color: '#f5af02' }}>a</span>
                <span style={{ color: '#86b817' }}>y</span>
            </Link>

            <button type="button" className="ebay-shop-by-category">
                Shop by category <i className="bi bi-chevron-down" aria-hidden="true" />
            </button>

            <div className="ebay-search-row">
                <div className="ebay-search-field">
                    <i className="bi bi-search" aria-hidden="true" />
                    <input type="text" placeholder="Search for anything" aria-label="Search for anything" />
                    <button type="button" className="ebay-search-camera" aria-label="Search with camera">
                        <i className="bi bi-camera" />
                    </button>
                    <span className="ebay-search-divider" aria-hidden="true" />
                    <select className="ebay-category-select" aria-label="Select category">
                        <option>All Categories</option>
                        <option>Antiques</option>
                        <option>Art</option>
                    </select>
                </div>

                <button type="button" className="ebay-search-btn">Search</button>
                <button type="button" className="ebay-advanced-search">Advanced</button>
            </div>
        </div>

        <nav className="ebay-main-nav" aria-label="Primary">
            <ul>
                <li><Link to="#">Saved</Link></li>
                <li><Link to="#">Electronics</Link></li>
                <li><Link to="#">Motors</Link></li>
                <li><Link to="#">Fashion</Link></li>
                <li><Link to="#">Collectibles and Art</Link></li>
                <li><Link to="#">Sports</Link></li>
                <li><Link to="#">Health & Beauty</Link></li>
                <li><Link to="#">Industrial equipment</Link></li>
                <li><Link to="#">Home & Garden</Link></li>
                <li><Link to="#">Deals</Link></li>
                <li><Link to="#">Sell</Link></li>
            </ul>
        </nav>
    </header>
);

export default EbayHeader;