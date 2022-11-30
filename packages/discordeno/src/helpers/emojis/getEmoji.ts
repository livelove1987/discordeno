import type { Bot } from '../../bot.js'
import { Emoji } from '../../transformers/emoji.js'
import { DiscordEmoji } from '../../types/discord.js'
import { BigString } from '../../types/shared.js'

/**
 * Gets an emoji by its ID.
 *
 * @param bot - The bot instance to use to make the request.
 * @param guildId - The ID of the guild from which to get the emoji.
 * @param emojiId - The ID of the emoji to get.
 * @returns An instance of {@link Emoji}.
 *
 * @see {@link https://discord.com/developers/docs/resources/emoji#get-guild-emoji}
 */
export async function getEmoji(bot: Bot, guildId: BigString, emojiId: BigString): Promise<Emoji> {
  const result = await bot.rest.runMethod<DiscordEmoji>(
    bot.rest,
    'GET',
    bot.constants.routes.GUILD_EMOJI(guildId, emojiId)
  )

  return bot.transformers.emoji(bot, result)
}
