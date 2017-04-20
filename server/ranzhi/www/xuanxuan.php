<?php
/* Set the error reporting. */
error_reporting(E_ALL);

/* Define the run mode as front. */
define('RUN_MODE', 'front');

/* Load the framework. */
include '../framework/router.class.php';
include '../framework/control.class.php';
include '../framework/model.class.php';
include '../framework/helper.class.php';

/* Run the app. */
$appName = 'sys';
$app     = router::createApp($appName);
$common  = $app->loadCommon();

$key  = '12345678888888888888888888888888';
$iv   = substr($key, 0, 16);
$data = file_get_contents("php://input");
$data = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);
$data = '{"module":"chat","method":"login","params":["ranzhi", "admin","e10adc3949ba59abbe56e057f20f883e","online"]}';
$data = json_decode($data);
$userID = !empty($data->userID) ? $data->userID : '';
$module = !empty($data->module) ? $data->module : '';
$method = !empty($data->method) ? $data->method : '';
$params = !empty($data->params) ? $data->params : '';

if($module == 'chat' && $method == 'login' && is_array($params))
{
    /* params[0] is the server name. */
    unset($params[0]);
}
if($userID && is_array($params)) 
{
    $params[] = $userID;
}

if(!$module or !$method) die('Invalid module or method.');

$link = helper::createLink($module, $method, $params);

header("location: $link");
