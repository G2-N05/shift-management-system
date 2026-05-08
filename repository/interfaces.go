package repository

import "shift-management/domain"

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
	Update(swap *domain.ShiftSwap) error
}

// ... other repositories like LocationRepository, TimeOffRepository
