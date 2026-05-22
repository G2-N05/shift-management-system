package service

import (
	"fmt"
	"shift-management/domain"
	"shift-management/repository"
	"time"
)

type coordinationService struct {
	taskRepo   repository.TaskRepository
	shiftRepo  repository.ShiftRepository
	userRepo   repository.UserRepository
	settingRepo repository.SettingRepository
	coordRepo  repository.CoordinationRepository
}

func NewCoordinationService(
	tr repository.TaskRepository,
	sr repository.ShiftRepository,
	ur repository.UserRepository,
	setRepo repository.SettingRepository,
	cr repository.CoordinationRepository,
) CoordinationService {
	return &coordinationService{
		taskRepo:    tr,
		shiftRepo:   sr,
		userRepo:    ur,
		settingRepo: setRepo,
		coordRepo:   cr,
	}
}

func (s *coordinationService) DetectUnderstaffedTasks() error {
	tasks, err := s.taskRepo.FindAll()
	if err != nil {
		return err
	}

	shifts, err := s.shiftRepo.FindAll()
	if err != nil {
		return err
	}

	now := time.Now()

	for _, task := range tasks {
		if task.EndTime.Before(now) || task.IsScheduled == false {
			continue // skip past or unscheduled tasks
		}

		// Count active shifts for this task (matching Location and overlapping Time roughly)
		// For simplicity, we just count shifts that fall within this task's time and location
		// In a real system, Shift should have a TaskID. We'll use time/location matching.
		activeShifts := 0
		for _, shift := range shifts {
			if shift.LocationID == task.LocationID && shift.Status != "cancelled" &&
				((shift.StartTime.After(task.StartTime) || shift.StartTime.Equal(task.StartTime)) &&
				(shift.StartTime.Before(task.EndTime))) {
				activeShifts++
			}
		}

		if activeShifts == 0 && task.Headcount > 0 { // "Khi tất cả nhân viên trong ca làm được xác nhận nghỉ"
			if task.CoordinationStatus != "Understaffed" {
				task.CoordinationStatus = "Understaffed"
				s.taskRepo.Update(task)
			}
		} else if activeShifts >= task.Headcount && task.CoordinationStatus == "Understaffed" {
			task.CoordinationStatus = "Resolved"
			s.taskRepo.Update(task)
		}
	}
	return nil
}

func (s *coordinationService) GenerateSuggestions(taskID uint) ([]*domain.CoordinationSuggestion, error) {
	task, err := s.taskRepo.FindByID(taskID)
	if err != nil {
		return nil, err
	}

	// Delete old suggestions
	oldSuggestions, _ := s.coordRepo.GetSuggestionsByTask(taskID)
	// (Should physically delete or soft delete, we'll just ignore for now or return existing if they exist and are unapproved)
	if len(oldSuggestions) > 0 {
		hasUnapproved := false
		for _, sugg := range oldSuggestions {
			if !sugg.IsApproved {
				hasUnapproved = true
			}
		}
		if hasUnapproved {
			return oldSuggestions, nil
		}
	}

	users, _ := s.userRepo.FindAll()
	allShifts, _ := s.shiftRepo.FindAll()
	userShiftsMap := make(map[uint][]domain.Shift)
	for _, shift := range allShifts {
		userShiftsMap[shift.UserID] = append(userShiftsMap[shift.UserID], *shift)
	}

	setting, _ := s.settingRepo.Get()
	minRest := 11.0
	if setting != nil && setting.MinRestHours > 0 {
		minRest = setting.MinRestHours
	}

	ruleEngine := NewRuleEngine(minRest, setting)
	var generated []*domain.CoordinationSuggestion

	// Step 1: Matching Algorithm (Normal)
	foundEligible := false
	for _, user := range users {
		if ruleEngine.IsValid(user, userShiftsMap[user.ID], task.RequiredRole, task.RequiredSkill, task.StartTime, task.EndTime, false) {
			score := ruleEngine.CalculateScore(user, userShiftsMap[user.ID], task.RequiredSkill)
			userID := user.ID
			sugg := &domain.CoordinationSuggestion{
				TaskID:        task.ID,
				Type:          domain.SuggestionTypeReplacement,
				SuggestedUser: &userID,
				Reasoning:     fmt.Sprintf("User %s is available and has the required skill.", user.Name),
				RiskScore:     100 - score, // higher score = lower risk
			}
			s.coordRepo.SaveSuggestion(sugg)
			generated = append(generated, sugg)
			foundEligible = true
		}
	}

	// Step 2: If no normal replacement, check urgency and suggest Overtime / Reschedule
	if !foundEligible {
		if task.UrgencyLevel == "High" || task.UrgencyLevel == "Critical" {
			// Suggest Overtime
			for _, user := range users {
				if ruleEngine.IsValid(user, userShiftsMap[user.ID], task.RequiredRole, task.RequiredSkill, task.StartTime, task.EndTime, true) {
					// User is valid ONLY if we allow overtime
					userID := user.ID
					sugg := &domain.CoordinationSuggestion{
						TaskID:        task.ID,
						Type:          domain.SuggestionTypeOvertime,
						SuggestedUser: &userID,
						Reasoning:     fmt.Sprintf("User %s can cover this but it requires overtime (ignoring max hours).", user.Name),
						RiskScore:     80, // High risk of burnout
					}
					s.coordRepo.SaveSuggestion(sugg)
					generated = append(generated, sugg)
				}
			}
		}

		// Suggest Rescheduling
		nextDayStart := task.StartTime.Add(24 * time.Hour)
		nextDayEnd := task.EndTime.Add(24 * time.Hour)
		sugg := &domain.CoordinationSuggestion{
			TaskID:         task.ID,
			Type:           domain.SuggestionTypeReschedule,
			SuggestedStart: &nextDayStart,
			SuggestedEnd:   &nextDayEnd,
			Reasoning:      "No available staff. Suggesting to reschedule to tomorrow.",
			RiskScore:      40, // Medium risk (customer might be unhappy)
		}
		s.coordRepo.SaveSuggestion(sugg)
		generated = append(generated, sugg)
	}

	return generated, nil
}

func (s *coordinationService) ApplySuggestion(suggestionID uint) error {
	sugg, err := s.coordRepo.FindSuggestionByID(suggestionID)
	if err != nil {
		return err
	}

	task, err := s.taskRepo.FindByID(sugg.TaskID)
	if err != nil {
		return err
	}

	if sugg.Type == domain.SuggestionTypeReplacement || sugg.Type == domain.SuggestionTypeOvertime {
		// Create a new shift for the suggested user
		shift := &domain.Shift{
			UserID:     *sugg.SuggestedUser,
			LocationID: task.LocationID,
			StartTime:  task.StartTime,
			EndTime:    task.EndTime,
			Notes:      task.Title + " (Covered via Coordination)",
			Status:     "scheduled",
		}
		if err := s.shiftRepo.Save(shift); err != nil {
			return err
		}
	} else if sugg.Type == domain.SuggestionTypeReschedule {
		// Update task time
		task.StartTime = *sugg.SuggestedStart
		task.EndTime = *sugg.SuggestedEnd
		s.taskRepo.Update(task)
	}

	sugg.IsApproved = true
	s.coordRepo.UpdateSuggestion(sugg)

	task.CoordinationStatus = "Resolved"
	s.taskRepo.Update(task)

	return nil
}
