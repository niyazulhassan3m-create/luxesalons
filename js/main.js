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
   Ceremonial Grand Opening Red Ribbon Cutting & Door Reveal Engine
   ========================================================================== */
(function ceremonialRibbonEntrance() {
  const portal = document.getElementById("mallPortal");
  if (!portal) return;

  const ribbonWrap = document.getElementById("ceremonialRibbonWrap");
  const bowCenter = document.getElementById("ribbonBowCenter");
  const cutBtn = document.getElementById("portalCutBtn") || document.getElementById("portalSkipBtn");
  const statusText = document.getElementById("portalStatusText");
  const confettiCanvas = document.getElementById("ribbonConfettiCanvas");
  const replayBtn = document.getElementById("replayEntranceBtn");

  let isCut = false;
  let isOpening = false;
  let animFrameId = null;

  // Synthesize realistic scissor snip & shearing silk cloth audio
  function playClothCutAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // 1. High-frequency metallic scissor blades sliding & snap
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(3200, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // 2. Realistic Silk Fabric Shearing / Tearing Sound (Filtered noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter centered at fabric shearing frequency
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.linearRampToValueAtTime(800, now + 0.18);
      filter.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.38, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.002, now + 0.22);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.23);
    } catch (e) {
      // Audio autoplay policy or browser restriction
    }
  }

  // Realistic Confetti & Silk Thread Fiber Explosion Engine
  function launchConfettiBurst() {
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext("2d");
    if (!ctx) return;

    const rect = confettiCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    confettiCanvas.width = rect.width * dpr;
    confettiCanvas.height = rect.height * dpr;

    const originX = (confettiCanvas.width / 2);
    const originY = (confettiCanvas.height / 2);

    const colors = [
      "#D4AF37", "#FFDF73", "#FFF3BD", "#E9CE8A", // Luxury Golds
      "#F52C46", "#C90E25", "#8E0013", "#5C000B", // Royal Crimson Silks
      "#FFFFFF", "#FFF9E6"                         // Sparkle White
    ];

    const particles = [];
    const count = 160;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.9;
      const speed = Math.random() * 10 + 4;
      const randType = Math.random();

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 14,
        alpha: 1,
        decay: Math.random() * 0.014 + 0.009,
        gravity: 0.24,
        isRibbonStrip: randType < 0.45,
        isSilkFiber: randType >= 0.45 && randType < 0.75
      });
    }

    if (animFrameId) cancelAnimationFrame(animFrameId);

    function renderConfetti() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0.01) continue;
        activeCount++;

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.982;
        p.rotation += p.rotSpeed;
        p.alpha -= p.decay;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        if (p.isRibbonStrip) {
          // Satin cloth ribbon curl strip
          ctx.fillRect(-p.size * 0.8, -p.size * 0.28, p.size * 1.8, p.size * 0.56);
        } else if (p.isSilkFiber) {
          // Severed silk thread fiber strand
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-p.size, 0);
          ctx.quadraticCurveTo(0, p.size * 0.4, p.size, 0);
          ctx.stroke();
        } else {
          // Gold sparkle diamond / sequin star
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.48, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (activeCount > 0) {
        animFrameId = requestAnimationFrame(renderConfetti);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    renderConfetti();
  }

  const openDoors = () => {
    if (isOpening) return;
    isOpening = true;
    portal.classList.add("opening");

    // After sliding doors finish parting, unlock page scroll and reveal sanctuary
    setTimeout(() => {
      portal.classList.add("doors-opened");
      document.body.classList.remove("portal-locked");
      isOpening = false;
    }, 1600);
  };

  // Perform Ribbon Cut Animation & Trigger Door Opening
  const performRibbonCut = () => {
    if (isCut) return;
    isCut = true;

    // Tactile scissor snip feedback & realistic shearing audio
    document.body.classList.add("scissor-cutting");
    playClothCutAudio();
    setTimeout(() => document.body.classList.remove("scissor-cutting"), 350);

    // Visual cut state on ribbon
    if (ribbonWrap) {
      ribbonWrap.classList.add("ribbon-cut");
    }

    // Update status text
    if (statusText) {
      statusText.innerHTML = '<span class="portal-status-dot"></span>✂ Ribbon Inaugurated! Opening the Sanctuary Doors...';
    }

    if (cutBtn) {
      cutBtn.style.opacity = "0";
      cutBtn.style.pointerEvents = "none";
    }

    // Launch celebratory confetti & severed silk fibers
    launchConfettiBurst();

    // After dramatic cut pause (450ms), automatically slide open the Luxe Salon doors
    setTimeout(() => {
      openDoors();
    }, 450);
  };

  // Lock scrolling during entrance intro
  document.body.classList.add("portal-locked");

  // Clicking on center bow or ribbon cuts the ribbon
  if (bowCenter) {
    bowCenter.addEventListener("click", (e) => {
      e.stopPropagation();
      performRibbonCut();
    });
  }

  if (ribbonWrap) {
    ribbonWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      performRibbonCut();
    });

    ribbonWrap.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        performRibbonCut();
      }
    });
  }

  // Action button also cuts ribbon
  if (cutBtn) {
    cutBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      performRibbonCut();
    });
  }

  // Replay entrance handler (resets ribbon, doors, and status)
  if (replayBtn) {
    replayBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (confettiCanvas) {
        const ctx = confettiCanvas.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }

      isCut = false;
      isOpening = false;

      if (ribbonWrap) {
        ribbonWrap.classList.remove("ribbon-cut");
      }

      if (cutBtn) {
        cutBtn.style.opacity = "1";
        cutBtn.style.pointerEvents = "auto";
      }

      if (statusText) {
        statusText.innerHTML = '<span class="portal-status-dot"></span>Click the Red Ribbon with your Scissors to Inaugurate&hellip;';
      }

      portal.classList.remove("doors-opened", "opening");
      document.body.classList.add("portal-locked");
      window.scrollTo({ top: 0, behavior: "instant" });
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