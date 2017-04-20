<?php
class chat extends control
{
    public function __construct()
    {
        parent::__construct();

        $this->response = new stdclass();
        $this->response->module = $this->moduleName;
        $this->response->method = $this->methodName;
    }

    /**
     * Login.  
     * 
     * @param  string $account 
     * @param  string $password encrypted password
     * @param  string $status   online | away | busy
     * @access public
     * @return void
     */
    public function login($account = '', $password = '', $status = 'online')
    {
        $password = md5($password . $account);
        $user     = $this->loadModel('user')->identify($account, $password);

        if($user) 
        {
            $user->status = $status;
            $user = $this->chat->editUser($user);

            $this->loadModel('action')->create('user', $user->id, 'loginXuanxuan', '', 'xuanxuan', $user->account);
            
            $userList = $this->chat->getUserList($status = 'online');
            $this->response->result = 'success';
            $this->response->users  = array_keys($userList);
            $this->response->data   = $user;
        }
        else
        {
            $this->response->result = 'fail';
            $this->response->data   = $this->lang->user->loginFailed;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Logout. 
     * 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function logout($userID = 0)
    {
        $user = new stdclass();
        $user->id     = $userID;
        $user->status = 'offline';

        $user     = $this->chat->editUser($user);
        $userList = $this->chat->getUserList($status = 'online');

        $this->loadModel('action')->create('user', $userID, 'logoutXuanxuan', '', 'xuanxuan', $user->account);

        $this->response->result = 'success';
        $this->response->users  = array_keys($userList);
        $this->response->data   = $user;

        session_destroy();
        setcookie('za', false);
        setcookie('zp', false);

        die(helper::jsonEncode($this->response));
    }

    /**
     * Get user list.  
     * 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function userGetList($userID = 0)
    {
        $userList = $this->chat->getUserList();

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Get userlist failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $userList;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Change a user. 
     * 
     * @param  string $name 
     * @param  string $name 
     * @param  string $account 
     * @param  string $realname 
     * @param  string $avatar 
     * @param  string $role 
     * @param  string $dept 
     * @param  string $status 
     * @param  int    $userID 
     * @access public
     * @return void
     */
    public function userChange($name = '', $account = '', $realname = '', $avatar = '', $role = '', $dept = '', $status = '', $userID = 0)
    {
        $user = new stdclass();
        $user->id       = $userID;
        $user->name     = $name;
        $user->account  = $account;
        $user->realname = $realname;
        $user->avatar   = $avatar;
        $user->role     = $role;
        $user->dept     = $dept;
        $user->status   = $status;

        $user  = $this->chat->editUser($user);
        $users = $this->chat->getUserList($status = 'online');

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Change name failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $user;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Keep session active
     * @return object
     */
    public function ping()
    {
        $this->response->result = 'success';
        $this->response->users  = array($this->app->user->id);

        die(helper::jsonEncode($this->response));
    }

    /**
     * Get public chat list. 
     * 
     * @param  bool   $public 
     * @param  int    $userID
     * @access public
     * @return void
     */
    public function getPublicList($public = true, $userID = 0)
    {
        $chatList = $this->chat->getList($public);
        foreach($chatList as $chat) 
        {
            $chat->members = $this->chat->getMemberListByGID($chat->gid);
        }

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Get public chat list failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $chatList;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Get chat list of a user.  
     * 
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function getList($userID = 0)
    {
        $chatList = $this->chat->getListByUserID($userID);
        foreach($chatList as $chat) 
        {
            $chat->members = $this->chat->getMemberListByGID($chat->gid);
        }
        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Get chat list failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $chatList;
        }
        die(helper::jsonEncode($this->response));
    }

    /**
     * Get members of a chat. 
     * 
     * @param  string $gid 
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function members($gid = '', $userID = 0)
    {
        $memberList = $this->chat->getMemberListByGID($gid);
        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Get member list failed.';
        }
        else
        {
            $data = new stdclass();
            $data->gid     = $gid;
            $data->members = $memberList;

            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $data;
        }
        die(helper::jsonEncode($this->response));
    }

    /**
     * Create a chat. 
     * 
     * @param  string $gid 
     * @param  string $name 
     * @param  string $type 
     * @param  array  $members 
     * @param  int    $subjectID 
     * @param  bool   $public    true: the chat is public | false: the chat isn't public.
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function create($gid = '', $name = '', $type = 'group', $members = array(), $subjectID = 0, $public = false, $userID = 0)
    {
        $chat = $this->chat->getByGID($gid, true);

        if(!$chat)
        { 
            $chat = $this->chat->create($gid, $name, $type, $members, $subjectID, $public);
        }
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Create chat fail.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Set admins of a chat. 
     * 
     * @param  string $gid 
     * @param  array  $admins 
     * @param  bool   $isAdmin 
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function setAdmin($gid = '', $admins = array(), $isAdmin = true, $userID = 0)
    {
        $user = $this->chat->getUserByUserID($userID);
        if($user->admin != 'super')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notAdmin;

            die(helper::jsonEncode($this->response));
        }

        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'system')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notSystemChat;

            die(helper::jsonEncode($this->response));
        }

        $chat  = $this->chat->setAdmin($gid, $admins, $isAdmin);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Set admin failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Join or quit a chat. 
     * 
     * @param  string $gid 
     * @param  bool   $join   true: join a chat | false: quit a chat.
     * @param  int    $userID
     * @access public
     * @return void 
     */
    public function joinChat($gid = '', $join = true, $userID = 0)
    {
        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'group')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notGroupChat;

            die(helper::jsonEncode($this->response));
        }

        if($join && $chat->public == '0')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notPublic;

            die(helper::jsonEncode($this->response));
        }

        $this->chat->joinChat($gid, $userID, $join);

        $chat  = $this->chat->getByGID($gid, true);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            if($join)
            {
                $message = 'Join chat failed.';
            }
            else
            {
                $message = 'Quit chat failed.';
            }

            $this->response->result  = 'fail';
            $this->response->message = $message;
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Change the name of a chat.  
     * 
     * @param  string $gid 
     * @param  string $name 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function changeName($gid = '', $name ='', $userID = 0)
    {
        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'group' && $chat->type != 'system')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notGroupChat;

            die(helper::jsonEncode($this->response));
        }

        $chat->name = $name;
        $chat  = $this->chat->update($chat);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Change name failed.';
        }
        else
        {

            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;

            $user = zget($users, $userID, '');
            if($user)
            {
                $broadcast = new stdclass();
                $broadcast->module            = 'chat';
                $broadcast->method            = 'message';
                $broadcast->data              = new stdclass();
                $broadcast->data->cgid        = $gid;
                $broadcast->data->gid         = md5(uniqid() . microtime() . mt_rand());
                $broadcast->data->date        = helper::now();
                $broadcast->data->contentType = 'text';
                $broadcast->data->user        = $userID;
                $broadcast->data->type        = 'broadcast';
                $broadcast->data->content     = (empty($user->realname) ? ('@' . $user->account) : $user->realname) . $this->lang->chat->changeRenameTo . $name;
                $this->chat->send($userList, $broadcast, true, true);
            }
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Change the committers of a chat
     * 
     * @param  string $gid 
     * @param  string $committers
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function setCommitters($gid = '', $committers = '', $userID = 0)
    {
        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'group' && $chat->type != 'system')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notGroupChat;

            die(helper::jsonEncode($this->response));
        }

        $chat->committers = $committers;
        $chat  = $this->chat->update($chat);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Set committers failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;
        }

        die(helper::jsonEncode($this->response));
    }
    
    /**
     * Change a chat to be public or not. 
     * 
     * @param  string $gid 
     * @param  bool   $public true: change a chat to be public | false: change a chat to be not public. 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function changePublic($gid = '', $public = true, $userID = 0)
    {
        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'group')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notGroupChat;

            die(helper::jsonEncode($this->response));
        }

        $chat->public = $public ? 1 : 0;
        $chat  = $this->chat->update($chat);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Change public failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $data;
        }

        die(helper::jsonEncode($this->response));
    }
    
    /**
     * Star or cancel star a chat.  
     * 
     * @param  string $gid 
     * @param  bool   $star true: star a chat | false: cancel star a chat. 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function star($gid = '', $star = true, $userID = 0)
    {
        $chat = $this->chat->starChat($gid, $star, $userID);
        if(dao::isError())
        {
            if($star)
            {
                $message = 'Star chat failed';
            }
            else
            {
                $message = 'Cancel star chat failed';
            }

            $this->response->result  = 'fail';
            $this->response->message = $message;
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $chat;
        }
        die(helper::jsonEncode($this->response));
    }

    /**
     * Hide or display a chat.  
     * 
     * @param  string $gid 
     * @param  bool   $hide true: hide a chat | false: display a chat. 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function hide($gid = '', $hide = true, $userID = 0)
    {
        $chatList = $this->chat->hideChat($gid, $hide);
        if(dao::isError())
        {
            if($hide)
            {
                $message = 'Hide chat failed.';
            }
            else
            {
                $message = 'Display chat failed.';
            }

            $this->response->result  = 'fail';
            $this->response->message = $message;
        }
        else
        {
            $data = new stdclass();
            $data->gid  = $gid;
            $data->hide = $hide;

            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $data;
        }
        die(helper::jsonEncode($this->response));
    }

    /**
     * Add members to a chat or kick members from a chat. 
     * 
     * @param  string $gid 
     * @param  array  $members  
     * @param  bool   $join     true: add members to a chat | false: kick members from a chat.
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function addMember($gid = '', $members = array(), $join = true, $userID = 0)
    {
        $chat = $this->chat->getByGID($gid);
        if(!$chat)
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notExist;

            die(helper::jsonEncode($this->response));
        }
        if($chat->type != 'group')
        {
            $this->response->result  = 'fail';
            $this->response->message = $this->lang->chat->notGroupChat;

            die(helper::jsonEncode($this->response));
        }

        foreach($members as $member) $this->chat->joinChat($gid, $member, $join);

        $chat->members = $this->chat->getMemberListByGID($gid);
        $users = $this->chat->getUserList($status = 'online', array_values($chat->members));

        if(dao::isError())
        {
            if($join)
            {
                $message = 'Add member failed.';
            }
            else
            {
                $message = 'Kick member failed.';
            }

            $this->response->result  = 'fail';
            $this->response->message = $message;
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array_keys($users);
            $this->response->data   = $chat;
        }
        die(helper::jsonEncode($this->response));
    }

    /**
     * Send message to a chat.
     * 
     * @param  array  $messages
     * @param  int    $userID
     * @access public
     * @return object 
     */
    public function message($messages = array(), $userID = 0)
    {
        /* Check whether the logon user can send message in chat. */
        $errors = array();
        foreach($messages as $key => $message)
        {
            $chat = $this->chat->getByGID($message->cgid);
            
            if(!$chat)
            {
                $error = new stdclass();
                $error->gid      = $message->cgid;
                $error->messages = $this->lang->chat->notExist;

                $errors[] = $error;
                unset($messages[$key]);

                continue;
            }

            if($chat && !$chat->admins) continue;
            
            $admins = explode(',', $chat->admins);
            if(!in_array($userID, $admins))
            {
                $error = new stdclass();
                $error->gid      = $message->cgid;
                $error->messages = $this->lang->chat->cantChat;

                $errors[] = $error;
                unset($messages[$key]);
            }
        }

        $messageList = $this->chat->createMessage($messages);

        foreach($messageList as $message)
        {
            $memberList = $this->chat->getMemberListByGID($message->cgid);
            $userList   = $this->chat->getUsersToNotify(array_values($memberList));

            $data = new stdclass();
            $data->module = $this->moduleName;
            $data->method = $this->methodName;
            $data->data   = $message;

            /* Add to message queue. */
            $this->chat->send($userList, $data, false);
        }

        if($errors)
        {
            $this->response->result = 'fail';
            $this->response->data   = $errors;

            die(helper::jsonEncode($this->response));
        }

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Send message failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->data   = $messageList;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Get history messages of a chat.
     * 
     * @param  string $gid 
     * @param  int    $recPerPage 
     * @param  int    $pageID 
     * @param  int    $recTotal 
     * @param  bool   $continued
     * @param  int    userID
     * @access public
     * @return object
     */
    public function history($gid = '', $recPerPage = 20, $pageID = 1, $recTotal = 0, $continued = false, $userID = 0)
    {
        $this->app->loadClass('pager', $static = true);
        $pager = new pager($recTotal, $recPerPage, $pageID);

        if($gid)
        {
            $messageList = $this->chat->getMessageListByCGID($gid, $pager);
        }
        else
        {
            $messageList = $this->chat->getMessageList($idList = array(), $pager);
        }

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Get history failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->users  = array($userID);
            $this->response->data   = $messageList;

            $pagerData = new stdclass();
            $pagerData->recPerPage = $pager->recPerPage;
            $pagerData->pageID     = $pager->pageID;
            $pagerData->recTotal   = $pager->recTotal;
            $pagerData->gid        = $gid;
            $pagerData->continued  = $continued;

            $this->response->pager = $pagerData;
        }

        die(helper::jsonEncode($this->response));
    }

    /**
     * Save or get settings.
     * 
     * @param  string $account 
     * @param  string $settings 
     * @param  int    $userID
     * @access public
     * @return object
     */
    public function settings($account = '', $settings = '', $userID = 0)
    {
        if($settings)
        {
            $this->loadModel('setting')->setItem("system.sys.chat.settings.$account", $settings);
        }

        if(dao::isError())
        {
            $this->response->result  = 'fail';
            $this->response->message = 'Save settings failed.';
        }
        else
        {
            $this->response->result = 'success';
            $this->response->userID = array($userID);
            if(!$settings)
            {
                $this->response->data = $this->config->chat->settings->$account;
            }
        }

        die(helper::jsonEncode($this->response));
    }
}
