import 'zh-cn.dart';
import '../utils/string-helper.dart';

/**
 * 语言文本辅助类
 * （Language text process helper）
 */
class Lang {
  /// 默认简体中文语言数据
  /// （Default 'Simplify-Chinese' language data）
  static final Map<String, String> lang = LANG_ZH_CN;

  /// 默认语言名称
  /// （Default language name）
  static final String name = 'zh-cn';

  /**
   * 获取指定名称的语言配置
   * （Get language text by key）
   *
   * - [key] 为要获取的语言项配置名称（[Key] is language setting name）
   * - [defaultValue] 为默认语言项，当找不到指定的语言项时使用此值作为返回值（Return [defaultValue] when cannot find language setting for given key）
   *
   * 例如，根据指定名称的语言配置项（For example, get language setting by key）
   *
   *     const appTitle = Lang.get('app.title');
   */
  static String string(String key, [String defaultValue]) {
    var result = lang[key];
    return result == null ? defaultValue : result;
  }

  /**
   * 获取指定名称的语言项配置并使用参数格式化为最终文本
   * （Get language text by key and return format text with arguments）
   *
   * - [key] 为要获取的语言项配置名称（[Key] is language setting name）
   * - [args] 为格式化参数，可以为一个集合对象 `Map<String, Object>` 或者一个对象数组 `List<Object>`（[args] is format arguments, can be a map object `Map<String, Object>` or a object array `List<Object>`）
   *
   * 例如，格式化错消息
   * （For example, get format text by key and params）
   *
   *     const errorMessage = Lang.format('error.userNotFind', <String>['User1']);
   */
  static String format(String key, Object args) {
    return StringHelper.format(string(key), args);
  }
}