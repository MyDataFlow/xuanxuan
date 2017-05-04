<?
public function createTable($version)
{
    $result = parent::createTable($version);
    if($result)
    {
        $this->loadModel('setting')->setItem('system.sys.xuanxuan.global.version', $this->config->xuanxuan->version);
    }
    return $result;
}
