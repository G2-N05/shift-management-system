package service

import (
	"encoding/csv"
	"fmt"
	"io"
	"shift-management/domain"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type DataService struct {
	db *gorm.DB
}

func NewDataService(db *gorm.DB) *DataService {
	return &DataService{db: db}
}

// ExportShiftsToCSV writes all shifts to a CSV writer
func (s *DataService) ExportShiftsToCSV(writer io.Writer) error {
	var shifts []domain.Shift
	if err := s.db.Find(&shifts).Error; err != nil {
		return err
	}

	csvWriter := csv.NewWriter(writer)
	// Write Header
	header := []string{"ID", "UserID", "LocationID", "StartTime", "EndTime", "ClockInTime", "ClockOutTime", "Notes", "Status"}
	if err := csvWriter.Write(header); err != nil {
		return err
	}

	for _, shift := range shifts {
		clockIn := ""
		if shift.ClockInTime != nil {
			clockIn = shift.ClockInTime.Format(time.RFC3339)
		}
		clockOut := ""
		if shift.ClockOutTime != nil {
			clockOut = shift.ClockOutTime.Format(time.RFC3339)
		}

		row := []string{
			fmt.Sprintf("%d", shift.ID),
			fmt.Sprintf("%d", shift.UserID),
			fmt.Sprintf("%d", shift.LocationID),
			shift.StartTime.Format(time.RFC3339),
			shift.EndTime.Format(time.RFC3339),
			clockIn,
			clockOut,
			shift.Notes,
			shift.Status,
		}
		if err := csvWriter.Write(row); err != nil {
			return err
		}
	}

	csvWriter.Flush()
	return csvWriter.Error()
}

// ImportShiftsFromCSV reads shifts from a CSV reader and creates them
func (s *DataService) ImportShiftsFromCSV(reader io.Reader) (int, error) {
	csvReader := csv.NewReader(reader)
	records, err := csvReader.ReadAll()
	if err != nil {
		return 0, err
	}

	if len(records) <= 1 {
		return 0, nil // No data or only header
	}

	count := 0
	// Skip header (i=0)
	for i := 1; i < len(records); i++ {
		row := records[i]
		if len(row) < 9 {
			continue // skip malformed row
		}

		userID, _ := strconv.ParseUint(row[1], 10, 32)
		locationID, _ := strconv.ParseUint(row[2], 10, 32)
		startTime, _ := time.Parse(time.RFC3339, row[3])
		endTime, _ := time.Parse(time.RFC3339, row[4])
		
		var clockIn, clockOut *time.Time
		if row[5] != "" {
			ci, err := time.Parse(time.RFC3339, row[5])
			if err == nil {
				clockIn = &ci
			}
		}
		if row[6] != "" {
			co, err := time.Parse(time.RFC3339, row[6])
			if err == nil {
				clockOut = &co
			}
		}

		shift := domain.Shift{
			UserID:       uint(userID),
			LocationID:   uint(locationID),
			StartTime:    startTime,
			EndTime:      endTime,
			ClockInTime:  clockIn,
			ClockOutTime: clockOut,
			Notes:        row[7],
			Status:       row[8],
		}

		if err := s.db.Create(&shift).Error; err == nil {
			count++
		}
	}

	return count, nil
}
