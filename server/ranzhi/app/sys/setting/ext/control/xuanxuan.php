<?php
class setting extends control
{
    /**
     * Configuration of xuanxuan. 
     * 
     * @access public
     * @return void
     */
    public function xuanxuan()
    {
        if($this->app->user->admin != 'super') die(js::locate('back'));

        $this->app->loadLang('chat', 'sys');
        if($_POST)
        {
            if(strlen($this->post->key) != 32 or !validater::checkREG($this->post->key, '|^[A-Za-z0-9]+$|')) $this->send(array('result' => 'fail', 'message' => array('key' => $this->lang->chat->errorKey)));
            if($this->post->key) $this->loadModel('setting')->setItem('system.sys.xuanxuan..key', $this->post->key);
            if(dao::isError()) $this->send(array('result' => 'fail', 'message' => dao::getError()));

            $this->send(array('result' => 'success', 'message' => $this->lang->saveSuccess));
        }

        $this->lang->menuGroups->setting = 'system';
        $this->lang->setting->menu       = $this->lang->system->menu;
        $this->lang->setting->menuOrder  = $this->lang->system->menuOrder;

        $this->view->title = $this->lang->chat->settings;
        $this->display();
    }
}
