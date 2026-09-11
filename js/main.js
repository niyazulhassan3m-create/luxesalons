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
  const sectionIds = ["about", "experience", "why", "models", "testimonials", "contact"];
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

    // After door sliding animation finishes, unlock page and hide portal
    setTimeout(() => {
      portal.classList.add("doors-opened");
      document.body.classList.remove("portal-locked");
      isOpening = false;
    }, 1600);
  };

  // Lock scrolling during entrance intro
  document.body.classList.add("portal-locked");

  // Automatically slide open like shopping mall automatic sensor doors
  autoTimer = setTimeout(openDoors, 1400);

  // Allow clicking anywhere on the portal to slide open immediately
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

  // Replay entrance handler
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