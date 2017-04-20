<?php
if($module == 'api' and $method == 'xuanxuan') return true;
if($module == 'chat') return true;
if($module == 'attach' and $method == 'upload')   return true;
if($module == 'attach' and $method == 'download') return true;
