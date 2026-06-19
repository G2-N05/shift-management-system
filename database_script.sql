-- Script SQL tạo cấu trúc cơ sở dữ liệu SQLite cho Hệ thống Quản lý Nhân sự Theo Ca
-- Tương ứng với các thực thể GORM AutoMigrate trong mã nguồn

-- 1. Bảng users (Tài khoản nhân viên & cấu hình cá nhân)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `username` TEXT NOT NULL DEFAULT "",
    `password_hash` TEXT NOT NULL DEFAULT "",
    `phone` VARCHAR(20),
    `role` VARCHAR(20) NOT NULL DEFAULT 'employee',
    `energy_score` INTEGER DEFAULT 100,
    `skill_level` INTEGER NOT NULL DEFAULT 1,
    `max_weekly_hours` INTEGER NOT NULL DEFAULT 40,
    `base_hourly_rate` REAL DEFAULT 20
);

-- 2. Bảng locations (Địa điểm/Chi nhánh làm việc)
CREATE TABLE IF NOT EXISTS `locations` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255)
);

-- 3. Bảng tasks (Nhiệm vụ công việc cần phân ca)
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `location_id` INTEGER,
    `required_role` VARCHAR(20) NOT NULL,
    `required_skill` INTEGER DEFAULT 1,
    `headcount` INTEGER DEFAULT 1,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `is_scheduled` NUMERIC DEFAULT false,
    `is_assigned` NUMERIC DEFAULT false,
    `assigned_to` INTEGER,
    `urgency_level` VARCHAR(20) DEFAULT 'Medium',
    `coordination_status` VARCHAR(20) DEFAULT 'Pending',
    `work_model` VARCHAR(20) DEFAULT 'Parallel'
);

-- 4. Bảng shifts (Ca trực thực tế được gán cho nhân sự)
CREATE TABLE IF NOT EXISTS `shifts` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `task_id` INTEGER,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `clock_in_time` DATETIME,
    `clock_out_time` DATETIME,
    `notes` TEXT,
    `status` VARCHAR(20) DEFAULT 'scheduled',
    CONSTRAINT `fk_users_shifts` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    CONSTRAINT `fk_locations_shifts` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`)
);

-- 5. Bảng system_settings (Cấu hình tham số hệ thống và ngưỡng)
CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `max_shift_hours` REAL,
    `min_rest_hours` REAL DEFAULT 11,
    `standard_shift_hours` REAL DEFAULT 4,
    `full_shift_hours` REAL DEFAULT 8,
    `max_overtime_hours` REAL DEFAULT 4,
    `morning_shift_start` TEXT DEFAULT '08:00',
    `morning_shift_end` TEXT DEFAULT '12:00',
    `afternoon_shift_start` TEXT DEFAULT '13:00',
    `afternoon_shift_end` TEXT DEFAULT '17:00',
    `health_threshold_moderate` INTEGER DEFAULT 70,
    `moderate_health_max_ot_per_week` INTEGER DEFAULT 1,
    `health_threshold_low` INTEGER DEFAULT 50,
    `default_base_hourly_rate` REAL DEFAULT 20,
    `prioritized_health_conditions` TEXT DEFAULT 'mang thai,người già',
    `priority_condition_deduction` INTEGER DEFAULT 50
);

-- 6. Bảng time_off_requests (Yêu cầu xin nghỉ phép)
CREATE TABLE IF NOT EXISTS `time_off_requests` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT,
    `status` VARCHAR(20) DEFAULT 'pending',
    `duration_hours` REAL NOT NULL DEFAULT 8,
    CONSTRAINT `fk_users_time_off_requests` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- 7. Bảng health_declarations (Tờ khai báo y tế của nhân viên)
CREATE TABLE IF NOT EXISTS `health_declarations` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `condition` TEXT NOT NULL,
    `proof_file` TEXT,
    `status` VARCHAR(20) DEFAULT 'pending',
    `points_deducted` INTEGER,
    `admin_notes` TEXT,
    CONSTRAINT `fk_health_declarations_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- 8. Bảng known_conditions (Danh mục bệnh đã biết và điểm trừ mặc định)
CREATE TABLE IF NOT EXISTS `known_conditions` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `condition` TEXT NOT NULL,
    `points_deducted` INTEGER NOT NULL
);

-- 9. Bảng coordination_suggestions (Đề xuất điều phối khi thiếu nhân sự)
CREATE TABLE IF NOT EXISTS `coordination_suggestions` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `task_id` INTEGER NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `suggested_user` INTEGER,
    `suggested_start` DATETIME,
    `suggested_end` DATETIME,
    `reasoning` TEXT,
    `risk_score` INTEGER DEFAULT 0,
    `is_approved` NUMERIC DEFAULT false
);

-- 10. Bảng user_kpis (Đánh giá KPI tháng của nhân viên)
CREATE TABLE IF NOT EXISTS `user_kpis` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 50,
    `multiplier` REAL NOT NULL DEFAULT 1,
    `notes` TEXT
);

-- 11. Bảng payroll_records (Bảng chốt tính lương tháng)
CREATE TABLE IF NOT EXISTS `payroll_records` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `total_hours` REAL NOT NULL DEFAULT 0,
    `base_rate` REAL NOT NULL DEFAULT 0,
    `base_pay` REAL NOT NULL DEFAULT 0,
    `bonus_pay` REAL NOT NULL DEFAULT 0,
    `total_pay` REAL NOT NULL DEFAULT 0,
    `is_paid` NUMERIC DEFAULT false
);

-- 12. Bảng shift_swaps (Đơn trao đổi ca làm việc)
CREATE TABLE IF NOT EXISTS `shift_swaps` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `requester_id` INTEGER,
    `target_user_id` INTEGER,
    `shift_id` INTEGER,
    `status` TEXT DEFAULT 'pending'
);

-- 13. Bảng notifications (Thông báo hệ thống cho người dùng)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER,
    `message` TEXT,
    `is_read` NUMERIC DEFAULT false
);

-- Dữ liệu hạt giống mặc định (Seed Data)
INSERT OR IGNORE INTO `system_settings` (`id`, `max_shift_hours`, `min_rest_hours`, `standard_shift_hours`, `full_shift_hours`, `max_overtime_hours`, `morning_shift_start`, `morning_shift_end`, `afternoon_shift_start`, `afternoon_shift_end`, `health_threshold_moderate`, `moderate_health_max_ot_per_week`, `health_threshold_low`, `default_base_hourly_rate`, `prioritized_health_conditions`, `priority_condition_deduction`) 
VALUES (1, 8.0, 11.0, 4.0, 8.0, 4.0, '08:00', '12:00', '13:00', '17:00', 70, 1, 50, 20.0, 'mang thai,người già', 50);

INSERT OR IGNORE INTO `users` (`id`, `name`, `email`, `username`, `password_hash`, `role`, `energy_score`, `skill_level`, `max_weekly_hours`, `base_hourly_rate`) 
VALUES (1, 'Administrator', 'admin@example.com', 'admin', '$2a$10$tMhO276K/B0fM/7Z61zHGe1PugHh6H6q4u8B/N3h4tO4G7v54uN9K', 'admin', 100, 1, 40, 20.0);
