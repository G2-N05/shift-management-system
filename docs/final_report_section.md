# Phân Tích Khó Khăn Gặp Phải Và Hướng Khắc Phục (Final Report Section)

Dưới đây là nội dung phân tích chi tiết về các khó khăn phát sinh trong quá trình nghiên cứu, thiết kế hệ thống và các giải pháp cải tiến đã được thực hiện sau khi nhận được ý kiến phản hồi và định hướng từ giảng viên.

---

## KHÓ KHĂN GẶP PHẢI VÀ HƯỚNG KHẮC PHỤC

### 1. Bổ sung và phân tách hệ thống tài liệu theo cấu trúc các tuần thực hành (Labs)
*   **Khó khăn gặp phải**: 
    Hệ thống tài liệu ban đầu được xây dựng dưới dạng các tài liệu thiết kế chi tiết tổng hợp (composite design documents). Việc này dẫn đến việc phân bổ thông tin bị tập trung quá mức, gây khó khăn cho việc tra cứu, đối chiếu tiến độ theo từng giai đoạn thực hành tuần (labs) và chưa bám sát chặt chẽ cấu trúc phân mảnh trong rubric đánh giá của giảng viên.
*   **Hướng khắc phục (Cải tiến sau phản hồi)**: 
    Nhóm phát triển đã tiến hành rà soát toàn bộ hệ thống tài liệu, thực hiện phân tách và tái cấu trúc các tệp tin một cách khoa học:
    *   **Tuần 3**: Phân rã tài liệu thiết kế chi tiết tổng hợp thành hai tệp chuyên biệt là [Class_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Class_Diagram.md) (tập trung vào sơ đồ cấu trúc tĩnh) và [Code_Skeleton.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Code_Skeleton.md) (tập trung vào cấu trúc mã nguồn).
    *   **Tuần 4**: Tách biệt thành [Sequence_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/Sequence_Diagram.md) (thiết kế tương tác động) và [UI_Mockup.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/UI_Mockup.md) (đặc tả giao diện chi tiết).
    *   **Tuần 5**: Phân tách rõ ràng thành [State_Machine_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/State_Machine_Diagram.md) (mô hình hóa vòng đời thực thể) và [Activity_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/Activity_Diagram.md) (mô hình hóa quy trình nghiệp vụ).
    *   **Tuần 6**: Chia nhỏ thành [Package_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Package_Diagram.md) (kiến trúc phân rã gói) và [Interfaces_Design.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Interfaces_Design.md) (đặc tả giao diện lớp).

### 2. Làm rõ kịch bản và mô tả chi tiết các trường hợp sử dụng (Use Cases)
*   **Khó khăn gặp phải**: 
    Kịch bản nghiệp vụ trong các phiên bản đầu tiên chỉ dừng lại ở mức mô tả tổng quát, chưa làm bật lên các ràng buộc nghiệp vụ đặc thù trong hệ thống quản lý ca trực thực tế như: sự ảnh hưởng của điểm năng lượng sức khỏe (Energy Score), cơ chế tự động tìm người thay thế (Auto-Swap), hay quy trình phê duyệt nghỉ phép ảnh hưởng trực tiếp đến việc giải phóng ca làm đè lịch.
*   **Hướng khắc phục (Cải tiến sau phản hồi)**: 
    Nhóm đã chi tiết hóa tài liệu kịch bản thông qua [UseCase_Scenarios_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Scenarios_Tuan_2.md). Tài liệu này cung cấp mô tả chi tiết cho 8 luồng nghiệp vụ cốt lõi, làm rõ đầy đủ các thông tin: Tiền điều kiện (Preconditions), Luồng sự kiện chính (Main Flow), Luồng sự kiện thay thế (Alternative Flow), Ngoại lệ (Exception Flow), và Hậu điều kiện (Postconditions). Điều này giúp làm rõ toàn bộ cách thức tương tác của các tác nhân (Admin, Manager, Employee) với hệ thống.

### 3. Rà soát và đồng bộ hóa các sơ đồ UML theo các giai đoạn báo cáo
*   **Khó khăn gặp phải**: 
    Các sơ đồ UML động (đặc biệt là Sequence Diagrams và Activity Diagrams) trong các giai đoạn đầu chưa phản ánh chính xác cấu trúc phân tầng thực tế của mã nguồn và thiếu vắng các điều kiện bảo vệ (Guard Conditions) cần thiết để kiểm soát quy trình nghiệp vụ.
*   **Hướng khắc phục (Cải tiến sau phản hồi)**: 
    Thực hiện rà soát và chuẩn hóa toàn bộ các sơ đồ theo đúng hướng dẫn báo cáo:
    *   **Sequence Diagrams**: Được chuẩn hóa để hiển thị rõ các lớp tham gia (lifelines) tương ứng với kiến trúc 3 tầng của mã nguồn: `Actor` $\rightarrow$ `UI` $\rightarrow$ `Router` $\rightarrow$ `Handler` $\rightarrow$ `Service` $\rightarrow$ `Repository` $\rightarrow$ `Database`.
    *   **Activity & State Machine Diagrams**: Bổ sung chi tiết các điều kiện bảo vệ (ví dụ: quy tắc nghỉ ngơi 11 giờ giữa 2 ca trực liên tiếp, giới hạn giờ làm thêm tối đa tuần theo Energy Score), đồng bộ hóa hoàn toàn trạng thái thực thể vẽ trên sơ đồ với trạng thái thực tế lưu trữ trong cơ sở dữ liệu SQLite.

### 4. Nâng cao mức độ hoàn thiện của báo cáo tổng hợp
*   **Khó khăn gặp phải**: 
    Mối liên hệ giữa yêu cầu chức năng đầu vào và mã nguồn thực thi cuối cùng chưa được thể hiện một cách tường minh, dẫn đến việc thiếu tính truy vết và giảm độ hoàn thiện khoa học của báo cáo tổng hợp.
*   **Hướng khắc phục (Cải tiến sau phản hồi)**: 
    Tại giai đoạn hoàn thiện báo cáo (Tuần 8), nhóm đã tiến hành xây dựng hai tài liệu nền tảng:
    *   [Core_Features.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week8/Core_Features.md): Đặc tả chi tiết các tính năng cốt lõi dựa trên mã nguồn thực tế.
    *   [Feature_Code_Mapping.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week8/Feature_Code_Mapping.md): Thiết lập một **Ma trận truy vết yêu cầu (Traceability Matrix)** hoàn chỉnh liên kết chuỗi logic: *Yêu cầu chức năng (FR)* $\rightarrow$ *Ca sử dụng (UC)* $\rightarrow$ *Tầng nghiệp vụ (Service)* $\rightarrow$ *Tầng dữ liệu (Repository)* $\rightarrow$ *Thực thể cơ sở dữ liệu (Database Entity)* $\rightarrow$ *Màn hình giao diện (UI Screen)*. Việc này giúp báo cáo đạt độ hoàn thiện cao nhất và dễ dàng phục vụ công tác đánh giá.

### 5. Nghiên cứu phương pháp lưu trữ trạng thái phiên làm việc (Session-based)
*   **Khó khăn gặp phải**: 
    Hệ thống hiện tại đang sử dụng cơ chế xác thực phi trạng thái (Stateless Authentication) dựa trên JSON Web Token (JWT) truyền trực tiếp dưới HTTP Header. Cơ chế này dù mang lại hiệu năng cao nhưng gặp hạn chế trong việc kiểm soát phiên làm việc chủ động từ phía máy chủ (server-side session control) như: không thể thu hồi token ngay lập tức khi người dùng đăng xuất, hoặc khó quản lý thời gian hết hạn động của phiên làm việc.
*   **Hướng khắc phục (Cải tiến sau phản hồi)**: 
    Nhận định đây là một định hướng nâng cấp bảo mật quan trọng, nhóm đã thực hiện nghiên cứu chuyên sâu về phương pháp xác thực lưu session (Session-based Authentication) phía máy chủ:
    *   **Cơ chế đề xuất**: Sử dụng một bảng lưu trữ Session (`session_store`) trong SQLite hoặc tích hợp Redis làm In-memory Session Cache để lưu trữ ID phiên làm việc ngẫu nhiên, client chỉ lưu session cookie được ký bảo mật (Secure/HttpOnly Cookie).
    *   **Đánh giá thiết kế**: So sánh chi tiết hai mô hình Stateless (JWT hiện tại) và Stateful (Session-based) để làm rõ sự cân bằng giữa tính bảo mật (dễ dàng hủy phiên ngay lập tức từ Admin) và hiệu năng hệ thống (yêu cầu truy vấn session store ở mỗi request).
    *   **Định hướng tích hợp**: Thiết kế sẵn cấu trúc phần mềm ở tầng Middleware (`ui/middleware.go`) để có thể chuyển đổi cơ chế kiểm tra token sang kiểm tra Session ID trong cơ sở dữ liệu một cách mượt mà khi hệ thống yêu cầu nâng cấp tính bảo mật phiên làm việc.
