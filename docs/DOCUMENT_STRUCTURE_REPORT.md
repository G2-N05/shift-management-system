# Báo Cáo Tái Cấu Trúc Tài Liệu Đóng Gói (DOCUMENT STRUCTURE REPORT)

Tài liệu này tổng hợp chi tiết việc tái cấu trúc cấu trúc thư mục tài liệu từ Weeks 3–6 theo đúng cấu trúc phân tách chi tiết (rubric chấm điểm) của giáo viên.

---

## 1. Chi tiết Tái cấu trúc tài liệu (Refactoring Breakdown)

| Tuần (Week) | Tài liệu cũ (Old File) | Các tài liệu mới được tạo (New Files Created) | Nội dung được chuyển đi (Content Moved) |
| :--- | :--- | :--- | :--- |
| **Week 3** | `docs/week3/Detailed_Design.md` | `docs/week3/Class_Diagram.md` | UML Class Diagram (Mermaid), Relationship Descriptions, Multiplicity Rules. |
| | | `docs/week3/Code_Skeleton.md` | Domain Model / Entity List, Entity Descriptions, Service Layer Design, Repository Layer Design. |
| **Week 4** | `docs/week4/Interaction_Design.md` | `docs/week4/Sequence_Diagram.md` | Sequence Diagrams cho 4 trường hợp sử dụng chính (UC-01, UC-07, UC-16/17, UC-19/20). |
| | | `docs/week4/UI_Mockup.md` | Chi tiết đặc tả 6 màn hình giao diện (UI Screen Specifications) cho Web & Mobile. |
| **Week 5** | `docs/week5/Behavior_Design_Tuan_5.md` | `docs/week5/State_Machine_Diagram.md` | Vòng đời (State Machine Diagrams) cho 5 thực thể chính: Shift, ShiftSwap, HealthDeclaration, TimeOffRequest, CoordinationSuggestion. |
| | | `docs/week5/Activity_Diagram.md` | 4 Biểu đồ hoạt động quy trình nghiệp vụ (Auto Scheduling, AI Health, Clock-In/Out, Payroll Calculation) và Bảng ánh xạ luồng nghiệp vụ. |
| **Week 6** | `docs/week6/Package_Diagram_Interfaces_Tuan_6.md` | `docs/week6/Package_Diagram.md` | Sơ đồ đóng gói Mermaid, giải thích kiến trúc phân tầng 3 lớp, các quy tắc phụ thuộc và sơ đồ ánh xạ cấu trúc mã nguồn thực tế. |
| | | `docs/week6/Interfaces_Design.md` | Khai báo toàn bộ Go Interfaces cho tầng nghiệp vụ (Service) và tầng cơ sở dữ liệu (Repository). |

---

## 2. Kiểm tra Sự Toàn vẹn và Thiếu hụt (Integrity & Completeness Check)

- **Bảo toàn Nội dung**: Toàn bộ nội dung mô tả, sơ đồ Mermaid, đoạn mã skeleton/interfaces và các liên kết tệp nguồn đã được bảo toàn 100% không suy suyển hay sửa đổi bất kỳ chi tiết kỹ thuật nào.
- **Không tái tạo sơ đồ**: Giữ nguyên toàn bộ mã Mermaid nguyên bản, không tạo lại sơ đồ UML.
- **Các thành phần bị thiếu (Missing deliverables)**: **Không có (NONE)**. Tất cả các tài liệu theo rubric đánh giá của giáo viên cho các tuần 3, 4, 5, 6 đều đã có đầy đủ tệp riêng biệt tương ứng.
