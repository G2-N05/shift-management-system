# UML Source Code: Shift Management System

This document contains the structural and behavioral UML models for the **Shift Management System** written in **Mermaid** notation. These UML sources can be rendered directly in GitHub Markdown or tools that support Mermaid.

---

## 1. Use Case Diagram

### 1.1 Candidate Actors
*   **Employee (`employee`)**: A shift worker executing daily operations.
*   **Manager (`manager`)**: Coordinates staffing levels, work models, and plans schedules.
*   **Admin (`admin`)**: Exercises master control over data, settings, compliance, and payroll.

### 1.2 Use Case Model
```mermaid
graph TD
    %% Actors
    Emp((Employee))
    Mgr((Manager))
    Adm((Admin))

    %% Employee Use Cases
    subgraph Employee Actions
        UC1(View Personal Schedule)
        UC2(Clock In/Out)
        UC3(Request Shift Swap / Auto-Swap)
        UC4(Submit Health Declaration)
        UC5(Request Time-Off)
    end

    %% Manager Actions
    subgraph Manager Actions
        UC6(Manage Tasks)
        UC7(Trigger Auto-Scheduling)
        UC8(Trigger Re-scheduling)
        UC9(View Burnout & Attrition Risks)
        UC10(View Succession Planning)
    end

    %% Admin Actions
    subgraph Admin Actions
        UC11(Manage User Profiles)
        UC12(Configure Global Settings)
        UC13(Approve/Reject Health Declarations)
        UC14(Resolve Understaffed Tasks)
        UC15(Manage KPI & Process Payroll)
        UC16(Import/Export CSV Backups)
    end

    %% Inheritances
    Mgr --> Emp
    Adm --> Mgr

    %% Links
    Emp --> UC1
    Emp --> UC2
    Emp --> UC3
    Emp --> UC4
    Emp --> UC5

    Mgr --> UC6
    Mgr --> UC7
    Mgr --> UC8
    Mgr --> UC9
    Mgr --> UC10

    Adm --> UC11
    Adm --> UC12
    Adm --> UC13
    Adm --> UC14
    Adm --> UC15
    Adm --> UC16
```

---

## 2. Class Diagram: Core Entities

Representing models defined in the [domain/](file:///d:/Workspace/TBDD/shift-management-system/domain/) folder.

```mermaid
classDiagram
    class User {
        +uint ID
        +string Name
        +string Email
        +string Username
        +string PasswordHash
        +string Phone
        +Role Role
        +int EnergyScore
        +int SkillLevel
        +float64 BaseHourlyRate
        +int MaxWeeklyHours
        +Save()
    }
    class Location {
        +uint ID
        +string Name
        +string Address
    }
    class Shift {
        +uint ID
        +uint UserID
        +uint LocationID
        +uint TaskID
        +DateTime StartTime
        +DateTime EndTime
        +DateTime ClockInTime
        +DateTime ClockOutTime
        +string Notes
        +string Status
    }
    class Task {
        +uint ID
        +string Title
        +string Description
        +uint LocationID
        +RequiredRole RequiredRole
        +int RequiredSkill
        +int Headcount
        +string WorkModel
        +DateTime StartTime
        +DateTime EndTime
        +bool IsScheduled
        +bool IsAssigned
        +uint AssignedTo
        +string UrgencyLevel
        +string CoordinationStatus
    }
    class SystemSetting {
        +uint ID
        +float64 MaxShiftHours
        +float64 MinRestHours
        +float64 StandardShiftHours
        +float64 FullShiftHours
        +float64 MaxOvertimeHours
        +string MorningShiftStart
        +string MorningShiftEnd
        +string AfternoonShiftStart
        +string AfternoonShiftEnd
        +int HealthThresholdModerate
        +int ModerateHealthMaxOTPerWeek
        +int HealthThresholdLow
        +float64 DefaultBaseHourlyRate
        +string PrioritizedHealthConditions
        +int PriorityConditionDeduction
    }
    class ShiftSwap {
        +uint ID
        +uint RequesterID
        +uint TargetUserID
        +uint ShiftID
        +string Status
    }
    class HealthDeclaration {
        +uint ID
        +uint UserID
        +string Condition
        +string ProofFile
        +string Status
        +int PointsDeducted
        +string AdminNotes
    }
    class KnownCondition {
        +uint ID
        +string Condition
        +int PointsDeducted
    }
    class UserKPI {
        +uint ID
        +uint UserID
        +int Month
        +int Year
        +int Score
        +float64 Multiplier
        +string Notes
    }
    class PayrollRecord {
        +uint ID
        +uint UserID
        +int Month
        +int Year
        +float64 TotalHours
        +float64 BaseRate
        +float64 BasePay
        +float64 BonusPay
        +float64 TotalPay
        +bool IsPaid
    }
    class Notification {
        +uint ID
        +uint UserID
        +string Message
        +bool IsRead
    }

    User "1" --o "*" Shift : working
    User "1" --o "*" HealthDeclaration : reports
    User "1" --o "*" UserKPI : graded
    User "1" --o "*" PayrollRecord : receives
    Location "1" --o "*" Shift : hosted_at
    Location "1" --o "*" Task : requires_at
    Task "1" --o "*" Shift : schedules
```

---

## 3. Class Diagram: Services & Repositories

Defines the dependency injection hierarchy mapping [repository/](file:///d:/Workspace/TBDD/shift-management-system/repository/) and [service/](file:///d:/Workspace/TBDD/shift-management-system/service/) packages.

```mermaid
classDiagram
    %% Services Interfaces
    class UserService {
        <<interface>>
        +RegisterUser(User)
        +Authenticate(email, password) User
    }
    class ShiftService {
        <<interface>>
        +ScheduleShift(Shift)
        +ClockIn(shiftID, time)
        +ClockOut(shiftID, time)
    }
    class TaskService {
        <<interface>>
        +AutoScheduleShifts() int
        +ReScheduleShifts() int
    }
    class HealthService {
        <<interface>>
        +SubmitDeclaration(HealthDeclaration)
        +ApproveDeclaration(id, points, notes)
    }
    class ShiftSwapService {
        <<interface>>
        +RequestSwap(req, target, shift) ShiftSwap
        +AutoSwap(req, shift)
    }

    %% Repositories Interfaces
    class UserRepository {
        <<interface>>
        +Save(User)
        +FindByID(id) User
    }
    class ShiftRepository {
        <<interface>>
        +Save(Shift)
        +FindByID(id) Shift
    }
    class TaskRepository {
        <<interface>>
        +Save(Task)
        +FindUnassigned() Task[]
    }
    class ShiftSwapRepository {
        <<interface>>
        +Save(ShiftSwap)
        +FindByID(id) ShiftSwap
    }

    %% Implementations
    class userRepo {
        +db gorm.DB
    }
    class shiftRepo {
        +db gorm.DB
    }
    class taskRepo {
        +db gorm.DB
    }
    class swapRepo {
        +db gorm.DB
    }

    class userServiceImpl {
        -userRepo UserRepository
    }
    class shiftServiceImpl {
        -shiftRepo ShiftRepository
    }
    class taskServiceImpl {
        -taskRepo TaskRepository
        -userRepo UserRepository
        -shiftRepo ShiftRepository
        -settingRepo SettingRepository
    }
    class swapServiceImpl {
        -swapRepo ShiftSwapRepository
        -shiftRepo ShiftRepository
        -userRepo UserRepository
    }

    %% Realizations
    UserRepository <|.. userRepo
    ShiftRepository <|.. shiftRepo
    TaskRepository <|.. taskRepo
    ShiftSwapRepository <|.. swapRepo

    UserService <|.. userServiceImpl
    ShiftService <|.. shiftServiceImpl
    TaskService <|.. taskServiceImpl
    ShiftSwapService <|.. swapServiceImpl

    %% DI dependencies
    userServiceImpl --> UserRepository
    shiftServiceImpl --> ShiftRepository
    taskServiceImpl --> TaskRepository
    taskServiceImpl --> UserRepository
    taskServiceImpl --> ShiftRepository
    swapServiceImpl --> ShiftSwapRepository
    swapServiceImpl --> ShiftRepository
```

---

## 4. State Machine Diagrams

### 4.1 Shift Lifecycle
```mermaid
stateDiagram-v2
    [*] --> scheduled : Auto/Manual Scheduled
    scheduled --> assigned : Swapped/Assigned to new user
    assigned --> in_progress : Clock-In
    scheduled --> in_progress : Clock-In
    in_progress --> completed : Clock-Out
    scheduled --> cancelled : Cancelled by Manager/Admin
    assigned --> cancelled : Cancelled by Manager/Admin
    completed --> [*]
    cancelled --> [*]
```

### 4.2 ShiftSwap Request Lifecycle
```mermaid
stateDiagram-v2
    [*] --> pending : RequestSwap / AutoSwap Triggered
    pending --> pending_admin_assignment : AutoSwap finds no colleague
    pending --> approved : Target Colleague Approves
    pending --> rejected : Target Colleague Rejects
    pending_admin_assignment --> approved : Admin Manually Assigns Colleague
    approved --> [*]
    rejected --> [*]
```

### 4.3 Health Declaration Lifecycle
```mermaid
stateDiagram-v2
    [*] --> pending : Employee Submits Declaration
    pending --> approved : Admin Approves (Energy Score Deducted)
    pending --> rejected : Admin Rejects (Proof Invalid)
    approved --> [*]
    rejected --> [*]
```

---

## 5. Sequence Diagram: Auto-Scheduling Engine Process

Illustrating the GORM transaction workflow mapping [service/task_service.go#L99-L317](file:///d:/Workspace/TBDD/shift-management-system/service/task_service.go#L99-L317).

```mermaid
sequenceDiagram
    autonumber
    actor Manager
    participant TaskService as TaskService Implementation
    participant Repo as Task/Shift/User Repositories
    participant Rules as Rule Engine
    participant DB as SQLite DB

    Manager->>TaskService: Trigger Auto-Schedule
    activate TaskService
    TaskService->>Repo: FindUnassigned()
    Repo-->>TaskService: list of Unassigned Tasks
    TaskService->>Repo: FindAll() [Users & Shifts]
    Repo-->>TaskService: list of Employees & active Shifts
    
    loop For each Unassigned Task
        loop For each Employee
            TaskService->>Rules: IsValid(Employee, Shifts, Role, Skill, WindowStart, WindowEnd, AllowOvertime=false)
            activate Rules
            Note over Rules: Evaluates overlapping shifts,<br/>11-hour rest buffers,<br/>weekly max hours,<br/>and health energy score limits.
            Rules-->>TaskService: IsValid (true/false)
            deactivate Rules
            
            alt IsValid is true
                TaskService->>Rules: CalculateScore(Employee, Shifts, RequiredSkill)
                activate Rules
                Note over Rules: Penalty = WeeklyHours * 10<br/>+ 1000 * (SkillLevel - ReqSkill)
                Rules-->>TaskService: Penalty Score
                deactivate Rules
            end
        end
        
        TaskService-->>TaskService: Sort Candidates by Penalty Score Ascending
        
        alt Valid Candidates Exist
            TaskService->>Repo: Create Shift record (userID, startTime, endTime)
            Repo->>DB: INSERT into shifts
            DB-->>Repo: SQL Success
            Repo-->>TaskService: Return Shift
            TaskService->>Repo: Update Task (IsAssigned=true)
            Repo->>DB: UPDATE tasks SET is_assigned=true
        else No Candidates (Understaffed)
            TaskService->>Repo: Update Task (CoordinationStatus="Understaffed")
            Repo->>DB: UPDATE tasks SET coordination_status='Understaffed'
            TaskService->>Repo: Send Admin Notification (Warning Msg)
            Repo->>DB: INSERT into notifications
        end
    end
    
    TaskService-->>Manager: Return Scheduled Shifts count
    deactivate TaskService
```
