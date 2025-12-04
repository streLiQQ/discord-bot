import { SlashCommandBuilder } from 'discord.js';

// Creates an Object in JSON with the data required by Discord's API to create a SlashCommand
const create = () => {
	const command = new SlashCommandBuilder()
		.setName('taramsg')
		.setDescription('Fais parler Tara directement!')
		.addStringOption((option) =>
			option.setName('message').setDescription('Tape le message à envoyer!').setRequired(true)
		);

	return command.toJSON();
};

// Called by the interactionCreate event listener when the corresponding command is invoked
const invoke = (interaction) => {
    const message = interaction.options.getString('message');

    if (message) {
        // Sending the message directly to the channel
        interaction.channel.send(message);
    } else {
        // If no message is provided, reply with an ephemeral message
        interaction.reply({
            content: 'Aucun message trouvé!',
            ephemeral: true,
        });
    }
};

export { create, invoke };
