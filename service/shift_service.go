package service

import (
	"errors"
	"shift-management/domain"
	"shift-management/repository"
	"time"
)

type shiftService struct {
	repo repository.ShiftRepository
}

func NewShiftService(repo repository.ShiftRepository) ShiftService {
	return &shiftService{repo: repo}
}

func (s *shiftService) ScheduleShift(shift *domain.Shift) error {
	if shift.StartTime.After(shift.EndTime) {
		return errors.New("start time must be before end time")
	}
	return s.repo.Save(shift)
}

func (s *shiftService) GetShiftsByUser(userId uint) ([]*domain.Shift, error) {
	return s.repo.FindByUserID(userId)
}

func (s *shiftService) GetAllShifts() ([]*domain.Shift, error) {
	return s.repo.FindAll()
}

func (s *shiftService) ClockIn(shiftID uint, t time.Time) error {
	shift, err := s.repo.FindByID(shiftID)
	if err != nil {
		return err
	}
	shift.ClockInTime = &t
	shift.Status = "in_progress"
	return s.repo.Save(shift)
}

func (s *shiftService) ClockOut(shiftID uint, t time.Time) error {
	shift, err := s.repo.FindByID(shiftID)
	if err != nil {
		return err
	}
	shift.ClockOutTime = &t
	shift.Status = "completed"
	return s.repo.Save(shift)
}

func (s *shiftService) UpdateShift(id uint, req *domain.Shift) error {
	shift, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	shift.UserID = req.UserID
	shift.StartTime = req.StartTime
	shift.EndTime = req.EndTime
	shift.Notes = req.Notes
	shift.Status = req.Status
	return s.repo.Save(shift)
}

func (s *shiftService) DeleteShift(id uint) error {
	return s.repo.Delete(id)
}
