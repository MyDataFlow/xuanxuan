#!/usr/bin/env php
<?php
foreach(glob('../app/*') as $app)
{
    echo "converting app " . basename($app) . ":\n";
    convertTW($app);
}

function convertTW($app)
{
    foreach(glob("$app/*") as $moduleName)
    {
        $moduleLangPath  = realpath($moduleName) . '/lang/';
        $defaultLangFile = $moduleLangPath . 'zh-cn.php';
        $targetLangFile  = $moduleLangPath . 'zh-tw.php';

        echo "  converting module " . basename($moduleName) . " extension,";
        $extModuleLangPath = realpath($moduleName) . '/ext/*/lang/zh-cn/*.php';
        foreach(glob($extModuleLangPath) as $extLangFile)
        {
            convExtToTW($extLangFile);
        }

        $extModuleLangPath = realpath($moduleName) . '/ext/lang/zh-cn/*.php';
        foreach(glob($extModuleLangPath) as $extLangFile)
        {
            convExtToTW($extLangFile);
        }
        echo " ok.\n";
        if(!file_exists($defaultLangFile)) continue;

        echo "  converting module " . basename($moduleName) . ",";
        convToTW($defaultLangFile, $targetLangFile);
        echo " ok.\n";
    }
}

function convToTW($defaultLangFile, $targetLangFile)
{
    system("cconv -f utf-8 -t UTF8-TW $defaultLangFile > $targetLangFile");
    $defaultLang = file_get_contents($targetLangFile);
    $targetLang  = str_replace('zh-cn', 'zh-tw', $defaultLang);
    file_put_contents($targetLangFile, $targetLang);
}

function convExtToTW($extLangFile)
{
    $parentPath = dirname(dirname($extLangFile));
    $fileName   = basename($extLangFile);
    $extTargetLangPath = $parentPath . '/zh-tw';
    if(!is_dir($extTargetLangPath)) mkdir($extTargetLangPath);
    convToTW($extLangFile, $extTargetLangPath . '/' . $fileName);
}
