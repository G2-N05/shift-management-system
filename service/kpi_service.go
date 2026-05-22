package service

import (
	"errors"
	"shift-management/domain"

	"gorm.io/gorm"
)

type KPIService struct {
	db *gorm.DB
}

func NewKPIService(db *gorm.DB) *KPIService {
	return &KPIService{db: db}
}

func (s *KPIService) GetKPI(userID uint, month, year int) (*domain.UserKPI, error) {
	var kpi domain.UserKPI
	err := s.db.Where("user_id = ? AND month = ? AND year = ?", userID, month, year).First(&kpi).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // Not found is not an error here, just return nil
		}
		return nil, err
	}
	return &kpi, nil
}

func (s *KPIService) SaveKPI(kpi *domain.UserKPI) error {
	var existing domain.UserKPI
	err := s.db.Where("user_id = ? AND month = ? AND year = ?", kpi.UserID, kpi.Month, kpi.Year).First(&existing).Error
	if err == nil {
		kpi.ID = existing.ID
		return s.db.Save(kpi).Error
	}
	return s.db.Create(kpi).Error
}

func (s *KPIService) GetAllKPIs(month, year int) ([]domain.UserKPI, error) {
	var kpis []domain.UserKPI
	err := s.db.Where("month = ? AND year = ?", month, year).Find(&kpis).Error
	return kpis, err
}
