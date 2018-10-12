<?php
/**
 * Get version of xuanxuan.
 *
 * @access public
 * @return string
 */
public function getXuanxuanVersion()
{
    return !empty($this->config->xuanxuan->global->version) ? $this->config->xuanxuan->global->version : '1.0';
}

/**
 * Upgrade xuanxuan.
 *
 * @param  string $fromVersion
 * @access public
 * @return void
 */
public function upgradeXuanxuan($fromVersion)
{
    switch($fromVersion)
    {
        case '1.0'   : $this->execSQL($this->getUpgradeFile('xuanxuan1.0'));
        case '1.1.0' :
        case '1.1.1' : $this->execSQL($this->getUpgradeFile('xuanxuan1.1.1'));
        case '1.3.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.3.0'));
        case '1.4.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.4.0'));
            $this->processMessageStatus();
        case '1.5.0' :
        case '1.6.0' : $this->execSQL($this->getUpgradeFile('xuanxuan1.6.0'));
        case '2.0.0' : $this->execSQL($this->getUpgradeFile('xuanxuan2.0.0'));
        default : $this->loadModel('setting')->setItem('system.sys.xuanxuan.global.version', $this->config->xuanxuan->version);
    }
}

/**
 * Process message status.
 *
 * @access public
 * @return bool
 */
public function processMessageStatus()
{
    $userMessages = array();
    $messagesList = $this->dao->select('*')->from($this->config->db->prefix . 'im_usermessage')->fetchAll();
    foreach($messagesList as $messages)
    {
        $user     = $messages->user;
        $messages = json_decode($messages->message);
        foreach($messages as $message)
        {
            if(isset($userMessages[$user][$message->gid])) continue;

            $data = new stdClass();
            $data->user   = $user;
            $data->gid    = $message->gid;
            $data->status = 'waiting';
            $this->dao->insert(TABLE_IM_MESSAGESTATUS)->data($data)->exec();

            $userMessages[$user][$message->gid] = $message->gid;
        }
    }

    return !dao::isError();
}
