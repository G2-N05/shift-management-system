# Thiết Kế Biểu Đồ Trình Tự (Sequence Diagrams) - Tuần 4

Tài liệu này đặc tả chi tiết thiết kế tương tác giữa các phân tầng (Sequence Diagrams) cho các chức năng hoạt động thực tế trong hệ thống.

---

## 1. Biểu đồ Trình tự (Sequence Diagrams)

Tất cả các biểu đồ trình tự dưới đây tuân thủ nghiêm ngặt mô hình phân tầng thực tế của hệ thống:  
**Actor** $\rightarrow$ **UI (React Web / Flutter Mobile)** $\rightarrow$ **Router (`router.go`)** $\rightarrow$ **Handler (`handlers.go`)** $\rightarrow$ **Service** $\rightarrow$ **Repository** $\rightarrow$ **Database (SQLite)**.

### 1.1. UC-01: Đăng nhập (Login)
*   **Mục đích**: Người dùng đăng nhập hệ thống để nhận Token xác thực JWT.
*   **Đường dẫn file liên quan**:
    *   Router: [ui/router.go#L19](file:///d:/Workspace/TBDD/shift-management-system/ui/router.go#L19)
    *   Handler: [ui/handlers.go#L308-L323](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L308-L323)
    *   Service: [service/auth_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/auth_service.go)

```mermaid
sequenceDiagram
    actor User as Employee / Admin
    participant UI as React / Flutter UI
    participant Router as router.go (/api/auth/login)
    participant Handler as handlers.go (Login)
    participant Service as AuthService
    participant Repo as UserRepository
    participant Util as JWT Util (jwt.go)

    User->>UI: Nhập Username & Password, Click "Đăng nhập"
    UI->>Router: POST /api/auth/login {Username, Password}
    activate Router
    Router->>Handler: Login(c *gin.Context)
    activate Handler
    Handler->>Service: Login(Username, Password)
    activate Service
    Service->>Repo: FindByUsername(Username)
    activate Repo
    Repo-->>Service: User Object (chứa PasswordHash)
    deactivate Repo

    alt Password băm so khớp trùng (Bcrypt)
        Service->>Util: GenerateJWT(UserID, Role)
        activate Util
        Util-->>Service: tokenString
        deactivate Util
        Service-->>Handler: Return tokenString
        Handler-->>Router: HTTP 200 OK {token: tokenString}
        Router-->>UI: Trả về Token xác thực
        UI-->>User: Chuyển hướng vào Dashboard tương ứng
    else Sai thông tin mật khẩu/tài khoản
        Service-->>Handler: Return error (invalid credentials)
        deactivate Service
        Handler-->>Router: HTTP 401 Unauthorized {error: msg}
        deactivate Handler
        Router-->>UI: Báo lỗi đăng nhập
        deactivate Router
        UI-->>User: Hiển thị cảnh báo "Invalid credentials"
    end
```

---

### 1.2. UC-07: Sinh lịch tự động (Auto Schedule Shifts)
*   **Mục đích**: Tự động tạo và phân bổ ca làm việc tối ưu dựa trên Rule Engine.
*   **Đường dẫn file liên quan**:
    *   Router: [ui/router.go#L43](file:///d:/Workspace/TBDD/shift-management-system/ui/router.go#L43)
    *   Handler: [ui/handlers.go#L268-L276](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L268-L276)
    *   Service: [service/task_service.go#L99-L317](file:///d:/Workspace/TBDD/shift-management-system/service/task_service.go#L99-L317)
    *   Rule Engine: [service/rule_engine.go](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go)

```mermaid
sequenceDiagram
    actor Manager
    participant UI as React Web UI
    participant Router as router.go (/api/tasks/auto-schedule)
    participant Handler as handlers.go (AutoSchedule)
    participant Service as TaskService
    participant Rule as RuleEngine (Utility)
    participant Repo as Task/Shift/Setting Repositories
    participant DB as SQLite Database

    Manager->>UI: Click "Tự động lập lịch"
    UI->>Router: POST /api/tasks/auto-schedule (with Auth Header)
    activate Router
    Router->>Handler: AutoSchedule(c *gin.Context)
    activate Handler
    Handler->>Service: AutoScheduleShifts()
    activate Service
    Service->>Repo: FindUnassigned() (Tasks)
    activate Repo
    Repo-->>Service: list of Unassigned Tasks
    Service->>Repo: FindAll() (Users & Shifts)
    Repo-->>Service: list of Employees & active Shifts
    Service->>Repo: Get() (SystemSettings)
    Repo-->>Service: SystemSetting (chứa MinRestHours, v.v.)
    deactivate Repo

    loop Cho mỗi Task chưa xếp lịch
        loop Cho mỗi nhân viên (Employee)
            Service->>Rule: IsValid(User, Shifts, TaskRole, TaskSkill, Time)
            activate Rule
            Note over Rule: Kiểm tra trùng ca, nghỉ ngơi 11h,<br/>Weekly Hours và Energy Score
            Rule-->>Service: IsValid (true / false)
            deactivate Rule
            alt IsValid == true
                Service->>Rule: CalculateScore(User, Shifts, ReqSkill)
                activate Rule
                Rule-->>Service: Penalty Score
                deactivate Rule
            end
        end
        Service-->>Service: Sắp xếp ứng viên theo Penalty Score tăng dần
        
        alt Có ứng viên phù hợp nhất
            Service->>Repo: Save(Shift)
            activate Repo
            Repo->>DB: INSERT INTO shifts...
            DB-->>Repo: SQL Success
            deactivate Repo
            Service->>Repo: Update(Task.IsAssigned = true)
        else Không có ai đáp ứng (Thiếu người)
            Service->>Repo: Update(Task.CoordinationStatus = "Understaffed")
            Service->>Repo: CreateNotification(AdminID, WarningMessage)
        end
    end

    alt Lập ca trực thành công
        Service-->>Handler: Return count of scheduled shifts, nil
        Handler-->>Router: HTTP 200 OK {shiftsScheduled: count}
        Router-->>UI: Trả về kết quả lập lịch thành công
        UI-->>Manager: Hiển thị danh sách ca trực nháp đã sinh
    else Lỗi DB/Giao dịch hệ thống
        Service-->>Handler: Return 0, error
        deactivate Service
        Handler-->>Router: HTTP 500 Internal Server Error {error: msg}
        deactivate Handler
        Router-->>UI: Báo lỗi lập lịch thất bại
        deactivate Router
        UI-->>Manager: Hiển thị lỗi hệ thống
    end
```

---

### 1.3. UC-16 & UC-17: Khai báo sức khỏe & Xét duyệt AI (Health Declaration with NLP analysis)
*   **Mục đích**: Nhân viên khai báo bệnh, hệ thống tự động so khớp ngữ nghĩa bằng AI NLP để gợi ý điểm trừ sức khỏe và Admin thực hiện phê duyệt.
*   **Đường dẫn file liên quan**:
    *   Router: [ui/router.go#L60-L64](file:///d:/Workspace/TBDD/shift-management-system/ui/router.go#L60-L64)
    *   Handler: [ui/handlers.go#L505-L536](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L505-L536), [ui/handlers.go#L578-L621](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L578-L621)
    *   Service: [service/health_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/health_service.go)
    *   NLP Microservice: [nlp-service/main.py](file:///d:/Workspace/TBDD/shift-management-system/nlp-service/main.py)

```mermaid
sequenceDiagram
    actor Employee
    actor Admin
    participant UI as Web / Mobile UI
    participant Router as router.go
    participant Handler as handlers.go
    participant Service as HealthService
    participant NLP as FastAPI NLP Service (Port 8000)
    participant DB as SQLite Database

    %% Luồng 1: Khai báo
    Employee->>UI: Nhập mô tả bệnh & upload ảnh minh chứng
    UI->>Router: POST /api/health (Multipart-Form)
    activate Router
    Router->>Handler: SubmitHealthDeclaration(c *gin.Context)
    activate Handler
    Handler->>Handler: Lưu ảnh minh chứng vào uploads/
    Handler->>Service: SubmitDeclaration(HealthDeclaration)
    activate Service
    Service->>DB: INSERT INTO health_declarations (Status="pending")
    DB-->>Service: SQL Success
    Service-->>Handler: Return nil
    deactivate Service
    Handler-->>Router: HTTP 201 Created
    deactivate Handler
    Router-->>UI: Trả về trạng thái "Đã gửi tờ khai"
    deactivate Router
    UI-->>Employee: Thông báo gửi khai báo thành công

    %% Luồng 2: Xét duyệt bằng AI gợi ý
    Admin->>UI: Vào màn hình duyệt sức khỏe
    UI->>Router: GET /api/health/ai-suggest?condition=...
    activate Router
    Router->>Handler: SuggestHealthPoints(c *gin.Context)
    activate Handler
    Handler->>Service: SuggestPoints(ConditionText)
    activate Service
    Service->>DB: Get SystemSetting (Keywords) & KnownConditions
    DB-->>Service: Keywords list
    Service->>NLP: POST /similarity {query: ConditionText, keywords}
    activate NLP
    NLP-->>Service: Return best_match, max_score
    deactivate NLP
    Service-->>Handler: Return SuggestedPoints
    deactivate Service
    Handler-->>Router: HTTP 200 OK {SuggestedPoints}
    deactivate Handler
    Router-->>UI: Trả về điểm đề xuất bởi AI
    deactivate Router
    UI-->>Admin: Hiển thị chi tiết đơn + Điểm trừ năng lượng gợi ý

    alt Phê duyệt đơn
        Admin->>UI: Xác nhận duyệt đơn
        UI->>Router: POST /api/health/{id}/approve {PointsDeducted}
        activate Router
        Router->>Handler: ApproveHealthDeclaration
        activate Handler
        Handler->>Service: ApproveDeclaration(id, points)
        activate Service
        Service->>DB: UPDATE health_declarations Status="approved"
        Service->>DB: UPDATE users SET energy_score = energy_score - points
        DB-->>Service: SQL Success
        Service-->>Handler: Return nil
        deactivate Service
        Handler-->>Router: HTTP 200 OK
        deactivate Handler
        Router-->>UI: Trả về kết quả duyệt thành công
        deactivate Router
        UI-->>Admin: Cập nhật danh sách đơn đã duyệt
    end
```

---

### 1.4. UC-19 & UC-20: Chấm công (Clock-In / Clock-Out)
*   **Mục đích**: Nhân viên chấm công bắt đầu làm việc và kết thúc ca làm để làm cơ sở tính lương.
*   **Đường dẫn file liên quan**:
    *   Router: [ui/router.go#L36-L37](file:///d:/Workspace/TBDD/shift-management-system/ui/router.go#L36-L37)
    *   Handler: [ui/handlers.go#L325-L351](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L325-L351)
    *   Service: [service/shift_service.go#L33-L51](file:///d:/Workspace/TBDD/shift-management-system/service/shift_service.go#L33-L51)

```mermaid
sequenceDiagram
    actor Employee
    participant UI as Flutter Mobile / Web UI
    participant Router as router.go
    participant Handler as handlers.go
    participant Service as ShiftService
    participant Repo as ShiftRepository
    participant DB as SQLite Database

    %% Luồng Clock-in
    Employee->>UI: Click "Clock In"
    UI->>Router: POST /api/shifts/{id}/clock-in
    activate Router
    Router->>Handler: ClockIn(c *gin.Context)
    activate Handler
    Handler->>Service: ClockIn(shiftID, time.Now())
    activate Service
    Service->>Repo: FindByID(shiftID)
    activate Repo
    Repo-->>Service: Shift Object
    deactivate Repo
    
    alt Shift hợp lệ
        Service->>Repo: Save(Shift với ClockInTime & Status="in_progress")
        activate Repo
        Repo->>DB: UPDATE shifts SET clock_in_time=...
        DB-->>Repo: SQL Success
        deactivate Repo
        Service-->>Handler: Return nil
        Handler-->>Router: HTTP 200 OK
        Router-->>UI: Chấm công thành công
        UI-->>Employee: Hiển thị trạng thái ca trực: "Đang làm việc"
    else Shift không tồn tại
        Service-->>Handler: Return error (record not found)
        deactivate Service
        Handler-->>Router: HTTP 500 Internal Server Error {error}
        deactivate Handler
        Router-->>UI: Báo lỗi hệ thống
        deactivate Router
        UI-->>Employee: Hiển thị thông báo lỗi
    end
```
