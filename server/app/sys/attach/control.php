<?php
class attach extends control
{
    /**
     * Upload files for an object.
     * 
     * @access public
     * @return object
     */
    public function upload()
    {
        $gid    = $_POST['gid'];
        $chatID = $this->dao->select('id')->from(TABLE_IM_CHAT)->where('gid')->eq($gid)->fetch('id');
        $files  = $this->loadModel('file')->saveUpload('chat', $chatID);

        $response = new stdclass();
        $response->module = $this->moduleName;
        $response->method = $this->methodName;
        
        if($files)
        {
            $fileList = array();
            foreach($files as $id => $title)
            {
                $file = new stdclass();
                $file->id    = $id;
                $file->title = $title;

                $fileList[] = $file;
            }
            $response->result = 'success';
            $response->data   = $fileList;
        }
        else
        {
            $response->result  = 'fail';
            $response->message = 'Upload file failed.';
        }

        die(json_encode($response));
    }

    /**
     * Down a file.
     * 
     * @param  int    $fileID 
     * @param  string $mouse 
     * @access public
     * @return void
     */
    public function download($fileID, $mouse = '')
    {
        die($this->fetch('file', 'download', "fileID=$fileID&module=$mouse"));
    }
}
