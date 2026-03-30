/**
 * Bundles CSS, JS, and SVG logos into single HTML files for email attachment.
 * Run: node scripts/build-standalone.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function read(f) {
  return fs.readFileSync(path.join(root, f), "utf8");
}

function svgDataUri(svg) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function inlineAssets(html) {
  let out = html;
  out = out.replace(
    /<link rel="stylesheet" href="assets\/tco\.css" \/>/,
    "<style>\n" + read("assets/tco.css") + "\n</style>"
  );
  out = out.replace(
    /<script src="assets\/tco-calculator\.js"><\/script>/,
    "<script>\n" + read("assets/tco-calculator.js") + "\n</script>"
  );
  const gms = svgDataUri(read("assets/g-matrix-logo.svg"));
  const ramac = svgDataUri(read("assets/ramac-logo.svg"));
  out = out.replace(/src="assets\/g-matrix-logo\.svg"/g, 'src="' + gms + '"');
  out = out.replace(/src="assets\/ramac-logo\.svg"/g, 'src="' + ramac + '"');
  return out;
}

const standaloneNoteAt1l = `
    <p class="standalone-note" style="font-size:0.8125rem;color:#6b7280;margin:0 0 18px;padding:12px 14px;background:#f8fafc;border:1px solid #dbe2ea;border-radius:12px;max-width:720px;line-height:1.45;">
      <strong>Offline file.</strong> Save and open in Chrome, Edge, or Firefox. No internet required.
      For the AT2 model, open the companion file <code style="font-size:0.9em;">RAMAC-AT2-TCO-standalone.html</code> (attach both from the same package).
    </p>`;

const standaloneNoteAt2 = `
    <p class="standalone-note" style="font-size:0.8125rem;color:#6b7280;margin:0 0 18px;padding:12px 14px;background:#f8fafc;border:1px solid #dbe2ea;border-radius:12px;max-width:720px;line-height:1.45;">
      <strong>Offline file.</strong> Save and open in Chrome, Edge, or Firefox. No internet required.
      For the AT1L model, open the companion file <code style="font-size:0.9em;">RAMAC-AT1L-TCO-standalone.html</code> (attach both from the same package).
    </p>`;

let at1 = read("at1l.html");
at1 = at1.replace(/<nav class="site-nav"[\s\S]*?<\/nav>/, standaloneNoteAt1l);
fs.writeFileSync(path.join(root, "RAMAC-AT1L-TCO-standalone.html"), inlineAssets(at1), "utf8");
console.log("Wrote RAMAC-AT1L-TCO-standalone.html");

let at2 = read("at2.html");
at2 = at2.replace(/<nav class="site-nav"[\s\S]*?<\/nav>/, standaloneNoteAt2);
fs.writeFileSync(path.join(root, "RAMAC-AT2-TCO-standalone.html"), inlineAssets(at2), "utf8");
console.log("Wrote RAMAC-AT2-TCO-standalone.html");

let hub = read("index.html");
hub = hub.replace(
  /<a class="hub-card" href="at1l\.html">([\s\S]*?)<\/a>/,
  '<div class="hub-card" style="cursor:default;"><h3>RAMAC™ AT1L</h3><p>Cash bag embedded tracker — recovery / secondary tracking, daily heartbeat, battery + enclosure every 18-month cycle.</p><p class="go">Open the attached file <strong>RAMAC-AT1L-TCO-standalone.html</strong></p></div>'
);
hub = hub.replace(
  /<a class="hub-card" href="at2\.html">([\s\S]*?)<\/a>/,
  '<div class="hub-card" style="cursor:default;"><h3>RAMAC™ AT2</h3><p>Teller machine tracker — powered install, backup battery, battery every 18 months, enclosure every 2nd cycle.</p><p class="go">Open the attached file <strong>RAMAC-AT2-TCO-standalone.html</strong></p></div>'
);
hub = inlineAssets(hub).replace(
  /<script src="assets\/tco-calculator\.js"><\/script>/g,
  ""
);
// index has no script tag - inlineAssets only adds style - good
fs.writeFileSync(path.join(root, "RAMAC-TCO-Hub-standalone.html"), hub, "utf8");
console.log("Wrote RAMAC-TCO-Hub-standalone.html");
