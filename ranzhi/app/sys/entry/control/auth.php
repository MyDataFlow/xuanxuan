<?php
class entry extends control
{
    public function auth($code = '', $token = '')
    {
        $this->loadModel('sso');
        $this->loadModel('user');
        $verification = false;
        if(!empty($token) && !empty($code) && $this->sso->checkIP($code))
        {
            $sso = $this->sso->getByToken($token);
            if($sso)
            {
                $user = $this->dao->select('*')->from(TABLE_USER)->where('id')->eq($sso->sid)->fetch();
                $this->session->set('random', '');
                if($user && $this->user->identify($user->account, $user->password))
                {
                    $this->user->keepLogin($user);
                    $this->session->set('user', $user);
                    $verification = true;
                }
            }
        }
        if($verification == false) $this->locate($this->createLink('user', 'login'));
        $this->locate($this->createLink('entry', 'visit', 'entryID=' . $sso->entry));
    }
}