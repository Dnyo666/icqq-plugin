QQ交流群~欢迎加入：`884587317`

- 如果您对这个项目感到满意并认为它对你有所帮助，请给我一个`Star`！

- 您的认可是我持续更新的动力~非常感谢您的支持！

![Visitor Count](https://profile-counter.glitch.me/Zyy955-icqq-plugin/count.svg)


## 安装插件

在`Yunzai-Bot`根目录执行，任选其一

Gitee：
```
git clone --depth=1 https://gitee.com/Zyy955/icqq-plugin ./plugins/icqq-plugin
```

Github：
```
git clone --depth=1 https://github.com/Zyy955/icqq-plugin ./plugins/icqq-plugin
```

## 配置`qsign`地址

插件提供两种`qsign`配置方法

#### 1.`通用qsign`

`通用qsign`的作用是，如果你的账号参数中没有单独配置`qsign`，则会调用`通用qsign`。

如果你为每个账号都配置了单独的`qsign`，请无视这里。

配置方法：前往`plugins/icqq-plugin/config/config.yaml`，修改`sign_api_addr`的值。

#### 2.账号指定`qsign`

在你的每个QQ机器人参数中，你可以为每一个账号指定一个qsign地址，详细使用请看下方。

## 使用说明：

* 手动配置：
  * 请前往`plugins/icqq-plugin/config/config.yaml`自行查看配置~
  * 新增配置之后，请重启！重启之后！！！请观察控制台日志，按照你第一次在云崽登录QQ一样进行验证！
  * 因为是插件包的原因，这里不再进行阻断控制台的输出，不会有任何影响，请自行验证即可。

* 使用指令：
  * `过滤自身消息`：开启(1)、关闭(0)
  * `登录平台`：1:安卓手机、2:安卓平板、3:安卓手表、4:MacOS、5:iPad、6:Tim3.5.1
  * `QQ账号`
  * `QQ密码`
  * `签名地址(可选)`
  * 组合：`过滤自身消息:登录平台:QQ账号:QQ密码:签名地址(可选)`

* 温馨提示：
  * 如果账号参数中配置了`qsign`地址，则登录时会优先使用账号中的，如不配置，则会使用`通用qsign`
  * 由于目前`qsign`只支持126这三种登录平台，本插件目前也是仅支持这三种。
  * 

组合后得到以下例子。

```
#QQ登录1:2:1234567890:abc123
或
#QQ登录1:2:0987654321:abc123:http://127.0.0.1:8080/sign?key=114514

#QQ登录过滤自身消息:登录平台:QQ账号:QQ密码:签名地址(可选)
```

```
其他指令：
#QQ账号
#QQ账号禁用+QQ号
#QQ账号删除+QQ号
#QQ账号启用+QQ号
```

#### 适配进度

- [√] 基础消息收发
- [ ] 主动消息
- [ ] 适配QQ登录QQ时，剩余两种获取`ticket`方式


## 爱发电

![爱发电](https://cdn.jsdelivr.net/gh/Zyy955/imgs/img/202308271209508.jpeg)



## 鸣谢

| 名称              | 作者                                        | GitHub                                                           | Gitee                                                          | 备注               |
| ----------------- | ------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| Yunzai-Bot        | [@Le-niao](https://gitee.com/Le-niao)       | [☞GitHub](https://github.com/Le-niao/Yunzai-Bot)                 | [☞Gitee](https://gitee.com/Le-niao/Yunzai-Bot)                 | 原版 Yunzai        |
| Yunzai-Bot        | [@喵喵](https://gitee.com/yoimiya-kokomi)   | [☞GitHub](https://github.com/yoimiya-kokomi/Yunzai-Bot)          | [☞Gitee](https://gitee.com/yoimiya-kokomi/Yunzai-Bot)          | 喵喵维护版 Yunzai  |
| Miao-Yunzai       | [@喵喵](https://gitee.com/yoimiya-kokomi)   | [☞GitHub](https://github.com/yoimiya-kokomi/Miao-Yunzai)         | [☞Gitee](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)         | 喵版 Yunzai        |
| Yunzai-Bot 索引库 | [@渔火Arcadia](https://gitee.com/yhArcadia) | [☞GitHub](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) | [☞Gitee](https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index) | 云崽相关内容索引库 |

## 免责声明：
使用此插件产生的一切后果与本人均无关

请不要用于任何商业性行为

插件所有资源都来自互联网，侵删