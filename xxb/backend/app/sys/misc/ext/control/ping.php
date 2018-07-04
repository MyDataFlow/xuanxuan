<?php
class misc extends control
{
    public function ping()
    {
    /* Save attend info. */
        if(commonModel::isAvailable('attend'))
        {
            $this->app->loadModuleConfig('attend', 'oa');
            if($this->config->attend->mustSignOut == 'no') $this->loadModel('attend', 'oa')->signOut();
        }

        /* Save online status. */
        $this->loadModel('user')->online();
    }
}
