<?php
class admin extends control
{
    /**
     * Configuration of xuanxuan.
     *
     * @access public
     * @return void
     */
    public function xuanxuan()
    {
        $this->app->loadLang('chat');
        if($_POST)
        {
            if(strlen($this->post->key) != 32 or !validater::checkREG($this->post->key, '|^[A-Za-z0-9]+$|')) $this->send(array('result' => 'fail', 'message' => array('key' => $this->lang->chat->errorKey)));
            if($this->post->key) $this->loadModel('setting')->setItem('system.xuanxuan..key', $this->post->key);
            if(dao::isError()) $this->send(array('result' => 'fail', 'message' => dao::getError()));

            $this->send(array('result' => 'success', 'message' => $this->lang->saveSuccess));
        }

        $this->view->position[] = $this->lang->chat->settings;
        $this->view->title      = $this->lang->chat->settings;
        $this->display();
    }
}
