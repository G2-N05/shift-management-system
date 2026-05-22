package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"shift-management/domain"
	"gorm.io/gorm"
)

type healthService struct {
	db *gorm.DB
}

func NewHealthService(db *gorm.DB) HealthService {
	return &healthService{db: db}
}

func (s *healthService) GetKnownConditions() ([]*domain.KnownCondition, error) {
	var conditions []*domain.KnownCondition
	if err := s.db.Find(&conditions).Error; err != nil {
		return nil, err
	}
	return conditions, nil
}

func (s *healthService) UpdateKnownCondition(id uint, newCondition string, newPoints int) error {
	var kc domain.KnownCondition
	if err := s.db.First(&kc, id).Error; err != nil {
		return err
	}
	kc.Condition = newCondition
	kc.PointsDeducted = newPoints
	return s.db.Save(&kc).Error
}

func (s *healthService) SubmitDeclaration(decl *domain.HealthDeclaration) error {
	var known domain.KnownCondition
	if err := s.db.Where("condition = ?", decl.Condition).First(&known).Error; err == nil {
		decl.Status = "approved"
		var user domain.User
		if err := s.db.First(&user, decl.UserID).Error; err == nil {
			actualDeducted := known.PointsDeducted
			adminNotes := "Auto-approved based on known database condition."
			if user.EnergyScore < 50 && actualDeducted > 10 {
				actualDeducted = 10
				adminNotes += " [Auto-adjusted to 10 because energy < 50]"
			} else if user.EnergyScore < 50 && actualDeducted > 5 {
				actualDeducted = 5
				adminNotes += " [Auto-adjusted to 5 because energy < 50]"
			}
			
			decl.PointsDeducted = actualDeducted
			decl.AdminNotes = adminNotes
			
			if err := s.db.Create(decl).Error; err != nil {
				return err
			}
			
			user.EnergyScore -= actualDeducted
			if user.EnergyScore < 0 { user.EnergyScore = 0 }
			return s.db.Save(&user).Error
		}
	}

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
	
	// Fetch current system settings for dynamic prioritization
	var setting domain.SystemSetting
	if err := s.db.First(&setting).Error; err == nil {
		if setting.PrioritizedHealthConditions != "" {
			// Split the configured keywords by comma
			var keywords []string
			for _, kw := range strings.Split(setting.PrioritizedHealthConditions, ",") {
				kw = strings.TrimSpace(kw)
				if kw != "" {
					keywords = append(keywords, kw)
				}
			}

			if len(keywords) > 0 {
				// 1. Ask Python NLP Service for Semantic Similarity
				type simReq struct {
					Query    string   `json:"query"`
					Keywords []string `json:"keywords"`
				}
				reqBody, _ := json.Marshal(simReq{
					Query:    cond,
					Keywords: keywords,
				})

				client := &http.Client{Timeout: 3 * time.Second}
				resp, err := client.Post("http://localhost:8000/similarity", "application/json", bytes.NewBuffer(reqBody))
				if err == nil {
					defer resp.Body.Close()
					if resp.StatusCode == http.StatusOK {
						var simRes struct {
							BestMatch string  `json:"best_match"`
							MaxScore  float64 `json:"max_score"`
						}
						if err := json.NewDecoder(resp.Body).Decode(&simRes); err == nil {
							// If similarity is >= 0.49, it's a match! (BGE-M3 threshold)
							if simRes.MaxScore >= 0.49 {
								return setting.PriorityConditionDeduction
							}
							// If NLP successfully responded but score < 0.49, don't fall back to simple substring match
							// We can just proceed to the fallback basic heuristics at the bottom.
							goto fallback
						}
					}
				}

				// 2. Fallback: If NLP service is offline/failed, do simple substring match
				for _, kw := range keywords {
					kw = strings.ToLower(kw)
					if strings.Contains(cond, kw) {
						return setting.PriorityConditionDeduction
					}
				}
			}
		}
	}

fallback:
	// Fallback to basic heuristics if settings are empty, missing, or no match
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

		if err := tx.Save(&user).Error; err != nil {
			return err
		}

		var kc domain.KnownCondition
		if err := tx.Where("condition = ?", decl.Condition).First(&kc).Error; err != nil {
			tx.Create(&domain.KnownCondition{Condition: decl.Condition, PointsDeducted: actualDeducted})
		} else {
			kc.PointsDeducted = actualDeducted
			tx.Save(&kc)
		}

		return nil
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
