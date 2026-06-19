# SRS Revision Plan: Shift Management System

This document outlines the modifications required to align the Week 1 Software Requirements Specification ([SRS.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/SRS.md)) with the actual system capabilities implemented in the codebase.

---

## 1. Actors

### 1.1 Actors to Add
*   **Admin (`admin`)**: Represents the system administrator actor. Essential because the codebase implements administrative routes (user CRUD, payroll calculations, system-wide health settings, and CSV imports) restricted to this role.

### 1.2 Actors to Remove
*   **`Scheduler Engine`** (Secondary Actor)
*   **`Auth Service`** (Secondary Actor)
*   **`Notification Service`** (Secondary Actor)
    *   *Reason*: In the actual codebase, these are implemented as internal software packages (`service/task_service.go`, `service/auth_service.go`, `service/notification_service.go`) rather than external integrations or autonomous entities. They will be removed from the actors list and redefined as internal subsystems in the architecture description.

---

## 2. Use Cases

### 2.1 Use Cases to Add

#### Health & Welfare Module
*   **UC-SubmitHealthDeclaration**: Employees submit health status declarations, including natural-language description and medical paper image upload.
*   **UC-ApproveHealthDeclaration**: Admins approve or reject declarations, choosing energy points to deduct.
*   **UC-ManageKnownConditions**: Admins add or update standard medical conditions and default point deductions.

#### Attendance Tracking Module
*   **UC-ClockIn**: Employees clock-in to register their actual arrival timestamp.
*   **UC-ClockOut**: Employees clock-out to register their actual departure timestamp.

#### Smart Coordination Module
*   **UC-ViewUnderstaffedTasks**: Managers/Admins view tasks flagged as understaffed (0 active shifts).
*   **UC-GenerateCoordinationSuggestions**: System recommends recovery suggestions (Replacement, Overtime, Reschedule) for understaffed tasks.
*   **UC-ApplyCoordinationSuggestion**: Managers/Admins approve and execute a recommended suggestion.

#### Succession & Attrition Module
*   **UC-ViewAttritionRisks**: Managers/Admins inspect employees' burnout scores based on overtime ratios.
*   **UC-RequestBackupSuggestions**: Managers/Admins query the top 3 eligible backup employees (sorted by lowest workload) for a specific worker.

#### Performance & Payroll Module
*   **UC-SaveKPIEvaluation**: Managers/Admins grade monthly employee performance scores (0-100) and bonus multipliers.
*   **UC-CalculateMonthlyPayroll**: Admins execute monthly payroll calculations.
*   **UC-ViewPayrollRecords**: Admins inspect monthly salary, overtime pay, and payment statuses.

#### Leave Management Module
*   **UC-RequestTimeOff**: Employees submit leave requests.
*   **UC-ApproveTimeOffRequest**: Admins approve or deny pending requests.

#### Data Administration Module
*   **UC-ImportExportData**: Admins/Managers import users and shifts or export schedules via CSV files.

### 2.2 Use Cases to Remove
*   **UC-03: Quản lý phòng ban (Department Management)**: No department database entity or service layer exists.
*   **UC-06: Tạo kỳ lập lịch (Create Scheduling Period)**: Scheduling is executed directly on task start/end timestamps; no period entity exists.
*   **UC-12: Xuất báo cáo (Export Report)**: Generic PDF/report generation is not supported.

---

## 3. Functional Requirements (FR)

### 3.1 Functional Requirements to Add

#### Attendance Logging
*   **FR-A01 (Clock-In)**: The system must allow employees to register a clock-in event for their assigned shift.
*   **FR-A02 (Clock-Out)**: The system must allow employees to register a clock-out event, marking the shift as completed.

#### Health & AI Matching
*   **FR-H01 (Declaration Upload)**: The system must support uploading health reports with a text description and a proof image.
*   **FR-H02 (AI Similarity)**: The system must query the NLP similarity service to map natural-language descriptions to configured known conditions and recommend point deductions.
*   **FR-H03 (Energy Deduction)**: The system must decrease the employee's `EnergyScore` when their declaration is approved by the admin.

#### Welfare-Based Rest Restrictions
*   **FR-W01 (Low Energy Restriction)**: The scheduling engine must limit employees with `EnergyScore` < 50 to a maximum of 1 shift per day.
*   **FR-W02 (Moderate Energy Restriction)**: The scheduling engine must enforce a day-off after heavy days (2+ shifts) and limit weekly overtime shifts to 1 for employees with `EnergyScore` < 70.
*   **FR-W03 (Workload Scoring)**: The scheduling engine must prioritize employees with fewer weekly hours (using a penalty score of 10 points per hour) to ensure equal workload distribution.
*   **FR-W04 (Over-qualification Scoring)**: The scheduling engine must prioritize employees whose skill level matches the task requirement, penalizing over-qualified candidates (1000 points per extra skill level) to preserve them for demanding tasks.

#### Smart Coordination & Backups
*   **FR-C01 (Understaffed Detection)**: The system must automatically flag tasks as `Understaffed` if the assigned headcount is $\ge 1$ but the active shifts count is 0.
*   **FR-C02 (Urgent Overtime Suggestion)**: The system must suggest overtime coverage (bypassing normal hour limits) for understaffed tasks only if the task urgency is `High` or `Critical`.
*   **FR-C03 (Attrition Analysis)**: The system must calculate employee burnout risk based on overtime hours relative to contract limits.
*   **FR-C04 (Succession Backups)**: The system must suggest the top 3 backup candidates for a user, sorted by lowest workload.

#### Payroll & Leave Requests
*   **FR-P01 (Payroll Calculation)**: The system must calculate monthly base salaries and bonus pays using clocked hours, hourly rates, and performance multipliers.
*   **FR-L01 (Time-Off)**: The system must allow employees to submit leave requests and allow admins to approve/deny them.
*   **FR-D01 (CSV Data)**: The system must allow importing/exporting schedules and employee profiles via CSV templates.

### 3.2 Functional Requirements to Remove
*   **FR-04**: *Hệ thống phải cho phép Manager quản lý phòng ban (thêm, sửa, xóa, tìm kiếm)* – Departement management is not implemented.
*   **FR-07**: *Hệ thống phải cho phép Manager tạo kỳ lập lịch mới khi chuẩn bị phân ca* – Scheduling periods are not implemented.
*   **FR-18**: *Hệ thống phải tạo báo cáo tổng hợp khi Manager có nhu cầu xem tổng quan* – General reports are not implemented.
*   **FR-19**: *Cho phép Manager xuất dữ liệu lịch làm việc* – Replaced by CSV data import/export.
