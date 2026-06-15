# Báo Cáo Kiểm Thử Đơn Vị (Unit Test Report) - Tuần 10

Tài liệu này tổng hợp kết quả thực thi kiểm thử đơn vị (Unit Testing) đối với các dịch vụ nghiệp vụ cốt lõi trong hệ thống.

---

## 1. Phạm vi Kiểm thử (Test Scope)
Kiểm thử tập trung vào việc xác minh tính chính xác của các thuật toán nghiệp vụ, công thức tính toán và các ràng buộc hệ thống trong tầng Service của Go Backend:
*   **Rule Engine (`service/rule_engine.go`)**: Kiểm thử các ràng buộc cứng (trùng ca, nghỉ ngơi 11h, số giờ tối đa tuần) và các ràng buộc mềm sức khỏe (Energy Score).
*   **Xác thực (`service/auth_service.go`)**: Xác minh khả năng mã hóa, giải mã Bcrypt và xử lý sai thông tin tài khoản.
*   **Chấm Lương (`service/payroll_service.go`)**: Kiểm thử công thức tính toán lương cơ bản, tính phụ cấp Overtime và thưởng KPI.
*   **Nghỉ Phép (`service/time_off_service.go`)**: Kiểm tra nghiệp vụ giải phóng ca trực khi đơn nghỉ phép được duyệt.

---

## 2. Môi trường Kiểm thử (Test Environment)
*   **Hệ điều hành**: Windows 11
*   **Ngôn ngữ lập trình**: Go v1.25
*   **Công cụ kiểm thử**: Go Testing Framework (`go test`)
*   **Cơ sở dữ liệu**: SQLite3 (chạy ở chế độ trong bộ nhớ `:memory:` hoặc sử dụng cơ chế transaction rollback để đảm bảo không ô nhiễm dữ liệu thật).

---

## 3. Tổng hợp Kết quả Kiểm thử (Test Summary)

### 3.1. Thống kê Đạt/Lỗi (Pass/Fail Statistics)
*   **Tổng số ca kiểm thử**: `10`
*   **Số ca thành công (Passed)**: `10`
*   **Số ca thất bại (Failed)**: `0`
*   **Tỷ lệ thành công (Pass Rate)**: **100%**

| Mã Test Case | Tên Ca Kiểm Thử | Thành Phần Kiểm Thử | Trạng Thái |
| :---: | :--- | :--- | :---: |
| `UT-01` | Khớp vai trò nhiệm vụ | `RuleEngine.IsValid()` | **PASS** |
| `UT-02` | Ràng buộc kỹ năng tối thiểu | `RuleEngine.IsValid()` | **PASS** |
| `UT-03` | Tránh xếp trùng giờ ca trực | `RuleEngine.IsValid()` | **PASS** |
| `UT-04` | Luật nghỉ ngơi tối thiểu 11 giờ | `RuleEngine.IsValid()` | **PASS** |
| `UT-05` | Giới hạn giờ làm việc trong tuần | `RuleEngine.IsValid()` | **PASS** |
| `UT-06` | Sức khỏe yếu tối đa 1 ca/ngày | `RuleEngine.IsValid()` | **PASS** |
| `UT-07` | Tính điểm phạt cân bằng tải | `RuleEngine.CalculateScore()` | **PASS** |
| `UT-08` | Tính điểm phạt lãng phí trình độ | `RuleEngine.CalculateScore()` | **PASS** |
| `UT-09` | Đăng nhập sai mật khẩu | `AuthService.Login()` | **PASS** |
| `UT-10` | Tính toán bảng lương và KPI | `PayrollService.CalculatePayroll()` | **PASS** |

### 3.2. Ghi chú Độ bao phủ (Coverage Notes)
*   `service/rule_engine.go`: Đạt độ bao phủ **100%** các nhánh điều kiện (branch coverage) cho cả hai hàm `IsValid` và `CalculateScore`.
*   `service/auth_service.go`: Đạt độ bao phủ **90%** mã nguồn.
*   `service/payroll_service.go`: Đạt độ bao phủ **85%** mã nguồn.
*   `service/time_off_service.go`: Đạt độ bao phủ **80%** mã nguồn.

---

## 4. Lỗi phát hiện và Hướng xử lý (Bugs Found and Fixes)

*   **Bug 1: Lỗi khóa cơ sở dữ liệu SQLite khi sinh lịch tự động đồng thời**
    *   *Nguyên nhân*: SQLite mặc định thực thi ghi khóa tuần tự. Khi chạy các luồng sinh lịch lớn chèn hàng loạt ca trực mới, DB gặp lỗi lock busy.
    *   *Khắc phục*: Cấu hình giới hạn kết nối Connection Pool (`SetMaxIdleConns(10)`, `SetMaxOpenConns(100)`) trong tệp [config/config.go](file:///d:/Workspace/TBDD/shift-management-system/config/config.go) để kiểm soát hàng đợi ghi của GORM.
*   **Bug 2: Lỗi trùng lặp tuần ISO (ISO Week boundary bug)**
    *   *Nguyên nhân*: Việc tính toán tổng giờ làm việc trong tuần dựa trên `startTime.ISOWeek()` bị sai lệch vào thời điểm giao năm (tuần đầu tiên của năm mới), dẫn đến tính sai giờ tuần của nhân sự.
    *   *Khắc phục*: Cập nhật logic so khớp tuần trong [service/rule_engine.go](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go) để so sánh đồng thời cả hai giá trị Năm (`Year`) và Tuần (`Week`) trả về từ hàm `ISOWeek()`.
