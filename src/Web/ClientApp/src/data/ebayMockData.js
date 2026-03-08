export const categories = [
  { id: 1, name: 'Sneakers', image: '/images/ebay_sneaker.png' },
  { id: 2, name: 'Watches', image: '/images/ebay_watch.png' },
  { id: 3, name: 'Electronics', image: '/images/ebay_laptop.png' },
  { id: 4, name: 'Cameras', image: '/images/ebay_camera.png' },
  { id: 5, name: 'Fashion', image: '/images/ebay_bag.png' },
  { id: 6, name: 'Collectibles', image: '/images/ebay_sneaker.png' },
  { id: 7, name: 'Home & Garden', image: '/images/ebay_laptop.png' }
];

export const dailyDeals = [
  {
    id: 101,
    title: 'Apple MacBook Pro 14" M2 Pro 512GB - Silver',
    price: '$1,799.00',
    originalPrice: '$1,999.00',
    discount: '10% off',
    image: '/images/ebay_laptop.png',
    sold: '150+ sold'
  },
  {
    id: 102,
    title: 'Sony Alpha a7 III Mirrorless Camera Body',
    price: '$1,498.00',
    originalPrice: '$1,698.00',
    discount: '11% off',
    image: '/images/ebay_camera.png',
    sold: '85 sold'
  },
  {
    id: 103,
    title: 'Nike Air Jordan 1 Retro High OG Black/White',
    price: '$180.00',
    originalPrice: '$210.00',
    discount: '14% off',
    image: '/images/ebay_sneaker.png',
    sold: '500+ sold'
  },
  {
    id: 104,
    title: 'Rolex Submariner Date 41mm Stainless Steel',
    price: '$14,500.00',
    image: '/images/ebay_watch.png',
    sold: 'Authenticity Guarantee'
  },
  {
    id: 105,
    title: 'Designer Leather Crossbody Bag - Black',
    price: '$245.00',
    originalPrice: '$350.00',
    discount: '30% off',
    image: '/images/ebay_bag.png',
    sold: 'Almost gone'
  }
];

export const heroSlides = [
  {
    id: 'motors',
    title: "It's up to you",
    subtitle: 'Customize your ride, your way, with a selection of parts on eBay.',
    ctaLabel: 'Explore offers',
    ctaHref: 'https://www.ebay.com/e/row/motormar26',
    termsLabel: 'Discounts in USD. *See terms.',
    termsHref: 'https://pages.ebay.com/promo/2026/motormar26/#section-0',
    image: 'https://i.ebayimg.com/images/g/fl4AAeSwV0hpndZs/s-l960.webp',
    background: 'linear-gradient(135deg, #00428e 0%, #0080d6 65%)',
    foreground: '#f2f6ff',
    kicker: 'Motors'
  },
  {
    id: 'phones',
    title: 'From selfies to streaming',
    subtitle: "Discover top brands and the latest models at prices you'll love.",
    ctaLabel: 'Upgrade now',
    ctaHref: 'https://www.ebay.com/b/Cell-Phones-Smartphones/9355/bn_320094',
    background: '#f4f5fb',
    foreground: '#1f2024',
    kicker: 'Smartphones',
    tiles: [
      {
        id: 'apple',
        label: 'Apple',
        href: 'https://www.ebay.com/b/Apple-Cell-Phones-Smartphones/9355/bn_319682',
        image: 'https://i.ebayimg.com/images/g/cWIAAeSw3ABo0~sF/s-l500.webp'
      },
      {
        id: 'samsung',
        label: 'Samsung',
        href: 'https://www.ebay.com/b/Samsung-Cell-Phones-and-Smartphones/9355/bn_352130',
        image: 'https://i.ebayimg.com/images/g/cmAAAeSwJFpo0~sH/s-l500.webp'
      },
      {
        id: 'xiaomi',
        label: 'Xiaomi',
        href: 'https://www.ebay.com/b/Xiaomi-Cell-Phones-Smartphones/9355/bn_315817',
        image: 'https://i.ebayimg.com/images/g/qi4AAeSwxwRo0~sI/s-l500.webp'
      }
    ]
  },
  {
    id: 'luxe',
    title: 'Good taste is timeless',
    subtitle: 'Create iconic looks with up to $140* off luxury items.',
    ctaLabel: 'Set your own trends',
    ctaHref: 'https://www.ebay.com/e/row/luxmar26-eng',
    termsLabel: 'Discounts in USD. *See terms.',
    termsHref: 'https://pages.ebay.com/promo/2026/luxmar26/#section-0',
    image: 'https://i.ebayimg.com/images/g/tloAAeSwT7RpoCm5/s-l960.webp',
    background: 'linear-gradient(135deg, #b38adf 0%, #f3d9ff 85%)',
    foreground: '#1f0b2f',
    kicker: 'Luxury'
  }
];

export const techDestinations = [
  {
    id: 'laptops',
    label: 'Laptops',
    href: 'https://www.ebay.com/b/bn_1648276',
    image: 'https://i.ebayimg.com/images/g/SwAAAeSwvwZpqvtW/s-l500.webp',
    alt: 'Assorted performance laptops'
  },
  {
    id: 'computer-parts',
    label: 'Computer parts',
    href: 'https://www.ebay.com/b/bn_1643095',
    image: 'https://i.ebayimg.com/images/g/Dz0AAeSwpDhpqvtW/s-l500.webp',
    alt: 'Collection of computer components'
  },
  {
    id: 'smartphones',
    label: 'Smartphones',
    href: 'https://www.ebay.com/b/bn_320094',
    image: 'https://i.ebayimg.com/images/g/Rp0AAeSw2yNpqvtW/s-l500.webp',
    alt: 'Latest flagship smartphones'
  },
  {
    id: 'enterprise-networking',
    label: 'Enterprise networking',
    href: 'https://www.ebay.com/b/bn_1309143',
    image: 'https://i.ebayimg.com/images/g/O~AAAeSwcIZpqvtW/s-l500.webp',
    alt: 'Enterprise-grade networking hardware'
  },
  {
    id: 'tablets-ebooks',
    label: 'Tablets and eBooks',
    href: 'https://www.ebay.com/b/bn_320042',
    image: 'https://i.ebayimg.com/images/g/DaUAAeSwYXxpqvtW/s-l500.webp',
    alt: 'Tablets and eBook readers'
  },
  {
    id: 'storage-media',
    label: 'Storage and blank media',
    href: 'https://www.ebay.com/b/bn_738891',
    image: 'https://i.ebayimg.com/images/g/JmMAAeSwUztpqvu5/s-l500.webp',
    alt: 'Hard drives and blank storage media'
  },
  {
    id: 'lenses-filters',
    label: 'Lenses and filters',
    href: 'https://www.ebay.com/b/bn_152392',
    image: 'https://i.ebayimg.com/images/g/RusAAeSw0uxpqvtW/s-l500.webp',
    alt: 'Camera lenses and optical filters'
  }
];

export const loyaltyBanner = {
  id: 'luxmar26',
  title: 'Style worth keeping',
  description: 'Get up to $140* off luxury that never fades.',
  ctaLabel: 'Code: LUXMAR26',
  ctaHref: 'https://www.ebay.com/e/row/luxmar26-eng',
  termsLabel: 'Discounts in USD. *See terms.',
  termsHref: 'https://pages.ebay.com/promo/2026/luxmar26/#section-0'
};

export const motorsBanner = {
  id: 'motormar26-banner',
  title: 'More choice, on and off the road',
  description: 'Get where you need to go with the right parts and accessories.',
  ctaLabel: 'Explore offers',
  ctaHref: 'https://www.ebay.com/e/row/motormar26',
  termsLabel: 'Discounts in USD. *See terms.',
  termsHref: 'https://pages.ebay.com/promo/2026/motormar26/#section-0',
  image: 'https://i.ebayimg.com/images/g/3LsAAeSw5YFpndf6/s-l960.webp',
  imageAlt: 'Sport utility vehicle driving across open terrain',
  background: '#0046bd',
  foreground: '#e6f0ff'
};