package com.automation.framework.utils;

import com.automation.framework.constants.FrameworkConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.File;
import java.io.IOException;

public class JsonUtils {

    public static Object[][] getTestData(String jsonNodeKey) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(new File(FrameworkConstants.TEST_DATA_PATH));
            JsonNode dataNode = rootNode.get(jsonNodeKey);

            if (dataNode == null) {
                return new Object[][]{};
            }

            String username = dataNode.get("username").asText();
            String password = dataNode.get("password").asText();

            return new Object[][]{{username, password}};

        } catch (IOException e) {
            e.printStackTrace();
            return new Object[][]{};
        }
    }
}
