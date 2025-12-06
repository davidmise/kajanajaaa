const animatedBlocks = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.18 }
);

animatedBlocks.forEach(block => observer.observe(block));

const navTabs = document.querySelectorAll('.nav-tab');
const navDrawerLinks = document.querySelectorAll('.nav-drawer__link');
const currentPage = document.body.dataset.page;

if (currentPage && navTabs.length) {
    navTabs.forEach(tab => {
        tab.classList.toggle('is-active', tab.dataset.nav === currentPage);
    });
}

// Mobile navigation
const navToggle = document.querySelector('[data-nav-toggle]');
const navDrawer = document.querySelector('[data-nav-drawer]');
const navOverlay = document.querySelector('[data-nav-overlay]');
const navClose = document.querySelector('[data-nav-close]');

const openMobileNav = () => {
    navToggle?.classList.add('is-open');
    navDrawer?.classList.add('is-open');
    navOverlay?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
};

const closeMobileNav = () => {
    navToggle?.classList.remove('is-open');
    navDrawer?.classList.remove('is-open');
    navOverlay?.classList.remove('is-visible');
    document.body.style.overflow = '';
};

navToggle?.addEventListener('click', () => {
    const isOpen = navDrawer?.classList.contains('is-open');
    isOpen ? closeMobileNav() : openMobileNav();
});

navClose?.addEventListener('click', closeMobileNav);
navOverlay?.addEventListener('click', closeMobileNav);

// Close on escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileNav();
});

// Portfolio filters
const filterButtons = document.querySelectorAll('[data-filter]');
const portfolioCards = document.querySelectorAll('[data-category]');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        const filter = button.dataset.filter;

        portfolioCards.forEach(card => {
            const matches = filter === 'all' || card.dataset.category === filter;
            card.hidden = !matches;
        });
    });
});

// Theme toggle + persistence
const themeToggles = document.querySelectorAll('[data-theme-toggle]');
const THEME_STORAGE_KEY = 'kajnaja-theme';

const readStoredTheme = () => {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY);
    } catch (error) {
        return null;
    }
};

const persistTheme = value => {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (error) {
        /* no-op */
    }
};

const syncThemeControl = theme => {
    const isWhite = theme === 'white';
    themeToggles.forEach(toggle => {
        toggle.setAttribute('aria-pressed', String(isWhite));
        const nextThemeLabel = isWhite ? 'Switch to blue theme' : 'Switch to white theme';
        toggle.setAttribute('aria-label', nextThemeLabel);
    });
};

const setTheme = theme => {
    const themeValue = theme === 'white' ? 'white' : 'blue';
    document.body.setAttribute('data-theme', themeValue);
    syncThemeControl(themeValue);
    persistTheme(themeValue);
};

const storedTheme = readStoredTheme();
setTheme(storedTheme || document.body.getAttribute('data-theme') || 'blue');

themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const nextTheme = document.body.getAttribute('data-theme') === 'white' ? 'blue' : 'white';
        setTheme(nextTheme);
    });
});

// Testimonial carousel
const testimonialCarousel = document.querySelector('[data-testimonial-carousel]');
if (testimonialCarousel) {
    const track = testimonialCarousel.querySelector('[data-testimonial-track]');
    const cards = track?.querySelectorAll('.testimonial-card');
    const prevBtn = testimonialCarousel.querySelector('[data-testimonial-prev]');
    const nextBtn = testimonialCarousel.querySelector('[data-testimonial-next]');
    const dotsContainer = testimonialCarousel.querySelector('[data-testimonial-dots]');

    let currentIndex = 0;
    let cardsPerView = 1;

    const updateCardsPerView = () => {
        const width = window.innerWidth;
        if (width >= 1024) cardsPerView = 3;
        else if (width >= 768) cardsPerView = 2;
        else cardsPerView = 1;
    };

    const getTotalSlides = () => Math.ceil(cards.length / cardsPerView);

    const createDots = () => {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalSlides = getTotalSlides();
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.classList.add('testimonial-carousel__dot');
            if (i === 0) dot.classList.add('is-active');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    };

    const updateDots = () => {
        const dots = dotsContainer?.querySelectorAll('.testimonial-carousel__dot');
        dots?.forEach((dot, i) => {
            dot.classList.toggle('is-active', i === currentIndex);
        });
    };

    const goToSlide = index => {
        const totalSlides = getTotalSlides();
        currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
        const cardWidth = cards[0]?.offsetWidth || 0;
        const gap = 24; // 1.5rem gap
        const offset = currentIndex * (cardWidth + gap) * cardsPerView;
        track.style.transform = `translateX(-${offset}px)`;
        updateDots();
    };

    const nextSlide = () => {
        const totalSlides = getTotalSlides();
        goToSlide((currentIndex + 1) % totalSlides);
    };

    const prevSlide = () => {
        const totalSlides = getTotalSlides();
        goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
    };

    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);

    // Auto-advance every 5 seconds
    let autoPlayInterval = setInterval(nextSlide, 5000);

    testimonialCarousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    testimonialCarousel.addEventListener('mouseleave', () => {
        autoPlayInterval = setInterval(nextSlide, 5000);
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track?.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track?.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }, { passive: true });

    // Initialize
    updateCardsPerView();
    createDots();

    // Recalculate on resize
    window.addEventListener('resize', () => {
        updateCardsPerView();
        createDots();
        goToSlide(0);
    });
}

// Case study carousel + filters
const caseCarousel = document.querySelector('[data-case-carousel]');
if (caseCarousel) {
    const track = caseCarousel.querySelector('[data-case-track]');
    const viewport = caseCarousel.querySelector('[data-case-viewport]');
    const prevBtn = caseCarousel.querySelector('[data-case-prev]');
    const nextBtn = caseCarousel.querySelector('[data-case-next]');
    const dotsContainer = caseCarousel.querySelector('[data-case-dots]');
    const filterButtons = document.querySelectorAll('[data-case-filter]');

    if (!track || !viewport) {
        console.warn('Case carousel: missing track or viewport');
    } else {
        const allCards = Array.from(track.children);
        let filteredCards = [...allCards];
        let cardsPerView = 1;
        let currentSlide = 0;

        const updateCardsPerView = () => {
            const width = window.innerWidth;
            if (width >= 1100) cardsPerView = 3;
            else if (width >= 768) cardsPerView = 2;
            else cardsPerView = 1;
        };

        const mountCards = () => {
            track.innerHTML = '';
            filteredCards.forEach(card => track.appendChild(card));
        };

        const getTotalSlides = () => {
            if (!filteredCards.length) return 1;
            return Math.ceil(filteredCards.length / cardsPerView);
        };

        const updateButtons = () => {
            const totalSlides = getTotalSlides();
            const atStart = currentSlide === 0;
            const atEnd = currentSlide >= totalSlides - 1;
            prevBtn?.toggleAttribute('disabled', atStart);
            nextBtn?.toggleAttribute('disabled', atEnd);
        };

        const updateDots = () => {
            const dots = dotsContainer?.querySelectorAll('.case-carousel__dot');
            dots?.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === currentSlide);
            });
        };

        const goToSlide = index => {
            const totalSlides = getTotalSlides();
            currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
            const viewportWidth = viewport?.offsetWidth || 0;
            track.style.transform = `translateX(-${currentSlide * viewportWidth}px)`;
            updateDots();
            updateButtons();
        };

        const createDots = () => {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            const totalSlides = getTotalSlides();
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.classList.add('case-carousel__dot');
                if (i === currentSlide) dot.classList.add('is-active');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        };

        const applyFilter = filter => {
            const nextFilter = filter || 'all';
            filteredCards = allCards.filter(card => {
                if (nextFilter === 'all') return true;
                return card.dataset.caseCategory === nextFilter;
            });
            mountCards();
            currentSlide = 0;
            updateCardsPerView();
            createDots();
            goToSlide(0);
        };

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('is-active'));
                button.classList.add('is-active');
                applyFilter(button.dataset.caseFilter);
            });
        });

        prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));

        window.addEventListener('resize', () => {
            updateCardsPerView();
            createDots();
            goToSlide(currentSlide);
        });

        // Initialize gallery
        updateCardsPerView();
        createDots();
        goToSlide(0);
        updateButtons();
    }
}