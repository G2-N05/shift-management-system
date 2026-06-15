# Sơ Đồ Ánh Xạ Tính Năng & Mã Nguồn (Feature Code Mapping) - Tuần 8

Tài liệu này chứa **Ma trận truy vết yêu cầu (Traceability Matrix)** liên kết chặt chẽ các yêu cầu chức năng (Requirement), ca sử dụng (Use Case), tầng nghiệp vụ (Service), tầng truy xuất dữ liệu (Repository), thực thể cơ sở dữ liệu (Database Entity), và màn hình hiển thị tương ứng (UI Screen).

---

## Ma trận Truy vết Yêu cầu (Traceability Matrix)

| Mã Yêu Cầu (Requirement) | Mã Use Case | Tầng Nghiệp Vụ (Service / Handler) | Tầng Truy Xuất Dữ Liệu (Repository) | Thực Thể DB (Entity Struct) | Màn Hình Hiển Thị (UI Screen) |
| :---: | :---: | :--- | :--- | :---: | :--- |
| **FR-01** (JWT Login) | `UC-01` | `AuthService.Login()` / `Handler.Login()` | `UserRepository.FindByUsername()` | `User` | Màn hình Đăng nhập (Login Screen) |
| **FR-02** (RBAC Authorization) | `UC-01` | `AuthMiddleware()` / `UserService.GetUserByID()` | `UserRepository.FindByID()` | `User` | Sidebar Điều hướng / Menu Phân quyền |
| **FR-03** (CRUD Employees) | `UC-02` | `UserService.RegisterUser()`, `GetAllUsers()`, `GetUserByID()`, `UpdateUser()`, `DeleteUser()` | `UserRepository.Save()`, `FindAll()`, `FindByID()`, `Update()`, `Delete()` | `User` | Màn hình Quản lý Nhân viên (User Management) |
| **FR-05** (CRUD Shifts & Tasks) | `UC-04` | `ShiftService.ScheduleShift()`, `TaskService.CreateTask()` | `ShiftRepository.Save()`, `TaskRepository.Save()` | `Shift`, `Task` | Màn hình Quản lý Nhiệm vụ & Lập lịch (Task & Auto Scheduling) |
| **FR-06** (System Configuration) | `UC-05` | `SettingService.GetSetting()`, `UpdateSetting()` | `SettingRepository.Get()`, `Update()` | `SystemSetting` | Bảng cấu hình hệ thống (System Settings Pane) |
| **FR-08** (Auto Scheduling Run) | `UC-07` | `TaskService.AutoScheduleShifts()` / `Handler.AutoSchedule()` | `TaskRepository.FindUnassigned()`, `ShiftRepository.Save()`, `UserRepository.FindAll()` | `Task`, `Shift`, `User` | Màn hình Quản lý Nhiệm vụ & Lập lịch (Task & Auto Scheduling) |
| **FR-09** (Prevent Duplicate Shifts) | `UC-07` | `RuleEngine.IsValid()` (Kiểm tra trùng ca đè giờ) | `ShiftRepository.FindByUserID()` | `Shift` | Cảnh báo Validation trên màn hình Xếp lịch |
| **FR-10** (11-hour Rest Rule) | `UC-07` | `RuleEngine.IsValid()` (Kiểm tra rest time tối thiểu) | `SettingRepository.Get()`, `ShiftRepository.FindByUserID()` | `SystemSetting`, `Shift` | Cảnh báo Ràng buộc nghỉ ngơi trên màn hình |
| **FR-11** (Workload Balance) | `UC-07` | `RuleEngine.CalculateScore()` (Điểm phạt theo số giờ tuần) | `ShiftRepository.FindAll()` | `Shift`, `User` | Thuật toán tối ưu hóa ca trực (không hiển thị trực tiếp) |
| **FR-12** (Manual Shift Changes) | `UC-08` | `ShiftService.UpdateShift()`, `DeleteShift()` | `ShiftRepository.Update()`, `Delete()` | `Shift` | Màn hình Lịch trực tổng (Manager Calendar) |
| **FR-13** (View Personal Calendar) | `UC-13` | `ShiftService.GetShiftsByUser()` | `ShiftRepository.FindByUserID()` | `Shift` | Bảng lịch biểu cá nhân (Employee Dashboard Screen) |
| **FR-14** (Auto Swap Search) | `UC-14` | `ShiftSwapService.AutoSwap()` / `Handler.AutoSwapRequest()` | `ShiftSwapRepository.Save()`, `UserRepository.FindAll()` | `ShiftSwap`, `Shift` | Màn hình Đổi ca thông minh (Smart Shift Swap) |
| **FR-15** (Swap Approval & Assign) | `UC-09` | `ShiftSwapService.ApproveSwap()`, `RejectSwap()`, `AssignSwap()` | `ShiftSwapRepository.Update()`, `ShiftRepository.Update()` | `ShiftSwap`, `Shift` | Màn hình Đổi ca thông minh (Smart Shift Swap) |
| **FR-17** (Real-time Alert) | `UC-15` | `NotificationService.CreateNotification()` | `db *gorm.DB` trực tiếp | `Notification` | Biểu tượng Chuông thông báo (Notification Bell) |
| **FR-20** (Clock-In) | `UC-19` | `ShiftService.ClockIn()` / `Handler.ClockIn()` | `ShiftRepository.Update()`, `ShiftRepository.FindByID()` | `Shift` | Báo lịch biểu cá nhân (Employee Dashboard Screen) |
| **FR-21** (Clock-Out) | `UC-20` | `ShiftService.ClockOut()` / `Handler.ClockOut()` | `ShiftRepository.Update()`, `ShiftRepository.FindByID()` | `Shift` | Báo lịch biểu cá nhân (Employee Dashboard Screen) |
| **FR-22** (Health Declaration) | `UC-16` | `HealthService.SubmitDeclaration()` / `Handler.SubmitHealthDeclaration()` | `db *gorm.DB` trực tiếp | `HealthDeclaration` | Màn hình Khai báo sức khỏe (Health Declaration) |
| **FR-23** (AI NLP Translation) | `UC-17` | `HealthService.SuggestPoints()` (FastAPI NLP HTTP client call) | `db *gorm.DB` (KnownCondition query) | `HealthDeclaration`, `KnownCondition` | Màn hình Quản lý & Duyệt sức khỏe AI (Admin Approve) |
| **FR-24** (Deduction Suggestion) | `UC-17` | `HealthService.SuggestPoints()` | `db *gorm.DB` trực tiếp | `HealthDeclaration` | Ô đề xuất điểm AI trên màn hình duyệt sức khỏe |
| **FR-25** (Low Energy Restricton) | `UC-07` | `RuleEngine.IsValid()` (Ngăn chặn 2 ca/ngày cho nhân sự < 50 điểm) | `UserRepository.FindByID()`, `SettingRepository.Get()` | `User`, `SystemSetting` | Cảnh báo Rule Engine trong quá trình sinh lịch |
| **FR-26** (Moderate Energy Restr.) | `UC-07` | `RuleEngine.IsValid()` (Giới hạn làm thêm, bù ca cho nhân sự < 70 điểm) | `UserRepository.FindByID()`, `SettingRepository.Get()` | `User`, `SystemSetting` | Cảnh báo Rule Engine trong quá trình sinh lịch |
| **FR-27** (Load Balance Penalty) | `UC-07` | `RuleEngine.CalculateScore()` (Phạt tuần tự ưu tiên) | `ShiftRepository.FindByUserID()` | `Shift`, `User` | Thuật toán xếp lịch tự động |
| **FR-28** (Skills Wastage Penalty) | `UC-07` | `RuleEngine.CalculateScore()` (Phạt lãng phí kỹ năng) | `UserRepository.FindByID()` | `User` | Thuật toán xếp lịch tự động |
| **FR-29** (Understaffed Detect) | `UC-21` | `CoordinationService.DetectUnderstaffedTasks()` | `TaskRepository.Update()` | `Task` | Danh sách Task gặp cảnh báo quá tải trên Dashboard |
| **FR-30** (AI Coordination Suggestions) | `UC-22` | `CoordinationService.GenerateSuggestions()`, `ApplySuggestion()` | `CoordinationRepository.SaveSuggestion()`, `ShiftRepository.Save()` | `CoordinationSuggestion`, `Shift`, `Task` | Khung điều phối AI trên Dashboard (Admin/Manager View) |
| **FR-31** (Burnout Analytics) | `UC-23` | `AnalyticsService.GetAttritionRisks()` | `UserRepository.FindAll()`, `ShiftRepository.FindAll()` | `User`, `Shift` | Menu Báo cáo & Phân tích rủi ro kiệt sức |
| **FR-32** (Succession Planning) | `UC-24` | `AnalyticsService.GetBackupSuggestions()` | `UserRepository.FindAll()`, `ShiftRepository.FindAll()` | `User`, `Shift` | Popup gợi ý nhân sự dự phòng khi điều phối ca |
| **FR-33** (Grade KPI Performance) | `UC-25` | `KPIService.SaveKPI()`, `GetAllKPIs()` | `db *gorm.DB` trực tiếp | `UserKPI` | Màn hình Chấm Lương & Đánh giá KPI (KPI Tab) |
| **FR-34** (Payroll Calculation) | `UC-26` | `PayrollService.CalculatePayroll()`, `GetPayrollRecords()` | `db *gorm.DB` trực tiếp, `ShiftRepository.FindByUserID()` | `PayrollRecord`, `User`, `Shift` | Màn hình Chấm Lương & Đánh giá KPI (Payroll Tab) |
| **FR-35** (Time-Off & Shift Release) | `UC-27`, `UC-28` | `TimeOffService.CreateTimeOffRequest()`, `UpdateRequestStatus()` | `db *gorm.DB` trực tiếp, `ShiftRepository.Delete()` | `TimeOffRequest`, `Shift` | Màn hình Quản lý & Duyệt nghỉ phép (Time-Off Requests) |
| **FR-36** (Import/Export CSV) | `UC-29` | `DataService.ExportShiftsToCSV()`, `ImportShiftsFromCSV()`, `ImportUsersFromCSV()` | `db *gorm.DB` trực tiếp | `User`, `Shift` | Nút Nhập/Xuất CSV trong trang Quản lý nhân viên/Lịch trực |
