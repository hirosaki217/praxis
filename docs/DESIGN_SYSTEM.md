# Design System — Order Pizza

> Nguồn sự thật duy nhất (single source of truth) cho màu, typography, token và component dùng chung. Cầu nối từ wireframe (`wireframes/`) sang code (React + Tailwind + shadcn/ui).
>
 Quy ước: token dùng **CSS variable dạng HSL** (chuẩn shadcn/ui) để paste thẳng vào `globals.css`, map sang Tailwind qua `tailwind.config`.

---

> ⚠️ **Bản v4 (đang dùng)**: dự án dùng Tailwind **v4 + `@tailwindcss/vite`** (CSS-first, **không có `tailwind.config.ts`**). §3/§4 dưới đây đang ở dạng **v3** (HSL + `@tailwind` directives + `tailwind.config`). Bản **v4** (`:root`/`.dark` + `@theme inline`, paste vào `src/index.css` sau `shadcn init`) sẽ được bổ sung ngay khi inject token Indigo — **quy tắc màu và component không đổi**.

## Mục lục

1. [Nguyên tắc](#1--nguyên-tắc)
2. [Color tokens](#2--color-tokens)
3. [CSS variables paste-ready](#3--css-variables-paste-ready)
4. [Tailwind config](#4--tailwind-config)
5. [Typography](#5--typography)
6. [Spacing · Radius · Shadow · Motion](#6--spacing--radius--shadow--motion)
7. [Bảng ánh xạ trạng thái → màu](#7--bảng-ánh-xạ-trạng-thái--màu)
8. [Component dùng chung](#8--component-dùng-chung)
9. [Quy ước đặt tên & sử dụng](#9--quy-ước-đặt-tên--sử-dụng)

---

## 1. Nguyên tắc

- **Semantic token, không hex cứng**: UI chỉ dùng class/utility từ token (`bg-primary`, `text-muted-foreground`…), **không bao giờ** viết `text-[#6366F1]`. Đổi theme = đổi token, không đụng UI.
- **Mỗi trạng thái nghiệp vụ có 1 màu duy nhất** (xem [§7](#7--bảng-ánh-xạ-trạng-thái--màu)): kênh giao, trạng thái đơn, trạng thái thanh toán… ánh xạ tập trung qua component `<StatusBadge>`/`<ChannelTag>`.
- **Dark mode từ đầu**: mọi token có cặp light/dark.
- **Access trước**: contrast tối thiểu AA (4.5:1 cho text). Indigo `#6366F1` trên trắng = 3.6:1 → **chỉ dùng cho nền nút có chữ trắng** (large/bold text) hoặc icon, **không** cho body text. Body text dùng neutral.

---

## 2. Color tokens

### Brand
| Token | Hex | HSL | Dùng cho |
|---|---|---|---|
| `--primary` | `#6366F1` | `239 84% 67%` | CTA chính, active nav, focus ring |
| `--primary-foreground` | `#FFFFFF` | `0 0% 100%` | Chữ trên primary |
| `--accent` | `#0EA5E9` | `199 89% 48%` | Nhấn phụ (link info, highlight) |
| `--brand-deep` | `#4338CA` | `245 58% 50%` | Hover/pressed của primary |

### Semantic
| Token | Hex | HSL | Dùng cho |
|---|---|---|---|
| `--success` | `#16A34A` | `142 71% 36%` | Hoàn tất, online, đủ kho, active |
| `--warning` | `#D97706` | `32 90% 44%` | Đang xử lý, sắp hết, chờ, lịch trình |
| `--destructive` | `#DC2626` | `0 73% 51%` | Lỗi, hủy, hết hàng, blacklist, xóa |
| `--info` | `#0EA5E9` | `199 89% 48%` | Đang giao, thông tin (= accent) |

### Channel (riêng domain đặt pizza)
| Token | Hex | Dùng cho |
|---|---|---|
| `--channel-delivery` | `#6366F1` | 🛵 Giao tận nơi |
| `--channel-pickup` | `#14B8A6` | 🏪 Tự đến lấy |
| `--channel-dinein` | `#EC4899` | 🍽 Ăn tại quán |

> 3 màu kênh cố định xuyên suốt (storefront + admin), giúp nhận biết nhanh trên order board, badge, biểu đồ.

### Neutral (slate — hợp tone lạnh với indigo)
| Token | Hex | HSL | Dùng cho |
|---|---|---|---|
| `--background` | `#FFFFFF` | `0 0% 100%` | Nền trang |
| `--foreground` | `#0F172A` | `222 47% 11%` | Body text chính |
| `--card` | `#FFFFFF` | `0 0% 100%` | Nền card |
| `--muted` | `#F1F5F9` | `210 40% 96%` | Nền khối次要, hover row |
| `--muted-foreground` | `#64748B` | `215 16% 47%` | Text phụ, placeholder |
| `--border` | `#E2E8F0` | `214 32% 91%` | Viền, separator |
| `--ring` | `#6366F1` | `239 84% 67%` | Focus ring |

---

## 3. CSS variables paste-ready

> Paste vào `src/styles/globals.css`. Theo convention shadcn/ui (giá trị HSL không `hsl()`, `hsl()` thêm ở utility).

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* brand */
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;
    --accent: 199 89% 48%;
    --accent-foreground: 0 0% 100%;
    --brand-deep: 245 58% 50%;

    /* semantic */
    --success: 142 71% 36%;
    --success-foreground: 0 0% 100%;
    --warning: 32 90% 44%;
    --warning-foreground: 0 0% 100%;
    --destructive: 0 73% 51%;
    --destructive-foreground: 0 0% 100%;
    --info: 199 89% 48%;
    --info-foreground: 0 0% 100%;

    /* channel (domain) */
    --channel-delivery: 239 84% 67%;
    --channel-pickup:   173 80% 40%;
    --channel-dinein:   330 81% 60%;

    /* neutral */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 239 84% 67%;

    /* radius */
    --radius: 0.625rem; /* 10px — khớp wireframe */
  }

  .dark {
    --background: 222 47% 7%;
    --foreground: 210 40% 98%;
    --card: 222 47% 9%;
    --card-foreground: 210 40% 98%;
    --muted: 217 33% 14%;
    --muted-foreground: 215 20% 65%;
    --border: 217 33% 20%;
    --input: 217 33% 20%;
    --ring: 239 84% 75%;

    --primary: 239 84% 75%;        /* sáng hơn trong dark */
    --primary-foreground: 222 47% 11%;
    --accent: 199 89% 55%;
    --brand-deep: 239 84% 67%;

    /* semantic giữ hue, tăng lightness cho dark */
    --success: 142 71% 45%;
    --warning: 32 90% 55%;
    --destructive: 0 73% 60%;
    --info: 199 89% 55%;

    --channel-delivery: 239 84% 72%;
    --channel-pickup:   173 80% 50%;
    --channel-dinein:   330 81% 68%;
  }

  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

---

## 4. Tailwind config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          deep: "hsl(var(--brand-deep))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        /* semantic */
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
        /* channel — dùng cho ChannelTag/StatusBadge */
        channel: {
          delivery: "hsl(var(--channel-delivery))",
          pickup: "hsl(var(--channel-pickup))",
          dinein: "hsl(var(--channel-dinein))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

---

## 5. Typography

**Font**: `Inter` (UI) + `JetBrains Mono` (code/SKU/số đơn/mã voucher). Load qua `@fontsource/inter` hoặc Google Fonts.

| Token (Tailwind) | Size / Line | Trọng số | Dùng cho |
|---|---|---|---|
| `text-xs` | 12 / 16 | 400–600 | eyebrow, meta, tiny label |
| `text-sm` | 14 / 20 | 400–600 | body phụ, table, badge |
| `text-base` | 16 / 24 | 400–500 | body mặc định |
| `text-lg` | 18 / 28 | 600–700 | card title, section |
| `text-xl` | 20 / 28 | 700 | page header |
| `text-2xl`–`3xl` | 24–30 | 800 | KPI value, hero |
| `font-mono` | — | 500 | mã đơn `#PF-20451`, SKU, giá tiền tùy chọn |

Quy tắc: **giá tiền** dùng `tabular-nums` để cột số thẳng hàng (`font-variant-numeric`).

---

## 6. Spacing · Radius · Shadow · Motion

**Spacing**: theo scale Tailwind (base 4px). Block nội dung `gap-4` (16px), section `space-y-6`/`mt-8`.

**Radius** (`--radius` = 10px):
- `rounded-sm` 6px — input, tag
- `rounded-md` 8px — button, small card
- `rounded-lg` 10px — card, dialog
- `rounded-xl` 12px — panel lớn, KPI
- `rounded-full` — badge pill, avatar

**Shadow**: ưu tiên mềm, nhẹ. Dùng `shadow-sm` (card), `shadow-md` (popover), `shadow-lg` (dialog). Tránh shadow nặng.

**Motion** (thêm vào `tailwind.config` nếu cần):
| Token | Thời gian | Easing | Khi nào |
|---|---|---|---|
| `fast` | 150ms | ease-out | hover button, toggle |
| `base` | 200ms | ease-out | dialog/popover open |
| `slow` | 300ms | ease-in-out | sidebar, page transition |

> Reduce-motion: tôn trọng `prefers-reduced-motion` (shadcn/Radix đã có).

---

## 7. Bảng ánh xạ trạng thái → màu

> Đây là **từ điển trạng thái nghiệp vụ**. Dùng trong `<StatusBadge>` / `<ChannelTag>` — không tự pick màu trong UI.

### Kênh đặt (`channel`)
| Giá trị | Label | Màu | Icon |
|---|---|---|---|
| `delivery` | Giao tận nơi | `channel.delivery` (#6366F1) | 🛵 |
| `pickup` | Tự đến lấy | `channel.pickup` (#14B8A6) | 🏪 |
| `dine-in` | Ăn tại quán | `channel.dinein` (#EC4899) | 🍽 |

### Trạng thái đơn (`orderStatus`) — tone semantic
| Trạng thái | Label hiển thị | Tone |
|---|---|---|
| `created` | Mới | `info` |
| `confirmed` | Đã xác nhận | `info` |
| `preparing` | Đang làm | `warning` |
| `ready` / `ready_for_pickup` | Sẵn sàng | `warning` |
| `out_for_delivery` / `assigned_driver` | Đang giao | `primary` |
| `delivered` / `picked_up` / `served` | Đã nhận/phục vụ | `success`-soft |
| `completed` | Hoàn tất | `success` |
| `cancelled` / `refunded` | Đã hủy / Hoàn tiền | `destructive` |

### Trạng thái thanh toán (`paymentStatus`)
| Trạng thái | Tone |
|---|---|
| `pending` | `warning` |
| `paid` / `captured` | `success` |
| `failed` | `destructive` |
| `refunded` | `muted` + label "Hoàn tiền" |

### Trạng thái khác
| Đối tượng | Trạng thái | Tone |
|---|---|---|
| Tồn kho | Đủ / Thấp / Hết | success / warning / destructive |
| Khách hàng | Active / Blacklist | success / destructive |
| Loyalty tier | Đồng / Bạc / Vàng / Bạch Kim | muted / info / warning / accent |
| Sản phẩm | Available / Ẩn | success / muted |

---

## 8. Component dùng chung

Chia 2 nhóm: **(A)** primitive từ shadcn/ui cài sẵn, **(B)** component tự xây (project-specific) đặt ở `src/components/shared/`.

### A. shadcn/ui primitives (cài đủ bộ)

> Cài qua `npx shadcn@latest add <name>`. Đây là nền, không cần định nghĩa lại.

`button` `input` `textarea` `label` `select` `checkbox` `radio-group` `switch` `slider`
`dialog` `sheet` `alert-dialog` `dropdown-menu` `popover` `tooltip` `tabs` `accordion`
`card` `badge` `avatar` `separator` `skeleton` `scroll-area`
`table` `pagination` `sonner` (toast) `command` (search palette) `calendar` `date-picker` `form` (RHF)

### B. Component tự xây — dùng chung (`src/components/shared/`)

| Component | Mục đích | Props chính | Dùng ở |
|---|---|---|---|
| **`<DataTable>`** | Bảng phân trang/lọc/sort (TanStack Table) | `columns`, `data`, `filters`, `pagination` | Mọi list admin (orders, menu, customers, inventory, reports) |
| **`<KpiCard>`** | Tile KPI: label + value + delta | `label`, `value`, `delta?`, `trend?` | Dashboard, Reports |
| **`<StatusBadge>`** | Badge mapping trạng thái → màu theo [§7] | `status`, `kind: 'order'\|'payment'\|'inventory'…` | Order board, table, tracking |
| **`<ChannelTag>`** | Tag kênh giao (icon + màu kênh) | `channel`, `size?` | Cart, checkout, order board, dashboard |
| **`<Money>`** | Format VND + tabular-nums | `value`, `currency?`, `muted?` | Mọi nơi hiện giá |
| **`<SegmentedControl>`** | Pill tabs (kênh, sort) | `options`, `value`, `onChange` | Menu, cart, checkout, admin filter |
| **`<QuantityStepper>`** | +/- số lượng | `value`, `min`, `max`, `onChange` | Product detail, cart |
| **`<PriceBreakdown>`** | Breakdown tổng đơn | `lines`, `discounts`, `fee`, `tax`, `total`, `points` | Cart, checkout |
| **`<OrderStepper>`** | Timeline trạng thái (state machine) | `status`, `channel`, `history?` | Order tracking, admin order detail |
| **`<FormRow>`** | Label + field + error (RHF + Zod) | `label`, `error`, `hint`, `children` | Mọi form (checkout, admin CRUD) |
| **`<FilterBar>`** | Hàng filter composable | `children` (các select/segmented) | Admin list views |
| **`<PageHeader>`** | Tiêu đề trang + actions | `title`, `subtitle?`, `actions?` | Mọi trang admin |
| **`<EmptyState>` / `<ErrorState>` / `<LoadingState>`** | Trạng thái async (React Query) | `title`, `description?`, `onRetry?` | Toàn app |
| **`<ConfirmDialog>`** | Xác nhận hành động nguy hiểm | `trigger`, `title`, `description`, `onConfirm`, `tone?` | Hủy đơn, hoàn tiền, xóa |
| **`<MiniBarChart>` / `<Stat>`** | Wrapper Recharts + chỉ số | `data`, `keys` | Dashboard, Reports |

> Nguyên tắc: những thứ lặp ≥ 2 lần phải rút thành component dùng chung. Đặt ở `shared/`; component đặc thù feature đặt trong `features/<area>/components/`.

---

## 9. Quy ước đặt tên & sử dụng

- **Token**: `bg-{role}`, `text-{role}-foreground`, `border-{role}`. Ví dụ: `bg-primary text-primary-foreground`, `text-muted-foreground`, `bg-destructive/10 text-destructive`.
- **Channel**: luôn qua `<ChannelTag>`; nếu cần trực tiếp: `bg-channel-delivery/10 text-channel-delivery`.
- **Soft variant cho badge**: nền `${color}/10` + chữ `${color}` (vd: badge "Đang làm" = `bg-warning/10 text-warning`). Giữ cho UI nhẹ, dễ đọc.
- **Đừng mix hex**: review/CI có thể thêm rule cấm `#` literal trong `className`.
- **Dark mode**: test mọi màn bằng toggle theme (đã có token dark). Storefront + admin đều phải hỗ trợ.
- **Accessibility**: focus luôn hiện `ring` (2px `--ring`); nút text/semantic phải đạt contrast AA.

---

> Khi scaffold app (P0): paste [§3](#3--css-variables-paste-ready) vào `globals.css`, [§4](#4--tailwind-config) vào `tailwind.config.ts`, cài bộ primitive [§A](#a-shadcnui-primitives-cài-đủ-bộ), rồi dựng các component [§B](#b--component-tự-xây--dùng-chung-srccomponentsshared) theo đúng props đã liệt kê.
