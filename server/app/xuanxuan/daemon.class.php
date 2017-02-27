<?php
/**
 * The daemon server.
 * 
 * @copyright Copyright 2009-2015 QingDao Nature Easy Soft Network Technology Co,LTD (www.cnezsoft.com)
 * @author    chunsheng wang <chunsheng@cnezsoft.com> 
 * @package   xuanxuan 
 * @uses      router
 * @license   ZPLV1
 * @version   $Id$
 * @Link      http://www.zentao.net
 */
class daemon extends router
{
    /**
     * The daemon version.
     * 
     * @var string
     * @access public
     */
    public $version = '1.0';

    /**
     * The master socket.
     * 
     * @var object
     * @access public
     */
    public $master = '';

    /**
     * The socket queue.
     * 
     * @var array 
     * @access public
     */
    public $sockets = array();

    /**
     * The user queue. 
     * 
     * @var array 
     * @access public
     */
    public $users = array();

    /**
     * The request send by client.
     * 
     * @var object
     * @access public
     */
    public $request;

    /**
     * The response send to client.
     * 
     * @var object
     * @access public
     */
    public $response;

    /**
     * The EOF of the message.
     * 
     * @var string
     * @access public
     */
    public $eof = "\n";

    /**
     * 
     * @param  string   $ip 
     * @param  int      $port 
     * @access public
     * @return void
     */
    public function socket($ip, $port)
    {
        $master = socket_create(AF_INET, SOCK_STREAM, SOL_TCP)  or $this->triggerError('socket create failed', __FILE__, __LINE__, true);
        socket_set_option($master, SOL_SOCKET, SO_REUSEADDR, 1) or $this->triggerError('socket set failed', __FILE__, __LINE__, true);
        socket_bind($master, $ip, $port)                        or $this->triggerError('socket bind failed', __FILE__, __LINE__, true);
        socket_listen($master, 20)                              or $this->triggerError('socket listen failed', __FILE__, __LINE__, true);

        $this->master = $master;
        $this->register($master);

        $this->log("$master started.");
    }

    /**
     * Instance a daemon instance and run it.
     *
     * @param  int    $ip 
     * @param  int    $port 
     * @access public
     * @return void
     */
    public function start($ip, $port)
    {
        $this->socket($ip, $port);
        $this->createSystemChat();
        $this->updateUserStatus();
        while(true) $this->process();
    }

    /**
     * Create a system chat.  
     * 
     * @access public
     * @return void
     */
    public function createSystemChat()
    {
        try
        {
            $chatID = $this->dbh->query("SELECT id FROM " . TABLE_IM_CHAT . " where type='system'")->fetch();
            if(!$chatID)
            {
                $now = helper::now();
                $id  = md5(time(). mt_rand());
                $gid = substr($id, 0, 8) . '-' . substr($id, 8, 4) . '-' . substr($id, 12, 4) . '-' . substr($id, 16, 4) . '-' . substr($id, 20, 12);
                $this->dbh->exec("INSERT INTO " . TABLE_IM_CHAT . " (gid, name, type, createdBy, createdDate) values ('$gid', '', 'system', 'system', '$now')");
            }
        }
        catch(PDOException $exception)
        {
            $this->log($exception->getMessage(), __FILE__, __LINE__);
        }
    }

    /**
     * Update user status to offline. 
     * 
     * @access public
     * @return void
     */
    public function updateUserStatus()
    {
        try
        {
            $this->dbh->exec("UPDATE " . TABLE_USER . " set `status` = 'offline'");
        }
        catch(PDOException $exception)
        {
            $this->log($exception->getMessage(), __FILE__, __LINE__);
        }
    }

    /**
     * Process every sockets, read, parse and response.
     * 
     * @access public
     * @return void
     */
    public function process()
    {
        $this->connected = $this->checkConnection();
        /* Copy all $this->sockets to the temp $sockets and select those changed. */
        $sockets = $this->sockets;
        $writes  = null;
        $excepts = null;

        /* Select changed sockets. */
        socket_select($sockets, $writes, $excepts, 1);
        foreach($sockets as $socket) 
        {
            $this->log("$socket selected.");
            if($socket == $this->master) $this->accept($this->master);
            if($socket != $this->master) $this->read($socket) && $this->response($socket);
        }

        /* Send messages to client. */
        if($this->connected) $this->send();
    }

    /**
     * Check if the db connection can work. 
     * 
     * @access public
     * @return bool
     */
    public function checkConnection()
    {
        if(!$this->dbh)
        {
            $this->reconnectDB();
            return false;
        }
        try
        {
            $this->dbh->query("SHOW TABLES");
        }
        catch(PDOException $exception)
        {
            if($exception->errorInfo[1] == 2006 or $exception->errorInfo[1] == 2013)
            {
                $this->reconnectDB();
                return false;
            }
        }
        return true;
    }

    /**
     * Reconnect DB. 
     * 
     * @access public
     * @return void
     */
    public function reconnectDB()
    {
        $this->log('Failed to connect MySQL server, trying to connect again.', __FILE__, __LINE__);
        $this->connectDB();
    }

    /**
     * Send messages to client. 
     * 
     * @access public
     * @return void
     */
    public function send()
    {
        if($this->sockets && $this->users)
        {
            $userMessages = $this->getMessages();

            $idList = array();
            foreach($userMessages as $user => $messages)
            {
                /* Find client socket and send messages. */
                $strClient = array_search($user, $this->users);
                if($strClient)
                {
                    $client = $this->sockets[$strClient];
                    foreach($messages as $message)
                    {
                        unset($message->level);
                        unset($message->user);
                        $message->id   = (int)$message->id;
                        $message->data = json_decode($message->data);
                    }
                    $result = socket_write($client, helper::removeUTF8Bom(json_encode($messages)) . $this->eof);
                    if($result === false)
                    {
                        $errorCode = socket_last_error($client);
                        $error     = socket_strerror($errorCode);
                        $this->log($error, __FILE__, __LINE__);
                    }
                    else
                    {
                        foreach($messages as $message) $idList[] = $message->id;
                    }
                }
            }
            /* Delete the sent messages. */
            $this->deleteMessages($idList);
        }
    }

    /**
     * Get messages to sent. 
     * 
     * @access public
     * @return array
     */
    public function getMessages()
    {
        $messages = array();
        try
        {
            /* Group messages by user. */
            $stmt = $this->dbh->query("SELECT * FROM " . TABLE_IM_USERMESSAGE . " ORDER BY `level`, `id`");
            while($message = $stmt->fetch())
            {
                $messages[$message->user][] = $message;
            }
        }
        catch(PDOException $exception)
        {
            $this->log($exception->getMessage(), __FILE__, __LINE__);
        }

        return $messages;
    }

    /**
     * Delete sent messages.
     * 
     * @param  array  $idList 
     * @access public
     * @return void
     */
    public function deleteMessages($idList = array())
    {
        if($idList) 
        {
            $idList = implode(',', $idList);
            try
            {
                $this->dbh->exec("DELETE FROM " . TABLE_IM_USERMESSAGE . " WHERE `id` IN ({$idList})");
            }
            catch(PDOException $exception)
            {
                $this->log($exception->getMessage(), __FILE__, __LINE__);
            }
        }
    }

    /**
     * Accept a connection and return a client socket.
     * 
     * @param  object    $master 
     * @access public
     * @return void
     */
    public function accept($master)
    {
        $client = socket_accept($master);
        $this->register($client);

        socket_getpeername($client, $ip, $port);
        $this->log("$client connected, $ip:$port.");
    }

    /**
     * Read the message from a socket.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function read($socket)
    {
        /* Init them. */
        $code = $raw = '';
        $this->request = new stdclass();

        while(true)
        {
            $code = socket_recv($socket, $buffer, 1024, 0); 
            $raw .= $buffer;

            /* The code is error. */
            if(!$code) 
            {
                $this->request->code = $code;
                return true;
            }

            /* Finish reading. */
            if(strpos($buffer, $this->eof) !== false)
            {
                $this->request = json_decode($raw);
                $this->request->code = $code;
                $this->request->raw  = $raw;
                return true;
            }
        }
    }

    /**
     * Response to a client.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function response($client)
    {
        if(!$this->request->code) return $this->close($client);
    
        if($this->connected)
        {
            $this->startSession();
            $this->parseRequest();
            $this->loadModule();
            $this->stopSession();
            $this->bindUser($client);
            $this->checkError();
        }
        else
        {
            $this->response = new stdclass();
            $this->response->result  = 'fail';
            $this->response->message = 'Failed to connect MySQL server.'; 
        }
        
        if($this->response) 
        {
            $response = $this->packResponse();
            socket_write($client, $response);
            $this->log($response);
        }
    }

    /**
     * Check if has error. 
     * 
     * @access public
     * @return void
     */
    public function checkError()
    {
        if(function_exists('error_get_last')) 
        {
            $error = error_get_last();
            if($error) 
            {
                $this->response = new stdclass();
                $this->response->result  = 'fail';
                $this->response->message = $error['message'];
            }
        }
    }

    /**
     * Bind user with client. 
     * 
     * @param  int    $client 
     * @access public
     * @return void
     */
    public function bindUser($client)
    {
        if($this->response->result == 'success')
        {
            if($this->getModuleName() == 'chat') 
            {
                if($this->getMethodName() == 'login')
                {
                    $userID    = $this->response->data->id;
                    $account   = $this->response->data->account;
                    $oldClient = array_search($userID, $this->users);
                    /* If user has logined then kick off user from old client. */
                    if($oldClient)
                    {
                        $this->kickOff($oldClient);
    
                        unset($this->sockets[$oldClient]);
                        unset($this->users[$oldClient]);
                    }

                    /* Bind user with client. */
                    $this->users[strval($client)] = $userID;
                    $this->log("User $account logined from socket $client.");
                }
                elseif($this->getMethodName() == 'logout')
                {
                    $userID    = $this->response->data->id;
                    $account   = $this->response->data->account;
                    $oldClient = array_search($userID, $this->users);
                    if($oldClient)
                    {
                        unset($this->sockets[$oldClient]);
                        unset($this->users[$oldClient]);
                    }
                    $this->log("User $account logout from socket $oldClient.");
                }
            }
        }
    }

    /**
     * Kick off user from old client.  
     * 
     * @param  string $strClient 
     * @access public
     * @return void
     */
    public function kickOff($strClient = '')
    {
        $data = new stdclass();
        $data->module  = 'chat';
        $data->method  = 'kickoff';
        $data->message = 'This account logined in another place.';

        $socket = $this->sockets[$strClient];
        socket_write($socket, helper::removeUTF8Bom(json_encode($data)) . $this->eof);
    }

    /**
     * Register a socket to the sockets queue.
     * 
     * @param  object $socket 
     * @access public
     * @return void
     */
    public function register($socket)
    {
        $this->sockets[strval($socket)] = $socket;
    }

    /**
     * Unregister a socket from the sockets queue.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function unregister($socket)
    {
        unset($this->sockets[strval($socket)]);
        unset($this->users[strval($socket)]);
    }

    /**
     * Close a socket.
     * 
     * @param  object    $socket 
     * @access public
     * @return void
     */
    public function close($socket)
    {
        socket_close($socket);
        $this->logout($socket);
        $this->unregister($socket);
        $this->log("$socket closed.");
    }

    /**
     * Update user status. 
     * 
     * @param  object $socket 
     * @access public
     * @return void
     */
    public function logout($socket)
    {
        try
        {
            $userID = $this->users[strval($socket)];
            if($userID) $this->dbh->exec("UPDATE " . TABLE_USER . " SET status = 'offline' WHERE `id` = $userID");
        }
        catch(PDOException $exception)
        {
            $this->log($exception->getMessage(), __FILE__, __LINE__);
        }
    }

    /**
     * Parse the request.
     * 
     * @access public
     * @return void
     */
    public function parseRequest()
    {
        $this->setModuleName($this->request->module);
        $this->setMethodName($this->request->method);
        $this->setControlFile();
        $this->setViewType();
    }

    /**
     * Load a module.
     *
     * @access public
     * @return bool|object  if the module object of die.
     */
    public function loadModule()
    {
        $appName    = $this->appName;
        $moduleName = $this->moduleName;
        $methodName = $this->methodName;

        /* 
         * 引入该模块的control文件。
         * Include the control file of the module.
         **/
        $file2Included = $this->setActionExtFile() ? $this->extActionFile : $this->controlFile;
        chdir(dirname($file2Included));
        helper::import($file2Included);

        /*
         * 设置control的类名。
         * Set the class name of the control.
         **/
        $className = class_exists("my$moduleName") ? "my$moduleName" : $moduleName;
        if(!class_exists($className)) 
        {
            $this->triggerError("the control $className not found", __FILE__, __LINE__);
            return false;
        }

        /*
         * 创建control类的实例。
         * Create a instance of the control.
         **/
        $module = new $className();
        if(!method_exists($module, $methodName)) 
        {
            $this->triggerError("the module $moduleName has no $methodName method", __FILE__, __LINE__);
            return false;
        }
        /* If the db server restarted, must reset dbh. */
        $module->dao->dbh = $this->dbh;
        $module->$moduleName->dao->dbh = $this->dbh;
        $this->control = $module;

        /* include default value for module*/
        $defaultValueFiles = glob($this->getTmpRoot() . "defaultvalue/*.php");
        if($defaultValueFiles) foreach($defaultValueFiles as $file) include $file;

        /* 
         * 使用反射机制获取函数参数的默认值。
         * Get the default settings of the method to be called using the reflecting. 
         *
         * */
        $defaultParams = array();
        $methodReflect = new reflectionMethod($className, $methodName);
        foreach($methodReflect->getParameters() as $param)
        {
            $name = $param->getName();

            $default = '_NOT_SET';
            if(isset($paramDefaultValue[$appName][$className][$methodName][$name]))
            {
                $default = $paramDefaultValue[$appName][$className][$methodName][$name];
            }
            elseif(isset($paramDefaultValue[$className][$methodName][$name]))
            {
                $default = $paramDefaultValue[$className][$methodName][$name];
            }
            elseif($param->isDefaultValueAvailable())
            {
                $default = $param->getDefaultValue();
            }

            $defaultParams[$name] = $default;
        }

        /* Merge params. */
        $params = array();
        if(isset($this->request->params)) 
        {
            $params = $this->mergeParams($defaultParams, (array)$this->request->params);
        }
        else
        {
            $this->triggerError("param error: {$this->request->raw}", __FILE__, __LINE__);
            return false;
        }

        /* Call the method. */
        $this->response = call_user_func_array(array($module, $methodName), $params);
        return true;
    }

    /**
     * Set view type.
     * 
     * @access public
     * @return void
     */
    public function setViewType()
    {
        $this->viewType = 'json';
    }

    /**
     * 合并请求的参数和默认参数，这样就可以省略已经有默认值的参数了。
     * Merge the params passed in and the default params. Thus the params which have default values needn't pass value, just like a function.
     *
     * @param   array $defaultParams     the default params defined by the method.
     * @param   array $passedParams      the params passed in through url.
     * @access  public
     * @return  array the merged params.
     */
    public function mergeParams($defaultParams, $passedParams)
    {
        /* Check params from URL. */
        foreach($passedParams as $param => $value)
        {
            if(preg_match('/[^a-zA-Z0-9_\.]/', $param)) die('Bad Request!');
        }

        $passedParams = array_values($passedParams);
        $i = 0;
        foreach($defaultParams as $key => $defaultValue)
        {
            if(isset($passedParams[$i]))
            {
                $defaultParams[$key] = $passedParams[$i];
            }
            else
            {
                if($defaultValue === '_NOT_SET') $this->triggerError("The param '$key' should pass value. ", __FILE__, __LINE__);
            }
            $i ++;
        }

        return $defaultParams;
    }

    /**
     * Pack the response.
     * 
     * @access public
     * @return void
     */
    public function packResponse()
    {
        $this->response->sid    = session_id();
        $this->response->module = $this->getModuleName();
        $this->response->method = $this->getMethodName();
        return helper::removeUTF8Bom(json_encode($this->response)) . $this->eof;
    }

    /**
     * Start session.
     * 
     * @access public
     * @return void
     */
    public function startSession()
    {
        session_id($this->setSessionID());
        session_start();
    }

    /**
     * Stop session.
     * 
     * @access public
     * @return void
     */
    public function stopSession()
    {
        session_write_close();
    }

    /**
     * Set the session id.
     * 
     * @access public
     * @return void
     */
    public function setSessionID()
    {
        if(!empty($this->request->sid)) return $this->request->sid;
        return md5(uniqid() . microtime() . mt_rand());
    }

    /**
     * 触发一个错误。
     * Trigger an error.
     * 
     * @param string    $message    错误信息      error message
     * @param string    $file       所在文件      the file error occers
     * @param int       $line       错误行        the line error occers
     * @param bool      $exit       是否停止程序  exit the program or not
     * @access public
     * @return void
     */
    public function triggerError($message, $file, $line, $exit = false)
    {
        /* Do not pass the param $exit to make sure the program won't exit. */
        parent::triggerError($message, $file, $line);
    }

    public function connectByPDO($params)
    {
        if(!isset($params->driver)) $this->log('no pdo driver defined, it should be mysql or sqlite', __FILE__, __LINE__);
        if(!isset($params->user)) return false;
        if($params->driver == 'mysql')
        {
            $dsn = "mysql:host={$params->host}; port={$params->port}; dbname={$params->name}";
        }    
        try 
        {
            $dbh = new PDO($dsn, $params->user, $params->password, array(PDO::ATTR_PERSISTENT => $params->persistant));
            $dbh->exec("SET NAMES {$params->encoding}");

            /*
             * 如果系统是Linux，开启仿真预处理和缓冲查询。
             * If run on linux, set emulatePrepare and bufferQuery to true.
             **/
            if(!isset($params->emulatePrepare) and PHP_OS == 'Linux') $params->emulatePrepare = true;
            if(!isset($params->bufferQuery) and PHP_OS == 'Linux')    $params->bufferQuery = true;

            $dbh->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_OBJ);
            $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            if(isset($params->strictMode) and $params->strictMode == false) $dbh->exec("SET @@sql_mode= ''");
            if(isset($params->emulatePrepare)) $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, $params->emulatePrepare);
            if(isset($params->bufferQuery))    $dbh->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, $params->bufferQuery);

            return $dbh;
        }
        catch (PDOException $exception)
        {
            $this->log($exception->getMessage(), __FILE__, __LINE__);
        }
    }

    /**
     * Save a log.
     * 
     * @param  string $log 
     * @param  string $file
     * @param  string $line
     * @access public
     * @return void
     */
    public function log($message, $file = '', $line = '')
    {
        $log = "\n" . date('H:i:s') . " $message";
        if($file) $log .= " in <strong>$file</strong>";
        if($line) $log .= " on line <strong>$line</strong> ";
        $file = $this->getLogRoot() . 'php.' . date('Ymd') . '.log.php';
        if(!is_file($file)) file_put_contents($file, "<?php\n die();\n?>\n");

        $fh = @fopen($file, 'a');
        if($fh) fwrite($fh, $log) && fclose($fh);

        echo $log; 
    }
}
