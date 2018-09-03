import 'package:flutter/material.dart';
import '../../lang/lang.dart';
import './home.dart';

/**
 * 应用主界面
 * (Application main interface)
 */
class App extends StatelessWidget {
  final ThemeData theme = new ThemeData(
        // This is the theme of your application.
        //
        // Try running your application with "flutter run". You'll see the
        // application has a blue toolbar. Then, without quitting the app, try
        // changing the primarySwatch below to Colors.green and then invoke
        // "hot reload" (press "r" in the console where you ran "flutter run",
        // or press Run > Flutter Hot Reload in IntelliJ). Notice that the
        // counter didn't reset back to zero; the application is not restarted.
        primarySwatch: Colors.deepPurple,
      );

  @override
  Widget build(BuildContext context) {
    return new MaterialApp(
      debugShowMaterialGrid: true,
      title: Lang.string('app.title'),
      theme: theme,
      home: new HomePage(),
    );
  }
}
