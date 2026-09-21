(() => {
  "use strict";

  const SHEETS = [
    { width: 20, height: 28, price: 50, label: "20 × 28" },
    { width: 28, height: 40, price: 70, label: "28 × 40" },
    { width: 28, height: 100, price: 136, label: "28 × 100" },
    { width: 57, height: 100, price: 248, label: "57 × 100" }
  ];

  const CAROUSEL = [
    { src: "assets/dtf_textil.svg", alt: "Banner DTF Têxtil", title: "DTF Têxtil" },
    { src: "assets/dtf_rigido.svg", alt: "Banner DTF Rígido", title: "DTF Rígido" }
  ];

  const state = { type: "Têxtil", sheetIndex: 0, bleed: 0.03, discount: 0 };
  const $ = (id) => document.getElementById(id);

  const els = {
    splash: $("splash"), themeBtn: $("themeBtn"), typeButtons: $("typeButtons"),
    sheetButtons: $("sheetButtons"), bleedButtons: $("bleedButtons"),
    discountButtons: $("discountButtons"), artWidth: $("artWidth"),
    artHeight: $("artHeight"), targetQuantity: $("targetQuantity"),
    calculateBtn: $("calculateBtn"), validationMessage: $("validationMessage"),
    resultContext: $("resultContext"), fitCount: $("fitCount"),
    layoutDescription: $("layoutDescription"), sheetPrice: $("sheetPrice"),
    discountDescription: $("discountDescription"), unitPrice: $("unitPrice"),
    usagePercent: $("usagePercent"), footprint: $("footprint"), preview: $("preview"),
    orderSummary: $("orderSummary"), orderSheets: $("orderSheets"),
    orderTotal: $("orderTotal"), orderCapacity: $("orderCapacity"),
    orderLeftover: $("orderLeftover"), comparisonBody: $("comparisonBody"),
    carousel: $("carousel"), carouselImage: $("carouselImage"),
    carouselCaption: $("carouselCaption"), carouselPrev: $("carouselPrev"),
    carouselNext: $("carouselNext")
  };

  function parseNumber(value) {
    const parsed = Number.parseFloat(String(value).trim().replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function money(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
      .format(Number.isFinite(value) ? value : 0);
  }

  function activateButton(container, button) {
    for (const item of container.querySelectorAll("button")) {
      item.classList.toggle("is-active", item === button);
    }
  }

  function planByBands(sheetWidth, sheetHeight, artWidth, artHeight, horizontalBands) {
    let best = { count: 0, placements: [], description: "" };

    if (horizontalBands) {
      const maxNormalBands = Math.floor(sheetHeight / artHeight);
      for (let normalBands = 0; normalBands <= maxNormalBands; normalBands += 1) {
        const placements = [];
        const normalColumns = Math.floor(sheetWidth / artWidth);

        for (let row = 0; row < normalBands; row += 1) {
          for (let col = 0; col < normalColumns; col += 1) {
            placements.push({
              x: col * artWidth, y: row * artHeight,
              width: artWidth, height: artHeight, rotated: false
            });
          }
        }

        const usedHeight = normalBands * artHeight;
        const rotatedRows = Math.floor((sheetHeight - usedHeight) / artWidth);
        const rotatedColumns = Math.floor(sheetWidth / artHeight);

        for (let row = 0; row < rotatedRows; row += 1) {
          for (let col = 0; col < rotatedColumns; col += 1) {
            placements.push({
              x: col * artHeight, y: usedHeight + row * artWidth,
              width: artHeight, height: artWidth, rotated: true
            });
          }
        }

        if (placements.length > best.count) {
          const mixed = normalBands > 0 && rotatedRows > 0;
          best = {
            count: placements.length, placements,
            description: mixed ? "encaixe misto com rotação"
              : rotatedRows > 0 ? "arte girada 90°" : "arte sem rotação"
          };
        }
      }
    } else {
      const maxNormalBands = Math.floor(sheetWidth / artWidth);
      for (let normalBands = 0; normalBands <= maxNormalBands; normalBands += 1) {
        const placements = [];
        const normalRows = Math.floor(sheetHeight / artHeight);

        for (let col = 0; col < normalBands; col += 1) {
          for (let row = 0; row < normalRows; row += 1) {
            placements.push({
              x: col * artWidth, y: row * artHeight,
              width: artWidth, height: artHeight, rotated: false
            });
          }
        }

        const usedWidth = normalBands * artWidth;
        const rotatedColumns = Math.floor((sheetWidth - usedWidth) / artHeight);
        const rotatedRows = Math.floor(sheetHeight / artWidth);

        for (let col = 0; col < rotatedColumns; col += 1) {
          for (let row = 0; row < rotatedRows; row += 1) {
            placements.push({
              x: usedWidth + col * artHeight, y: row * artWidth,
              width: artHeight, height: artWidth, rotated: true
            });
          }
        }

        if (placements.length > best.count) {
          const mixed = normalBands > 0 && rotatedColumns > 0;
          best = {
            count: placements.length, placements,
            description: mixed ? "encaixe misto com rotação"
              : rotatedColumns > 0 ? "arte girada 90°" : "arte sem rotação"
          };
        }
      }
    }
    return best;
  }

  function calculatePacking(sheet, width, height, bleed) {
    const effectiveWidth = width + bleed * 2;
    const effectiveHeight = height + bleed * 2;
    const horizontal = planByBands(sheet.width, sheet.height, effectiveWidth, effectiveHeight, true);
    const vertical = planByBands(sheet.width, sheet.height, effectiveWidth, effectiveHeight, false);
    const best = vertical.count > horizontal.count ? vertical : horizontal;
    const sheetArea = sheet.width * sheet.height;
    const occupiedArea = best.count * effectiveWidth * effectiveHeight;

    return {
      ...best, effectiveWidth, effectiveHeight,
      usage: sheetArea > 0 ? Math.min(100, (occupiedArea / sheetArea) * 100) : 0
    };
  }

  function drawPreview(plan, sheet) {
    const width = 300, height = 300, padding = 14;
    const scale = Math.min(
      (width - padding * 2) / sheet.width,
      (height - padding * 2) / sheet.height
    );

    const sheetDrawWidth = sheet.width * scale;
    const sheetDrawHeight = sheet.height * scale;
    const offsetX = (width - sheetDrawWidth) / 2;
    const offsetY = (height - sheetDrawHeight) / 2;
    const svg = [];

    svg.push(
      `<rect x="${offsetX}" y="${offsetY}" width="${sheetDrawWidth}" height="${sheetDrawHeight}" rx="4" fill="var(--card)" stroke="var(--muted)" stroke-width="1.5"/>`
    );

    plan.placements.slice(0, 250).forEach((item, index) => {
      const x = offsetX + item.x * scale;
      const y = offsetY + item.y * scale;
      const w = item.width * scale;
      const h = item.height * scale;

      svg.push(
        `<rect x="${x + 0.6}" y="${y + 0.6}" width="${Math.max(1, w - 1.2)}" height="${Math.max(1, h - 1.2)}" rx="1.8" fill="rgba(239,125,60,.18)" stroke="var(--accent)" stroke-width=".75"/>`
      );

      if (plan.count <= 60) {
        const fontSize = Math.max(4, Math.min(9, Math.min(w, h) * 0.34));
        svg.push(
          `<text x="${x + w / 2}" y="${y + h / 2 + 2}" text-anchor="middle" font-size="${fontSize}" fill="var(--text)" font-weight="800">${index + 1}</text>`
        );
      }
    });

    els.preview.innerHTML = svg.join("");
  }

  function render() {
    const width = parseNumber(els.artWidth.value);
    const height = parseNumber(els.artHeight.value);
    const target = Math.max(0, Math.floor(parseNumber(els.targetQuantity.value)));

    if (width <= 0 || height <= 0) {
      els.validationMessage.textContent = "Informe largura e altura maiores que zero.";
      return;
    }

    els.validationMessage.textContent = "";
    const sheet = SHEETS[state.sheetIndex];
    const plan = calculatePacking(sheet, width, height, state.bleed);
    const discountedSheetPrice = sheet.price * (1 - state.discount / 100);

    els.resultContext.textContent = `DTF ${state.type} • ${sheet.label}`;
    els.fitCount.textContent = String(plan.count);
    els.layoutDescription.textContent = plan.count
      ? `${plan.description} • rotação automática ativa`
      : "A arte não cabe nesta folha";

    els.sheetPrice.textContent = money(discountedSheetPrice);
    els.discountDescription.textContent = state.discount
      ? `${state.discount}% de desconto • original ${money(sheet.price)}`
      : "sem desconto";
    els.unitPrice.textContent = plan.count ? money(discountedSheetPrice / plan.count) : money(0);
    els.usagePercent.textContent = `${plan.usage.toFixed(1).replace(".", ",")}%`;
    els.footprint.textContent =
      `${plan.effectiveWidth.toFixed(2).replace(".", ",")} × ${plan.effectiveHeight.toFixed(2).replace(".", ",")}`;

    drawPreview(plan, sheet);

    if (target > 0 && plan.count > 0) {
      const requiredSheets = Math.ceil(target / plan.count);
      const capacity = requiredSheets * plan.count;
      els.orderSheets.textContent = String(requiredSheets);
      els.orderTotal.textContent = money(requiredSheets * discountedSheetPrice);
      els.orderCapacity.textContent = `${capacity} artes`;
      els.orderLeftover.textContent = `${capacity - target} artes`;
      els.orderSummary.hidden = false;
    } else {
      els.orderSummary.hidden = true;
    }

    const rows = SHEETS.map((candidate) => {
      const candidatePlan = calculatePacking(candidate, width, height, state.bleed);
      const candidatePrice = candidate.price * (1 - state.discount / 100);
      const costPerArt = candidatePlan.count
        ? candidatePrice / candidatePlan.count
        : Number.POSITIVE_INFINITY;
      return { sheet: candidate, plan: candidatePlan, price: candidatePrice, costPerArt };
    });

    const finiteCosts = rows.map((row) => row.costPerArt).filter(Number.isFinite);
    const bestCost = finiteCosts.length ? Math.min(...finiteCosts) : Number.POSITIVE_INFINITY;

    els.comparisonBody.innerHTML = rows.map((row) => {
      const isBest = Number.isFinite(row.costPerArt)
        && Math.abs(row.costPerArt - bestCost) < 0.00001;

      return `
        <tr class="${isBest ? "is-best" : ""}">
          <td>
            ${row.sheet.label} cm
            ${isBest ? '<span class="best-badge">MENOR CUSTO/ARTE</span>' : ""}
          </td>
          <td>${row.plan.count}</td>
          <td>${money(row.price)}</td>
          <td>${row.plan.count ? money(row.costPerArt) : "—"}</td>
          <td>${row.plan.usage.toFixed(1).replace(".", ",")}%</td>
        </tr>
      `;
    }).join("");
  }

  function setupChoiceGroup(container, dataAttribute, stateKey, parser = (value) => value) {
    container.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !container.contains(button)) return;
      state[stateKey] = parser(button.dataset[dataAttribute]);
      activateButton(container, button);
      render();
    });
  }

  setupChoiceGroup(els.typeButtons, "type", "type");
  setupChoiceGroup(els.sheetButtons, "sheet", "sheetIndex", Number);
  setupChoiceGroup(els.bleedButtons, "bleed", "bleed", Number);
  setupChoiceGroup(els.discountButtons, "discount", "discount", Number);
  els.calculateBtn.addEventListener("click", render);

  for (const input of [els.artWidth, els.artHeight, els.targetQuantity]) {
    input.addEventListener("input", render);
  }

  els.themeBtn.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");
    els.themeBtn.textContent = dark ? "☀" : "☾";
    els.themeBtn.setAttribute("aria-pressed", String(dark));
  });

  let carouselIndex = 0;
  let carouselTimer = null;

  function showSlide(index) {
    carouselIndex = (index + CAROUSEL.length) % CAROUSEL.length;
    const slide = CAROUSEL[carouselIndex];
    els.carouselImage.src = slide.src;
    els.carouselImage.alt = slide.alt;
    els.carouselCaption.textContent = slide.title;
    document.querySelectorAll(".carousel__dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === carouselIndex);
    });
  }

  function restartCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(() => showSlide(carouselIndex + 1), 5000);
  }

  els.carouselPrev.addEventListener("click", () => {
    showSlide(carouselIndex - 1);
    restartCarousel();
  });

  els.carouselNext.addEventListener("click", () => {
    showSlide(carouselIndex + 1);
    restartCarousel();
  });

  document.querySelectorAll(".carousel__dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      showSlide(Number(dot.dataset.slide));
      restartCarousel();
    });
  });

  let swipeStartX = 0;
  els.carousel.addEventListener("touchstart", (event) => {
    swipeStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  els.carousel.addEventListener("touchend", (event) => {
    const delta = event.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(delta) < 40) return;
    showSlide(carouselIndex + (delta < 0 ? 1 : -1));
    restartCarousel();
  }, { passive: true });

  for (const slide of CAROUSEL) {
    const image = new Image();
    image.src = slide.src;
  }

  function hideSplash() {
    els.splash.classList.add("is-hidden");
  }

  window.addEventListener("load", () => {
    window.setTimeout(hideSplash, 350);
  }, { once: true });

  window.setTimeout(hideSplash, 1400);
  showSlide(0);
  restartCarousel();
  render();
})();