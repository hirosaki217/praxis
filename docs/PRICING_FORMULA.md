# Công thức tính giá — Order Pizza

> Giải thích **dễ hiểu** cách app tính tiền cho 1 đơn hàng. Đây chính là logic của `src/lib/pricing/computeOrder.ts` (đã có unit test + verify runtime).
>
 Đơn vị: **VND (đồng)**, số nguyên. VAT mặc định **8%**.

---

## Ý tưởng cốt lõi

Tính tiền theo **1 dây chuyền**, mỗi bước dùng kết quả bước trước. Đọc từ trên xuống:

```
Đơn giá line → Line total → Subtotal → (− combo) → (− voucher) → (+ phí ship) → (+ VAT) → (− điểm) = TỔNG
                                                                                                   → điểm tích lũy
```

> Quy tắc vàng: **VAT tính trên tiền hàng SAU KHI đã giảm**, KHÔNG tính trên phí ship. Giảm giá/lợi điểm không bao giờ cho âm (có floor = 0).

---

## Bước 1 — Đơn giá của 1 dòng (line unit price)

Mỗi dòng trong giỏ = 1 pizza (hoặc món) với cấu hình đã chọn:

```
đơn giá = giá BIẾN THỂ (theo size)  +  tổng GIÁ TOPPING (cũng theo size)
```

- **Giá biến thể**: mỗi size S/M/L/XL có giá riêng (vd Pepperoni: S 129k, M 189k, L 249k…).
- **Giá topping phụ thuộc size**: topping cho pizza **L đắt hơn S** (vd Extra Cheese: S 10k, M 15k, L 20k, XL 25k).

Ví dụ — Pepperoni size **M**, thêm **Extra Cheese** + **Bacon**:
```
giá biến thể M        = 189.000
Extra Cheese (size M)=  15.000
Bacon (size M)       =  22.000
→ đơn giá            = 226.000
```

> Đây là điểm dễ sai: **topping phải lấy giá đúng size của pizza**, không phải giá cố định.

---

## Bước 2 — Line total (thành tiền 1 dòng)

```
line total = đơn giá × số lượng (qty)
```

Ví dụ mua **2** pizza như trên: `226.000 × 2 = 452.000`.

---

## Bước 3 — Tạm tính (lines subtotal)

```
tạm tính = tổng tất cả line total
```

---

## Bước 4 — Giảm combo (nếu thuộc gói bundle)

```
combo discount = tổng giảm của các line thuộc combo
```
Đơn lẻ (không combo) thì = **0**. (Combo/bundle tính ở mức line, vd "Combo Gia Đình −30%".)

---

## Bước 5 — Voucher (mã giảm giá)

Trước khi tính, kiểm tra voucher **có áp dụng được** không:
- còn **active** + trong thời hạn (`validFrom` → `validTo`)
- đơn **đạt mức tối thiểu** `minOrder` (vd ≥ 200k)
- đúng **kênh** (nếu voucher quy định: delivery/pickup/dine-in)
- **chưa hết lượt** dùng (`usedCount < usageLimit`)

Nếu áp dụng được, tính tiền giảm theo **loại**:

| Loại voucher | Tiền giảm |
|---|---|
| `percent` (% đơn) | `tạm tính × value%`, nhưng **không vượt** `maxDiscount` (cap) |
| `fixed` (tiền mặt) | `value`, nhưng **không vượt** tạm tính |
| `free_shipping` | không trừ tiền hàng — chỉ **miễn phí ship** (xem Bước 6) |
| `bogo` / `bundle` | xử lý riêng ở line (không trừ ở đây) |

Ví dụ — voucher **PIZZA30** (30%, cap 150k) cho tạm tính 452.000:
```
30% × 452.000 = 135.600   (< cap 150.000 → giữ nguyên)
→ voucher discount = 135.600
```
Nếu tạm tính là 600.000: `30% × 600.000 = 180.000` → **capped 150.000**.

---

## Bước 6 — Phí giao hàng

```
phí ship = 0                           nếu pickup / dine-in
        = phí theo zone                nếu delivery
        = 0                            nếu delivery CÓ voucher free_shipping
```
Ví dụ delivery zone phí **25.000** → phí ship = 25.000. (Có `FREESHIP` → 0.)

---

## Bước 7 — VAT (thuế)

VAT tính trên **tiền hàng sau giảm** (tạm tính − combo − voucher), **không** gồm phí ship:

```
sau_giảm = max(0, tạm tính − combo − voucher)
VAT = round(sau_giảm × taxRate)        // taxRate thường 0.08
```

---

## Bước 8 — Đổi điểm loyalty (nếu khách chọn)

```
tiền giảm điểm = điểm_đổi × 20        // 1 điểm = 20đ
              (không vượt sau_giảm)
```

> Hằng số `REDEEM_VND_PER_POINT = 20`. (Có thể move sang settings sau.)

---

## Bước 9 — TỔNG CỘNG (grand total)

```
TỔNG = tạm tính
      − combo
      − voucher
      − điểm
      + phí ship
      + VAT
      (floor = 0, không bao giờ âm)
```

---

## Bước 10 — Điểm tích lũy (khách được thêm)

```
điểm tích lũy = floor(TỔNG / 10.000)   // tiêu 10k → được 1 điểm
```

---

## ✅ Ví dụ trọn vẹn (đã verify)

**Đơn:** Giao tận nơi · **2× Pepperoni size M** + Extra Cheese + Bacon · voucher **PIZZA30** · VAT 8% · phí ship zone 25.000.

| Bước | Tính | Kết quả |
|---|---|---|
| 1. Đơn giá | 189.000 + 15.000 + 22.000 | **226.000** |
| 2. Line total | 226.000 × 2 | **452.000** |
| 3. Tạm tính | | **452.000** |
| 4. Combo | — | 0 |
| 5. Voucher PIZZA30 | 30% × 452.000 (≤ cap 150k) | **−135.600** |
| 6. Phí ship | delivery, không free ship | **+25.000** |
| 7. VAT | (452.000 − 135.600) × 8% = 316.400 × 8% | **+25.312** |
| 8. Điểm | (không đổi) | 0 |
| 9. **TỔNG** | 452.000 − 135.600 + 25.000 + 25.312 | **= 366.712** |
| 10. Điểm tích lũy | floor(366.712 / 10.000) | **36 điểm** |

→ Khách trả **366.712đ**, được **36 điểm**.

---

## Công thức rút gọn

```
unitPrice    = variant.price + Σ topping.priceBySize[size]
lineTotal    = unitPrice × qty
subtotal     = Σ lineTotal
afterCombo   = subtotal − comboDiscount
voucher      = áp dụng trên afterCombo (theo loại + cap + điều kiện)
ship         = (delivery && !freeship) ? zoneFee : 0
taxable      = max(0, afterCombo − voucher)
VAT          = round(taxable × 0.08)
loyalty      = min(points × 20, taxable)
GRAND_TOTAL  = max(0, afterCombo − voucher − loyalty + ship + VAT)
pointsToEarn = floor(GRAND_TOTAL / 10000)
```

---

## Bonus — Hoàn tiền khi hủy (refund fraction)

Khi hủy đơn, **% hoàn tiền** tùy giai đoạn (logic ở `lib/orders/state-machine.ts`):

| Trạng thái khi hủy | Hoàn lại |
|---|---|
| `created` / `confirmed` (chưa làm) | **100%** |
| `preparing` / `ready` / `ready_for_pickup` / `assigned_driver` | **50%** |
| `out_for_delivery` trở đi | **0%** |

```
số tiền hoàn = GRAND_TOTAL × refundFraction
```

> Trạng thái chuyển theo **máy trạng thái**, khác theo kênh (delivery/pickup/dine-in) — xem [PROJECT_DESIGN §7](./PROJECT_DESIGN.md).
