package service

import (
	"shift-management/domain"
	"time"

	"gorm.io/gorm"
)

type PayrollService struct {
	db *gorm.DB
}

func NewPayrollService(db *gorm.DB) *PayrollService {
	return &PayrollService{db: db}
}

// CalculatePayroll computes the payroll for all users for a given month and year
func (s *PayrollService) CalculatePayroll(month, year int) ([]domain.PayrollRecord, error) {
	var users []domain.User
	if err := s.db.Find(&users).Error; err != nil {
		return nil, err
	}

	var records []domain.PayrollRecord

	for _, user := range users {
		if user.Role == domain.RoleAdmin {
			continue // Do not count salary for admins
		}

		// 1. Get Shifts for this user in this month/year
		// Assuming shift start time is what counts for the month.
		// Start of month:
		startOfMonth := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
		endOfMonth := startOfMonth.AddDate(0, 1, 0)

		var shifts []domain.Shift
		if err := s.db.Where("user_id = ? AND start_time >= ? AND start_time < ?", user.ID, startOfMonth, endOfMonth).Find(&shifts).Error; err != nil {
			continue
		}

		var totalHours float64 = 0
		for _, shift := range shifts {
			// If they clocked out, use actual time, otherwise scheduled time
			startTime := shift.StartTime
			endTime := shift.EndTime
			if shift.ClockInTime != nil {
				startTime = *shift.ClockInTime
			}
			if shift.ClockOutTime != nil {
				endTime = *shift.ClockOutTime
			}
			
			dur := endTime.Sub(startTime).Hours()
			if dur > 0 {
				totalHours += dur
			}
		}

		// 2. Base pay
		baseRate := user.BaseHourlyRate
		if baseRate == 0 {
			var setting domain.SystemSetting
			s.db.First(&setting)
			if setting.DefaultBaseHourlyRate > 0 {
				baseRate = setting.DefaultBaseHourlyRate
			} else {
				baseRate = 20.0 // fallback default
			}
		}
		basePay := totalHours * baseRate

		// 3. Get KPI Multiplier
		var kpi domain.UserKPI
		multiplier := 1.0
		err := s.db.Where("user_id = ? AND month = ? AND year = ?", user.ID, month, year).First(&kpi).Error
		if err == nil && kpi.Multiplier > 0 {
			multiplier = kpi.Multiplier
		}

		totalPay := basePay * multiplier
		bonusPay := totalPay - basePay

		record := domain.PayrollRecord{
			UserID:     user.ID,
			Month:      month,
			Year:       year,
			TotalHours: totalHours,
			BaseRate:   baseRate,
			BasePay:    basePay,
			BonusPay:   bonusPay,
			TotalPay:   totalPay,
		}

		// Save or update
		var existing domain.PayrollRecord
		if err := s.db.Where("user_id = ? AND month = ? AND year = ?", user.ID, month, year).First(&existing).Error; err == nil {
			record.ID = existing.ID
			record.IsPaid = existing.IsPaid
			s.db.Save(&record)
		} else {
			s.db.Create(&record)
		}

		records = append(records, record)
	}

	return records, nil
}

func (s *PayrollService) GetPayrollRecords(month, year int) ([]domain.PayrollRecord, error) {
	var records []domain.PayrollRecord
	err := s.db.Where("month = ? AND year = ?", month, year).Find(&records).Error
	return records, err
}

func (s *PayrollService) MarkAsPaid(id uint) error {
	return s.db.Model(&domain.PayrollRecord{}).Where("id = ?", id).Update("is_paid", true).Error
}
