package service

import (
	"errors"
	"strings"
	"golang.org/x/crypto/bcrypt"
	"shift-management/domain"
	"shift-management/repository"
)

type userService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{repo: repo}
}

func (s *userService) RegisterUser(user *domain.User) error {
	if user.Email == "" || user.Name == "" {
		return errors.New("name and email are required")
	}

	// Tự động tạo Username từ Email (phần trước chữ @)
	if user.Username == "" {
		parts := strings.Split(user.Email, "@")
		user.Username = parts[0]
	}

	// Đặt mật khẩu mặc định là "123456" nếu Admin chưa cấp
	if user.PasswordHash == "" {
		hash, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		user.PasswordHash = string(hash)
	}

	return s.repo.Save(user)
}

func (s *userService) Authenticate(email, password string) (*domain.User, error) {
	return nil, errors.New("not implemented")
}

func (s *userService) GetAllUsers() ([]*domain.User, error) {
	return s.repo.FindAll()
}

func (s *userService) GetUserByID(id uint) (*domain.User, error) {
	return s.repo.FindByID(id)
}

func (s *userService) UpdateUser(id uint, req *domain.User) error {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	user.Name = req.Name
	user.Email = req.Email
	user.Role = req.Role
	user.SkillLevel = req.SkillLevel
	user.MaxWeeklyHours = req.MaxWeeklyHours
	return s.repo.Update(user)
}

func (s *userService) DeleteUser(id uint) error {
	return s.repo.Delete(id)
}
