# Biểu Đồ Use Case Tuần 2

## 1. Use Case Diagram Tổng Thể
```mermaid
flowchart LR
    %% Định nghĩa các Actor
    Manager((Manager))
    Employee((Employee))
    SE((Scheduler Engine))
    AS((Auth Service))
    NS((Notification Service))

    %% System Boundary
    subgraph System [Shift Management System]
        direction TB
        UC01([UC-01: Đăng nhập])
        UC02([UC-02: Quản lý nhân viên])
        UC03([UC-03: Quản lý phòng ban])
        UC04([UC-04: Thiết lập ca])
        UC05([UC-05: Thiết lập ràng buộc])
        UC06([UC-06: Tạo kỳ lập lịch])
        UC07([UC-07: Sinh lịch tự động])
        UC08([UC-08: Chỉnh sửa lịch thủ công])
        UC09([UC-09: Duyệt đổi ca])
        UC10([UC-10: Xem lịch tổng])
        UC11([UC-11: Xem báo cáo])
        UC12([UC-12: Xuất báo cáo])
        UC13([UC-13: Xem lịch cá nhân])
        UC14([UC-14: Gửi yêu cầu đổi ca])
        UC15([UC-15: Nhận thông báo])
    end

    %% Liên kết Actor và Use Case
    Manager --- UC01
    Manager --- UC02
    Manager --- UC03
    Manager --- UC04
    Manager --- UC05
    Manager --- UC06
    Manager --- UC07
    Manager --- UC08
    Manager --- UC09
    Manager --- UC10
    Manager --- UC11
    Manager --- UC12

    UC01 --- Employee
    UC13 --- Employee
    UC14 --- Employee

    AS -.-> UC01
    SE -.-> UC07
    NS -.-> UC09
    NS -.-> UC14
    UC15 -.-> Manager
    UC15 -.-> Employee
    UC15 -.-> NS

    %% Include và Extend
    UC05 <.. UC07 : <<include>>
    UC06 <.. UC07 : <<include>>
    UC13 <.. UC14 : <<include>>
    UC15 <.. UC09 : <<include>>
    UC08 ..> UC07 : <<extend>>
```

## 2. Phân tích quan hệ <<include>> và <<extend>>
- **<<include>>**:
    - `UC-07 (Sinh lịch tự động)` include `UC-05 (Thiết lập ràng buộc)` và `UC-06 (Tạo kỳ lập lịch)`: Để sinh được lịch, hệ thống bắt buộc phải có thông tin ràng buộc và kỳ lập lịch.
    - `UC-14 (Gửi yêu cầu đổi ca)` include `UC-13 (Xem lịch cá nhân)`: Nhân viên phải xem lịch cá nhân mới có thể chọn ca để đổi.
    - `UC-09 (Duyệt đổi ca)` include `UC-15 (Nhận thông báo)`: Khi duyệt xong, hệ thống tự động gửi thông báo.
- **<<extend>>**:
    - `UC-08 (Chỉnh sửa lịch thủ công)` extend `UC-07 (Sinh lịch tự động)`: Sau khi sinh lịch tự động, Manager có thể (tùy chọn) chỉnh sửa lại bằng tay nếu cần.
