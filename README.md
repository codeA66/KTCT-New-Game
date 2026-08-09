<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/pie-chart.svg" width="80" alt="Logo">
  
  # The Macro-Pie 🥧
  
  **Hệ Thống Mô Phỏng Quyết Sách Kinh Tế Vĩ Mô (Strategic Policy Simulator)**
  
  <p align="center">
    <a href="https://developer.mozilla.org/en-US/docs/Web/HTML"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/CSS"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"></a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS"></a>
    <a href="https://lucide.dev/"><img src="https://img.shields.io/badge/Lucide_Icons-F87171?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide Icons"></a>
  </p>
</div>

---

## 🎯 Giới Thiệu
**The Macro-Pie** là một tựa game nền web mô phỏng công việc hoạch định và điều hành chính sách vĩ mô. Người chơi sẽ vào vai một "Kiến trúc sư trưởng", phải đối mặt với các hồ sơ trình duyệt hàng ngày và đưa ra quyết định ảnh hưởng trực tiếp đến 3 chỉ số cốt lõi của nền kinh tế:
- 📈 **Động lực Thị trường (Market Dynamics)**
- ⚖️ **Công bằng Xã hội (Social Equity)**
- 🏛️ **Kỷ cương Thể chế (Institutional Discipline)**

Mục tiêu của bạn là giữ cho cả 3 chỉ số này luôn ở mức **cân bằng**. Nếu bất kỳ chỉ số nào chạm đáy (0) hoặc vượt rào (100), hệ thống sẽ sụp đổ và trò chơi kết thúc.

## ✨ Điểm Nổi Bật
- **Giao diện "Vibrant High-tech Console"**: Trải nghiệm cảm giác như đang điều khiển một bảng máy tính chiến lược cấp cao với hiệu ứng Neon, mặt kính nổi (Glassmorphism 3D) và hệ thống ánh sáng chuyển màu theo thời gian thực (Sáng / Trưa / Tối).
- **Hệ thống Hồ sơ Đa dạng**: Hàng chục tình huống chính sách chân thực, từ tư nhân hóa y tế, thuế tài sản, đến kiểm soát độc quyền công nghệ.
- **Tính năng Tham vấn (Advisor)**: Nếu gặp khó khăn trước khi ký một đạo luật, bạn có thể tham vấn các bộ ban ngành để xem trước dự báo tác động.
- **Phân bổ Ngân sách (Evening Phase)**: Vào cuối ngày, bạn phải sử dụng nguồn ngân sách giới hạn để cứu trợ các chỉ số đang ở mức nguy hiểm.
- **Responsive 100%**: Giao diện được tối ưu hóa cực tốt, hoạt động mượt mà trên cả Laptop màn hình rộng lẫn các thiết bị Mobile.

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy
Dự án được xây dựng hoàn toàn bằng **Vanilla HTML/CSS/JS** nguyên bản, không cần Node.js, không qua build tools phức tạp. Bạn có thể chạy ngay lập tức.

### Cách 1: Chạy trực tiếp (Khuyên dùng Live Server)
1. Clone dự án về máy:
```bash
git clone https://github.com/codeA66/KTCT-New-Game.git
```
2. Mở thư mục dự án bằng **VS Code**.
3. Cài đặt extension **Live Server** (nếu chưa có).
4. Click chuột phải vào file `index.html` và chọn **"Open with Live Server"**.

### Cách 2: Truy cập file trực tiếp
- Bạn chỉ cần mở file `index.html` trực tiếp bằng bất kỳ trình duyệt web hiện đại nào (Chrome, Edge, Safari, Firefox).

## 🎮 Cách Chơi
1. **Buổi Sáng (Điểm Báo):** Xem báo cáo hệ quả từ các quyết định ngày hôm trước. Hệ quả sẽ cộng dồn vào các thanh trạng thái.
2. **Buổi Trưa (Phê Duyệt):** Lần lượt xử lý 3 hồ sơ chính sách mỗi ngày. Với mỗi hồ sơ, bạn có 3 lựa chọn:
   - `Duyệt`: Chấp thuận chính sách (sẽ có lợi cho phe này, hại phe kia).
   - `Bác bỏ`: Hủy bỏ chính sách.
   - `Tham vấn`: Xem trước nhận định từ các cố vấn chuyên môn.
3. **Buổi Tối (Cân Bằng):** Nếu có chỉ số nào đang ở mức nguy kịch, hãy dùng quỹ điểm dự phòng để cộng thêm vào đó nhằm kéo dài tuổi thọ của nhiệm kỳ.
4. **Game Over:** Trò chơi kết thúc khi một chỉ số chạm mốc `0` hoặc `100`. Hãy cố gắng tại vị càng lâu càng tốt!

## 🛠️ Công Nghệ & Thiết Kế Kiến Trúc
- **HTML5 Semantic**: Cấu trúc phân lớp rõ ràng.
- **CSS3 Variables & Animations**: Hệ thống biến màu sắc Design Tokens. Hiệu ứng *Stamp Slam*, *Glassmorphism Inner Shadow*, *Gradient Text* được tối ưu hóa bằng CSS Thuần.
- **Vanilla JavaScript**: Quản lý Game State, logic vòng lặp sự kiện, thao tác DOM tự động không cần Framework, tối đa hóa hiệu năng (Performance).
- **Iconography**: Trích xuất hoàn toàn Emojis thay bằng thư viện **Lucide SVG Icons** qua CDN, cho chất lượng sắc nét tuyệt đối trên mọi độ phân giải.

---
<div align="center">
  <i>Được phát triển với niềm đam mê chiến lược và kiến trúc vĩ mô.</i>
</div>