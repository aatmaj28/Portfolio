/*
 * Portfolio site scripts. Plain JS, no build step.
 * Each feature has its own init function. Motion effects respect
 * prefers-reduced-motion, and pointer effects only run on fine pointers.
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    // ============================================
    // SCROLL LOOP: one rAF throttled handler for every scroll task
    // ============================================
    const scrollTasks = [];
    let scrollQueued = false;

    function runScrollTasks() {
        scrollQueued = false;
        const y = window.scrollY;
        for (const task of scrollTasks) task(y);
    }

    function requestScrollTasks() {
        if (!scrollQueued) {
            scrollQueued = true;
            requestAnimationFrame(runScrollTasks);
        }
    }

    window.addEventListener('scroll', requestScrollTasks, { passive: true });
    window.addEventListener('resize', requestScrollTasks);

    // ============================================
    // SMOOTH SCROLLING (Lenis) AND ANCHOR LINKS
    // ============================================
    let lenis = null;

    function initSmoothScroll() {
        if (prefersReduced || typeof window.Lenis !== 'function') return;
        lenis = new window.Lenis({ autoRaf: true, lerp: 0.1, allowNestedScroll: true, stopInertiaOnNavigate: true });
        root.classList.add('has-lenis');
        window.__lenis = lenis;
    }

    function navOffset() {
        const nav = $('.navbar');
        return nav ? nav.offsetHeight + 8 : 80;
    }

    function scrollToTop() {
        if (lenis) lenis.scrollTo(0, { duration: 1.2 });
        else window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    }

    function scrollToElement(target, moveFocus) {
        if (lenis) {
            lenis.scrollTo(target, { offset: -navOffset(), duration: 1.2 });
        } else {
            const top = target.getBoundingClientRect().top + window.scrollY - navOffset();
            window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
        if (moveFocus) {
            if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        }
    }

    function initAnchors() {
        document.addEventListener('click', function (e) {
            const link = e.target.closest('a[href^="#"]');
            if (!link || e.defaultPrevented) return;
            const hash = link.getAttribute('href');
            if (hash === '#') {
                e.preventDefault();
                scrollToTop();
                return;
            }
            const target = document.getElementById(hash.slice(1));
            if (!target) return;
            e.preventDefault();
            scrollToElement(target, true);
            if (history.pushState) history.pushState(null, '', hash);
        });
    }

    // ============================================
    // NAVBAR: sticky state, back to top, hamburger, scroll spy
    // ============================================
    function initNavbar() {
        const nav = $('.navbar');
        const upBtn = $('.scroll-up-btn');
        scrollTasks.push(function (y) {
            nav.classList.toggle('sticky', y > 20);
            if (upBtn) upBtn.classList.toggle('show', y > 500);
        });
        if (upBtn) upBtn.addEventListener('click', scrollToTop);

        const menu = $('.navbar .menu');
        const burger = $('.navbar-actions .menu-btn');
        if (menu && burger) {
            const setMenu = function (open) {
                menu.classList.toggle('active', open);
                const icon = burger.querySelector('i');
                if (icon) icon.classList.toggle('active', open);
                burger.setAttribute('aria-expanded', String(open));
                burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
                if (lenis) {
                    if (open) lenis.stop();
                    else lenis.start();
                }
            };
            burger.addEventListener('click', function () {
                setMenu(!menu.classList.contains('active'));
            });
            $$('a', menu).forEach(function (a) {
                a.addEventListener('click', function () {
                    if (menu.classList.contains('active')) setMenu(false);
                });
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && menu.classList.contains('active')) {
                    setMenu(false);
                    burger.focus();
                }
            });
            window.matchMedia('(min-width: 1001px)').addEventListener('change', function (e) {
                if (e.matches) setMenu(false);
            });
        }

        // Scroll spy: highlight the section that sits in the middle of the screen
        const links = $$('.navbar .menu a[href^="#"]');
        const byId = new Map(links.map(function (a) { return [a.getAttribute('href').slice(1), a]; }));
        if (!('IntersectionObserver' in window)) return;
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const active = byId.get(entry.target.id);
                if (!active) return;
                links.forEach(function (a) {
                    a.classList.toggle('active', a === active);
                    if (a === active) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        $$('section[id]').forEach(function (section) { spy.observe(section); });
    }

    // ============================================
    // SCROLL PROGRESS BAR
    // ============================================
    function initProgress() {
        const bar = $('.scroll-progress');
        if (!bar) return;
        let max = 1;
        const measure = function () {
            max = Math.max(1, root.scrollHeight - window.innerHeight);
            requestScrollTasks();
        };
        measure();
        window.addEventListener('resize', measure);
        if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
        scrollTasks.push(function (y) {
            bar.style.transform = 'scaleX(' + clamp(y / max, 0, 1).toFixed(4) + ')';
        });
    }

    // ============================================
    // CUSTOM CURSOR (desktop only)
    // ============================================
    function initCursor() {
        if (!finePointer || prefersReduced) return;
        const dot = $('.cursor-dot');
        const ring = $('.cursor-ring');
        if (!dot || !ring) return;
        root.classList.add('has-cursor');

        let x = -100, y = -100, rx = -100, ry = -100, scale = 1, targetScale = 1, running = false;
        const loop = function () {
            rx += (x - rx) * 0.2;
            ry += (y - ry) * 0.2;
            scale += (targetScale - scale) * 0.18;
            ring.style.transform = 'translate3d(' + rx.toFixed(2) + 'px,' + ry.toFixed(2) + 'px,0) scale(' + scale.toFixed(3) + ')';
            if (Math.abs(x - rx) > 0.1 || Math.abs(y - ry) > 0.1 || Math.abs(targetScale - scale) > 0.005) {
                requestAnimationFrame(loop);
            } else {
                running = false;
            }
        };
        const kick = function () {
            if (!running) {
                running = true;
                requestAnimationFrame(loop);
            }
        };

        document.addEventListener('mousemove', function (e) {
            x = e.clientX;
            y = e.clientY;
            dot.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
            root.classList.add('cursor-visible');
            kick();
        }, { passive: true });
        document.documentElement.addEventListener('mouseleave', function () {
            root.classList.remove('cursor-visible');
        });

        const linkSel = 'a, button, [role="tab"], label, select, .book';
        const cardSel = '.glass, .pub-card, .profile-card, .edu-card';
        const textSel = 'input, textarea, [contenteditable="true"]';
        document.addEventListener('mouseover', function (e) {
            const t = e.target;
            const overText = !!t.closest(textSel);
            root.classList.toggle('cursor-text', overText);
            if (overText) targetScale = 1;
            else if (t.closest(linkSel)) targetScale = 1.9;
            else if (t.closest(cardSel)) targetScale = 1.4;
            else targetScale = 1;
            ring.classList.toggle('is-link', targetScale > 1.5);
            kick();
        });
    }

    // ============================================
    // REVEAL ON SCROLL with a natural stagger
    // ============================================
    let revealObserver = null;

    function initReveal() {
        window.__revealReady = true;
        root.classList.remove('reveal-fallback');
        const items = $$('[data-reveal]');
        if (prefersReduced || !('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('is-in'); });
            return;
        }
        revealObserver = new IntersectionObserver(function (entries) {
            let order = 0;
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.style.setProperty('--reveal-delay', Math.min(order * 70, 490) + 'ms');
                order += 1;
                el.classList.add('is-in');
                revealObserver.unobserve(el);
                setTimeout(function () { el.style.removeProperty('--reveal-delay'); }, 1400);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        items.forEach(function (el) { revealObserver.observe(el); });
    }

    // ============================================
    // GRADIENT TEXT HELPER: keeps one continuous gradient across split spans
    // ============================================
    function paintGradient(spans) {
        if (!spans.length) return;
        let left = Infinity, right = -Infinity;
        const rects = spans.map(function (s) {
            const r = s.getBoundingClientRect();
            left = Math.min(left, r.left);
            right = Math.max(right, r.right);
            return r;
        });
        const total = Math.max(1, right - left);
        spans.forEach(function (s, i) {
            s.style.backgroundSize = total + 'px 100%';
            s.style.backgroundPosition = (left - rects[i].left) + 'px 0';
        });
    }

    // ============================================
    // SECTION TITLES: split into words that blur in
    // ============================================
    function initTitles() {
        if (prefersReduced) return;
        const titles = $$('section .title');
        titles.forEach(function (title) {
            const text = title.textContent.trim().replace(/\s+/g, ' ');
            title.setAttribute('aria-label', text);
            title.textContent = '';
            text.split(' ').forEach(function (word, i) {
                if (i) title.appendChild(document.createTextNode(' '));
                const span = document.createElement('span');
                span.className = 'title-word';
                span.textContent = word;
                span.style.setProperty('--i', i);
                span.setAttribute('aria-hidden', 'true');
                title.appendChild(span);
            });
            title.classList.add('is-split');
        });
        const paintAll = function () {
            titles.forEach(function (t) { paintGradient($$('.title-word', t)); });
        };
        paintAll();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintAll);
        window.addEventListener('resize', paintAll);
        if (!('IntersectionObserver' in window)) {
            titles.forEach(function (t) { t.classList.add('is-in'); });
            return;
        }
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.35 });
        titles.forEach(function (t) { io.observe(t); });
    }

    // ============================================
    // TYPING EFFECTS
    // ============================================
    function initTyping() {
        const heroPhrases = ['AI Agents', 'LLMs', 'Cloud Solutions', 'Scalable Systems', 'LLM Systems', 'RAG Pipelines', 'AI Evaluation'];
        const aboutPhrases = ['Programmer', 'Photographer', 'Gamer', 'Athlete', 'Builder', 'Runner'];
        const hero = $('.typing');
        const about = $('.typing-2');
        if (prefersReduced || typeof window.Typed !== 'function') {
            // No typing loop for reduced motion: show the first phrase and leave it
            if (hero) hero.textContent = heroPhrases[0];
            if (about) about.textContent = aboutPhrases[0];
            return;
        }
        const options = { typeSpeed: 100, backSpeed: 60, loop: true, showCursor: true, cursorChar: '|' };
        if (hero) new window.Typed('.typing', Object.assign({ strings: heroPhrases }, options));
        if (about) new window.Typed('.typing-2', Object.assign({ strings: aboutPhrases }, options));
    }

    // ============================================
    // ABOUT BOOK: tap to open on touch, scroll hint for the bio
    // ============================================
    function initBook() {
        const book = $('.about .book');
        if (book && window.matchMedia('(hover: none)').matches) {
            const subtitle = book.querySelector('.cover-subtitle');
            if (subtitle) subtitle.textContent = 'Tap to open';
            book.addEventListener('click', function () { book.classList.toggle('open'); });
        }
        const page = $('.about .book-page');
        const inner = $('.about .book-inner');
        if (page && inner) {
            inner.setAttribute('data-lenis-prevent', '');
            const update = function () {
                const remaining = inner.scrollHeight - inner.scrollTop - inner.clientHeight;
                page.classList.toggle('has-more', remaining > 8);
            };
            inner.addEventListener('scroll', update, { passive: true });
            window.addEventListener('resize', update);
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);
            update();
        }
    }

    // ============================================
    // PUBLICATION CARDS: tap or click to flip
    // ============================================
    function initPubCards() {
        $$('.pub-card').forEach(function (card) {
            card.addEventListener('click', function (e) {
                if (e.target.closest('a')) return;
                const flipped = card.classList.toggle('flipped');
                // Cards also flip on focus, so drop focus when flipping back
                if (!flipped) card.blur();
            });
        });
        $$('.pub-back').forEach(function (back) { back.setAttribute('data-lenis-prevent', ''); });
    }

    // ============================================
    // HERO EFFECTS
    // ============================================
    function initHero() {
        const hero = $('.home');
        if (!hero) return;

        // Background layers drift a little slower than the page
        const layers = $$('.home .animated-bg, .home .particles-container');
        scrollTasks.push(function (y) {
            if (y > window.innerHeight * 1.2) return;
            const offset = (y * 0.15).toFixed(1);
            layers.forEach(function (el) { el.style.transform = 'translate3d(0,' + offset + 'px,0)'; });
        });

        // Constellation canvas
        const canvas = $('.constellation');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const colors = ['99, 102, 241', '139, 92, 246', '236, 72, 153'];
            const pointer = { x: null, y: null };
            let particles = [];
            let w = 0, h = 0;

            const size = function () {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                w = hero.offsetWidth;
                h = hero.offsetHeight;
                canvas.width = w * dpr;
                canvas.height = h * dpr;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                const count = Math.min(Math.floor((w * h) / 22000), 80);
                particles = Array.from({ length: count }, function () {
                    return {
                        x: Math.random() * w,
                        y: Math.random() * h,
                        vx: (Math.random() - 0.5) * 0.35,
                        vy: (Math.random() - 0.5) * 0.35,
                        r: Math.random() * 1.6 + 0.8,
                        c: colors[Math.floor(Math.random() * colors.length)]
                    };
                });
            };

            const draw = function () {
                ctx.clearRect(0, 0, w, h);
                const linkDist = 120;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > w) p.vx *= -1;
                    if (p.y < 0 || p.y > h) p.vy *= -1;
                    if (pointer.x !== null) {
                        const dx = p.x - pointer.x, dy = p.y - pointer.y;
                        const dist = Math.hypot(dx, dy);
                        if (dist > 0.1 && dist < 110) {
                            p.x += (dx / dist) * 0.7;
                            p.y += (dy / dist) * 0.7;
                        }
                    }
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + p.c + ', 0.55)';
                    ctx.fill();
                    for (let j = i + 1; j < particles.length; j++) {
                        const q = particles[j];
                        const dist = Math.hypot(p.x - q.x, p.y - q.y);
                        if (dist < linkDist) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(q.x, q.y);
                            ctx.strokeStyle = 'rgba(99, 102, 241, ' + (0.18 * (1 - dist / linkDist)).toFixed(3) + ')';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                    if (pointer.x !== null) {
                        const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
                        if (dist < 170) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(pointer.x, pointer.y);
                            ctx.strokeStyle = 'rgba(236, 72, 153, ' + (0.25 * (1 - dist / 170)).toFixed(3) + ')';
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                }
            };

            size();
            if (prefersReduced) {
                draw();
            } else {
                let rafId = null;
                const loop = function () {
                    draw();
                    rafId = requestAnimationFrame(loop);
                };
                new IntersectionObserver(function (entries) {
                    if (entries[0].isIntersecting && rafId === null) rafId = requestAnimationFrame(loop);
                    else if (!entries[0].isIntersecting && rafId !== null) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                }).observe(hero);
                hero.addEventListener('pointermove', function (e) {
                    const rect = hero.getBoundingClientRect();
                    pointer.x = e.clientX - rect.left;
                    pointer.y = e.clientY - rect.top;
                });
                hero.addEventListener('pointerleave', function () {
                    pointer.x = null;
                    pointer.y = null;
                });
                let resizeTimer;
                window.addEventListener('resize', function () {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(size, 200);
                });
            }
        }

        // Name reveal, letter by letter
        const nameEl = $('.home .text-2');
        if (nameEl && !prefersReduced) {
            const nameText = nameEl.textContent.trim();
            nameEl.setAttribute('aria-label', nameText);
            nameEl.textContent = '';
            const frag = document.createDocumentFragment();
            Array.from(nameText).forEach(function (chr, i) {
                const span = document.createElement('span');
                span.className = 'ch';
                span.textContent = chr;
                span.setAttribute('aria-hidden', 'true');
                span.style.setProperty('--d', (0.35 + i * 0.045) + 's');
                frag.appendChild(span);
            });
            nameEl.appendChild(frag);
            nameEl.classList.add('split');
            const paintName = function () { paintGradient($$('.ch', nameEl)); };
            paintName();
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintName);
            window.addEventListener('resize', paintName);
        }

        // 3D parallax layers, cursor spotlight and magnetic buttons
        if (finePointer && !prefersReduced) {
            const spotlight = $('.hero-spotlight');
            const parallax = [
                { el: $('.bitmoji-static'), depth: 26 },
                { el: $('.badge-floating'), depth: 40 },
                { el: $('.home .text-2'), depth: 10 },
                { el: $('.particles-container'), depth: 6 }
            ].filter(function (l) { return l.el; });
            hero.addEventListener('mousemove', function (e) {
                const nx = e.clientX / window.innerWidth - 0.5;
                const ny = e.clientY / window.innerHeight - 0.5;
                parallax.forEach(function (l) {
                    l.el.style.translate = (-nx * l.depth).toFixed(1) + 'px ' + (-ny * l.depth).toFixed(1) + 'px';
                });
                if (spotlight) {
                    const rect = hero.getBoundingClientRect();
                    spotlight.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                    spotlight.style.setProperty('--my', (e.clientY - rect.top) + 'px');
                }
            });
            hero.addEventListener('mouseleave', function () {
                parallax.forEach(function (l) { l.el.style.translate = '0px 0px'; });
            });
            $$('.hero-links a').forEach(function (btn) {
                btn.addEventListener('mousemove', function (e) {
                    const r = btn.getBoundingClientRect();
                    const mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                    const my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                    btn.style.translate = (mx * 6).toFixed(1) + 'px ' + (my * 4).toFixed(1) + 'px';
                });
                btn.addEventListener('mouseleave', function () { btn.style.translate = '0px 0px'; });
            });
        }

        // Animated stat counters
        const statNums = $$('.stat-num');
        if (statNums.length && !prefersReduced) {
            const runCounter = function (el) {
                const target = parseFloat(el.dataset.count);
                const decimals = parseInt(el.dataset.decimals || '0', 10);
                const suffix = el.dataset.suffix || '';
                const duration = 1400;
                const start = performance.now();
                const tick = function (now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = (target * eased).toFixed(decimals) + (p === 1 ? suffix : '');
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            };
            setTimeout(function () { statNums.forEach(runCounter); }, 800);
        }
    }

    // ============================================
    // CAROUSELS (Owl, still used by some sections)
    // ============================================
    function initCarousels() {
        const jq = window.jQuery;
        if (!jq || !jq.fn || !jq.fn.owlCarousel) return;
        const responsive = {
            0: { items: 1, nav: false, margin: 20 },
            768: { items: 1, nav: false, margin: 25 },
            1024: { items: 3, nav: false, margin: 30 },
            1400: { items: 3, nav: false, margin: 30 }
        };
        const base = { margin: 30, loop: true, autoplay: !prefersReduced, autoplayHoverPause: true, autoHeight: false, stagePadding: 0, responsive: responsive };
        jq('.services .carousel, .teams .carousel, .skills .carousel').owlCarousel(Object.assign({ autoplayTimeout: 4000 }, base));
        jq('.publications .carousel').owlCarousel(Object.assign({ autoplayTimeout: 5000 }, base));
    }

    // ============================================
    // BUTTON RIPPLE
    // ============================================
    function initRipple() {
        if (prefersReduced) return;
        document.addEventListener('click', function (e) {
            const host = e.target.closest('.github-btn, .primary-cta, .button-area button, .modal-close-btn, .btn-ghost');
            if (!host) return;
            const r = host.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
            host.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 600);
        });
    }

    // ============================================
    // FOOTER YEAR AND CONSOLE NOTE
    // ============================================
    function initFooter() {
        const footerYear = $('#footerYear');
        if (footerYear) footerYear.textContent = new Date().getFullYear();
    }

    function initConsole() {
        console.log('%c👋 Hello! Thanks for checking out my portfolio!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
    }

    // ============================================
    // BOOT: each feature fails on its own without breaking the rest
    // ============================================
    [
        initReveal, initSmoothScroll, initAnchors, initNavbar, initProgress, initCursor,
        initTitles, initTyping, initBook, initPubCards, initHero, initCarousels,
        initRipple, initFooter, initConsole
    ].forEach(function (init) {
        try {
            init();
        } catch (err) {
            console.error('Init failed: ' + init.name, err);
        }
    });
    requestScrollTasks();
})();
