package com.automation.framework.constants;

import java.io.File;

public class FrameworkConstants {
    public static final String PROJECT_PATH = System.getProperty("user.dir");
    public static final String CONFIG_FILE_PATH = PROJECT_PATH + File.separator + "src" + File.separator + "test" + File.separator + "resources" + File.separator + "config.properties";
    public static final String TEST_DATA_PATH = PROJECT_PATH + File.separator + "src" + File.separator + "test" + File.separator + "resources" + File.separator + "testdata.json";
    public static final String REPORTS_FOLDER_PATH = PROJECT_PATH + File.separator + "reports";
    public static final String SCREENSHOTS_FOLDER_PATH = PROJECT_PATH + File.separator + "screenshots";
    
    public static final int EXPLICIT_WAIT_TIMEOUT = 10;
}
