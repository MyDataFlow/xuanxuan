import './member.dart';
import './user-password.dart';

class UserProfile {
  final Uri server;
  final Member member;
  UserPassword password;
  bool rememberPassword;
  bool autoLogin;

  DateTime lastLoginTime;
  String token;
  int uploadFilesize;

  // Socket and server settings
  String _socketUrl;
  String _serverVersion;
  int _socketPort;

  UserProfile({this.server, this.member, this.password, this.rememberPassword = false, this.autoLogin = false});

  UserProfile.register({String serverAddress, String account, String password}) : this(
      server: UserProfile.parseServerAddress(serverAddress),
      member: new Member(account: account),
      password: new UserPassword(password)
  );

  String get cipherIV => token.substring(0, 16);
  String get serverUrlRoot => server.origin;
  String get account => member.account;
  MemberStatus get status => member.status;
  String get avatar => member.getAvatar(server);
  String get displayName => member.displayName;
  int get id => member.id;

  String get serverVersion => _serverVersion;
  int get socketPort => _socketPort;

  String get socketUrl {
    if (_socketUrl == null) {
      var scheme = server.scheme == 'https' ? 'wss' : 'ws';
      _socketUrl = '$scheme://${server.host}:$socketPort';
    }
    return _socketUrl;
  }

  String makeServerUrl({String path = ''}) {
    return '$serverUrlRoot$path';
  }

  String get uploadUrl => makeServerUrl(path: 'upload');
  String get identify => UserProfile.createIdentify(server, account);

  static Uri parseServerAddress(String serverAddress) {
      if (!serverAddress.startsWith('http://') && !serverAddress.startsWith('https://')) {
        serverAddress = 'https://$serverAddress';
      }
      var hasSettedPort = serverAddress.lastIndexOf(':') > 7;
      var server = Uri.parse(serverAddress);
      if (!hasSettedPort) {
        server = server.replace(port: 11443);
      }
      return server;
  }

  static String createIdentify(Uri server, String account) {
    return '$account@${server.host}__${server.port}_${server.path}';
  }
}