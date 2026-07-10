"""
config_reader.py - Reads configuration from config.ini and .env files.
"""
import configparser
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()


class ConfigReader:
    """Singleton configuration reader for the test framework."""

    _config = None

    @classmethod
    def _load_config(cls):
        if cls._config is None:
            cls._config = configparser.ConfigParser()
            config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.ini")
            cls._config.read(config_path)
        return cls._config

    @classmethod
    def get(cls, section, key, fallback=None):
        """Get a config value by section and key."""
        config = cls._load_config()
        return config.get(section, key, fallback=fallback)

    @classmethod
    def get_base_url(cls):
        return cls.get("application", "base_url")

    @classmethod
    def get_browser(cls):
        return cls.get("browser", "name", fallback="chrome")

    @classmethod
    def is_headless(cls):
        return cls.get("browser", "headless", fallback="false").lower() == "true"

    @classmethod
    def get_implicit_wait(cls):
        return int(cls.get("timeouts", "implicit_wait", fallback="10"))

    @classmethod
    def get_explicit_wait(cls):
        return int(cls.get("timeouts", "explicit_wait", fallback="15"))

    @classmethod
    def get_page_load_timeout(cls):
        return int(cls.get("timeouts", "page_load_timeout", fallback="30"))

    @classmethod
    def get_valid_username(cls):
        return cls.get("test_data", "valid_username")

    @classmethod
    def get_valid_password(cls):
        return cls.get("test_data", "valid_password")

    @classmethod
    def get_locked_username(cls):
        return cls.get("test_data", "locked_username")

    @classmethod
    def get_problem_username(cls):
        return cls.get("test_data", "problem_username")

    @classmethod
    def get_execution_mode(cls):
        return os.getenv("EXECUTION_MODE", "local").lower()

    @classmethod
    def get_sauce_username(cls):
        return os.getenv("SAUCE_USERNAME", "")

    @classmethod
    def get_sauce_access_key(cls):
        return os.getenv("SAUCE_ACCESS_KEY", "")

    @classmethod
    def is_sauce_enabled(cls):
        return cls.get_execution_mode() == "sauce"
