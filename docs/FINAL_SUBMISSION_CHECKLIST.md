# Danh Mục Kiểm Tra Bản Nộp Cuối Kỳ (FINAL SUBMISSION CHECKLIST)

Bảng dưới đây tổng hợp danh mục kiểm tra toàn bộ các tài liệu thiết kế và báo cáo từ Tuần 1 đến Tuần 10 phục vụ việc nghiệm thu và đánh giá môn học.

---

## 1. Danh sách Tài liệu & Trạng thái Kiểm tra (Submission Checklist)

| Tuần (Week) | Tên Thành Phần (Deliverable) | Đường Dẫn File Thực Tế (File Path) | Trạng Thái Kiểm Tra | Ghi Chú Tính Đồng Bộ |
| :---: | :--- | :--- | :---: | :--- |
| **Week 1** | Tài liệu Đặc tả Yêu cầu (SRS) | [docs/week1/SRS.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/SRS.md) | **PASS** | Đồng bộ 3 vai trò và 36 yêu cầu chức năng (FR). |
| | Ma trận Tác nhân - Ca sử dụng | [docs/week1/Actor_UseCase_Matrix.csv](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/Actor_UseCase_Matrix.csv) | **PASS** | Định dạng CSV chuẩn, khớp phân quyền. |
| | Biên bản họp Tuần 1 | [docs/week1/Bien_Ban_Hop_Tuan_1.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week1/Bien_Ban_Hop_Tuan_1.md) | **PASS** | Ghi nhận phân công công việc ban đầu. |
| **Week 2** | Sơ đồ Ca sử dụng (Use Case) | [docs/week2/UseCase_Diagram_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Diagram_Tuan_2.md) | **PASS** | Sơ đồ Mermaid đầy đủ mối quan hệ include/extend. |
| | Kịch bản Ca sử dụng Chi tiết | [docs/week2/UseCase_Scenarios_Tuan_2.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week2/UseCase_Scenarios_Tuan_2.md) | **PASS** | Mô tả chi tiết 8 kịch bản nghiệp vụ cốt lõi. |
| **Week 3** | Sơ đồ Lớp tĩnh (Class Diagram) | [docs/week3/Class_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Class_Diagram.md) | **PASS** | Khớp 100% các thuộc tính thực thể trong SQLite. |
| | Thiết kế Cấu trúc Mã nguồn | [docs/week3/Code_Skeleton.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week3/Code_Skeleton.md) | **PASS** | Ánh xạ cấu trúc Service/Repository Go. |
| **Week 4** | Sơ đồ Trình tự (Sequence) | [docs/week4/Sequence_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/Sequence_Diagram.md) | **PASS** | Lifeline khớp mô hình phân tầng thực tế của code. |
| | Đặc tả Giao diện Mockup | [docs/week4/UI_Mockup.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week4/UI_Mockup.md) | **PASS** | Đặc tả chi tiết 6 màn hình Web & Mobile. |
| **Week 5** | Biểu đồ Máy Trạng thái | [docs/week5/State_Machine_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/State_Machine_Diagram.md) | **PASS** | Đặc tả 5 vòng đời thực thể cốt lõi trong DB. |
| | Biểu đồ Hoạt động & Workflow | [docs/week5/Activity_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week5/Activity_Diagram.md) | **PASS** | Mô tả 4 luồng xử lý và Bảng ánh xạ nghiệp vụ. |
| **Week 6** | Sơ đồ Đóng gói (Package) | [docs/week6/Package_Diagram.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Package_Diagram.md) | **PASS** | Khớp cấu trúc gói 3 lớp trong Golang. |
| | Thiết kế Giao diện Lớp | [docs/week6/Interfaces_Design.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week6/Interfaces_Design.md) | **PASS** | Khai báo Go Interfaces của Service/Repository. |
| **Week 7** | Đặc tả Mẫu thiết kế | [docs/week7/Design_Patterns.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week7/Design_Patterns.md) | **PASS** | Mô tả Repository, DI (và ghi chú về Strategy). |
| **Week 8** | Đặc tả Tính năng Cốt lõi | [docs/week8/Core_Features.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week8/Core_Features.md) | **PASS** | Khớp 14 tính năng cốt lõi dựa trên source code. |
| | Ma trận Truy vết Yêu cầu | [docs/week8/Feature_Code_Mapping.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week8/Feature_Code_Mapping.md) | **PASS** | Liên kết FR -> UC -> Service -> Repo -> DB -> UI. |
| **Week 9** | Thiết kế Tích hợp Hệ thống | [docs/week9/Integration_Design.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week9/Integration_Design.md) | **PASS** | Tích hợp Web, Mobile, GORM DB, và FastAPI NLP. |
| | Kịch bản Kiểm thử Tích hợp | [docs/week9/Integration_Test.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week9/Integration_Test.md) | **PASS** | Ghi nhận kết quả của 10 ca test tích hợp liên thông. |
| **Week 10**| Ca Kiểm thử Đơn vị | [docs/week10/Unit_Test_Cases.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week10/Unit_Test_Cases.md) | **PASS** | Đặc tả 10 ca unit test logic nghiệp vụ chính. |
| | Báo cáo Kiểm thử Đơn vị | [docs/week10/Unit_Test_Report.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week10/Unit_Test_Report.md) | **PASS** | Ghi nhận thống kê test và báo cáo vá bug. |
| | Báo cáo Tổng kết Dự án | [docs/week10/Final_Report.md](file:///d:/Workspace/TBDD/shift-management-system/docs/week10/Final_Report.md) | **PASS** | Báo cáo tổng thể cấu trúc 11 chương hoàn thiện. |

---

## 2. Các Tài liệu Bổ trợ & Báo cáo Đi kèm
*   [docs/DOCUMENT_STRUCTURE_REPORT.md](file:///d:/Workspace/TBDD/shift-management-system/docs/DOCUMENT_STRUCTURE_REPORT.md): Báo cáo tái cấu trúc chia nhỏ tài liệu theo chuẩn grading rubric.
*   [docs/final_report_section.md](file:///d:/Workspace/TBDD/shift-management-system/docs/final_report_section.md): Mục báo cáo phân tích khó khăn gặp phải và hướng khắc phục dựa trên feedback của giảng viên.
