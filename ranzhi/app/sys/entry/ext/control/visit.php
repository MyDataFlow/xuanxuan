<?php
include '../../control.php';
class myEntry extends entry
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
        if(RUN_MODE != 'xuanxuan')
        {
            parent::visit($entryID, $referer);
            exit;
        }

        $referer = !empty($_GET['referer']) ? $this->get->referer : $referer;

        $output = new stdclass();
        $output->module = $this->moduleName;
        $output->method = $this->methodName;
        $output->result = 'success';
        $output->users  = array($this->session->userID);

        $entry = $this->entry->getById($entryID);
        if(!$entry)
        {
            $output->data = $referer;
            die($this->app->encrypt($output));
        }
        if(!empty($entry->login) && strpos($entry->login, 'http') !== 0)
        {
            $_SERVER['SCRIPT_NAME'] = 'index.php';
            $entry->login = commonModel::getSysURL() . str_replace('../', '/', $entry->login);
        }

        $user   = $this->dao->select('*')->from(TABLE_USER)->where('id')->eq($this->session->userID)->fetch();
        $groups = $this->loadModel('group')->getByAccount($user->account);
        $user->ip     = $this->session->clientIP->IP;
        $user->groups = array_keys($groups);
        $user->rights = $this->loadModel('user')->authorize($user);
        $this->session->set('user', $user);
        $this->app->user = $this->session->user;

        $query = '';
        if($entry->integration)
        {
            if($entry->buildin && !$entry->zentao)
            {
                $query = session_name() . '=' . session_id();
                if($referer) $entry->login = $referer;
            }
            else
            {
                $token = $this->loadModel('sso')->createToken(session_id(), $entryID);
                $query = "token=$token";
                if($referer) $query .= '&referer=' . base64_encode($referer);
                $query .= '&sessionid=' . base64_encode(json_encode(array('session_name' => session_name(), 'session_id' => session_id())));
            }
        }
        else
        {
            $query = session_name() . '=' . session_id();
            if($referer) $entry->login = $referer;
        }

        $location = $entry->login;
        $pathinfo = parse_url($location);
        if(!empty($pathinfo['query']))
        {
            $location = rtrim($location, '&') . "&$query";
        }
        else
        {
            $location = rtrim($location, '?') . "?$query";
        }

        $output->data = $location;
        die($this->app->encrypt($output));
    }
}
