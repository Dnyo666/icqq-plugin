import "./model/cmd.js"
import fetch from "node-fetch"
import { createClient } from "icqq"
import _Yaml from "./model/yaml.js"
import { execSync } from "child_process"
import { event } from "./model/cmd.js"
import { update } from "../other/update.js"
import common from "../../lib/common/common.js"
import { _path, sign_api_addr, data_dir } from "./model/config.js"

/** 登录验证使用到~ */
let login = {}

export class ICQQ_ extends plugin {
    constructor() {
        super({
            name: "ICQQ",
            dsc: "ICQQ适配器",
            event: "message",
            priority: 1,
            rule: [
                {
                    reg: /^#QQ登录[01][:：][126][:：][1-9]\d{4,10}[:：][A-Za-z0-9\S]{6,16}([:：].*)?/i,
                    fnc: "qq",
                    permission: "master"
                },
                {
                    reg: /^#QQ账号((启用|禁用|删除).+)?$/i,
                    fnc: "delQQ",
                    permission: "master"
                },
                {
                    reg: /^#ICQQ(强制)?更新(日志)?$/gi,
                    fnc: "update",
                    permission: "master"
                },
            ]
        })
    }

    async qq(e) {
        const cfg = e.msg.replace(/#QQ|账号|登录|启用|\+/g, "").replace(/：/g, ":").trim().split(':')

        /** 过滤自身消息 */
        const ignore_self = Number(cfg[0])
        /** 登录平台 */
        const platform = Number(cfg[1])
        /** QQ账号 */
        const account = Number(cfg[2])
        /** QQ密码 */
        const password = String(cfg[3])
        /** 签名地址 */
        const sign = cfg[4] ? String(cfg.slice(4).join(':')) : null

        /** 先检查配置是否存在此账号 */
        const config = new _Yaml(_path + "/config.yaml")
        const accountList = await config.get("account")
        if (!e.msg.includes("账号启用") && accountList && Array.isArray(accountList)) {
            for (let i of accountList) {
                const arr = i.trim().split(':')
                if (arr[2] == account) {
                    return e.reply(`账号已存在，请先执行「#删除${account}」`)
                }
            }
        }

        /** 保存到配置文件 */
        let newCfg = `${ignore_self}:${platform}:${account}:${password}`
        if (sign) newCfg = newCfg + `:${sign}`
        if (!e.msg.includes("账号启用")) config.addVal("account", newCfg)

        /** 传递参数 */
        let bot = createClient({
            platform,
            data_dir: data_dir + `/${account}`,
            ignore_self: Boolean(ignore_self),
            sign_api_addr: sign ? sign : sign_api_addr
        })

        /** 将日志修改为本体的 */
        bot.logger = logger

        /** 滑块验证 */
        bot.on('system.login.slider', async (data) => {
            let ticket
            const url = data.url
            let req = `https://hlhs-nb.cn/captcha/slider?key=${data.self_id}`
            try {
                await fetch(req, {
                    method: 'POST',
                    body: JSON.stringify({ url })
                })
            } catch (error) {
                return e.reply(error.message)
            }

            await e.reply("----请打开下方链接并在2分钟内进行验证----\n----完成后将自动进行登录----", true)
            await e.reply(req)

            for (let i = 0; i < 40; i++) {
                let res
                try {
                    res = await fetch(req, {
                        method: 'POST',
                        body: JSON.stringify({ submit: data.self_id })
                    })

                } catch (error) {
                    e.reply(error.message)
                    break
                }

                res = await res.json()
                if (res.data?.ticket) {
                    ticket = res.data.ticket
                    break
                }
                await common.sleep(3000)
            }

            /** 处理自动获取失败，告知用户重启手动验证 */
            if (!ticket) {
                return await e.reply(data.self_id + "：自动获取 ticket 失败，请自行重启前往控制台手动验证")
            } else {
                await e.reply(data.self_id + "：获取成功...正在进行登录...请稍候...")
                await bot.submitSlider(ticket.toString().trim())
            }

        })
        /** 安全验证 */
        bot.on('system.login.device', async (data) => {
            /** 开始监听下文 */
            login[e.user_id] = { bot, data, verify: null, number: 1 }
            this.setContext("device")
            await e.reply("触发设备锁验证，请选择验证方式:\n\n请输入序号~\n1.网页扫码验证\n2.发送短信验证码到密保手机")
            await common.sleep(200)
        })

        /** 监听错误 */
        bot.on("system.login.error", async data => {
            logger.error(data)
            /** 删除配置账号 */
            config.delVal("account", newCfg)
            const { code, message } = data
            const msg = code && message ? `----登录失败----\n账号：${data.self_id}\ncode：${code}\n${message}` : JSON.stringify(data)
            return await e.reply(msg, true)
        })

        /** 登录 */
        await bot.login(account, password)

        /** 监听事件 */
        await event(bot)

        /** 上线成功 */
        bot.on("system.online", async data => {
            await e.reply(`${data.self_id}：登录成功~`, true)
        })
    }

    async delQQ(e) {
        /** 先检查配置是否存在此账号 */
        const config = new _Yaml(_path + "/config.yaml")
        const accountList = await config.get("account")
        const disabletList = await config.get("disable")
        if (!(accountList && Array.isArray(accountList)) && !(disabletList && Array.isArray(disabletList)))
            return e.reply("你还没有账号哦~", true)

        let account
        let disable
        const msg = e.msg.replace(/#QQ账号|启用|禁用|删除/g, "")

        if (accountList && Array.isArray(accountList)) {
            for (let i of accountList) {
                if (!i) continue
                if (i.trim().split(':')[2] == msg) account = i; break
            }
        }

        if (disabletList && Array.isArray(disabletList)) {
            for (let i of disabletList) {
                if (!i) continue
                if (i.trim().split(':')[2] == msg) disable = i; break
            }
        }

        if (e.msg.includes("启用")) {
            if (!disable) return e.reply("没有这个账号~", true)
            config.delVal("disable", disable)
            config.addVal("account", disable)
            e.msg = "#QQ账号启用" + disable
            await this.qq(e)
        }
        else if (e.msg.includes("禁用")) {
            if (!account) return e.reply("没有这个账号~", true)
            config.delVal("account", account)
            config.addVal("disable", account)
        }
        else if (e.msg.includes("删除")) {
            if (!account) return e.reply("没有这个账号~", true)
            config.delVal("account", account)
        }

        let whitelist = await config.get("account") || []
        let blacklist = await config.get("disable") || []
        whitelist = `已启用账号：\n${whitelist.join('\n')}`
        blacklist = `已禁用账号：\n${blacklist.join('\n')}`
        const tips = "启用账号：#QQ账号启用123456789\n禁用账号：#QQ账号禁用123456789\n删除账号：#QQ账号删除123456789\n\n温馨提示：禁用、删除指定账号后需要重新登陆方可生效~"
        e.reply(`${whitelist}\n\n${blacklist}\n\n${tips}`)
        return true
    }

    async update(e) {
        let new_update = new update()
        new_update.e = e
        new_update.reply = this.reply
        const name = "icqq-plugin"
        if (e.msg.includes("更新日志")) {
            if (new_update.getPlugin(name)) {
                this.e.reply(await new_update.getLog(name))
            }
        } else {
            if (new_update.getPlugin(name)) {
                if (this.e.msg.includes('强制'))
                    execSync('git reset --hard', { cwd: `${process.cwd()}/plugins/${name}/` })
                await new_update.runUpdate(name)
                if (new_update.isUp)
                    setTimeout(() => new_update.restart(), 2000)
            }
        }
        return true
    }


    async device() {
        const { bot, data, verify, number } = login[this.e.user_id]

        /** 做一个限制，否则会无限循环~ */
        if (number && number > 2) {
            this.finish("device")
            return this.reply("输入错误次数过多...已停止登录")
        }

        /** 判断有没有选择验证方法 */
        if (!verify) {
            if (Number(this.e.msg) === 1) {
                login[this.e.user_id].verify = 1
                await this.reply(`请打开以下连接，完成验证\n完成验证后请回复 完成验证 \n\n${data.url}`)
            } else {
                login[this.e.user_id].verify = 2
                await bot.sendSmsCode()
                await common.sleep(200)
                logger.info(`验证码已发送：${data.phone}\n`)
                await this.reply(`验证码已发送，请输入收到的验证码~`)
            }
        } else {
            if (Number(verify) === 1 && this.e.msg.includes("完成验证")) {
                this.finish("device")
                await bot.login()
            } else if (Number(verify) === 2 && Number(this.e.msg) && Number(this.e.msg).toString().length == 6) {
                this.finish("device")
                await this.reply("已收到验证码，正在登录中...", true)
                await bot.submitSmsCode(Number(this.e.msg))
            } else {
                await this.reply("输入错误，请检查你输入的是否为「6位验证码」或者「完成验证」")
                login[this.e.user_id].number++
            }
        }
    }
}


