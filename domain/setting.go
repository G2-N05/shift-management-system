package domain

import "gorm.io/gorm"

type SystemSetting struct {
	gorm.Model
	MaxShiftHours       float64 `json:"MaxShiftHours"`
	MinRestHours        float64 `json:"MinRestHours" gorm:"default:11.0"`
	StandardShiftHours  float64 `json:"StandardShiftHours" gorm:"default:4.0"`
	FullShiftHours      float64 `json:"FullShiftHours" gorm:"default:8.0"`
	MaxOvertimeHours    float64 `json:"MaxOvertimeHours" gorm:"default:4.0"`
	MorningShiftStart   string  `json:"MorningShiftStart" gorm:"default:'08:00'"`
	MorningShiftEnd     string  `json:"MorningShiftEnd" gorm:"default:'12:00'"`
	AfternoonShiftStart string  `json:"AfternoonShiftStart" gorm:"default:'13:00'"`
	AfternoonShiftEnd   string  `json:"AfternoonShiftEnd" gorm:"default:'17:00'"`
}
