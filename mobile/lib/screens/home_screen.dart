import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import '../models/shift.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Shift> _shifts = [];
  List<dynamic> _pendingSwaps = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadShifts();
  }

  Future<void> _loadShifts() async {
    setState(() => _isLoading = true);
    final shifts = await ApiService.getMyShifts();
    final swaps = await ApiService.getMyPendingSwaps();
    setState(() {
      _shifts = shifts;
      _pendingSwaps = swaps;
      _isLoading = false;
    });
  }

  void _clockIn(int shiftId) async {
    String? error = await ApiService.clockIn(shiftId);
    if (error == null) {
      _loadShifts();
    } else {
      _showErrorDialog(error);
    }
  }

  void _clockOut(int shiftId) async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.camera);
    
    if (image == null) {
      _showErrorDialog("Bạn phải chụp ảnh minh chứng (proof) để kết thúc ca làm việc.");
      return;
    }

    final bytes = await image.readAsBytes();
    String base64Image = "data:image/jpeg;base64," + base64Encode(bytes);

    bool success = await ApiService.clockOut(shiftId, proofImage: base64Image);
    if (success) {
      _loadShifts();
    } else {
      _showErrorDialog("Clock out thất bại. Vui lòng thử lại!");
    }
  }

  void _showSwapDialog(int requesterId, int shiftId) async {
    setState(() => _isLoading = true);
    final result = await ApiService.autoSwap(requesterId, shiftId);
    if (result['success'] == true) {
      _showSuccessDialog(result['message']);
      _loadShifts(); // Refresh to see shift disappear if it was successfully reassigned
    } else {
      _showErrorDialog(result['error']);
    }
    setState(() => _isLoading = false);
  }

  void _showSuccessDialog(String message) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text("Success"),
        content: Text(message),
        actions: [
          CupertinoDialogAction(
            child: const Text("OK"),
            onPressed: () => Navigator.of(context).pop(),
          )
        ],
      )
    );
  }
  void _showActionSheet(dynamic shift) {
    showCupertinoModalPopup<void>(
      context: context,
      builder: (BuildContext context) => CupertinoActionSheet(
        title: const Text('Tùy chọn ca làm việc'),
        message: const Text('Vui lòng chọn thao tác bạn muốn thực hiện'),
        actions: <CupertinoActionSheetAction>[
          CupertinoActionSheetAction(
            isDefaultAction: true,
            onPressed: () {
              Navigator.pop(context);
              _showSwapDialog(shift.userId, shift.id);
            },
            child: const Text('Đổi ca (Swap)'),
          ),
          CupertinoActionSheetAction(
            isDestructiveAction: true,
            onPressed: () {
              Navigator.pop(context);
              _requestTimeOff(shift);
            },
            child: const Text('Xin nghỉ (Time Off)'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () {
            Navigator.pop(context);
          },
          child: const Text('Hủy'),
        ),
      ),
    );
  }

  void _requestTimeOff(dynamic shift) async {
    TextEditingController reasonController = TextEditingController();
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text("Lý do xin nghỉ"),
        content: Padding(
          padding: const EdgeInsets.only(top: 10),
          child: CupertinoTextField(
            controller: reasonController,
            placeholder: "Nhập lý do...",
            style: const TextStyle(color: CupertinoColors.black),
          ),
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text("Hủy"),
            onPressed: () => Navigator.pop(context),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            child: const Text("Gửi"),
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _isLoading = true);
              DateTime start = DateTime.parse(shift.startTime).toLocal();
              DateTime end = DateTime.parse(shift.endTime).toLocal();
              double duration = end.difference(start).inMinutes / 60.0;
              
              String? error = await ApiService.requestTimeOff(start, end, duration, reasonController.text);
              if (error == null) {
                _showSuccessDialog("Đã gửi yêu cầu xin nghỉ cho Quản lý phê duyệt.");
                _loadShifts();
              } else {
                _showErrorDialog(error);
                setState(() => _isLoading = false);
              }
            }
          )
        ]
      )
    );
  }

  void _showErrorDialog(String errorMessage) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text("Error"),
        content: Text(errorMessage),
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
                CupertinoButton(
                  padding: EdgeInsets.zero,
                  onPressed: () async {
                    final prefs = await SharedPreferences.getInstance();
                    await prefs.remove('token');
                    if (mounted) {
                      Navigator.of(context, rootNavigator: true).pushReplacement(
                        PageRouteBuilder(
                          pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
                          transitionsBuilder: (context, animation, secondaryAnimation, child) {
                            return FadeTransition(opacity: animation, child: child);
                          },
                        ),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: CupertinoColors.white.withAlpha(50),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      CupertinoIcons.square_arrow_right,
                      color: CupertinoColors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Pending Swaps (Targeted at me)
          if (!_isLoading && _pendingSwaps.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Pending Swap Requests", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                  const SizedBox(height: 10),
                  ..._pendingSwaps.map((swap) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemYellow.withAlpha(40),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: CupertinoColors.systemYellow),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "Colleague (ID: ${swap['RequesterID']}) requested you to cover Shift #${swap['ShiftID']}",
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: CupertinoButton(
                                  padding: EdgeInsets.zero,
                                  color: CupertinoColors.activeGreen,
                                  child: const Text("Accept", style: TextStyle(fontWeight: FontWeight.bold)),
                                  onPressed: () async {
                                    setState(() => _isLoading = true);
                                    bool success = await ApiService.acceptSwap(swap['ID']);
                                    if (success) {
                                      _showSuccessDialog("Chấp nhận đổi ca thành công!");
                                      _loadShifts();
                                    } else {
                                      _showErrorDialog("Failed to accept swap.");
                                      setState(() => _isLoading = false);
                                    }
                                  },
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: CupertinoButton(
                                  padding: EdgeInsets.zero,
                                  color: CupertinoColors.destructiveRed,
                                  child: const Text("Decline", style: TextStyle(fontWeight: FontWeight.bold)),
                                  onPressed: () async {
                                    setState(() => _isLoading = true);
                                    bool success = await ApiService.rejectSwap(swap['ID']);
                                    if (success) {
                                      _loadShifts();
                                    } else {
                                      _showErrorDialog("Failed to decline swap.");
                                      setState(() => _isLoading = false);
                                    }
                                  },
                                ),
                              ),
                            ],
                          )
                        ],
                      ),
                    );
                  }).toList(),
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
                                          onTap: () => _showActionSheet(shift),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF4F7FA),
                                              borderRadius: BorderRadius.circular(16),
                                            ),
                                            child: const Icon(CupertinoIcons.ellipsis, color: Color(0xFF1E1E1E), size: 20),
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
