$(document).ready(function() {
    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    $(window).scroll(function() {
        if (this.scrollY > 20) {
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }

        // Scroll-up button show/hide
        if (this.scrollY > 500) {
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }
    });

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    $('.scroll-up-btn').click(function() {
        $('html').animate({ scrollTop: 0 }, 600);
        $('html').css("scrollBehavior", "auto");
    });

    $('.navbar .menu li a').click(function() {
        $('html').css("scrollBehavior", "smooth");
    });

    // ============================================
    // MOBILE MENU TOGGLE
    // ============================================
    $('.menu-btn').click(function() {
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("active");
    });

    // Close menu when clicking on a link
    $('.navbar .menu li a').click(function() {
        if ($(window).width() < 947) {
            $('.navbar .menu').removeClass("active");
            $('.menu-btn i').removeClass("active");
        }
    });

    // ============================================
    // TYPING ANIMATIONS
    // ============================================
    var typed = new Typed(".typing", {
        strings: ["AI Agents", "LLMs", "Cloud Solutions", "Scalable Systems"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    var typed2 = new Typed(".typing-2", {
        strings: ["Programmer", "Photographer", "Gamer", "Athlete"],
        typeSpeed: 100,
        backSpeed: 60,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // ============================================
    // OWL CAROUSEL
    // ============================================
    
    // Default carousel settings (for services, teams, and skills)
    $('.services .carousel, .teams .carousel, .skills .carousel').owlCarousel({
        margin: 30,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 4000,
        autoplayHoverPause: true,
        autoHeight: false,
        stagePadding: 0,
        responsive: {
            0: {
                items: 1,
                nav: false,
                margin: 20,
                stagePadding: 0
            },
            768: {
                items: 1,
                nav: false,
                margin: 25,
                stagePadding: 0
            },
            1024: {
                items: 3,
                nav: false,
                margin: 30,
                stagePadding: 0
            },
            1400: {
                items: 3,
                nav: false,
                margin: 30,
                stagePadding: 0
            }
        }
    });
    
    // Special settings for publications carousel
    $('.publications .carousel').owlCarousel({
        margin: 30,
        loop: true,
        autoplay: true,
        autoplayTimeOut: 5000,
        autoplayHoverPause: true,
        autoHeight: false,
        stagePadding: 0,
        responsive: {
            0: {
                items: 1,
                nav: false,
                margin: 20,
                stagePadding: 0
            },
            768: {
                items: 1,
                nav: false,
                margin: 25,
                stagePadding: 0
            },
            1024: {
                items: 3,
                nav: false,
                margin: 30,
                stagePadding: 0
            },
            1400: {
                items: 3,
                nav: false,
                margin: 30,
                stagePadding: 0
            }
        }
    });
    

    // ============================================
    // SCROLL ANIMATIONS - INTERSECTION OBSERVER
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });

    // Observe cards and other elements
    document.querySelectorAll('.edu-card, .pub-card, .services .card, .teams .card, .skill-category').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // ============================================
    // PUBLICATION CARD CLICK/TOUCH SUPPORT
    // ============================================
    document.querySelectorAll('.pub-card').forEach(card => {
        // Add click support for touch devices
        card.addEventListener('click', function(e) {
            // Don't flip if clicking on a link
            if (e.target.closest('a')) {
                return;
            }
            this.classList.toggle('flipped');
        });
    });


    // ============================================
    // PARALLAX EFFECT FOR HERO
    // ============================================
    // Only move background layers to avoid shifting the entire hero section
    const parallaxLayers = $('.home .animated-bg, .home .particles-container');
    $(window).on('scroll', function() {
        const scrolled = $(window).scrollTop();
        const offset = scrolled * 0.15;
        parallaxLayers.css('transform', `translateY(${offset}px)`);
    });

    // ============================================
    // ANIMATED AVATAR INTERACTIONS
    // ============================================
    const avatar = document.getElementById('animatedAvatar');
    if (avatar) {
        const pupils = avatar.querySelectorAll('.pupil');
        
        // Mouse move interaction - eyes follow cursor
        document.addEventListener('mousemove', (e) => {
            const rect = avatar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angleX = (e.clientY - centerY) / 20;
            const angleY = (e.clientX - centerX) / 20;
            
            pupils.forEach(pupil => {
                pupil.style.transform = `translate(calc(-50% + ${angleY}px), calc(-50% + ${angleX}px))`;
            });
        });

        // Reset on mouse leave
        avatar.addEventListener('mouseleave', () => {
            pupils.forEach(pupil => {
                pupil.style.transform = 'translate(-50%, -50%)';
            });
        });

        // Click interaction - wink
        avatar.addEventListener('click', () => {
            const rightEye = avatar.querySelector('.right-eye');
            rightEye.style.animation = 'none';
            setTimeout(() => {
                rightEye.style.animation = 'blink 0.3s ease';
                setTimeout(() => {
                    rightEye.style.animation = 'blink 4s infinite';
                }, 300);
            }, 10);
        });
    }

    // ============================================
    // FLOATING PARTICLES EFFECT
    // ============================================
    function createParticles() {
        const particlesContainer = document.querySelector('.particles-container');
        if (!particlesContainer) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 4 + 2 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = `rgba(99, 102, 241, ${Math.random() * 0.5 + 0.2})`;
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            particlesContainer.appendChild(particle);
        }
    }

    createParticles();

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================
    $('a, button').on('click', function(e) {
        const $this = $(this);
        if ($this.hasClass('btn') || $this.is('button') || $this.hasClass('github-btn')) {
            const ripple = $('<span class="ripple"></span>');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.css({
                width: size,
                height: size,
                left: x,
                top: y
            });

            $this.append(ripple);
            setTimeout(() => ripple.remove(), 600);
        }
    });

    // ============================================
    // CARD TILT EFFECT (3D)
    // ============================================
    $('.teams .card, .services .card').on('mousemove', function(e) {
        const card = $(this);
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.css('transform', `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`);
    });

    $('.teams .card, .services .card').on('mouseleave', function() {
        $(this).css('transform', 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)');
    });

    // ============================================
    // ACTIVE NAV LINK HIGHLIGHTING
    // ============================================
    $(window).scroll(function() {
        const scrollPos = $(window).scrollTop() + 100;
        
        $('.navbar .menu li a').each(function() {
            const currLink = $(this);
            const refElement = $(currLink.attr("href"));
            
            if (refElement.length && 
                refElement.position().top <= scrollPos && 
                refElement.position().top + refElement.height() > scrollPos) {
                $('.navbar .menu li a').removeClass("active");
                currLink.addClass("active");
            }
        });
    });

    // ============================================
    // FORM VALIDATION & ENHANCEMENT
    // ============================================
    $('.contact form input, .contact form textarea').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        if (!$(this).val()) {
            $(this).parent().removeClass('focused');
        }
    });

    // ============================================
    // LAZY LOADING FOR IMAGES
    // ============================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Scroll reveal for education cards
        const eduObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        document.querySelectorAll('.edu-card').forEach(card => {
            eduObserver.observe(card);
        });
    }

    // ============================================
    // PERFORMANCE: DEBOUNCE SCROLL
    // ============================================
    let ticking = false;
    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                // Scroll-based animations here
                ticking = false;
            });
            ticking = true;
        }
    }

    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    console.log('%c👋 Hello! Thanks for checking out my portfolio!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    console.log('%cBuilt with modern web technologies and lots of ☕', 'color: #8b5cf6; font-size: 12px;');
});

// ============================================
// ADDITIONAL CSS ANIMATIONS VIA JS
// ============================================
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .navbar .menu li a.active {
        color: var(--text-primary);
        background: rgba(99, 102, 241, 0.2);
    }

    .navbar .menu li a.active::after {
        width: 80%;
    }

    img.loaded {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);
