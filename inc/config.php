<?php
class Config {
	private static $modules = [];
	private static $db = [];
	private static $css = [];
	private static $menu = [];
	static function init() {
		// Required modules
		self::$db["dsn"] = "mysql:host=localhost;dbname=modiweb";
		self::$db["user"] = "root";
		self::$db["pass"] = "";
		//self::$db["dsn"] = "mysql:host=localhost;dbname=etqwxiwh_db";self::$db["user"] = "etqwxiwh_admin";self::$db["pass"] = "=0211dave";
		
		//self::$css["theme"] = "theme.css";
		
		self::$menu["orientation"] = "horizontal";
		
		// Other modules
		//array_push(self::$modules, "base");
		array_push(self::$modules, "msg");
		array_push(self::$modules, "browsercheck");
		array_push(self::$modules, "sql");
		array_push(self::$modules, "log");
		array_push(self::$modules, "statistics");
		array_push(self::$modules, "elements");
		array_push(self::$modules, "page");
		array_push(self::$modules, "users");
		
		self::loadModules();
	}
	private static function loadModules() {
		foreach(self::$modules as $k => $v) {
			ModuleManifest::load($v);
		}
	}
	public static function getDB() {
		return self::$db;
	}
	public static function getCSS($style = NULL) {
		if(isset(self::$css[$style])) {
			return self::$css[$style];
		} else {
			return false;
		}
	}
	public static function getMenu() {
		return self::$menu;
	}
	public static function getConfig($key = "all") {
		return sql::get("SELECT val FROM config_site WHERE name = '".$key."'")["val"];
	}
}
Config::init();