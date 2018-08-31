/**
 * 字符串辅助类，所有辅助方法都是静态的
 * （String helper class, all helper methods is static）
 */
class StringHelper {
  /**
   * 根据参数或对象格式化字符串
   * （Format string with arguments array or map object）
   *
   * - [str] 为要格式化的字符串（[str] is the String to format）
   * - [args] 为格式化参数，可以为一个集合对象 `Map<String, Object>` 或者一个对象数组 `List<Object>`（[args] is format arguments, can be a map object `Map<String, Object>` or a object array `List<Object>`）
   *
   * 例如，格式化错消息
   * （For example, get format text by key and params）
   *
   *     const errorMessage = Lang.format('Cannot find user named {0}.', <String>['User1']);
   */
  static String format(String str, Object args) {
    var result = str;
    if (args is Map<String, Object>) {
      args.forEach((String key, Object value) {
        if (key != null) {
          result = result.replaceAll('{$key}', value.toString());
        }
      });
    } else if (args is List<Object>) {
      for (var i = 0; i < args.length; i++) {
        result = result.replaceAll('{$i}', args[i].toString());
      }
    }
    return result;
  }
}