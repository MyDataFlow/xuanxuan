<?php
class entry extends control
{
    /**
     * Visit entry.
     *
     * @param  int    $entryID
     * @param  string $referer
     * @access public
     * @return void
     */
    public function visit($entryID, $referer = '')
    {
        $referer = !empty($_GET['referer']) ? $this->get->referer : $referer;
        $entry   = $this->entry->getById($entryID);

        if(RUN_MODE == 'xuanxuan')
        {
            $user   = $this->dao->select('*')->from(TABLE_USER)->where('id')->eq($this->session->userID)->fetch();
            $groups = $this->loadModel('group')->getByAccount($user->account);

            $user->ip     = $this->session->clientIP->IP;
            $user->groups = array_keys($groups);
            $user->rights = $this->loadModel('user')->authorize($user);

            $this->session->set('user', $user);
        }

        /* deny if no this app rights. */
        if(!commonModel::hasAppPriv($entry->code)) $this->loadModel('common', 'sys')->deny($this->app->getModuleName(), $this->app->getMethodName());

        $location = $entry->login;
        $pathinfo = parse_url($location);
        if($entry->integration)
        {
            $token = $this->loadModel('sso')->createToken(session_id(), $entryID);
            if(!empty($pathinfo['query']))
            {
                $location = rtrim($location, '&') . "&token=$token";
            }
            else
            {
                $location = rtrim($location, '?') . "?token=$token";
            }
            if(!empty($referer)) $location .= '&referer=' . base64_encode($referer);
        }

        if(RUN_MODE == 'xuanxuan')
        {
            if(strpos($location, 'http') !== 0)
            {
                $_SERVER['SCRIPT_NAME'] = 'index.php';
                $location = commonModel::getSysURL() . str_replace('../', '/', $entry->login) . '?' . session_name() . '=' . session_id();
            }
            else
            {
                $location .= '&sessionid=' . base64_encode(json_encode(array('session_name' => session_name(), 'session_id' => session_id())));
            }
            $this->output = new stdclass();
            $this->output->module = $this->moduleName;
            $this->output->method = $this->methodName;
            $this->output->result = 'success';
            $this->output->data   = $entry->integration ? $location : $entry->login;
            $this->output->users  = array($this->session->userID);
            die($this->app->encrypt($this->output));
        }

        $this->locate($location);
    }
}
