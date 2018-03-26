<?php
public function createTable($version)
{
    $result = parent::createTable($version);
    if($result)
    {
        $sql  = "INSERT INTO `{$this->config->db->name}`.`{$this->config->db->prefix}sys_config` (`owner`, `app`, `module`, `section`, `key`, `value`) VALUES ('system', 'sys', 'xuanxuan', 'global', 'version', '{$this->config->xuanxuan->version}');";
        $sql .= "INSERT INTO `{$this->config->db->name}`.`{$this->config->db->prefix}sys_config` (`owner`, `app`, `module`, `section`, `key`, `value`) VALUES ('system', 'sys', 'xuanxuan', '', 'key', '" . md5(time()). "');";
        $this->dbh->query($sql);
    }
    return $result;
}
