package service

import (
	"shift-management/domain"
	"time"
)

type RuleEngine struct {
	MinRestHours float64
	Setting      *domain.SystemSetting
}

func NewRuleEngine(minRest float64, setting *domain.SystemSetting) *RuleEngine {
	return &RuleEngine{MinRestHours: minRest, Setting: setting}
}

// IsValid checks all hard constraints for assigning a user to a task segment
func (e *RuleEngine) IsValid(user *domain.User, userShifts []domain.Shift, requiredRole domain.Role, requiredSkill int, startTime time.Time, endTime time.Time, allowOvertime bool) bool {
	// 1. Check Role & Skill Level
	if user.Role != requiredRole {
		return false
	}
	if user.SkillLevel < requiredSkill {
		return false
	}

	// 2. Calculate Weekly Hours & OT Limit
	var weeklyHours float64
	yTarget, wTarget := startTime.ISOWeek()
	targetDayString := startTime.Format("2006-01-02")
	prevDayString := startTime.Add(-24 * time.Hour).Format("2006-01-02")
	
	targetDayShifts := 0
	prevDayShifts := 0
	shiftsPerDayInWeek := make(map[string]int)

	for _, s := range userShifts {
		yShift, wShift := s.StartTime.ISOWeek()
		dayStr := s.StartTime.Format("2006-01-02")
		
		if yShift == yTarget && wShift == wTarget {
			weeklyHours += s.EndTime.Sub(s.StartTime).Hours()
			shiftsPerDayInWeek[dayStr]++
			if dayStr == targetDayString {
				targetDayShifts++
			}
		}
		
		if dayStr == prevDayString {
			prevDayShifts++
		}
	}
	shiftDuration := endTime.Sub(startTime).Hours()
	if !allowOvertime && weeklyHours+shiftDuration > float64(user.MaxWeeklyHours) {
		return false
	}

	// 3. Overlap and Rest Hours Check (11-hour rule)
	for _, s := range userShifts {
		// Overlap check
		if s.StartTime.Before(endTime) && s.EndTime.After(startTime) {
			return false // Cannot work two shifts at the same time
		}
		
		// Rest hours check (Before)
		if s.EndTime.Before(startTime) || s.EndTime.Equal(startTime) {
			restTime := startTime.Sub(s.EndTime).Hours()
			if restTime < e.MinRestHours {
				return false
			}
		}
		
		// Rest hours check (After)
		if s.StartTime.After(endTime) || s.StartTime.Equal(endTime) {
			restTime := s.StartTime.Sub(endTime).Hours()
			if !allowOvertime && restTime < e.MinRestHours {
				return false
			}
		}
	}

	// 4. AI Health-Based Scheduling Rules
	shiftsPerDayInWeek[targetDayString]++
	weeklyOTCount := 0
	for _, count := range shiftsPerDayInWeek {
		if count >= 2 {
			weeklyOTCount++
		}
	}

	if e.Setting != nil {
		if user.EnergyScore < e.Setting.HealthThresholdLow {
			if targetDayShifts >= 1 {
				return false // Max 1 shift per day
			}
		} else if user.EnergyScore < e.Setting.HealthThresholdModerate {
			if prevDayShifts >= 2 && targetDayShifts >= 1 {
				return false // Alternating heavy shifts: if yesterday was heavy, today is light
			}
			if weeklyOTCount > e.Setting.ModerateHealthMaxOTPerWeek {
				return false // Max OT (heavy days) per week
			}
		}
	}

	return true
}

// CalculateScore calculates a heuristic score to pick the best user
func (e *RuleEngine) CalculateScore(user *domain.User, userShifts []domain.Shift, requiredSkill int) int {
	score := 100
	
	// Penalize users who already have a lot of hours (Balance workload)
	var weeklyHours float64
	yTarget, wTarget := time.Now().ISOWeek()
	for _, s := range userShifts {
		yShift, wShift := s.StartTime.ISOWeek()
		if yShift == yTarget && wShift == wTarget {
			weeklyHours += s.EndTime.Sub(s.StartTime).Hours()
		}
	}
	score -= int(weeklyHours * 2) // deduct 2 points per hour worked

	// Penalize over-qualification (Save highly skilled users for harder tasks)
	skillDiff := user.SkillLevel - requiredSkill
	score -= skillDiff * 10 

	return score
}
