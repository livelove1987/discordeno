import { BotWithCache, ChannelTypes } from '../../../deps.js'
import { requireBotChannelPermissions } from '../../permissions.js'

export function editStageInstance(bot: BotWithCache) {
  const editStageInstance = bot.helpers.editStageInstance

  bot.helpers.editStageInstance = async function (channelId, data) {
    const channel = bot.channels.get(bot.transformers.snowflake(channelId))
    if ((channel != null) && channel.type !== ChannelTypes.GuildStageVoice) {
      throw new Error('Channel must be a stage voice channel')
    }

    requireBotChannelPermissions(bot, bot.transformers.snowflake(channelId), [
      'VIEW_CHANNEL',
      'CONNECT',
      'MANAGE_CHANNELS',
      'MUTE_MEMBERS',
      'MOVE_MEMBERS'
    ])

    return await editStageInstance(channelId, data)
  }
}
