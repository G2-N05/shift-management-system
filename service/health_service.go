package service

import (
	"errors"
	"strings"

	"shift-management/domain"
	"gorm.io/gorm"
)

type healthService struct {
	db *gorm.DB
}

func NewHealthService(db *gorm.DB) HealthService {
	return &healthService{db: db}
}

func (s *healthService) SubmitDeclaration(decl *domain.HealthDeclaration) error {
	decl.Status = "pending"
	return s.db.Create(decl).Error
}

func (s *healthService) GetPendingDeclarations() ([]*domain.HealthDeclaration, error) {
	var decls []*domain.HealthDeclaration
	if err := s.db.Preload("User").Where("status = ?", "pending").Find(&decls).Error; err != nil {
		return nil, err
	}
	return decls, nil
}

func (s *healthService) SuggestPoints(condition string) int {
	cond := strings.ToLower(condition)
	// Simple keyword-based AI simulator
	if strings.Contains(cond, "thai") || strings.Contains(cond, "pregnant") {
		return 50
	}
	if strings.Contains(cond, "xương") || strings.Contains(cond, "khớp") || strings.Contains(cond, "bone") || strings.Contains(cond, "joint") {
		return 50
	}
	if strings.Contains(cond, "sốt") || strings.Contains(cond, "cảm") || strings.Contains(cond, "fever") {
		return 20
	}
	if strings.Contains(cond, "mệt") || strings.Contains(cond, "tired") {
		return 10
	}
	return 5 // Default low risk deduction
}

func (s *healthService) ApproveDeclaration(id uint, pointsDeducted int, adminNotes string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var decl domain.HealthDeclaration
		if err := tx.First(&decl, id).Error; err != nil {
			return err
		}

		if decl.Status != "pending" {
			return errors.New("declaration is not pending")
		}

		var user domain.User
		if err := tx.First(&user, decl.UserID).Error; err != nil {
			return err
		}

		// Core Logic: Clamp deduction if energy is already low (< 50)
		actualDeducted := pointsDeducted
		if user.EnergyScore < 50 && pointsDeducted > 10 {
			// If points > 10, clamp it to 10. (User requested 5-10, we'll clamp to max 10, or scale it)
			actualDeducted = 10
			adminNotes += " [Auto-adjusted deduction to 10 because energy is < 50]"
		} else if user.EnergyScore < 50 && pointsDeducted > 5 {
            actualDeducted = 5
            adminNotes += " [Auto-adjusted deduction to 5 because energy is < 50]"
        }

		decl.Status = "approved"
		decl.PointsDeducted = actualDeducted
		decl.AdminNotes = adminNotes

		if err := tx.Save(&decl).Error; err != nil {
			return err
		}

		user.EnergyScore -= actualDeducted
		if user.EnergyScore < 0 {
			user.EnergyScore = 0
		}

		return tx.Save(&user).Error
	})
}

func (s *healthService) RejectDeclaration(id uint, adminNotes string) error {
	var decl domain.HealthDeclaration
	if err := s.db.First(&decl, id).Error; err != nil {
		return err
	}
	decl.Status = "rejected"
	decl.AdminNotes = adminNotes
	return s.db.Save(&decl).Error
}
