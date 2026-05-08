package repository

import (
	"shift-management/domain"

	"gorm.io/gorm"
)

type taskRepo struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) TaskRepository {
	return &taskRepo{db: db}
}

func (r *taskRepo) Save(task *domain.Task) error {
	return r.db.Create(task).Error
}

func (r *taskRepo) FindAll() ([]*domain.Task, error) {
	var tasks []*domain.Task
	err := r.db.Find(&tasks).Error
	return tasks, err
}

func (r *taskRepo) FindUnassigned() ([]*domain.Task, error) {
	var tasks []*domain.Task
	err := r.db.Where("is_assigned = ?", false).Find(&tasks).Error
	return tasks, err
}

func (r *taskRepo) Update(task *domain.Task) error {
	return r.db.Save(task).Error
}

func (r *taskRepo) FindByID(id uint) (*domain.Task, error) {
	var task domain.Task
	err := r.db.First(&task, id).Error
	return &task, err
}

func (r *taskRepo) Delete(id uint) error {
	return r.db.Delete(&domain.Task{}, id).Error
}
