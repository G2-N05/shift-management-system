# Đặc Tả Các Tính Năng Cốt Lõi (Core Features) - Tuần 8

Tài liệu này đặc tả chi tiết toàn bộ các tính năng cốt lõi được xây dựng trong **Hệ thống Quản lý Nhân sự Theo Ca**, ánh xạ trực tiếp từ các use case và yêu cầu chức năng (FR) sang các thành phần cụ thể trong mã nguồn thực tế.

---

## 1. Xác thực & Phân quyền (Authentication & Authorization)
*   **Mô tả**: Cho phép người dùng đăng nhập hệ thống bằng tên đăng nhập và mật khẩu, cấp Token xác thực JWT để bảo mật các yêu cầu API tiếp theo, và phân quyền truy cập theo 3 vai trò: `admin`, `manager`, và `employee`.
*   **Tác nhân liên quan (Actor)**: `Admin`, `Manager`, `Employee`
*   **Use Cases liên quan**: `UC-01`
*   **Services xử lý**: `AuthService`, `UserService`
*   **Repositories tương tác**: `UserRepository`
*   **Thực thể dữ liệu (Entities)**: `User`
*   **Các Endpoint API**:
    *   `POST /api/auth/login` (Đăng nhập)
    *   `GET /api/users/me` (Lấy thông tin tài khoản hiện tại)
*   **Màn hình giao diện**: Màn hình Đăng nhập (Login Screen)

---

## 2. Quản lý Nhân viên (User Management)
*   **Mô tả**: Cho phép Admin thực hiện các tác vụ CRUD thông tin nhân viên, thiết lập các chỉ số sức khỏe khởi điểm (`EnergyScore = 100`), cấp độ kỹ năng (`SkillLevel`), mức lương cơ bản (`BaseHourlyRate`), và giới hạn giờ làm việc tối đa trong tuần (`MaxWeeklyHours`).
*   **Tác nhân liên quan (Actor)**: `Admin`
*   **Use Cases liên quan**: `UC-02`
*   **Services xử lý**: `UserService`
*   **Repositories tương tác**: `UserRepository`
*   **Thực thể dữ liệu (Entities)**: `User`
*   **Các Endpoint API**:
    *   `GET /api/users` (Xem danh sách người dùng)
    *   `POST /api/users` (Tạo mới nhân viên)
    *   `PUT /api/users/:id` (Cập nhật thông tin nhân viên)
    *   `DELETE /api/users/:id` (Xóa nhân viên)
*   **Màn hình giao diện**: Màn hình Quản lý Nhân viên (User Management Screen)

---

## 3. Quản lý ca trực & Nhiệm vụ (Shift & Task Management)
*   **Mô tả**: Cho phép quản lý tạo các nhiệm vụ cần thực thi tại một địa điểm (`Location`) đi kèm thời gian thực hiện, định biên nhân sự (`Headcount`), mô hình xếp lịch (`Sequential/Parallel`), mức độ khẩn cấp (`UrgencyLevel`), và theo dõi các ca làm việc thực tế (`Shift`) được tạo ra tương ứng.
*   **Tác nhân liên quan (Actor)**: `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-04`, `UC-08`, `UC-10`
*   **Services xử lý**: `TaskService`, `ShiftService`
*   **Repositories tương tác**: `TaskRepository`, `ShiftRepository`
*   **Thực thể dữ liệu (Entities)**: `Task`, `Shift`, `Location`
*   **Các Endpoint API**:
    *   `GET /api/tasks` / `POST /api/tasks` / `PUT /api/tasks/:id` / `DELETE /api/tasks/:id`
    *   `GET /api/shifts` / `POST /api/shifts` / `PUT /api/shifts/:id` / `DELETE /api/shifts/:id`
*   **Màn hình giao diện**: Màn hình Quản lý Nhiệm vụ & Sinh lịch (Task & Auto Scheduling Screen)

---

## 4. Thiết lập Ràng buộc Hệ thống (System Settings)
*   **Mô tả**: Cho phép thiết lập các ngưỡng ràng buộc và tham chiếu chung của toàn hệ thống phục vụ thuật toán Rule Engine như: thời gian nghỉ tối thiểu giữa 2 ca (mặc định 11.0h), số giờ ca làm tối đa, giờ bắt đầu/kết thúc ca sáng/chiều, các ngưỡng điểm sức khỏe yếu/trung bình.
*   **Tác nhân liên quan (Actor)**: `Admin`, `Manager`
*   **Use Cases liên quan**: `UC-05`
*   **Services xử lý**: `SettingService`
*   **Repositories tương tác**: `SettingRepository`
*   **Thực thể dữ liệu (Entities)**: `SystemSetting`
*   **Các Endpoint API**:
    *   `GET /api/settings` (Lấy cấu hình hệ thống)
    *   `PUT /api/settings` (Cập nhật cấu hình hệ thống)
*   **Màn hình giao diện**: Bảng cấu hình hệ thống trong Bảng điều khiển Quản trị (Dashboard Screen)

---

## 5. Sinh lịch tự động dựa trên Rule Engine (Auto-Scheduling & Rule Engine)
*   **Mô tả**: Tự động tạo ca trực và phân bổ nhân sự phù hợp cho các nhiệm vụ chưa phân bổ dựa trên kiểm tra ràng buộc cứng (tránh trùng ca, nghỉ ngơi 11 giờ, giới hạn giờ làm tối đa trong tuần) và ràng buộc mềm sức khỏe (giới hạn số ca dựa trên điểm Energy Score của nhân viên).
*   **Tác nhân liên quan (Actor)**: `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-07`
*   **Services xử lý**: `TaskService` (thuật toán chính `AutoScheduleShifts` và `ReScheduleShifts`), `RuleEngine` (kiểm tra luật)
*   **Repositories tương tác**: `TaskRepository`, `UserRepository`, `ShiftRepository`, `SettingRepository`
*   **Thực thể dữ liệu (Entities)**: `Task`, `Shift`, `User`, `SystemSetting`
*   **Các Endpoint API**:
    *   `POST /api/tasks/auto-schedule` (Kích hoạt sinh lịch tự động)
    *   `POST /api/tasks/re-schedule` (Sinh lại toàn bộ lịch từ đầu)
*   **Màn hình giao diện**: Màn hình Quản lý Nhiệm vụ & Sinh lịch (Task & Auto Scheduling Screen)

---

## 6. Đổi ca thông minh (Smart Shift Swapping & Auto-Swap)
*   **Mô tả**: Cho phép nhân viên gửi yêu cầu đổi ca làm việc. Hệ thống sẽ tự động đề xuất và gửi lời mời đến đồng nghiệp phù hợp (Auto-Swap) dựa trên Rule Engine. Nếu không tìm được đồng nghiệp rảnh rỗi, hệ thống chuyển sang trạng thái chờ Admin chỉ định đổi ca thủ công (Assign Swap).
*   **Tác nhân liên quan (Actor)**: `Employee`, `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-09`, `UC-14`
*   **Services xử lý**: `ShiftSwapService`
*   **Repositories tương tác**: `ShiftSwapRepository`, `ShiftRepository`, `UserRepository`, `SettingRepository`
*   **Thực thể dữ liệu (Entities)**: `ShiftSwap`, `Shift`, `User`
*   **Các Endpoint API**:
    *   `GET /api/swaps` / `POST /api/swaps` / `GET /api/swaps/me/pending`
    *   `POST /api/swaps/:id/approve` (Phê duyệt đổi ca)
    *   `POST /api/swaps/:id/reject` (Từ chối đổi ca)
    *   `POST /api/swaps/:id/assign` (Chỉ định ca đổi thủ công)
    *   `POST /api/swaps/auto` (Tự động đổi ca)
*   **Màn hình giao diện**: Màn hình Đổi ca thông minh (Smart Shift Swap Screen)

---

## 7. Chấm công Vào/Ra ca (Clock-In / Clock-Out)
*   **Mô tả**: Cho phép nhân viên thực hiện ghi nhận thời gian chấm công khi bắt đầu (`Clock-In`) và kết thúc (`Clock-Out`) ca trực thực tế để lưu vết và làm căn cứ tính toán tổng giờ làm việc thực nhận cuối tháng.
*   **Tác nhân liên quan (Actor)**: `Employee`
*   **Use Cases liên quan**: `UC-19`, `UC-20`
*   **Services xử lý**: `ShiftService` (`ClockIn`, `ClockOut`)
*   **Repositories tương tác**: `ShiftRepository`
*   **Thực thể dữ liệu (Entities)**: `Shift`
*   **Các Endpoint API**:
    *   `POST /api/shifts/:id/clock-in` (Chấm công vào ca)
    *   `POST /api/shifts/:id/clock-out` (Chấm công ra ca)
*   **Màn hình giao diện**: Bảng lịch biểu cá nhân (Employee Dashboard Screen)

---

## 8. Khai báo & Duyệt sức khỏe tích hợp AI (AI Health Declaration & Approval)
*   **Mô tả**: Nhân viên khai báo tình trạng bệnh lý kèm ảnh minh chứng. Hệ thống tự động gọi API FastAPI NLP Service để tính độ tương đồng ngữ nghĩa tiếng Việt và đề xuất điểm trừ năng lượng tương ứng. Admin duyệt tờ khai để khấu trừ điểm Energy Score của nhân viên.
*   **Tác nhân liên quan (Actor)**: `Employee`, `Admin`
*   **Use Cases liên quan**: `UC-16`, `UC-17`, `UC-18`
*   **Services xử lý**: `HealthService`
*   **Repositories tương tác**: `db *gorm.DB` trực tiếp, `UserRepository` (cập nhật điểm số)
*   **Thực thể dữ liệu (Entities)**: `HealthDeclaration`, `KnownCondition`, `User`
*   **Các Endpoint API**:
    *   `POST /api/health` (Gửi khai báo sức khỏe)
    *   `GET /api/health/pending` (Xem danh sách đơn chờ duyệt)
    *   `POST /api/health/:id/approve` / `POST /api/health/:id/reject` (Phê duyệt / Từ chối đơn)
    *   `GET /api/health/ai-suggest` (Gợi ý điểm trừ sức khỏe từ AI NLP)
    *   `GET /api/health/conditions` / `PUT /api/health/conditions/:id` (Cấu hình danh mục bệnh)
*   **Màn hình giao diện**: Màn hình Quản lý & Duyệt sức khỏe AI (Health Declaration & AI Approval Screen)

---

## 9. Điều phối ca làm việc thiếu người (Understaffed Shift Coordination)
*   **Mô tả**: Tự động phát hiện các nhiệm vụ thiếu nhân sự do không được phân bổ đủ hoặc do nhân viên nghỉ phép đột xuất, sinh đề xuất điều phối thông minh (tìm người thay thế rảnh rỗi, đề xuất làm thêm giờ, hoặc dời lịch thực thi nhiệm vụ) và áp dụng cấu hình đã duyệt.
*   **Tác nhân liên quan (Actor)**: `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-21`, `UC-22`
*   **Services xử lý**: `CoordinationService`
*   **Repositories tương tác**: `CoordinationRepository`, `TaskRepository`, `ShiftRepository`, `UserRepository`, `SettingRepository`
*   **Thực thể dữ liệu (Entities)**: `CoordinationSuggestion`, `Task`, `Shift`, `User`
*   **Các Endpoint API**:
    *   `GET /api/coordination/understaffed` (Xem danh sách ca thiếu người)
    *   `GET /api/coordination/tasks/:id/suggestions` (Lấy đề xuất điều phối)
    *   `POST /api/coordination/suggestions/:id/approve` (Áp dụng đề xuất đã chọn)
*   **Màn hình giao diện**: Khung cảnh báo và điều phối trên Bảng điều khiển Quản trị (Dashboard Screen)

---

## 10. Phân tích kiệt sức & Nhân sự dự phòng (Burnout Analytics & Succession Planning)
*   **Mô tả**: Tính toán chỉ số kiệt sức (Burnout Score) của nhân viên dựa trên khối lượng ca và giờ overtime đã gánh vác, cảnh báo rủi ro kiệt sức và nghỉ việc, đồng thời đề xuất tối đa 3 nhân viên dự phòng có điểm kiệt sức thấp nhất để dự bị thay thế.
*   **Tác nhân liên quan (Actor)**: `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-23`, `UC-24`
*   **Services xử lý**: `AnalyticsService`
*   **Repositories tương tác**: `UserRepository`, `ShiftRepository`
*   **Thực thể dữ liệu (Entities)**: `User`, `Shift`
*   **Các Endpoint API**:
    *   `GET /api/analytics/attrition` (Xem báo cáo rủi ro nghỉ việc)
    *   `GET /api/analytics/backups/:id` (Lấy danh sách nhân sự dự phòng)
*   **Màn hình giao diện**: Menu Báo cáo & Phân tích rủi ro trong Bảng điều khiển Quản trị (Dashboard Screen)

---

## 11. Đánh giá KPI & Tính lương (KPI Grading & Payroll Calculation)
*   **Mô tả**: Cho phép quản lý chấm điểm hiệu năng KPI tháng của nhân viên để tự động sinh hệ số thưởng, từ đó chốt bảng lương tổng hợp (tổng hợp giờ làm thực tế từ chấm công, tính lương cơ bản, cộng thêm lương làm overtime và nhân hệ số KPI).
*   **Tác nhân liên quan (Actor)**: `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-25`, `UC-26`
*   **Services xử lý**: `KPIService`, `PayrollService`
*   **Repositories tương tác**: `db *gorm.DB` trực tiếp, `UserRepository`, `ShiftRepository`
*   **Thực thể dữ liệu (Entities)**: `UserKPI`, `PayrollRecord`, `User`, `Shift`
*   **Các Endpoint API**:
    *   `GET /api/kpis` / `POST /api/kpis` (Chấm điểm KPI)
    *   `GET /api/payroll` / `POST /api/payroll/calculate` (Xem và Tính toán bảng lương)
*   **Màn hình giao diện**: Màn hình Chấm Lương & Đánh giá hiệu suất KPI (Payroll & KPI Screen)

---

## 12. Yêu cầu & Phê duyệt nghỉ phép (Time-Off Requests)
*   **Mô tả**: Cho phép nhân viên nộp đơn xin nghỉ phép trong một khoảng thời gian xác định. Admin duyệt đơn xin nghỉ phép thành công sẽ tự động hủy các ca làm việc bị đè lịch trong thời gian nghỉ và giải phóng trạng thái nhiệm vụ liên quan để lập lịch lại.
*   **Tác nhân liên quan (Actor)**: `Employee`, `Admin`
*   **Use Cases liên quan**: `UC-27`, `UC-28`
*   **Services xử lý**: `TimeOffService`
*   **Repositories tương tác**: `db *gorm.DB` trực tiếp, `ShiftRepository` (để hủy ca trực)
*   **Thực thể dữ liệu (Entities)**: `TimeOffRequest`, `Shift`, `User`
*   **Các Endpoint API**:
    *   `POST /api/time-off` (Gửi đơn xin nghỉ phép)
    *   `GET /api/time-off/my` (Xem đơn cá nhân)
    *   `GET /api/time-off/pending` (Xem đơn chờ duyệt)
    *   `POST /api/time-off/:id/approve` (Duyệt đơn nghỉ phép)
    *   `POST /api/time-off/:id/reject` (Từ chối đơn nghỉ phép)
*   **Màn hình giao diện**: Màn hình Quản lý & Duyệt nghỉ phép (Time-Off Request Screen)

---

## 13. Import/Export dữ liệu qua CSV (CSV Import/Export)
*   **Mô tả**: Cho phép tải xuống tệp CSV mẫu và thực hiện nhập danh sách nhân viên/ca làm việc hàng loạt từ tệp CSV vào hệ thống, hoặc xuất toàn bộ dữ liệu lịch trực trong tháng ra tệp CSV báo cáo.
*   **Tác nhân liên quan (Actor)**: `Admin`, `Manager`
*   **Use Cases liên quan**: `UC-29`
*   **Services xử lý**: `DataService`
*   **Repositories tương tác**: `db *gorm.DB` trực tiếp
*   **Thực thể dữ liệu (Entities)**: `User`, `Shift`
*   **Các Endpoint API**:
    *   `GET /api/users/sample-csv` / `GET /api/data/shifts/sample-csv` (Lấy file CSV mẫu)
    *   `GET /api/data/export/shifts` (Xuất lịch làm việc ra CSV)
    *   `POST /api/data/import/users` / `POST /api/data/import/shifts` (Nhập dữ liệu từ CSV)
*   **Màn hình giao diện**: Tab Nhập/Xuất trong Màn hình Quản lý Nhân viên / Lịch trực

---

## 14. Hệ thống Thông báo (Notification Center)
*   **Mô tả**: Tạo các thông báo thời gian thực khi có các sự kiện quan trọng trong hệ thống (đổi ca làm việc, nộp đơn nghỉ phép, ca làm việc bị cảnh báo thiếu nhân sự), và quản lý trạng thái đã đọc của người nhận.
*   **Tác nhân liên quan (Actor)**: `Employee`, `Manager`, `Admin`
*   **Use Cases liên quan**: `UC-15`
*   **Services xử lý**: `NotificationService`
*   **Repositories tương tác**: `db *gorm.DB` trực tiếp
*   **Thực thể dữ liệu (Entities)**: `Notification`
*   **Các Endpoint API**:
    *   `GET /api/notifications` (Lấy danh sách thông báo)
    *   `PUT /api/notifications/:id/read` (Đánh dấu đã đọc)
*   **Màn hình giao diện**: Biểu tượng Chuông thông báo (Notification Bell) ở header màn hình
