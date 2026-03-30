(function () {
  "use strict";

  const PROJECT = document.body.getAttribute("data-project");
  if (PROJECT !== "at1l" && PROJECT !== "at2") {
    console.error("tco-calculator: set body data-project to at1l or at2");
    return;
  }

  const defaults = {
    at1l: {
      qty: 1000,
      years: 5,
      device: 958.0,
      mrq: 1000,
      sigfox: 481.24,
      sigfox_inc: 5.0,
      device_inc: 5.0,
      battery: 65.0,
      battery_inc: 6.0,
      enclosure: 45.0,
      enclosure_inc: 6.0,
      service_months: 18,
      enclosure_cycle: 1,
    },
    at2: {
      qty: 500,
      years: 5,
      device: 1893.19,
      mrq: 500,
      sigfox: 481.24,
      sigfox_inc: 5.0,
      device_inc: 5.0,
      battery: 65.0,
      battery_inc: 6.0,
      enclosure: 45.0,
      enclosure_inc: 6.0,
      service_months: 18,
      enclosure_cycle: 2,
    },
  };

  function r2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function money(n) {
    const val = Number(n) || 0;
    const s = val.toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return "R " + s.replace(/\u00a0|\u202f/g, " ");
  }

  function getVal(id) {
    return Number(document.getElementById(id).value || 0);
  }

  function setVal(id, value) {
    document.getElementById(id).value = value;
  }

  function annualFactor(percent) {
    return 1 + (Number(percent) || 0) / 100;
  }

  function futureCost(base, annualPercent, monthsFromStart) {
    return base * Math.pow(annualFactor(annualPercent), monthsFromStart / 12);
  }

  function escalatedPerCycle(base, annualPercent, cycleIndex) {
    const k = Math.max(1, Math.floor(Number(cycleIndex) || 1));
    return base * Math.pow(annualFactor(annualPercent), k);
  }

  function buildProjectKey(project) {
    return {
      qty: getVal(project + "_qty"),
      years: getVal(project + "_years"),
      device: getVal(project + "_device"),
      mrq: getVal(project + "_mrq"),
      sigfox: getVal(project + "_sigfox"),
      sigfox_inc: getVal(project + "_sigfox_inc"),
      device_inc: getVal(project + "_device_inc"),
      battery: getVal(project + "_battery"),
      battery_inc: getVal(project + "_battery_inc"),
      enclosure: getVal(project + "_enclosure"),
      enclosure_inc: getVal(project + "_enclosure_inc"),
      service_months: getVal(project + "_service_months"),
      enclosure_cycle: getVal(project + "_enclosure_cycle"),
    };
  }

  function validateInputs(cfg) {
    cfg.qty = Math.max(1, Math.floor(cfg.qty || 1));
    cfg.years = Math.max(1, Math.floor(cfg.years || 5));
    cfg.mrq = Math.max(1, Math.floor(cfg.mrq || 1));
    cfg.service_months = Math.max(1, Math.floor(cfg.service_months || 18));
    cfg.enclosure_cycle = Math.max(1, Math.floor(cfg.enclosure_cycle || 1));
    return cfg;
  }

  function buildServiceEvents(cfg) {
    const events = [];
    const maxMonths = cfg.years * 12;
    let cycle = 1;

    for (let month = cfg.service_months; month < maxMonths + 0.0001; month += cfg.service_months) {
      const batteryUnit = escalatedPerCycle(cfg.battery, cfg.battery_inc, cycle);
      const enclosureThisCycle = cycle % cfg.enclosure_cycle === 0;
      const enclosureUnit = enclosureThisCycle
        ? escalatedPerCycle(cfg.enclosure, cfg.enclosure_inc, cycle)
        : 0;

      const totalUnit = batteryUnit + enclosureUnit;
      const year = Math.ceil(month / 12);

      events.push({
        cycle,
        month,
        year,
        batteryUnit: r2(batteryUnit),
        enclosureUnit: r2(enclosureUnit),
        totalUnit: r2(totalUnit),
        batteryFleet: r2(batteryUnit * cfg.qty),
        enclosureFleet: r2(enclosureUnit * cfg.qty),
        totalFleet: r2(totalUnit * cfg.qty),
        enclosureThisCycle,
      });

      cycle++;
    }

    return events;
  }

  function buildYearRows(cfg, events) {
    const rows = [];
    let cumulative = 0;

    for (let y = 1; y <= cfg.years; y++) {
      const deviceUnit = y === 1 ? cfg.device : 0;
      const deviceFleet = r2(deviceUnit * cfg.qty);

      const sigfoxUnit = futureCost(cfg.sigfox, cfg.sigfox_inc, (y - 1) * 12);
      const sigfoxFleet = r2(sigfoxUnit * cfg.qty);

      const serviceForYear = events.filter((e) => e.year === y).reduce((sum, e) => sum + e.totalFleet, 0);

      const serviceUnitForYear = events.filter((e) => e.year === y).reduce((sum, e) => sum + e.totalUnit, 0);

      const totalFleet = r2(deviceFleet + sigfoxFleet + serviceForYear);
      const totalUnit = r2(deviceUnit + sigfoxUnit + serviceUnitForYear);

      cumulative = r2(cumulative + totalFleet);

      rows.push({
        year: y,
        deviceUnit: r2(deviceUnit),
        deviceFleet,
        sigfoxUnit: r2(sigfoxUnit),
        sigfoxFleet,
        serviceUnit: r2(serviceUnitForYear),
        serviceFleet: r2(serviceForYear),
        totalUnit,
        totalFleet,
        cumulativeFleet: cumulative,
      });
    }

    return rows;
  }

  function buildRepeatOrderRows(cfg) {
    const rows = [];
    for (let y = 1; y <= cfg.years; y++) {
      const unit = futureCost(cfg.device, cfg.device_inc, (y - 1) * 12);
      rows.push({
        year: y,
        unit: r2(unit),
        fleet: r2(unit * cfg.qty),
      });
    }
    return rows;
  }

  function summariseProject(cfg, events, yearRows) {
    const deviceTotalFleet = r2(cfg.device * cfg.qty);
    const sigfoxTotalFleet = r2(yearRows.reduce((s, r) => s + r.sigfoxFleet, 0));
    const serviceTotalFleet = r2(events.reduce((s, e) => s + e.totalFleet, 0));
    const tcoFleet = r2(deviceTotalFleet + sigfoxTotalFleet + serviceTotalFleet);
    const tcoUnit = r2(tcoFleet / cfg.qty);
    const sigfoxSharePct = tcoFleet > 0 ? r2((sigfoxTotalFleet / tcoFleet) * 100) : 0;

    return {
      deviceTotalFleet,
      sigfoxTotalFleet,
      serviceTotalFleet,
      tcoFleet,
      tcoUnit,
      sigfoxSharePct,
      serviceEvents: events.length,
      avgAnnualFleet: r2(tcoFleet / cfg.years),
    };
  }

  function renderMRQNote(project, cfg) {
    const el = document.getElementById(project + "_mrq_note");
    const below = cfg.qty < cfg.mrq;

    if (below) {
      el.className = "note";
      el.innerHTML =
        "<strong>MRQ warning:</strong> Entered quantity is <strong>" +
        cfg.qty +
        "</strong>, but the unit price basis is " +
        "<strong>MRQ " +
        cfg.mrq +
        "</strong>. The calculator still works, but the unit price being applied is the quoted " +
        "MRQ price and may not be commercially valid below the MRQ.";
    } else {
      el.className = "note good";
      el.innerHTML =
        "<strong>MRQ basis satisfied:</strong> Entered quantity is <strong>" +
        cfg.qty +
        "</strong> against a quoted price " +
        "basis of <strong>MRQ " +
        cfg.mrq +
        "</strong>.";
    }
  }

  function renderSummary(project, cfg, summary) {
    const el = document.getElementById(project + "_summary");
    el.innerHTML =
      '<div class="metric">' +
      '<div class="label">' +
      cfg.years +
      "-Year TCO / Device</div>" +
      '<div class="value">' +
      money(summary.tcoUnit) +
      "</div>" +
      '<div class="detail">Quantity: ' +
      cfg.qty.toLocaleString("en-ZA") +
      "</div>" +
      "</div>" +
      '<div class="metric">' +
      '<div class="label">' +
      cfg.years +
      "-Year Fleet TCO</div>" +
      '<div class="value">' +
      money(summary.tcoFleet) +
      "</div>" +
      '<div class="detail">Total ownership cost over ' +
      cfg.years +
      " years</div>" +
      "</div>" +
      '<div class="metric">' +
      '<div class="label">Service Cost (Fleet)</div>' +
      '<div class="value">' +
      money(summary.serviceTotalFleet) +
      "</div>" +
      '<div class="detail">' +
      summary.serviceEvents +
      " service event(s) over model period</div>" +
      "</div>" +
      '<div class="metric">' +
      '<div class="label">Average Annual Fleet Cost</div>' +
      '<div class="value">' +
      money(summary.avgAnnualFleet) +
      "</div>" +
      '<div class="detail">Fleet total ÷ years</div>' +
      "</div>";
  }

  function renderComponentBreakdown(project, cfg, summary) {
    const el = document.getElementById(project + "_breakdown");
    if (!el) return;
    const dev = r2(cfg.device);
    const sfx = r2(summary.sigfoxTotalFleet / cfg.qty);
    const svc = r2(summary.serviceTotalFleet / cfg.qty);
    const label = project === "at1l" ? "AT1L" : "AT2";
    el.innerHTML =
      '<h3 class="section-title" style="margin-bottom:8px;">' +
      label +
      " — component breakdown (per device)</h3>" +
      '<div class="table-wrap"><table class="data-table">' +
      "<thead><tr><th>Component</th><th class=\"right\">Cost</th></tr></thead><tbody>" +
      "<tr><td>Device (initial)</td><td class=\"right\">" +
      money(dev) +
      "</td></tr>" +
      "<tr><td>Sigfox (total, " +
      cfg.years +
      " yr)</td><td class=\"right\">" +
      money(sfx) +
      "</td></tr>" +
      "<tr><td>Maintenance</td><td class=\"right\">" +
      money(svc) +
      "</td></tr>" +
      "<tr><td><strong>Total TCO / device</strong></td><td class=\"right\"><strong>" +
      money(summary.tcoUnit) +
      "</strong></td></tr>" +
      "</tbody></table></div>" +
      '<div class="insight-line" style="margin-top:10px;">' +
      "<strong>Business insight:</strong> Sigfox is about <strong>" +
      summary.sigfoxSharePct +
      "%</strong> of " +
      cfg.years +
      "-year TCO here. " +
      (project === "at1l"
        ? "Low hardware CAPEX; connectivity dominates lifetime cost — suited to high-volume recovery use cases."
        : "Higher CAPEX with more on-device capability; lower maintenance than AT1L when enclosure is every 2nd cycle.") +
      "</div>";
  }

  function renderYearlyTable(project, rows) {
    const el = document.getElementById(project + "_yearly_table");
    let html =
      '<table class="data-table">' +
      "<thead><tr>" +
      "<th>Year</th>" +
      '<th class="right">Device / Unit</th>' +
      '<th class="right">Device / Fleet</th>' +
      '<th class="right">Sigfox / Unit</th>' +
      '<th class="right">Sigfox / Fleet</th>' +
      '<th class="right">Service / Unit</th>' +
      '<th class="right">Service / Fleet</th>' +
      '<th class="right">Total / Unit</th>' +
      '<th class="right">Total / Fleet</th>' +
      '<th class="right">Cumulative Fleet</th>' +
      "</tr></thead><tbody>";

    rows.forEach((r) => {
      html +=
        "<tr>" +
        "<td><strong>Year " +
        r.year +
        "</strong></td>" +
        '<td class="right">' +
        money(r.deviceUnit) +
        "</td>" +
        '<td class="right">' +
        money(r.deviceFleet) +
        "</td>" +
        '<td class="right">' +
        money(r.sigfoxUnit) +
        "</td>" +
        '<td class="right">' +
        money(r.sigfoxFleet) +
        "</td>" +
        '<td class="right">' +
        money(r.serviceUnit) +
        "</td>" +
        '<td class="right">' +
        money(r.serviceFleet) +
        "</td>" +
        '<td class="right"><strong>' +
        money(r.totalUnit) +
        "</strong></td>" +
        '<td class="right"><strong>' +
        money(r.totalFleet) +
        "</strong></td>" +
        '<td class="right">' +
        money(r.cumulativeFleet) +
        "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    el.innerHTML = '<div class="table-wrap">' + html + "</div>";
  }

  function renderServiceTable(project, events) {
    const el = document.getElementById(project + "_service_table");

    if (!events.length) {
      el.innerHTML = '<div class="small-muted">No service events fall inside the selected period.</div>';
      return;
    }

    let html =
      '<table class="data-table">' +
      "<thead><tr>" +
      "<th>Cycle</th>" +
      '<th class="right">Month</th>' +
      '<th class="right">Year</th>' +
      '<th class="center">Battery</th>' +
      '<th class="center">Enclosure</th>' +
      '<th class="right">Battery / Unit</th>' +
      '<th class="right">Enclosure / Unit</th>' +
      '<th class="right">Total / Unit</th>' +
      '<th class="right">Total / Fleet</th>' +
      "</tr></thead><tbody>";

    events.forEach((e) => {
      html +=
        "<tr>" +
        "<td><strong>Cycle " +
        e.cycle +
        "</strong></td>" +
        '<td class="right">' +
        e.month +
        "</td>" +
        '<td class="right">' +
        e.year +
        "</td>" +
        '<td class="center"><span class="tag green">Replace</span></td>' +
        '<td class="center">' +
        (e.enclosureThisCycle
          ? '<span class="tag blue">Replace</span>'
          : '<span class="tag">No</span>') +
        "</td>" +
        '<td class="right">' +
        money(e.batteryUnit) +
        "</td>" +
        '<td class="right">' +
        money(e.enclosureUnit) +
        "</td>" +
        '<td class="right"><strong>' +
        money(e.totalUnit) +
        "</strong></td>" +
        '<td class="right"><strong>' +
        money(e.totalFleet) +
        "</strong></td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    el.innerHTML = '<div class="table-wrap">' + html + "</div>";
  }

  function renderRepeatOrderTable(project, rows) {
    const el = document.getElementById(project + "_reorder_table");
    let html =
      '<table class="data-table">' +
      "<thead><tr>" +
      "<th>Year</th>" +
      '<th class="right">Indicative Unit Price</th>' +
      '<th class="right">Indicative Fleet Price</th>' +
      "</tr></thead><tbody>";

    rows.forEach((r) => {
      html +=
        "<tr>" +
        "<td><strong>Year " +
        r.year +
        "</strong></td>" +
        '<td class="right">' +
        money(r.unit) +
        "</td>" +
        '<td class="right">' +
        money(r.fleet) +
        "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    el.innerHTML = '<div class="table-wrap">' + html + "</div>";
  }

  function renderChart(project, summary) {
    const el = document.getElementById(project + "_chart");
    const parts = [
      { label: "Device", value: summary.deviceTotalFleet },
      { label: "Sigfox", value: summary.sigfoxTotalFleet },
      { label: "Service", value: summary.serviceTotalFleet },
    ];
    const max = Math.max(...parts.map((p) => p.value), 1);

    el.innerHTML = parts
      .map(
        (p) =>
          '<div class="bar-row">' +
          "<div><strong>" +
          p.label +
          "</strong></div>" +
          '<div class="bar-track">' +
          '<div class="bar-fill" style="width:' +
          (p.value / max) * 100 +
          '%"></div>' +
          "</div>" +
          '<div class="right"><strong>' +
          money(p.value) +
          "</strong></div>" +
          "</div>"
      )
      .join("");
  }

  function calculateProject(project) {
    const cfg = validateInputs(buildProjectKey(project));
    const events = buildServiceEvents(cfg);
    const yearRows = buildYearRows(cfg, events);
    const reorderRows = buildRepeatOrderRows(cfg);
    const summary = summariseProject(cfg, events, yearRows);

    renderMRQNote(project, cfg);
    renderSummary(project, cfg, summary);
    renderComponentBreakdown(project, cfg, summary);
    renderYearlyTable(project, yearRows);
    renderServiceTable(project, events);
    renderRepeatOrderTable(project, reorderRows);
    renderChart(project, summary);

    return { cfg, events, yearRows, reorderRows, summary };
  }

  function calculateAll() {
    calculateProject(PROJECT);
  }

  window.resetProject = function () {
    const d = defaults[PROJECT];
    Object.keys(d).forEach((key) => setVal(PROJECT + "_" + key, d[key]));
    calculateAll();
  };

  window.calculateAll = calculateAll;

  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", calculateAll);
    input.addEventListener("change", calculateAll);
  });

  calculateAll();
})();
