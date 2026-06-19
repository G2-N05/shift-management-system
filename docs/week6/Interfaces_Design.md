# Thiết Kế Hệ Thống Giao Diện (Interfaces Design) - Tuần 6

Tài liệu này đặc tả chi tiết thiết kế hệ thống giao diện (Interfaces) ở tầng Service và Repository của hệ thống.

---

## 1. Giao diện (Interfaces) ở tầng Service

Các giao diện được định nghĩa tại [service/interfaces.go](file:///d:/Workspace/TBDD/shift-management-system/service/interfaces.go), đóng vai trò đặc tả hành vi nghiệp vụ của hệ thống:

```go
type UserService interface {
	RegisterUser(user *domain.User) error
	Authenticate(email, password string) (*domain.User, error)
	GetAllUsers() ([]*domain.User, error)
	GetUserByID(id uint) (*domain.User, error)
	UpdateUser(id uint, req *domain.User) error
	DeleteUser(id uint) error
}

type ShiftService interface {
	ScheduleShift(shift *domain.Shift) error
	GetShiftsByUser(userId uint) ([]*domain.Shift, error)
	GetAllShifts() ([]*domain.Shift, error)
	ClockIn(shiftID uint, t time.Time) error
	ClockOut(shiftID uint, t time.Time) error
	UpdateShift(id uint, shift *domain.Shift) error
	DeleteShift(id uint) error
}

type TimeOffService interface {
	CreateTimeOffRequest(userID uint, req *domain.TimeOffRequest) error
	GetMyTimeOffRequests(userID uint) ([]domain.TimeOffRequest, error)
	GetAllPendingRequests() ([]domain.TimeOffRequest, error)
	UpdateRequestStatus(requestID uint, status domain.TimeOffStatus) error
}

type TaskService interface {
	CreateTask(task *domain.Task) error
	GetAllTasks() ([]*domain.Task, error)
	UpdateTask(id uint, task *domain.Task) error
	DeleteTask(id uint) error
	AutoScheduleShifts() (int, error)
	ReScheduleShifts() (int, error)
}

type CoordinationService interface {
	DetectUnderstaffedTasks() error
	GenerateSuggestions(taskID uint) ([]*domain.CoordinationSuggestion, error)
	ApplySuggestion(suggestionID uint) error
}

type SettingService interface {
	GetSetting() (*domain.SystemSetting, error)
	UpdateSetting(setting *domain.SystemSetting) error
}

type ShiftSwapService interface {
	RequestSwap(requesterID, targetUserID, shiftID uint) (*domain.ShiftSwap, error)
	ApproveSwap(swapID uint) error
	RejectSwap(swapID uint) error
	GetPendingSwaps() ([]*domain.ShiftSwap, error)
	AutoSwap(requesterID, shiftID uint) error
	AssignSwap(swapID, targetUserID uint) error
}

type AnalyticsService interface {
	GetAttritionRisks() ([]*domain.AttritionRisk, error)
	GetBackupSuggestions(targetUserID uint) ([]*domain.BackupSuggestion, error)
}

type HealthService interface {
	SubmitDeclaration(decl *domain.HealthDeclaration) error
	GetPendingDeclarations() ([]*domain.HealthDeclaration, error)
	GetKnownConditions() ([]*domain.KnownCondition, error)
	UpdateKnownCondition(id uint, newCondition string, newPoints int) error
	SuggestPoints(condition string) int
	ApproveDeclaration(id uint, pointsDeducted int, adminNotes string) error
	RejectDeclaration(id uint, adminNotes string) error
}

type NotificationService interface {
	CreateNotification(userID uint, message string) error
	GetNotifications(userID uint) ([]domain.Notification, error)
	MarkAsRead(notificationID uint) error
	MarkAllAsRead(userID uint) error
	DeleteNotificationByMessage(userID uint, message string) error
}
```

---

## 2. Giao diện (Interfaces) ở tầng Repository

Định nghĩa tại [repository/interfaces.go](file:///d:/Workspace/TBDD/shift-management-system/repository/interfaces.go), đóng vai trò trừu tượng hóa các câu lệnh SQL với cơ sở dữ liệu:

```go
type UserRepository interface {
	Save(user *domain.User) error
	FindAll() ([]*domain.User, error)
	FindByID(id uint) (*domain.User, error)
	FindByUsername(username string) (*domain.User, error)
	Update(user *domain.User) error
	Delete(id uint) error
}

type ShiftRepository interface {
	Save(shift *domain.Shift) error
	FindByUserID(userID uint) ([]*domain.Shift, error)
	FindAll() ([]*domain.Shift, error)
	Delete(id uint) error
	FindByID(id uint) (*domain.Shift, error)
	Update(shift *domain.Shift) error
}

type TaskRepository interface {
	Save(task *domain.Task) error
	FindAll() ([]*domain.Task, error)
	FindUnassigned() ([]*domain.Task, error)
	Update(task *domain.Task) error
	FindByID(id uint) (*domain.Task, error)
	Delete(id uint) error
}

type SettingRepository interface {
	Get() (*domain.SystemSetting, error)
	Update(setting *domain.SystemSetting) error
}

type ShiftSwapRepository interface {
	Save(swap *domain.ShiftSwap) error
	FindByID(id uint) (*domain.ShiftSwap, error)
	FindByStatus(status string) ([]*domain.ShiftSwap, error)
	FindByShiftID(shiftID uint) ([]*domain.ShiftSwap, error)
	Update(swap *domain.ShiftSwap) error
}

type CoordinationRepository interface {
	SaveSuggestion(suggestion *domain.CoordinationSuggestion) error
	GetSuggestionsByTask(taskID uint) ([]*domain.CoordinationSuggestion, error)
	FindSuggestionByID(id uint) (*domain.CoordinationSuggestion, error)
	UpdateSuggestion(suggestion *domain.CoordinationSuggestion) error
}
```
