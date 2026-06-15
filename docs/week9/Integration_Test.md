# Kế Hoạch & Nhật Ký Kiểm Thử Tích Hợp (Integration Test Log) - Tuần 9

Tài liệu này đặc tả chi tiết kế hoạch kiểm thử tích hợp (Integration Testing) và ghi nhận kết quả thực tế của các luồng nghiệp vụ liên thông giữa các cấu phần trong hệ thống.

---

## Bảng Tổng Hợp Kết Quả Kiểm Thử Tích Hợp (Integration Test Summary Table)

| Test ID | Scenario | Components | Expected Result | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| `IT-01` | Đăng nhập & Cấp JWT (Login) | React/Flutter UI → `POST /api/auth/login` → `AuthService` → `UserRepository` → SQLite | HTTP 200 + JWT Token, redirect Dashboard | HTTP 200 OK, JWT returned, redirect success | **PASS** |
| `IT-02` | Tạo ca trực thủ công (Create Shift) | React Web UI → AuthMiddleware → `POST /api/shifts` → `ShiftService` → `ShiftRepository` → SQLite | HTTP 201/200, Shift record created with status `scheduled` | HTTP 200 OK, record created in shifts table | **PASS** |
| `IT-03` | Sinh lịch tự động (Auto Scheduling) | React Web UI → `POST /api/tasks/auto-schedule` → `TaskService` → `RuleEngine` → Repositories → SQLite | HTTP 200, shifts generated, `Task.IsAssigned = true` | HTTP 200 OK, schedule statistics returned, DB updated | **PASS** |
| `IT-04` | Gửi tờ khai sức khỏe (Health Declaration) | Flutter App → `POST /api/health` → `HealthService` → SQLite | HTTP 201, image saved in `uploads/`, declaration stored with status `pending` | HTTP 200 OK, image saved, declaration stored | **PASS** |
| `IT-05` | Phân tích bệnh bằng AI NLP (NLP Analysis) | React Web → `GET /api/health/ai-suggest` → `HealthService` → FastAPI NLP (Port 8000) → SQLite | HTTP 200, SuggestedPoints value returned from NLP service | HTTP 200 OK, SuggestedPoints from FastAPI returned | **PASS** |
| `IT-06` | Chấm công vào ca (Clock In) | Flutter/Web → `POST /api/shifts/:id/clock-in` → `ShiftService` → `ShiftRepository` → SQLite | HTTP 200, `ClockInTime` recorded, `Status = "in_progress"` | HTTP 200 OK, Shift updated to in_progress | **PASS** |
| `IT-07` | Chấm công ra ca (Clock Out) | Flutter/Web → `POST /api/shifts/:id/clock-out` → `ShiftService` → `ShiftRepository` → SQLite | HTTP 200, `ClockOutTime` recorded, `Status = "completed"` | HTTP 200 OK, Shift updated to completed | **PASS** |
| `IT-08` | Tính lương tháng & KPI (Payroll Calculation) | React Web → `POST /api/payroll/calculate` → `PayrollService` → DB (User/Shift/KPI) → SQLite | HTTP 200, payroll records generated with correct totals | HTTP 200 OK, payroll records generated in database | **PASS** |
| `IT-09` | Duyệt đơn nghỉ & xóa ca đè lịch (Time Off Request) | Mobile/Web → `POST /api/time-off/:id/approve` → `TimeOffService` → `ShiftRepository` → SQLite | HTTP 200, status `approved`, overlapping shifts removed | HTTP 200 OK, request approved, overlapping shifts removed | **PASS** |
| `IT-10` | Gửi nhận thông báo thời gian thực (Notification Delivery) | Backend Event → `NotificationService` → SQLite → `GET /api/notifications` → Client UI | Notification stored in DB, fetched with unread count on client | HTTP 200 OK, notification created and fetched successfully | **PASS** |

**Tổng kết**: `10/10` kịch bản đạt trạng thái **PASS** — Tỷ lệ thành công **100%**.

---

## Danh sách Kịch bản Kiểm thử Tích hợp (Integration Test Scenarios)

### IT-01: Đăng nhập hệ thống & Cấp JWT (Login Integration)
*   **Mã Kịch Bản**: `IT-01`
*   **Cấu phần tham gia (Components involved)**: React/Flutter Client UI $\rightarrow$ API Route `/api/auth/login` $\rightarrow$ `AuthService` $\rightarrow$ `UserRepository` $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Nhân viên đã có tài khoản được khởi tạo trong SQLite DB với mật khẩu được mã hóa Bcrypt.
*   **Các bước thực hiện (Test steps)**:
    1.  Trên UI, nhập Username `admin` và Password `admin`.
    2.  Nhấn nút "Đăng nhập".
    3.  Client UI gửi yêu cầu HTTP POST đến Server API.
    4.  Server API truy vấn tài khoản, so khớp mật khẩu và phản hồi.
*   **Kết quả kỳ vọng (Expected result)**: HTTP status code phản hồi `200 OK`, đính kèm chuỗi ký Token JWT. Client UI lưu thành công Token này vào Local Storage/Secure Storage và chuyển hướng sang Dashboard.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK + JWT Token returned, redirect success).

---

### IT-02: Tạo ca trực thủ công (Create Shift Manual Integration)
*   **Mã Kịch Bản**: `IT-02`
*   **Cấu phần tham gia (Components involved)**: React Admin Web UI $\rightarrow$ AuthMiddleware $\rightarrow$ API Route `POST /api/shifts` $\rightarrow$ `ShiftService` $\rightarrow$ `ShiftRepository` $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Admin/Manager đã đăng nhập thành công và đính kèm JWT hợp lệ trong request header. Đã tồn tại User và Location trong DB.
*   **Các bước thực hiện (Test steps)**:
    1.  Vào giao diện lập lịch trực, chọn User ID = 2, Location ID = 1, điền thời gian bắt đầu và kết thúc ca làm.
    2.  Nhấn "Tạo ca làm".
    3.  Yêu cầu POST chứa dữ liệu Shift được gửi đến API.
*   **Kết quả kỳ vọng (Expected result)**: Phản hồi `201 Created` hoặc `200 OK`. Một dòng bản ghi Shift mới với trạng thái `scheduled` được ghi thành công vào bảng `shifts` của SQLite DB.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, record created in shifts table).

---

### IT-03: Chạy sinh lịch tự động (Auto Scheduling Integration)
*   **Mã Kịch Bản**: `IT-03`
*   **Cấu phần tham gia (Components involved)**: React Web UI $\rightarrow$ API Route `POST /api/tasks/auto-schedule` $\rightarrow$ `TaskService` $\rightarrow$ `RuleEngine` $\rightarrow$ Repositories (Task/Shift/User/Setting) $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Đã cấu hình SystemSetting, có danh sách nhân sự (User) và các nhiệm vụ (Task) đang ở trạng thái chưa phân công (`IsAssigned = false`).
*   **Các bước thực hiện (Test steps)**:
    1.  Manager nhấn nút "Auto-Schedule" trên Web UI.
    2.  Yêu cầu API kích hoạt thuật toán sinh ca làm việc tuần tự/song song được gửi đi.
    3.  `TaskService` tải dữ liệu, chạy `RuleEngine` để lọc và chấm điểm ứng viên, sau đó lưu các ca trực nháp thích hợp.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Báo cáo phản hồi trả về số lượng ca làm việc đã được tạo nháp thành công. Trạng thái `Task.IsAssigned` đổi sang `true` trong DB SQLite.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK with schedule statistics, database successfully updated).

---

### IT-04: Gửi tờ khai báo sức khỏe (Health Declaration Integration)
*   **Mã Kịch Bản**: `IT-04`
*   **Cấu phần tham gia (Components involved)**: Flutter Mobile App $\rightarrow$ API Route `POST /api/health` $\rightarrow$ `HealthService` $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Nhân viên đã đăng nhập trên ứng dụng di động. Thiết bị di động có kết nối mạng và tệp ảnh minh chứng y khoa hợp lệ.
*   **Các bước thực hiện (Test steps)**:
    1.  Nhân viên nhập tình trạng bệnh lý *"Tôi bị sốt xuất huyết nặng"*.
    2.  Chụp/chọn tệp hình ảnh minh chứng.
    3.  Nhấn nút "Gửi tờ khai" (yêu cầu Multipart-Form).
*   **Kết quả kỳ vọng (Expected result)**: HTTP `201 Created` hoặc `200 OK`. Tệp ảnh được tải lên và lưu trữ thành công vào thư mục `uploads/` trên server. Bản ghi tờ khai được ghi vào bảng `health_declarations` với trạng thái `pending`.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, image saved in uploads directory, declaration stored).

---

### IT-05: Phân tích so khớp bệnh tự động bằng AI NLP (AI NLP Analysis Integration)
*   **Mã Kịch Bản**: `IT-05`
*   **Cấu phần tham gia (Components involved)**: React Web UI (Admin Approve Page) $\rightarrow$ API Route `GET /api/health/ai-suggest` $\rightarrow$ `HealthService` $\rightarrow$ HTTP REST call $\rightarrow$ FastAPI NLP Service (Port 8000) $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Đã khởi chạy dịch vụ FastAPI NLP độc lập. Có đơn khai báo sức khỏe của nhân viên đang ở trạng thái `pending`.
*   **Các bước thực hiện (Test steps)**:
    1.  Admin truy cập vào chi tiết đơn sức khỏe của nhân sự trên giao diện duyệt.
    2.  Giao diện gửi request API đến endpoint `/api/health/ai-suggest?condition=...` để xin ý kiến gợi ý điểm trừ của AI.
    3.  `HealthService` gửi POST request đến `/similarity` của Python NLP Service và nhận điểm số tương đồng ngữ nghĩa phản hồi.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Phản hồi trả về chuỗi JSON chứa điểm trừ sức khỏe năng lượng đề xuất (SuggestedPoints) khớp với bệnh trạng được phân tích của nhân viên.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK with SuggestedPoints value from FastAPI NLP service).

---

### IT-06: Chấm công vào ca - Clock-In (Clock-In Integration)
*   **Mã Kịch Bản**: `IT-06`
*   **Cấu phần tham gia (Components involved)**: Flutter Mobile App / Web $\rightarrow$ API Route `POST /api/shifts/:id/clock-in` $\rightarrow$ `ShiftService` $\rightarrow$ `ShiftRepository` $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Nhân viên đăng nhập thành công. Ca làm việc được chỉ định ở trạng thái `scheduled` hoặc `assigned`.
*   **Các bước thực hiện (Test steps)**:
    1.  Nhân viên nhấp nút "Clock In" trên giao diện ca làm việc hiện tại.
    2.  Client gửi yêu cầu POST đến API của server.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Bản ghi Shift được cập nhật: `ClockInTime = time.Now()`, `Status = "in_progress"` trong SQLite DB.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, Shift updated to in_progress with clock-in time).

---

### IT-07: Chấm công ra ca - Clock-Out (Clock-Out Integration)
*   **Mã Kịch Bản**: `IT-07`
*   **Cấu phần tham gia (Components involved)**: Flutter Mobile App / Web $\rightarrow$ API Route `POST /api/shifts/:id/clock-out` $\rightarrow$ `ShiftService` $\rightarrow$ `ShiftRepository` $\rightarrow$ SQLite DB.
*   **Tiền điều kiện (Preconditions)**: Ca làm việc của nhân viên đang ở trạng thái `in_progress` (đã Clock-in thành công).
*   **Các bước thực hiện (Test steps)**:
    1.  Nhân viên nhấp nút "Clock Out" trên giao diện ca làm việc khi hết giờ.
    2.  Client gửi yêu cầu POST đến API.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Bản ghi Shift được cập nhật: `ClockOutTime = time.Now()`, `Status = "completed"`. Hệ thống hoàn thành lưu vết tính giờ trực.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, Shift updated to completed with clock-out time).

---

### IT-08: Tính lương tháng & KPI (Payroll Calculation Integration)
*   **Mã Kịch Bản**: `IT-08`
*   **Cấu phần tham gia (Components involved)**: React Admin Web UI $\rightarrow$ API Route `POST /api/payroll/calculate` $\rightarrow$ `PayrollService` $\rightarrow$ DB (truy vấn tổng hợp User, Shift, KPI) $\rightarrow$ SQLite DB (ghi mới PayrollRecord).
*   **Tiền điều kiện (Preconditions)**: Admin đã đăng nhập thành công. Đã cấu hình và lưu điểm KPI tháng cho nhân viên. Đã có dữ liệu chấm công hoàn thành các ca làm trong tháng.
*   **Các bước thực hiện (Test steps)**:
    1.  Admin truy cập trang tính lương, chọn Tháng, Năm và nhấn "Calculate Payroll".
    2.  Yêu cầu POST chứa tham số kỳ lương được gửi đến API.
    3.  `PayrollService` quét dữ liệu, tính tổng giờ chấm công, nhân đơn giá, cộng thưởng KPI và lưu vết.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Trả về danh sách chi tiết bảng lương của các nhân sự. Một bản ghi `payroll_records` tương ứng được lưu trong SQLite DB.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, payroll records generated in database).

---

### IT-09: Gửi đơn xin nghỉ phép & Xóa ca đè lịch (Time-Off Integration)
*   **Mã Kịch Bản**: `IT-09`
*   **Cấu phần tham gia (Components involved)**: Mobile/Web UI $\rightarrow$ API Route `POST /api/time-off/:id/approve` $\rightarrow$ `TimeOffService` $\rightarrow$ `ShiftRepository` $\rightarrow$ SQLite DB (hủy ca trực).
*   **Tiền điều kiện (Preconditions)**: Nhân sự đã gửi đơn xin nghỉ phép trạng thái `pending`. Đã tồn tại các ca làm việc xếp lịch trùng khung giờ xin nghỉ phép của nhân sự đó.
*   **Các bước thực hiện (Test steps)**:
    1.  Admin truy cập danh sách đơn nghỉ phép chờ duyệt, nhấp "Duyệt" (Approve) đơn xin nghỉ phép.
    2.  Yêu cầu API phê duyệt được gửi đi.
    3.  `TimeOffService` cập nhật trạng thái đơn thành `approved`, đồng thời thực hiện quét và xóa bỏ tất cả các ca trực đè giờ của nhân viên.
*   **Kết quả kỳ vọng (Expected result)**: HTTP `200 OK`. Trạng thái đơn đổi sang `approved`. Toàn bộ các ca trực đè lịch bị xóa bỏ (hoặc đổi trạng thái sang `cancelled`) trong SQLite DB.
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, request approved, overlapping shifts removed).

---

### IT-10: Gửi nhận thông báo thời gian thực (Notification Delivery Integration)
*   **Mã Kịch Bản**: `IT-10`
*   **Cấu phần tham gia (Components involved)**: Hệ thống Backend (khi xử lý đổi ca/thiếu người) $\rightarrow$ `NotificationService` $\rightarrow$ SQLite DB $\rightarrow$ API Route `GET /api/notifications` $\rightarrow$ Client UI.
*   **Tiền điều kiện (Preconditions)**: Một hành động kích hoạt thông báo phát sinh (ví dụ: Một nhiệm vụ bị chuyển trạng thái sang `Understaffed` hoặc có yêu cầu đổi ca `ShiftSwap` mới được gửi).
*   **Các bước thực hiện (Test steps)**:
    1.  Kích hoạt hành động tạo thông báo (Ví dụ: Yêu cầu đổi ca được gửi).
    2.  Người dùng nhận truy cập UI để lấy thông báo qua API endpoint `/api/notifications`.
*   **Kết quả kỳ vọng (Expected result)**: Bản ghi thông báo mới được lưu thành công trong DB. Client gọi API lấy thông báo thành công và hiển thị dấu chấm đỏ/số đếm tin nhắn mới trên Biểu tượng chuông thông báo (Notification Bell).
*   **Kết quả thực tế (Actual result)**: **PASS** (HTTP 200 OK, notification created and fetched successfully on client).
