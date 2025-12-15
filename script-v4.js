// Global lenis variable
let lenis = null;

// Register ScrollTrigger if available
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
gsap.registerPlugin(ScrollTrigger);
}

// Navbar element
const nav = document.querySelector('.nav');

// Basic config defaults (match current static HTML)
let siteConfig = null;
let primaryEmail = 'contact@bnsaied.com';
let whatsappNumberConfig = '971524627678'; // without +

async function loadSiteConfig() {
    try {
        const res = await fetch('/api/config', { method: 'GET' });
        if (!res.ok) return; // graceful fallback to static HTML
        const data = await res.json();
        siteConfig = data || {};

        // Contact
        if (siteConfig.contact) {
            if (siteConfig.contact.primaryEmail) {
                primaryEmail = siteConfig.contact.primaryEmail;
            }
            if (siteConfig.contact.whatsappNumber) {
                whatsappNumberConfig = siteConfig.contact.whatsappNumber;
            }
        }

        // Hero image + text
        if (siteConfig.hero) {
            const heroImg = document.querySelector('.hero-portrait');
            if (heroImg && siteConfig.hero.imageUrl) {
                heroImg.src = siteConfig.hero.imageUrl;
            }
            const titleLine1El = document.querySelector('.hero-title .hero-line:nth-child(1)');
            const titleLine2El = document.querySelector('.hero-title .hero-line:nth-child(2)');
            if (titleLine1El && siteConfig.hero.titleLine1) {
                // Preserve icon if present
                const icon = titleLine1El.querySelector('img');
                titleLine1El.textContent = siteConfig.hero.titleLine1 + ' ';
                if (icon) titleLine1El.appendChild(icon);
            }
            if (titleLine2El && (siteConfig.hero.titleLine2 || siteConfig.hero.subtitle)) {
                titleLine2El.textContent =
                    siteConfig.hero.titleLine2 || siteConfig.hero.subtitle;
            }
        }

        // Apply contact email to hero "Open to Work" button and footer/email copy
        const openWorkBtn = document.querySelector('.btn-open-work');
        if (openWorkBtn && primaryEmail) {
            openWorkBtn.setAttribute('href', `mailto:${primaryEmail}`);
        }

        const footerEmailBtn = document.getElementById('emailCopyBtn');
        if (footerEmailBtn && primaryEmail) {
            footerEmailBtn.setAttribute('data-email', primaryEmail);
            const footerText = footerEmailBtn.querySelector('.btn-text');
            if (footerText) footerText.textContent = primaryEmail;
        }

        const navEmailBtn = document.getElementById('emailBtn');
        if (navEmailBtn && primaryEmail) {
            navEmailBtn.setAttribute('data-email', primaryEmail);
        }

        // Social links in footer
        if (siteConfig.social) {
            const linkedinA = document.querySelector('footer .social-links a[href*="linkedin.com"]');
            if (linkedinA && siteConfig.social.linkedin) {
                linkedinA.href = siteConfig.social.linkedin;
            }
            const instaA = document.querySelector('footer .social-links a[href*="instagram.com"]');
            if (instaA && siteConfig.social.instagram) {
                instaA.href = siteConfig.social.instagram;
            }
            const behanceA = document.querySelector('footer .social-links a[href*="behance.net"]');
            if (behanceA && siteConfig.social.behance) {
                behanceA.href = siteConfig.social.behance;
            }
        }

        // Branding: favicon + navbar logo image + CV links
        if (siteConfig.branding && siteConfig.branding.logoUrl) {
            const favicon = document.querySelector('link[rel="icon"]');
            const navLogoImg = document.querySelector('.nav-logo img');
            if (favicon) {
                favicon.href = siteConfig.branding.logoUrl;
            }
            if (navLogoImg) {
                navLogoImg.src = siteConfig.branding.logoUrl;
            }
        }

        if (siteConfig.branding && siteConfig.branding.cvUrl) {
            const resumeNav = document.getElementById('resumeBtn');
            const resumeFooter = document.querySelector('.resume-btn');
            if (resumeNav) {
                resumeNav.href = siteConfig.branding.cvUrl;
            }
            if (resumeFooter) {
                resumeFooter.href = siteConfig.branding.cvUrl;
            }
        }

        // Tools - if any tools are defined in config, rebuild the tools grid
        if (Array.isArray(siteConfig.tools) && siteConfig.tools.length > 0) {
            renderDynamicTools(siteConfig.tools);
        }

        // SEO tags
        if (siteConfig.seo) {
            if (siteConfig.seo.siteTitle) {
                document.title = siteConfig.seo.siteTitle;
            }
            const descMeta = document.querySelector('meta[name="description"]');
            if (descMeta && siteConfig.seo.metaDescription) {
                descMeta.setAttribute('content', siteConfig.seo.metaDescription);
            }
            const keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (keywordsMeta && siteConfig.seo.keywords) {
                keywordsMeta.setAttribute('content', siteConfig.seo.keywords);
            }
            const canonicalLink = document.querySelector('link[rel="canonical"]');
            if (canonicalLink && siteConfig.seo.canonicalUrl) {
                canonicalLink.setAttribute('href', siteConfig.seo.canonicalUrl);
            }
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage && siteConfig.seo.ogImageUrl) {
                ogImage.setAttribute('content', siteConfig.seo.ogImageUrl);
            }
            const twitterImage = document.querySelector('meta[name="twitter:image"]');
            if (twitterImage && siteConfig.seo.ogImageUrl) {
                twitterImage.setAttribute('content', siteConfig.seo.ogImageUrl);
            }
        }
    } catch (err) {
        // In local dev or if the API isn't available, just use static HTML
        console.log('Failed to load site config, using static content.', err);
    }
}

// Mobile Menu Toggle - Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        // Toggle menu on hamburger click
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = navMenu.classList.contains('active');
            
            if (isOpen) {
                // Close menu
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                // Open menu
                mobileMenuToggle.classList.add('active');
                navMenu.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
        
        // Close menu when clicking a link
        const menuLinks = navMenu.querySelectorAll('a');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    mobileMenuToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }
    
    // Showreel Play Button
    const showreelVideo = document.querySelector('.showreel-video');
    const showreelPlayBtn = document.getElementById('showreelPlayBtn');
    
    if (showreelVideo && showreelPlayBtn) {
        // Play/pause on button click
        showreelPlayBtn.addEventListener('click', function() {
            if (showreelVideo.paused) {
                showreelVideo.play();
                showreelPlayBtn.classList.add('hidden');
            }
        });
        
        // Play/pause on video click
        showreelVideo.addEventListener('click', function() {
            if (showreelVideo.paused) {
                showreelVideo.play();
                showreelPlayBtn.classList.add('hidden');
            } else {
                showreelVideo.pause();
                showreelPlayBtn.classList.remove('hidden');
            }
        });
        
        // Show play button when video ends or pauses
        showreelVideo.addEventListener('pause', function() {
            showreelPlayBtn.classList.remove('hidden');
        });
        
        showreelVideo.addEventListener('ended', function() {
            showreelPlayBtn.classList.remove('hidden');
        });
    }

    // Load dynamic configuration (emails, social, SEO, etc.)
    loadSiteConfig();
});

// Check if Lenis is available
if (typeof Lenis !== 'undefined') {
// Initialize Lenis for smooth scrolling
    lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
        smoothTouch: false,
        touchMultiplier: 1.5,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

    // Connect GSAP ScrollTrigger to Lenis AND update navbar glass effect
    lenis.on('scroll', (e) => {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.update();
        }
        
        // Navbar liquid glass effect - appears when scrolling
        if (nav) {
            if (e.animatedScroll > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }
    });

    if (typeof gsap !== 'undefined') {
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
    }
} else {
    // Fallback: Use native scroll if Lenis not available
    console.log('Lenis not available, using native scroll');
    window.addEventListener('scroll', () => {
        if (nav) {
            if (window.scrollY > 50) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        }
    }, { passive: true });
}

// Meteors removed

// Email Copy Functionality
const emailBtn = document.getElementById('emailCopyBtn');
if (emailBtn) {
    emailBtn.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent navigation
        const email = emailBtn.getAttribute('data-email');
        const btnText = emailBtn.querySelector('.btn-text');
        const defaultIcon = emailBtn.querySelector('.default-icon');
        const successIcon = emailBtn.querySelector('.success-icon');

        try {
            await navigator.clipboard.writeText(email);

            // Visual feedback
            emailBtn.classList.add('copied');
            btnText.textContent = 'Copied to Clipboard!';
            defaultIcon.style.display = 'none';
            successIcon.style.display = 'block';

            // Reset after 2 seconds
            setTimeout(() => {
                emailBtn.classList.remove('copied');
                btnText.textContent = email;
                defaultIcon.style.display = 'block';
                successIcon.style.display = 'none';
            }, 2000);

        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });
}

// 1. Work Button - Smooth Scroll to Showreel
const workBtn = document.getElementById('workBtn');
if (workBtn) {
    workBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const showreelSection = document.getElementById('showreel');
        if (showreelSection && lenis) {
            lenis.scrollTo(showreelSection, {
                offset: -100, // Account for navbar
                duration: 1.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
}

// 2. Resume Button - Animated Download
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
        // Add downloading class to trigger animation
        resumeBtn.classList.add('downloading');

        // Reset button after animation
        setTimeout(() => {
            resumeBtn.classList.remove('downloading');
        }, 1600);
        
        // Allow native link behavior (don't prevent default)
    });
}

// 3. Contact Button - Dropdown Menu
const contactBtn = document.getElementById('contactBtn');
const contactDropdown = document.querySelector('.contact-dropdown');
const contactEmailBtn = document.getElementById('emailBtn');
const whatsappBtn = document.getElementById('whatsappBtn');
const emailToast = document.getElementById('emailToast');

if (contactBtn && contactDropdown) {
    // Toggle dropdown
    contactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        contactDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!contactBtn.contains(e.target) && !contactDropdown.contains(e.target)) {
            contactDropdown.classList.remove('active');
        }
    });
}

// Email button - Copy to clipboard
if (contactEmailBtn && emailToast) {
    contactEmailBtn.addEventListener('click', async () => {
        const email = primaryEmail || 'contact@bnsaied.com';

        try {
            await navigator.clipboard.writeText(email);

            // Show toast notification
            emailToast.classList.add('show');

            // Hide toast after 2 seconds
            setTimeout(() => {
                emailToast.classList.remove('show');
            }, 2000);

            // Close dropdown
            if (contactDropdown) {
                contactDropdown.classList.remove('active');
            }
        } catch (err) {
            console.error('Failed to copy email: ', err);
        }
    });
}

// WhatsApp button - Open WhatsApp
if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        const whatsappUrl = `https://wa.me/${whatsappNumberConfig}`;
        window.open(whatsappUrl, '_blank');

        // Close dropdown
        if (contactDropdown) {
            contactDropdown.classList.remove('active');
        }
    });
}

// Tool Modal Logic
const modalOverlay = document.querySelector('.tool-modal-overlay');
const modalClose = document.querySelector('.modal-close');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalIcon = document.getElementById('modalIcon');
const modalTags = document.getElementById('modalTags');
const modalPreview = document.querySelector('.modal-preview');
const modal = document.querySelector('.tool-modal');

function wireToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    if (!toolCards.length || !modalOverlay) return;

    toolCards.forEach(card => {
        card.addEventListener('click', () => {
            // Get data from attributes
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            const iconSrc = card.getAttribute('data-icon');
            const previewSrc = card.getAttribute('data-preview');
            const gallerySrc = card.getAttribute('data-gallery');
            const tagsString = card.getAttribute('data-tags');

            // Update modal content
            if (modalTitle) modalTitle.textContent = title || '';
            if (modalDesc) modalDesc.textContent = desc || '';
            if (modalIcon && iconSrc) modalIcon.src = iconSrc;

            // Update preview/gallery
            if (modalPreview) {
                if (gallerySrc) {
                    const images = gallerySrc.split(',');
                    let galleryHTML = '<div class="modal-gallery">';
                    images.forEach(img => {
                        galleryHTML += `
                        <div class="gallery-item">
                            <img src="${img.trim()}" alt="${title || ''} Screenshot">
                        </div>
                    `;
                    });
                    galleryHTML += '</div>';
                    modalPreview.innerHTML = galleryHTML;
                    modalPreview.classList.add('has-gallery');
                } else if (previewSrc) {
                    modalPreview.innerHTML = `<img src="${previewSrc}" alt="${title || ''} Preview">`;
                    modalPreview.classList.remove('has-gallery');
                }
            }

            // Update tags
            if (modalTags) {
                modalTags.innerHTML = '';
                if (tagsString) {
                    const tags = tagsString.split(',');
                    tags.forEach(tag => {
                        const span = document.createElement('span');
                        span.textContent = tag.trim();
                        modalTags.appendChild(span);
                    });
                }
            }

            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (lenis) lenis.stop(); // Stop Lenis smooth scrolling when modal is open
        });
    });

    // Add data-lenis-prevent to modal to ensure scrolling works
    if (modal) {
        modal.setAttribute('data-lenis-prevent', '');
    }
}

if (modalOverlay) {
    const closeModal = () => {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (lenis) lenis.start(); // Resume Lenis smooth scrolling when modal is closed
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Prevent scroll propagation from modal to background
    if (modal) {
        modal.addEventListener('wheel', (e) => {
            e.stopPropagation();
        }, { passive: true });
    }
}

// Lightbox Logic (outside modal conditional)
const lightboxOverlay = document.querySelector('.lightbox-overlay');
const lightboxContent = document.querySelector('.lightbox-content');
const lightboxClose = document.querySelector('.lightbox-close');

function openLightbox(src, type = 'image') {
    if (!lightboxContent) return;

    lightboxContent.innerHTML = ''; // Clear previous content

    if (type === 'video') {
        // Check if it's an iframe URL (e.g. YouTube/Vimeo/Bunny) or a direct video file
        if (src.includes('.mp4') || src.includes('.webm')) {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.autoplay = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.maxHeight = '90vh';
            lightboxContent.appendChild(video);
        } else {
            // Fallback for iframes
            const iframe = document.createElement('iframe');
            iframe.src = src;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';
            iframe.allow = 'autoplay; fullscreen';
            lightboxContent.appendChild(iframe);
        }
    } else {
        const img = document.createElement('img');
        img.src = src;
        img.id = 'lightboxImage';
        lightboxContent.appendChild(img);
    }

    if (lightboxOverlay) {
        lightboxOverlay.classList.add('active');
    }
}

function closeLightbox() {
    if (lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
        setTimeout(() => {
            if (lightboxContent) {
                lightboxContent.innerHTML = ''; // Clear content to stop video
            }
        }, 300);
    }
}

// Event delegation for dynamically added images in modal
if (modalPreview) {
    modalPreview.addEventListener('click', (e) => {
        const img = e.target.closest('img');
        if (img) {
            openLightbox(img.src, 'image');
        }
    });
}

// Reel Video - Load and autoplay when visible (performance optimization)
const reelVideos = document.querySelectorAll('.reel-video');
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
            // Video is visible - load it first if needed
            if (video.preload === 'none') {
                video.preload = 'metadata';
                video.load();
            }
            video.play().catch(() => {});
        } else {
            // Video not visible - pause to save resources
            video.pause();
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '100px'
});

reelVideos.forEach(video => {
    videoObserver.observe(video);
});

// Lazy-load embedded iframes (Bunny embeds) only when visible
const lazyEmbeds = document.querySelectorAll('.lazy-embed');
if (lazyEmbeds.length > 0 && 'IntersectionObserver' in window) {
    const embedObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                const src = iframe.getAttribute('data-src');
                if (src && !iframe.src) {
                    iframe.src = src;
                    iframe.removeAttribute('data-src');
                }
                observer.unobserve(iframe);
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '200px'
    });

    lazyEmbeds.forEach(embed => embedObserver.observe(embed));
}

// Reel Click Logic - Using click areas
document.querySelectorAll('.reel-click-area').forEach(clickArea => {
    clickArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = clickArea.closest('.reel-card');
        if (card) {
            const videoUrl = card.getAttribute('data-video');
            if (videoUrl) {
                openLightbox(videoUrl, 'video');
            }
        }
    });
});

// Showreel Click Logic
const showreelWrapper = document.querySelector('.showreel-video-wrapper');
if (showreelWrapper) {
    showreelWrapper.style.cursor = 'pointer';
    showreelWrapper.addEventListener('click', () => {
        // Use the provided Bunny.net test reel as a placeholder for the showreel
        const showreelSrc = "https://player.mediadelivery.net/embed/551621/10d512d7-2495-4875-adbe-6e304b066cc9?autoplay=true&loop=false&muted=false&preload=true&responsive=true&playsinline=true";
        openLightbox(showreelSrc, 'video');
    });
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
}

if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
        if (e.target === lightboxOverlay) {
            closeLightbox();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxOverlay && lightboxOverlay.classList.contains('active')) {
        closeLightbox();
    }
});

// Photography Gallery
const photoGalleryModal = document.getElementById('photoGalleryModal');
const galleryClose = document.getElementById('galleryClose');
const galleryTrack = document.getElementById('galleryTrack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const galleryCounter = document.getElementById('galleryCounter');

let currentPhotoIndex = 0;
let currentPhotos = [];

// Photo categories data - Using CDN
const photoCategories = {
    products: [
        'https://cdn.bnsaied.com/photography/products/119080344_3258700907579272_1429950066558778245_n.jpg'
    ],
    fnb: [
        'https://cdn.bnsaied.com/photography/f%26b/Appetizers-OvearHead.jpg',
        'https://cdn.bnsaied.com/photography/f%26b/Pepperoni-Pizza-Social.jpg',
        'https://cdn.bnsaied.com/photography/f%26b/BeetrootFetaSalad.jpg',
        'https://cdn.bnsaied.com/photography/f%26b/Dynamit-Shrimp-Souce.jpg',
        'https://cdn.bnsaied.com/photography/f%26b/Manousha_Flat-5.jpg',
        'https://cdn.bnsaied.com/photography/f%26b/JarraWeAfya-6.jpg'
    ],
    interior: [
        'https://cdn.bnsaied.com/photography/interior/salim-52.jpg',
        'https://cdn.bnsaied.com/photography/interior/salim-58.jpg',
        'https://cdn.bnsaied.com/photography/interior/salim-61.jpg'
    ]
};

function openPhotoGallery(category) {
    if (!photoCategories[category] || !galleryTrack || !photoGalleryModal) return;

    currentPhotos = photoCategories[category];
    currentPhotoIndex = 0;

    // Build gallery slides
    galleryTrack.innerHTML = '';
    currentPhotos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Photo ${index + 1}`;
        slide.appendChild(img);
        galleryTrack.appendChild(slide);
    });

    // Update counter
    updateGalleryCounter();

    // Show modal
    photoGalleryModal.classList.add('active');
    document.body.classList.add('gallery-open');

    // Animate slides in
    setTimeout(() => {
        const slides = galleryTrack.querySelectorAll('.gallery-slide');
        slides.forEach((slide, index) => {
            if (index === 0) {
                slide.style.transitionDelay = '0.2s';
            }
        });
    }, 10);
}

function closePhotoGallery() {
    photoGalleryModal.classList.remove('active');
    document.body.classList.remove('gallery-open');

    // Reset after animation
    setTimeout(() => {
        galleryTrack.innerHTML = '';
        currentPhotos = [];
        currentPhotoIndex = 0;
    }, 400);
}

function updateGalleryCounter() {
    if (galleryCounter && currentPhotos.length > 0) {
        galleryCounter.textContent = `${currentPhotoIndex + 1} / ${currentPhotos.length}`;
    }
}

function showPhoto(index) {
    if (index < 0 || index >= currentPhotos.length) return;

    const slides = galleryTrack.querySelectorAll('.gallery-slide');
    const prevIndex = currentPhotoIndex;

    // Remove active class from previous slide
    if (slides[prevIndex]) {
        slides[prevIndex].classList.remove('active');
    }

    currentPhotoIndex = index;

    // Add active class to current slide
    if (slides[currentPhotoIndex]) {
        slides[currentPhotoIndex].classList.add('active');
    }

    // Update track position using transform
    const translateX = -currentPhotoIndex * 100;
    galleryTrack.style.transform = `translateX(${translateX}%)`;

    // Update counter
    updateGalleryCounter();
}

function nextPhoto() {
    const nextIndex = (currentPhotoIndex + 1) % currentPhotos.length;
    showPhoto(nextIndex);
}

function prevPhoto() {
    const prevIndex = (currentPhotoIndex - 1 + currentPhotos.length) % currentPhotos.length;
    showPhoto(prevIndex);
}

// Event listeners
const categoryStacks = document.querySelectorAll('.category-stack');
categoryStacks.forEach(stack => {
    stack.addEventListener('click', () => {
        const category = stack.getAttribute('data-category');
        openPhotoGallery(category);
    });
});

if (galleryClose) {
    galleryClose.addEventListener('click', closePhotoGallery);
}

if (galleryNext) {
    galleryNext.addEventListener('click', nextPhoto);
}

if (galleryPrev) {
    galleryPrev.addEventListener('click', prevPhoto);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!photoGalleryModal || !photoGalleryModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
        closePhotoGallery();
    } else if (e.key === 'ArrowRight') {
        nextPhoto();
    } else if (e.key === 'ArrowLeft') {
        prevPhoto();
    }
});

// Close on backdrop click
if (photoGalleryModal) {
    const backdrop = photoGalleryModal.querySelector('.gallery-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                closePhotoGallery();
            }
        });
    }
}

// Dynamically render tools grid from config
function renderDynamicTools(tools) {
    const grid = document.querySelector('.tools-grid');
    if (!grid) return;

    grid.innerHTML = '';

    tools.forEach((tool) => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.setAttribute('data-tool', tool.id || '');
        if (tool.title) card.setAttribute('data-title', tool.title);
        if (tool.description) card.setAttribute('data-desc', tool.description);
        if (tool.iconUrl) card.setAttribute('data-icon', tool.iconUrl);
        if (tool.previewUrl) card.setAttribute('data-preview', tool.previewUrl);
        if (Array.isArray(tool.tags)) {
            card.setAttribute('data-tags', tool.tags.join(','));
        }

        const iconSrc =
            tool.iconUrl || 'https://cdn.bnsaied.com/icons/pr-icon.png';
        const tagsArray = Array.isArray(tool.tags) ? tool.tags : [];

        card.innerHTML = `
          <div class="tool-icon">
            <img src="${iconSrc}" alt="${tool.title || 'Tool'}" loading="lazy" width="40" height="40">
          </div>
          <h3>${tool.title || 'Tool'}</h3>
          <p>${tool.description || ''}</p>
          <div class="tool-tags">
            ${tagsArray
              .map((tag) => `<span>${tag}</span>`)
              .join('')}
          </div>
        `;

        grid.appendChild(card);
    });

    // Re-wire modal clicks for new cards
    wireToolCards();
}
