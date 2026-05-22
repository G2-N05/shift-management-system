package service

import (
	"errors"

	"shift-management/domain"
	"gorm.io/gorm"
)

type timeOffService struct {
	db *gorm.DB
}

func NewTimeOffService(db *gorm.DB) TimeOffService {
	return &timeOffService{db: db}
}

func (s *timeOffService) CreateTimeOffRequest(userID uint, req *domain.TimeOffRequest) error {
	if req.StartDate.After(req.EndDate) {
		return errors.New("start date cannot be after end date")
	}
	if req.DurationHours <= 0 {
		return errors.New("duration must be greater than 0")
	}

	req.UserID = userID
	req.Status = domain.StatusPending
	return s.db.Create(req).Error
}

func (s *timeOffService) GetMyTimeOffRequests(userID uint) ([]domain.TimeOffRequest, error) {
	var requests []domain.TimeOffRequest
	err := s.db.Where("user_id = ?", userID).Order("created_at desc").Find(&requests).Error
	return requests, err
}

func (s *timeOffService) GetAllPendingRequests() ([]domain.TimeOffRequest, error) {
	var requests []domain.TimeOffRequest
	err := s.db.Where("status = ?", domain.StatusPending).Order("created_at asc").Find(&requests).Error
	return requests, err
}

func (s *timeOffService) UpdateRequestStatus(requestID uint, status domain.TimeOffStatus) error {
	var req domain.TimeOffRequest
	if err := s.db.First(&req, requestID).Error; err != nil {
		return err
	}
	
	req.Status = status
	
	if status == domain.StatusApproved {
		// Cancel any shifts the user was assigned to during this period
		// Find shifts overlapping with this time off
		var shifts []domain.Shift
		s.db.Where("user_id = ? AND start_time < ? AND end_time > ?", req.UserID, req.EndDate, req.StartDate).Find(&shifts)
		
		for _, shift := range shifts {
			// Simply remove the user from the shift by clearing UserID and setting status back to pending
			// In a real app we might want to flag the shift as needing reassignment instead of modifying it directly
			s.db.Model(&shift).Updates(map[string]interface{}{
				"user_id": nil,
				"status": "pending",
			})
		}
	}

	return s.db.Save(&req).Error
}
