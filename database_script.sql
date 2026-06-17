-- Script SQL tạo cấu trúc cơ sở dữ liệu SQLite cho Hệ thống Quản lý Nhân sự Theo Ca
-- Tương ứng với các thực thể GORM AutoMigrate trong mã nguồn

-- 1. Bảng users (Tài khoản nhân viên & cấu hình cá nhân)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `name` TEXT NOT NULL,
    `email` TEXT UNIQUE NOT NULL,
    `username` TEXT UNIQUE NOT NULL,
    `password_hash` TEXT NOT NULL,
    `phone` TEXT,
    `role` TEXT NOT NULL CHECK(`role` IN ('admin', 'manager', 'employee')),
    `energy_score` INTEGER DEFAULT 100,
    `skill_level` INTEGER DEFAULT 1,
    `base_hourly_rate` REAL DEFAULT 0.0,
    `max_weekly_hours` INTEGER DEFAULT 40
);

-- 2. Bảng locations (Địa điểm/Chi nhánh làm việc)
CREATE TABLE IF NOT EXISTS `locations` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `name` TEXT NOT NULL,
    `address` TEXT
);

-- 3. Bảng tasks (Nhiệm vụ công việc cần phân ca)
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `title` TEXT NOT NULL,
    `description` TEXT,
    `location_id` INTEGER,
    `required_role` TEXT NOT NULL,
    `required_skill` INTEGER DEFAULT 1,
    `headcount` INTEGER DEFAULT 1,
    `work_model` TEXT DEFAULT 'Parallel',
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `is_scheduled` BOOLEAN DEFAULT 0,
    `is_assigned` BOOLEAN DEFAULT 0,
    `urgency_level` TEXT DEFAULT 'Medium',
    `coordination_status` TEXT DEFAULT 'Pending',
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`)
);

-- 4. Bảng shifts (Ca trực thực tế được gán cho nhân sự)
CREATE TABLE IF NOT EXISTS `shifts` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `location_id` INTEGER NOT NULL,
    `task_id` INTEGER NOT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `clock_in_time` DATETIME,
    `clock_out_time` DATETIME,
    `notes` TEXT,
    `status` TEXT DEFAULT 'scheduled' CHECK(`status` IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`),
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`)
);

-- 5. Bảng system_settings (Cấu hình tham số hệ thống và ngưỡng)
CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `max_shift_hours` REAL DEFAULT 8.0,
    `min_rest_hours` REAL DEFAULT 11.0,
    `prioritized_health_conditions` TEXT DEFAULT '',
    `priority_condition_deduction` INTEGER DEFAULT 20
);

-- 6. Bảng time_off_requests (Yêu cầu xin nghỉ phép)
CREATE TABLE IF NOT EXISTS `time_off_requests` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `duration_hours` REAL,
    `reason` TEXT,
    `status` TEXT DEFAULT 'pending' CHECK(`status` IN ('pending', 'approved', 'denied')),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
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
    `status` TEXT DEFAULT 'pending' CHECK(`status` IN ('pending', 'approved', 'rejected')),
    `points_deducted` INTEGER DEFAULT 0,
    `admin_notes` TEXT,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- 8. Bảng known_conditions (Danh mục bệnh đã biết và điểm trừ mặc định)
CREATE TABLE IF NOT EXISTS `known_conditions` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `condition` TEXT UNIQUE NOT NULL,
    `points_deducted` INTEGER DEFAULT 10
);

-- 9. Bảng coordination_suggestions (Đề xuất điều phối khi thiếu nhân sự)
CREATE TABLE IF NOT EXISTS `coordination_suggestions` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `task_id` INTEGER NOT NULL,
    `type` TEXT NOT NULL,
    `suggested_user` INTEGER,
    `suggested_start` DATETIME,
    `suggested_end` DATETIME,
    `reasoning` TEXT,
    `risk_score` INTEGER DEFAULT 0,
    `is_approved` BOOLEAN DEFAULT 0,
    FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`),
    FOREIGN KEY (`suggested_user`) REFERENCES `users`(`id`)
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
    `score` INTEGER NOT NULL CHECK(`score` BETWEEN 0 AND 100),
    `multiplier` REAL DEFAULT 1.0,
    `notes` TEXT,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
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
    `total_hours` REAL DEFAULT 0.0,
    `base_rate` REAL DEFAULT 0.0,
    `base_pay` REAL DEFAULT 0.0,
    `bonus_pay` REAL DEFAULT 0.0,
    `total_pay` REAL DEFAULT 0.0,
    `is_paid` BOOLEAN DEFAULT 0,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- 12. Bảng shift_swaps (Đơn trao đổi ca làm việc)
CREATE TABLE IF NOT EXISTS `shift_swaps` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `requester_id` INTEGER NOT NULL,
    `target_user_id` INTEGER,
    `shift_id` INTEGER NOT NULL,
    `status` TEXT DEFAULT 'pending' CHECK(`status` IN ('pending', 'pending_admin_assignment', 'approved', 'rejected')),
    FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`)
);

-- 13. Bảng notifications (Thông báo hệ thống cho người dùng)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INTEGER PRIMARY KEY AUTOINCREMENT,
    `created_at` DATETIME,
    `updated_at` DATETIME,
    `deleted_at` DATETIME,
    `user_id` INTEGER NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT 0,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- Dữ liệu hạt giống mặc định (Seed Data)
INSERT OR IGNORE INTO `system_settings` (`id`, `max_shift_hours`, `min_rest_hours`) VALUES (1, 8.0, 11.0);
INSERT OR IGNORE INTO `users` (`id`, `name`, `email`, `username`, `password_hash`, `role`) 
VALUES (1, 'Administrator', 'admin@example.com', 'admin', '$2a$10$tMhO276K/B0fM/7Z61zHGe1PugHh6H6q4u8B/N3h4tO4G7v54uN9K', 'admin'); -- Mật khẩu mặc định: admin
