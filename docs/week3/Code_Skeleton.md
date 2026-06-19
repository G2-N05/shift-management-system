# Thiết Kế Cấu Trúc Mã Nguồn (Code Skeleton) - Tuần 3

Tài liệu này đặc tả cấu trúc thư mục, các định nghĩa thực thể chi tiết (Entity Descriptions) và thiết kế giao diện các lớp Services & Repositories tương ứng với mã nguồn thực tế.

---

## 1. Domain Model / Entity List

Tầng thực thể cốt lõi (Domain Entities) được biểu diễn bằng các cấu trúc dữ liệu Go Structs, đại diện cho schema dữ liệu trong SQLite:

1.  **User**: Tài khoản người dùng (Admin, Manager, Employee) kèm các chỉ số sức khỏe, kỹ năng và tiền lương.
2.  **Shift**: Ca làm việc thực tế được lên lịch cho một nhân viên tại địa điểm nhất định.
3.  **Task**: Nhiệm vụ/công việc cần phân bổ nhân sự với định biên và mô hình lập lịch tương ứng.
4.  **TimeOffRequest**: Yêu cầu xin nghỉ phép của nhân viên chờ duyệt.
5.  **SystemSetting**: Các cấu hình ràng buộc và ngưỡng tham chiếu chung của toàn hệ thống.
6.  **HealthDeclaration**: Đơn khai báo bệnh lý kèm hình ảnh minh chứng của nhân viên.
7.  **KnownCondition**: Danh mục bệnh trạng định nghĩa sẵn và điểm trừ sức khỏe mặc định.
8.  **CoordinationSuggestion**: Đề xuất điều phối khôi phục ca làm việc thiếu người từ AI.
9.  **UserKPI**: Điểm số hiệu năng công việc tháng và hệ số thưởng tương ứng.
10. **PayrollRecord**: Bản ghi tính toán bảng lương tổng hợp hàng tháng.
11. **Notification**: Nhật ký thông báo gửi cho người dùng.
12. **ShiftSwap**: Yêu cầu đổi ca giữa các nhân viên.

---

## 2. Entity Descriptions

Chi tiết thuộc tính (Attributes) và đường dẫn file nguồn của các thực thể trong Domain Model:

### 2.1. User
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/user.go](file:///d:/Workspace/TBDD/shift-management-system/domain/user.go)
*   **Thuộc tính**:
    *   `ID uint` (Khóa chính định danh)
    *   `Name string` (Họ và tên nhân viên)
    *   `Email string` (Thư điện tử - duy nhất)
    *   `Username string` (Tên đăng nhập hệ thống - duy nhất)
    *   `PasswordHash string` (Mật khẩu được mã hóa Bcrypt)
    *   `Phone string` (Số điện thoại liên lạc)
    *   `Role Role` (Vai trò/Phân quyền: `admin`, `manager`, `employee`)
    *   `EnergyScore int` (Điểm năng lượng sức khỏe, mặc định 100)
    *   `SkillLevel int` (Cấp độ kỹ năng nghề nghiệp, mặc định 1)
    *   `BaseHourlyRate float64` (Lương cơ bản trên mỗi giờ làm việc)
    *   `MaxWeeklyHours int` (Giới hạn số giờ làm việc tối đa trong tuần)

### 2.2. Shift
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/shift.go](file:///d:/Workspace/TBDD/shift-management-system/domain/shift.go)
*   **Thuộc tính**:
    *   `ID uint` (Khóa chính)
    *   `UserID uint` (Mã nhân viên gán ca)
    *   `LocationID uint` (Mã địa điểm làm việc)
    *   `TaskID *uint` (Mã nhiệm vụ liên kết - tùy chọn)
    *   `StartTime Time` (Giờ bắt đầu ca làm việc)
    *   `EndTime Time` (Giờ kết thúc ca làm việc)
    *   `ClockInTime *Time` (Giờ check-in thực tế khi vào ca)
    *   `ClockOutTime *Time` (Giờ check-out thực tế khi ra ca)
    *   `Notes string` (Ghi chú ca làm việc)
    *   `Status string` (Trạng thái ca: `scheduled`, `assigned`, `in_progress`, `completed`, `cancelled`)

### 2.3. Task
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/task.go](file:///d:/Workspace/TBDD/shift-management-system/domain/task.go)
*   **Thuộc tính**:
    *   `ID uint` (Khóa chính)
    *   `Title string` (Tiêu đề nhiệm vụ)
    *   `Description string` (Mô tả chi tiết công việc)
    *   `LocationID uint` (Mã địa điểm làm việc)
    *   `RequiredRole Role` (Vai trò cần thiết)
    *   `RequiredSkill int` (Cấp độ kỹ năng tối thiểu)
    *   `Headcount int` (Định biên số lượng nhân sự cần thiết)
    *   `WorkModel string` (Mô hình xếp ca: `Sequential` hoặc `Parallel`)
    *   `StartTime Time` (Thời điểm bắt đầu nhiệm vụ)
    *   `EndTime Time` (Thời điểm kết thúc nhiệm vụ)
    *   `IsScheduled bool` (Đã được lên ca nháp thành công)
    *   `IsAssigned bool` (Đã phân bổ đủ người gánh vác)
    *   `AssignedTo *uint` (Mã nhân viên trực tiếp được chỉ định - nullable)
    *   `UrgencyLevel string` (Độ khẩn cấp: `Low`, `Medium`, `High`, `Critical`)
    *   `CoordinationStatus string` (Trạng thái điều phối: `Pending`, `Understaffed`, `Resolved`)

### 2.4. TimeOffRequest
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/time_off_request.go](file:///d:/Workspace/TBDD/shift-management-system/domain/time_off_request.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `UserID uint` (Nhân sự xin nghỉ phép)
    *   `StartDate Time` (Mốc thời gian bắt đầu nghỉ)
    *   `EndDate Time` (Mốc thời gian kết thúc nghỉ)
    *   `DurationHours float64` (Tổng số giờ xin nghỉ)
    *   `Reason string` (Lý do xin nghỉ phép)
    *   `Status TimeOffStatus` (Trạng thái đơn: `pending`, `approved`, `denied`)

### 2.5. SystemSetting
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/setting.go](file:///d:/Workspace/TBDD/shift-management-system/domain/setting.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `MaxShiftHours float64` (Số giờ trực tối đa của 1 ca)
    *   `MinRestHours float64` (Thời gian nghỉ ngơi tối thiểu giữa 2 ca)
    *   `StandardShiftHours float64`
    *   `FullShiftHours float64`
    *   `MaxOvertimeHours float64`
    *   `MorningShiftStart`/`End string` (Khung giờ bắt đầu/kết thúc ca sáng)
    *   `AfternoonShiftStart`/`End string` (Khung giờ bắt đầu/kết thúc ca chiều)
    *   `HealthThresholdModerate int` (Ngưỡng sức khỏe trung bình)
    *   `ModerateHealthMaxOTPerWeek int` (Số ca làm thêm tối đa tuần đối với sức khỏe trung bình)
    *   `HealthThresholdLow int` (Ngưỡng sức khỏe yếu)
    *   `DefaultBaseHourlyRate float64` (Lương cơ bản mặc định mỗi giờ)
    *   `PrioritizedHealthConditions string` (Từ khóa các bệnh ưu tiên cảnh báo)
    *   `PriorityConditionDeduction int` (Điểm trừ mặc định khi mắc bệnh ưu tiên)

### 2.6. HealthDeclaration
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/health.go](file:///d:/Workspace/TBDD/shift-management-system/domain/health.go#L5)
*   **Thuộc tính**:
    *   `ID uint`
    *   `UserID uint` (Nhân sự khai báo bệnh)
    *   `Condition string` (Mô tả tình trạng bệnh lý)
    *   `ProofFile string` (Đường dẫn lưu file ảnh bằng chứng y khoa)
    *   `Status string` (Trạng thái đơn: `pending`, `approved`, `rejected`)
    *   `PointsDeducted int` (Điểm năng lượng bị khấu trừ)
    *   `AdminNotes string` (Ý kiến/Ghi chú phê duyệt của quản trị viên)

### 2.7. KnownCondition
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/health.go](file:///d:/Workspace/TBDD/shift-management-system/domain/health.go#L16)
*   **Thuộc tính**:
    *   `ID uint`
    *   `Condition string` (Tên loại bệnh đã cấu hình)
    *   `PointsDeducted int` (Điểm trừ năng lượng mặc định của bệnh đó)

### 2.8. CoordinationSuggestion
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/coordination.go](file:///d:/Workspace/TBDD/shift-management-system/domain/coordination.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `TaskID uint` (Mã nhiệm vụ gặp sự cố thiếu người)
    *   `Type CoordinationSuggestionType` (Loại đề xuất: `Replacement`, `Reschedule`, `Overtime`)
    *   `SuggestedUser *uint` (Nhân sự thay thế đề xuất)
    *   `SuggestedStart *Time` (Giờ bắt đầu đề xuất dời lịch)
    *   `SuggestedEnd *Time` (Giờ kết thúc đề xuất dời lịch)
    *   `Reasoning string` (Lập luận/Lý giải đề xuất)
    *   `RiskScore int` (Điểm rủi ro quá tải của phương án đề xuất)
    *   `IsApproved bool` (Đã được duyệt và áp dụng)

### 2.9. UserKPI
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/kpi.go](file:///d:/Workspace/TBDD/shift-management-system/domain/kpi.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `UserID uint` (Nhân viên được đánh giá)
    *   `Month int` (Tháng đánh giá)
    *   `Year int` (Năm đánh giá)
    *   `Score int` (Điểm hiệu suất 0-100)
    *   `Multiplier float64` (Hệ số nhân lương thưởng)
    *   `Notes string` (Nhận xét chi tiết)

### 2.10. PayrollRecord
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/payroll.go](file:///d:/Workspace/TBDD/shift-management-system/domain/payroll.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `UserID uint`
    *   `Month int`
    *   `Year int`
    *   `TotalHours float64` (Tổng số giờ làm việc thực tế)
    *   `BaseRate float64` (Lương cơ bản/giờ)
    *   `BasePay float64` (Tổng lương cơ bản thực nhận)
    *   `BonusPay float64` (Thưởng làm thêm giờ + thưởng KPI)
    *   `TotalPay float64` (Tổng thực lĩnh)
    *   `IsPaid bool` (Trạng thái đã thanh toán lương)

### 2.11. Notification
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/notification.go](file:///d:/Workspace/TBDD/shift-management-system/domain/notification.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `UserID uint`
    *   `Message string` (Nội dung thông báo)
    *   `IsRead bool` (Trạng thái đã đọc)

### 2.12. ShiftSwap
*   **Stereotype**: `<<Entity>>`
*   **Đường dẫn file**: [domain/shift_swap.go](file:///d:/Workspace/TBDD/shift-management-system/domain/shift_swap.go)
*   **Thuộc tính**:
    *   `ID uint`
    *   `RequesterID uint` (Nhân sự đề nghị đổi ca)
    *   `TargetUserID uint` (Đồng nghiệp nhận ca đổi)
    *   `ShiftID uint` (Mã ca làm cần đổi)
    *   `Status string` (Trạng thái đơn: `pending`, `approved`, `rejected`, `pending_admin_assignment`)

---

## 3. Service Layer Design

Tầng Service xử lý toàn bộ logic nghiệp vụ, giao tiếp với Repository để thay đổi dữ liệu:

### 3.1. AuthService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/auth_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/auth_service.go)
*   **Phương thức**:
    *   `Login(username, password string) (string, error)`

### 3.2. UserService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/user_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/user_service.go)
*   **Phương thức**:
    *   `RegisterUser(user *User) error`
    *   `Authenticate(email, password string) (*User, error)`
    *   `GetAllUsers() ([]*User, error)`
    *   `GetUserByID(id uint) (*User, error)`
    *   `UpdateUser(id uint, req *User) error`
    *   `DeleteUser(id uint) error`

### 3.3. ShiftService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/shift_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/shift_service.go)
*   **Phương thức**:
    *   `ScheduleShift(shift *Shift) error`
    *   `GetShiftsByUser(userId uint) ([]*Shift, error)`
    *   `GetAllShifts() ([]*Shift, error)`
    *   `ClockIn(shiftID uint, t Time) error`
    *   `ClockOut(shiftID uint, t Time) error`
    *   `UpdateShift(id uint, shift *Shift) error`
    *   `DeleteShift(id uint) error`

### 3.4. TaskService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/task_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/task_service.go)
*   **Phương thức**:
    *   `CreateTask(task *Task) error`
    *   `GetAllTasks() ([]*Task, error)`
    *   `UpdateTask(id uint, task *Task) error`
    *   `DeleteTask(id uint) error`
    *   `AutoScheduleShifts() (int, error)`
    *   `ReScheduleShifts() (int, error)`

### 3.5. HealthService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/health_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/health_service.go)
*   **Phương thức**:
    *   `SubmitDeclaration(decl *HealthDeclaration) error`
    *   `GetPendingDeclarations() ([]*HealthDeclaration, error)`
    *   `GetKnownConditions() ([]*KnownCondition, error)`
    *   `UpdateKnownCondition(id uint, newCondition string, newPoints int) error`
    *   `SuggestPoints(condition string) int`
    *   `ApproveDeclaration(id uint, pointsDeducted int, adminNotes string) error`
    *   `RejectDeclaration(id uint, adminNotes string) error`

### 3.6. CoordinationService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/coordination_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/coordination_service.go)
*   **Phương thức**:
    *   `DetectUnderstaffedTasks() error`
    *   `GenerateSuggestions(taskID uint) ([]*CoordinationSuggestion, error)`
    *   `ApplySuggestion(suggestionID uint) error`

### 3.7. KPIService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/kpi_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/kpi_service.go)
*   **Phương thức**:
    *   `SaveKPI(kpi *UserKPI) error`
    *   `GetAllKPIs(month, year int) ([]domain.UserKPI, error)`

### 3.8. PayrollService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/payroll_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/payroll_service.go)
*   **Phương thức**:
    *   `CalculatePayroll(month, year int) ([]domain.PayrollRecord, error)`
    *   `GetPayrollRecords(month, year int) ([]domain.PayrollRecord, error)`

### 3.9. NotificationService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/notification_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/notification_service.go)
*   **Phương thức**:
    *   `CreateNotification(userID uint, message string) error`
    *   `GetNotifications(userID uint) ([]domain.Notification, error)`
    *   `MarkAsRead(notificationID uint) error`
    *   `MarkAllAsRead(userID uint) error`
    *   `DeleteNotificationByMessage(userID uint, message string) error`

### 3.10. DataService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/data_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/data_service.go)
*   **Phương thức**:
    *   `ExportShiftsToCSV(writer io.Writer) error`
    *   `ImportShiftsFromCSV(file io.Reader) (int, error)`
    *   `ImportUsersFromCSV(file io.Reader) (int, error)`

### 3.11. TimeOffService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/time_off_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/time_off_service.go)
*   **Phương thức**:
    *   `CreateTimeOffRequest(userID uint, req *TimeOffRequest) error`
    *   `GetMyTimeOffRequests(userID uint) ([]TimeOffRequest, error)`
    *   `GetAllPendingRequests() ([]TimeOffRequest, error)`
    *   `UpdateRequestStatus(requestID uint, status TimeOffStatus) error`

### 3.12. ShiftSwapService
*   **Stereotype**: `<<Service>>`
*   **Đường dẫn file**: [service/shift_swap_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/shift_swap_service.go)
*   **Phương thức**:
    *   `RequestSwap(requesterID, targetUserID, shiftID uint) (*ShiftSwap, error)`
    *   `ApproveSwap(swapID uint) error`
    *   `RejectSwap(swapID uint) error`
    *   `GetPendingSwaps() ([]*ShiftSwap, error)`
    *   `AutoSwap(requesterID, shiftID uint) error`
    *   `AssignSwap(swapID, targetUserID uint) error`

### 3.13. Controller Layer Design (API Handler)
*   **Stereotype**: `<<Controller>>`
*   **Đường dẫn file**: [ui/handlers.go](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go)
*   **Phương thức**:
    *   `Login(c *gin.Context)`
    *   `GetUsers(c *gin.Context)` / `CreateUser(c *gin.Context)`
    *   `ClockIn(c *gin.Context)` / `ClockOut(c *gin.Context)`
    *   `AutoSchedule(c *gin.Context)` / `ReSchedule(c *gin.Context)`
    *   `SubmitHealthDeclaration(c *gin.Context)` / `ApproveHealthDeclaration(c *gin.Context)`
    *   `CalculatePayroll(c *gin.Context)` / `GetPayroll(c *gin.Context)`

---

## 4. Repository Layer Design

Tất cả các repository đều kế thừa interface trong [repository/interfaces.go](file:///d:/Workspace/TBDD/shift-management-system/repository/interfaces.go), cung cấp lớp trừu tượng kết nối DB SQLite:

### 4.1. UserRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/user_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/user_repository.go)
*   **Phương thức**:
    *   `Save(user *User) error`
    *   `FindAll() ([]*User, error)`
    *   `FindByID(id uint) (*User, error)`
    *   `FindByUsername(username string) (*User, error)`
    *   `Update(user *User) error`
    *   `Delete(id uint) error`

### 4.2. ShiftRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/shift_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/shift_repository.go)
*   **Phương thức**:
    *   `Save(shift *Shift) error`
    *   `FindByUserID(userID uint) ([]*Shift, error)`
    *   `FindAll() ([]*Shift, error)`
    *   `Delete(id uint) error`
    *   `FindByID(id uint) (*Shift, error)`
    *   `Update(shift *Shift) error`

### 4.3. TaskRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/task_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/task_repository.go)
*   **Phương thức**:
    *   `Save(task *Task) error`
    *   `FindAll() ([]*Task, error)`
    *   `FindUnassigned() ([]*Task, error)`
    *   `Update(task *Task) error`
    *   `FindByID(id uint) (*Task, error)`
    *   `Delete(id uint) error`

### 4.4. SettingRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/setting_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/setting_repository.go)
*   **Phương thức**:
    *   `Get() (*SystemSetting, error)`
    *   `Update(setting *SystemSetting) error`

### 4.5. ShiftSwapRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/shift_swap_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/shift_swap_repository.go)
*   **Phương thức**:
    *   `Save(swap *ShiftSwap) error`
    *   `FindByID(id uint) (*ShiftSwap, error)`
    *   `FindByStatus(status string) ([]*ShiftSwap, error)`
    *   `FindByShiftID(shiftID uint) ([]*ShiftSwap, error)`
    *   `Update(swap *ShiftSwap) error`

### 4.6. CoordinationRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/coordination_repository.go](file:///d:/Workspace/TBDD/shift-management-system/repository/coordination_repository.go)
*   **Phương thức**:
    *   `SaveSuggestion(suggestion *CoordinationSuggestion) error`
    *   `GetSuggestionsByTask(taskID uint) ([]*CoordinationSuggestion, error)`
    *   `FindSuggestionByID(id uint) (*CoordinationSuggestion, error)`
    *   `UpdateSuggestion(suggestion *CoordinationSuggestion) error`

### 4.7. TimeOffRepository
*   **Stereotype**: `<<Repository>>`
*   **Đường dẫn file**: [repository/interfaces.go](file:///d:/Workspace/TBDD/shift-management-system/repository/interfaces.go)
*   **Phương thức**:
    *   `Conceptual interface mappings` cho các câu lệnh GORM trực tiếp trên thực thể `TimeOffRequest` của hệ thống.
