# Kịch Bản Use Case Tuần 2

Tài liệu này chi tiết hóa các bước thực hiện (Step-by-Step) và các quy tắc nghiệp vụ (Business Rules) cho các Use Case trọng tâm của hệ thống Quản lý nhân sự theo ca.

---

## 1. UC-01: Đăng nhập (Login)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Manager, Employee |
| **Mô tả** | Người dùng truy cập hệ thống để làm việc. |
| **Điều kiện tiên quyết** | Tài khoản đã được kích hoạt trong hệ thống. |
| **Luồng chính (Basic Flow)** | 1. Người dùng nhập Username và Password. <br> 2. Hệ thống kiểm tra thông tin đăng nhập. <br> 3. Hệ thống xác thực thành công. <br> 4. Chuyển hướng người dùng vào Dashboard tương ứng với Role. |
| **Luồng ngoại lệ** | **E1: Sai thông tin.** Hệ thống thông báo "Tên đăng nhập hoặc mật khẩu không đúng" và yêu cầu nhập lại. <br> **E2: Tài khoản bị khóa.** Thông báo "Tài khoản của bạn tạm thời bị khóa, vui lòng liên hệ Admin". |
| **Business Rules** | - Mật khẩu phải được mã hóa trước khi so sánh. <br> - Khóa tài khoản sau 5 lần nhập sai liên tiếp. |

---

## 2. UC-02: Quản lý nhân viên (Employee Management)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Manager |
| **Mô tả** | Quản lý thêm, sửa hoặc xóa thông tin hồ sơ nhân viên. |
| **Điều kiện tiên quyết** | Manager đã đăng nhập thành công. |
| **Luồng chính (Basic Flow)** | 1. Manager vào mục "Quản lý nhân viên". <br> 2. Chọn "Thêm nhân viên mới". <br> 3. Nhập các thông tin (Tên, Email, Role, Kỹ năng, Giờ tối đa). <br> 4. Hệ thống kiểm tra email trùng lặp. <br> 5. Lưu thông tin và tạo tài khoản mặc định. |
| **Luồng thay thế** | **A1: Chỉnh sửa.** Manager chọn 1 nhân viên trong danh sách, thay đổi thông tin và nhấn "Lưu". <br> **A2: Xóa.** Manager chọn "Xóa", xác nhận popup, hệ thống thực hiện Soft-delete (ẩn nhân viên). |
| **Business Rules** | - Email phải là duy nhất. <br> - Mật khẩu mặc định được tự động sinh là "123456". <br> - Không được xóa nhân viên đang có ca trực trong kỳ hiện tại. |

---

## 3. UC-06: Tạo kỳ lập lịch (Create Scheduling Period)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Manager |
| **Mô tả** | Thiết lập khoảng thời gian (Tuần/Tháng) để tiến hành phân ca. |
| **Luồng chính (Basic Flow)** | 1. Manager chọn "Tạo kỳ mới". <br> 2. Nhập Tên kỳ (ví dụ: Tháng 5/2026), Ngày bắt đầu, Ngày kết thúc. <br> 3. Hệ thống kiểm tra trùng lặp thời gian với các kỳ cũ. <br> 4. Khởi tạo kỳ ở trạng thái "Bản nháp". |
| **Business Rules** | - Các kỳ lập lịch không được chồng chéo thời gian lên nhau. |

---

## 4. UC-07: Sinh lịch tự động (Auto-scheduling)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Manager, Scheduler Engine |
| **Luồng chính** | 1. Manager mở màn hình lập lịch. <br> 2. Chọn kỳ lập lịch. <br> 3. Nhấn "Sinh lịch". <br> 4. Hệ thống gửi yêu cầu tới Engine. <br> 5. Hiển thị bản nháp kết quả. <br> 6. Manager xác nhận "Lưu". |
| **Business Rules** | - Phải tuân thủ BR-01 (Không trùng ca) và BR-02 (Nghỉ sau ca đêm). <br> - Tổng giờ làm không vượt quá `MaxWeeklyHours` của từng User. |

---

## 5. UC-09: Duyệt đổi ca (Approve Shift Swap)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Manager, Notification Service |
| **Luồng chính** | 1. Manager xem danh sách yêu cầu đổi ca. <br> 2. Nhấn "Phê duyệt" một yêu cầu. <br> 3. Hệ thống cập nhật bảng phân ca. <br> 4. Gửi thông báo cho hai nhân viên liên quan. |
| **Luồng ngoại lệ** | **E1: Vi phạm ràng buộc.** Nếu việc đổi ca khiến nhân viên mới vượt quá 48h/tuần, hệ thống hiển thị cảnh báo và ngăn chặn việc duyệt. |

---

## 6. UC-14: Gửi yêu cầu đổi ca (Request Shift Swap)

| Thuộc tính | Mô tả |
| :--- | :--- |
| **Actor** | Employee |
| **Mô tả** | Nhân viên tự tìm người thay thế và gửi yêu cầu lên Quản lý. |
| **Business Rules** | - Chỉ được đổi ca khi ca đó thuộc về mình và ở trạng thái "Sắp tới" (Future). |