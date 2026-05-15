import 'package:flutter/cupertino.dart';
import '../models/shift.dart';
import '../services/api_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Shift> _shifts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadShifts();
  }

  Future<void> _loadShifts() async {
    setState(() => _isLoading = true);
    final shifts = await ApiService.getMyShifts();
    setState(() {
      _shifts = shifts;
      _isLoading = false;
    });
  }

  void _clockIn(int shiftId) async {
    bool success = await ApiService.clockIn(shiftId);
    if (success) _loadShifts();
  }

  void _clockOut(int shiftId) async {
    bool success = await ApiService.clockOut(shiftId);
    if (success) _loadShifts();
  }

  void _showSwapDialog(int requesterId, int shiftId) async {
    setState(() => _isLoading = true);
    bool success = await ApiService.autoSwap(requesterId, shiftId);
    if (success) {
      _showSuccessDialog();
      _loadShifts(); // Refresh to see shift disappear if it was successfully reassigned
    } else {
      _showErrorDialog();
    }
    setState(() => _isLoading = false);
  }

  void _showSuccessDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text("Success"),
        content: const Text("Hệ thống đã tự động tìm được người thay thế và chuyển ca thành công!"),
        actions: [
          CupertinoDialogAction(
            child: const Text("OK"),
            onPressed: () => Navigator.of(context).pop(),
          )
        ],
      )
    );
  }

  void _showErrorDialog() {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text("Error"),
        content: const Text("Failed to submit swap request. Please try again."),
        actions: [
          CupertinoDialogAction(
            child: const Text("OK"),
            onPressed: () => Navigator.of(context).pop(),
          )
        ],
      )
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: const Color(0xFFF4F7FA), // Light premium grey/blue background
      child: Column(
        children: [
          // Custom Curved Header
          Container(
            padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF4A00E0), Color(0xFF8E2DE2)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(40),
                bottomRight: Radius.circular(40),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "Hello, Team Member",
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.white,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Here is your schedule",
                      style: TextStyle(
                        fontSize: 16,
                        color: CupertinoColors.white.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Shifts List
          Expanded(
            child: _isLoading
                ? const Center(child: CupertinoActivityIndicator())
                : _shifts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(CupertinoIcons.calendar_badge_minus, size: 80, color: CupertinoColors.systemGrey3),
                            const SizedBox(height: 16),
                            Text("No shifts assigned", style: TextStyle(fontSize: 18, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.only(top: 24, bottom: 40),
                        itemCount: _shifts.length,
                        itemBuilder: (context, index) {
                          final shift = _shifts[index];
                          final st = DateTime.parse(shift.startTime).toLocal();
                          final et = DateTime.parse(shift.endTime).toLocal();
                          final timeStr = "${st.hour}:${st.minute.toString().padLeft(2, '0')} - ${et.hour}:${et.minute.toString().padLeft(2, '0')}";
                          final dateStr = "${st.day}/${st.month}/${st.year}";

                          // Determine Status Color
                          Color statusBgColor;
                          Color statusTextColor;
                          if (shift.status == 'scheduled' || shift.status == 'assigned') {
                            statusBgColor = const Color(0xFFE3F2FD); // Light Blue
                            statusTextColor = const Color(0xFF1976D2); // Dark Blue
                          } else if (shift.status == 'in_progress') {
                            statusBgColor = const Color(0xFFE8F5E9); // Light Green
                            statusTextColor = const Color(0xFF2E7D32); // Dark Green
                          } else {
                            statusBgColor = const Color(0xFFF5F5F5); // Light Grey
                            statusTextColor = const Color(0xFF757575); // Dark Grey
                          }

                          return Container(
                            margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                            decoration: BoxDecoration(
                              color: CupertinoColors.white,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: CupertinoColors.systemGrey.withOpacity(0.15),
                                  blurRadius: 20,
                                  offset: const Offset(0, 8),
                                )
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          shift.notes ?? "Shift #${shift.id}", 
                                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20, color: Color(0xFF1E1E1E)),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: statusBgColor,
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          shift.status.toUpperCase(),
                                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: statusTextColor),
                                        ),
                                      )
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  
                                  // Time and Date Row
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(color: const Color(0xFFF4F7FA), borderRadius: BorderRadius.circular(10)),
                                        child: const Icon(CupertinoIcons.time, size: 20, color: Color(0xFF4A00E0)),
                                      ),
                                      const SizedBox(width: 12),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(timeStr, style: const TextStyle(color: Color(0xFF1E1E1E), fontSize: 16, fontWeight: FontWeight.bold)),
                                          Text(dateStr, style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 13)),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 24),
                                  
                                  // Action Buttons
                                  if (shift.status == 'scheduled' || shift.status == 'assigned')
                                    Row(
                                      children: [
                                        Expanded(
                                          child: GestureDetector(
                                            onTap: () => _clockIn(shift.id),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(vertical: 16),
                                              decoration: BoxDecoration(
                                                gradient: const LinearGradient(colors: [Color(0xFF4A00E0), Color(0xFF8E2DE2)]),
                                                borderRadius: BorderRadius.circular(16),
                                                boxShadow: [
                                                  BoxShadow(color: const Color(0xFF4A00E0).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
                                                ]
                                              ),
                                              child: const Center(
                                                child: Text("Clock In", style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        GestureDetector(
                                          onTap: () => _showSwapDialog(shift.userId, shift.id),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF4F7FA),
                                              borderRadius: BorderRadius.circular(16),
                                            ),
                                            child: const Icon(CupertinoIcons.arrow_right_arrow_left, color: Color(0xFF1E1E1E), size: 20),
                                          ),
                                        )
                                      ],
                                    )
                                  else if (shift.status == 'in_progress')
                                    SizedBox(
                                      width: double.infinity,
                                      child: GestureDetector(
                                        onTap: () => _clockOut(shift.id),
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(vertical: 16),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFFF3B30),
                                            borderRadius: BorderRadius.circular(16),
                                            boxShadow: [
                                              BoxShadow(color: const Color(0xFFFF3B30).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))
                                            ]
                                          ),
                                          child: const Center(
                                            child: Text("Clock Out", style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                          ),
                                        ),
                                      ),
                                    )
                                  else
                                    SizedBox(
                                      width: double.infinity,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF4F7FA),
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: const Center(
                                          child: Text("Shift Completed", style: TextStyle(color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold, fontSize: 16)),
                                        ),
                                      ),
                                    )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
