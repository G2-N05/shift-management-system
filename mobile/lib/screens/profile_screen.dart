import 'dart:io';
import 'package:flutter/cupertino.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _user;
  List<dynamic> _knownConditions = [];
  bool _isLoading = true;
  bool _isSubmitting = false;

  final TextEditingController _conditionController = TextEditingController();
  File? _proofImage;

  // Time off states
  List<dynamic> _myTimeOffRequests = [];
  bool _isSubmittingTimeOff = false;
  final TextEditingController _timeOffReasonController = TextEditingController();
  DateTime _timeOffStartDate = DateTime.now();
  DateTime _timeOffEndDate = DateTime.now();
  double _timeOffDurationHours = 8.0;

  // Selected preset condition
  String _selectedPresetCondition = "";

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final user = await ApiService.getMe();
    final conditions = await ApiService.getKnownConditions();
    final timeOffs = await ApiService.getMyTimeOffRequests();
    setState(() {
      _user = user;
      _knownConditions = conditions;
      _myTimeOffRequests = timeOffs;
      _isLoading = false;
    });
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    if (mounted) {
      Navigator.of(context, rootNavigator: true).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        )
      );
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _proofImage = File(pickedFile.path);
      });
    }
  }

  void _submitHealthDeclaration() async {
    if (_conditionController.text.trim().isEmpty) {
      _showDialog("Error", "Please enter your health condition.");
      return;
    }
    
    if (_user == null) return;

    setState(() => _isSubmitting = true);
    bool success = await ApiService.submitHealthDeclaration(
      _user!['ID'],
      _conditionController.text,
      _proofImage?.path ?? "",
    );
    setState(() => _isSubmitting = false);

    if (success) {
      _showDialog("Success", "Health declaration submitted successfully. Auto-approved conditions are applied immediately, otherwise pending Admin/Manager approval.");
      setState(() {
        _conditionController.clear();
        _proofImage = null;
      });
    } else {
      _showDialog("Error", "Failed to submit declaration. Please try again.");
    }
  }

  void _showDialog(String title, String content) {
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: Text(title),
        content: Text(content),
        actions: [
          CupertinoDialogAction(
            child: const Text("OK", style: TextStyle(color: Color(0xFF4A00E0))),
            onPressed: () => Navigator.of(ctx).pop(),
          )
        ],
      )
    );
  }

  void _submitTimeOffRequest() async {
    if (_timeOffReasonController.text.trim().isEmpty) {
      _showDialog("Error", "Please enter a reason.");
      return;
    }
    
    setState(() => _isSubmittingTimeOff = true);
    bool success = await ApiService.requestTimeOff(
      _timeOffStartDate, 
      _timeOffEndDate, 
      _timeOffDurationHours, 
      _timeOffReasonController.text
    );
    setState(() => _isSubmittingTimeOff = false);

    if (success) {
      _showDialog("Success", "Time off request submitted successfully.");
      setState(() {
        _timeOffReasonController.clear();
      });
      _loadProfile(); // reload to get updated list
    } else {
      _showDialog("Error", "Failed to submit time off request.");
    }
  }

  void _showConditionPicker() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => Container(
        height: 250,
        color: CupertinoColors.systemBackground.resolveFrom(context),
        child: Column(
          children: [
            Container(
              color: CupertinoColors.systemGrey6,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CupertinoButton(
                    child: const Text('Done'),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
            ),
            Expanded(
              child: CupertinoPicker(
                itemExtent: 40,
                onSelectedItemChanged: (int index) {
                  setState(() {
                    if (index == 0) {
                      _selectedPresetCondition = "";
                    } else if (index - 1 < _knownConditions.length) {
                      _selectedPresetCondition = _knownConditions[index - 1]['Condition'];
                      _conditionController.text = _selectedPresetCondition;
                    }
                  });
                },
                children: [
                  const Center(child: Text("Nhập thủ công (Khác)")),
                  ..._knownConditions.map((cond) => Center(child: Text(cond['Condition'])))
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTimeOffSheet() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.75,
            padding: const EdgeInsets.only(top: 20),
            decoration: const BoxDecoration(
              color: CupertinoColors.white,
              borderRadius: BorderRadius.only(topLeft: Radius.circular(24), topRight: Radius.circular(24)),
            ),
            child: SafeArea(
              top: false,
              child: Material(
                color: Colors.transparent,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Request Time Off", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: const Icon(CupertinoIcons.xmark_circle_fill, color: CupertinoColors.systemGrey),
                          )
                        ],
                      ),
                      const SizedBox(height: 24),
                      const Text("Reason (e.g., Sick leave, Maternity, etc.)", style: TextStyle(fontWeight: FontWeight.w600, color: CupertinoColors.systemGrey)),
                      const SizedBox(height: 8),
                      CupertinoTextField(
                        controller: _timeOffReasonController,
                        placeholder: "Nhập lý do nghỉ phép...",
                        padding: const EdgeInsets.all(16),
                        minLines: 2,
                        maxLines: 4,
                        decoration: BoxDecoration(color: const Color(0xFFF4F7FA), borderRadius: BorderRadius.circular(12)),
                      ),
                      const SizedBox(height: 16),
                      const Text("Duration", style: TextStyle(fontWeight: FontWeight.w600, color: CupertinoColors.systemGrey)),
                      const SizedBox(height: 8),
                      CupertinoSlidingSegmentedControl<double>(
                        groupValue: _timeOffDurationHours,
                        children: const {
                          4.0: Text("Half Day (4h)"),
                          8.0: Text("Full Day (8h)"),
                        },
                        onValueChanged: (val) {
                          if (val != null) {
                            setModalState(() => _timeOffDurationHours = val);
                          }
                        },
                      ),
                      const SizedBox(height: 24),
                      const Text("Start Date", style: TextStyle(fontWeight: FontWeight.w600, color: CupertinoColors.systemGrey)),
                      SizedBox(
                        height: 120,
                        child: CupertinoDatePicker(
                          mode: CupertinoDatePickerMode.date,
                          initialDateTime: _timeOffStartDate,
                          onDateTimeChanged: (val) {
                            setModalState(() {
                              _timeOffStartDate = val;
                              if (_timeOffEndDate.isBefore(_timeOffStartDate)) {
                                _timeOffEndDate = _timeOffStartDate;
                              }
                            });
                          },
                        ),
                      ),
                      const Text("End Date", style: TextStyle(fontWeight: FontWeight.w600, color: CupertinoColors.systemGrey)),
                      SizedBox(
                        height: 120,
                        child: CupertinoDatePicker(
                          mode: CupertinoDatePickerMode.date,
                          initialDateTime: _timeOffEndDate,
                          minimumDate: _timeOffStartDate,
                          onDateTimeChanged: (val) {
                            setModalState(() => _timeOffEndDate = val);
                          },
                        ),
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: CupertinoButton(
                          color: const Color(0xFF4A00E0),
                          onPressed: () {
                            Navigator.pop(context);
                            _submitTimeOffRequest();
                          },
                          child: const Text("Submit Request", style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        }
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: const Color(0xFFF4F7FA),
      child: _isLoading 
        ? const Center(child: CupertinoActivityIndicator())
        : SingleChildScrollView(
            child: Column(
              children: [
                // Curved Header
                Container(
                  width: double.infinity,
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
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: CupertinoColors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(CupertinoIcons.person_solid, size: 40, color: CupertinoColors.white),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _user?['Name'] ?? 'User',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: CupertinoColors.white),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        (_user?['Role'] ?? 'Employee').toString().toUpperCase(),
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: CupertinoColors.white.withOpacity(0.8), letterSpacing: 1.2),
                      ),
                    ],
                  ),
                ),
                
                Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Energy Score Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: CupertinoColors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: CupertinoColors.systemGrey.withOpacity(0.1), blurRadius: 15, offset: const Offset(0, 5))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(CupertinoIcons.bolt_fill, color: CupertinoColors.systemYellow),
                                const SizedBox(width: 8),
                                const Text("Energy Score", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                                const Spacer(),
                                Text(
                                  "${_user?['EnergyScore'] ?? 100}/100",
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold, 
                                    fontSize: 18,
                                    color: (_user?['EnergyScore'] ?? 100) > 40 ? CupertinoColors.activeGreen : CupertinoColors.destructiveRed,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            // Progress Bar
                            Container(
                              height: 12,
                              decoration: BoxDecoration(
                                color: CupertinoColors.systemGrey6,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: FractionallySizedBox(
                                alignment: Alignment.centerLeft,
                                widthFactor: (_user?['EnergyScore'] ?? 100) / 100.0,
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: (_user?['EnergyScore'] ?? 100) > 40 ? CupertinoColors.activeGreen : CupertinoColors.destructiveRed,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                ),
                              ),
                            ),
                            if ((_user?['EnergyScore'] ?? 100) < 50) ...[
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: CupertinoColors.destructiveRed.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                child: const Text("Low Energy Risk. Please take care of your health.", style: TextStyle(color: CupertinoColors.destructiveRed, fontSize: 12, fontWeight: FontWeight.bold)),
                              )
                            ]
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Health Declaration Form
                      const Text("Submit Health Declaration", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E1E1E))),
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: CupertinoColors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [BoxShadow(color: CupertinoColors.systemGrey.withOpacity(0.1), blurRadius: 15, offset: const Offset(0, 5))],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Condition Details", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: CupertinoColors.systemGrey)),
                            const SizedBox(height: 8),

                            // Dropdown / Picker for Pre-Scored Conditions
                            GestureDetector(
                              onTap: _showConditionPicker,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF4F7FA),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      _selectedPresetCondition.isEmpty ? "Chọn bệnh từ CSDL..." : _selectedPresetCondition,
                                      style: TextStyle(
                                        color: _selectedPresetCondition.isEmpty ? CupertinoColors.systemGrey : CupertinoColors.black,
                                      ),
                                    ),
                                    const Icon(CupertinoIcons.chevron_down, color: CupertinoColors.systemGrey, size: 18)
                                  ],
                                ),
                              ),
                            ),
                            
                            const SizedBox(height: 12),
                            
                            // Manual Input Field
                            CupertinoTextField(
                              controller: _conditionController,
                              placeholder: "Hoặc nhập chi tiết (VD: Bị ốm, có thai...)",
                              padding: const EdgeInsets.all(16),
                              minLines: 3,
                              maxLines: 5,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF4F7FA),
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            ],
                            const SizedBox(height: 16),
                            const Text("Proof / Certificate", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: CupertinoColors.systemGrey)),
                            const SizedBox(height: 8),
                            GestureDetector(
                              onTap: _pickImage,
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 20),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF4F7FA),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: CupertinoColors.systemGrey4, style: BorderStyle.solid),
                                ),
                                child: Column(
                                  children: [
                                    Icon(
                                      _proofImage != null ? CupertinoIcons.checkmark_seal_fill : CupertinoIcons.photo_on_rectangle, 
                                      color: _proofImage != null ? CupertinoColors.activeGreen : const Color(0xFF4A00E0), 
                                      size: 32
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      _proofImage != null ? "Image Selected" : "Tap to upload image",
                                      style: TextStyle(
                                        color: _proofImage != null ? CupertinoColors.activeGreen : CupertinoColors.systemGrey,
                                        fontWeight: FontWeight.bold
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              child: GestureDetector(
                                onTap: _isSubmitting ? null : _submitHealthDeclaration,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(colors: [Color(0xFF4A00E0), Color(0xFF8E2DE2)]),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Center(
                                    child: _isSubmitting 
                                      ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                                      : const Text("Submit Declaration", style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      
                      // Time Off Section
                      const SizedBox(height: 32),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Time Off Requests", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E1E1E))),
                          GestureDetector(
                            onTap: _showTimeOffSheet,
                            child: const Text("+ Request", style: TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.bold)),
                          )
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (_myTimeOffRequests.isEmpty)
                        Container(
                          padding: const EdgeInsets.all(20),
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: CupertinoColors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [BoxShadow(color: CupertinoColors.systemGrey.withOpacity(0.1), blurRadius: 15, offset: const Offset(0, 5))],
                          ),
                          child: const Center(child: Text("No time off requests.", style: TextStyle(color: CupertinoColors.systemGrey))),
                        )
                      else
                        ..._myTimeOffRequests.map((req) {
                          Color statusColor;
                          String statusText = req['Status'] ?? 'pending';
                          if (statusText == 'approved') statusColor = CupertinoColors.activeGreen;
                          else if (statusText == 'denied') statusColor = CupertinoColors.destructiveRed;
                          else statusColor = CupertinoColors.systemOrange;

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: CupertinoColors.white,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [BoxShadow(color: CupertinoColors.systemGrey.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 3))],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      "${DateTime.parse(req['StartDate']).toLocal().toString().split(' ')[0]} to ${DateTime.parse(req['EndDate']).toLocal().toString().split(' ')[0]}",
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: statusColor.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        statusText.toUpperCase(),
                                        style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text("Reason: ${req['Reason']}", style: const TextStyle(fontSize: 14, color: CupertinoColors.systemGrey)),
                                const SizedBox(height: 4),
                                Text("Duration: ${req['DurationHours']} hours", style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                              ],
                            ),
                          );
                        }).toList(),

                      const SizedBox(height: 40),
                      
                      // Logout Button
                      SizedBox(
                        width: double.infinity,
                        child: CupertinoButton(
                          color: CupertinoColors.systemGrey5,
                          onPressed: _logout,
                          child: const Text("Log Out", style: TextStyle(color: CupertinoColors.destructiveRed, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            ),
          ),
    );
  }
}
