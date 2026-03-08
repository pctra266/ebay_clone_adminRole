import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import EbayHeader from '../components/EbayHeader';
import HeroCarousel from '../components/HeroCarousel';
import { dailyDeals, heroSlides, techDestinations, loyaltyBanner, motorsBanner } from '../data/ebayMockData';
import '../components/Ebay.css';

const EbayHomepage = () => {
    const techCarouselRef = useRef(null);

    const handleTechScroll = (direction) => {
        if (!techCarouselRef.current) {
            return;
        }

        const scrollAmount = techCarouselRef.current.clientWidth * 0.8;
        techCarouselRef.current.scrollBy({
            left: direction === 'next' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        });
    };

    return (
        <div className="ebay-container">
            <EbayHeader />
            <HeroCarousel slides={heroSlides} />

            <main>
                <section
                    className="ebay-tech-highlights"
                    aria-labelledby="ebay-tech-highlights-title"
                >
                    <div className="ebay-tech-highlights-header">
                        <h2 id="ebay-tech-highlights-title">The future in your hands</h2>
                        <p>
                            Handpicked destinations for the devices and components powering your next breakthrough.
                        </p>
                    </div>

                    <div
                        className="ebay-tech-carousel"
                        role="group"
                        aria-roledescription="Carousel"
                        aria-label="Popular tech destinations"
                    >
                        <div className="ebay-tech-carousel__viewport" ref={techCarouselRef}>
                            <ul className="ebay-tech-carousel__list" role="list">
                                {techDestinations.map((destination) => (
                                    <li key={destination.id} className="ebay-tech-card">
                                        <a
                                            className="ebay-tech-card__link"
                                            href={destination.href}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span className="ebay-tech-card__media">
                                                <img src={destination.image} alt={destination.alt} loading="lazy" />
                                                <span className="ebay-tech-card__overlay" aria-hidden="true" />
                                            </span>
                                            <span className="ebay-tech-card__label">{destination.label}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="ebay-tech-carousel__controls">
                            <button
                                type="button"
                                className="ebay-tech-carousel__control"
                                aria-label="Scroll carousel left"
                                onClick={() => handleTechScroll('prev')}
                            >
                                <i className="bi bi-chevron-left" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className="ebay-tech-carousel__control"
                                aria-label="Scroll carousel right"
                                onClick={() => handleTechScroll('next')}
                            >
                                <i className="bi bi-chevron-right" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </section>

                {loyaltyBanner && (
                    <section
                        className="ebay-loyalty-banner"
                        aria-labelledby="ebay-loyalty-banner-title"
                    >
                        <div className="ebay-loyalty-banner__content">
                            <h2 id="ebay-loyalty-banner-title">
                                <a
                                    href={loyaltyBanner.ctaHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ebay-loyalty-banner__heading-link"
                                >
                                    {loyaltyBanner.title}
                                </a>
                            </h2>

                            <div className="ebay-loyalty-banner__body">
                                <p>{loyaltyBanner.description}</p>

                                <a
                                    href={loyaltyBanner.ctaHref}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ebay-loyalty-banner__cta ebay-loyalty-banner__cta--mobile"
                                >
                                    {loyaltyBanner.ctaLabel}
                                </a>

                                <span className="ebay-loyalty-banner__terms">
                                    <a href={loyaltyBanner.termsHref} target="_blank" rel="noreferrer">
                                        {loyaltyBanner.termsLabel}
                                    </a>
                                </span>
                            </div>
                        </div>

                        <a
                            href={loyaltyBanner.ctaHref}
                            target="_blank"
                            rel="noreferrer"
                            className="ebay-loyalty-banner__cta ebay-loyalty-banner__cta--desktop"
                        >
                            {loyaltyBanner.ctaLabel}
                        </a>
                    </section>
                )}

                {motorsBanner && (
                    <aside
                        className="ebay-motors-banner"
                        aria-labelledby="ebay-motors-banner-title"
                        style={{
                            '--ebay-motors-bg': motorsBanner.background,
                            '--ebay-motors-fg': motorsBanner.foreground
                        }}
                    >
                        <div className="ebay-motors-banner__grid">
                            <div className="ebay-motors-banner__body">
                                <h2 id="ebay-motors-banner-title">{motorsBanner.title}</h2>
                                <p>{motorsBanner.description}</p>
                                <a
                                    className="ebay-motors-banner__cta"
                                    href={motorsBanner.ctaHref}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {motorsBanner.ctaLabel}
                                </a>
                                <p className="ebay-motors-banner__terms">
                                    <a href={motorsBanner.termsHref} target="_blank" rel="noreferrer">
                                        {motorsBanner.termsLabel}
                                    </a>
                                </p>
                            </div>

                            <div className="ebay-motors-banner__media">
                                <img
                                    src={motorsBanner.image}
                                    alt={motorsBanner.imageAlt}
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </aside>
                )}

                <section className="ebay-deals-section">
                    <div className="ebay-deals-header">
                        <h2>Today's Deals – All With Free Shipping</h2>
                        <Link to="#">
                            See all <i className="bi bi-arrow-right"></i>
                        </Link>
                    </div>
                    <div className="ebay-deals-grid">
                        {dailyDeals.map((deal) => (
                            <Link to="#" key={deal.id} className="ebay-deal-card">
                                <div className="ebay-deal-img-wrapper">
                                    <img src={deal.image} alt={deal.title} />
                                </div>
                                <h3 className="ebay-deal-title">{deal.title}</h3>
                                <div className="ebay-deal-price">{deal.price}</div>
                                <div className="ebay-deal-meta">
                                    {deal.originalPrice && (
                                        <span className="ebay-deal-original">{deal.originalPrice}</span>
                                    )}
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
