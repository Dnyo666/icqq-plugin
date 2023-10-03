import fs from "fs"
import Yaml from "yaml"

const _path = "./plugins/icqq-plugin/config"

/** 检查配置文件是否存在 */
if (!fs.existsSync(_path + "/config.yaml")) {
    fs.copyFileSync(_path + "/defSet/config.yaml", _path + "/config.yaml")
}

const cfg = Yaml.parse(fs.readFileSync(_path + "/config.yaml", "utf8"))
const sign_api_addr = String(cfg.sign_api_addr)
const data_dir = process.cwd() + "/data/icqq"

export { _path, sign_api_addr, cfg, data_dir }