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

// Helper to parse HH:MM into a time.Time on the same day as baseDate
func parseTimeOnDate(baseDate time.Time, timeStr string, defaultTime string) time.Time {
	if timeStr == "" {
		timeStr = defaultTime
	}
	t, err := time.Parse("15:04", timeStr)
	if err != nil {
		t, _ = time.Parse("15:04", defaultTime)
	}
	return time.Date(baseDate.Year(), baseDate.Month(), baseDate.Day(), t.Hour(), t.Minute(), 0, 0, baseDate.Location())
}

// Helper to find the next valid shift window (start and end times)
func getNextShiftWindow(currentTime time.Time, setting *domain.SystemSetting) (time.Time, time.Time) {
	mStartStr, mEndStr := "08:00", "12:00"
	aStartStr, aEndStr := "13:00", "17:00"
	if setting != nil {
		if setting.MorningShiftStart != "" { mStartStr = setting.MorningShiftStart }
		if setting.MorningShiftEnd != "" { mEndStr = setting.MorningShiftEnd }
		if setting.AfternoonShiftStart != "" { aStartStr = setting.AfternoonShiftStart }
		if setting.AfternoonShiftEnd != "" { aEndStr = setting.AfternoonShiftEnd }
	}

	for {
		mStart := parseTimeOnDate(currentTime, mStartStr, "08:00")
		mEnd := parseTimeOnDate(currentTime, mEndStr, "12:00")
		aStart := parseTimeOnDate(currentTime, aStartStr, "13:00")
		aEnd := parseTimeOnDate(currentTime, aEndStr, "17:00")

		if currentTime.Before(mStart) {
			return mStart, mEnd
		} else if currentTime.Before(mEnd) {
			return currentTime, mEnd
		} else if currentTime.Before(aStart) {
			return aStart, aEnd
		} else if currentTime.Before(aEnd) {
			return currentTime, aEnd
		}
		
		// Move to next day
		currentTime = time.Date(currentTime.Year(), currentTime.Month(), currentTime.Day()+1, 0, 0, 0, 0, currentTime.Location())
	}
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
	task.WorkModel = req.WorkModel
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
	minRest := 11.0
	if setting != nil {
		if setting.MinRestHours > 0 {
			minRest = setting.MinRestHours
		}
	}

	ruleEngine := NewRuleEngine(minRest, setting)
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

		if task.WorkModel == "Sequential" && task.Headcount > 1 {
			// Sequential: each person takes a fraction of the TOTAL task duration.
			// To keep it simple but respectful of windows, we calculate the total needed man-hours.
			// But for Sequential, it's easier to just split the task chronologically by windows, 
			// and assign 1 person per window until the task is complete.
			shiftsNeeded := task.Headcount
			headcountAssigned := 0

			for currentStartTime.Before(task.EndTime) && headcountAssigned < shiftsNeeded {
				shiftStart, windowEnd := getNextShiftWindow(currentStartTime, setting)
				if shiftStart.After(task.EndTime) {
					break // Task ends before the next window starts
				}
				
				shiftEndTime := windowEnd
				if task.EndTime.Before(windowEnd) {
					shiftEndTime = task.EndTime
				}

				// If we only have 1 shift needed, it covers this whole block
				headcountFulfilled := 0
				var eligibleUsers []struct {
					User  *domain.User
					Score int
				}

				for idx, user := range users {
					if ruleEngine.IsValid(user, userShiftsMap[user.ID], task.RequiredRole, task.RequiredSkill, shiftStart, shiftEndTime, false) {
						score := ruleEngine.CalculateScore(user, userShiftsMap[user.ID], task.RequiredSkill)
						eligibleUsers = append(eligibleUsers, struct {
							User  *domain.User
							Score int
						}{users[idx], score})
					}
				}

				// Sort by score ascending (lowest energy/workload gets priority)
				for i := 0; i < len(eligibleUsers)-1; i++ {
					for j := 0; j < len(eligibleUsers)-i-1; j++ {
						if eligibleUsers[j].Score > eligibleUsers[j+1].Score {
							eligibleUsers[j], eligibleUsers[j+1] = eligibleUsers[j+1], eligibleUsers[j]
						}
					}
				}

				// Assign exactly 1 person for this segment
				for _, item := range eligibleUsers {
					if headcountFulfilled >= 1 {
						break
					}
					shift := &domain.Shift{
						UserID:     item.User.ID,
						LocationID: task.LocationID,
						StartTime:  shiftStart,
						EndTime:    shiftEndTime,
						Notes:      task.Title,
						Status:     "scheduled",
					}
					if err := s.shiftRepo.Save(shift); err == nil {
						shiftsScheduled++
						headcountFulfilled++
						headcountAssigned++
						userShiftsMap[item.User.ID] = append(userShiftsMap[item.User.ID], *shift)
					}
				}
				currentStartTime = shiftEndTime
			}
		} else {
			// Parallel (or Headcount == 1)
			for currentStartTime.Before(task.EndTime) {
				shiftStart, windowEnd := getNextShiftWindow(currentStartTime, setting)
				if shiftStart.After(task.EndTime) || shiftStart.Equal(task.EndTime) {
					break // Task ends before the next window starts
				}
				
				shiftEndTime := windowEnd
				if task.EndTime.Before(windowEnd) {
					shiftEndTime = task.EndTime
				}

				headcountFulfilled := 0
				var eligibleUsers []struct {
					User  *domain.User
					Score int
				}

				for idx, user := range users {
					if ruleEngine.IsValid(user, userShiftsMap[user.ID], task.RequiredRole, task.RequiredSkill, shiftStart, shiftEndTime, false) {
						score := ruleEngine.CalculateScore(user, userShiftsMap[user.ID], task.RequiredSkill)
						eligibleUsers = append(eligibleUsers, struct {
							User  *domain.User
							Score int
						}{users[idx], score})
					}
				}

				// Sort by score ascending (lowest energy/workload gets priority)
				for i := 0; i < len(eligibleUsers)-1; i++ {
					for j := 0; j < len(eligibleUsers)-i-1; j++ {
						if eligibleUsers[j].Score > eligibleUsers[j+1].Score {
							eligibleUsers[j], eligibleUsers[j+1] = eligibleUsers[j+1], eligibleUsers[j]
						}
					}
				}

				for _, item := range eligibleUsers {
					if headcountFulfilled >= task.Headcount {
						break
					}
					shift := &domain.Shift{
						UserID:     item.User.ID,
						LocationID: task.LocationID, 
						StartTime:  shiftStart,
						EndTime:    shiftEndTime,
						Notes:      task.Title,
						Status:     "scheduled",
					}
					if err := s.shiftRepo.Save(shift); err == nil {
						shiftsScheduled++
						headcountFulfilled++
						userShiftsMap[item.User.ID] = append(userShiftsMap[item.User.ID], *shift)
					}
				}
				currentStartTime = shiftEndTime
			}
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
