# Báo Cáo Tổng Kết Dự Án (Final Report) - Tuần 10

**Dự án:** Hệ thống Quản lý Nhân sự Theo Ca (Shift Management System)  
**Học phần:** Phân tích & Thiết kế Phần mềm  
**Ngôn ngữ triển khai:** Golang Backend, React Web Frontend, Flutter Mobile App, Python FastAPI NLP Service  

---

## 1. Giới thiệu (Introduction)

### 1.1. Bối cảnh dự án
Trong vận hành doanh nghiệp sản xuất, dịch vụ hoặc bán lẻ, việc sắp xếp ca làm việc cho nhân viên thủ công thường gặp nhiều khó khăn như: dễ gây trùng lịch, vi phạm quy định về giờ nghỉ ngơi tối thiểu giữa các ca làm việc, và mất cân bằng tải công việc. Hơn thế nữa, các hệ thống ERP truyền thống thường bỏ qua yếu tố sức khỏe thể chất và tinh thần của người lao động. Dự án **Hệ thống Quản lý Nhân sự Theo Ca** được phát triển nhằm tự động hóa việc lập lịch ca trực tối ưu, bảo vệ sức khỏe nhân viên bằng cơ chế AI chấm điểm năng lượng và hỗ trợ vận hành linh hoạt qua các ứng dụng đa nền tảng.

### 1.2. Mục tiêu hệ thống
*   **Lập lịch thông minh**: Tự động sinh lịch trực cho nhân sự dựa trên ràng buộc kỹ năng, vai trò và cân bằng tải công việc.
*   **Bảo vệ sức khỏe**: Tích hợp các thuật toán giảm ca gánh vác khi điểm năng lượng (Energy Score) của nhân viên suy giảm.
*   **Vận hành linh hoạt**: Cung cấp khả năng chấm công, đổi ca tự động (Auto-Swap), xin nghỉ phép và cảnh báo khẩn cấp khi thiếu nhân sự.

### 1.3. Thành viên dự án và Phân công công việc
Dự án được xây dựng và hoàn thiện bởi sự đóng góp chuyên môn của 3 thành viên:
*   **Vũ Xuân Mai (Chuyên trách Phát triển Cốt lõi và Bảo mật Hệ thống)**: Chịu trách nhiệm viết toàn bộ mã nguồn chính (Code), xây dựng kiến trúc kỹ thuật và thực hiện kiểm thử bảo mật chuyên sâu, đảm bảo sự ổn định và an toàn cho toàn bộ hệ thống.
*   **Trần Thị Thu Hường (Đảm bảo Chất lượng, Giám sát Vận hành & Quản lý Tài liệu)**: Đảm nhận vai trò Kiểm thử viên (Tester), thực hiện kiểm thử toàn diện các tính năng, đồng thời chịu trách nhiệm chính trong việc soạn thảo Báo cáo tổng kết dự án và viết/hoàn thiện tất cả các tài liệu của dự án từ tuần 1 đến tuần 10.
*   **Nguyễn Thị Thương (Thiết kế Giao diện và Nâng cấp Trải nghiệm Người dùng)**: Phụ trách Thiết kế giao diện trực quan (UI), nghiên cứu và tìm hiểu các phương án nâng cấp trải nghiệm người dùng (UX), và giám sát sự đồng bộ của thiết kế trong quá trình phát triển.

| Thành viên | Vai trò | Nhiệm vụ cụ thể | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Vũ Xuân Mai** | Chuyên trách Phát triển Cốt lõi và Bảo mật Hệ thống | - Phát triển và viết toàn bộ mã nguồn hệ thống (Golang Backend, React Web, Flutter Mobile, FastAPI NLP).<br>- Xây dựng kiến trúc kỹ thuật và thiết lập cơ sở dữ liệu SQLite.<br>- Thực hiện kiểm thử đơn vị, kiểm thử bảo mật chuyên sâu. | **Hoàn thành** | Phụ trách toàn bộ phần lập trình (Code) |
| **Trần Thị Thu Hường** | Đảm bảo Chất lượng, Giám sát Vận hành & Quản lý Tài liệu | - Soạn thảo và hoàn thiện Báo cáo tổng kết dự án (Final Report).<br>- Soạn thảo và chịu trách nhiệm làm tất cả các tài liệu tuần (Weeks 1 - 10).<br>- Thực hiện kiểm thử toàn diện các tính năng (Tester), thu thập dữ liệu và giám sát hiệu suất sản phẩm. | **Hoàn thành** | Phụ trách Báo cáo, Tài liệu & Kiểm thử |
| **Nguyễn Thị Thương** | Thiết kế Giao diện và Nâng cấp Trải nghiệm Người dùng | - Thiết kế giao diện trực quan (UI Mockup, Wireframe, Figma Prototype).<br>- Nghiên cứu và tìm hiểu các phương án nâng cấp trải nghiệm người dùng (UX).<br>- Giám sát sự đồng bộ của thiết kế trong quá trình phát triển. | **Hoàn thành** | Phụ trách Thiết kế UI/UX |

---

## 2. Phân tích Yêu cầu (Requirement Analysis)

Hệ thống được thiết kế và đồng bộ hóa với 36 yêu cầu chức năng (Functional Requirements - FR) và 5 yêu cầu phi chức năng (Non-Functional Requirements - NFR) cốt lõi:

### 2.1. Yêu cầu chức năng tiêu biểu
*   **FR-01 & FR-02 (Xác thực & RBAC)**: Đăng nhập bằng tài khoản/mật khẩu cấp JWT và phân quyền 3 vai trò: `admin`, `manager`, `employee`.
*   **FR-08 (Sinh lịch tự động)**: Tự động phân ca cho các nhiệm vụ dựa trên Rule Engine.
*   **FR-10 (Ràng buộc nghỉ ngơi)**: Nhân viên phải có ít nhất 11.0 giờ nghỉ ngơi giữa 2 ca làm việc liên tiếp.
*   **FR-14 & FR-15 (Đổi ca)**: Hỗ trợ nộp đơn đổi ca, tự động tìm kiếm người thay thế (Auto-Swap) hoặc chỉ định đổi ca thủ công (Assign Swap).
*   **FR-22 & FR-23 (AI Health)**: Khai báo sức khỏe bằng mô tả tiếng Việt và hình ảnh minh chứng. Dịch vụ AI NLP tự động khớp bệnh trạng và đề xuất điểm trừ năng lượng.
*   **FR-25 & FR-26 (Giới hạn sức khỏe)**: Nhân sự sức khỏe yếu (Energy Score < 50) tối đa làm 1 ca/ngày. Nhân sự sức khỏe trung bình (< 70) không làm ca nặng liên tiếp và bị giới hạn ca làm thêm giờ.
*   **FR-29 & FR-30 (Điều phối ca thiếu)**: Phát hiện ca thiếu người (`Understaffed`), tự động đề xuất phương án thay thế, làm thêm giờ hoặc dời lịch nhiệm vụ.
*   **FR-31 & FR-32 (Phân tích rủi ro)**: Tính Burnout Score dựa trên giờ làm thêm và gợi ý tối đa 3 nhân sự dự bị phù hợp.
*   **FR-34 & FR-35 (KPI & Lương)**: Đánh giá KPI tháng và tự động chốt bảng lương tổng hợp dựa trên chấm công thực tế.

---

## 3. Mô hình hóa Ca sử dụng (Use Case Modeling)

Hệ thống bao gồm 29 ca sử dụng chính (Use Cases - UC), phân bổ tương ứng cho 3 tác nhân (Actors) chính và 1 hệ thống phụ trợ:

### 3.1. Các Tác nhân (Actors)
1.  **Admin (Quản trị viên)**: Toàn quyền quản trị dữ liệu nhân sự, cấu hình ngưỡng hệ thống, duyệt tờ khai sức khỏe y khoa, duyệt đơn xin nghỉ phép và chốt tính lương.
2.  **Manager (Quản lý)**: Quản lý danh sách nhiệm vụ (Tasks), kích hoạt thuật toán sinh lịch tự động, theo dõi báo cáo kiệt sức và điều phối phục hồi ca thiếu người.
3.  **Employee (Nhân viên)**: Xem lịch biểu cá nhân, thực hiện chấm công vào/ra ca (Clock-In/Out), gửi yêu cầu đổi ca, gửi tờ khai bệnh và nộp đơn xin nghỉ phép.
4.  **FastAPI NLP Service**: Microservice hỗ trợ tính điểm tương đồng ngữ nghĩa bệnh lý.

### 3.2. Sơ đồ Use Case tổng quát

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

    %% Các quan hệ include và extend
    UC07 -.->|"<<include>>"| UC05
    UC14 -.->|"<<include>>"| UC13
    UC22 -.->|"<<include>>"| UC21
    UC08 -.->|"<<extend>>"| UC07
```

> **Nguồn:** [UseCase_Diagram_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Diagram_Tuan_2.md) | Đặc tả kịch bản chi tiết: [UseCase_Scenarios_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Scenarios_Tuan_2.md)

---

## 4. Thiết kế Hướng đối tượng (Object-Oriented Design)

Thiết kế cấu trúc tĩnh của hệ thống bao gồm 13 thực thể chính kết nối cơ sở dữ liệu quan hệ SQLite:

*   **User**: Đại diện cho tài khoản nhân sự với các thuộc tính kỹ năng, tiền lương và điểm năng lượng.
*   **Shift**: Ca làm việc cụ thể gán cho một nhân viên tại một thời điểm nhất định.
*   **Task**: Nhiệm vụ công việc cần thực hiện (yêu cầu định biên headcount, kỹ năng tối thiểu và mô hình Sequential/Parallel).
*   **Location**: Chi nhánh/địa điểm làm việc của ca trực.
*   **SystemSetting**: Ngưỡng rest time tối thiểu, ca sáng/chiều, ngưỡng điểm sức khỏe yếu/trung bình.
*   **TimeOffRequest**: Yêu cầu nghỉ phép của nhân viên.
*   **HealthDeclaration**: Đơn báo bệnh kèm đường dẫn file minh chứng.
*   **KnownCondition**: Danh mục bệnh lý định cấu hình sẵn và điểm trừ mặc định.
*   **CoordinationSuggestion**: Đề xuất điều phối ca thiếu người sinh từ AI.
*   **UserKPI**: Đánh giá hiệu suất tháng của nhân viên.
*   **PayrollRecord**: Bản ghi chốt bảng lương tổng hợp cuối tháng.
*   **Notification**: Nhật ký thông báo người dùng.
*   **ShiftSwap**: Đơn đề nghị trao đổi ca làm việc.

```mermaid
classDiagram
    class User {
        <<Entity>>
        +uint ID
        +string Name
        +string Email
        +string Username
        +string PasswordHash
        +string Phone
        +Role Role
        +int EnergyScore
        +int SkillLevel
        +float64 BaseHourlyRate
        +int MaxWeeklyHours
    }

    class Location {
        <<Entity>>
        +uint ID
        +string Name
        +string Address
    }

    class Shift {
        <<Entity>>
        +uint ID
        +uint UserID
        +uint LocationID
        +uint TaskID
        +time.Time StartTime
        +time.Time EndTime
        +time.Time ClockInTime
        +time.Time ClockOutTime
        +string Notes
        +string Status
    }

    class Task {
        <<Entity>>
        +uint ID
        +string Title
        +string Description
        +uint LocationID
        +Role RequiredRole
        +int RequiredSkill
        +int Headcount
        +string WorkModel
        +time.Time StartTime
        +time.Time EndTime
        +bool IsScheduled
        +bool IsAssigned
        +string UrgencyLevel
        +string CoordinationStatus
    }

    class TimeOffRequest {
        <<Entity>>
        +uint ID
        +uint UserID
        +time.Time StartDate
        +time.Time EndDate
        +float64 DurationHours
        +string Reason
        +TimeOffStatus Status
    }

    class HealthDeclaration {
        <<Entity>>
        +uint ID
        +uint UserID
        +string Condition
        +string ProofFile
        +string Status
        +int PointsDeducted
        +string AdminNotes
    }

    class CoordinationSuggestion {
        <<Entity>>
        +uint ID
        +uint TaskID
        +CoordinationSuggestionType Type
        +uint SuggestedUser
        +time.Time SuggestedStart
        +time.Time SuggestedEnd
        +string Reasoning
        +int RiskScore
        +bool IsApproved
    }

    class UserKPI {
        <<Entity>>
        +uint ID
        +uint UserID
        +int Month
        +int Year
        +int Score
        +float64 Multiplier
        +string Notes
    }

    class PayrollRecord {
        <<Entity>>
        +uint ID
        +uint UserID
        +int Month
        +int Year
        +float64 TotalHours
        +float64 BaseRate
        +float64 BasePay
        +float64 BonusPay
        +float64 TotalPay
        +bool IsPaid
    }

    class Notification {
        <<Entity>>
        +uint ID
        +uint UserID
        +string Message
        +bool IsRead
    }

    class ShiftSwap {
        <<Entity>>
        +uint ID
        +uint RequesterID
        +uint TargetUserID
        +uint ShiftID
        +string Status
    }

    %% Relationships and Multiplicity
    User "1" -- "*" Shift : gets assigned to >
    User "1" -- "*" TimeOffRequest : requests >
    User "1" -- "*" HealthDeclaration : submits >
    User "1" -- "*" UserKPI : evaluated >
    User "1" -- "*" PayrollRecord : paid >
    User "1" -- "*" Notification : receives >
    Location "1" -- "*" Shift : hosts >
    Location "1" -- "*" Task : required_at >
    Task "1" -- "*" Shift : partitions into >
    Shift "1" -- "0..*" CoordinationSuggestion : generates >
    Shift "1" -- "0..*" ShiftSwap : swapped_by >
```

> **Nguồn:** [Class_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Class_Diagram.md)

---

## 5. Thiết kế Tương tác (Interaction Design)

Thiết kế tương tác giữa các phân tầng được đặc tả thông qua các biểu đồ trình tự (Sequence Diagrams) tuân thủ mô hình phân tầng thực tế của hệ thống:  
**Actor** $\rightarrow$ **UI** $\rightarrow$ **Router (`router.go`)** $\rightarrow$ **Handler (`handlers.go`)** $\rightarrow$ **Service** $\rightarrow$ **Repository** $\rightarrow$ **Database (SQLite)**.

Tài liệu [Sequence_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/Sequence_Diagram.md) đặc tả các biểu đồ trình tự động cho các luồng nghiệp vụ cốt lõi:
1.  **UC-01 (Đăng nhập)**: Luồng kiểm tra thông tin Bcrypt và trả về Token JWT.
2.  **UC-07 (Sinh lịch tự động)**: Quy trình sinh ca nháp kết hợp kiểm tra Rule Engine.
3.  **UC-16/17 (Khai báo sức khỏe AI)**: Luồng gửi tờ khai, gọi API ngoài FastAPI NLP để tính SuggestedPoints và Admin xác duyệt.
4.  **UC-19/20 (Chấm công)**: Ghi nhận thời gian Clock-In/Clock-Out và cập nhật trạng thái ca trực `in_progress` / `completed`.

Chi tiết giao diện mockup và đặc tả trường dữ liệu được tài liệu hóa tại [UI_Mockup.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/UI_Mockup.md).

---

## 6. Thiết kế Hành vi (Behavioral Design)

Hành vi động của hệ thống được mô hình hóa thông qua 2 loại sơ đồ chính:

### 6.1. Sơ đồ Máy Trạng thái (State Machine Diagrams)
Đặc tả vòng đời chuyển dịch trạng thái của các thực thể cốt lõi:
*   **Shift**: `scheduled` $\rightarrow$ `assigned` $\rightarrow$ `in_progress` $\rightarrow$ `completed` / `cancelled`.
*   **ShiftSwap**: `pending` $\rightarrow$ `pending_admin_assignment` $\rightarrow$ `approved` / `rejected`.
*   **HealthDeclaration**: `pending` $\rightarrow$ `approved` / `rejected`.
*   **TimeOffRequest**: `pending` $\rightarrow$ `approved` / `denied`.
*   **CoordinationSuggestion**: `unapproved` $\rightarrow$ `approved`.

Tất cả các sơ đồ máy trạng thái được tài liệu hóa chi tiết tại [State_Machine_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/State_Machine_Diagram.md).

### 6.2. Sơ đồ Hoạt động (Activity Diagrams)
Mô tả quy trình nghiệp vụ liên thông qua các phân tầng (swimlanes):
*   Luồng sinh lịch tự động dựa trên Rule Engine.
*   Luồng khai báo và xét duyệt sức khỏe AI NLP.
*   Luồng chấm công vào ca/ra ca thực tế.
*   Luồng tính toán chốt bảng lương tổng hợp cuối tháng.

Tất cả các sơ đồ hoạt động và bảng ánh xạ nghiệp vụ được tài liệu hóa tại [Activity_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/Activity_Diagram.md).

---

## 7. Kiến trúc và Mẫu Thiết kế (Architecture and Design Patterns)

### 7.1. Kiến trúc phân rã gói (Package Diagram)
Hệ thống tuân thủ mô hình Kiến trúc phân tầng 3 lớp (3-Tier Layered Architecture) được thiết kế tách biệt và phụ thuộc tuyến tính từ trên xuống:
`ui (Presentation)` $\rightarrow$ `service (Business Logic)` $\rightarrow$ `repository (Data Access)` $\rightarrow$ `domain (Shared Entities)`.

```mermaid
flowchart TD
    %% Định nghĩa các Package
    subgraph UI_PKG [package ui]
        Handler[Handler Controller]
        Middleware[Auth Middleware]
        Router[SetupRouter]
    end

    subgraph SERVICE_PKG [package service]
        SvcInterfaces[Service Interfaces]
        SvcImpls[Service Implementations]
        RuleEngine[RuleEngine Engine]
    end

    subgraph REPO_PKG [package repository]
        RepoInterfaces[Repository Interfaces]
        RepoImpls[Repository Implementations]
    end

    subgraph DOMAIN_PKG [package domain]
        Entities[Domain Entities Structs]
    end

    subgraph CONFIG_PKG [package config]
        DBConfig[InitDB & Pooling]
    end

    subgraph UTIL_PKG [package util]
        JWTUtil[JWT Generators]
    end

    subgraph EXTERNAL [External Systems]
        NLP[FastAPI NLP Service]
        SQLite[(SQLite Database File)]
    end

    %% Mối quan hệ phụ thuộc (Dependency Rules)
    main.go --> UI_PKG
    main.go --> SERVICE_PKG
    main.go --> REPO_PKG
    main.go --> CONFIG_PKG

    UI_PKG -->|Gọi hàm nghiệp vụ| SERVICE_PKG
    UI_PKG -->|Xác thực JWT| UTIL_PKG
    UI_PKG -->|Tham chiếu thực thể| DOMAIN_PKG

    SERVICE_PKG -->|Gọi truy vấn qua Interface| REPO_PKG
    SERVICE_PKG -->|Sử dụng thực thể| DOMAIN_PKG
    SERVICE_PKG -->|Gọi API ngoài qua HTTP| NLP

    REPO_PKG -->|Tham chiếu thực thể| DOMAIN_PKG
    REPO_PKG -->|Truy cập đọc ghi| SQLite
    
    CONFIG_PKG -->|AutoMigrate| DOMAIN_PKG
```

> **Nguồn:** [Package_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Package_Diagram.md)

### 7.2. Các Mẫu thiết kế áp dụng trong mã nguồn (Design Patterns)
1.  **Repository Pattern**: Khai báo các Interfaces trừu tượng kết nối cơ sở dữ liệu tại [Interfaces_Design.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Interfaces_Design.md) và triển khai cụ thể bằng GORM SQLite tại `repository/*.go`.
2.  **Dependency Injection (DI)**: Các Services nhận Repositories thông qua hàm Constructor (Constructor Injection) và được ráp nối tập trung tại `main.go`.

Chi tiết mô tả mã nguồn, lợi ích và sơ đồ UML của các mẫu thiết kế được tài liệu hóa tại [Design_Patterns.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week7/Design_Patterns.md).

---

## 8. Hiện thực hóa hệ thống (Implementation)

Cấu trúc phân rã thư mục của dự án Golang phản ánh chính xác thiết kế đóng gói:
*   `main.go`: Khởi chạy hệ thống, cấu hình tiêm phụ thuộc DI.
*   `config/`: Cấu hình cơ sở dữ liệu SQLite và thiết lập Connection Pooling.
*   `domain/`: Định nghĩa các cấu trúc Go Structs đại diện cho Schema dữ liệu.
*   `repository/`: Triển khai đọc/ghi dữ liệu thông qua GORM.
*   `service/`: Xử lý nghiệp vụ logic, tính toán điểm số và gọi API NLP.
*   `ui/`: Quản lý các route API bằng Gin-Gonic và các middleware xác thực JWT.

---

## 9. Kiểm thử (Testing)

### 9.1. Kiểm thử Đơn vị (Unit Testing)
Nhóm đã triển khai thực thi 10 ca kiểm thử đơn vị (Unit Test Cases) kiểm tra tính đúng đắn của các cấu phần logic nghiệp vụ (Rule Engine, xác thực mật khẩu, công thức tính toán lương KPI). Kết quả đạt tỷ lệ thành công **100% (Passed 10/10)**. Chi tiết ca kiểm thử và báo cáo lỗi/độ bao phủ xem tại [Unit_Test_Cases.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week10/Unit_Test_Cases.md) và [Unit_Test_Report.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week10/Unit_Test_Report.md).

### 9.2. Kiểm thử Tích hợp (Integration Testing)
Thực thi 10 kịch bản kiểm thử tích hợp (IT-01 đến IT-10) bao trùm các luồng giao tiếp giữa React/Flutter Clients, Go Backend Server, Python NLP Service, và cơ sở dữ liệu SQLite. Kết quả đạt trạng thái **PASS** cho toàn bộ các luồng nghiệp vụ. Chi tiết xem tại [Integration_Test.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week9/Integration_Test.md).

---

## 10. Kết luận (Conclusion)

### 10.1. Kết quả đạt được
*   Xây dựng thành công hệ thống lập lịch ca trực tự động kết hợp cân bằng sức khỏe nhân sự.
*   Thiết kế hệ thống tài liệu mạch lạc, đồng bộ chặt chẽ với cấu trúc mã nguồn thực tế và tuân thủ các quy tắc thiết kế hướng đối tượng tốt (SOLID, Loose Coupling).
*   Tính năng tích hợp AI NLP tiếng Việt hoạt động ổn định giúp tự động hóa quy trình duyệt đơn sức khỏe của nhân viên.

### 10.2. Hướng phát triển tương lai
*   Nâng cấp cơ chế xác thực từ phi trạng thái (Stateless JWT) sang cơ chế quản lý trạng thái phiên làm việc (Session-based Stateful Authentication) lưu trữ phía máy chủ kết hợp cookie để nâng cao tính kiểm soát và an toàn bảo mật.
*   Tối ưu thuật toán sinh lịch tự động Rule Engine để hỗ trợ lập ca trực song song với lượng dữ liệu nhân sự lớn hơn.

---

## 11. Phụ lục (Appendix)

### PHỤ LỤC A – Tài liệu SRS Đầy đủ
Tài liệu Đặc tả Yêu cầu Phần mềm (SRS) hoàn chỉnh được tái cấu trúc theo chuẩn cấu trúc IEEE 830.
- Xem chi tiết tại tệp tin đặc tả: [SRS.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/SRS.md)

### PHỤ LỤC B – Script SQL Đầy đủ
Mô tả cấu trúc sơ đồ bảng cơ sở dữ liệu quan hệ cho toàn bộ hệ thống Shift Management System trên SQLite.
- Xem chi tiết toàn bộ script SQL tạo bảng và seed dữ liệu mặc định tại: [database_script.sql](file:///d:/Workspace/TBDD/shift-management-system/database_script.sql)

### PHỤ LỤC C – Biên bản Usability Testing
**Biên bản ghi chép kết quả Kiểm thử Khả năng Sử dụng (Usability Testing)**
- **Thời gian thực hiện**: Ngày 05/06/2026.
- **Thành phần thực hiện**: Nhóm phát triển (Trần Thị Thu Hường - Tester chính, Vũ Xuân Mai - Giám sát kỹ thuật).
- **Đối tượng tham gia thử nghiệm (Participants)**: 
  1. Nguyễn Văn A (Nhân viên vận hành thử nghiệm - vai trò Employee).
  2. Lê Thị B (Quản lý cửa hàng thử nghiệm - vai trò Manager).
- **Kết quả thực hiện các Task kiểm thử**:

| STT | Nhiệm vụ kiểm thử (Task) | Kết quả thực hiện | Nhận xét và phản hồi của người dùng |
| :--- | :--- | :---: | :--- |
| 1 | **Đăng nhập hệ thống (UC-01)** | **Thành công** | Giao diện đăng nhập mượt mà, phản hồi báo lỗi sai tài khoản rất rõ ràng. |
| 2 | **Chấm công Vào/Ra ca (UC-19, UC-20)** | **Thành công** | Nút bấm to, rõ ràng trên Mobile App. Ghi nhận thời gian chính xác. Người dùng đề xuất thêm định vị GPS (sẽ phát triển sau). |
| 3 | **Khai báo sức khỏe y tế (UC-16)** | **Thành công** | Khả năng tải ảnh lên từ thư viện điện thoại hoạt động tốt. AI NLP nhận diện từ khóa tiếng Việt và gợi ý điểm trừ Energy hợp lý. |
| 4 | **Sinh lịch tự động (UC-07)** | **Thành công** | Xử lý nhanh. Các ràng buộc cấm trùng và khoảng nghỉ 11h được đảm bảo chính xác. |
| 5 | **Đề nghị đổi ca trực (UC-09)** | **Thành công** | Đề xuất đồng nghiệp tương thích rất trực quan. Người nhận nhận được thông báo ngay lập tức. |
| 6 | **Tính lương tháng (UC-26)** | **Thành công** | Tổng hợp giờ làm chính xác từ log chấm công. Báo cáo bảng lương hiển thị đầy đủ chi tiết lương gốc và thưởng KPI. |

- **Kết luận**: Hệ thống đạt tiêu chuẩn khả dụng cao, giao diện trực quan và phản hồi trạng thái rõ ràng đối với cả hai vai trò người dùng (Manager trên Web và Employee trên Mobile).

### PHỤ LỤC D – Nhật ký Làm việc Nhóm

| Ngày thực hiện | Thành viên | Nội dung công việc | Kết quả đạt được |
| :--- | :--- | :--- | :--- |
| **12/03/2026** | Cả nhóm | Họp khởi động dự án, thống nhất đề tài và phân công. | Chốt đề tài "Shift Management System", phân công vai trò (Mai phát triển chính, Hường làm tài liệu & QA, Thương làm UI/UX). |
| **19/03/2026** | Cả nhóm | Khảo sát quy trình nghiệp vụ thực tế và thu thập yêu cầu từ doanh nghiệp. | Bảng đặc tả 26 yêu cầu chức năng (FR) và 8 yêu cầu phi chức năng (NFR). |
| **26/03/2026** | Hường, Thương | Thiết kế sơ đồ Use Case và viết kịch bản đặc tả chi tiết. | Sơ đồ Use Case tổng quát và file đặc tả 29 ca sử dụng [UseCase_Scenarios_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Scenarios_Tuan_2.md). |
| **02/04/2026** | Vũ Xuân Mai | Thiết kế sơ đồ lớp Class Diagram và cấu trúc mã nguồn khung xương (skeleton). | Hoàn thiện [Class_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Class_Diagram.md) và [Code_Skeleton.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Code_Skeleton.md). |
| **09/04/2026** | Mai, Thương | Thiết kế Sequence Diagram cho các luồng chính và xây dựng UI Mockups. | Tệp [Sequence_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/Sequence_Diagram.md) và đặc tả 6 màn hình giao diện tại [UI_Mockup.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/UI_Mockup.md). |
| **16/04/2026** | Mai, Hường | Thiết kế sơ đồ máy trạng thái (State Machine) và quy trình hoạt động Activity Diagram. | Hoàn thiện [State_Machine_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/State_Machine_Diagram.md) và [Activity_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/Activity_Diagram.md). |
| **23/04/2026** | Vũ Xuân Mai | Thiết kế sơ đồ cấu trúc gói (Package Diagram) và đặc tả các Go Interfaces. | Hoàn thiện [Package_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Package_Diagram.md) and [Interfaces_Design.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Interfaces_Design.md). |
| **30/04/2026** | Vũ Xuân Mai | Áp dụng Design Patterns và lập trình hoàn thiện Backend server. | Bản thiết kế [Design_Patterns.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week7/Design_Patterns.md) và mã nguồn Core Backend. |
| **14/05/2026** | Mai, Thương | Hoàn thiện phát triển Web Client, Mobile App và microservice AI NLP. | Hệ thống chạy thử nghiệm cục bộ, liên kết hoàn chỉnh các cấu phần. |
| **28/05/2026** | Hường, Mai | Thiết kế kịch bản và chạy thử nghiệm tích hợp (Integration Testing). | Nhật ký kiểm thử tích hợp 10 ca tại [Integration_Test.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week9/Integration_Test.md). |
| **05/06/2026** | Cả nhóm | Chạy thử nghiệm Usability Testing, sửa các lỗi phát hiện và hoàn thiện báo cáo. | Sửa lỗi giao diện, hoàn thiện Unit Tests và báo cáo tổng kết. |
| **18/06/2026** | Hường, Mai | Rà soát, tái cấu trúc tài liệu SRS chuẩn IEEE 830 và đóng gói mã nguồn. | Tệp [SRS.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/SRS.md) mới và Báo cáo tổng kết hoàn chỉnh. |

### PHỤ LỤC E – Tài liệu Tham khảo
• Kendall & Kendall – Systems Analysis and Design (Pearson, 10th Ed.)
• Ian Sommerville – Software Engineering (Pearson, 10th Ed.)
• Roger Pressman – Software Engineering: A Practitioner's Approach (8th Ed.)
• Martin Fowler – UML Distilled (3rd Ed.)
• IEEE Std 830-1998 – Recommended Practice for Software Requirements Specifications
• Jakob Nielsen – 10 Usability He.uristics (https://nngroup.com)
• Don Norman – The Design of Everyday Things (Revised Ed.)
• Go Language Official Documentation (https://go.dev/doc/)
• SQLite SQL Syntax Reference (https://sqlite.org/lang.html)
• Flutter Framework Documentation (https://docs.flutter.dev/)
