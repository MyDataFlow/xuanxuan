<?php
public function createTable($version)
{
    $result = parent::createTable($version);
    if($result)
    {
        $sql = "INSERT INTO `{$this->config->db->name}`.`{$this->config->db->prefix}sys_config` (`owner`, `app`, `module`, `section`, `key`, `value`) VALUES ('system', 'sys', 'xuanxuan', 'global', 'version', '{$this->config->xuanxuan->version}')";
        $this->dbh->query($sql);
    }
    return $result;
}
