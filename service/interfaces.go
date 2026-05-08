package service

import (
	"shift-management/domain"
	"time"
)

type UserService interface {
	RegisterUser(user *domain.User) error
	Authenticate(email, password string) (*domain.User, error)
	GetAllUsers() ([]*domain.User, error)
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
	SubmitRequest(req *domain.TimeOffRequest) error
	ReviewRequest(reqId uint, status domain.TimeOffStatus) error
}

type TaskService interface {
	CreateTask(task *domain.Task) error
	GetAllTasks() ([]*domain.Task, error)
	UpdateTask(id uint, task *domain.Task) error
	DeleteTask(id uint) error
	AutoScheduleShifts() (int, error) // Returns number of shifts scheduled
}

type SettingService interface {
	GetSetting() (*domain.SystemSetting, error)
	UpdateSetting(maxHours float64) error
}

type ShiftSwapService interface {
	RequestSwap(requesterID, targetUserID, shiftID uint) (*domain.ShiftSwap, error)
	ApproveSwap(swapID uint) error
	RejectSwap(swapID uint) error
	GetPendingSwaps() ([]*domain.ShiftSwap, error)
	AutoSwap(requesterID, shiftID uint) error
}

type AnalyticsService interface {
	GetAttritionRisks() ([]*domain.AttritionRisk, error)
	GetBackupSuggestions(targetUserID uint) ([]*domain.BackupSuggestion, error)
}
