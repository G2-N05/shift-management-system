# Biểu Đồ Use Case Tuần 2 (Bản sửa đổi)

Tài liệu này cung cấp sơ đồ Use Case Diagram hoàn chỉnh của **Hệ thống Quản lý Nhân sự Theo Ca**, phản ánh chính xác các vai trò người dùng (Admin, Manager, Employee) và các Use Cases hoạt động thực tế trong mã nguồn.

---

## 1. Sơ đồ Use Case Diagram (Mermaid)

```mermaid
flowchart LR
    %% Định nghĩa các Actor con người
    Admin((Admin))
    Manager((Manager))
    Employee((Employee))

    %% Phân cấp Actor (Kế thừa quyền)
    Manager --> Employee
    Admin --> Manager

    %% System Boundary
    subgraph System [Shift Management System Boundary]
        direction TB
        
        %% Phân hệ Xác thực & Nhân sự
        UC01([UC-01: Đăng nhập])
        UC02([UC-02: Quản lý nhân viên])
        
        %% Phân hệ Thiết lập & Lập lịch
        UC04([UC-04: Thiết lập ca])
        UC05([UC-05: Thiết lập ràng buộc])
        UC07([UC-07: Sinh lịch tự động])
        UC08([UC-08: Chỉnh sửa lịch thủ công])
        UC10([UC-10: Xem lịch tổng])
        
        %% Phân hệ Vận hành & Đổi ca
        UC09([UC-09: Duyệt đổi ca])
        UC13([UC-13: Xem lịch cá nhân])
        UC14([UC-14: Gửi yêu cầu đổi ca])
        UC15([UC-15: Nhận thông báo])
        
        %% Phân hệ Chấm công & Sức khỏe
        UC16([UC-16: Gửi khai báo sức khỏe])
        UC17([UC-17: Phê duyệt khai báo sức khỏe])
        UC18([UC-18: Cấu hình bệnh trạng đã biết])
        UC19([UC-19: Chấm công vào ca - Clock-In])
        UC20([UC-20: Chấm công ra ca - Clock-Out])
        
        %% Phân hệ Điều phối thông minh & Phân tích
        UC21([UC-21: Xem các ca thiếu nhân sự])
        UC22([UC-22: Áp dụng gợi ý điều phối])
        UC23([UC-23: Xem báo cáo rủi ro kiệt sức])
        UC24([UC-24: Truy vấn gợi ý nhân sự dự phòng])
        
        %% Phân hệ KPI, Lương & Nghỉ phép
        UC25([UC-25: Chấm điểm KPI hiệu suất])
        UC26([UC-26: Tính toán và phê duyệt bảng lương])
        UC27([UC-27: Gửi yêu cầu nghỉ phép])
        UC28([UC-28: Phê duyệt đơn nghỉ phép])
        UC29([UC-29: Import/Export dữ liệu qua CSV])
    end

    %% Liên kết Actor Employee
    Employee --- UC01
    Employee --- UC13
    Employee --- UC14
    Employee --- UC15
    Employee --- UC16
    Employee --- UC19
    Employee --- UC20
    Employee --- UC27

    %% Liên kết Actor Manager
    Manager --- UC04
    Manager --- UC05
    Manager --- UC07
    Manager --- UC08
    Manager --- UC09
    Manager --- UC10
    Manager --- UC21
    Manager --- UC22
    Manager --- UC23
    Manager --- UC24
    Manager --- UC25
    Manager --- UC29

    %% Liên kết Actor Admin
    Admin --- UC02
    Admin --- UC17
    Admin --- UC18
    Admin --- UC26
    Admin --- UC28

    %% Các quan hệ <<include>> và <<extend>>
    UC05 <.. UC07 : "<<include>>"
    UC13 <.. UC14 : "<<include>>"
    UC21 <.. UC22 : "<<include>>"
    
    UC08 ..> UC07 : "<<extend>>"
```

---

## 2. Giải thích mối quan hệ giữa các Use Case
*   **Quan hệ Bao gồm (`<<include>>`)**:
    *   `UC-07 (Sinh lịch tự động)` bắt buộc phải bao gồm `UC-05 (Thiết lập ràng buộc)` vì thuật toán phân ca cần các tham số ràng buộc hệ thống để xác thực tính hợp lệ của lịch biểu.
    *   `UC-14 (Gửi yêu cầu đổi ca)` bao gồm `UC-13 (Xem lịch cá nhân)` vì nhân viên bắt buộc phải chọn một ca làm việc đang có trên lịch của mình để làm đối tượng đổi ca.
    *   `UC-22 (Áp dụng gợi ý điều phối)` bao gồm `UC-21 (Xem các ca thiếu nhân sự)` vì quản lý cần nhận biết danh sách ca thiếu người trước khi có thể duyệt và thực thi phương án điều phối gợi ý.
*   **Quan hệ Mở rộng (`<<extend>>`)**:
    *   `UC-08 (Chỉnh sửa lịch thủ công)` mở rộng `UC-07 (Sinh lịch tự động)`: Sau khi hệ thống sinh lịch nháp thành công, quản lý có thể tùy chọn chỉnh sửa, phân công lại bằng tay nếu có nhu cầu phát sinh đột xuất.
