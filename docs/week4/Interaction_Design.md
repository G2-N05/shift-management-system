# Tài Liệu Thiết Kế Tương Tác & Giao Diện - Tuần 4

## 1. Biểu đồ Trình tự (Sequence Diagram)

### 1.1. UC-07: Sinh lịch tự động
Mô tả luồng tương tác khi Quản lý yêu cầu hệ thống tự động sắp xếp lịch dựa trên các ràng buộc.

```mermaid
sequenceDiagram
    actor Manager
    participant UI as UI Layer (React)
    participant Service as ShiftService
    participant Engine as SchedulerEngine
    participant Repo as ShiftRepository
    participant DB as Database (SQLite)

    Manager->>UI: Click "Sinh lịch tự động"
    UI->>Service: POST /api/shifts/schedule
    activate Service
    Service->>Engine: Optimize(Constraints, Users)
    activate Engine
    
    alt Thuật toán thành công
        Engine-->>Service: List<Shift> (Proposed)
        deactivate Engine
        Service->>Repo: BulkSave(ProposedShifts)
        activate Repo
        Repo->>DB: INSERT INTO shifts...
        DB-->>Repo: OK
        deactivate Repo
        Service-->>UI: 200 OK (Schedule generated)
        UI-->>Manager: Hiển thị lịch đã sinh thành công
    else Vi phạm ràng buộc cứng
        Engine-->>Service: Error (Constraint Violation)
        activate Engine
        deactivate Engine
        Service-->>UI: 400 Bad Request (Conflict details)
        UI-->>Manager: Hiển thị lỗi vi phạm (ví dụ: Thiếu nhân sự)
    end
    
    deactivate Service
```

### 1.2. UC-09: Duyệt đổi ca
Mô tả quy trình phê duyệt yêu cầu đổi ca giữa hai nhân viên.

```mermaid
sequenceDiagram
    actor Manager
    participant UI as UI Layer (React)
    participant Service as ShiftSwapService
    participant SwapRepo as SwapRepository
    participant ShiftRepo as ShiftRepository
    participant NS as NotificationService

    Manager->>UI: Chọn "Phê duyệt" yêu cầu đổi ca
    UI->>Service: POST /api/swaps/{id}/approve
    activate Service
    Service->>SwapRepo: GetByID(id)
    SwapRepo-->>Service: Swap Object (ReqID, TargetID, ShiftID)
    
    alt Swap hợp lệ (không quá giờ làm)
        Service->>ShiftRepo: Update(Shift with NewUserID)
        activate ShiftRepo
        ShiftRepo-->>Service: Success
        deactivate ShiftRepo
        
        Service->>SwapRepo: Update(Swap Status="approved")
        SwapRepo-->>Service: OK
        
        Service->>NS: SendNotification(ReqID, TargetID, "Approved")
        NS-->>Service: Sent
        
        Service-->>UI: 200 OK (Swap Approved)
        UI-->>Manager: Thông báo duyệt thành công
    else Vi phạm giới hạn giờ làm
        Service-->>UI: 400 Bad Request (Limit exceeded)
        UI-->>Manager: Hiển thị cảnh báo vi phạm định mức
    end
    
    deactivate Service
```

### 1.3. UC-01: Đăng nhập
Mô tả quy trình xác thực người dùng dựa trên `AuthService.Login`.

```mermaid
sequenceDiagram
    actor User
    participant UI as UI Layer (React)
    participant Service as AuthService
    participant Repo as UserRepository
    participant Util as JWTUtil

    User->>UI: Nhập Username/Password & Click Login
    UI->>Service: Login(username, password)
    activate Service
    Service->>Repo: FindByUsername(username)
    activate Repo
    Repo-->>Service: User Object (with PasswordHash)
    deactivate Repo
    
    alt Password khớp (bcrypt.Compare)
        Service->>Util: GenerateJWT(UserID, Role)
        Util-->>Service: tokenString
        Service-->>UI: 200 OK (Token)
        UI-->>User: Chuyển hướng tới Dashboard
    else Password sai hoặc Không tìm thấy User
        Service-->>UI: 401 Unauthorized
        UI-->>User: Hiển thị "Invalid credentials"
    end
    deactivate Service
```

### 1.4. UC-14: Gửi yêu cầu đổi ca
Mô tả luồng nhân viên gửi yêu cầu đổi ca thông qua `ShiftSwapService.RequestSwap`.

```mermaid
sequenceDiagram
    actor Employee
    participant UI as UI Layer (React)
    participant Service as ShiftSwapService
    participant Repo as SwapRepository

    Employee->>UI: Chọn ca làm & đồng nghiệp muốn đổi
    UI->>Service: RequestSwap(ReqID, TargetID, ShiftID)
    activate Service
    Note over Service: Khởi tạo Swap{Status: "pending"}
    Service->>Repo: Save(Swap)
    activate Repo
    Repo-->>Service: Success
    deactivate Repo
    Service-->>UI: 201 Created
    deactivate Service
    UI-->>Employee: Thông báo "Đã gửi yêu cầu thành công"
```

### 1.5. UC-02: Đăng ký nhân viên (Quản lý nhân sự)
Mô tả logic xử lý khi Admin thêm nhân viên mới qua `UserService.RegisterUser`.

```mermaid
sequenceDiagram
    actor Admin
    participant UI as UI Layer (React)
    participant Service as UserService
    participant Repo as UserRepository

    Admin->>UI: Nhập thông tin nhân viên (Name, Email)
    UI->>Service: RegisterUser(User)
    activate Service
    Note over Service: 1. Tách Email lấy Username
    Note over Service: 2. Set Password mặc định "123456"
    Service->>Repo: Save(User)
    activate Repo
    Repo-->>Service: OK
    deactivate Repo
    Service-->>UI: 200 OK
    deactivate Service
    UI-->>Admin: Hiển thị nhân viên mới trong danh sách
```


## 2. Biểu đồ Cộng tác (Communication Diagram)
Sơ đồ mô tả mạng lưới kết nối giữa các đối tượng để hoàn thành chức năng **Duyệt đổi ca (UC-09)**.

```mermaid
graph LR
    Manager((Manager)) -- 1: Click Approve --> UI[UI Layer]
    UI -- 2: POST /approve --> Service[ShiftSwapService]
    Service -- 3: GetSwap --> SwapRepo[SwapRepository]
    Service -- 4: Check Rules --> Engine[RuleEngine]
    Service -- 5: Update Owner --> ShiftRepo[ShiftRepository]
    Service -- 6: Notify --> NS[NotificationService]
    NS -- 7: Alert --> Req((Requester))
    NS -- 7: Alert --> Target((Target))
```

## 3. Thiết kế Giao diện (UI Mockups)

### 3.1. Màn hình Đăng nhập (Login)
![Login Page Mockup](file:///d:/Workspace/TBDD/shift-management-system/docs/images/login_mockup.png)
*Giao diện đăng nhập bảo mật (Secure Login) với thiết kế tối giản, tập trung vào trải nghiệm người dùng.*

### 3.2. Bảng điều khiển Quản lý (Admin Dashboard)
![Admin Dashboard](file:///d:/Workspace/TBDD/shift-management-system/docs/images/admin_dashboard.png)
*Giao diện quản trị trung tâm bao gồm:*
- **Sidebar Điều hướng**: Truy cập nhanh vào Task Needs, Calendar, Team Members, Swap Requests.
- **Schedule Shift**: Form gán ca nhanh cho nhân viên (Select Employee, Start/End Time).
- **Upcoming Shifts**: Danh sách các ca làm việc sắp tới với trạng thái 'Scheduled' rõ ràng.
- **AI & Analytics**: Tích hợp phân tích rủi ro nghỉ việc (Attrition Risk) và kế hoạch kế nhiệm (Succession Plan).

### 3.3. Lịch cá nhân Nhân viên (Employee Schedule)
![Mobile Schedule Placeholder](https://via.placeholder.com/400x800.png?text=Mobile+Employee+Schedule)

### 3.4. Form yêu cầu đổi ca (Swap Request)
![Swap Request Placeholder](https://via.placeholder.com/600x400.png?text=Swap+Request+Modal)

### 3.5. Báo cáo & Phân tích rủi ro (Analytics Dashboard)
![Analytics Placeholder](https://via.placeholder.com/800x450.png?text=Analytics+Attrition+Risk+Dashboard)
*Giao diện cung cấp cái nhìn về tỷ lệ nghỉ việc (Attrition) và gợi ý nhân sự thay thế (Backup Planning).*

## 4. Đánh giá tính nhất quán (Review)
- **Review Class Diagram**: Đã đối soát Sequence Diagram với mã nguồn thực tế tại `service/interfaces.go` và `repository/`. Các phương thức như `ScheduleShift`, `ApproveSwap`, `AssignUser` đã được bổ sung đầy đủ vào tài liệu Tuần 3 để đảm bảo tính khớp nối 100%.
- **UX/UI**: Hệ thống xử lý lỗi đồng bộ từ Backend lên Frontend (thể hiện qua các khối `alt` trong Sequence Diagram và các trạng thái thông báo trên Mockup).
