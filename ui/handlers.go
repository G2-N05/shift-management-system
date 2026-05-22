package ui

import (
	"net/http"
	"strconv"
	"time"

	"shift-management/domain"
	"shift-management/service"

	"github.com/gin-gonic/gin"
	"path/filepath"
	"os"
)

type Handler struct {
	userService    service.UserService
	shiftService   service.ShiftService
	taskService    service.TaskService
	settingService service.SettingService
	authService    service.AuthService
	swapService    service.ShiftSwapService
	analyticsService service.AnalyticsService
	healthService    service.HealthService
	coordService     service.CoordinationService
	kpiService       *service.KPIService
	payrollService   *service.PayrollService
	dataService      *service.DataService
	timeOffService   service.TimeOffService
}

func NewHandler(us service.UserService, ss service.ShiftService, ts service.TaskService, set service.SettingService, as service.AuthService, swap service.ShiftSwapService, analytics service.AnalyticsService, hs service.HealthService, cs service.CoordinationService, kpi *service.KPIService, pay *service.PayrollService, data *service.DataService, timeOff service.TimeOffService) *Handler {
	return &Handler{
		userService:      us,
		shiftService:     ss,
		taskService:      ts,
		settingService:   set,
		authService:      as,
		swapService:      swap,
		analyticsService: analytics,
		healthService:    hs,
		coordService:     cs,
		kpiService:       kpi,
		payrollService:   pay,
		dataService:      data,
		timeOffService:   timeOff,
	}
}

func (h *Handler) GetUsers(c *gin.Context) {
	users, err := h.userService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *Handler) UpdateUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	var req domain.User
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.userService.UpdateUser(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

func (h *Handler) DeleteUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	if err := h.userService.DeleteUser(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func (h *Handler) GetMe(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDFloat, ok := userIDStr.(float64)
	if !ok {
		// Sometimes it might be parsed as string depending on JWT library config
		if str, okStr := userIDStr.(string); okStr {
			parsed, err := strconv.ParseUint(str, 10, 32)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id format"})
				return
			}
			userIDFloat = float64(parsed)
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user id type in token"})
			return
		}
	}

	user, err := h.userService.GetUserByID(uint(userIDFloat))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var user domain.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.userService.RegisterUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, user)
}

func (h *Handler) GetShifts(c *gin.Context) {
	role, _ := c.Get("role")
	
	if role == "employee" {
		userIDFloat, ok := c.Get("userID")
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "user ID not found in token"})
			return
		}
		userID := uint(userIDFloat.(float64))
		shifts, err := h.shiftService.GetShiftsByUser(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, shifts)
		return
	}

	shifts, err := h.shiftService.GetAllShifts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, shifts)
}

func (h *Handler) CreateShift(c *gin.Context) {
	var shift domain.Shift
	if err := c.ShouldBindJSON(&shift); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.shiftService.ScheduleShift(&shift); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, shift)
}

func (h *Handler) UpdateShift(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shift id"})
		return
	}
	var req domain.Shift
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.shiftService.UpdateShift(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift updated successfully"})
}

func (h *Handler) DeleteShift(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shift id"})
		return
	}
	if err := h.shiftService.DeleteShift(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift deleted successfully"})
}

func (h *Handler) GetTasks(c *gin.Context) {
	tasks, err := h.taskService.GetAllTasks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tasks)
}

func (h *Handler) CreateTask(c *gin.Context) {
	var task domain.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.taskService.CreateTask(&task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, task)
}

func (h *Handler) UpdateTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task id"})
		return
	}
	var req domain.Task
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.taskService.UpdateTask(uint(id), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully"})
}

func (h *Handler) DeleteTask(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task id"})
		return
	}
	if err := h.taskService.DeleteTask(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func (h *Handler) AutoSchedule(c *gin.Context) {
	count, err := h.taskService.AutoScheduleShifts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Auto-scheduling complete", "shiftsScheduled": count})
}

func (h *Handler) ReSchedule(c *gin.Context) {
	count, err := h.taskService.ReScheduleShifts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Re-scheduling complete", "shiftsScheduled": count})
}

func (h *Handler) GetSetting(c *gin.Context) {
	setting, err := h.settingService.GetSetting()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, setting)
}

func (h *Handler) UpdateSetting(c *gin.Context) {
	var input domain.SystemSetting
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.settingService.UpdateSetting(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Settings updated"})
}

func (h *Handler) Login(c *gin.Context) {
	var input struct {
		Username string `json:"Username"`
		Password string `json:"Password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	token, err := h.authService.Login(input.Username, input.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func (h *Handler) ClockIn(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shift id"})
		return
	}
	if err := h.shiftService.ClockIn(uint(id), time.Now()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Clocked in successfully"})
}

func (h *Handler) ClockOut(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid shift id"})
		return
	}
	if err := h.shiftService.ClockOut(uint(id), time.Now()); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Clocked out successfully"})
}

func (h *Handler) GetPendingSwaps(c *gin.Context) {
	swaps, err := h.swapService.GetPendingSwaps()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, swaps)
}

func (h *Handler) RequestSwap(c *gin.Context) {
	var input struct {
		RequesterID  uint `json:"RequesterID"`
		TargetUserID uint `json:"TargetUserID"`
		ShiftID      uint `json:"ShiftID"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	swap, err := h.swapService.RequestSwap(input.RequesterID, input.TargetUserID, input.ShiftID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, swap)
}

func (h *Handler) ApproveSwap(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid swap id"})
		return
	}
	if err := h.swapService.ApproveSwap(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Swap approved"})
}

func (h *Handler) AssignSwap(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid swap id"})
		return
	}
	
	var input struct {
		TargetUserID uint `json:"TargetUserID"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.swapService.AssignSwap(uint(id), input.TargetUserID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Swap assigned successfully"})
}

func (h *Handler) RejectSwap(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid swap id"})
		return
	}
	if err := h.swapService.RejectSwap(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Swap rejected"})
}

func (h *Handler) AutoSwapRequest(c *gin.Context) {
	var input struct {
		RequesterID uint `json:"RequesterID"`
		ShiftID     uint `json:"ShiftID"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.swapService.AutoSwap(input.RequesterID, input.ShiftID); err != nil {
		if err.Error() == "fallback_manual" {
			c.JSON(http.StatusOK, gin.H{"message": "No eligible colleague found. The request has been sent to the Admin Panel for manual assignment.", "fallback": true})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift successfully auto-swapped", "fallback": false})
}

func (h *Handler) GetAttritionRisks(c *gin.Context) {
	risks, err := h.analyticsService.GetAttritionRisks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, risks)
}

func (h *Handler) GetBackupSuggestions(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	suggestions, err := h.analyticsService.GetBackupSuggestions(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, suggestions)
}

func (h *Handler) SubmitHealthDeclaration(c *gin.Context) {
	// Parse multipart form
	userIDStr := c.PostForm("UserID")
	condition := c.PostForm("Condition")
	
	userID, _ := strconv.ParseUint(userIDStr, 10, 32)
	
	file, err := c.FormFile("ProofFile")
	var proofPath string
	if err == nil {
		os.MkdirAll("uploads", os.ModePerm)
		filename := filepath.Base(file.Filename)
		proofPath = "uploads/" + strconv.FormatInt(time.Now().Unix(), 10) + "_" + filename
		if err := c.SaveUploadedFile(file, proofPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
			return
		}
	}
	
	decl := &domain.HealthDeclaration{
		UserID:    uint(userID),
		Condition: condition,
		ProofFile: proofPath,
	}
	
	if err := h.healthService.SubmitDeclaration(decl); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusCreated, decl)
}

func (h *Handler) GetPendingHealthDeclarations(c *gin.Context) {
	decls, err := h.healthService.GetPendingDeclarations()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, decls)
}

func (h *Handler) GetKnownHealthConditions(c *gin.Context) {
	conditions, err := h.healthService.GetKnownConditions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, conditions)
}

func (h *Handler) UpdateKnownCondition(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	
	var req struct {
		Condition      string `json:"Condition"`
		PointsDeducted int    `json:"PointsDeducted"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.healthService.UpdateKnownCondition(uint(id), req.Condition, req.PointsDeducted); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Condition updated successfully"})
}

func (h *Handler) ApproveHealthDeclaration(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)
	
	var input struct {
		PointsDeducted int    `json:"PointsDeducted"`
		AdminNotes     string `json:"AdminNotes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.healthService.ApproveDeclaration(uint(id), input.PointsDeducted, input.AdminNotes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Declaration approved"})
}

func (h *Handler) RejectHealthDeclaration(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)
	
	var input struct {
		AdminNotes string `json:"AdminNotes"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := h.healthService.RejectDeclaration(uint(id), input.AdminNotes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Declaration rejected"})
}

func (h *Handler) SuggestHealthPoints(c *gin.Context) {
	condition := c.Query("condition")
	points := h.healthService.SuggestPoints(condition)
	c.JSON(http.StatusOK, gin.H{"SuggestedPoints": points})
}

func (h *Handler) GetUnderstaffedTasks(c *gin.Context) {
	// First, detect and update status
	if err := h.coordService.DetectUnderstaffedTasks(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Fetch all tasks and filter
	tasks, err := h.taskService.GetAllTasks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var understaffed []*domain.Task
	for _, t := range tasks {
		if t.CoordinationStatus == "Understaffed" {
			understaffed = append(understaffed, t)
		}
	}
	c.JSON(http.StatusOK, understaffed)
}

func (h *Handler) GetCoordinationSuggestions(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid task id"})
		return
	}

	suggestions, err := h.coordService.GenerateSuggestions(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, suggestions)
}

func (h *Handler) ApproveCoordinationSuggestion(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid suggestion id"})
		return
	}

	if err := h.coordService.ApplySuggestion(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Suggestion applied successfully"})
}

func (h *Handler) GetKPIs(c *gin.Context) {
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if month == 0 || year == 0 {
		now := time.Now()
		month = int(now.Month())
		year = now.Year()
	}

	kpis, err := h.kpiService.GetAllKPIs(month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpis)
}

func (h *Handler) SaveKPI(c *gin.Context) {
	var kpi domain.UserKPI
	if err := c.ShouldBindJSON(&kpi); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.kpiService.SaveKPI(&kpi); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kpi)
}

func (h *Handler) CalculatePayroll(c *gin.Context) {
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if month == 0 || year == 0 {
		now := time.Now()
		month = int(now.Month())
		year = now.Year()
	}

	records, err := h.payrollService.CalculatePayroll(month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (h *Handler) GetPayroll(c *gin.Context) {
	monthStr := c.Query("month")
	yearStr := c.Query("year")
	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	if month == 0 || year == 0 {
		now := time.Now()
		month = int(now.Month())
		year = now.Year()
	}

	records, err := h.payrollService.GetPayrollRecords(month, year)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (h *Handler) ExportShifts(c *gin.Context) {
	c.Header("Content-Disposition", "attachment; filename=shifts_export.csv")
	c.Header("Content-Type", "text/csv")
	if err := h.dataService.ExportShiftsToCSV(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

func (h *Handler) ImportShifts(c *gin.Context) {
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get file"})
		return
	}
	defer file.Close()

	count, err := h.dataService.ImportShiftsFromCSV(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Import successful", "count": count})
}

func (h *Handler) RequestTimeOff(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req domain.TimeOffRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.timeOffService.CreateTimeOffRequest(userID.(uint), &req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, req)
}

func (h *Handler) GetMyTimeOffRequests(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reqs, err := h.timeOffService.GetMyTimeOffRequests(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reqs)
}

func (h *Handler) GetPendingTimeOffRequests(c *gin.Context) {
	reqs, err := h.timeOffService.GetAllPendingRequests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reqs)
}

func (h *Handler) ApproveTimeOffRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	if err := h.timeOffService.UpdateRequestStatus(uint(id), domain.StatusApproved); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Time off approved"})
}

func (h *Handler) RejectTimeOffRequest(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	if err := h.timeOffService.UpdateRequestStatus(uint(id), domain.StatusDenied); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Time off rejected"})
}


