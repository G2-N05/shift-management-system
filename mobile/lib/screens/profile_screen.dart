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
  bool _isLoading = true;
  bool _isSubmitting = false;

  final TextEditingController _conditionController = TextEditingController();
  File? _proofImage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final user = await ApiService.getMe();
    setState(() {
      _user = user;
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
      _showDialog("Success", "Health declaration submitted successfully. Pending manager approval.");
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
                            CupertinoTextField(
                              controller: _conditionController,
                              placeholder: "E.g., Bị ốm, có thai, vấn đề xương khớp...",
                              padding: const EdgeInsets.all(16),
                              minLines: 3,
                              maxLines: 5,
                              decoration: BoxDecoration(
                                color: const Color(0xFFF4F7FA),
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
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
