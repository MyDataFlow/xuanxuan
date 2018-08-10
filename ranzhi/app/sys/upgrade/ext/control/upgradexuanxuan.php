<?php
class upgrade extends control
{
    /**
     * Upgrade xuanxuan.
     *
     * @access public
     * @return void
     */
    public function upgradeXuanxuan()
    {
        $fromVersion = $this->upgrade->getXuanxuanVersion();

        $this->upgrade->upgradeXuanxuan($fromVersion);
        if(!$this->upgrade->isError())
        {
            $this->view->result = 'success';
        }
        else
        {
            $this->view->result = 'fail';
            $this->view->errors = $this->upgrade->getError();
        }

        $this->view->title = $this->lang->upgrade->upgradeXuanxuan;
        $this->display('upgrade', 'execute');
    }
}
