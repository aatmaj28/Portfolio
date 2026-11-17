$(document).ready(function() {
    // Respect the visitor's reduced motion setting everywhere below
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Footer year stays current
    const footerYear = document.getElementById('footerYear');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

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

    // Close menu when clicking on a link (only matters while the hamburger is showing)
    $('.navbar .menu li a').click(function() {
        if ($('.navbar-actions .menu-btn').is(':visible')) {
            $('.navbar .menu').removeClass("active");
            $('.menu-btn i').removeClass("active");
        }
    });

    // ============================================
    // TYPING ANIMATIONS
    // ============================================
    const heroPhrases = ["AI Agents", "LLMs", "Cloud Solutions", "Scalable Systems", "LLM Systems", "RAG Pipelines", "AI Evaluation"];
    const aboutPhrases = ["Programmer", "Photographer", "Gamer", "Athlete", "Builder", "Runner"];

    if (prefersReduced) {
        // No typing loop for reduced motion: show the first phrase and leave it
        $('.typing').text(heroPhrases[0]);
        $('.typing-2').text(aboutPhrases[0]);
    } else {
        var typed = new Typed(".typing", {
            strings: heroPhrases,
            typeSpeed: 100,
            backSpeed: 60,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });

        var typed2 = new Typed(".typing-2", {
            strings: aboutPhrases,
            typeSpeed: 100,
            backSpeed: 60,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }

    // ============================================
    // OWL CAROUSEL
    // ============================================
    
    // Default carousel settings (for services, teams, and skills)
    $('.services .carousel, .teams .carousel, .skills .carousel').owlCarousel({
        margin: 30,
        loop: true,
        autoplay: !prefersReduced,
        autoplayTimeout: 4000,
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
        autoplay: !prefersReduced,
        autoplayTimeout: 5000,
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
    document.querySelectorAll('.edu-card, .pub-card, .services .card, .teams .card, .skill-category, .awards .card, .award-card').forEach(card => {
        card.classList.add('fade-in');
        observer.observe(card);
    });

    // ============================================
    // ABOUT BOOK TAP SUPPORT (TOUCH DEVICES)
    // ============================================
    const aboutBook = document.querySelector('.about .book');
    if (aboutBook && window.matchMedia('(hover: none)').matches) {
        const coverSubtitle = aboutBook.querySelector('.cover-subtitle');
        if (coverSubtitle) {
            coverSubtitle.textContent = 'Tap to open';
        }
        aboutBook.addEventListener('click', function() {
            aboutBook.classList.toggle('open');
        });
    }

    // Show a fade and a "Scroll for more" hint while the bio has more text below
    const bookPage = document.querySelector('.about .book-page');
    const bookInner = document.querySelector('.about .book-inner');
    if (bookPage && bookInner) {
        const updateBookHint = function() {
            const remaining = bookInner.scrollHeight - bookInner.scrollTop - bookInner.clientHeight;
            bookPage.classList.toggle('has-more', remaining > 8);
        };
        bookInner.addEventListener('scroll', updateBookHint, { passive: true });
        window.addEventListener('resize', updateBookHint);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updateBookHint);
        }
        updateBookHint();
    }

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
            const flipped = this.classList.toggle('flipped');
            // Cards also flip on focus, so drop focus when flipping back
            if (!flipped) {
                this.blur();
            }
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
    // HERO WOW EFFECTS
    // ============================================
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const heroSection = document.querySelector('.home');

    // --- Interactive constellation canvas ---
    const constellation = document.querySelector('.constellation');
    if (constellation && heroSection) {
        const cctx = constellation.getContext('2d');
        const particleColors = ['99, 102, 241', '139, 92, 246', '236, 72, 153'];
        const pointer = { x: null, y: null };
        let particles = [];
        let cw, ch;

        function sizeConstellation() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            cw = heroSection.offsetWidth;
            ch = heroSection.offsetHeight;
            constellation.width = cw * dpr;
            constellation.height = ch * dpr;
            cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(Math.floor((cw * ch) / 22000), 80);
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * cw,
                y: Math.random() * ch,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.6 + 0.8,
                c: particleColors[Math.floor(Math.random() * particleColors.length)]
            }));
        }

        function drawConstellation() {
            cctx.clearRect(0, 0, cw, ch);
            const linkDist = 120;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > cw) p.vx *= -1;
                if (p.y < 0 || p.y > ch) p.vy *= -1;

                // gentle repulsion around the pointer
                if (pointer.x !== null) {
                    const dx = p.x - pointer.x;
                    const dy = p.y - pointer.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 0.1 && dist < 110) {
                        p.x += (dx / dist) * 0.7;
                        p.y += (dy / dist) * 0.7;
                    }
                }

                cctx.beginPath();
                cctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                cctx.fillStyle = 'rgba(' + p.c + ', 0.55)';
                cctx.fill();

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dist = Math.hypot(p.x - q.x, p.y - q.y);
                    if (dist < linkDist) {
                        cctx.beginPath();
                        cctx.moveTo(p.x, p.y);
                        cctx.lineTo(q.x, q.y);
                        cctx.strokeStyle = 'rgba(99, 102, 241, ' + (0.18 * (1 - dist / linkDist)).toFixed(3) + ')';
                        cctx.lineWidth = 1;
                        cctx.stroke();
                    }
                }

                if (pointer.x !== null) {
                    const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
                    if (dist < 170) {
                        cctx.beginPath();
                        cctx.moveTo(p.x, p.y);
                        cctx.lineTo(pointer.x, pointer.y);
                        cctx.strokeStyle = 'rgba(236, 72, 153, ' + (0.25 * (1 - dist / 170)).toFixed(3) + ')';
                        cctx.lineWidth = 1;
                        cctx.stroke();
                    }
                }
            }
        }

        sizeConstellation();

        if (prefersReduced) {
            drawConstellation();
        } else {
            let rafId = null;
            const loop = () => {
                drawConstellation();
                rafId = requestAnimationFrame(loop);
            };
            new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && rafId === null) {
                    rafId = requestAnimationFrame(loop);
                } else if (!entries[0].isIntersecting && rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }).observe(heroSection);

            heroSection.addEventListener('pointermove', function(e) {
                const rect = heroSection.getBoundingClientRect();
                pointer.x = e.clientX - rect.left;
                pointer.y = e.clientY - rect.top;
            });
            heroSection.addEventListener('pointerleave', function() {
                pointer.x = null;
                pointer.y = null;
            });

            let resizeTimer;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(sizeConstellation, 200);
            });
        }
    }

    // --- Cinematic name reveal ---
    const nameEl = document.querySelector('.home .text-2');
    if (nameEl && !prefersReduced) {
        const nameText = nameEl.textContent.trim();
        nameEl.setAttribute('aria-label', nameText);
        nameEl.textContent = '';
        const frag = document.createDocumentFragment();
        Array.from(nameText).forEach(function(chr, i) {
            const span = document.createElement('span');
            span.className = 'ch';
            span.textContent = chr;
            span.setAttribute('aria-hidden', 'true');
            span.style.setProperty('--d', (0.35 + i * 0.045) + 's');
            frag.appendChild(span);
        });
        nameEl.appendChild(frag);
        nameEl.classList.add('split');

        // keep the gradient continuous across the individual letters
        const paintNameGradient = function() {
            const nameRect = nameEl.getBoundingClientRect();
            const total = nameRect.width || 1;
            nameEl.querySelectorAll('.ch').forEach(function(span) {
                const offset = span.getBoundingClientRect().left - nameRect.left;
                span.style.backgroundSize = total + 'px 100%';
                span.style.backgroundPosition = -offset + 'px 0';
            });
        };
        paintNameGradient();
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(paintNameGradient);
        }
        window.addEventListener('resize', paintNameGradient);
    }

    // --- 3D parallax layers + cursor spotlight + magnetic buttons ---
    if (heroSection && finePointer && !prefersReduced) {
        const spotlight = document.querySelector('.hero-spotlight');
        const layers = [
            { el: document.querySelector('.bitmoji-static'), depth: 26 },
            { el: document.querySelector('.badge-floating'), depth: 40 },
            { el: document.querySelector('.home .text-2'), depth: 10 },
            { el: document.querySelector('.particles-container'), depth: 6 }
        ].filter(function(l) { return l.el; });

        heroSection.addEventListener('mousemove', function(e) {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            layers.forEach(function(l) {
                l.el.style.translate = (-nx * l.depth).toFixed(1) + 'px ' + (-ny * l.depth).toFixed(1) + 'px';
            });
            if (spotlight) {
                const rect = heroSection.getBoundingClientRect();
                spotlight.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                spotlight.style.setProperty('--my', (e.clientY - rect.top) + 'px');
            }
        });
        heroSection.addEventListener('mouseleave', function() {
            layers.forEach(function(l) {
                l.el.style.translate = '0px 0px';
            });
        });

        document.querySelectorAll('.hero-links a').forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                const r = btn.getBoundingClientRect();
                const mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                const my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                btn.style.translate = (mx * 6).toFixed(1) + 'px ' + (my * 4).toFixed(1) + 'px';
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.translate = '0px 0px';
            });
        });
    }

    // --- Animated stat counters ---
    const statNums = document.querySelectorAll('.stat-num');
    if (statNums.length && !prefersReduced) {
        const runCounter = function(el) {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const suffix = el.dataset.suffix || '';
            const duration = 1400;
            const start = performance.now();
            const tick = function(now) {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = (target * eased).toFixed(decimals) + (p === 1 ? suffix : '');
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        setTimeout(function() {
            statNums.forEach(runCounter);
        }, 800);
    }

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
        color: var(--text-main);
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
