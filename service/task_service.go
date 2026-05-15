package service

import (
	"time"
	"shift-management/domain"
	"shift-management/repository"
)

type taskService struct {
	taskRepo    repository.TaskRepository
	userRepo    repository.UserRepository
	shiftRepo   repository.ShiftRepository
	settingRepo repository.SettingRepository
}

func NewTaskService(tr repository.TaskRepository, ur repository.UserRepository, sr repository.ShiftRepository, setRepo repository.SettingRepository) TaskService {
	return &taskService{
		taskRepo:    tr,
		userRepo:    ur,
		shiftRepo:   sr,
		settingRepo: setRepo,
	}
}

func (s *taskService) CreateTask(task *domain.Task) error {
	task.IsAssigned = false
	return s.taskRepo.Save(task)
}

func (s *taskService) GetAllTasks() ([]*domain.Task, error) {
	return s.taskRepo.FindAll()
}

func (s *taskService) UpdateTask(id uint, req *domain.Task) error {
	task, err := s.taskRepo.FindByID(id)
	if err != nil {
		return err
	}
	task.Title = req.Title
	task.RequiredRole = req.RequiredRole
	task.RequiredSkill = req.RequiredSkill
	task.Headcount = req.Headcount
	task.StartTime = req.StartTime
	task.EndTime = req.EndTime
	return s.taskRepo.Update(task)
}

func (s *taskService) DeleteTask(id uint) error {
	return s.taskRepo.Delete(id)
}

func (s *taskService) AutoScheduleShifts() (int, error) {
	unassignedTasks, err := s.taskRepo.FindUnassigned()
	if err != nil {
		return 0, err
	}

	users, err := s.userRepo.FindAll()
	if err != nil {
		return 0, err
	}

	// Load all existing shifts to calculate constraints
	allShifts, _ := s.shiftRepo.FindAll()
	userShiftsMap := make(map[uint][]domain.Shift)
	for _, shift := range allShifts {
		userShiftsMap[shift.UserID] = append(userShiftsMap[shift.UserID], *shift)
	}

	setting, _ := s.settingRepo.Get()
	maxHours := 8.0
	minRest := 11.0
	if setting != nil {
		if setting.FullShiftHours > 0 {
			maxHours = setting.FullShiftHours
		} else if setting.MaxShiftHours > 0 {
			maxHours = setting.MaxShiftHours
		}
		if setting.MinRestHours > 0 {
			minRest = setting.MinRestHours
		}
	}

	ruleEngine := NewRuleEngine(minRest)
	shiftsScheduled := 0

	for _, task := range unassignedTasks {
		currentStartTime := task.StartTime
		if currentStartTime.Before(time.Now()) {
			currentStartTime = time.Now()
		}

		taskDuration := task.EndTime.Sub(currentStartTime).Hours()
		if taskDuration <= 0 {
			continue
		}

		shiftsNeeded := int(taskDuration / maxHours)
		if taskDuration > float64(shiftsNeeded)*maxHours {
			shiftsNeeded++
		}
		
		for i := 0; i < shiftsNeeded; i++ {
			shiftDuration := maxHours
			if currentStartTime.Add(time.Duration(maxHours * float64(time.Hour))).After(task.EndTime) {
				shiftDuration = task.EndTime.Sub(currentStartTime).Hours()
			}
			shiftEndTime := currentStartTime.Add(time.Duration(shiftDuration * float64(time.Hour)))

			// We need Headcount number of users for this shift segment
			headcountFulfilled := 0
			
			// CSP: Scoring and Selection
			var eligibleUsers []struct {
				User  *domain.User
				Score int
			}

			for idx, user := range users {
				if ruleEngine.IsValid(user, userShiftsMap[user.ID], task.RequiredRole, task.RequiredSkill, currentStartTime, shiftEndTime) {
					score := ruleEngine.CalculateScore(user, userShiftsMap[user.ID], task.RequiredSkill)
					eligibleUsers = append(eligibleUsers, struct {
						User  *domain.User
						Score int
					}{users[idx], score})
				}
			}

			// Sort eligible users by score descending (Bubble sort for simplicity)
			for i := 0; i < len(eligibleUsers)-1; i++ {
				for j := 0; j < len(eligibleUsers)-i-1; j++ {
					if eligibleUsers[j].Score < eligibleUsers[j+1].Score {
						eligibleUsers[j], eligibleUsers[j+1] = eligibleUsers[j+1], eligibleUsers[j]
					}
				}
			}

			// Assign top N users based on Headcount
			for _, item := range eligibleUsers {
				if headcountFulfilled >= task.Headcount {
					break
				}
				
				shift := &domain.Shift{
					UserID:     item.User.ID,
					LocationID: task.LocationID, 
					StartTime:  currentStartTime,
					EndTime:    shiftEndTime,
					Notes:      task.Title,
					Status:     "scheduled",
				}
				
				if err := s.shiftRepo.Save(shift); err == nil {
					shiftsScheduled++
					headcountFulfilled++
					userShiftsMap[item.User.ID] = append(userShiftsMap[item.User.ID], *shift) // update local state
				}
			}
			
			// If we couldn't fulfill the headcount, we still move forward (partial assignment)
			currentStartTime = shiftEndTime
		}
		
		// Mark task as assigned (or partially assigned, but for simplicity we mark it assigned)
		task.IsAssigned = true
		s.taskRepo.Update(task)
	}

	return shiftsScheduled, nil
}

func (s *taskService) ReScheduleShifts() (int, error) {
	now := time.Now()
	
	// 1. Delete all future shifts that are "scheduled"
	allShifts, err := s.shiftRepo.FindAll()
	if err == nil {
		for _, shift := range allShifts {
			if shift.Status == "scheduled" && shift.StartTime.After(now) {
				s.shiftRepo.Delete(shift.ID)
			}
		}
	}

	// 2. Mark future tasks as unassigned so they are re-evaluated
	allTasks, err := s.taskRepo.FindAll()
	if err == nil {
		for _, task := range allTasks {
			if task.IsAssigned && task.EndTime.After(now) {
				task.IsAssigned = false
				s.taskRepo.Update(task)
			}
		}
	}

	// 3. Run AutoSchedule to generate new shifts
	return s.AutoScheduleShifts()
}
