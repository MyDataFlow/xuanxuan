<?php
class entry extends control
{
    /**
     * Use token to authenticate user login.
     * @param string $code      entry code.
     * @param string $token     user login token.
     * @param string $refer
     */
    public function auth($code = '', $token = '', $refer = '')
    {
        $this->loadModel('sso');
        $this->loadModel('user');
        $verification = false;
        if(!empty($token) && !empty($code) && $this->sso->checkIP($code))
        {
            $sso = $this->sso->getByToken($token);
            if($sso)
            {
                $user = $this->dao->select('*')->from(TABLE_USER)->where('token')->eq($sso->sid)->andWhere('status')->eq('online')->fetch();
                $this->session->set('random', '');
                if($user && $this->user->login($user->account, $user->password)) $verification = true;
            }
        }
        if($verification == false) $this->locate($this->createLink('user', 'login'));
        $this->locate($this->createLink('entry', 'visit', 'entryID=' . $sso->entry . '&referer=' . $refer));
    }
}
