import React from 'react';
import './Ebay.css';

const footerSections = [
    {
        id: 'buy',
        title: 'Buy',
        links: [
            { label: 'Registration', href: 'https://reg.ebay.com/reg/PartialReg' },
            { label: 'Bidding & buying help', href: 'https://www.ebay.com/help/buying/buying-overview/bidding-buying-help?id=4005' },
            { label: 'Stores', href: 'https://www.ebay.com/str' },
            { label: 'Creator Collections', href: 'https://www.ebay.com/e/_electronics/creator-collection' },
            { label: 'eBay for Charity', href: 'https://charity.ebay.com/' },
            { label: 'Charity Shop', href: 'https://www.ebay.com/usr/charityshop' },
            { label: 'Seasonal Sales and events', href: 'https://www.ebay.com/deals' },
            { label: 'eBay Gift Cards', href: 'https://www.ebay.com/giftcards' }
        ]
    },
    {
        id: 'sell',
        title: 'Sell',
        links: [
            { label: 'Start selling', href: 'https://www.ebay.com/sl/sell' },
            { label: 'How to sell', href: 'https://www.ebay.com/help/selling' },
            { label: 'Business sellers', href: 'https://www.ebay.com/help/selling/business-and-policy/business-sellers?id=4081' },
            { label: 'Affiliates', href: 'https://partnernetwork.ebay.com/' }
        ]
    },
    {
        id: 'tools',
        title: 'Tools & apps',
        links: [
            { label: 'Developers', href: 'https://developer.ebay.com/' },
            { label: 'Security center', href: 'https://pages.ebay.com/securitycenter/index.html' },
            { label: 'Site map', href: 'https://www.ebay.com/sitemap' }
        ]
    },
    {
        id: 'about',
        title: 'About eBay',
        links: [
            { label: 'Company info', href: 'https://www.ebayinc.com/company/' },
            { label: 'News', href: 'https://www.ebayinc.com/stories/news/' },
            { label: 'Deferred Prosecution Agreement with District of Massachusetts', href: 'https://www.ebayinc.com/stories/news/deferred-prosecution-agreement-with-district-of-massachusetts/' },
            { label: 'Investors', href: 'https://investors.ebayinc.com/' },
            { label: 'Careers', href: 'https://jobs.ebayinc.com/' },
            { label: 'Diversity & Inclusion', href: 'https://www.ebayinc.com/company/diversity-inclusion/' },
            { label: 'Global Impact', href: 'https://www.ebayinc.com/impact/' },
            { label: 'Government relations', href: 'https://www.ebayinc.com/company/government-relations/' },
            { label: 'Advertise with us', href: 'https://advertising.ebay.com/' },
            { label: 'Policies', href: 'https://www.ebay.com/help/policies' },
            { label: 'Verified Rights Owner (VeRO) Program', href: 'https://pages.ebay.com/vero/' },
            { label: 'eCI Licenses', href: 'https://www.ebay.com/help/policies/vero-program-eci/eci-licenses?id=4347' },
            { label: 'Product Safety Tips', href: 'https://www.ebay.com/help/policies/prohibited-restricted-items/product-safety-tips?id=4323' }
        ]
    },
    {
        id: 'help',
        title: 'Help & Contact',
        links: [
            { label: 'Seller Center', href: 'https://sell.ebay.com/seller-center/' },
            { label: 'Contact Us', href: 'https://www.ebay.com/help/home' },
            { label: 'eBay Returns', href: 'https://www.ebay.com/help/buying/returns-refunds/returning-item?id=4041' },
            { label: 'eBay Money Back Guarantee', href: 'https://www.ebay.com/help/policies/ebay-money-back-guarantee-policy/ebay-money-back-guarantee-policy?id=4210' }
        ]
    },
    {
        id: 'community',
        title: 'Community',
        links: [
            { label: 'Announcements', href: 'https://community.ebay.com/t5/Announcements/bg-p/Announcements' },
            { label: 'eBay Community', href: 'https://community.ebay.com/' },
            { label: 'eBay for Business Podcast', href: 'https://community.ebay.com/t5/eBay-for-Business-Podcast/bg-p/eb4bPodcast' }
        ]
    }
];

const ebayCompanies = [{ label: 'TCGplayer', href: 'https://www.tcgplayer.com/' }];

const socialLinks = [
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/eBay', icon: 'bi bi-facebook' },
    { id: 'twitter', label: 'X (Twitter)', href: 'https://twitter.com/eBay', icon: 'bi bi-twitter-x' }
];

const legalLinks = [
    { label: 'Accessibility', href: 'https://www.ebay.com/accessibility' },
    { label: 'User Agreement', href: 'https://www.ebay.com/help/policies/member-behavior-policies/user-agreement?id=4259' },
    { label: 'Privacy', href: 'https://www.ebay.com/help/policies/member-behavior-policies/user-privacy-notice?id=4260' },
    { label: 'Consumer Health Data', href: 'https://www.ebay.com/help/policies/member-behavior-policies/consumer-health-data-rights?id=260828' },
    { label: 'Payments Terms of Use', href: 'https://www.ebay.com/help/policies/payment-policies/payments-terms-use?id=260212' },
    { label: 'Cookies', href: 'https://www.ebay.com/help/policies/member-behavior-policies/cookies-other-technologies?id=4257' },
    { label: 'CA Privacy Notice', href: 'https://www.ebay.com/help/policies/member-behavior-policies/california-privacy-disclosures?id=4820' },
    { label: 'Your Privacy Choices', href: 'https://www.ebay.com/choices' },
    { label: 'AdChoice', href: 'https://www.ebay.com/adchoice' }
];

const EbayFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="ebay-footer" aria-labelledby="ebay-footer-heading">
            <h2 id="ebay-footer-heading" className="ebay-visually-hidden">
                Explore additional eBay resources
            </h2>

            <div className="ebay-footer__grid">
                {footerSections.map((section) => (
                    <section
                        key={section.id}
                        className="ebay-footer__section"
                        aria-labelledby={`ebay-footer-${section.id}`}
                    >
                        <h3 id={`ebay-footer-${section.id}`}>{section.title}</h3>
                        <ul role="list">
                            {section.links.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} target="_blank" rel="noreferrer">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <section
                    className="ebay-footer__section ebay-footer__section--meta"
                    aria-labelledby="ebay-footer-companies"
                >
                    <h3 id="ebay-footer-companies">eBay companies</h3>
                    <ul role="list">
                        {ebayCompanies.map((company) => (
                            <li key={company.label}>
                                <a href={company.href} target="_blank" rel="noreferrer">
                                    {company.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <div>
                        <h3 id="ebay-footer-connect">Stay connected</h3>
                        <ul className="ebay-footer__social" role="list" aria-labelledby="ebay-footer-connect">
                            {socialLinks.map((social) => (
                                <li key={social.id}>
                                    <a
                                        className="ebay-footer__social-link"
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <i className={social.icon} aria-hidden="true" />
                                        <span>{social.label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section
                    className="ebay-footer__section ebay-footer__section--locale"
                    aria-labelledby="ebay-footer-sites"
                >
                    <h3 id="ebay-footer-sites">eBay Sites</h3>
                    <button
                        type="button"
                        className="ebay-footer__locale-selector"
                        aria-label="Change eBay site location"
                    >
                        <span role="img" aria-label="United States">
                            🇺🇸
                        </span>
                        <span>United States</span>
                        <i className="bi bi-chevron-down" aria-hidden="true" />
                    </button>
                </section>
            </div>

            <div className="ebay-footer__legal">
                <p>
                    Copyright © 1995-
                    {currentYear} eBay Inc. All Rights Reserved.
                </p>
                <nav aria-label="Legal and privacy links">
                    <ul className="ebay-footer__legal-links" role="list">
                        {legalLinks.map((link) => (
                            <li key={link.label}>
                                <a href={link.href} target="_blank" rel="noreferrer">
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </footer>
    );
};

export default EbayFooter;