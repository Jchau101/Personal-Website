/* ============================================================
   Jonathan Chau, personal site
   Three things only: nav behaviour, the budget model, the load animation.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1. NAV: scroll border and active link
     ========================================================== */
  var nav = document.getElementById("nav");

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-links a")
  );
  var targets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && targets.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (a) {
            a.classList.toggle(
              "is-active",
              a.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-64px 0px -70% 0px" }
    );
    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ==========================================================
     2. THE MODEL
     ========================================================== */
  var TAX_RATE = 0.1475;      // 8.875% sales + 5.875% NYC hotel occupancy
  var STAT_FEE = 3.50;        // per room-night
  var FLYER_RT = 27.00;       // Michigan Flyer round trip, advance online
  var SUBWAY_FARE = 3.00;     // MTA base, effective 4 Jan 2026
  var SUBWAY_RIDES = 6;       // 4 routed, 2 allowance
  var SHUTTLE_FARE = 18.00;   // Uber Shuttle per seat per leg
  var Q70_FARE = 3.00;        // Q70 is free, subway connection only
  var INFLOWS_PRE_DEC = 5000; // Jul 1000 + Aug 1000 + Sep 1500 + Oct 1500
  var DEC_RECEIPT = 2000;
  var COMMITTED = INFLOWS_PRE_DEC + DEC_RECEIPT;

  var DEFAULTS = {
    students: 24, rooms: 6, nights: 2, rate: 141,
    subsidy: 100, contingency: 10, accelerate: 0, q70: 0
  };

  function compute(s) {
    var roomNights = s.rooms * s.nights;
    var hotelBase = roomNights * s.rate;
    var hotelTax = hotelBase * TAX_RATE;
    var hotelFees = roomNights * STAT_FEE;
    var hotel = hotelBase + hotelTax + hotelFees;

    var subway = s.students * SUBWAY_RIDES * SUBWAY_FARE;
    var flyer = s.students * FLYER_RT;
    var outboundShuttle = s.students * SHUTTLE_FARE;
    var returnShuttle = s.students * (s.q70 ? Q70_FARE : SHUTTLE_FARE);
    var airfareSubsidy = s.students * s.subsidy;

    var programming = hotel + subway + flyer + outboundShuttle +
                      returnShuttle + airfareSubsidy;
    var contingencyAmt = (s.contingency / 100) * (programming - airfareSubsidy);
    var total = programming + contingencyAmt;
    var perStudent = total / s.students;

    var julSep = hotelBase;          // two equal deposits, Jul and Sep
    var oct = airfareSubsidy;
    var nov = hotelTax + hotelFees + subway + flyer +
              outboundShuttle + returnShuttle + contingencyAmt;
    var inflowsThroughNov = INFLOWS_PRE_DEC + (s.accelerate ? DEC_RECEIPT : 0);
    var novPosition = inflowsThroughNov - (julSep + oct + nov);

    return { total: total, perStudent: perStudent, novPosition: novPosition };
  }

  var usd = new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2
  });
  function money(n) {
    // true minus sign, no parentheses
    return usd.format(n).replace(/^-/, "−");
  }
  function moneyInt(n) {
    return "$" + n.toLocaleString("en-US");
  }

  var model = document.getElementById("budget");
  if (model) {
    var sliders = {};
    ["students", "rooms", "nights", "rate", "subsidy", "contingency"]
      .forEach(function (k) { sliders[k] = document.getElementById(k); });

    var toggles = {
      accelerate: document.getElementById("accelerate"),
      q70: document.getElementById("q70")
    };

    var elPosition = document.getElementById("out-position");
    var elNote = document.getElementById("out-note");
    var elTotal = document.getElementById("out-total");
    var elPer = document.getElementById("out-per");
    var elInflows = document.getElementById("out-inflows");
    var elSR = document.getElementById("out-sr");

    function labelFor(key, v) {
      if (key === "rate" || key === "subsidy") return moneyInt(v);
      if (key === "contingency") return v + "%";
      return String(v);
    }

    function readState() {
      var s = {};
      Object.keys(sliders).forEach(function (k) {
        s[k] = parseFloat(sliders[k].value);
      });
      Object.keys(toggles).forEach(function (k) {
        var on = toggles[k].querySelector('[aria-checked="true"]');
        s[k] = on ? parseInt(on.getAttribute("data-val"), 10) : 0;
      });
      return s;
    }

    function paintSlider(k) {
      var el = sliders[k];
      var min = parseFloat(el.min), max = parseFloat(el.max);
      var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
      el.style.setProperty("--fill", pct + "%");
      var text = labelFor(k, parseFloat(el.value));
      el.setAttribute("aria-valuetext", text);
      var out = document.getElementById(k + "-val");
      if (out) out.textContent = text;
    }

    /* value tween on the headline figure only.
       `displayed` tracks what is actually painted, so a tween interrupted
       mid-flight restarts from the value on screen rather than from a stale
       origin. The colour is driven by the true target, not the tweened value,
       so the figure never reads green on its way to a negative number. */
    var displayed = null, animId = null, settleTimer = null;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function paintPosition(value, isNegative) {
      elPosition.textContent = money(value);
      elPosition.classList.toggle("is-positive", !isNegative);
    }

    function settle(target, negative) {
      if (animId) { cancelAnimationFrame(animId); animId = null; }
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
      displayed = target;
      paintPosition(target, negative);
    }

    function setPosition(target) {
      var negative = target < 0;

      if (animId) { cancelAnimationFrame(animId); animId = null; }
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }

      // No tween when motion is reduced, on first paint, or while the page is
      // hidden (rAF does not run there, so a tween would strand a stale figure).
      if (reduceMotion || displayed === null || document.hidden) {
        settle(target, negative);
        return;
      }

      var from = displayed;
      if (from === target) { paintPosition(target, negative); return; }
      var start = performance.now();

      // The animation is decoration; this guarantees the true number lands even
      // if rAF is throttled or never fires.
      settleTimer = setTimeout(function () { settle(target, negative); }, 300);

      animId = requestAnimationFrame(function step(now) {
        var t = Math.min((now - start) / 240, 1);
        if (t < 1) {
          displayed = from + (target - from) * easeOut(t);
          paintPosition(displayed, negative);
          animId = requestAnimationFrame(step);
        } else {
          settle(target, negative);
        }
      });
    }

    var srTimer = null;

    function render() {
      var s = readState();
      var r = compute(s);

      setPosition(r.novPosition);

      elNote.textContent = r.novPosition < 0
        ? "Short before the trek. The year is funded; the timing is not."
        : "Covered. The December receipt lands before we travel.";

      elTotal.textContent = money(r.total);
      elPer.textContent = money(r.perStudent);
      elInflows.textContent = money(COMMITTED);

      if (elSR) {
        clearTimeout(srTimer);
        srTimer = setTimeout(function () {
          elSR.textContent =
            "Cash position in November, " + money(r.novPosition).replace("−", "negative ") +
            ". Total MHBC-funded cost " + money(r.total) +
            ". Cost per student " + money(r.perStudent) + ".";
        }, 400);
      }
    }

    Object.keys(sliders).forEach(function (k) {
      paintSlider(k);
      sliders[k].addEventListener("input", function () {
        paintSlider(k);
        render();
      });
    });

    /* toggles: radiogroup semantics with arrow-key navigation */
    Object.keys(toggles).forEach(function (k) {
      var group = toggles[k];
      var radios = Array.prototype.slice.call(
        group.querySelectorAll('[role="radio"]')
      );

      function select(i) {
        radios.forEach(function (r, j) {
          var on = i === j;
          r.setAttribute("aria-checked", on ? "true" : "false");
          r.tabIndex = on ? 0 : -1;
        });
        radios[i].focus();
        render();
      }

      radios.forEach(function (r, i) {
        r.addEventListener("click", function () {
          radios.forEach(function (x, j) {
            x.setAttribute("aria-checked", i === j ? "true" : "false");
            x.tabIndex = i === j ? 0 : -1;
          });
          render();
        });
        r.addEventListener("keydown", function (e) {
          var next = null;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % radios.length;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + radios.length) % radios.length;
          if (next === null) return;
          e.preventDefault();
          select(next);
        });
      });
    });

    document.getElementById("reset").addEventListener("click", function () {
      Object.keys(sliders).forEach(function (k) {
        sliders[k].value = DEFAULTS[k];
        paintSlider(k);
      });
      Object.keys(toggles).forEach(function (k) {
        var radios = toggles[k].querySelectorAll('[role="radio"]');
        Array.prototype.forEach.call(radios, function (r) {
          var on = parseInt(r.getAttribute("data-val"), 10) === DEFAULTS[k];
          r.setAttribute("aria-checked", on ? "true" : "false");
          r.tabIndex = on ? 0 : -1;
        });
      });
      render();
    });

    render();

    /* acceptance tests from PRD 7.5, logged once */
    (function selfTest() {
      var cases = [
        ["All defaults", {}, ["$6,720.33", "$280.01", "−$1,720.33"]],
        ["Receipt pulled into October", { accelerate: 1 }, ["$6,720.33", "$280.01", "$279.67"]],
        ["Q70 return", { q70: 1 }, ["$6,324.33", "$263.51", "−$1,324.33"]],
        ["Both", { accelerate: 1, q70: 1 }, ["$6,324.33", "$263.51", "$675.67"]]
      ];
      var pass = true;
      var rows = cases.map(function (c) {
        var s = Object.assign({}, DEFAULTS, c[1]);
        var r = compute(s);
        var got = [money(r.total), money(r.perStudent), money(r.novPosition)];
        var ok = got.every(function (v, i) { return v === c[2][i]; });
        if (!ok) pass = false;
        return {
          scenario: c[0], total: got[0], perStudent: got[1],
          november: got[2], pass: ok
        };
      });
      if (window.console && console.table) {
        console.log(pass
          ? "Budget model: all 4 acceptance scenarios pass."
          : "Budget model: ACCEPTANCE FAILURE.");
        console.table(rows);
      }
    })();
  }

  /* ==========================================================
     3. HERO LOAD ANIMATION
     ========================================================== */
  requestAnimationFrame(function () {
    document.body.classList.add("is-ready");
  });
})();
