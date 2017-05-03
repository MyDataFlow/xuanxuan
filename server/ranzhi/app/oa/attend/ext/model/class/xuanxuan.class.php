<?php
class xuanxuanAttend extends attendModel
{
    public function signIn($account = '', $date = '')
    {
        if(!$this->checkIP()) return array('result' => 'fail', 'message' => $this->lang->attend->note->IPDenied);

        $viewType = $this->app->getViewType();
        if(($this->config->attend->signInClient == 'pc' && $viewType != 'html') 
            or ($this->config->attend->signInClient == 'mobile' && $viewType != 'mhtml')
            or ($this->config->attend->signInClient == 'xuanxuan' && strpos($_SERVER['HTTP_USER_AGENT'], 'easysoft-xxdclient') === false)) 
        {
            return array('result' => 'fail', 'message' => sprintf($this->lang->attend->signInClientError, $this->lang->attend->clientList[$this->config->attend->signInClient]));
        }


        if($account == '') $account = $this->app->user->account;
        if($date == '')    $date    = date('Y-m-d');

        $device = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        $client = $viewType == 'html' ? 'pc' : ($viewType == 'mhtml' ? 'mobile' : (strpos($_SERVER['HTTP_USER_AGENT'], 'easysoft-xxdclient') !== false ? 'xuanxuan' : ''));

        $attend = $this->dao->select('*')->from(TABLE_ATTEND)->where('account')->eq($account)->andWhere('`date`')->eq($date)->fetch();
        if(empty($attend))
        {
            $attend = new stdclass();
            $attend->account = $account;
            $attend->date    = $date;
            $attend->signIn  = helper::time();
            $attend->ip      = helper::getRemoteIp();
            $attend->device  = $device;
            $attend->client  = $client; 
            $this->dao->insert(TABLE_ATTEND)->data($attend)->autoCheck()->exec();
            return !dao::isError();
        }

        if($attend->signIn == '' or $attend->signIn == '00:00:00')
        {
            $attend->signIn = helper::time();
            $attend->ip     = helper::getRemoteIp();
            $attend->device = $device;
            $attend->client = $client; 
            $this->dao->update(TABLE_ATTEND)->data($attend)->where('id')->eq($attend->id)->exec();
            return !dao::isError();
        }

        return true;
    }
}
