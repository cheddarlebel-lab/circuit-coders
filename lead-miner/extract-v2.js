// Lead-miner extractor v2 — repaired 2026-06-19 for current Google Maps DOM.
//
// WHY v1 BROKE: Maps removed the inline "Website" chip (a[data-value="Website"]) from
// feed cards. Feed cards now expose ONLY: name, rating, review count, category, address,
// phone, and a review snippet. The website now lives on the place DETAIL panel, which
// (as of 2026-06-19) does NOT render reliably under browser automation — clicking a card
// leaves the panel on "Results" with no website node (anti-bot). So websites/emails can
// no longer be harvested from Maps in-session.
//
// WHAT v2 DOES: reliably extract the feed fields. Run via javascript_tool on a
// /maps/search/... page AFTER scrolling the feed to load listings. Returns hostnames/text
// only (never full Maps URLs — DLP blocks those).
(() => {
  const feed = document.querySelector('div[role="feed"]');
  if (!feed) return JSON.stringify({error: 'no feed'});
  const cards = [...feed.children].filter(c => c.querySelector('a.hfpxzc'));
  const out = cards.map(c => {
    const name = c.querySelector('a.hfpxzc')?.getAttribute('aria-label') || null;
    const lines = c.innerText.split('\n').map(s => s.trim()).filter(Boolean);
    const rr = (c.innerText.match(/(\d\.\d)\s*\((\d[\d,]*)\)/) || []);
    const phone = (c.innerText.match(/\(\d{3}\)\s?\d{3}-\d{4}/) || [null])[0];
    // category + address line looks like "Used car dealer ·  · 515 Oceanside Blvd"
    const catLine = lines.find(l => l.includes('·')) || '';
    const parts = catLine.split('·').map(s => s.trim()).filter(Boolean);
    return {
      name,
      rating: rr[1] || null,
      reviews: rr[2] ? rr[2].replace(/,/g, '') : null,
      category: parts[0] || null,
      address: parts[parts.length - 1] || null,
      phone,
      sponsored: /sponsored/i.test(c.innerText),
      website: null // not available from feed anymore; resolve separately (web search)
    };
  }).filter(x => x.name);
  return JSON.stringify({count: out.length, leads: out});
})();
