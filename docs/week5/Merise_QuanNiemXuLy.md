# TUẦN 5 - MÔ HÌNH TỰA MERISE (QUAN NIỆM XỬ LÝ)

## 1. Mục tiêu

Xây dựng mô hình quan niệm xử lý (Conceptual Process Model) cho hệ thống Shift Management System dựa trên phương pháp Tựa MERISE.

Mục tiêu của mô hình là xác định:

* Các biến cố xảy ra trong hệ thống
* Các quy tắc quản lý (QTQL)
* Điều kiện kích hoạt xử lý
* Dữ liệu vào và dữ liệu ra của từng quy trình nghiệp vụ



## 2. Các hệ thống con của Shift Management System

Dựa trên chức năng của hệ thống, có thể chia thành các hệ thống con như sau:

| Hệ thống con       | Chức năng                       |
| ------------------ | ------------------------------- |
| Quản lý người dùng | Quản lý tài khoản và phân quyền |
| Quản lý ca làm     | Tạo và phân công ca làm         |
| Quản lý công việc  | Giao và theo dõi công việc      |
| Quản lý đổi ca     | Xử lý yêu cầu đổi ca            |
| Quản lý nghỉ phép  | Xử lý yêu cầu nghỉ phép         |
| Quản lý KPI        | Đánh giá hiệu suất làm việc     |
| Quản lý lương      | Tính toán và quản lý lương      |
| Quản lý thông báo  | Gửi thông báo tới người dùng    |



## 3. Thông lượng thông tin giữa các hệ thống con

### Quản lý ↔ Hệ thống

Thông tin gửi vào:

* Thông tin nhân viên
* Thông tin ca làm
* Thông tin KPI
* Thông tin lương

Thông tin nhận lại:

* Báo cáo
* Lịch làm việc
* Thống kê

### Nhân viên ↔ Hệ thống

Thông tin gửi vào:

* Yêu cầu đổi ca
* Yêu cầu nghỉ phép
* Cập nhật trạng thái công việc

Thông tin nhận lại:

* Lịch làm việc
* Kết quả xét duyệt
* Thông báo



## 4. Biến cố vào

Biến cố vào là những sự kiện làm phát sinh xử lý trong hệ thống.

| Mã   | Biến cố                                 |
| ---- | --------------------------------------- |
| EV1  | Nhân viên đăng nhập                     |
| EV2  | Quản lý tạo ca làm                      |
| EV3  | Nhân viên xem lịch làm                  |
| EV4  | Nhân viên gửi yêu cầu đổi ca            |
| EV5  | Quản lý duyệt đổi ca                    |
| EV6  | Nhân viên gửi yêu cầu nghỉ phép         |
| EV7  | Quản lý duyệt nghỉ phép                 |
| EV8  | Quản lý giao công việc                  |
| EV9  | Nhân viên cập nhật trạng thái công việc |
| EV10 | Hệ thống tự động tạo lịch làm           |



## 5. Biến cố ra

Biến cố ra là kết quả được tạo ra sau khi quy tắc quản lý được thực hiện.

| Mã   | Biến cố                      |
| ---- | ---------------------------- |
| EO1  | Đăng nhập thành công         |
| EO2  | Ca làm được tạo              |
| EO3  | Lịch làm được cập nhật       |
| EO4  | Yêu cầu đổi ca được duyệt    |
| EO5  | Yêu cầu đổi ca bị từ chối    |
| EO6  | Yêu cầu nghỉ phép được duyệt |
| EO7  | Yêu cầu nghỉ phép bị từ chối |
| EO8  | Công việc được giao          |
| EO9  | Thông báo được gửi           |
| EO10 | Báo cáo KPI được tạo         |



## 6. Quy tắc quản lý (QTQL)

### QTQL1 - Xác thực người dùng

Dữ liệu vào:

* Email
* Mật khẩu

Xử lý:

* Kiểm tra tài khoản trong cơ sở dữ liệu
* Kiểm tra quyền truy cập

Dữ liệu ra:

* Kết quả đăng nhập



### QTQL2 - Tạo ca làm

Dữ liệu vào:

* Thông tin ca làm
* Danh sách nhân viên

Xử lý:

* Kiểm tra thời gian ca
* Kiểm tra nhân viên được phân công

Dữ liệu ra:

* Ca làm mới



### QTQL3 - Xử lý đổi ca

Dữ liệu vào:

* Yêu cầu đổi ca

Xử lý:

* Kiểm tra tính hợp lệ
* Kiểm tra trạng thái ca làm
* Cập nhật thông tin ca

Dữ liệu ra:

* Kết quả đổi ca



### QTQL4 - Xử lý nghỉ phép

Dữ liệu vào:

* Đơn nghỉ phép

Xử lý:

* Kiểm tra số ngày nghỉ
* Kiểm tra lịch làm việc

Dữ liệu ra:

* Kết quả xét duyệt



### QTQL5 - Giao công việc

Dữ liệu vào:

* Thông tin công việc
* Danh sách nhân viên

Xử lý:

* Gán công việc cho nhân viên

Dữ liệu ra:

* Công việc đã được phân công



### QTQL6 - Tính KPI

Dữ liệu vào:

* Kết quả công việc
* Số ca làm hoàn thành

Xử lý:

* Tính điểm KPI

Dữ liệu ra:

* Báo cáo KPI



## 7. Điều kiện phát động

| Quy tắc quản lý | Điều kiện phát động              |
| --------------- | -------------------------------- |
| QTQL1           | Người dùng gửi yêu cầu đăng nhập |
| QTQL2           | Quản lý tạo ca mới               |
| QTQL3           | Có yêu cầu đổi ca hợp lệ         |
| QTQL4           | Có yêu cầu nghỉ phép             |
| QTQL5           | Quản lý giao công việc           |
| QTQL6           | Đến kỳ đánh giá KPI              |



## 8. Mô hình quan niệm xử lý

### Quy trình đổi ca

Biến cố vào:

```text
Nhân viên gửi yêu cầu đổi ca
```

↓

```text
QTQL3: Kiểm tra yêu cầu đổi ca
```

↓

Điều kiện:

```text
Ca làm hợp lệ
```

↓

Biến cố ra:

```text
Yêu cầu đổi ca được duyệt
```

hoặc

```text
Yêu cầu đổi ca bị từ chối
```



### Quy trình nghỉ phép

Biến cố vào:

```text
Nhân viên gửi yêu cầu nghỉ phép
```

↓

```text
QTQL4: Xử lý nghỉ phép
```

↓

Điều kiện:

```text
Đủ điều kiện nghỉ phép
```

↓

Biến cố ra:

```text
Yêu cầu nghỉ phép được duyệt
```

hoặc

```text
Yêu cầu nghỉ phép bị từ chối
```



## 9. Nhận xét

* Các quy trình đổi ca và nghỉ phép là hai quy trình nghiệp vụ quan trọng nhất của hệ thống.
* Mọi quy trình đều được kích hoạt bởi các biến cố cụ thể.
* Quy tắc quản lý quyết định cách dữ liệu được xử lý.
* Kết quả xử lý được biểu diễn thông qua các biến cố ra.
* Mô hình quan niệm xử lý là cơ sở để xây dựng mô hình tổ chức xử lý ở tuần 6.
