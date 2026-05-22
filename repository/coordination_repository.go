package repository

import (
	"shift-management/domain"
	"gorm.io/gorm"
)

type CoordinationRepository interface {
	SaveSuggestion(suggestion *domain.CoordinationSuggestion) error
	GetSuggestionsByTask(taskID uint) ([]*domain.CoordinationSuggestion, error)
	FindSuggestionByID(id uint) (*domain.CoordinationSuggestion, error)
	UpdateSuggestion(suggestion *domain.CoordinationSuggestion) error
}

type coordinationRepository struct {
	db *gorm.DB
}

func NewCoordinationRepository(db *gorm.DB) CoordinationRepository {
	return &coordinationRepository{db: db}
}

func (r *coordinationRepository) SaveSuggestion(suggestion *domain.CoordinationSuggestion) error {
	return r.db.Create(suggestion).Error
}

func (r *coordinationRepository) GetSuggestionsByTask(taskID uint) ([]*domain.CoordinationSuggestion, error) {
	var suggestions []*domain.CoordinationSuggestion
	err := r.db.Where("task_id = ?", taskID).Find(&suggestions).Error
	return suggestions, err
}

func (r *coordinationRepository) FindSuggestionByID(id uint) (*domain.CoordinationSuggestion, error) {
	var suggestion domain.CoordinationSuggestion
	err := r.db.First(&suggestion, id).Error
	return &suggestion, err
}

func (r *coordinationRepository) UpdateSuggestion(suggestion *domain.CoordinationSuggestion) error {
	return r.db.Save(suggestion).Error
}
