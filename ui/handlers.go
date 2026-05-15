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
}

func NewHandler(us service.UserService, ss service.ShiftService, ts service.TaskService, set service.SettingService, as service.AuthService, swap service.ShiftSwapService, analytics service.AnalyticsService, hs service.HealthService) *Handler {
	return &Handler{
		userService:    us,
		shiftService:   ss,
		taskService:    ts,
		settingService: set,
		authService:    as,
		swapService:    swap,
		analyticsService: analytics,
		healthService:    hs,
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Shift successfully auto-swapped"})
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
