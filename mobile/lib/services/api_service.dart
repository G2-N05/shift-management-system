import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/shift.dart';

class ApiService {
  // Configured for local testing on Mac/Emulator
  // static const String baseUrl = 'http://localhost:8080/api';
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'Username': username, 'Password': password}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        return true;
      }
    } catch (e) {
      print("Login error: $e");
    }
    return false;
  }

  static Future<List<Shift>> getMyShifts() async {
    final token = await getToken();
    if (token == null) return [];

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/shifts'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        Iterable l = jsonDecode(response.body);
        return List<Shift>.from(l.map((model) => Shift.fromJson(model)));
      }
    } catch (e) {
      print("Get shifts error: $e");
    }
    return [];
  }

  static Future<String?> clockIn(int shiftId) async {
    final token = await getToken();
    if (token == null) return "User not logged in";
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/shifts/$shiftId/clock-in'),
        headers: {'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        return null; // success
      }
      final data = jsonDecode(response.body);
      return data['error'] ?? "Unknown error";
    } catch (e) {
      return "Network error: $e";
    }
  }

  static Future<bool> clockOut(int shiftId, {String? proofImage}) async {
    final token = await getToken();
    if (token == null) return false;
    
    Map<String, dynamic> body = {};
    if (proofImage != null) {
      body['proofImage'] = proofImage;
    }

    final response = await http.post(
      Uri.parse('$baseUrl/shifts/$shiftId/clock-out'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(body),
    );
    return response.statusCode == 200;
  }

  static Future<bool> requestSwap(
    int requesterId,
    int targetUserId,
    int shiftId,
  ) async {
    final token = await getToken();
    if (token == null) return false;
    final response = await http.post(
      Uri.parse('$baseUrl/swaps'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'RequesterID': requesterId,
        'TargetUserID': targetUserId,
        'ShiftID': shiftId,
      }),
    );
    return response.statusCode == 201;
  }

  static Future<Map<String, dynamic>> autoSwap(int requesterId, int shiftId) async {
    final token = await getToken();
    if (token == null) return {'error': "Lỗi xác thực (Vui lòng đăng nhập lại)"};
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/swaps/auto'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'RequesterID': requesterId, 'ShiftID': shiftId}),
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {'success': true, 'message': data['message'] ?? "Thành công"};
      }
      return {'error': data['error'] ?? "Lỗi không xác định"};
    } catch (e) {
      return {'error': "Lỗi kết nối máy chủ"};
    }
  }

  static Future<List<dynamic>> getMyPendingSwaps() async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/swaps/me/pending'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
    } catch (e) {
      print("getMyPendingSwaps error: $e");
    }
    return [];
  }

  static Future<List<dynamic>> getNotifications() async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
    } catch (e) {
      print("getNotifications error: $e");
    }
    return [];
  }

  static Future<bool> markNotificationRead(int id) async {
    final token = await getToken();
    if (token == null) return false;
    final response = await http.put(
      Uri.parse('$baseUrl/notifications/$id/read'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
    return response.statusCode == 200;
  }

  static Future<bool> acceptSwap(int swapId) async {
    final token = await getToken();
    if (token == null) return false;
    final response = await http.post(
      Uri.parse('$baseUrl/swaps/$swapId/approve'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
    return response.statusCode == 200;
  }

  static Future<bool> rejectSwap(int swapId) async {
    final token = await getToken();
    if (token == null) return false;
    final response = await http.post(
      Uri.parse('$baseUrl/swaps/$swapId/reject'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
    return response.statusCode == 200;
  }

  static Future<Map<String, dynamic>?> getMe() async {
    final token = await getToken();
    if (token == null) return null;
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/users/me'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print("getMe error: $e");
    }
    return null;
  }

  static Future<List<dynamic>> getKnownConditions() async {
    final token = await getToken();
    if (token == null) return [];
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/health/conditions'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
    } catch (e) {
      print("getKnownConditions error: $e");
    }
    return [];
  }

  static Future<bool> submitHealthDeclaration(int userId, String condition, String proofFilePath) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/health'));
      request.headers['Authorization'] = 'Bearer $token';
      
      request.fields['UserID'] = userId.toString();
      request.fields['Condition'] = condition;
      
      if (proofFilePath.isNotEmpty) {
        request.files.add(await http.MultipartFile.fromPath('ProofFile', proofFilePath));
      }
      
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      
      return response.statusCode == 201 || response.statusCode == 200;
    } catch (e) {
      print("submitHealth error: $e");
      return false;
    }
  }

  static Future<String?> requestTimeOff(DateTime start, DateTime end, double durationHours, String reason) async {
    final token = await getToken();
    if (token == null) return "User is not logged in";
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/time-off'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json'
        },
        body: jsonEncode({
          'StartDate': start.toUtc().toIso8601String(),
          'EndDate': end.toUtc().toIso8601String(),
          'DurationHours': durationHours,
          'Reason': reason
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return null; // Success
      } else {
        return "Server Error (${response.statusCode}): ${response.body}";
      }
    } catch (e) {
      print("requestTimeOff error: $e");
      return "Network error: $e";
    }
  }

  static Future<List<dynamic>> getMyTimeOffRequests() async {
    final token = await getToken();
    if (token == null) return [];
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/time-off/my'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List<dynamic>;
      }
    } catch (e) {
      print("getMyTimeOffRequests error: $e");
    }
    return [];
  }
}
