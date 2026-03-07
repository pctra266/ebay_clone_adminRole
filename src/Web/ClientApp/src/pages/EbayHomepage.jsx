import React from 'react';
import { Link } from 'react-router-dom';
import EbayHeader from '../components/EbayHeader';
import { categories, dailyDeals, heroBanner } from '../data/ebayMockData';
import '../components/Ebay.css';

const EbayHomepage = () => {
    return (
        <div className="ebay-container">
            <EbayHeader />

            <main>
                {/* Categories Carousel */}
                <section className="ebay-categories-section">
                    <div className="ebay-categories-scroll">
                        {categories.map(category => (
                            <Link to="#" key={category.id} className="ebay-category-item">
                                <div className="ebay-category-img-container">
                                    <img src={category.image} alt={category.name} />
                                </div>
                                <h3>{category.name}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Hero Banner */}
                <section className="ebay-hero-banner">
                    <div className="ebay-hero-image-wrapper">
                        <img src={heroBanner.image} alt="Hero Banner" className="ebay-hero-img" />
                    </div>
                    <div className="ebay-hero-content">
                        <h2>{heroBanner.title}</h2>
                        <p>{heroBanner.subtitle}</p>
                        <button className="ebay-hero-btn">{heroBanner.cta} <i className="bi bi-arrow-right"></i></button>
                    </div>
                </section>

                {/* Daily Deals Section */}
                <section className="ebay-deals-section">
                    <div className="ebay-deals-header">
                        <h2>Today's Deals – All With Free Shipping</h2>
                        <Link to="#">See all <i className="bi bi-arrow-right"></i></Link>
                    </div>
                    <div className="ebay-deals-grid">
                        {dailyDeals.map(deal => (
                            <Link to="#" key={deal.id} className="ebay-deal-card">
                                <div className="ebay-deal-img-wrapper">
                                    <img src={deal.image} alt={deal.title} />
                                </div>
                                <h3 className="ebay-deal-title">{deal.title}</h3>
                                <div className="ebay-deal-price">{deal.price}</div>
                                <div className="ebay-deal-meta">
                                    {deal.originalPrice && <span className="ebay-deal-original">{deal.originalPrice}</span>}
                                    {deal.discount && <span>{deal.discount}</span>}
                                </div>
                                {deal.sold && <div className="ebay-deal-sold">{deal.sold}</div>}
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EbayHomepage;
