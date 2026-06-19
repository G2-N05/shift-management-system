# Thiết Kế Biểu Đồ Hoạt Động (Activity Diagrams) - Tuần 5

Tài liệu này đặc tả chi tiết các biểu đồ hoạt động (Activity Diagrams) mô tả quy trình nghiệp vụ và ánh xạ luồng nghiệp vụ thực tế trong hệ thống.

---

## 1. Biểu đồ Hoạt động (Activity Diagrams)

Triển khai bằng cú pháp **Mermaid `flowchart`**, phân chia rõ ràng các phân tầng bơi (Swimlanes): **Actor** $\rightarrow$ **UI/API Layer** $\rightarrow$ **Service Layer** $\rightarrow$ **Repository & DB Layer**.

### 1.1 Luồng hoạt động Tự động Lập lịch (Auto Scheduling Workflow)

```mermaid
flowchart TD
    subgraph Actor [Manager Swimlane]
        A[Bắt đầu] --> B(Nhấn Auto-Schedule)
    end

    subgraph UI_API [UI / API Handler Layer]
        B --> C[POST /api/tasks/auto-schedule]
        C --> D[AutoSchedule Handler]
    end

    subgraph Service [Service Layer]
        D --> E[AutoScheduleShifts]
        E --> F[Tải danh sách Tasks chưa phân công & Users, Shifts]
        F --> G{Lặp qua từng Task}
        G -->|Hết Task| H[Hoàn thành xếp lịch]
        G -->|Còn Task| I{Lặp qua từng User}
        
        I -->|Còn User| J[Chạy RuleEngine.IsValid]
        J --> K{Có hợp lệ?}
        K -->|Có| L[Tính điểm phạt RuleEngine.CalculateScore]
        K -->|Không| I
        L --> I
        
        I -->|Hết User| M{Có ứng viên đủ điều kiện?}
        M -->|Không| N[Đánh dấu Task Understaffed & Tạo thông báo gửi Admin]
        M -->|Có| O[Chọn User có điểm phạt thấp nhất]
    end

    subgraph DB [Repository / DB Layer]
        N --> P[(Cập nhật Task & Tạo Notification)]
        O --> Q[(Tạo mới ca trực Shift trong DB & Cập nhật Task.IsAssigned = true)]
    end

    P --> G
    Q --> G
    H --> R[Trả kết quả HTTP 200]
    R --> S(Hiển thị ca trực được tạo trên Giao diện)
```

---

### 1.2 Luồng Khai báo & Duyệt sức khỏe bằng AI (AI Health Declaration Workflow)

```mermaid
flowchart TD
    subgraph Employee_Admin [Actor Swimlane]
        A1[Nhân viên gửi khai báo] --> A2(Chụp ảnh minh chứng & Nhập mô tả bệnh)
        A3[Admin duyệt đơn] --> A4(Xem ảnh minh chứng & Chọn duyệt)
    end

    subgraph UI_API [UI / API Handler Layer]
        A2 --> B1[POST /api/health multipart-form]
        B1 --> B2[Lưu file vào uploads/ & SubmitDeclaration]
        
        A4 --> B3[POST /api/health/:id/approve]
        B3 --> B4[ApproveHealthDeclaration Handler]
    end

    subgraph Service [Service Layer]
        B2 --> C1[Submit Health Declaration]
        
        B4 --> C2[ApproveDeclaration]
        C2 --> C3[Gọi FastAPI NLP Service so khớp tương đồng ngữ nghĩa]
        C3 --> C4[Nhận SuggestedPoints từ AI và trừ Energy Score của User]
    end

    subgraph DB [Database Layer]
        C1 --> D1[(Lưu HealthDeclaration status='pending')]
        C4 --> D2[(Lưu HealthDeclaration status='approved' & Khấu trừ Energy Score trong bảng users)]
    end

    D1 --> A3
    D2 --> E[Gửi thông báo thành công cho Employee]
```

---

### 1.3 Luồng Chấm công Vào ca/Ra ca (Clock-In / Clock-Out Workflow)

```mermaid
flowchart TD
    subgraph Employee [Employee Swimlane]
        A[Bắt đầu ca trực] --> B{Lựa chọn hành động}
        B -->|Vào ca| C(Nhấn Clock In)
        B -->|Ra ca| D(Nhấn Clock Out)
    end

    subgraph UI_API [UI / API Handler Layer]
        C --> E1[POST /api/shifts/:id/clock-in]
        D --> E2[POST /api/shifts/:id/clock-out]
    end

    subgraph Service [Service Layer]
        E1 --> F1[ClockIn Service]
        F1 --> G1{Kiểm tra ca trực có tồn tại?}
        
        E2 --> F2[ClockOut Service]
        F2 --> G2{Kiểm tra ca trực đang hoạt động?}
    end

    subgraph DB [Database Layer]
        G1 -->|Có| H1[(Cập nhật ClockInTime = time.Now & Status='in_progress')]
        G2 -->|Có| H2[(Cập nhật ClockOutTime = time.Now & Status='completed')]
    end

    G1 -->|Không| I1[Trả về lỗi HTTP 500]
    G2 -->|Không| I2[Trả về lỗi HTTP 500]
    H1 --> J1[Trả về HTTP 200 thành công]
    H2 --> J2[Trả về HTTP 200 thành công]
```

---

### 1.4 Luồng Tính lương Tháng (Payroll Calculation Workflow)

```mermaid
flowchart TD
    subgraph Admin [Admin Swimlane]
        A[Bắt đầu chốt lương] --> B(Chọn Tháng/Năm & Click Tính lương)
    end

    subgraph UI_API [UI / API Handler Layer]
        B --> C[POST /api/payroll/calculate?month=X&year=Y]
        C --> D[CalculatePayroll Handler]
    end

    subgraph Service [Service Layer]
        D --> E[CalculatePayroll Service]
        E --> F[Tải toàn bộ Users]
        F --> G{Lặp qua từng User}
        G -->|Hết User| H[Hoàn thành tính toán lương]
        G -->|Còn User| I[Tải ca trực completed & KPI trong tháng]
        I --> J[Tính tổng giờ làm từ Clock-In/Clock-Out]
        J --> K[Lương cơ bản = Giờ làm * BaseRate]
        K --> L[Lương thưởng = Lương cơ bản * Multiplier-1 + OvertimePay]
        L --> M[Tổng lương = Lương cơ bản + Lương thưởng]
    end

    subgraph DB [Database Layer]
        M --> N[(Lưu mới hoặc cập nhật PayrollRecord trong DB)]
    end

    N --> G
    H --> O[Trả về HTTP 200 kèm danh sách PayrollRecords]
```

---

## 2. Ánh xạ Luồng nghiệp vụ (Business Workflow Mapping)

Bảng dưới đây ánh xạ các luồng hoạt động (Activity Diagrams) vào cấu trúc thiết kế chi tiết:

| Luồng hoạt động | Use Case ID | Service xử lý chính | Repositories tương tác | Thay đổi trạng thái thực thể (Entity State Changes) |
| :--- | :---: | :--- | :--- | :--- |
| **Tự động Lập lịch** | `UC-07` | `TaskService` | `TaskRepository`, `ShiftRepository`, `SettingRepository`, `UserRepository` | `Task.IsAssigned`: `false` $\rightarrow$ `true`<br>`Task.CoordinationStatus`: `Pending` $\rightarrow$ `Resolved`<br>`Shift`: Tạo mới trạng thái `scheduled`. |
| **Khai báo & Duyệt sức khỏe** | `UC-16`, `UC-17` | `HealthService` | `db *gorm.DB` trực tiếp | `HealthDeclaration.Status`: `pending` $\rightarrow$ `approved` hoặc `rejected`<br>`User.EnergyScore`: Trừ đi điểm sức khỏe bệnh tương ứng. |
| **Chấm công Vào/Ra ca** | `UC-19`, `UC-20` | `ShiftService` | `ShiftRepository` | `Shift.Status`: `scheduled` $\rightarrow$ `in_progress` $\rightarrow$ `completed`<br>Cập nhật giá trị `ClockInTime` và `ClockOutTime`. |
| **Tính lương Tháng** | `UC-26` | `PayrollService` | `db *gorm.DB` trực tiếp | Tạo mới thực thể `PayrollRecord` với trạng thái `IsPaid` mặc định là `false`. |
| **Phê duyệt Nghỉ phép** | `UC-27`, `UC-28` | `TimeOffService` | `db *gorm.DB` trực tiếp | `TimeOffRequest.Status`: `pending` $\rightarrow$ `approved` hoặc `denied`<br>`Shift.Status` (nếu trùng giờ nghỉ): $\rightarrow$ `cancelled` (hoặc bị delete). |
| **Điều phối Ca thiếu người**| `UC-21`, `UC-22` | `CoordinationService`| `CoordinationRepository`, `TaskRepository`, `ShiftRepository` | `CoordinationSuggestion.IsApproved`: `false` $\rightarrow$ `true`<br>`Task.CoordinationStatus`: `Understaffed` $\rightarrow$ `Resolved`. |
