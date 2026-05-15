import 'dart:ui';
import 'package:flutter/cupertino.dart';
import '../services/api_service.dart';
import 'main_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.1), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _login() async {
    setState(() => _isLoading = true);
    bool success = await ApiService.login(_usernameController.text, _passwordController.text);
    setState(() => _isLoading = false);
    
    if (success && mounted) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const MainScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
        )
      );
    } else {
      showCupertinoDialog(
        context: context,
        builder: (ctx) => CupertinoAlertDialog(
          title: const Text("Error"),
          content: const Text("Invalid credentials"),
          actions: [
            CupertinoDialogAction(
              child: const Text("OK", style: TextStyle(color: CupertinoColors.activeBlue)),
              onPressed: () => Navigator.of(ctx).pop(),
            )
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      // Remove navigation bar for a full immersive look
      child: Stack(
        children: [
          // Vibrant Gradient Background
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Color(0xFF4A00E0), // Deep Purple
                  Color(0xFF8E2DE2), // Indigo/Purple
                  Color(0xFF00C9FF), // Light Blue
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                stops: [0.0, 0.5, 1.0],
              ),
            ),
          ),
          
          // Decorative Blurred Circles (Background Elements)
          Positioned(
            top: -50,
            right: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF00C9FF).withOpacity(0.3),
              ),
            ),
          ),
          Positioned(
            bottom: 100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF8E2DE2).withOpacity(0.4),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Logo/Icon
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: CupertinoColors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: CupertinoColors.black.withOpacity(0.1),
                                blurRadius: 20,
                                spreadRadius: 5,
                              )
                            ],
                          ),
                          child: const Icon(CupertinoIcons.clock_solid, size: 64, color: CupertinoColors.white),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          "ShiftMaster",
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: CupertinoColors.white,
                            letterSpacing: 1.2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          "Welcome back, please sign in.",
                          style: TextStyle(
                            fontSize: 16,
                            color: CupertinoColors.white.withOpacity(0.8),
                          ),
                        ),
                        const SizedBox(height: 48),

                        // Glassmorphism Login Card
                        ClipRRect(
                          borderRadius: BorderRadius.circular(24),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                            child: Container(
                              padding: const EdgeInsets.all(32),
                              decoration: BoxDecoration(
                                color: CupertinoColors.white.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: CupertinoColors.white.withOpacity(0.3), width: 1.5),
                                boxShadow: [
                                  BoxShadow(
                                    color: CupertinoColors.black.withOpacity(0.1),
                                    blurRadius: 30,
                                    spreadRadius: -5,
                                  )
                                ],
                              ),
                              child: Column(
                                children: [
                                  CupertinoTextField(
                                    controller: _usernameController,
                                    placeholder: 'Username',
                                    placeholderStyle: TextStyle(color: CupertinoColors.white.withOpacity(0.6)),
                                    style: const TextStyle(color: CupertinoColors.white),
                                    prefix: Padding(
                                      padding: const EdgeInsets.only(left: 16, right: 8),
                                      child: Icon(CupertinoIcons.person_solid, color: CupertinoColors.white.withOpacity(0.8)),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 18),
                                    decoration: BoxDecoration(
                                      color: CupertinoColors.black.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  CupertinoTextField(
                                    controller: _passwordController,
                                    placeholder: 'Password',
                                    placeholderStyle: TextStyle(color: CupertinoColors.white.withOpacity(0.6)),
                                    style: const TextStyle(color: CupertinoColors.white),
                                    obscureText: true,
                                    prefix: Padding(
                                      padding: const EdgeInsets.only(left: 16, right: 8),
                                      child: Icon(CupertinoIcons.padlock_solid, color: CupertinoColors.white.withOpacity(0.8)),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 18),
                                    decoration: BoxDecoration(
                                      color: CupertinoColors.black.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  const SizedBox(height: 32),
                                  
                                  // Login Button
                                  SizedBox(
                                    width: double.infinity,
                                    child: GestureDetector(
                                      onTap: _isLoading ? null : _login,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        decoration: BoxDecoration(
                                          color: CupertinoColors.white,
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(
                                              color: CupertinoColors.white.withOpacity(0.3),
                                              blurRadius: 15,
                                              offset: const Offset(0, 5),
                                            )
                                          ]
                                        ),
                                        child: Center(
                                          child: _isLoading 
                                              ? const CupertinoActivityIndicator() 
                                              : const Text(
                                                  "Sign In", 
                                                  style: TextStyle(
                                                    color: Color(0xFF4A00E0),
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 18,
                                                  ),
                                                ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
