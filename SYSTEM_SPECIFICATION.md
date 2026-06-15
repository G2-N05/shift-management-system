# System Specification: Shift Management System

This document serves as the absolute **Source of Truth** for the technical and functional specifications of the **Shift Management System**. All future designs, feature additions, and modifications must align with the definitions and constraints defined herein.

---

## 1. System Purpose

The **Shift Management System** is a distributed, multi-client software platform designed to manage and automate labor logistics in shift-based operations. The core objective is to balance operational requirements (getting tasks done) with employee welfare (managing burnout, energy depletion, and recovery time) while automating administrative tasks such as scheduling, shift swaps, health declarations, and payroll calculation.

---

## 2. Scope

The system encompasses the following functional modules:
*   **User & Session Management**: Multi-role user administration with secure JWT-based access controls.
*   **Auto-Scheduling Engine**: Hard constraint validation and penalty-based optimization to schedule tasks into shift segments.
*   **Attendance & Logging**: Real-time clock-in/out logging via mobile client with timezone/location support.
*   **Shift Swap & Auto-Swap**: Automated matching and notification-based shift exchanges with fallback admin assignment.
*   **Welfare & Health Management**: Employee health reporting, image-based proof uploads, and automated energy deduction mapping via NLP semantic analysis.
*   **KPI & Performance Tracking**: Monthly employee performance scoring to dynamically adjust payroll multiplier weights.
*   **Payroll Administration**: Monthly salary aggregation combining base rates, overtime bonuses, and KPI modifiers.
*   **Coordination & Recovery**: Understaffed shift detection and automated resolution suggestions (Replacement, Reschedule, Overtime).
*   **Data Backup & Recovery**: CSV import/export for batch creation and transfer of user profiles and shift schedules.

---

## 3. Actors & User Roles

The system recognizes three specific actors, with security permissions defined in [ui/router.go](file:///d:/Workspace/TBDD/shift-management-system/ui/router.go) and [ui/middleware.go](file:///d:/Workspace/TBDD/shift-management-system/ui/middleware.go):

| Actor | Description | Key System Permissions |
| :--- | :--- | :--- |
| **Admin** (`admin`) | System administrator | Full CRUD on Users, Shifts, Tasks, Settings; Approves Health Declarations; Computes Payroll; Handles manual Swap assignments; Imports/Exports CSV data. |
| **Manager** (`manager`) | Operations coordinator | Full CRUD on Tasks; Scheduling, Auto-scheduling, and Re-scheduling triggers; Views analytics (Attrition & Succession Planning). |
| **Employee** (`employee`) | Shift worker | Views personal schedule; Performs Clock-In / Clock-Out; Requests personal Shift Swaps or Auto-Swaps; Submits Health Declarations; Requests Time-off. |

---

## 4. Architecture Overview

The platform uses a distributed, service-oriented architecture:

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|                                                                         |
|  +---------------------------+             +-------------------------+  |
|  |     React Web Client      |             |   Flutter Mobile App    |  |
|  |    (Vite & Bootstrap)     |             |    (Cupertino / iOS)    |  |
|  +-------------+-------------+             +------------+------------+  |
+----------------|----------------------------------------|---------------+
                 | REST APIs                              | REST APIs
                 | (JSON / Multipart Form)                | (JSON)
                 v                                        v
+-------------------------------------------------------------------------+
|                             SERVICES LAYER                              |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                          Go API Gateway                           |  |
|  |                      (Gin Web Framework & JWT)                    |  |
|  +---------------------------------+---------------------------------+  |
|                                    |                                    |
|                                    v                                    |
|  +-------------------------------------------------------------------+  |
|  |                            Go Services                            |  |
|  |   (Task, Shift, User, Swap, Coordination, Health, Payroll, KPI)   |  |
|  +--------------+------------------------------------+----------------+  |
+-----------------|------------------------------------|------------------+
                  | GORM                               | HTTP (Port 8000)
                  v                                    v
+----------------------------------+ +------------------------------------+
|            DATA LAYER            | |            AI NLP LAYER            |
|                                  | |                                    |
|       +------------------+       | |       +--------------------+       |
|       | SQLite Database  |       | |       | FastAPI Service    |       |
|       |  (shift_mgt.db)  |       | |       | (Vietnamese Emb.)  |       |
|       +------------------+       | |       +--------------------+       |
+----------------------------------+ +------------------------------------+
```

### 4.1 Backend Engine (Go)
*   **Connection Pool Limits**: 100 maximum open connections, 10 maximum idle connections, and 1-hour connection lifetime configured in [config/config.go](file:///d:/Workspace/TBDD/shift-management-system/config/config.go#L23-L35).
*   **Security Interceptor**: [ui/middleware.go](file:///d:/Workspace/TBDD/shift-management-system/ui/middleware.go) checks JWT claims to populate request context with `userID` and `role`.

### 4.2 AI NLP Service (Python)
*   Exposes a single POST endpoint `/similarity` on port `8000` via [nlp-service/main.py](file:///d:/Workspace/TBDD/shift-management-system/nlp-service/main.py).
*   Computes cosine similarities between free-text descriptions and system configurations using `sentence-transformers` with `AITeamVN/Vietnamese_Embedding`.

---

## 5. Main Features & File Mapping

Every feature is fully implemented and mapped to the following backend handlers and services:

*   **Authentication & Security**: Handled by [service/auth_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/auth_service.go) and [ui/middleware.go](file:///d:/Workspace/TBDD/shift-management-system/ui/middleware.go).
*   **Employee Administration**: Handled by `GetUsers`, `CreateUser`, `UpdateUser`, `DeleteUser` in [ui/handlers.go](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go).
*   **Auto-Scheduling**: Orchestrated by `AutoScheduleShifts` and `ReScheduleShifts` in [service/task_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/task_service.go) via [service/rule_engine.go](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go).
*   **Smart Swap Engine**: Implemented in [service/shift_swap_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/shift_swap_service.go) and [ui/handlers.go#L353-L478](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L353-L478).
*   **Recovery Coordination**: Scans for understaffed tasks and suggests replacements via [service/coordination_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/coordination_service.go).
*   **AI Health Declarations**: Manages sickness submissions and known condition lookups via [service/health_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/health_service.go) and [nlp-service/main.py](file:///d:/Workspace/TBDD/shift-management-system/nlp-service/main.py).
*   **Attendance Logging**: Exposes Clock-In and Clock-Out actions in [service/shift_service.go#L44-L90](file:///d:/Workspace/TBDD/shift-management-system/service/shift_service.go#L44-L90).
*   **Payroll & Performance evaluation**: Calculates base salary and monthly KPI bonuses via [service/payroll_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/payroll_service.go) and [service/kpi_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/kpi_service.go).
*   **Data Administration**: Integrates CSV-based backups and restores in [service/data_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/data_service.go).

---

## 6. Business Rules & Constraints

The system relies on strict operational constraints and rule engines to ensure scheduling safety and employee health:

### 6.1 Hard Scheduling Constraints
*   **Role Match**: Employee's `Role` must equal the task's `RequiredRole` ([service/rule_engine.go#L20-L22](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L20-L22)).
*   **Skill Level Match**: Employee's `SkillLevel` must be $\ge$ `RequiredSkill` ([service/rule_engine.go#L23-L25](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L23-L25)).
*   **Max Workload**: Total weekly working hours + shift duration must be $\le$ `MaxWeeklyHours` (default 40) unless overtime is enabled ([service/rule_engine.go#L54-L56](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L54-L56)).
*   **Min Rest Hours**: Consecutive shifts must have a rest buffer $\ge$ `MinRestHours` (default 11.0 hours) ([service/rule_engine.go#L58-L84](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L58-L84)).
*   **No Overlap**: A user cannot be assigned to more than one active shift at any overlapping point in time ([service/rule_engine.go#L64-L67](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L64-L67)).

### 6.2 Health-Based rest limits (Welfare Rules)
Based on the employee's `EnergyScore` (updated during health declaration approvals):
1.  **Low Energy Range** ($\text{EnergyScore} < \text{HealthThresholdLow}$, default 50):
    *   Maximum of **1 shift per day** ([service/rule_engine.go#L96-L99](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L96-L99)).
2.  **Moderate Energy Range** ($\text{HealthThresholdLow} \le \text{EnergyScore} < \text{HealthThresholdModerate}$, default 70):
    *   *Alternating Heavy Shifts*: If the user worked a heavy day yesterday (2 or more shifts), they cannot work today ([service/rule_engine.go#L100-L103](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L100-L103)).
    *   *Weekly OT limit*: Overtime shifts per week cannot exceed `ModerateHealthMaxOTPerWeek` (default 1) ([service/rule_engine.go#L104-L106](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L104-L106)).

### 6.3 Scheduling Candidate Selection Scoring
To pick the best candidate among multiple eligible users, the system computes a penalty score (lower is better):
$$\text{Penalty} = (\text{WeeklyHours} \times 10) + \text{SkillPenalty}$$
*   **Weekly Hours Penalty**: $10$ points per hour worked in the target week. This spreads the workload evenly among employees ([service/rule_engine.go#L126](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L126)).
*   **Skill Penalty**: If the user's skill level exceeds the required skill:
    $$\text{SkillPenalty} = 1000 \times (\text{SkillLevel} - \text{RequiredSkill})$$
    This saves highly skilled employees for more complex tasks ([service/rule_engine.go#L128-L132](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go#L128-L132)).

---

## 7. Database Model Overview

The SQLite database (`shift_management.db`) contains 13 models mapped via GORM:

```
  +---------------+             +----------------+             +-----------------+
  |     User      |1          * |     Shift      | *         1 |    Location     |
  | (MaxWeeklyHrs)|-------------| (ClockIn/Out)  |-------------|  (Name/Address) |
  | (EnergyScore) |             | (Status/Notes) |             +-----------------+
  +-------+-------+             +-------+--------+
          | 1                           | *
          |                             |
          | *                           v 1
  +-------+-------+             +-------+--------+
  |  TimeOffReq.  |             |      Task      |
  | (Status/Dates)|             | (Parallel/Seq.)|
  +---------------+             +----------------+
```

1.  **User**: Core profile data including `Role`, `EnergyScore`, `SkillLevel`, and salary rates.
2.  **Location**: Departments/locations where shifts occur.
3.  **Shift**: Scheduled work periods linked to a user, location, and optional task.
4.  **Task**: Tasks with required roles, skill requirements, and scheduling models.
5.  **SystemSetting**: Global variables (min rest hours, health thresholds, shift timings).
6.  **ShiftSwap**: Requests to exchange shifts.
7.  **HealthDeclaration**: Sickness declarations with uploaded file path and approval status.
8.  **KnownCondition**: Configured sickness types and their point deductions.
9.  **CoordinationSuggestion**: AI-generated options for recovery (replacement user, overtime, or reschedule).
10. **UserKPI**: Performance scores and salary multipliers.
11. **PayrollRecord**: Base pay, overtime bonuses, and total pay for a specific month.
12. **Notification**: Notification log for users.

---

## 8. Critical User Workflows

### 8.1 Shift Assignment and Auto-Scheduling Workflow
1.  **Trigger**: Auto-schedule is triggered by a manager ([ui/handlers.go#L268](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L268)) or runs periodically in the background ([main.go#L47-L55](file:///d:/Workspace/TBDD/shift-management-system/main.go#L47-L55)).
2.  **Retrieval**: Loads all unassigned tasks (`is_assigned = false`) and active shifts.
3.  **Matching**: For each task, checks candidates using the `RuleEngine`:
    *   If `WorkModel` is **Sequential**: Splitted into shift windows. For each window, the candidate with the lowest penalty score is assigned.
    *   If `WorkModel` is **Parallel**: Evaluates all eligible employees for the full duration and assigns the top candidates until the `Headcount` target is met.
4.  **Completion**: Updates tasks to `IsAssigned = true`. If a task cannot be fully assigned, it is flagged as `Understaffed`, and a notification is sent to the admin.

### 8.2 Health Declaration and Point Deduction Workflow
1.  **Submission**: Employee uploads a sickness report with a proof image ([ui/handlers.go#L505-L536](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L505-L536)).
2.  **AI Analysis**: The system queries the NLP microservice:
    ```
    POST /similarity HTTP/1.1
    Host: 127.0.0.1:8000
    Content-Type: application/json
    
    {
      "query": "Tôi bị sốt cao kèm đau bụng dữ dội",
      "keywords": ["mang thai", "người già", "sốt xuất huyết", "cảm cúm"]
    }
    ```
3.  **Mapping**: NLP returns the best match and similarity score.
4.  **Approval**: The admin reviews the declaration and confirms the energy point deduction.
5.  **Deduction**: Updates `User.EnergyScore`, which automatically triggers the health-based rest limits during the next scheduling cycle.

### 8.3 Auto-Swap Workflow
1.  **Request**: An employee requests an auto-swap for an upcoming shift ([ui/handlers.go#L460](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L460)).
2.  **Search**: `AutoSwap` searches for eligible colleagues who share the same role, satisfy the skill requirement, and have no rest hour conflicts.
3.  **Notification**: 
    *   *If candidates exist*: Sends swap requests to all eligible candidates and creates notifications.
    *   *If no candidates exist*: Sets the swap request status to `pending_admin_assignment`, alerting the admin to perform a manual allocation.
4.  **Acceptance**: When a target colleague approves the request:
    *   Ownership of the shift changes to the colleague.
    *   The swap request is marked as `approved`, and other duplicate requests are rejected.
    *   Triggers `AutoScheduleShifts` to fill the requester's newly freed time.
