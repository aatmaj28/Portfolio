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
        const fontsReady = (document.fonts && document.fonts.ready)
            ? Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })])
            : Promise.resolve();

        // Background layers drift a little slower than the page
        const layers = $$('.home .animated-bg, .home .particles-container');
        scrollTasks.push(function (y) {
            if (y > window.innerHeight * 1.2) return;
            const offset = (y * 0.15).toFixed(1);
            layers.forEach(function (el) { el.style.transform = 'translate3d(0,' + offset + 'px,0)'; });
        });

        // Scroll hint fades out after the first scroll
        const cue = $('.scroll-cue');
        if (cue) {
            const hideCue = function (y) {
                if (y > 40) {
                    cue.classList.add('is-hidden');
                    const i = scrollTasks.indexOf(hideCue);
                    if (i > -1) scrollTasks.splice(i, 1);
                }
            };
            scrollTasks.push(hideCue);
        }

        initConstellation(hero);
        initNameDecode(fontsReady);

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

        // Stat counters: widths are locked first so counting never shifts the layout
        const statNums = $$('.stat-num');
        if (statNums.length && !prefersReduced) {
            fontsReady.then(function () {
                statNums.forEach(function (el) {
                    el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + 'px';
                });
                const run = function (el) {
                    const target = parseFloat(el.dataset.count);
                    const decimals = parseInt(el.dataset.decimals || '0', 10);
                    const suffix = el.dataset.suffix || '';
                    const duration = 1500;
                    const start = performance.now();
                    const tick = function (now) {
                        const p = Math.min((now - start) / duration, 1);
                        const eased = 1 - Math.pow(1 - p, 3);
                        el.textContent = (target * eased).toFixed(decimals) + suffix;
                        if (p < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                };
                setTimeout(function () { statNums.forEach(run); }, 500);
            });
        }
    }

    // Constellation: particles at different depths drift slowly, link up when close,
    // and lean toward the cursor, where their lines light up.
    function initConstellation(hero) {
        const canvas = $('.constellation');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const palette = ['99, 102, 241', '139, 92, 246', '236, 72, 153'];
        const pointer = { x: 0, y: 0, sx: 0, sy: 0, active: false };
        let particles = [];
        let w = 0, h = 0, small = false;

        const size = function () {
            small = window.innerWidth < 768;
            const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
            w = hero.offsetWidth;
            h = hero.offsetHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = clamp(Math.floor((w * h) / (small ? 15000 : 12500)), 24, small ? 48 : 120);
            particles = Array.from({ length: count }, function () {
                const z = 0.25 + Math.random() * 0.75;
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    z: z,
                    vx: (Math.random() - 0.5) * 0.24 * z,
                    vy: (Math.random() - 0.5) * 0.24 * z,
                    r: 0.6 + z * 1.8,
                    phase: Math.random() * Math.PI * 2,
                    c: palette[Math.floor(Math.random() * palette.length)],
                    dx: 0,
                    dy: 0
                };
            });
            pointer.sx = pointer.x = w / 2;
            pointer.sy = pointer.y = h / 2;
        };

        const draw = function (time) {
            ctx.clearRect(0, 0, w, h);
            pointer.sx += (pointer.x - pointer.sx) * 0.08;
            pointer.sy += (pointer.y - pointer.sy) * 0.08;
            const linkDist = small ? 105 : 135;
            const linkDist2 = linkDist * linkDist;
            const reach = small ? 140 : 190;
            const reach2 = reach * reach;
            const offX = pointer.active ? (pointer.sx - w / 2) : 0;
            const offY = pointer.active ? (pointer.sy - h / 2) : 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx + Math.sin(time * 0.0003 + p.phase) * 0.06 * p.z;
                p.y += p.vy + Math.cos(time * 0.00025 + p.phase) * 0.06 * p.z;
                if (p.x < -20) p.x = w + 20;
                else if (p.x > w + 20) p.x = -20;
                if (p.y < -20) p.y = h + 20;
                else if (p.y > h + 20) p.y = -20;
                if (pointer.active) {
                    const ddx = pointer.x - p.x, ddy = pointer.y - p.y;
                    const d2 = ddx * ddx + ddy * ddy;
                    if (d2 < reach2) {
                        const f = (1 - Math.sqrt(d2) / reach) * 0.01 * p.z;
                        p.x += ddx * f;
                        p.y += ddy * f;
                    }
                }
                // nearer particles shift more with the cursor: a cheap depth effect
                p.dx = p.x - offX * 0.035 * p.z;
                p.dy = p.y - offY * 0.035 * p.z;
            }

            ctx.lineCap = 'round';
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.dx - b.dx, dy = a.dy - b.dy;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > linkDist2) continue;
                    const d = Math.sqrt(d2);
                    let alpha = (1 - d / linkDist) * 0.22 * Math.min(a.z, b.z);
                    let width = 0.8;
                    if (pointer.active) {
                        const mx = (a.dx + b.dx) / 2 - pointer.sx, my = (a.dy + b.dy) / 2 - pointer.sy;
                        const m2 = mx * mx + my * my;
                        if (m2 < reach2) {
                            const boost = 1 - Math.sqrt(m2) / reach;
                            alpha *= 1 + boost * 2.6;
                            width += boost * 0.8;
                        }
                    }
                    ctx.beginPath();
                    ctx.moveTo(a.dx, a.dy);
                    ctx.lineTo(b.dx, b.dy);
                    ctx.strokeStyle = 'rgba(139, 92, 246, ' + Math.min(alpha, 0.6).toFixed(3) + ')';
                    ctx.lineWidth = width;
                    ctx.stroke();
                }
                if (pointer.active) {
                    const cx = a.dx - pointer.sx, cy = a.dy - pointer.sy;
                    const c2 = cx * cx + cy * cy;
                    if (c2 < reach2 && a.z > 0.45) {
                        ctx.beginPath();
                        ctx.moveTo(a.dx, a.dy);
                        ctx.lineTo(pointer.sx, pointer.sy);
                        ctx.strokeStyle = 'rgba(236, 72, 153, ' + ((1 - Math.sqrt(c2) / reach) * 0.3 * a.z).toFixed(3) + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const twinkle = 0.75 + 0.25 * Math.sin(time * 0.002 + p.phase);
                const alpha = (0.25 + 0.55 * p.z) * twinkle;
                if (p.z > 0.8) {
                    ctx.beginPath();
                    ctx.arc(p.dx, p.dy, p.r * 3, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(' + p.c + ', ' + (alpha * 0.12).toFixed(3) + ')';
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(' + p.c + ', ' + alpha.toFixed(3) + ')';
                ctx.fill();
            }
        };

        size();
        if (prefersReduced) {
            draw(0);
            return;
        }
        let rafId = null;
        const loop = function (time) {
            draw(time);
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
            if (e.pointerType !== 'mouse') return;
            const rect = hero.getBoundingClientRect();
            pointer.x = e.clientX - rect.left;
            pointer.y = e.clientY - rect.top;
            pointer.active = true;
        });
        hero.addEventListener('pointerleave', function () { pointer.active = false; });
        let resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(size, 200);
        });
    }

    // Name decode: letters scramble through random glyphs, then settle left to right.
    // Each letter's width is fixed first, so the scramble never moves the layout.
    function initNameDecode(fontsReady) {
        const nameEl = $('.home .text-2');
        if (!nameEl) return;
        const nameText = nameEl.textContent.trim();
        nameEl.setAttribute('aria-label', nameText);
        if (prefersReduced) return;

        nameEl.textContent = '';
        const chars = [];
        nameText.split(' ').forEach(function (word, wi) {
            if (wi) {
                const space = document.createElement('span');
                space.className = 'ch ch-space';
                space.textContent = ' ';
                space.setAttribute('aria-hidden', 'true');
                nameEl.appendChild(space);
                chars.push(space);
            }
            const wordEl = document.createElement('span');
            wordEl.className = 'name-word';
            wordEl.setAttribute('aria-hidden', 'true');
            Array.from(word).forEach(function (chr) {
                const span = document.createElement('span');
                span.className = 'ch';
                span.textContent = chr;
                wordEl.appendChild(span);
                chars.push(span);
            });
            nameEl.appendChild(wordEl);
        });
        nameEl.classList.add('split');

        const finals = chars.map(function (s) { return s.textContent; });
        const lock = function () {
            chars.forEach(function (s) { s.style.width = ''; });
            const widths = chars.map(function (s) { return s.getBoundingClientRect().width; });
            chars.forEach(function (s, i) { s.style.width = widths[i] + 'px'; });
            paintGradient(chars);
        };
        lock();
        window.addEventListener('resize', lock);

        fontsReady.then(function () {
            lock();
            const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
            const start = performance.now();
            let lastSwap = 0;
            chars.forEach(function (s, i) { if (finals[i] !== ' ') s.classList.add('scrambling'); });
            const tick = function (now) {
                const t = now - start;
                let pending = false;
                const swap = now - lastSwap > 45;
                if (swap) lastSwap = now;
                chars.forEach(function (s, i) {
                    if (finals[i] === ' ') return;
                    if (t >= 200 + i * 55) {
                        if (s.classList.contains('scrambling')) {
                            s.textContent = finals[i];
                            s.classList.remove('scrambling');
                        }
                    } else {
                        pending = true;
                        if (swap) s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
                    }
                });
                if (pending) requestAnimationFrame(tick);
                else nameEl.classList.add('decoded');
            };
            requestAnimationFrame(tick);
        });
    }

    // ============================================
    // GLASS CARDS: rotating gradient border, cursor spotlight, subtle 3D tilt
    // ============================================
    function decorateCard(card) {
        if (card.querySelector(':scope > .glass-fx')) return;
        const fx = document.createElement('span');
        fx.className = 'glass-fx';
        fx.setAttribute('aria-hidden', 'true');
        const spot = document.createElement('span');
        spot.className = 'glass-spot';
        fx.appendChild(spot);
        const border = document.createElement('span');
        border.className = 'glass-border';
        border.setAttribute('aria-hidden', 'true');
        card.prepend(border);
        card.prepend(fx);
        if (!finePointer || prefersReduced) return;

        const tilt = card.hasAttribute('data-tilt');
        let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
        const step = function () {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            const settled = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01;
            if (settled && tx === 0 && ty === 0) {
                card.style.transform = '';
                raf = 0;
                return;
            }
            card.style.transform = 'perspective(900px) rotateX(' + cy.toFixed(2) + 'deg) rotateY(' + cx.toFixed(2) + 'deg)';
            raf = settled ? 0 : requestAnimationFrame(step);
        };
        card.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse') return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            spot.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
            if (tilt) {
                tx = (x / rect.width - 0.5) * 6;
                ty = (0.5 - y / rect.height) * 6;
                if (!raf) raf = requestAnimationFrame(step);
            }
        });
        card.addEventListener('pointerleave', function () {
            tx = 0;
            ty = 0;
            if (tilt && !raf) raf = requestAnimationFrame(step);
        });
    }

    function initCards() {
        $$('.glass').forEach(decorateCard);
    }

    // ============================================
    // EXPERIENCE TIMELINE: the line draws itself as you scroll and each
    // node lights up once the line reaches it
    // ============================================
    function initTimeline() {
        const timeline = $('.timeline');
        const fill = $('.tl-fill');
        if (!timeline || !fill) return;
        const items = $$('.tl-item', timeline);
        if (prefersReduced) {
            fill.style.transform = 'scaleY(1)';
            items.forEach(function (item) { item.classList.add('is-lit'); });
            return;
        }
        let nodeTops = [];
        const measure = function () {
            nodeTops = items.map(function (item) {
                const node = item.querySelector('.tl-node');
                return item.offsetTop + (node ? node.offsetTop + node.offsetHeight / 2 : 30);
            });
            requestScrollTasks();
        };
        measure();
        window.addEventListener('resize', measure);
        if ('ResizeObserver' in window) new ResizeObserver(measure).observe(timeline);
        scrollTasks.push(function () {
            const rect = timeline.getBoundingClientRect();
            const reach = window.innerHeight * 0.62 - rect.top;
            fill.style.transform = 'scaleY(' + clamp(reach / rect.height, 0, 1).toFixed(4) + ')';
            items.forEach(function (item, i) {
                item.classList.toggle('is-lit', reach >= nodeTops[i]);
            });
        });
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
        initTitles, initTyping, initBook, initPubCards, initHero, initCards, initTimeline, initCarousels,
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
