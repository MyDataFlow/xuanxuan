<?php
public function signIn($account = '', $date = '')
{
    return $this->loadExtension('xuanxuan')->signIn($account, $date);
}
