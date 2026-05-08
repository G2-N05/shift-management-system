class Shift {
  final int id;
  final int userId;
  final String startTime;
  final String endTime;
  final String? clockInTime;
  final String? clockOutTime;
  final String status;
  final String? notes;

  Shift({
    required this.id,
    required this.userId,
    required this.startTime,
    required this.endTime,
    this.clockInTime,
    this.clockOutTime,
    required this.status,
    this.notes,
  });

  factory Shift.fromJson(Map<String, dynamic> json) {
    return Shift(
      id: json['ID'],
      userId: json['UserID'],
      startTime: json['StartTime'],
      endTime: json['EndTime'],
      clockInTime: json['ClockInTime'],
      clockOutTime: json['ClockOutTime'],
      status: json['Status'] ?? 'scheduled',
      notes: json['Notes'],
    );
  }
}
