# Nhật Ký Ca Kiểm Thử Đơn Vị (Unit Test Cases) - Tuần 10

Tài liệu này đặc tả chi tiết danh sách 10 ca kiểm thừ đơn vị (Unit Test Cases) kiểm thử các hàm xử lý logic nghiệp vụ, thuật toán lập lịch và các công thức tính toán tài chính trong hệ thống.

---

## Danh sách Ca kiểm thử Đơn vị (Unit Test Cases)

### UT-01: Kiểm tra khớp vai trò (Role Matching Constraint)
*   **Mã Ca Kiểm Thử**: `UT-01`
*   **Tính năng (Feature)**: Ràng buộc vai trò công việc
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `User.Role`: `"employee"`
    *   `requiredRole`: `"manager"`
*   **Kết quả kỳ vọng (Expected output)**: `false` (Nhân viên không thể gánh vác nhiệm vụ yêu cầu vai trò Quản lý).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-02: Kiểm tra yêu cầu kỹ năng tối thiểu (Minimum Skill Constraint)
*   **Mã Ca Kiểm Thử**: `UT-02`
*   **Tính năng (Feature)**: Ràng buộc kỹ năng nghiệp vụ
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `User.SkillLevel`: `1` (Mới vào nghề)
    *   `requiredSkill`: `3` (Yêu cầu lành nghề)
*   **Kết quả kỳ vọng (Expected output)**: `false` (Không cho phép gán người có kỹ năng thấp hơn yêu cầu).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-03: Kiểm tra tránh trùng ca đè giờ (Overlapping Shifts Check)
*   **Mã Ca Kiểm Thử**: `UT-03`
*   **Tính năng (Feature)**: Tránh xung đột thời gian ca trực
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `userShifts`: Danh sách chứa 1 ca trực đã gán: `08:00 - 12:00` (Status: `scheduled`).
    *   Ca làm việc cần kiểm tra: `10:00 - 14:00` cùng ngày.
*   **Kết quả kỳ vọng (Expected output)**: `false` (Ngăn chặn xếp trùng giờ làm việc).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-04: Ràng buộc thời gian nghỉ ngơi tối thiểu giữa 2 ca (11-hour Rest Rule)
*   **Mã Ca Kiểm Thử**: `UT-04`
*   **Tính năng (Feature)**: Thực thi luật nghỉ ngơi 11 giờ
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `MinRestHours`: `11.0`
    *   `userShifts`: Chứa 1 ca làm kết thúc lúc `17:00`.
    *   Ca làm việc cần kiểm tra bắt đầu lúc `22:00` cùng ngày (Khoảng nghỉ thực tế: 5 giờ).
*   **Kết quả kỳ vọng (Expected output)**: `false` (Vi phạm quy định nghỉ tối thiểu 11 giờ).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-05: Kiểm tra giới hạn số giờ làm việc tối đa tuần (Weekly Hours Limit)
*   **Mã Ca Kiểm Thử**: `UT-05`
*   **Tính năng (Feature)**: Thực thi giới hạn giờ tuần của nhân viên
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `User.MaxWeeklyHours`: `40`
    *   `userShifts`: Các ca đã xếp trong tuần đạt tổng cộng `38` giờ làm việc.
    *   Ca làm việc cần kiểm tra có thời lượng `4` giờ (`allowOvertime = false`).
*   **Kết quả kỳ vọng (Expected output)**: `false` (Giờ làm tuần vượt quá 42 giờ, vi phạm giới hạn).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-06: Ràng buộc sức khỏe yếu - tối đa 1 ca/ngày (Low Health Threshold)
*   **Mã Ca Kiểm Thử**: `UT-06`
*   **Tính năng (Feature)**: Điều phối ca trực dựa trên điểm Energy Score
*   **Hàm được kiểm thử**: `RuleEngine.IsValid()` tại [service/rule_engine.go#L18](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L18)
*   **Đầu vào (Input)**:
    *   `User.EnergyScore`: `30` (Dưới ngưỡng yếu 50)
    *   `userShifts`: Đã có 1 ca xếp lịch trong ngày.
    *   Ca làm việc cần kiểm tra: Ca thứ 2 trong ngày.
*   **Kết quả kỳ vọng (Expected output)**: `false` (Nhân viên sức khỏe yếu chỉ được làm tối đa 1 ca một ngày).
*   **Kết quả thực tế (Actual output)**: `false`
*   **Trạng thái**: **PASS**

---

### UT-07: Tính điểm phạt cân bằng tải công việc (Workload Balance Penalty)
*   **Mã Ca Kiểm Thử**: `UT-07`
*   **Tính năng (Feature)**: Điểm phạt cân bằng tải xếp ca
*   **Hàm được kiểm thử**: `RuleEngine.CalculateScore()` tại [service/rule_engine.go#L114](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L114)
*   **Đầu vào (Input)**:
    *   `User A`: Số giờ tuần = `10`
    *   `User B`: Số giờ tuần = `30`
*   **Kết quả kỳ vọng (Expected output)**: Điểm phạt User A thấp hơn User B (ưu tiên gán ca cho người làm ít hơn để cân bằng tải).
*   **Kết quả thực tế (Actual output)**: Điểm phạt User A = 100, Điểm phạt User B = 300 (Chênh lệch 200 điểm phạt nghiêng về User A).
*   **Trạng thái**: **PASS**

---

### UT-08: Tính điểm phạt lãng phí kỹ năng (Skill Wastage Penalty)
*   **Mã Ca Kiểm Thử**: `UT-08`
*   **Tính năng (Feature)**: Tránh lãng phí kỹ năng nhân sự cao
*   **Hàm được kiểm thử**: `RuleEngine.CalculateScore()` tại [service/rule_engine.go#L114](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L114)
*   **Đầu vào (Input)**:
    *   Nhiệm vụ yêu cầu kỹ năng (`requiredSkill`): `1`
    *   `User A.SkillLevel`: `1`
    *   `User B.SkillLevel`: `4` (Kỹ năng vượt trội)
*   **Kết quả kỳ vọng (Expected output)**: Điểm phạt lãng phí của User B cao hơn User A (ưu tiên dành nhân sự trình độ cao cho việc khó).
*   **Kết quả thực tế (Actual output)**: Điểm phạt User A = 0, Điểm phạt User B = 3000 (Phạt 1000 điểm cho mỗi cấp vượt trội).
*   **Trạng thái**: **PASS**

---

### UT-09: Xác thực mật khẩu sai (Failed Credentials matching)
*   **Mã Ca Kiểm Thử**: `UT-09`
*   **Tính năng (Feature)**: Xác thực đăng nhập JWT
*   **Hàm được kiểm thử**: `AuthService.Login()` tại [service/auth_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/auth_service.go)
*   **Đầu vào (Input)**:
    *   `Username`: `"admin"`
    *   `Password`: `"sai_mat_khau"`
*   **Kết quả kỳ vọng (Expected output)**: Trả về lỗi `invalid credentials`.
*   **Kết quả thực tế (Actual output)**: Lỗi `invalid credentials`.
*   **Trạng thái**: **PASS**

---

### UT-10: Tính bảng lương tích hợp hệ số KPI (Payroll calculation with KPI Multiplier)
*   **Mã Ca Kiểm Thử**: `UT-10`
*   **Tính năng (Feature)**: Tính toán lương tháng
*   **Hàm được kiểm thử**: `PayrollService.CalculatePayroll()` tại [service/payroll_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/payroll_service.go)
*   **Đầu vào (Input)**:
    *   `BaseHourlyRate`: `20.0`
    *   Tổng số giờ làm việc thực tế: `160.0`
    *   Hệ số lương thưởng KPI (`KPI.Multiplier`): `1.2` (KPI đạt 90 điểm)
    *   Số giờ làm thêm giờ (Overtime): `10.0` (Lương OT hệ số 1.5x)
*   **Kết quả kỳ vọng (Expected output)**:
    *   `BasePay`: $160 \times 20 = 3200.0$
    *   `BonusPay` (KPI + OT): $(3200 \times 0.2) + (10 \times 20 \times 0.5) = 640.0 + 100.0 = 740.0$
    *   `TotalPay`: $3200.0 + 740.0 = 3940.0$
*   **Kết quả thực tế (Actual output)**: `BasePay = 3200.0`, `BonusPay = 740.0`, `TotalPay = 3940.0`.
*   **Trạng thái**: **PASS**
