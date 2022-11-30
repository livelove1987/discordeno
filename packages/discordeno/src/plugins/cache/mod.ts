import { Bot, Collection, DiscordGuildEmojisUpdate } from './deps.js'
import { addCacheCollections, BotWithCache } from './src/addCacheCollections.js'
import { setupCacheEdits } from './src/setupCacheEdits.js'
import { setupCacheRemovals } from './src/setupCacheRemovals.js'

// PLUGINS MUST TAKE A BOT ARGUMENT WHICH WILL BE MODIFIED
export function enableCachePlugin<B extends Bot = Bot>(rawBot: B): BotWithCache<B> {
  // MARK THIS PLUGIN BEING USED
  rawBot.enabledPlugins.add('CACHE')

  // CUSTOMIZATION GOES HERE
  const bot = addCacheCollections(rawBot)

  // Get the unmodified transformer.
  const { guild, user, member, channel, message, presence, role } = bot.transformers
  // Override the transformer
  bot.transformers.guild = function (_, payload) {
    // Run the unmodified transformer
    const result = guild(bot, payload)
    // Cache the result
    if (result) {
      bot.guilds.set(result.id, result)

      const channels = (payload.guild.channels != null) || []

      channels.forEach((channel) => {
        bot.transformers.channel(bot, { channel, guildId: result.id })
      })

      payload.guild.members?.forEach((member) => {
        bot.transformers.member(bot, member, result.id, bot.transformers.snowflake(member.user!.id))
      })
    }

    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.user = function (...args) {
    // Run the unmodified transformer
    const result = user(...args)
    // Cache the result
    if (result) {
      bot.users.set(result.id, result)
    }
    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.member = function (...args) {
    // Run the unmodified transformer
    const result = member(...args)
    // Cache the result
    if (result) {
      bot.members.set(
        bot.transformers.snowflake(`${result.id}${result.guildId}`),
        result
      )
    }
    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.channel = function (...args) {
    // Run the unmodified transformer
    const result = channel(...args)
    // Cache the result
    if (result) {
      bot.channels.set(result.id, result)
    }
    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.message = function (_, payload) {
    // Run the unmodified transformer
    const result = message(bot, payload)
    // Cache the result
    if (result) {
      bot.messages.set(result.id, result)
      // CACHE THE USER
      const user = bot.transformers.user(bot, payload.author)
      bot.users.set(user.id, user)

      if (payload.guild_id && (payload.member != null)) {
        const guildId = bot.transformers.snowflake(payload.guild_id)
        // CACHE THE MEMBER
        bot.members.set(
          bot.transformers.snowflake(`${payload.author.id}${payload.guild_id}`),
          bot.transformers.member(bot, payload.member, guildId, user.id)
        )
      }
    }

    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.presence = function (...args) {
    // Run the unmodified transformer
    const result = presence(...args)
    // Cache the result
    if (result) {
      bot.presences.set(result.user.id, result)
    }
    // Return the result
    return result
  }

  // Override the transformer
  bot.transformers.role = function (...args) {
    // Run the unmodified transformer
    const result = role(...args)
    // Cache the result
    if (result) {
      bot.guilds.get(result.guildId)?.roles.set(result.id, result)
    }
    // Return the result
    return result
  }

  const { GUILD_EMOJIS_UPDATE } = bot.handlers
  bot.handlers.GUILD_EMOJIS_UPDATE = function (_, data, shardId) {
    const payload = data.d as DiscordGuildEmojisUpdate

    const guild = bot.guilds.get(bot.transformers.snowflake(payload.guild_id))
    if (guild != null) {
      guild.emojis = new Collection(payload.emojis.map((e) => {
        const emoji = bot.transformers.emoji(bot, e)
        return [emoji.id!, emoji]
      }))
    }

    GUILD_EMOJIS_UPDATE(bot, data, shardId)
  }

  setupCacheRemovals(bot)
  setupCacheEdits(bot)

  // PLUGINS MUST RETURN THE BOT
  return bot
}

export default enableCachePlugin
export * from './src/addCacheCollections.js'
export * from './src/dispatchRequirements.js'
export * from './src/setupCacheEdits.js'
export * from './src/setupCacheRemovals.js'
export * from './src/sweepers.js'

