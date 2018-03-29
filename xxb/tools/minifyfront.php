#!/usr/bin/env php
<?php
/**
* This file is used to compress css and js files.
*/

$baseDir = dirname(dirname(__FILE__));

//--------------------------------- PROCESS JS FILES ------------------------------ //

/* Set jsRoot. */
$jsRoot = $baseDir . '/www/js/';

/* Set js files to combined. */
$jsFiles[] = $jsRoot . 'jquery/min.js';
$jsFiles[] = $jsRoot . 'jquery/form/min.js';
$jsFiles[] = $jsRoot . 'zui/min.js';
$jsFiles[] = $jsRoot . 'chartjs/chart.min.js';
$jsFiles[] = $jsRoot . 'ranzhi.js';
$jsFiles[] = $jsRoot . 'my.js';

/* Combine these js files. */
$allJSFile  = $jsRoot . 'all.js';
$jsCode = '';
foreach($jsFiles as $jsFile) $jsCode .= "\n". file_get_contents($jsFile);
$result = file_put_contents($allJSFile, $jsCode);
if($result) echo "compress js ok\n";

/* Compress it. */
`java -jar ~/bin/yuicompressor/build/yuicompressor.jar --type js $allJSFile -o $allJSFile`;

//-------------------------------- PROCESS CSS FILES ------------------------------ //

/* Define the themeRoot. */
$themeRoot  = $baseDir . '/www/theme/';

/* Common css files. */
$cssCode  = str_replace('../fonts', '../zui/fonts', file_get_contents($themeRoot . 'zui/css/min.css'));
$cssCode .= file_get_contents($themeRoot . 'default/style.css');
$cssCode .= file_get_contents($themeRoot . 'default/admin.css');

/* Combine them. */
$cssFile = $themeRoot . "default/all.css";
$result  = file_put_contents($cssFile, $cssCode);
if($result) echo "compress css ok\n";

/* Compress it. */
`java -jar ~/bin/yuicompressor/build/yuicompressor.jar --type css $cssFile -o $cssFile`;
