/* ===========================================================
   Wireframe nav chrome — inject thanh điều hướng cố định trên cùng.
   Mỗi trang đặt <body data-group="storefront|admin|popups" data-screen="...">
   =========================================================== */

const SCREENS = {
  storefront: [
    ["01-menu",            "Menu / Home"],
    ["02-product-detail",  "Product Detail"],
    ["03-cart",            "Cart"],
    ["04-checkout",        "Checkout (3 kênh)"],
    ["05-order-tracking",  "Order Tracking"],
    ["06-account",         "Account"],
  ],
  admin: [
    ["a01-dashboard",   "Dashboard"],
    ["a02-orders",      "Order Board"],
    ["a03-menu",        "Menu Mgmt"],
    ["a04-promotions",  "Promotions"],
    ["a05-customers",   "Customers"],
    ["a06-branches",    "Branches"],
    ["a07-inventory",   "Inventory"],
    ["a08-staff",       "Staff & RBAC"],
    ["a09-reports",     "Reports"],
    ["a10-settings",    "Settings"],
  ],
  popups: [
    ["07-popups", "Storefront Popups"],
    ["a11-popups", "Admin Popups"],
  ],
};

(function () {
  const group = document.body.dataset.group || "storefront";
  const cur = document.body.dataset.screen || "";
  const list = SCREENS[group] || [];
  const idx = list.findIndex((s) => s[0] === cur);
  const curName = idx >= 0 ? list[idx][1] : cur;
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
  const groupLabel =
    group === "admin" ? "Admin" : group === "popups" ? "Popups" : "Storefront";

  const bar = document.createElement("div");
  bar.className = "wf-chrome";
  bar.innerHTML = `
    <span class="badge">Wireframe</span>
    <span class="group-tag">${groupLabel}</span>
    <span class="crumb">${curName}</span>
    <span class="spacer"></span>
    <a href="index.html" title="Tất cả màn hình">⊞ Tất cả</a>
    ${prev ? `<a href="${prev[0]}.html" title="${prev[1]}">← ${prev[1]}</a>` : '<a class="disabled">←</a>'}
    ${next ? `<a href="${next[0]}.html" title="${next[1]}">${next[1]} →</a>` : '<a class="disabled">→</a>'}
  `;
  document.body.prepend(bar);
})();
