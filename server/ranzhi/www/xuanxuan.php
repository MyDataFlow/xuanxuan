<?php
/* Set the error reporting. */
error_reporting(E_ALL);

/* Start output buffer. */
//ob_start();

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
$input   = file_get_contents("php://input");
$input   = $common->decrypt($input);
$userID  = !empty($input->userID) ? $input->userID : '';
$module  = !empty($input->module) ? $input->module : '';
$method  = !empty($input->method) ? $input->method : '';
$params  = !empty($input->params) ? $input->params : '';

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
header("location:$link");
