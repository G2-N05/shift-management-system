# Đặc Tả Kịch Bản Use Case Tuần 2 (Bản sửa đổi)

Tài liệu này chi tiết hóa kịch bản thực thi (Step-by-Step) và các quy tắc nghiệp vụ cho **8 Use Cases trọng tâm** của hệ thống Shift Management System, đảm bảo đúng cấu trúc và khớp với mã nguồn thực tế.

---

## 1. UC-01: Đăng nhập (Login)

*   **Mã Use Case**: `UC-01`
*   **Tên Use Case**: Đăng nhập
*   **Actor chính**: Admin, Manager, Employee
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Tài khoản của người dùng đã được đăng ký và lưu mật khẩu đã mã hóa trong cơ sở dữ liệu.
*   **Luồng chính (Main Flow)**:
    1. Người dùng nhập tên đăng nhập (`Username`) và mật khẩu (`Password`) tại màn hình đăng nhập.
    2. Hệ thống kiểm tra tài khoản trong cơ sở dữ liệu (`User` table).
    3. Hệ thống so sánh mã băm mật khẩu bằng thuật toán Bcrypt.
    4. Xác thực thành công, hệ thống sinh mã JWT Token chứa mã định danh (`userID`) và quyền hạn (`role`).
    5. Hệ thống gửi trả token về client và chuyển hướng người dùng vào giao diện Dashboard tương ứng với vai trò.
*   **Luồng thay thế (Alternative Flows)**: Không có.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Sai tài khoản/mật khẩu**: Hệ thống báo lỗi "invalid credentials" (HTTP 401) và dừng lại.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Người dùng thiết lập phiên làm việc thành công, token được lưu trữ ở local client để xác thực các API tiếp theo.
*   **File nguồn liên quan**:
    *   [service/auth_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/auth_service.go)
    *   [ui/handlers.go#L308-L323](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L308-L323)

---

## 2. UC-07: Sinh lịch tự động (Auto-scheduling)

*   **Mã Use Case**: `UC-07`
*   **Tên Use Case**: Sinh lịch tự động
*   **Actor chính**: Manager, Admin
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Có ít nhất một nhiệm vụ công việc (`Task`) chưa được phân công (`is_assigned = false`) trong cơ sở dữ liệu.
*   **Luồng chính (Main Flow)**:
    1. Quản lý truy cập màn hình lập lịch và nhấn nút "Auto-Schedule".
    2. Hệ thống truy vấn danh sách các `Task` chưa được lập lịch.
    3. Hệ thống tải toàn bộ danh sách `User` và các ca làm việc (`Shift`) hiện có trong tuần làm việc mục tiêu.
    4. Đối với mỗi nhiệm vụ:
        *   Tìm các ứng viên phù hợp với vai trò (`Role`) và có cấp độ kỹ năng (`SkillLevel`) tối thiểu đáp ứng yêu cầu.
        *   Kiểm tra các ràng buộc cứng thông qua Rule Engine (Tránh trùng ca, nghỉ tối thiểu 11 giờ giữa các ca, số giờ làm tối đa tuần).
        *   Kiểm tra ràng buộc sức khỏe (Nếu điểm năng lượng < 50: tối đa 1 ca/ngày. Nếu điểm năng lượng < 70: không phân ca liên tiếp sau ngày làm nặng).
        *   Tính điểm phạt cho các ứng viên đủ điều kiện để tối ưu hóa cân bằng tải và bảo toàn kỹ năng.
    5. Hệ thống sắp xếp ứng viên theo điểm phạt tăng dần, chọn người tốt nhất để tạo bản ghi `Shift` mới trong DB.
    6. Đánh dấu `Task` là đã được xếp lịch (`IsAssigned = true`).
*   **Luồng thay thế (Alternative Flows)**:
    *   **A1: Phân ca Sequential (Tuần tự)**: Đối với các công việc có mô hình tuần tự, hệ thống chia nhỏ nhiệm vụ thành các ca nhỏ tương ứng ca sáng/chiều và lập lịch cho từng người nối tiếp nhau.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Không có nhân sự đáp ứng**: Hệ thống không thể phân công nhiệm vụ, cập nhật trạng thái nhiệm vụ thành `Understaffed` và tự động gửi thông báo cảnh báo tới tài khoản Admin (User 1).
*   **Điều kiện sau khi thực hiện (Postconditions)**: Các bản ghi ca làm việc (`Shift`) mới được lưu vào cơ sở dữ liệu, lịch làm việc được cập nhật.
*   **File nguồn liên quan**:
    *   [service/task_service.go#L99-L317](file:///d:/Workspace/TBDD/shift-management-system/service/task_service.go#L99-L317)
    *   [service/rule_engine.go](file:///d:/Workspace/TBDD/shift-management-system/service/rule_engine.go)

---

## 3. UC-09: Duyệt đổi ca & Auto-Swap

*   **Mã Use Case**: `UC-09`
*   **Tên Use Case**: Duyệt đổi ca & Auto-Swap
*   **Actor chính**: Employee
*   **Actor phụ**: Admin, Đồng nghiệp nhận đổi ca
*   **Điều kiện tiên quyết**: Nhân viên yêu cầu đổi ca có một ca làm việc ở trạng thái sắp diễn ra.
*   **Luồng chính (Main Flow)**:
    1. Nhân viên truy cập lịch cá nhân, chọn ca làm việc sắp tới và nhấn "Auto-Swap".
    2. Hệ thống quét danh sách đồng nghiệp có cùng vai trò, đáp ứng yêu cầu kỹ năng và không vi phạm ràng buộc thời gian nghỉ ngơi.
    3. Hệ thống tạo các bản ghi yêu cầu đổi ca (`ShiftSwap`) ở trạng thái `pending` gửi tới toàn bộ ứng viên tìm được.
    4. Gửi thông báo đến tài khoản các đồng nghiệp này.
    5. Một đồng nghiệp đồng ý nhận đổi ca bằng cách phê duyệt yêu cầu.
    6. Hệ thống cập nhật chủ sở hữu ca làm việc (`Shift.UserID`) sang đồng nghiệp, lưu ghi chú "[OVERTIME - Nhận từ Đổi ca]", và cập nhật trạng thái `ShiftSwap` thành `approved`.
    7. Tự động chuyển tất cả các yêu cầu đổi ca trùng lặp khác của ca làm này về trạng thái `rejected`.
*   **Luồng thay thế (Alternative Flows)**:
    *   **A1: Không tìm thấy ứng viên tự động**: Hệ thống lưu trạng thái đổi ca là `pending_admin_assignment` và gửi cảnh báo lên hệ thống Admin. Admin sẽ vào màn hình quản trị và chỉ định thủ công nhân sự khác gánh vác ca làm.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Ca làm việc đã bắt đầu**: Hệ thống từ chối yêu cầu đổi ca và thông báo "shift has already started".
    *   **E2: Vi phạm ràng buộc đột xuất**: Nếu ứng viên chấp nhận đổi ca bị vi phạm trùng ca hoặc vi phạm nghỉ ngơi 11 giờ, hệ thống từ chối áp dụng và thông báo lỗi.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Quyền sở hữu ca làm việc được chuyển giao hợp lệ trong cơ sở dữ liệu, kích hoạt tiến trình tự động xếp lịch lại ca làm việc trống của người gửi yêu cầu.
*   **File nguồn liên quan**:
    *   [service/shift_swap_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/shift_swap_service.go)
    *   [ui/handlers.go#L353-L478](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L353-L478)

---

## 4. UC-16: Gửi khai báo sức khỏe (Submit Health Declaration)

*   **Mã Use Case**: `UC-16`
*   **Tên Use Case**: Gửi khai báo sức khỏe
*   **Actor chính**: Employee
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Người dùng đã đăng nhập thành công vào ứng dụng (Web hoặc Mobile).
*   **Luồng chính (Main Flow)**:
    1. Nhân viên mở mục Khai báo sức khỏe.
    2. Nhập thông tin chi tiết về tình trạng bệnh (ví dụ: "Bị sốt xuất huyết, mệt mỏi").
    3. Chụp ảnh hoặc đính kèm tài liệu y tế minh chứng (`ProofFile`).
    4. Nhấn nút "Gửi".
    5. Hệ thống tải tệp tin đính kèm lưu vào thư mục lưu trữ cục bộ, tạo bản ghi `HealthDeclaration` mới trong cơ sở dữ liệu với trạng thái mặc định là `pending`.
*   **Luồng thay thế (Alternative Flows)**: Không có.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Lỗi lưu tệp tin**: Không thể lưu file đính kèm lên máy chủ, hệ thống trả về lỗi "failed to save file" (HTTP 500) và hủy giao dịch tạo bản khai báo.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Bản khai báo sức khỏe ở trạng thái chờ duyệt được lưu trong DB, Admin nhận được thông báo.
*   **File nguồn liên quan**:
    *   [ui/handlers.go#L505-L536](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L505-L536)
    *   [mobile/lib/screens/profile_screen.dart#L125-L270](file:///d:/Workspace/TBDD/shift-management-system/mobile/lib/screens/profile_screen.dart#L125-L270)

---

## 5. UC-17: Phê duyệt khai báo sức khỏe (Approve Health Declaration)

*   **Mã Use Case**: `UC-17`
*   **Tên Use Case**: Phê duyệt khai báo sức khỏe
*   **Actor chính**: Admin
*   **Actor phụ**: FastAPI NLP Service
*   **Điều kiện tiên quyết**: Có bản khai báo sức khỏe ở trạng thái `pending` trong cơ sở dữ liệu.
*   **Luồng chính (Main Flow)**:
    1. Admin truy cập màn hình duyệt khai báo sức khỏe chờ xử lý.
    2. Hệ thống tự động gửi yêu cầu so sánh ngữ nghĩa bệnh trạng đến cổng `8000` của FastAPI NLP Service.
    3. NLP Service thực hiện nhúng vector và phản hồi lại tên từ khóa bệnh khớp nhất kèm theo độ tương đồng ngữ nghĩa.
    4. Hệ thống gợi ý điểm năng lượng cần trừ tương ứng với bệnh trạng khớp được.
    5. Admin xem ảnh minh chứng, xác nhận thông tin và nhấn "Duyệt" (có thể điều chỉnh điểm trừ nếu cần).
    6. Hệ thống cập nhật trạng thái khai báo thành `approved`, đồng thời trừ đi điểm năng lượng của nhân viên tương ứng (`User.EnergyScore = EnergyScore - PointsDeducted`).
*   **Luồng thay thế (Alternative Flows)**:
    *   **A1: Từ chối khai báo**: Admin thấy minh chứng không hợp lệ, nhập ghi chú từ chối và nhấn "Từ chối". Trạng thái cập nhật thành `rejected`, không bị trừ điểm năng lượng.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: NLP Service mất kết nối**: Nếu dịch vụ AI bị ngoại tuyến, hệ thống ghi nhận lỗi và cho phép Admin tự chọn bệnh trạng và nhập điểm trừ thủ công mà không cần gợi ý của AI.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Trạng thái tờ khai sức khỏe được cập nhật, điểm năng lượng của nhân sự thay đổi trong cơ sở dữ liệu, ảnh hưởng trực tiếp đến việc phân ca ở kỳ tiếp theo.
*   **File nguồn liên quan**:
    *   [service/health_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/health_service.go)
    *   [ui/handlers.go#L578-L615](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L578-L615)

---

## 6. UC-19: Chấm công vào ca (Clock-In)

*   **Mã Use Case**: `UC-19`
*   **Tên Use Case**: Chấm công vào ca - Clock-In
*   **Actor chính**: Employee
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Ca trực của nhân viên ở trạng thái `scheduled` và thời gian hiện tại nằm trong khung thời gian cho phép của ca.
*   **Luồng chính (Main Flow)**:
    1. Nhân viên nhấn nút "Clock In" trên thiết bị di động hoặc web.
    2. Hệ thống ghi nhận thời gian hiện tại làm `ClockInTime`.
    3. Cập nhật trạng thái ca làm việc (`Shift.Status`) thành `in_progress`.
    4. Lưu thay đổi và gửi thông báo xác nhận thành công cho nhân viên.
*   **Luồng thay thế (Alternative Flows)**: Không có.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Ca làm việc không tồn tại**: Hệ thống thông báo lỗi và ngăn chặn thao tác.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Ghi nhận thời điểm bắt đầu làm việc của nhân viên trong cơ sở dữ liệu để làm căn cứ tính lương.
*   **File nguồn liên quan**:
    *   [service/shift_service.go#L33-L41](file:///d:/Workspace/TBDD/shift-management-system/service/shift_service.go#L33-L41)
    *   [ui/handlers.go#L325-L337](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L325-L337)

---

## 7. UC-22: Áp dụng gợi ý điều phối (Apply Coordination Suggestion)

*   **Mã Use Case**: `UC-22`
*   **Tên Use Case**: Áp dụng gợi ý điều phối
*   **Actor chính**: Manager, Admin
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Nhiệm vụ (`Task`) đã bị đánh dấu là `Understaffed` (Thiếu nhân sự) và hệ thống đã tạo các đề xuất điều phối.
*   **Luồng chính (Main Flow)**:
    1. Quản lý mở màn hình quản lý điều phối thông minh, xem các ca làm việc bị thiếu người.
    2. Hệ thống hiển thị các gợi ý điều phối bao gồm: Danh sách nhân sự thay thế phù hợp, làm thêm giờ hoặc đổi lịch.
    3. Quản lý chọn một gợi ý thay thế (`Replacement`) hoặc làm thêm (`Overtime`) và nhấn "Duyệt".
    4. Hệ thống tự động tạo một ca trực mới (`Shift`) cho nhân sự được đề xuất khớp với thời gian của nhiệm vụ.
    5. Đánh dấu gợi ý điều phối là đã áp dụng (`IsApproved = true`).
    6. Cập nhật trạng thái nhiệm vụ thành `Resolved`.
*   **Luồng thay thế (Alternative Flows)**:
    *   **A1: Duyệt dời lịch (Reschedule)**: Nếu quản lý chọn gợi ý dời lịch, hệ thống tự động cập nhật ngày bắt đầu và kết thúc của `Task` sang ngày tiếp theo như đề xuất.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Gợi ý không tồn tại/đã bị xóa**: Hệ thống báo lỗi và hủy thao tác.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Nhiệm vụ được khôi phục nhân sự trực, ca làm mới được tạo hoặc thời gian của nhiệm vụ được cập nhật trong DB.
*   **File nguồn liên quan**:
    *   [service/coordination_service.go#L180-L218](file:///d:/Workspace/TBDD/shift-management-system/service/coordination_service.go#L180-L218)
    *   [ui/handlers.go#L663-L678](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L663-L678)

---

## 8. UC-26: Tính toán và phê duyệt bảng lương (Calculate Payroll)

*   **Mã Use Case**: `UC-26`
*   **Tên Use Case**: Tính toán và phê duyệt bảng lương
*   **Actor chính**: Admin
*   **Actor phụ**: Không có
*   **Điều kiện tiên quyết**: Đã đăng nhập vào hệ thống dưới quyền Admin.
*   **Luồng chính (Main Flow)**:
    1. Admin chọn tháng, năm cần tính lương và nhấn "Calculate Payroll".
    2. Hệ thống truy vấn toàn bộ nhân viên (`User`).
    3. Đối với mỗi nhân viên, hệ thống:
        *   Tìm tất cả các ca trực đã hoàn thành (`completed`) trong tháng mục tiêu.
        *   Tính tổng số giờ làm việc thực tế dựa trên khoảng cách giữa `ClockOutTime` và `ClockInTime`.
        *   Lấy mức lương cơ bản mỗi giờ của nhân viên (`BaseHourlyRate`).
        *   Tính lương gốc: $BasePay = TotalHours \times BaseHourlyRate$.
        *   Tải điểm KPI của nhân viên trong tháng đó để lấy hệ số nhân lương thưởng (`Multiplier`, mặc định là 1.0).
        *   Tính thưởng: $BonusPay = BasePay \times (Multiplier - 1.0) + OvertimePay$.
        *   Tính tổng thực lĩnh: $TotalPay = BasePay + BonusPay$.
    4. Hệ thống lưu/cập nhật bản ghi `PayrollRecord` trong cơ sở dữ liệu cho từng nhân viên.
*   **Luồng thay thế (Alternative Flows)**: Không có.
*   **Luồng ngoại lệ (Exception Flows)**:
    *   **E1: Lỗi tính toán/kết nối DB**: Hệ thống dừng lại, báo lỗi và rollback toàn bộ các bảng lương đã tính trong tháng đó.
*   **Điều kiện sau khi thực hiện (Postconditions)**: Bảng lương tháng được chốt thành công trong DB, nhân viên có thể xem được thu nhập của mình qua tài khoản cá nhân.
*   **File nguồn liên quan**:
    *   [service/payroll_service.go](file:///d:/Workspace/TBDD/shift-management-system/service/payroll_service.go)
    *   [ui/handlers.go#L712-L750](file:///d:/Workspace/TBDD/shift-management-system/ui/handlers.go#L712-L750)