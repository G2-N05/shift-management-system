package domain

import (
	"time"

	"gorm.io/gorm"
)

type CoordinationSuggestionType string

const (
	SuggestionTypeReplacement CoordinationSuggestionType = "Replacement"
	SuggestionTypeReschedule  CoordinationSuggestionType = "Reschedule"
	SuggestionTypeOvertime    CoordinationSuggestionType = "Overtime"
)

// CoordinationSuggestion represents an AI-generated suggestion for an understaffed task.
type CoordinationSuggestion struct {
	gorm.Model
	TaskID         uint                       `json:"TaskID" gorm:"not null"`
	Type           CoordinationSuggestionType `json:"Type" gorm:"type:varchar(20);not null"`
	SuggestedUser  *uint                      `json:"SuggestedUser"`  // Nullable, used for Replacement or Overtime
	SuggestedStart *time.Time                 `json:"SuggestedStart"` // Nullable, used for Reschedule
	SuggestedEnd   *time.Time                 `json:"SuggestedEnd"`   // Nullable, used for Reschedule
	Reasoning      string                     `json:"Reasoning" gorm:"type:text"`
	RiskScore      int                        `json:"RiskScore" gorm:"default:0"` // 0-100, higher means more risk (e.g., burnout)
	IsApproved     bool                       `json:"IsApproved" gorm:"default:false"`
}
