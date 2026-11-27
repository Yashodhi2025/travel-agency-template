"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = void 0;
exports.EditableFooter = EditableFooter;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SiteDataProvider_1 = require("@deneb-ui/ui");
const EditableText_1 = require("@deneb-ui/ui");
const EditableIcon_1 = require("@deneb-ui/ui");

const DEFAULT_FOOTER_PAGES = [
    { id: 'home', navLabelKey: 'home', label: 'Home', route: '/' },
    { id: 'destinations', navLabelKey: 'destinations', label: 'Destinations', route: '/destinations/' },
    { id: 'tours', navLabelKey: 'packages', label: 'Tour Packages', route: '/tours/' },
    { id: 'experiences', navLabelKey: 'experiences', label: 'Experiences', route: '/experiences/' },
    { id: 'services', navLabelKey: 'services', label: 'Services', route: '/services/' },
    { id: 'about_us', navLabelKey: 'about_us', label: 'About Us', route: '/about_us/' },
    { id: 'contact', navLabelKey: 'contact', label: 'Contact', route: '/contact/' },
];

const SOCIAL_ICONS = {
    instagram: {
        label: 'Instagram',
        icon: ((0, jsx_runtime_1.jsxs)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: [(0, jsx_runtime_1.jsx)("rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5" }), (0, jsx_runtime_1.jsx)("path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }), (0, jsx_runtime_1.jsx)("line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5" })] })),
    },
    facebook: {
        label: 'Facebook',
        icon: ((0, jsx_runtime_1.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) })),
    },
    linkedin: {
        label: 'LinkedIn',
        icon: ((0, jsx_runtime_1.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" }) })),
    },
    youtube: {
        label: 'YouTube',
        icon: ((0, jsx_runtime_1.jsx)("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" }) })),
    },
    twitter: {
        label: 'X (Twitter)',
        icon: ((0, jsx_runtime_1.jsx)("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" }) })),
    },
};

function safeUrl(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed || /[\u0000-\u0020\u007f]/.test(trimmed)) return '';
    if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) && !/^(https?:|mailto:|tel:)/i.test(trimmed)) return '';
    return trimmed;
}

function EditableFooter({
    defaultLinks = DEFAULT_FOOTER_PAGES,
    links = undefined,
    basePath = '',
    showNewsletter = true,
    className = '',
    style = {},
    ...props
}) {
    const siteData = (0, SiteDataProvider_1.useSiteData)();
    const [subscriberEmail, setSubscriberEmail] = (0, react_1.useState)('');
    const [newsletterNotice, setNewsletterNotice] = (0, react_1.useState)('');

    const content = siteData?.content || {};
    const common = content?.common || {};
    const contact = content?.contact || {};
    const home = content?.home || {};
    const shop = siteData?.shop || {};
    const shopContact = shop?.contact || {};

    const siteName = String(common?.websiteTitle || shop?.businessName || 'CEYLON ODYSSEY');
    const tagline = String(common?.tagline || '');
    const logoUrl = String(common?.logoUrl || shop?.logoUrl || '/images/brand-logo.svg');
    const navLabels = common?.navLabels || {};
    const shortDescription = String(common?.shortDescription || '');
    const footerHeading = String(common?.footerHeading || 'Seasonal Travel Notes');
    const copyright = String(common?.copyright || '');
    const policyLabel = String(common?.footerPolicyLabel || 'Privacy Policy');
    const rawPolicyUrl = safeUrl(common?.footerPolicyUrl);
    const termsLabel = String(common?.footerTermsLabel || 'Enquiry Terms');
    const rawTermsUrl = safeUrl(common?.footerTermsUrl);

    const phone = String(shopContact?.phone || shop?.businessPhone || contact?.phone || '');
    const emailContact = String(shopContact?.email || shop?.businessEmail || contact?.email || '');
    const address = String(shop?.address?.line1 || contact?.address || '');
    const openingHours = String(contact?.openingHours || '');
    const directMessageLabel = String(contact?.directMessageText || 'Chat on WhatsApp');
    const rawWhatsapp = String(shopContact?.whatsapp || shop?.businessWhatsapp || contact?.whatsapp || phone || '');
    const cleanDigits = rawWhatsapp.replace(/[^\d]/g, '');
    const whatsappHref = cleanDigits.length >= 7 ? `https://wa.me/${cleanDigits}` : '';

    const rawSocial = common?.socialMedia || {};
    const socialPlatforms = Object.keys(rawSocial).length > 0
        ? Object.keys(rawSocial)
        : ['instagram', 'facebook', 'linkedin', 'youtube'];

    const destinations = Array.isArray(home?.destinations) ? home.destinations.slice(0, 5) : [];
    const travelStyles = Array.isArray(home?.travelStyles) ? home.travelStyles.slice(0, 5) : [];
    const navigationItems = links || defaultLinks;
    const requiredPages = Array.isArray(siteData?.requirements?.requiredPages)
        ? siteData.requirements.requiredPages
        : siteData?.template?.structure?.pages || [
            'home',
            'destinations',
            'tours',
            'experiences',
            'about_us',
            'services',
            'contact',
        ];
    const hasDestinations = requiredPages.includes('destinations');
    const hasTours = requiredPages.includes('tours');
    const hasContact = requiredPages.includes('contact');
    const policyUrl = rawPolicyUrl && (hasContact || !rawPolicyUrl.includes('/contact'))
        ? rawPolicyUrl
        : '/#tailor-made';
    const termsUrl = rawTermsUrl && (hasContact || !rawTermsUrl.includes('/contact'))
        ? rawTermsUrl
        : '/#tailor-made';

    const basePathEnv = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_BASE_PATH
        ? process.env.NEXT_PUBLIC_SITE_BASE_PATH
        : '';
    const effectiveBasePath = basePath || basePathEnv;

    const withBase = (path) => {
        if (!path || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(path)) return path;
        const cleanBase = effectiveBasePath.replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${cleanBase}${cleanPath}` || '/';
    };

    const navigate = (path) => {
        if (typeof window !== 'undefined') {
            window.location.href = withBase(path);
        }
    };

    const handleNewsletterRequest = (e) => {
        e.preventDefault();
        const trimmed = subscriberEmail.trim();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setNewsletterNotice('Please enter a valid email address.');
            return;
        }
        if (emailContact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailContact)) {
            const subject = encodeURIComponent(`Seasonal Travel Notes Request — ${siteName}`);
            const body = encodeURIComponent(`Hello ${siteName},\n\nPlease share seasonal Sri Lanka travel notes with ${trimmed}.\n`);
            window.location.href = `mailto:${encodeURIComponent(emailContact)}?subject=${subject}&body=${body}`;
            setNewsletterNotice('Opened your email app to send your request directly.');
            setSubscriberEmail('');
        } else {
            setNewsletterNotice('Configure an agency email in Fivora Contact settings.');
        }
    };

    const scrollToTop = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        (0, jsx_runtime_1.jsxs)("footer", {
            className: `deneb-footer relative w-full border-t border-white/10 bg-[#0B1117] pb-20 pt-12 text-[#FAF8F3] lg:pb-8 ${className}`.trim(),
            style: { ...style },
            ...props,
            children: [
                (0, jsx_runtime_1.jsx)("div", {
                    className: "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C5A46D]/45 to-transparent",
                }),
                (0, jsx_runtime_1.jsxs)("div", {
                    className: "lux-container",
                    children: [
                        (0, jsx_runtime_1.jsxs)("div", {
                            className: "deneb-footer-grid mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-6",
                            children: [
                                // Column 1: Brand & Social
                                (0, jsx_runtime_1.jsxs)("div", {
                                    className: "flex flex-col gap-3 lg:col-span-3",
                                    children: [
                                        (0, jsx_runtime_1.jsxs)("button", {
                                            type: "button",
                                            onClick: () => navigate('/'),
                                            className: "inline-flex items-center gap-2.5 border-0 bg-transparent p-0 text-left",
                                            children: [
                                                (0, jsx_runtime_1.jsx)("img", {
                                                    src: withBase(logoUrl || '/images/brand-logo.svg'),
                                                    alt: siteName,
                                                    "data-preview-field-path": "common.logoUrl",
                                                    className: "h-8 w-8 rounded object-contain",
                                                }),
                                                (0, jsx_runtime_1.jsxs)("span", {
                                                    className: "flex flex-col",
                                                    children: [
                                                        (0, jsx_runtime_1.jsx)("span", {
                                                            "data-preview-field-path": "common.websiteTitle",
                                                            className: "font-display text-sm font-bold uppercase tracking-[0.16em] text-[#FAF8F3]",
                                                            children: siteName,
                                                        }),
                                                        (0, jsx_runtime_1.jsx)("span", {
                                                            "data-preview-field-path": "common.tagline",
                                                            className: "text-[9.5px] font-medium uppercase tracking-[0.2em] text-[#C5A46D]",
                                                            style: { minHeight: '1.05em' },
                                                            children: tagline,
                                                        }),
                                                    ],
                                                }),
                                            ],
                                        }),
                                        (0, jsx_runtime_1.jsx)("p", {
                                            "data-preview-field-path": "common.shortDescription",
                                            className: "m-0 max-w-xs text-xs leading-relaxed text-[#9AA7B2]",
                                            style: { minHeight: '1.2em' },
                                            children: shortDescription,
                                        }),
                                        (0, jsx_runtime_1.jsx)("div", {
                                            className: "mt-1 flex flex-wrap items-center gap-2",
                                            children: socialPlatforms.map((platformKey) => {
                                                const key = platformKey.toLowerCase();
                                                const iconConfig = SOCIAL_ICONS[key] || {
                                                    label: platformKey,
                                                    icon: (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase", children: platformKey.slice(0, 2) }),
                                                };
                                                const url = safeUrl(rawSocial[platformKey] || rawSocial[key]) || '#';
                                                return (0, jsx_runtime_1.jsx)("a", {
                                                    href: url,
                                                    target: url.startsWith('http') ? "_blank" : undefined,
                                                    rel: url.startsWith('http') ? "noopener noreferrer" : undefined,
                                                    "data-preview-field-path": `common.socialMedia.${key}`,
                                                    "aria-label": iconConfig.label,
                                                    title: iconConfig.label,
                                                    className: "flex h-8 w-8 items-center justify-center rounded border border-white/15 bg-white/5 text-[#FAF8F3]/80 transition hover:border-[#C5A46D] hover:text-[#C5A46D]",
                                                    children: iconConfig.icon,
                                                }, platformKey);
                                            }),
                                        }),
                                    ],
                                }),

                                // Column 2: Navigation, Destinations & Categories
                                (0, jsx_runtime_1.jsxs)("div", {
                                    className: "grid grid-cols-3 gap-4 lg:col-span-5",
                                    children: [
                                        (0, jsx_runtime_1.jsxs)("div", {
                                            children: [
                                                (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                    as: "h4",
                                                    fieldPath: "common.footerExploreHeading",
                                                    defaultValue: common.footerExploreHeading ?? 'Navigation',
                                                    placeholder: "Navigation",
                                                    size: "0.68rem",
                                                    weight: 700,
                                                    transform: "uppercase",
                                                    letterSpacing: "0.16em",
                                                    color: "#C5A46D",
                                                    style: { marginBottom: '0.75rem' },
                                                }),
                                                (0, jsx_runtime_1.jsx)("ul", {
                                                    className: "m-0 flex list-none flex-col gap-2 p-0",
                                                    children: navigationItems.map((link) => {
                                                        const labelKey = link.navLabelKey || link.id;
                                                        const isSelected = link.anchor || link.id === 'home' || requiredPages.includes(link.id);
                                                        const label = navLabels[labelKey] || link.label;
                                                        if (isSelected) {
                                                            return (0, jsx_runtime_1.jsx)("li", {
                                                                children: (0, jsx_runtime_1.jsx)("span", {
                                                                    "data-target-page": link.anchor ? undefined : link.id,
                                                                    children: (0, jsx_runtime_1.jsx)("button", {
                                                                        type: "button",
                                                                        onClick: () => navigate(link.route),
                                                                        className: "border-0 bg-transparent p-0 text-left text-xs text-[#9AA7B2] transition hover:text-[#FAF8F3]",
                                                                        children: (0, jsx_runtime_1.jsx)("span", {
                                                                            "data-preview-field-path": `common.navLabels.${labelKey}`,
                                                                            children: label,
                                                                        }),
                                                                    }),
                                                                }),
                                                            }, link.id);
                                                        }
                                                        return (0, jsx_runtime_1.jsx)("li", {
                                                            className: "unavailable text-xs text-[#9AA7B2]/50",
                                                            children: (0, jsx_runtime_1.jsx)("span", {
                                                                "data-target-page": link.id,
                                                                children: (0, jsx_runtime_1.jsx)("span", {
                                                                    "data-preview-field-path": `common.navLabels.${labelKey}`,
                                                                    children: label,
                                                                }),
                                                            }),
                                                        }, link.id);
                                                    }),
                                                }),
                                            ],
                                        }),
                                        (0, jsx_runtime_1.jsxs)("div", {
                                            children: [
                                                (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                    as: "h4",
                                                    fieldPath: "common.footerDestinationsHeading",
                                                    defaultValue: common.footerDestinationsHeading ?? 'Destinations',
                                                    placeholder: "Destinations",
                                                    size: "0.68rem",
                                                    weight: 700,
                                                    transform: "uppercase",
                                                    letterSpacing: "0.16em",
                                                    color: "#C5A46D",
                                                    style: { marginBottom: '0.75rem' },
                                                }),
                                                (0, jsx_runtime_1.jsx)("ul", {
                                                    className: "m-0 flex list-none flex-col gap-2 p-0",
                                                    children: (destinations.length > 0
                                                        ? destinations.map((d, idx) => ({
                                                            key: d?.id || idx,
                                                            id: d?.id || String(idx),
                                                            label: d?.name || '',
                                                        })).filter((d) => d.label)
                                                        : [
                                                            { key: 'sigiriya', id: 'sigiriya', label: 'Sigiriya' },
                                                            { key: 'ella', id: 'ella', label: 'Ella' },
                                                            { key: 'kandy', id: 'kandy', label: 'Kandy' },
                                                            { key: 'galle', id: 'galle', label: 'Galle' },
                                                        ]).map((item) => (
                                                            (0, jsx_runtime_1.jsx)("li", {
                                                                children: (0, jsx_runtime_1.jsx)("button", {
                                                                    type: "button",
                                                                    "data-preview-static": "footer-region-shortcut",
                                                                    onClick: () => navigate(
                                                                        hasDestinations
                                                                            ? `/destinations/detail/?id=${encodeURIComponent(String(item.id))}`
                                                                            : '/#destinations'
                                                                    ),
                                                                    className: "border-0 bg-transparent p-0 text-left text-xs text-[#9AA7B2] transition hover:text-[#FAF8F3]",
                                                                    children: item.label,
                                                                }),
                                                            }, item.key)
                                                        )),
                                                }),
                                            ],
                                        }),
                                        (0, jsx_runtime_1.jsxs)("div", {
                                            children: [
                                                (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                    as: "h4",
                                                    fieldPath: "common.footerCategoriesHeading",
                                                    defaultValue: common.footerCategoriesHeading ?? 'Travel Styles',
                                                    placeholder: "Travel Styles",
                                                    size: "0.68rem",
                                                    weight: 700,
                                                    transform: "uppercase",
                                                    letterSpacing: "0.16em",
                                                    color: "#C5A46D",
                                                    style: { marginBottom: '0.75rem' },
                                                }),
                                                (0, jsx_runtime_1.jsx)("ul", {
                                                    className: "m-0 flex list-none flex-col gap-2 p-0",
                                                    children: (travelStyles.length > 0
                                                        ? travelStyles.map((s, idx) => ({ key: s?.id || idx, label: s?.title || '' })).filter((s) => s.label)
                                                        : [
                                                            { key: 'family', label: 'Family Holidays' },
                                                            { key: 'romantic', label: 'Romantic Escapes' },
                                                            { key: 'wildlife', label: 'Wildlife & Nature' },
                                                            { key: 'outbound', label: 'Outbound Holidays' },
                                                        ]).map((item) => (
                                                            (0, jsx_runtime_1.jsx)("li", {
                                                                children: (0, jsx_runtime_1.jsx)("button", {
                                                                    type: "button",
                                                                    "data-preview-static": "footer-category-shortcut",
                                                                    onClick: () => navigate(hasTours ? '/tours/' : '/#travel-styles'),
                                                                    className: "border-0 bg-transparent p-0 text-left text-xs text-[#9AA7B2] transition hover:text-[#FAF8F3]",
                                                                    children: item.label,
                                                                }),
                                                            }, item.key)
                                                        )),
                                                }),
                                            ],
                                        }),
                                    ],
                                }),

                                // Column 3: Contact & Business Hours
                                (0, jsx_runtime_1.jsxs)("div", {
                                    className: "flex flex-col gap-2.5 lg:col-span-2",
                                    children: [
                                        (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                            as: "h4",
                                            fieldPath: "common.footerContactHeading",
                                            defaultValue: common.footerContactHeading ?? 'Contact',
                                            placeholder: "Contact",
                                            size: "0.68rem",
                                            weight: 700,
                                            transform: "uppercase",
                                            letterSpacing: "0.16em",
                                            color: "#C5A46D",
                                            style: { marginBottom: '0.25rem' },
                                        }),
                                        (0, jsx_runtime_1.jsxs)("div", {
                                            className: "flex flex-col gap-2 text-xs text-[#9AA7B2]",
                                            children: [
                                                (0, jsx_runtime_1.jsxs)("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        (0, jsx_runtime_1.jsx)(EditableIcon_1.EditableIcon, { name: "mail", fieldPath: "common.footerEmailIcon", size: 13, className: "text-[#C5A46D]" }),
                                                        (0, jsx_runtime_1.jsx)("a", {
                                                            href: emailContact ? `mailto:${emailContact}` : '#',
                                                            "data-preview-field-path": "contact.email",
                                                            className: "break-all text-[#FAF8F3]/85 no-underline transition hover:text-[#FF783D]",
                                                            style: { minWidth: '1.5ch', minHeight: '1.2em' },
                                                            children: emailContact,
                                                        }),
                                                    ],
                                                }),
                                                (0, jsx_runtime_1.jsxs)("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        (0, jsx_runtime_1.jsx)(EditableIcon_1.EditableIcon, { name: "phone", fieldPath: "common.footerPhoneIcon", size: 13, className: "text-[#C5A46D]" }),
                                                        (0, jsx_runtime_1.jsx)("a", {
                                                            href: phone ? `tel:${phone}` : '#',
                                                            "data-preview-field-path": "contact.phone",
                                                            className: "text-[#FAF8F3]/85 no-underline transition hover:text-[#FF783D]",
                                                            style: { minWidth: '1.5ch', minHeight: '1.2em' },
                                                            children: phone,
                                                        }),
                                                    ],
                                                }),
                                                (0, jsx_runtime_1.jsxs)("div", {
                                                    className: "flex items-start gap-2",
                                                    children: [
                                                        (0, jsx_runtime_1.jsx)(EditableIcon_1.EditableIcon, { name: "map-pin", fieldPath: "common.footerLocationIcon", size: 13, className: "mt-0.5 text-[#C5A46D]" }),
                                                        (0, jsx_runtime_1.jsx)("span", {
                                                            "data-preview-field-path": "contact.address",
                                                            className: "leading-relaxed text-[#9AA7B2]",
                                                            style: { minWidth: '1.5ch', minHeight: '1.2em' },
                                                            children: address,
                                                        }),
                                                    ],
                                                }),
                                                openingHours && (0, jsx_runtime_1.jsx)("p", {
                                                    "data-preview-static": "footer-business-hours",
                                                    className: "m-0 text-[11px] text-[#9AA7B2]/80",
                                                    children: openingHours,
                                                }),
                                                hasContact && (0, jsx_runtime_1.jsx)("div", {
                                                    className: "pt-0.5",
                                                    children: (0, jsx_runtime_1.jsxs)("a", {
                                                        href: whatsappHref || withBase('/contact/'),
                                                        target: whatsappHref ? "_blank" : undefined,
                                                        rel: whatsappHref ? "noopener noreferrer" : undefined,
                                                        "data-preview-field-path": "contact.whatsapp",
                                                        className: "font-display inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#FF783D] no-underline hover:underline",
                                                        children: [
                                                            (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                                as: "span",
                                                                fieldPath: "contact.directMessageText",
                                                                defaultValue: directMessageLabel,
                                                                style: { color: 'inherit', fontWeight: 700 },
                                                            }),
                                                            (0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", children: "↗" }),
                                                        ],
                                                    }),
                                                }),
                                            ],
                                        }),
                                    ],
                                }),

                                // Column 4: Optional Compact Email Notes Request
                                (0, jsx_runtime_1.jsxs)("div", {
                                    className: "flex flex-col gap-2.5 lg:col-span-2",
                                    children: [
                                        (0, jsx_runtime_1.jsx)("h4", {
                                            "data-preview-field-path": "common.footerHeading",
                                            className: "font-display m-0 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#C5A46D]",
                                            children: footerHeading,
                                        }),
                                        showNewsletter && (0, jsx_runtime_1.jsxs)("div", {
                                            className: "flex flex-col gap-2",
                                            children: [
                                                (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                    as: "p",
                                                    fieldPath: "common.newsletterDescription",
                                                    defaultValue: common.newsletterDescription ?? 'Seasonal travel notes by email.',
                                                    placeholder: "Add newsletter description",
                                                    size: "0.75rem",
                                                    color: "#9AA7B2",
                                                    lineHeight: 1.5,
                                                    style: { margin: 0 },
                                                }),
                                                (0, jsx_runtime_1.jsxs)("form", {
                                                    onSubmit: handleNewsletterRequest,
                                                    className: "flex flex-col gap-2",
                                                    children: [
                                                        (0, jsx_runtime_1.jsx)("input", {
                                                            type: "email",
                                                            required: true,
                                                            "data-preview-field-path": "common.newsletterEmailPlaceholder",
                                                            placeholder: common.newsletterEmailPlaceholder ?? 'Enter your email address',
                                                            value: subscriberEmail,
                                                            onChange: (e) => setSubscriberEmail(e.target.value),
                                                            className: "w-full rounded border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-[#FAF8F3] placeholder:text-[#9AA7B2]/70 focus:border-[#C5A46D] focus:outline-none",
                                                        }),
                                                        (0, jsx_runtime_1.jsx)("button", {
                                                            type: "submit",
                                                            className: "font-display min-h-[36px] rounded border border-[#FF783D] bg-[#FF783D] px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#EA662C]",
                                                            children: (0, jsx_runtime_1.jsx)(EditableText_1.EditableText, {
                                                                as: "span",
                                                                fieldPath: "common.newsletterSubscribeLabel",
                                                                defaultValue: common.newsletterSubscribeLabel ?? 'Request by Email',
                                                                placeholder: "Request by Email",
                                                                style: { color: 'inherit' },
                                                            }),
                                                        }),
                                                    ],
                                                }),
                                                newsletterNotice && (0, jsx_runtime_1.jsx)("p", {
                                                    role: "status",
                                                    "data-preview-static": "newsletter-notice",
                                                    className: "m-0 text-[11px] leading-relaxed text-[#C5A46D]",
                                                    children: newsletterNotice,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        }),

                        // Compact Bottom Legal Bar
                        (0, jsx_runtime_1.jsxs)("div", {
                            className: "flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11.5px] text-[#9AA7B2] sm:flex-row",
                            children: [
                                (0, jsx_runtime_1.jsx)("p", {
                                    "data-preview-field-path": "common.copyright",
                                    className: "m-0 text-center sm:text-left",
                                    style: { minHeight: '1.2em' },
                                    children: copyright,
                                }),
                                (0, jsx_runtime_1.jsxs)("div", {
                                    className: "flex flex-wrap items-center gap-4",
                                    children: [
                                        (0, jsx_runtime_1.jsx)("a", {
                                            href: withBase(policyUrl),
                                            "data-preview-field-path": "common.footerPolicyUrl",
                                            className: "text-[#9AA7B2] no-underline transition hover:text-[#FAF8F3]",
                                            children: (0, jsx_runtime_1.jsx)("span", {
                                                "data-preview-field-path": "common.footerPolicyLabel",
                                                children: policyLabel,
                                            }),
                                        }),
                                        (0, jsx_runtime_1.jsx)("a", {
                                            href: withBase(termsUrl),
                                            "data-preview-field-path": "common.footerTermsUrl",
                                            className: "text-[#9AA7B2] no-underline transition hover:text-[#FAF8F3]",
                                            children: (0, jsx_runtime_1.jsx)("span", {
                                                "data-preview-field-path": "common.footerTermsLabel",
                                                children: termsLabel,
                                            }),
                                        }),
                                        (0, jsx_runtime_1.jsx)("button", {
                                            type: "button",
                                            "data-preview-static": "back-to-top",
                                            onClick: scrollToTop,
                                            "aria-label": "Back to top",
                                            className: "inline-flex h-7 w-7 items-center justify-center rounded border border-white/20 bg-white/5 text-[#C5A46D] transition hover:border-[#C5A46D] hover:text-white",
                                            children: (0, jsx_runtime_1.jsx)("svg", {
                                                width: "13",
                                                height: "13",
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                stroke: "currentColor",
                                                strokeWidth: "2",
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                children: (0, jsx_runtime_1.jsx)("path", { d: "m18 15-6-6-6 6" }),
                                            }),
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        })
    );
}
exports.Footer = EditableFooter;
