enum MemberStatus {
    unverified, // 未登录
    disconnect, // 登录过，但掉线了
    logined, // 登录成功
    online, // 在线
    busy, // 忙碌
    away, // 离开
}

MemberStatus getMemberStatusFromName(String name) {
  return MemberStatus.values.firstWhere((status) => status.toString() == name);
}

class Member {
    String _account;
    int id;

    String realname;
    String avatar;
    MemberStatus status;
    String gender;
    String dept;
    String admin;
    String phone;
    String mobile;
    String site;
    String email;
    String role;
    int deleted;

    Member({
      String account,
      this.id,
      this.realname,
      this.avatar,
      this.gender,
      this.dept,
      this.admin,
      this.phone,
      this.mobile,
      this.site,
      this.email,
      this.role,
      this.status = MemberStatus.unverified,
      this.deleted = 0
    }) : _account = account;

    String get account => _account;
    String get displayName => realname.isEmpty ? '[$_account]' : realname;
    String get statusName => status.toString();
    bool get isOnline => status.index > MemberStatus.logined.index;
    bool get isOffline => !isOnline;
    bool get isBusy => status == MemberStatus.busy;
    bool get isAdmin => admin != 'no';
    bool get isSuperAdmin => admin == 'super';
    bool get isDeleted => deleted > 0;

    bool isStatus({MemberStatus status, String statusName}) {
      if (status != null) {
        return status == this.status;
      }

      if (statusName.isNotEmpty) {
        return getMemberStatusFromName(statusName) == this.status;
      }

      return false;
    }

    String getAvatar(Uri serverUrl) {
      if (avatar.isNotEmpty) {
        if (avatar.startsWith('$')) {
          return avatar.substring(1);
        }
        if (serverUrl != null && !avatar.startsWith('https://') && !avatar.startsWith('http://')) {
          return '${serverUrl.origin}/$avatar';
        }
      }
      return avatar;
    }

    Member.fromJson(Map data) {
      this._account = data['account'];
    }
}
