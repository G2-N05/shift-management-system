package domain

import "gorm.io/gorm"

type HealthDeclaration struct {
	gorm.Model
	UserID         uint   `gorm:"not null;index"`
	User           User   `gorm:"foreignKey:UserID"`
	Condition      string `gorm:"not null"`
	ProofFile      string // Path to the uploaded file on disk
	Status         string `gorm:"type:varchar(20);default:'pending'"` // "pending", "approved", "rejected"
	PointsDeducted int
	AdminNotes     string `gorm:"type:text"`
}
