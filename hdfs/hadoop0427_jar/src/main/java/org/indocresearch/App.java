package org.indocresearch;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;

import java.io.File;
import java.io.IOException;
import java.net.URI;

public class App {
    public static void main( String[] args ) throws IOException {
        // todo: action is one of upload, createstudy, etc, we can make it an enum
        String action = args[0];
        String username = args[1];
        String project = args[2];
        String fullFilePath = args[3];
        String HDFS_URI = "hdfs://10.3.9.241:9000/";
        String filename = getFileName(fullFilePath);


        // ====== Init HDFS File System Object
        Configuration conf = new Configuration();
        // Set FileSystem URI. HDFS URI are like that : hdfs://namenodedns:port/user/hdfs/folder/file.csv
        conf.set("fs.defaultFS", HDFS_URI);
        // Because of Maven
        conf.set("fs.hdfs.impl", org.apache.hadoop.hdfs.DistributedFileSystem.class.getName());
        conf.set("fs.file.impl", org.apache.hadoop.fs.LocalFileSystem.class.getName());
        // Set HADOOP user
        System.setProperty("HADOOP_USER_NAME", username);
        System.setProperty("hadoop.home.dir", "/");

        //Get the filesystem - HDFS
        FileSystem fs = FileSystem.get(URI.create(HDFS_URI), conf);

        //==== Create folder if not exists
        Path workingDir=fs.getWorkingDirectory();
        Path newFolderPath= new Path(project);
        if(!fs.exists(newFolderPath)) {
            // Create new Directory
            fs.mkdirs(newFolderPath);
        }

        Path hdfsPath = new Path(newFolderPath + "/" + filename);
        fs.copyFromLocalFile(new Path(fullFilePath), hdfsPath);

    }

    private static String getFileName(String path){
        File f = null;
        String v;
        boolean bool = false;
        f = new File(path);
        v = f.getName();
        bool = f.exists();
        if(bool) {
            return v;
        }else{
            return "file does not exist";
            // todo throw a exception instead
        }
    }
}
