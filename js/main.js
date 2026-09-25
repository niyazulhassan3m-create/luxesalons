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
  const sectionIds = ["about", "leadership", "experience", "gallery", "why", "models", "testimonials", "contact"];
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
   Interactive Gallery Filter & Fullscreen Lightbox Engine
   ========================================================================== */
(function initGallery() {
  const filterBtns = document.querySelectorAll(".gallery-filter-btn");
  const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));
  const lightbox = document.getElementById("galleryLightbox");
  if (!galleryCards.length || !lightbox) return;

  const backdrop = document.getElementById("lightboxBackdrop");
  const closeBtn = document.getElementById("lightboxCloseBtn");
  const prevBtn = document.getElementById("lightboxPrevBtn");
  const nextBtn = document.getElementById("lightboxNextBtn");
  const imgEl = document.getElementById("lightboxImg");
  const titleEl = document.getElementById("lightboxTitle");
  const captionEl = document.getElementById("lightboxCaption");
  const badgeEl = document.getElementById("lightboxBadge");
  const counterEl = document.getElementById("lightboxCounter");

  // Extract metadata for all cards
  const items = galleryCards.map((card, idx) => {
    const img = card.querySelector("img");
    const badge = card.querySelector(".gallery-badge");
    const title = card.querySelector(".gallery-card-title");
    const desc = card.querySelector(".gallery-card-desc");

    return {
      index: idx,
      element: card,
      category: card.getAttribute("data-category") || "all",
      src: img ? img.src : "",
      alt: img ? img.alt : "Luxe Men Salon Gallery",
      badge: badge ? badge.textContent.replace("✦", "").trim() : "Showcase",
      title: title ? title.textContent.trim() : "Luxe Men Salon",
      desc: desc ? desc.textContent.trim() : "",
      externalLink: card.getAttribute("data-external-link") || null,
    };
  });

  let currentFilteredItems = items.filter((it) => !it.externalLink);
  let activeLightboxIndex = 0;

  // Auto-sync filter counts
  filterBtns.forEach((btn) => {
    const filter = btn.getAttribute("data-filter");
    const countEl = btn.querySelector(".btn-filter-count");
    if (countEl) {
      const count = filter === "all"
        ? galleryCards.length
        : galleryCards.filter((c) => {
            const cat = c.getAttribute("data-category") || "";
            return cat === filter || cat.split(" ").includes(filter);
          }).length;
      countEl.textContent = count;
    }
  });

  // Filter interaction
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      currentFilteredItems = [];
      galleryCards.forEach((card) => {
        const cat = card.getAttribute("data-category") || "";
        const match = filter === "all" || cat === filter || cat.split(" ").includes(filter);
        if (match) {
          card.classList.remove("hidden");
          const item = items.find((it) => it.element === card);
          if (item && !item.externalLink) currentFilteredItems.push(item);
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // Open Lightbox for specific item
  function openLightbox(item) {
    const activeIdxInFiltered = currentFilteredItems.findIndex((it) => it.index === item.index);
    activeLightboxIndex = activeIdxInFiltered >= 0 ? activeIdxInFiltered : 0;
    renderLightboxItem();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderLightboxItem() {
    if (!currentFilteredItems.length) return;
    const current = currentFilteredItems[activeLightboxIndex];
    if (!current) return;

    if (imgEl) {
      imgEl.classList.add("loading");
      imgEl.src = current.src;
      imgEl.alt = current.alt;
      imgEl.onload = () => imgEl.classList.remove("loading");
    }
    if (titleEl) titleEl.textContent = current.title;
    if (captionEl) captionEl.textContent = current.desc;
    if (badgeEl) badgeEl.textContent = current.badge;
    if (counterEl) {
      const curNum = String(activeLightboxIndex + 1).padStart(2, "0");
      const totalNum = String(currentFilteredItems.length).padStart(2, "0");
      counterEl.textContent = `${curNum} / ${totalNum}`;
    }
  }

  function showNext() {
    if (!currentFilteredItems.length) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % currentFilteredItems.length;
    renderLightboxItem();
  }

  function showPrev() {
    if (!currentFilteredItems.length) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
    renderLightboxItem();
  }

  // Card click triggers
  galleryCards.forEach((card) => {
    const extLink = card.getAttribute("data-external-link");
    if (extLink) {
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        if (card.tagName.toLowerCase() !== "a") {
          window.open(extLink, "_blank", "noopener,noreferrer");
        }
      });
      return;
    }

    card.addEventListener("click", () => {
      const idx = parseInt(card.getAttribute("data-index"), 10);
      const target = items.find((it) => it.index === idx);
      if (target) openLightbox(target);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Modal event listeners
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
  if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });

  // Keyboard navigation
  window.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowRight") showNext();
    else if (e.key === "ArrowLeft") showPrev();
  });
})();

/**
 * Auto-expiring Opening Dates Engine
 * Automatically detects any salon branch, marquee pill, or badge with an opening date.
 * If the current date has crossed (passed) the specified opening date, the date/badge is automatically removed,
 * seamlessly transitioning the location into an active, operational branch.
 */
(function autoExpireOpeningDates() {
  const MONTH_MAP = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };

  function parseDateText(text, explicitDateStr) {
    if (explicitDateStr) {
      const parsed = new Date(explicitDateStr);
      if (!isNaN(parsed.getTime())) {
        if (explicitDateStr.length <= 10) parsed.setHours(23, 59, 59, 999);
        return parsed;
      }
    }
    if (!text) return null;
    // Matches: "Opening on 1 January", "Opening 1st Jan", "Opens 15th Oct", "1 January", etc.
    const match = text.match(/(?:opening|opens|launch)?\s*(?:on)?\s*(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(\d{4}))?/i) ||
                  text.match(/(?:opening|opens|launch)?\s*(?:on)?\s*([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{4}))?/i);
    if (!match) return null;
    let day, monthName, year;
    const now = new Date();
    if (isNaN(parseInt(match[1], 10))) {
      monthName = match[1].toLowerCase();
      day = parseInt(match[2], 10);
      year = match[3] ? parseInt(match[3], 10) : null;
    } else {
      day = parseInt(match[1], 10);
      monthName = match[2].toLowerCase();
      year = match[3] ? parseInt(match[3], 10) : null;
    }
    if (!MONTH_MAP.hasOwnProperty(monthName) || isNaN(day) || day < 1 || day > 31) return null;

    const monthIndex = MONTH_MAP[monthName];
    if (!year) {
      year = now.getFullYear();
      // If the announced month is earlier than the current month (e.g. "January" when we are in September), it refers to the upcoming year!
      if (monthIndex < now.getMonth()) {
        year += 1;
      }
    }
    return new Date(year, monthIndex, day, 23, 59, 59, 999);
  }

  function checkAndExpire() {
    const now = new Date();

    // 1. Elements with explicit data-opening-date
    document.querySelectorAll("[data-opening-date]").forEach((el) => {
      const date = parseDateText(el.textContent, el.getAttribute("data-opening-date"));
      if (date && now >= date) {
        if (el.classList.contains("city-badge")) {
          el.remove();
        } else {
          el.removeAttribute("data-opening-date");
          el.textContent = el.textContent.replace(/(?:opening|opens|launch)?\s*\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+\d{4})?/gi, "").trim();
        }
      }
    });

    // 2. City badges with date in text (e.g. "Opening 12th Sep", "Opening 13th Sep")
    document.querySelectorAll(".city-badge").forEach((badge) => {
      const text = badge.textContent.trim();
      // Skip non-date badges like "Opening Soon", "On Process", "International"
      if (/soon|process|international/i.test(text)) return;

      const date = parseDateText(text);
      if (date && now >= date) {
        badge.remove();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndExpire);
  } else {
    checkAndExpire();
  }

  // Periodic check once per hour
  setInterval(checkAndExpire, 60 * 60 * 1000);
})();

/* ==========================================================================
   Luxe AI Concierge — Full Persona & Conversation Engine  v2.0
   Role: Elite business & customer service assistant for Luxe Men Salon
   ========================================================================== */
(function luxeConcierge() {
  "use strict";

  const chat     = document.getElementById("luxeChat");
  const toggle   = document.getElementById("luxeChatToggle");
  const panel    = document.getElementById("luxeChatPanel");
  const closeBtn = document.getElementById("luxeChatClose");
  const msgBox   = document.getElementById("luxeChatMessages");
  const input    = document.getElementById("luxeChatInput");
  const sendBtn  = document.getElementById("luxeChatSend");
  const qrWrap   = document.getElementById("luxeChatQuickReplies");

  if (!chat || !toggle || !panel) return;

  // ─────────────────────────────────────────────────────────────────────────
  // PERSONA & CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  const PERSONA_NAME = "Luxe Concierge";

  const GREETING =
    "Good day! Welcome to <strong>Luxe Men Salon</strong> ✦<br><br>" +
    "I'm your personal <strong>Luxe Concierge</strong> — here to assist you with anything from our premium grooming services to exploring our highly lucrative <strong>Turnkey Franchise Opportunity</strong>.<br><br>" +
    "How may I assist you today?";

  const SERVICES_INFO =
    "<strong>✦ Our Premium Grooming Services</strong><br><br>" +
    "• <strong>Signature Haircuts</strong> — Precision styling by expert barbers<br>" +
    "• <strong>Royal Beard Trim</strong> — Sculpted, defined, perfected<br>" +
    "• <strong>Hot Towel Shave</strong> — The ultimate classic gentlemen's ritual<br>" +
    "• <strong>Scalp Treatments</strong> — Therapeutic, rejuvenating care<br>" +
    "• <strong>Luxury Facials</strong> — Deep cleanse & skin revival<br>" +
    "• <strong>Hair Colour & Highlights</strong> — Refined, modern tones<br>" +
    "• <strong>De-Tan & Skin Brightening</strong> — Radiant, refreshed finish<br><br>" +
    "Would you like to <strong>book an appointment</strong> at your nearest Luxe salon?";

  const FRANCHISE_INTRO =
    "<strong>✦ Luxe Men Salon — Turnkey Franchise Opportunity</strong><br><br>" +
    "You've made an excellent choice to explore one of India's fastest-growing men's salon brands.<br><br>" +
    "<strong>Why Luxe?</strong><br>" +
    "• ₹<strong>0 Franchise Fee</strong> — Zero upfront brand fee<br>" +
    "• <strong>7 Investment Models</strong> — ₹3L to ₹25L+ to suit every budget<br>" +
    "• <strong>Complete Turnkey Setup</strong> — Interior, equipment & branding handled<br>" +
    "• <strong>Full Operational Support</strong> — Training, marketing & ongoing guidance<br>" +
    "• <strong>50+ Outlets</strong> across Tamil Nadu & expanding globally<br><br>" +
    "To connect you with our senior <strong>Business Development Team</strong>, I'll need a few quick details.<br><br>" +
    "May I start with your <strong>full name</strong>, please?";

  const APPOINTMENT_INTRO =
    "Wonderful! I'd be delighted to help you book a grooming session at your nearest Luxe Men Salon.<br><br>" +
    "To get started, could you please share your <strong>name</strong> and the <strong>city</strong> you're in?";

  const FALLBACK =
    "Thank you for reaching out. I want to make sure you receive the right assistance.<br><br>" +
    "Are you visiting us as a <strong>grooming client</strong> looking to book an appointment, or are you interested in our <strong>franchise opportunity</strong>?";

  // ─────────────────────────────────────────────────────────────────────────
  // KNOWLEDGE BASE (keyword replies — for general queries)
  // ─────────────────────────────────────────────────────────────────────────
  const KB = [
    {
      keys: ["location", "city", "where", "outlet", "branch", "state", "near"],
      ans: "We currently have <strong>50+ outlets</strong> across Tamil Nadu — including Theni, Dindigul, Madurai, Coimbatore, Tirupur, Anthiyur, Singampunari, Trichy, Velayuthapalayam, and many more.<br><br>We're also launching internationally in <strong>Malaysia</strong> on 1 Jan 2027! Would you like to find your nearest salon?"
    },
    {
      keys: ["founder", "owner", "zawith", "ceo", "established", "started"],
      ans: "Luxe Men Salon was founded by <strong>Zawith Ahamed.N</strong> in <strong>October 2022</strong> with a powerful vision — to redefine the men's grooming experience through luxury, consistency, and scalable franchise excellence."
    },
    {
      keys: ["invest", "cost", "model", "price", "budget", "tier", "plan", "package", "amount"],
      ans: "<strong>✦ Investment Models at a Glance</strong><br><br>Luxe offers <strong>7 flexible investment tiers</strong> starting from ₹3 Lakhs all the way to our premium <strong>Signature Model</strong> at ₹25L+, each inclusive of complete turnkey setup.<br><br>All models include interior design, branding, equipment, staff training, and launch support — with <strong>₹0 franchise fee</strong>.<br><br>Shall I connect you with our Business Development Team for a detailed proposal?"
    },
    {
      keys: ["royalty", "fee", "monthly", "upfront", "charge", "zero"],
      ans: "Great news — Luxe Men Salon charges <strong>absolutely ₹0 upfront franchise fee</strong>. The only ongoing commitment is a nominal monthly royalty from ₹5,000, ensuring industry-leading profit margins for our partners."
    },
    {
      keys: ["support", "training", "help", "guide", "staff", "operation"],
      ans: "Our franchise partners receive <strong>end-to-end support</strong>:<br>• Site identification & lease negotiation guidance<br>• Premium interior design & setup<br>• Comprehensive staff training programs<br>• Marketing collateral & brand assets<br>• Ongoing operational mentorship<br><br>You are <em>never</em> on your own with Luxe."
    },
    {
      keys: ["profit", "revenue", "earn", "income", "return", "roi", "margin"],
      ans: "Our franchise partners consistently achieve <strong>strong monthly revenues</strong> driven by high footfall, premium pricing, and repeat clientele. Detailed P&L projections are shared during your personalised discovery call with our Business Development Team."
    },
    {
      keys: ["malaysia", "international", "global", "abroad", "overseas", "expand"],
      ans: "Yes! Luxe Men Salon is proud to announce its <strong>first international outlet in Malaysia</strong>, opening <strong>1 January 2027</strong> — a landmark moment in our global expansion story."
    },
    {
      keys: ["contact", "phone", "whatsapp", "number", "reach", "call", "email"],
      ans: "You can reach our team directly:<br><br>📞 <strong>+91 96264 58516</strong><br>💬 WhatsApp the same number<br><br>Or use the <strong>Contact Form</strong> below on this page — our team typically responds within a few hours."
    },
    {
      keys: ["appointment", "book", "slot", "visit", "schedule", "timing", "time", "hour"],
      ans: "I'd love to help you book a session! Our salons are typically open <strong>9 AM – 9 PM</strong> daily.<br><br>Please share your <strong>name</strong> and <strong>city</strong>, and I'll guide you to your nearest Luxe outlet or connect you with the team for a confirmed booking."
    },
    {
      keys: ["haircut", "hair", "beard", "shave", "facial", "skin", "scalp", "colour", "color", "detan", "groom"],
      ans: SERVICES_INFO
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // CONVERSATION STATE MACHINE
  // ─────────────────────────────────────────────────────────────────────────
  // States: idle | franchise_name | franchise_city | franchise_budget | franchise_phone
  //         | appointment_name | appointment_city | done
  const state = {
    mode: "idle",       // current conversation flow
    data: {}            // collected lead / appointment data
  };

  // Intent detection
  function detectIntent(text) {
    const t = text.toLowerCase();
    if (/franchise|invest|partner|business|opportunit|turn.?key|outlet|open.+salon|own.+salon/.test(t)) return "franchise";
    if (/book|appointment|visit|slot|grooming|haircut|beard|shave|facial|service|near/.test(t)) return "appointment";
    return null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DOM HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  let greetingShown = false;

  function scrollBottom() {
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function createBubble(html, role) {
    const wrap = document.createElement("div");
    wrap.className = "luxe-msg " + role;

    if (role === "ai") {
      const av = document.createElement("div");
      av.className = "luxe-msg-avatar";
      av.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#D4AF37" stroke-width="2" stroke-linejoin="round" fill="rgba(212,175,55,0.15)"/></svg>`;
      wrap.appendChild(av);
    }

    const bub = document.createElement("div");
    bub.className = "luxe-msg-bubble";
    bub.innerHTML = html;
    wrap.appendChild(bub);
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement("div");
    wrap.className = "luxe-msg ai";
    wrap.id = "luxe-typing";

    const av = document.createElement("div");
    av.className = "luxe-msg-avatar";
    av.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#D4AF37" stroke-width="2" stroke-linejoin="round" fill="rgba(212,175,55,0.15)"/></svg>`;

    const bub = document.createElement("div");
    bub.className = "luxe-msg-bubble";
    bub.innerHTML = `<div class="luxe-typing-dots"><span></span><span></span><span></span></div>`;

    wrap.appendChild(av);
    wrap.appendChild(bub);
    msgBox.appendChild(wrap);
    scrollBottom();
    return wrap;
  }

  function postAI(html, delay) {
    delay = (delay === undefined) ? 900 : delay;
    const typing = showTyping();
    return new Promise(function(resolve) {
      setTimeout(function() {
        typing.remove();
        msgBox.appendChild(createBubble(html, "ai"));
        scrollBottom();
        resolve();
      }, delay);
    });
  }

  function postUser(text) {
    msgBox.appendChild(createBubble(text, "user"));
    scrollBottom();
  }

  function setInputHint(hint) {
    input.placeholder = hint || "Type your message…";
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONVERSATION ROUTER
  // ─────────────────────────────────────────────────────────────────────────
  async function handleSend(raw) {
    var trimmed = raw.trim();
    if (!trimmed) return;
    input.value = "";
    qrWrap.style.display = "none";
    postUser(trimmed);

    // ── Franchise lead collection flow ────────────────────────────────────
    if (state.mode === "franchise_name") {
      state.data.name = trimmed;
      state.mode = "franchise_city";
      setInputHint("Your city or district…");
      await postAI(
        "A pleasure to meet you, <strong>" + trimmed + "</strong>! ✦<br><br>" +
        "Which <strong>city or district</strong> are you based in, or where are you looking to open your Luxe outlet?"
      );
      return;
    }

    if (state.mode === "franchise_city") {
      state.data.city = trimmed;
      state.mode = "franchise_budget";
      setInputHint("e.g. ₹5–10 Lakhs, ₹15 Lakhs…");
      await postAI(
        "Excellent — <strong>" + trimmed + "</strong> is a promising market for Luxe Men Salon!<br><br>" +
        "To recommend the most suitable investment model, could you please share your <strong>approximate investment budget</strong>?"
      );
      return;
    }

    if (state.mode === "franchise_budget") {
      state.data.budget = trimmed;
      state.mode = "franchise_phone";
      setInputHint("10-digit mobile number…");
      await postAI(
        "Perfect. Finally, could you share your <strong>contact number</strong> so our senior Business Development Manager can reach you directly with a personalised proposal?"
      );
      return;
    }

    if (state.mode === "franchise_phone") {
      state.data.phone = trimmed;
      state.mode = "done";
      setInputHint("Ask me anything else…");
      var summary =
        "<strong>✦ Your Details Received</strong><br><br>" +
        "📋 <strong>Name:</strong> " + state.data.name + "<br>" +
        "📍 <strong>City:</strong> " + state.data.city + "<br>" +
        "💰 <strong>Budget:</strong> " + state.data.budget + "<br>" +
        "📞 <strong>Contact:</strong> " + trimmed + "<br><br>" +
        "Thank you, <strong>" + state.data.name + "</strong>! Our <strong>Business Development Team</strong> will contact you shortly at <strong>" + trimmed + "</strong> to walk you through our franchise models and next steps.<br><br>" +
        "In the meantime, you are welcome to explore our website or WhatsApp us at <strong>+91 96264 58516</strong>. We look forward to welcoming you to the <em>Luxe family</em>! ✦";
      await postAI(summary, 1100);
      return;
    }

    // ── Appointment / grooming flow ────────────────────────────────────────
    if (state.mode === "appointment_name") {
      state.data.name = trimmed;
      state.mode = "appointment_city";
      setInputHint("Your city or area…");
      await postAI(
        "Wonderful, <strong>" + trimmed + "</strong>! Which <strong>city or area</strong> are you located in? I'll connect you with your nearest Luxe outlet."
      );
      return;
    }

    if (state.mode === "appointment_city") {
      state.data.city = trimmed;
      state.mode = "done";
      setInputHint("Ask me anything else…");
      await postAI(
        "Thank you, <strong>" + state.data.name + "</strong>! ✦<br><br>" +
        "We have Luxe Men Salon outlets serving <strong>" + trimmed + "</strong> and surrounding areas.<br><br>" +
        "To confirm your appointment time and stylist preference, please WhatsApp us directly at:<br>" +
        "💬 <strong>+91 96264 58516</strong><br><br>" +
        "Simply mention your name and preferred date — our team will secure your slot immediately. We look forward to serving you!",
        1000
      );
      return;
    }

    // ── Intent routing from idle ───────────────────────────────────────────
    var intent = detectIntent(trimmed);

    if (intent === "franchise") {
      state.mode = "franchise_name";
      state.data = {};
      setInputHint("Your full name…");
      await postAI(FRANCHISE_INTRO, 1000);
      return;
    }

    if (intent === "appointment") {
      state.mode = "appointment_name";
      state.data = {};
      setInputHint("Your full name…");
      await postAI(APPOINTMENT_INTRO, 800);
      return;
    }

    // ── Knowledge Base lookup ─────────────────────────────────────────────
    var lower = trimmed.toLowerCase();
    for (var i = 0; i < KB.length; i++) {
      if (KB[i].keys.some(function(k) { return lower.includes(k); })) {
        await postAI(KB[i].ans);
        return;
      }
    }

    // ── Fallback ─────────────────────────────────────────────────────────
    await postAI(FALLBACK, 700);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // OPEN / CLOSE
  // ─────────────────────────────────────────────────────────────────────────
  function openChat() {
    chat.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");

    if (!greetingShown) {
      greetingShown = true;
      postAI(GREETING, 700);
    }

    setTimeout(function() { input.focus(); }, 420);
  }

  function closeChat() {
    chat.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────
  toggle.addEventListener("click", function() {
    chat.classList.contains("open") ? closeChat() : openChat();
  });

  closeBtn.addEventListener("click", closeChat);

  sendBtn.addEventListener("click", function() { handleSend(input.value); });

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input.value);
    }
  });

  qrWrap.addEventListener("click", function(e) {
    var btn = e.target.closest(".luxe-qr-btn");
    if (btn) handleSend(btn.dataset.msg || btn.textContent);
  });

  document.addEventListener("click", function(e) {
    if (chat.classList.contains("open") && !chat.contains(e.target)) {
      closeChat();
    }
  });

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && chat.classList.contains("open")) closeChat();
  });

})();
