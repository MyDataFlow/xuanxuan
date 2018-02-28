#!/usr/bin/env php
<?php
/**
 * This file is used to check the language items and actions.
 */
/* Define an emtpty control class as the base class of every module. */
class control {}
$lang = new stdclass();

/* set module root path and included the resource of group module. */
$appRoot = '../app/';

/* set module root path and included the resource of group module. */
include '../app/sys/group/lang/resource.php';
foreach(glob('../app/sys/group/ext/lang/zh-cn/*.php') as $resourceFile)
{
    include $resourceFile;
}

$whiteList[] = 'api-getsessionid';
$whiteList[] = 'sso-auth';
$whiteList[] = 'sso-check';
$whiteList[] = 'misc-ping';
$whiteList[] = 'user-login';
$whiteList[] = 'user-logout';
$whiteList[] = 'user-deny';
$whiteList[] = 'user-control';
$whiteList[] = 'user-profile';
$whiteList[] = 'user-thread';
$whiteList[] = 'user-reply';
$whiteList[] = 'user-message';
$whiteList[] = 'user-setreferer';
$whiteList[] = 'user-changepassword';
$whiteList[] = 'user-vcard';
$whiteList[] = 'user-uploadavatar';
$whiteList[] = 'user-cropavatar';
$whiteList[] = 'user-edit';
$whiteList[] = 'user-create';
$whiteList[] = 'user-delete';
$whiteList[] = 'user-forbid';
$whiteList[] = 'user-active';
$whiteList[] = 'user-admin';
$whiteList[] = 'misc-qrcode';
$whiteList[] = 'misc-about';
$whiteList[] = 'contract-getorder';
$whiteList[] = 'contract-getoptionmenu';
$whiteList[] = 'customer-getoptionmenu';
$whiteList[] = 'contact-getoptionmenu';
$whiteList[] = 'contact-block';
$whiteList[] = 'leads-index';
$whiteList[] = 'leads-sendmail';
$whiteList[] = 'order-sendmail';
$whiteList[] = 'thread-locate';
$whiteList[] = 'project-ajaxgetdropmenu';
$whiteList[] = 'project-ajaxgetmatcheditems';
$whiteList[] = 'tree-redirect';
$whiteList[] = 'task-sendmail';
$whiteList[] = 'task-sendmail';
$whiteList[] = 'depositor-index';
$whiteList[] = 'provider-index';  
$whiteList[] = 'trade-index';     
$whiteList[] = 'contact-index';
$whiteList[] = 'contract-index';
$whiteList[] = 'customer-index';  
$whiteList[] = 'customer-sendmail';  
$whiteList[] = 'order-index';     
$whiteList[] = 'product-index';
$whiteList[] = 'announce-index';
$whiteList[] = 'announce-viewreaders';
$whiteList[] = 'doc-index'; 
$whiteList[] = 'schema-index';
$whiteList[] = 'task-index';     
$whiteList[] = 'attend-personal';     
$whiteList[] = 'attend-edit';     
$whiteList[] = 'attend-signin';     
$whiteList[] = 'attend-signout';     
$whiteList[] = 'attend-browse';     
$whiteList[] = 'attend-sendmail';     
$whiteList[] = 'holiday-index';     
$whiteList[] = 'holiday-browse';     
$whiteList[] = 'leave-index';     
$whiteList[] = 'leave-create';     
$whiteList[] = 'leave-edit';     
$whiteList[] = 'leave-delete';     
$whiteList[] = 'leave-personal';     
$whiteList[] = 'leave-switchstatus';     
$whiteList[] = 'leave-sendmail';     
$whiteList[] = 'leave-browse';     
$whiteList[] = 'overtime-index';     
$whiteList[] = 'overtime-create';     
$whiteList[] = 'overtime-edit';     
$whiteList[] = 'overtime-delete';     
$whiteList[] = 'overtime-view';     
$whiteList[] = 'overtime-personal';     
$whiteList[] = 'overtime-switchstatus';     
$whiteList[] = 'overtime-sendmail';     
$whiteList[] = 'overtime-browse';     
$whiteList[] = 'refund-index';     
$whiteList[] = 'refund-create';     
$whiteList[] = 'refund-edit';     
$whiteList[] = 'refund-delete';     
$whiteList[] = 'refund-view';     
$whiteList[] = 'refund-personal';     
$whiteList[] = 'refund-switchstatus';     
$whiteList[] = 'refund-createtrade';     
$whiteList[] = 'refund-sendmail';     
$whiteList[] = 'refund-browse';     
$whiteList[] = 'trip-index';     
$whiteList[] = 'trip-create';     
$whiteList[] = 'trip-edit';     
$whiteList[] = 'trip-delete';     
$whiteList[] = 'trip-personal';     
$whiteList[] = 'trip-browse';     
$whiteList[] = 'task-sendmail';
$whiteList[] = 'task-browse';
$whiteList[] = 'task-kanban';
$whiteList[] = 'task-outline';
$whiteList[] = 'task-create';
$whiteList[] = 'task-batchcreate';
$whiteList[] = 'task-edit';
$whiteList[] = 'task-view';
$whiteList[] = 'task-finish';
$whiteList[] = 'task-start';
$whiteList[] = 'task-assignto';
$whiteList[] = 'task-activate';
$whiteList[] = 'task-cancel';
$whiteList[] = 'task-close';
$whiteList[] = 'task-batchclose';
$whiteList[] = 'task-export';
$whiteList[] = 'task-delete';
$whiteList[] = 'task-recordestimate';
$whiteList[] = 'my-todo';
$whiteList[] = 'my-task';
$whiteList[] = 'my-project';
$whiteList[] = 'my-dynamic';
$whiteList[] = 'my-order';
$whiteList[] = 'my-contract';
$whiteList[] = 'my-review';

/* checking actions of every module. */
echo '-------------action checking-----------------' . "\n";
foreach(glob($appRoot . '*') as $appPath)
{
    $appName = basename($appPath);
    foreach(glob($appPath . '/*') as $modulePath)
    {
        $moduleName = basename($modulePath);
        if(strpos('install|upgrade|index|block|dashboard|error', $moduleName) !== false) continue;
        $controlFile = $modulePath . '/control.php';
        if(file_exists($controlFile))
        {
            include $controlFile;
            if(class_exists($moduleName))
            {
                $class   = new ReflectionClass($moduleName);
                $methods = $class->getMethods();
                foreach($methods as $method)
                {
                    $methodRef = new ReflectionMethod($method->class, $method->name);
                    if($methodRef->isPublic() and strpos($method->name, '__') === false)
                    {
                        $methodName = $method->name;
                        if(in_array($moduleName . '-' . strtolower($method->name), $whiteList)) continue;
                        if(strpos($methodName, 'ajax') !== false) continue;

                        $exits = false;
                        if(empty($lang->resource->$moduleName)) continue;
                        foreach($lang->resource->$moduleName as $key => $label)
                        {
                            if(strtolower($methodName) == strtolower($key)) $exits = true;
                        }
                        if(!$exits) echo $moduleName . "\t" . $methodName . " not in the list. \n";
                    }
                }
            }
        }

        /* Checking extension files. */
        $extControlFiles = glob($modulePath . '/ext/control/*.php');
        if($extControlFiles)
        {
            foreach($extControlFiles as $extControlFile)
            {
                $methodFile = substr($extControlFile, strrpos($extControlFile, '/') + 1);
                $methodName = substr($methodFile, 0, strpos($methodFile, '.'));
                if(in_array($moduleName . '-' . strtolower($methodName), $whiteList)) continue;
                if(strpos($methodName, 'ajax') !== false) continue;

                $exits = false;
                foreach($lang->resource->$moduleName as $key => $label)
                {
                    if(strtolower($methodName) == strtolower($key)) $exits = true;
                }
                if(!$exits) echo $moduleName . "\t" . $methodName . " not in the list. \n";
            }
        }
    }
}

/* checking actions of every module. */
echo '-------------lang checking-----------------' . "\n";
include '../app/sys/common/lang/zh-cn.php';
include '../app/crm/common/lang/zh-cn.php';
include '../app/oa/common/lang/zh-cn.php';
include '../config/config.php';

foreach(glob($appRoot . '*') as $appPath)
{
    $appName = basename($appPath);
    foreach(glob($appPath . '/*') as $modulePath)
    {
        unset($lang);
        $moduleName   = basename($modulePath);
        $mainLangFile = $modulePath . '/lang/zh-cn.php';
        if(!file_exists($mainLangFile)) continue;
        $mainLines = file($mainLangFile);

        foreach($config->langs as $langKey => $langName)
        {
            if($langKey == 'zh-cn' or $langKey == 'zh-tw') continue;
            $langFile = $modulePath . '/lang/' . $langKey . '.php';
            if(!file_exists($langFile)) continue;
            $lines = file($langFile);
            foreach($mainLines as $lineNO => $line)
            {
                if(strpos(trim($line), '$lang') === 0)
                {
                    list($mainKey, $mainValue) = explode('=', $line);
                    if(!isset($lines[$lineNO]) or strpos(trim($lines[$lineNO]), '$lang') !== 0)
                    {
                        echo "module $moduleName of $appName need checking, command is:";
                        echo " vim -O +$lineNO ../app/$appName/$moduleName/lang/zh-cn.php +$lineNO ../app/$appName/$moduleName/lang/$langKey.php \n";
                        break;

                    }

                    list($key, $value) = explode('=', $lines[$lineNO]);
                    if(trim($mainKey) != trim($key))
                    {
                        $key = trim($key);
                        $lineNO = $lineNO + 1;
                        echo "module $moduleName of $appName need checking, command is:";
                        echo " vim -O +$lineNO ../app/$appName/$moduleName/lang/zh-cn.php +$lineNO ../app/$appName/$moduleName/lang/$langKey.php \n";
                        break;
                    }
                }
            }
        }

        foreach(glob($modulePath . '/ext/lang/zh-cn/*.php') as $extMainLangFile)
        {
            $extMainLines = file($extMainLangFile);
            $extLangFile  = basename($extMainLangFile);
            $extEnFile    = $modulePath . '/ext/lang/en/' . $extLangFile;
            $extLines     = file($extEnFile);
            foreach($extMainLines as $lineNO => $line)
            {
                if(strpos($line, '$lang') === false)
                {
                    //if($line != $lines[$lineNO]) echo $moduleName . ' ' . $langKey . ' ' . $lineNO . "\n";
                }
                else
                {
                    list($mainKey, $mainValue) = explode('=', $line);
                    list($key, $value) = explode('=', $extLines[$lineNO]);
                    if(trim($mainKey) != trim($key))
                    {
                        $key = trim($key);
                        $lineNO = $lineNO + 1;
                        echo "module $moduleName need checking, command is:";
                        echo " vim -O +$lineNO ../../module/$moduleName/ext/lang/zh-cn/$extLangFile +$lineNO ../../module/$moduleName/ext/lang/en/$extLangFile \n";
                        break;
                    }
                }
            }
        }
    }
}

echo '-------------php5.4 synatax checking-----------------' . "\n";
class app {function loadLang() {}}
$app = new app;
foreach(glob($appRoot . '*') as $appPath)
{
    error_reporting(E_WARNING | E_STRICT );
    $lang       = new stdclass();
    $lang->menu = new stdclass();

    foreach(glob($appPath . '/*') as $modulePath)
    {
        $moduleName = basename($modulePath);
        $cnLangFile = $modulePath . '/lang/zh-cn.php';
        $enLangFile = $modulePath . '/lang/en.php';
        $configFile = $modulePath . '/config.php';

        if(!isset($lang->$moduleName))   $lang->$moduleName   = new stdclass();
        if(!isset($config->$moduleName)) $config->$moduleName = new stdclass();
        if(file_exists($cnLangFile)) include $cnLangFile;
        if(file_exists($enLangFile)) include $enLangFile;
        if(file_exists($configFile)) include $configFile;
    }
}
