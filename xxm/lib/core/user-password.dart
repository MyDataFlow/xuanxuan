import 'dart:convert';
import 'package:crypto/crypto.dart' as crypto;

const _PASSWORD_WITH_MD5_FLAG = '%%%PWD_FLAG%%% ';

String generateMd5(String data) {
  var content = new Utf8Encoder().convert(data);
  var md5 = crypto.md5;
  var digest = md5.convert(content);
  return digest.toString();
}

class UserPassword {
  String _formatedMd5 = '';

  UserPassword(String password) {
    change(password);
  }

  change(String password) {
    if (password.isNotEmpty) {
      if (!password.startsWith(_PASSWORD_WITH_MD5_FLAG)) {
        password = '$_PASSWORD_WITH_MD5_FLAG${generateMd5(password)}';
      }
    }
    _formatedMd5 = password;
  }

  String get formatedMd5 => _formatedMd5;
  String get md5 => _formatedMd5.substring(_PASSWORD_WITH_MD5_FLAG.length);
}