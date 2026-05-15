package service

import (
	"shift-management/domain"
	"shift-management/repository"
)

type settingService struct {
	repo repository.SettingRepository
}

func NewSettingService(repo repository.SettingRepository) SettingService {
	return &settingService{repo: repo}
}

func (s *settingService) GetSetting() (*domain.SystemSetting, error) {
	return s.repo.Get()
}

func (s *settingService) UpdateSetting(req *domain.SystemSetting) error {
	setting, err := s.repo.Get()
	if err != nil {
		return err
	}
	setting.MaxShiftHours = req.MaxShiftHours
	setting.MinRestHours = req.MinRestHours
	setting.StandardShiftHours = req.StandardShiftHours
	setting.FullShiftHours = req.FullShiftHours
	setting.MaxOvertimeHours = req.MaxOvertimeHours
	setting.MorningShiftStart = req.MorningShiftStart
	setting.MorningShiftEnd = req.MorningShiftEnd
	setting.AfternoonShiftStart = req.AfternoonShiftStart
	setting.AfternoonShiftEnd = req.AfternoonShiftEnd
	return s.repo.Update(setting)
}
