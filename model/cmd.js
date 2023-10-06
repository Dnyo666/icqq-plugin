import icqq from "./loader.js"
import login from "./login.js"
import { createClient } from "icqq"
import { sign_api_addr, cfg, data_dir } from "./config.js"
import pluginsLoader from "../../../lib/plugins/loader.js"

/** 加载机器人~ */
if (cfg) await parameter(cfg)

/** 获取基础参数 */
async function parameter(cfg) {
    /** 非可迭代停止 */
    if (!Array.isArray(cfg.account)) return

    for (const i of cfg.account) {
        const BotCfg = i.replace(/：/g, ":").split(":")
        /** 检查参数是否达到最低标准 不足则跳过当前账号 */
        if (BotCfg.length < 4) {
            return logger.error(`当前账号配置错误，请检查。${BotCfg[1]}`)
        }

        /** 登录平台 */
        const platform = Number(BotCfg[1])

        /** 判断平台 */
        if (!/1|2|6/.test(platform)) {
            return logger.error(`QQ使用了不支持的协议，已跳过登录。${BotCfg[1]}`)
        }

        /** QQ账号 */
        const account = Number(BotCfg[2])
        /** QQ密码 */
        const password = String(BotCfg[3])
        /** 过滤自身消息 */
        const ignore_self = Boolean(BotCfg[0])
        /** 签名地址 */
        const sign = BotCfg[4] ? String(BotCfg.slice(4).join(':')) : null
        /** 传递参数 */
        let bot = createClient({
            platform,
            ignore_self,
            data_dir: data_dir + `/${account}`,
            sign_api_addr: sign ? sign : sign_api_addr
        })
        /** 将日志修改为本体的 */
        bot.logger = logger

        /** 储存qq */
        bot.qq = account

        /** 滑块验证 */
        bot.on('system.login.slider', async (e) => {
            await login.slider(e, bot)
        })
        /** 安全验证 */
        bot.on('system.login.device', async (e) => {
            await login.device(e, bot)
        })

        /** 监听错误 */
        bot.on("system.login.error", async e => {
            await login.error(e)
        })

        /** 登录 */
        bot.login(account, password)

        /** 监听事件 */
        await event(bot)
    }
}

/** 监听事件 */
export async function event(bot) {
    /** 监听消息 */
    bot.on("message", async e => {
        await icqq.deal.call(pluginsLoader, e, bot)
    })
    /** 监听群聊消息 */
    bot.on("notice", async e => {
        await icqq.deal.call(pluginsLoader, e, bot)
    })
    /** 监听群聊消息 */
    bot.on("request", async e => {
        await icqq.deal.call(pluginsLoader, e, bot)
    })
    /** 上线成功 */
    bot.on("system.online", async e => {
        logger.info(`Bot：${bot.nickname}(${e.self_id})登录成功！正在加载资源...`)

        /** 加载参数用于主动消息~ */
        const entries = bot.gl.entries()
        for (let [key, value] of entries) {
            key = `qq_${key}`
            value.uin = e.self_id
            Bot.gl.set(key, value)
        }

        /** 加载参数用于主动消息~ */
        const Entries = bot.fl.entries()
        for (let [key, value] of Entries) {
            key = `qq_${key}`
            value.uin = e.self_id
            Bot.fl.set(key, value)
        }

        /** 椰奶状态pro */
        if (!Bot?.adapter) {
            Bot.adapter = [Bot.uin]
            Bot.adapter.push(e.self_id)
        } else {
            Bot.adapter.push(e.self_id)
            /** 去重防止断连后出现多个重复的id */
            Bot.adapter = Array.from(new Set(Bot.adapter.map(JSON.stringify))).map(JSON.parse)
        }
        Bot[e.self_id] = bot
    })
    /** 监听下线事件 */
    bot.on("system.offline", async e => {
        logger.error(`Bot：${nickname}(${e.self_id})掉线了...`)
    })
}



