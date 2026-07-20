/* ===========================================================
   Admin shell — tự bọc sidebar + top bar quanh #admin-content.
   Trang admin đặt: <body data-group="admin" data-screen="a01-dashboard">
                    <div id="admin-content"> ...nội dung... </div>
                    <script src="chrome.js"></script>
                    <script src="admin-shell.js"></script>
   =========================================================== */

(function () {
  const cur = document.body.dataset.screen || "";

  const NAV = [
    ["grp", "Tổng quan"],
    ["a01-dashboard", "📊 Dashboard"],
    ["a02-orders", "📋 Order Board"],
    ["grp", "Quản lý"],
    ["a03-menu", "🍕 Menu"],
    ["a04-promotions", "🎟 Promotions"],
    ["a05-customers", "👥 Customers"],
    ["a07-inventory", "📦 Inventory"],
    ["grp", "Hệ thống"],
    ["a06-branches", "🏢 Branches"],
    ["a08-staff", "🔐 Staff & RBAC"],
    ["a09-reports", "📈 Reports"],
    ["a10-settings", "⚙ Settings"],
  ];

  const TITLES = {
    "a01-dashboard": "Dashboard tổng quan",
    "a02-orders": "Quản lý đơn (Order Board)",
    "a03-menu": "Quản lý menu",
    "a04-promotions": "Khuyến mãi",
    "a05-customers": "Khách hàng",
    "a06-branches": "Chi nhánh",
    "a07-inventory": "Tồn kho",
    "a08-staff": "Nhân viên & phân quyền",
    "a09-reports": "Báo cáo",
    "a10-settings": "Cài đặt",
  };

  // ---- Sidebar ----
  const aside = document.createElement("aside");
  aside.className = "admin-side";
  let h = '<div class="brand">🍕 PizzaForge <span class="muted tiny">Admin</span></div>';
  NAV.forEach(([k, v]) => {
    if (k === "grp") h += `<div class="grp">${v}</div>`;
    else h += `<a class="nav ${k === cur ? "active" : ""}" href="${k}.html">${v}</a>`;
  });
  h += `<a class="nav" href="index.html" style="margin-top:16px;color:var(--wf-mute)">← Tất cả màn hình</a>`;
  aside.innerHTML = h;

  // ---- Top bar ----
  const topbar = document.createElement("div");
  topbar.className = "row between center wrap";
  topbar.style.marginBottom = "18px";
  topbar.innerHTML = `
    <div>
      <div class="eyebrow">Admin</div>
      <div style="font-size:20px;font-weight:800;">${TITLES[cur] || ""}</div>
    </div>
    <div class="row center wrap" style="gap:10px;">
      <div class="seg"><div class="opt on">Tất cả chi nhánh</div><div class="opt">HN</div><div class="opt">HCM</div><div class="opt">ĐN</div></div>
      <div class="ico-btn" style="width:36px;height:36px;border-radius:8px;border:1px solid var(--wf-line);">🔔</div>
      <div class="box" style="padding:6px 12px;display:flex;gap:8px;align-items:center;">👤 <b>Manager</b> ▾</div>
    </div>
  `;

  // ---- Assemble ----
  const main = document.createElement("main");
  main.className = "admin-main";
  main.appendChild(topbar);
  const content = document.getElementById("admin-content");
  if (content) {
    while (content.firstChild) main.appendChild(content.firstChild);
    content.remove();
  }

  const shell = document.createElement("div");
  shell.className = "admin-shell";
  shell.appendChild(aside);
  shell.appendChild(main);

  const chrome = document.querySelector(".wf-chrome");
  if (chrome) chrome.after(shell);
  else document.body.prepend(shell);
})();
