const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";
const SUBMISSIONS_TABLE = "partnership_inquiries";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

(function navIsland() {
  const navbar = $("#navbar");
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const capsule = $("#navCapsule");
  const pill = $("#navSlidingPill");
  const navItems = $$(".nav-item", capsule || document);

  // Scroll effect for island glow & depth
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile drawer management
  const closeMenu = () => {
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (!links.classList.contains("open")) return;
    if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  // Interactive Sliding Background Indicator Pill Engine
  let activeItem = navItems.find((el) => el.classList.contains("active")) || navItems[0];

  function positionPill(targetEl) {
    if (!pill || !capsule || !targetEl || window.innerWidth <= 1024) {
      if (pill) pill.style.opacity = "0";
      return;
    }
    const capsuleRect = capsule.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    if (capsuleRect.width === 0 || targetRect.width === 0) return;

    const left = targetRect.left - capsuleRect.left;
    const width = targetRect.width;

    pill.style.transform = `translateX(${left}px)`;
    pill.style.width = `${width}px`;
    pill.style.opacity = "1";
  }

  // Smooth hover transitions
  navItems.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      positionPill(item);
    });
    item.addEventListener("click", () => {
      navItems.forEach((el) => el.classList.remove("active"));
      item.classList.add("active");
      activeItem = item;
      positionPill(activeItem);
    });
  });

  if (capsule) {
    capsule.addEventListener("mouseleave", () => {
      if (activeItem) positionPill(activeItem);
    });
  }

  // Position on ready, font load, and resize
  const reposition = () => {
    if (activeItem) positionPill(activeItem);
  };
  window.addEventListener("resize", reposition);
  window.addEventListener("load", reposition);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reposition);
  }
  setTimeout(reposition, 80);
  setTimeout(reposition, 350);

  // ScrollSpy to automatically glide pill as visitor browses sections
  const sectionIds = ["about", "leadership", "experience", "why", "models", "testimonials", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  let isScrollingSpy = false;
  function updateScrollSpy() {
    if (isScrollingSpy) return;
    isScrollingSpy = true;
    requestAnimationFrame(() => {
      isScrollingSpy = false;
      const scrollPos = window.scrollY + 200;
      let currentSectionId = "";

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.offsetTop <= scrollPos) {
          currentSectionId = sec.id;
          break;
        }
      }

      if (!currentSectionId && window.scrollY < 300) {
        currentSectionId = "about";
      }

      if (currentSectionId) {
        const matchItem = navItems.find(
          (item) => item.getAttribute("data-nav") === currentSectionId
        );
        if (matchItem && matchItem !== activeItem) {
          navItems.forEach((item) => item.classList.remove("active"));
          matchItem.classList.add("active");
          activeItem = matchItem;
          positionPill(activeItem);
        }
      }
    });
  }

  window.addEventListener("scroll", updateScrollSpy, { passive: true });
})();

(function reveal() {
  const items = $$(".reveal");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
})();

(function carousel() {
  const track = $("#track");
  if (!track) return;
  const slides = $$(".track-slide", track);
  const dotsWrap = $("#dots");
  const count = slides.length;
  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.className = "dot";
    b.setAttribute("aria-label", "Go to testimonial " + (i + 1));
    b.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(b);
    return b;
  });

  const sync = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  };

  const goTo = (i) => {
    index = (i + count) % count;
    sync();
  };

  const next = () => goTo(index + 1);
  const restart = () => { clearInterval(timer); timer = setInterval(next, 6500); };

  const prevBtn = $("#prev");
  const nextBtn = $("#next");
  prevBtn && prevBtn.addEventListener("click", () => { goTo(index - 1); restart(); });
  nextBtn && nextBtn.addEventListener("click", () => { goTo(index + 1); restart(); });

  track.parentElement.addEventListener("mouseenter", () => clearInterval(timer));
  track.parentElement.addEventListener("mouseleave", restart);

  sync();
  restart();
})();

(function form() {
  const form = $("#contactForm");
  if (!form) return;
  const status = $("#formStatus");
  const btn = form.querySelector('button[type="submit"]');

  const showStatus = (msg, error) => {
    status.textContent = msg;
    status.classList.toggle("show", true);
    status.style.borderColor = error ? "rgba(200,90,90,.6)" : "var(--line)";
    status.style.color = error ? "#e78f8f" : "var(--gold-light)";
    status.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.name.trim() || !data.phone.trim()) {
      showStatus("Please share your name and phone number so we can reach you.", true);
      return;
    }

    btn.disabled = true;
    btn.style.opacity = "0.5";

    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUBMISSIONS_TABLE}?select=id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({ ...data, created_at: new Date().toISOString() })
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        showStatus("Thank you. Our partnership team will reach out within 24 hours.", false);
        form.reset();
      } else {
        const body = [
          "Investment Model: " + data.model,
          "City: " + data.city,
          "Phone: " + data.phone,
          "Email: " + data.email,
          "",
          data.message
        ].join("\n");
        const mailto =
          "mailto:luxemensalon60@gmail.com" +
          "?subject=" + encodeURIComponent("Partnership Inquiry - " + data.name) +
          "&body=" + encodeURIComponent(body);
        window.location.href = mailto;
        showStatus("Opening your email client... If it did not open, write to luxemensalon60@gmail.com directly.", false);
      }
    } catch (err) {
      showStatus("Something went wrong. Please email luxemensalon60@gmail.com directly.", true);
    } finally {
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  });
})();

(function year() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ==========================================================================
   Cinematic Door Entrance & Automatic Sensor Sliding Engine
   ========================================================================== */
(function cinematicEntrance() {
  const portal = document.getElementById("mallPortal");
  if (!portal) return;

  let isOpening = false;
  let autoTimer = null;

  const openDoors = () => {
    if (isOpening) return;
    isOpening = true;
    clearTimeout(autoTimer);
    portal.classList.add("opening");

    setTimeout(() => {
      portal.classList.add("doors-opened");
      document.body.classList.remove("portal-locked");
      isOpening = false;
    }, 1600);
  };

  document.body.classList.add("portal-locked");
  autoTimer = setTimeout(openDoors, 1400);

  portal.addEventListener("click", () => {
    openDoors();
  });

  const skipBtn = document.getElementById("portalSkipBtn");
  if (skipBtn) {
    skipBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openDoors();
    });
  }

  const replayBtn = document.getElementById("replayEntranceBtn");
  if (replayBtn) {
    replayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      clearTimeout(autoTimer);
      portal.classList.remove("doors-opened", "opening");
      document.body.classList.add("portal-locked");
      window.scrollTo({ top: 0, behavior: "instant" });
      isOpening = false;
      autoTimer = setTimeout(openDoors, 1600);
    });
  }
})();

/* ==========================================================================
   Interactive Glitter Sparkle Engine for Info Card
   ========================================================================== */
(function infoCardGlitter() {
  const card = document.getElementById("infoCard") || document.querySelector(".contact-info.info-card");
  const canvas = document.getElementById("infoCardGlitterCanvas");
  if (!card || !canvas) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let isHovered = false;
  let animId = null;
  let lastMoveTime = 0;

  function resizeCanvas() {
    const rect = card.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("load", resizeCanvas);
  setTimeout(resizeCanvas, 150);

  const colors = [
    "#FFFFFF", // Diamond white
    "#FFF8DB", // Warm luminous gold
    "#FFF0BA", // Champagne gold
    "#D4AF37", // Royal metallic gold
    "#F3E5AB", // Soft gold
    "#FFDF73"  // Bright golden highlight
  ];

  class GlitterParticle {
    constructor(x, y, isBurst = false) {
      this.x = x + (Math.random() - 0.5) * (isBurst ? 32 : 14);
      this.y = y + (Math.random() - 0.5) * (isBurst ? 32 : 14);
      const angle = Math.random() * Math.PI * 2;
      const speed = isBurst ? Math.random() * 2.6 + 0.6 : Math.random() * 1.3 + 0.25;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - (Math.random() * 0.4);
      this.radius = Math.random() * 2.6 + 1.2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = 1;
      this.decay = Math.random() * 0.024 + 0.014;
      this.twinkleRate = Math.random() * 0.28 + 0.16;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.isStar = Math.random() > 0.4;
      this.rotation = Math.random() * Math.PI;
      this.rotSpeed = (Math.random() - 0.5) * 0.08;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.alpha -= this.decay;
      this.twinklePhase += this.twinkleRate;
      this.rotation += this.rotSpeed;
      return this.alpha > 0;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      const twinkle = (Math.sin(this.twinklePhase) + 1) * 0.5;
      const currentAlpha = Math.max(0, Math.min(1, this.alpha * (0.45 + 0.55 * twinkle)));
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = currentAlpha;

      if (this.isStar) {
        // 4-point diamond sparkle star
        const r = this.radius * (1 + 0.55 * twinkle);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -r * 2.2);
        ctx.quadraticCurveTo(0, 0, r * 2.2, 0);
        ctx.quadraticCurveTo(0, 0, 0, r * 2.2);
        ctx.quadraticCurveTo(0, 0, -r * 2.2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r * 2.2);
        ctx.fill();

        // White incandescent center
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Glowing circular sparkle
        const r = this.radius * (1 + 0.35 * twinkle);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Diamond white core
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function spawnParticles(x, y, count = 3, isBurst = false) {
    if (particles.length > 120) return;
    for (let i = 0; i < count; i++) {
      particles.push(new GlitterParticle(x, y, isBurst));
    }
    if (!animId) {
      animId = requestAnimationFrame(loop);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, width, height);

    // If hovering, spawn occasional ambient sparkles across the card surface
    const now = performance.now();
    if (isHovered && now - lastMoveTime > 110 && Math.random() < 0.4) {
      const rx = Math.random() * (width - 40) + 20;
      const ry = Math.random() * (height - 40) + 20;
      spawnParticles(rx, ry, 1, false);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (!p.update()) {
        particles.splice(i, 1);
      } else {
        p.draw(ctx);
      }
    }

    if (particles.length > 0 || isHovered) {
      animId = requestAnimationFrame(loop);
    } else {
      animId = null;
      ctx.clearRect(0, 0, width, height);
    }
  }

  // Pointer / Cursor interactions
  card.addEventListener("pointerenter", (e) => {
    isHovered = true;
    resizeCanvas();
    card.classList.add("is-glittering");
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnParticles(x, y, 9, true);
  });

  card.addEventListener("pointermove", (e) => {
    lastMoveTime = performance.now();
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnParticles(x, y, Math.random() < 0.65 ? 2 : 3, false);
  });

  card.addEventListener("pointerleave", () => {
    isHovered = false;
    card.classList.remove("is-glittering");
  });

  // Touch device burst support
  card.addEventListener("touchstart", (e) => {
    isHovered = true;
    resizeCanvas();
    card.classList.add("is-glittering");
    const touch = e.touches[0];
    if (touch) {
      const rect = card.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      spawnParticles(x, y, 14, true);
    }
  }, { passive: true });

  card.addEventListener("touchend", () => {
    isHovered = false;
    setTimeout(() => card.classList.remove("is-glittering"), 700);
  });
})();

(function scissorCursorFeedback() {
  window.addEventListener("mousedown", () => document.body.classList.add("scissor-cutting"));
  window.addEventListener("mouseup", () => document.body.classList.remove("scissor-cutting"));
})();

/* ==========================================================================
   Stationary Scissor Cursor Gold Shine Engine
   Shines like brilliant gold when the cursor is NOT moving,
   and stops immediately the moment the cursor moves.
   ========================================================================== */
(function scissorCursorGoldShine() {
  // Only activate on devices that support hover / fine pointers
  if (window.matchMedia && !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const shineEl = document.getElementById("cursorGoldShine");
  if (!shineEl) return;

  let idleTimer = null;
  let lastX = -999;
  let lastY = -999;
  const IDLE_DELAY = 120; // 120ms of no movement triggers the golden shine

  function stopShine() {
    shineEl.classList.remove("is-shining");
  }

  function startShine() {
    if (lastX >= 0 && lastY >= 0) {
      shineEl.classList.add("is-shining");
    }
  }

  function updatePosition(x, y) {
    shineEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function onMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    // Check if cursor actually moved position
    if (x === lastX && y === lastY) return;

    lastX = x;
    lastY = y;

    // Instantly stop the shine when moving
    stopShine();

    // Position shine element directly at cursor coordinates
    updatePosition(x, y);

    // Reset idle timer
    if (idleTimer) clearTimeout(idleTimer);

    // When the cursor is stationary (not moving), shine like gold!
    idleTimer = setTimeout(() => {
      startShine();
    }, IDLE_DELAY);
  }

  function onMouseLeave() {
    if (idleTimer) clearTimeout(idleTimer);
    stopShine();
    lastX = -999;
    lastY = -999;
  }

  // Bind mouse and window events
  document.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseleave", onMouseLeave, { passive: true });
  window.addEventListener("blur", onMouseLeave, { passive: true });
  window.addEventListener("scroll", () => {
    // When scrolling with wheel/trackpad, also pause shine until settled
    stopShine();
    if (idleTimer) clearTimeout(idleTimer);
    if (lastX >= 0 && lastY >= 0) {
      idleTimer = setTimeout(startShine, IDLE_DELAY);
    }
  }, { passive: true });
})();

/* ==========================================================================
   Futuristic Layered Typography Parallax Controller
   ========================================================================== */
(function initFuturisticHeadingParallax() {
  const modules = document.querySelectorAll(".futuristic-heading-module");
  if (!modules.length) return;

  modules.forEach((mod) => {
    const card = mod.querySelector(".glass-backdrop-card");
    if (!card) return;

    mod.addEventListener("pointermove", (e) => {
      const rect = mod.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5.5;
      const rotateY = ((x - centerX) / centerX) * 5.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`;

      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      card.style.setProperty("--mouse-x", `${pctX.toFixed(1)}%`);
      card.style.setProperty("--mouse-y", `${pctY.toFixed(1)}%`);
    });

    mod.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      card.style.setProperty("--mouse-x", "50%");
      card.style.setProperty("--mouse-y", "50%");
    });
  });
})();

/* ==========================================================================
   3D Perspective Section Heading Flip-Reveal Engine
   Splits .section-title text into per-word spans and triggers the
   CSS flip animation as each heading enters the viewport.
   ========================================================================== */
(function headingFlipReveal() {
  const headings = document.querySelectorAll('.section-title');
  if (!headings.length) return;

  /**
   * Splits a heading's child nodes into individual word spans.
   * Handles plain text nodes, <em>, <strong>, <br>, and other inline tags.
   */
  function splitHeading(heading) {
    const childNodes = Array.from(heading.childNodes);
    heading.innerHTML = '';
    let wordIdx = 0;

    function makeWordSpan(textContent, tagName, className) {
      const wrap = document.createElement('span');
      wrap.className = 'hfr-wrap';

      const inner = document.createElement('span');
      inner.className = 'hfr-inner';
      inner.style.setProperty('--wi', wordIdx++);

      if (tagName) {
        // Re-wrap in the original tag (e.g. <em>) to preserve italic/gold styling
        const tag = document.createElement(tagName);
        if (className) tag.className = className;
        tag.textContent = textContent;
        inner.appendChild(tag);
      } else {
        inner.textContent = textContent;
      }

      wrap.appendChild(inner);
      return wrap;
    }

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Split raw text into words; preserve whitespace between them
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            heading.appendChild(document.createTextNode(part));
          } else {
            heading.appendChild(makeWordSpan(part, null, null));
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          heading.appendChild(document.createElement('br'));
        } else {
          // Inline element like <em> — split its text into words too
          node.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              heading.appendChild(document.createTextNode(part));
            } else {
              heading.appendChild(
                makeWordSpan(part, node.tagName, node.className || null)
              );
            }
          });
        }
      }
    });
  }

  headings.forEach(h => splitHeading(h));

  // Observe each heading; add .hfr-visible once it crosses into the viewport
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('hfr-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -55px 0px' }
  );

  headings.forEach(h => io.observe(h));
})();

/* ==========================================================================
   Hero Title — Gold Dust Particle Text Effect
   Dissolves the hero h1 into glowing gold particles on hover / click,
   then reassembles fluidly via a spring-physics system.

   Pipeline:
     1. Wait for fonts + cinematic door portal to finish.
     2. Render heading text onto an off-screen canvas and pixel-sample
        every GAP pixels to collect glyph home-positions.
     3. Create one Dot per sampled pixel, initially scattered off-screen.
     4. Drive a requestAnimationFrame loop across four modes:
          assembling → idle ←→ hover / burst → returning → assembling
   ========================================================================== */
(function heroParticleText() {
  'use strict';

  const heading = document.querySelector('.hero-title');
  if (!heading) return;

  /* ── Config ────────────────────────────────────────────────────────────── */
  const MAX_PX = 4000;      // particle cap for performance
  const GAP    = 4;         // pixel-sampling gap on off-canvas (px at 1x)
  const DPR    = Math.min(window.devicePixelRatio || 1, 2);
  const GOLD   = ['#FFFDF5','#FFF5C8','#F3E5AB','#E9CE8A','#D4AF37','#C8A830','#FFE070'];

  /* ── Shared state ──────────────────────────────────────────────────────── */
  let cnv, ctx;
  let W = 0, H = 0;
  let dots  = [];
  let mode  = 'off';      // off | assembling | idle | hover | burst | returning
  let mx = 0, my = 0;    // mouse in canvas-local coords
  let raf = null;
  let burstTimer = null;

  /* ── Particle ──────────────────────────────────────────────────────────── */
  class Dot {
    constructor(hx, hy) {
      this.hx  = hx;
      this.hy  = hy;
      // Start scattered above / below so they fly into place
      this.x   = Math.random() * W;
      this.y   = Math.random() < 0.5
                 ? -20 - Math.random() * 80
                 :  H + 20 + Math.random() * 80;
      this.vx  = 0;
      this.vy  = 0;
      this.col = GOLD[0 | (Math.random() * GOLD.length)];
      this.r   = 0.5 + Math.random() * 1.5;   // radius
      this.ph  = Math.random() * Math.PI * 2; // twinkle phase
      this.spd = 0.028 + Math.random() * 0.042; // twinkle speed
    }

    /* spring helper — modifies velocity, caller adds to position */
    _sp(tx, ty, ease, drag) {
      this.vx += (tx - this.x) * ease;
      this.vy += (ty - this.y) * ease;
      this.vx *= drag;
      this.vy *= drag;
    }

    step() {
      this.ph += this.spd;

      switch (mode) {

        case 'assembling':
          this._sp(this.hx, this.hy, 0.08, 0.78);
          break;

        case 'idle':
          /* gentle organic float around home position */
          this._sp(
            this.hx + Math.sin(this.ph * 0.55) * 0.9,
            this.hy + Math.cos(this.ph * 0.45) * 0.65,
            0.055, 0.86
          );
          break;

        case 'hover': {
          /* push particles away from cursor, spring them home */
          const dx = this.x - mx, dy = this.y - my;
          const d2 = dx * dx + dy * dy;
          const R  = 95;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (R - d) / R * 3.2;
            this.vx += (dx / d) * f;
            this.vy += (dy / d) * f;
          }
          this._sp(this.hx, this.hy, 0.055, 0.80);
          break;
        }

        case 'burst': {
          /* explosive repulsion from click point */
          const dx = this.x - mx, dy = this.y - my;
          const d  = Math.sqrt(dx * dx + dy * dy) || 1;
          const f  = 26 / (d * 0.36 + 1);
          this.vx += (dx / d) * f + (Math.random() - 0.5) * 5.5;
          this.vy += (dy / d) * f + (Math.random() - 0.5) * 5.5 - 2;
          this.vx *= 0.90;
          this.vy *= 0.90;
          this.vy += 0.07;    // gravity
          this.x  += this.vx;
          this.y  += this.vy;
          return;             // early return: skip spring position update below
        }

        case 'returning':
          this._sp(this.hx, this.hy, 0.075, 0.83);
          break;
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    paint() {
      const tw = (Math.sin(this.ph) + 1) * 0.5;           // 0..1 twinkle
      const r  = this.r * (0.76 + 0.48 * tw);
      const a  = 0.62 + 0.38 * tw;

      ctx.globalAlpha = a;
      ctx.fillStyle   = this.col;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, 6.2832);
      ctx.fill();

      /* cross-hair glint only on larger particles at twinkle peak */
      if (r > 1.2 && tw > 0.58) {
        ctx.globalAlpha = a * 0.42;
        const g = r * 2.8;
        ctx.fillRect(this.x - g,   this.y - 0.45, g * 2,   0.9);
        ctx.fillRect(this.x - 0.45, this.y - g,   0.9,     g * 2);
      }
    }
  }

  /* ── Canvas setup ──────────────────────────────────────────────────────── */
  function mount() {
    if (cnv) cnv.remove();
    const rect = heading.getBoundingClientRect();
    W = rect.width;
    H = rect.height;

    cnv = document.createElement('canvas');
    cnv.width  = Math.round(W * DPR);
    cnv.height = Math.round(H * DPR);
    cnv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;' +
                        'pointer-events:none;z-index:4;';
    heading.style.position = 'relative';
    heading.appendChild(cnv);

    ctx = cnv.getContext('2d');
    ctx.scale(DPR, DPR);

    buildDots();
  }

  /* ── Pixel-sample text from off-screen canvas ──────────────────────────── */
  function buildDots() {
    const off = document.createElement('canvas');
    off.width  = Math.round(W * DPR);
    off.height = Math.round(H * DPR);
    const oc   = off.getContext('2d');
    oc.scale(DPR, DPR);

    const cs = window.getComputedStyle(heading);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight) || fs * 1.15;

    /* Render both text lines — matching the actual h1 markup */
    oc.fillStyle    = '#fff';
    oc.textAlign    = 'center';
    oc.textBaseline = 'top';

    oc.font = `600 ${fs}px Cinzel,serif`;
    oc.fillText('The Art of the', W / 2, 0);

    oc.font = `italic 600 ${fs}px Cinzel,serif`;
    oc.fillText('Gentleman, Refined.', W / 2, lh);

    /* Sample alpha channel for filled glyph pixels */
    const px   = oc.getImageData(0, 0, off.width, off.height).data;
    const step = Math.max(2, Math.round(GAP * DPR));
    const pts  = [];

    for (let row = 0; row < off.height; row += step) {
      for (let col = 0; col < off.width; col += step) {
        if (px[(row * off.width + col) * 4 + 3] > 110) {
          pts.push([col / DPR, row / DPR]);
        }
      }
    }

    /* Thin the set if we exceed MAX_PX */
    const thin = pts.length > MAX_PX ? Math.ceil(pts.length / MAX_PX) : 1;
    dots = pts
      .filter((_, i) => i % thin === 0)
      .map(([hx, hy]) => new Dot(hx, hy));

    /* Visually hide the original text; keep it in DOM for SEO / a11y */
    heading.style.color = 'transparent';
    heading.querySelectorAll('*').forEach(el => {
      el.style.webkitTextFillColor = 'transparent';
      el.style.backgroundImage     = 'none';
      el.style.color               = 'transparent';
    });

    mode = 'assembling';
    loop();
  }

  /* ── Render loop ───────────────────────────────────────────────────────── */
  function loop() {
    if (raf) cancelAnimationFrame(raf);

    ctx.clearRect(0, 0, W, H);

    /* Single shared glow for all particles — much faster than per-particle shadowBlur */
    ctx.shadowColor = 'rgba(212,175,55,0.72)';
    ctx.shadowBlur  = mode === 'burst' ? 14 : mode === 'hover' ? 8 : 5;

    let assembled = (mode === 'assembling');
    for (const d of dots) {
      d.step();
      if (assembled &&
          (Math.abs(d.x - d.hx) > 1.5 || Math.abs(d.y - d.hy) > 1.5)) {
        assembled = false;
      }
      d.paint();
    }
    if (assembled) mode = 'idle';

    /* Reset shared state */
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;

    raf = requestAnimationFrame(loop);
  }

  /* ── Interactions ──────────────────────────────────────────────────────── */
  function local(e) {
    const r = cnv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }

  heading.style.cursor = 'pointer';
  heading.setAttribute('title', 'Click to dissolve into gold dust');

  heading.addEventListener('mousemove', e => {
    [mx, my] = local(e);
    if (mode === 'idle' || mode === 'returning') mode = 'hover';
  });

  heading.addEventListener('mouseleave', () => {
    if (mode === 'hover') {
      mode = 'returning';
      setTimeout(() => { if (mode === 'returning') mode = 'assembling'; }, 520);
    }
  });

  heading.addEventListener('click', e => {
    [mx, my] = local(e);
    mode = 'burst';
    clearTimeout(burstTimer);
    burstTimer = setTimeout(() => {
      mode = 'returning';
      setTimeout(() => { if (mode === 'returning') mode = 'assembling'; }, 200);
    }, 940);
  });

  /* ── Bootstrap: wait for portal doors + hero reveal transition ─────────── */
  function whenReady(cb) {
    if (!document.body.classList.contains('portal-locked')) {
      /* No portal / already dismissed — wait for hero reveal (~900ms) */
      setTimeout(cb, 950);
      return;
    }
    /* Portal is open — watch for portal-locked to be removed */
    const obs = new MutationObserver(() => {
      if (!document.body.classList.contains('portal-locked')) {
        obs.disconnect();
        setTimeout(cb, 1100); // extra buffer for hero reveal CSS transition
      }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  const boot = () => whenReady(mount);
  if (document.fonts?.ready) document.fonts.ready.then(boot);
  else window.addEventListener('load', boot);

  /* ── Resize: rebuild at new dimensions ────────────────────────────────── */
  let resizeTmr;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTmr);
    resizeTmr = setTimeout(() => {
      if (mode === 'off') return;
      cancelAnimationFrame(raf);
      /* Temporarily restore text while we remeasure */
      heading.style.color = '';
      heading.querySelectorAll('*').forEach(el => {
        el.style.webkitTextFillColor = '';
        el.style.backgroundImage     = '';
        el.style.color               = '';
      });
      setTimeout(mount, 60);
    }, 380);
  });
})();