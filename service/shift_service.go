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
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if shift.StartTime.Before(startOfToday) {
		return errors.New("cannot create shift for a past date")
	}
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

	// Check if user already has a shift in progress
	userShifts, err := s.repo.FindByUserID(shift.UserID)
	if err == nil {
		for _, us := range userShifts {
			if us.Status == "in_progress" {
				return errors.New("you already have another shift in progress. Please clock out first")
			}
		}
	}
	// Time validation: only allow clock in 30 minutes before StartTime and before EndTime
	earliestClockIn := shift.StartTime.Add(-30 * time.Minute)
	if t.Before(earliestClockIn) {
		return errors.New("it's too early to clock in. You can clock in up to 30 minutes before the shift starts")
	}
	if t.After(shift.EndTime) {
		return errors.New("this shift has already ended")
	}

	shift.ClockInTime = &t
	shift.Status = "in_progress"
	return s.repo.Save(shift)
}

func (s *shiftService) ClockOut(shiftID uint, t time.Time, proofImage string) error {
	shift, err := s.repo.FindByID(shiftID)
	if err != nil {
		return err
	}
	shift.ClockOutTime = &t
	shift.ProofImage = proofImage
	shift.Status = "completed"
	return s.repo.Save(shift)
}

func (s *shiftService) UpdateShift(id uint, req *domain.Shift) error {
	now := time.Now()
	startOfToday := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	if req.StartTime.Before(startOfToday) {
		return errors.New("cannot update shift to a past date")
	}

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
