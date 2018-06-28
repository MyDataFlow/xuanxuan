<?php
class entry extends control
{
    /**
     * Use token to authenticate user login.
     * @param string $code      entry code.
     * @param string $token     user login token.
     * @param string $referer
     */
    public function auth($code = '', $token = '', $referer = '')
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
                if($user && $this->user->login($user->account, $user->password))
                {
                    $verification = true;
                }
            }
        }
        if($verification == false) $this->locate($this->createLink('user', 'login'));
        $referer = empty($referer) ? $this->createLink('entry', 'visit', 'entryID=' . $sso->entry) : $referer;
        $this->locate($referer);
    }
}