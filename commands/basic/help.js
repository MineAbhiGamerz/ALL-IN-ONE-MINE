const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');
const { serverConfigCollection } = require('../../mongodb');
const commandFolders = ['anime', 'basic', 'fun', 'moderation', 'utility', 'distube music', 'setups'];
const enabledCategories = config.categories;
const excessCommands = config.excessCommands;
const cmdIcons = require('../../UI/icons/commandicons');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of commands'),

    async execute(interaction) {
        if (interaction.isCommand && interaction.isCommand()) {

            const serverId = interaction.guildId;
            let serverConfig;
            try {
                serverConfig = await serverConfigCollection.findOne({ serverId });
            } catch (err) {
                console.error('Error fetching server configuration from MongoDB:', err);
            }

          
            const serverPrefix = serverConfig && serverConfig.prefix ? serverConfig.prefix : config.prefix;

            const createSlashCommandPages = () => {
                const pages = [];

                const totalServers = interaction.client.guilds.cache.size;
                const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                const uptime = process.uptime();
                const uptimeHours = Math.floor(uptime / 3600);
                const uptimeMinutes = Math.floor((uptime % 3600) / 60);
                const uptimeSeconds = Math.floor(uptime % 60);

                const enabledCategoriesList = Object.keys(enabledCategories).filter(category => enabledCategories[category]);
                const disabledCategoriesList = Object.keys(enabledCategories).filter(category => !enabledCategories[category]);

                
                const countJsFiles = (dir) => {
                    try {
                        if (fs.existsSync(dir)) {
                            return fs.readdirSync(dir).filter(file => file.endsWith('.js')).length;
                        }
                        return 0;
                    } catch (err) {
                        console.error(`Error reading directory ${dir}:`, err);
                        return 0;
                    }
                };
                
             
                const getDirectories = (src) => {
                    return fs.readdirSync(src).filter(file => fs.statSync(path.join(src, file)).isDirectory());
                };
                
              
                const commandsDir = path.join(__dirname, '../../commands');
                const excessCommandsDir = path.join(__dirname, '../../excesscommands');
                
             
                const commandFolders = getDirectories(commandsDir);
                const totalCommandFiles = commandFolders.reduce((total, folder) => {
                    const folderPath = path.join(commandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
           
                const excessCommandFolders = getDirectories(excessCommandsDir);
                const totalExcessCommandFiles = excessCommandFolders.reduce((total, folder) => {
                    const folderPath = path.join(excessCommandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
            
                const totalCommands = totalCommandFiles + totalExcessCommandFiles;
                

                pages.push({
                    title: 'Bot Information',
                    description: `Welcome to the help command! This bot provides a variety of commands to enhance your server experience. Below are the categories and the number of commands available in each.`,
                    commands: [
                        `**Bot Developer:** TEAM MINE\n`+
                        `**Bot Version:** 1.1.0\n`+
                        `**Total Servers:** ${totalServers}\n`+
                        `**Total Members:** ${totalMembers}\n`+
                        `**Bot Uptime:** ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n`+
                        `**Total Commands:** ${totalCommands}\n`+
                        `**Enabled Categories:** ${enabledCategoriesList.join(', ')}\n`+
                        `**Disabled Categories:** ${disabledCategoriesList.join(', ')}\n`,
                    ],
                    image: "https://cdn.discordapp.com/attachments/1322495380537212968/1323499993247645738/standard_2.gif?ex=6774bceb&is=67736b6b&hm=63bd3b0f0a64519f06f17f9d19531ed14f30cf0259c14a78e1fa286eb354e002&",
                    color: "#3498db",
                    thumbnail: "https://cdn.discordapp.com/attachments/1322495380537212968/1323501047779426385/30895ff2-0dfc-4100-ac37-0f4dd3d17e9c.gif?ex=6774bde7&is=67736c67&hm=00358d39a609c4462f70ee852cef589d546115a34a0a000ebe939526eb18e82e&",
                    author: {
                        name: 'TEAM MINE | AIO',
                        iconURL: "https://cdn.discordapp.com/attachments/1322495380537212968/1323501047779426385/30895ff2-0dfc-4100-ac37-0f4dd3d17e9c.gif?ex=6774bde7&is=67736c67&hm=00358d39a609c4462f70ee852cef589d546115a34a0a000ebe939526eb18e82e&",
                        url: "https://discord.gg/fZQUcabh6b"
                    }
                });

                const commandData = {};

                for (const folder of commandFolders) {

                    if (enabledCategories[folder]) { 
                        const commandFiles = fs.readdirSync(path.join(__dirname, `../../commands/${folder}`)).filter(file => file.endsWith('.js'));
                        commandData[folder] = commandFiles.map(file => {
                            const command = require(`../../commands/${folder}/${file}`);
                            return command.data.name;
                        });
                    }
                }

                for (const [category, commands] of Object.entries(commandData)) {
                    const page = {
                        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                        description: `**Total Commands : **${commands.length}\n` +
                            `**Usage : **Both Slash commands and Prefix\n\n` +
                            `${category.charAt(0).toUpperCase() + category.slice(1)} related commands`,
                        commands: commands.map(command => `\`\`${command}\`\``),
                        image: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&",
                        color: "#3498db",
                        thumbnail: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                        author: {
                            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                            iconURL: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                            url: "https://discord.gg/fZQUcabh6b"
                        }
                    };

                    switch (category) {
                        case 'anime':
                            page.image = "https://cdn.discordapp.com/attachments/1246408947708072027/1253714802048499752/1111.gif?ex=6676dc65&is=66758ae5&hm=9bc3f45ed4930d62def2369c6a27fdd65f24df0fdbe557a7ff7d330090eac1bf&";
                            page.color = "#ff66cc";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'basic':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#99ccff";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'fun':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ffcc00";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'moderation':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ff0000";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'utility':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#00cc99";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'distube music':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ff0000";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'setups':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ff0000";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        default:
                            page.color = "#3498db"; // Set a default color if none matches
                            break;
                    }

                    pages.push(page);
                }

                return pages;
            };

            const createPrefixCommandPages = () => {

                const pages = [];
                const totalServers = interaction.client.guilds.cache.size;
                const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
                const uptime = process.uptime();
                const uptimeHours = Math.floor(uptime / 3600);
                const uptimeMinutes = Math.floor((uptime % 3600) / 60);
                const uptimeSeconds = Math.floor(uptime % 60);

                const enabledCategoriesList = Object.keys(enabledCategories).filter(category => enabledCategories[category]);
                const disabledCategoriesList = Object.keys(enabledCategories).filter(category => !enabledCategories[category]);

                
                const countJsFiles = (dir) => {
                    try {
                        if (fs.existsSync(dir)) {
                            return fs.readdirSync(dir).filter(file => file.endsWith('.js')).length;
                        }
                        return 0;
                    } catch (err) {
                        console.error(`Error reading directory ${dir}:`, err);
                        return 0;
                    }
                };
                
             
                const getDirectories = (src) => {
                    return fs.readdirSync(src).filter(file => fs.statSync(path.join(src, file)).isDirectory());
                };
                
              
                const commandsDir = path.join(__dirname, '../../commands');
                const excessCommandsDir = path.join(__dirname, '../../excesscommands');
                
             
                const commandFolders = getDirectories(commandsDir);
                const totalCommandFiles = commandFolders.reduce((total, folder) => {
                    const folderPath = path.join(commandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
           
                const excessCommandFolders = getDirectories(excessCommandsDir);
                const totalExcessCommandFiles = excessCommandFolders.reduce((total, folder) => {
                    const folderPath = path.join(excessCommandsDir, folder);
                    return total + countJsFiles(folderPath);
                }, 0);
                
            
                const totalCommands = totalCommandFiles + totalExcessCommandFiles;
                pages.push({
                    title: 'Bot Information',
                    description: `Welcome to the help command! This bot provides a variety of commands to enhance your server experience. Below are the categories and the number of commands available in each.`,
                    commands: [
                        `**💜 Bot Developer:** <@1193934430872547363>\n`+
                        `**Bot Version:** 1.1.0\n`+
                        `**Total Servers:** ${totalServers}\n`+
                        `**Total Members:** ${totalMembers}\n`+
                        `**Bot Uptime:** ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s\n`+
                        `**Total Commands:** ${totalCommands}\n`+
                        `**Enabled Categories:** ${enabledCategoriesList.join(', ')}\n`+
                        `**Disabled Categories:** ${disabledCategoriesList.join(', ')}\n`,
                    ],
                    image: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&",
                    color: "#3498db",
                    thumbnail: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                    author: {
                        name: 'TM AIO',
                        iconURL: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                        url: "https://discord.gg/fZQUcabh6b"
                    }
                });

                const prefixCommands = {};

                for (const [category, isEnabled] of Object.entries(excessCommands)) {
                    if (isEnabled) {
                        const commandFiles = fs.readdirSync(path.join(__dirname, `../../excesscommands/${category}`)).filter(file => file.endsWith('.js'));
                        prefixCommands[category] = commandFiles.map(file => {
                            const command = require(`../../excesscommands/${category}/${file}`);
                            return {
                                name: command.name,
                                description: command.description
                            };
                        });
                    }
                }

                for (const [category, commands] of Object.entries(prefixCommands)) {
                    const page = {
                        title: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                        description: `**Total Commands : **${commands.length}\n` +
                            `**Usage : **Only Prefix commands with \`${serverPrefix}\`\n\n` +
                            `${category.charAt(0).toUpperCase() + category.slice(1)} related commands`,
                        commands: commands.map(command => `\`\`${command.name}\`\``),
                        image: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&",
                        color: "#FF0000",
                        thumbnail: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                        author: {
                            name: `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
                            iconURL: "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&",
                            url: "https://discord.gg/fZQUcabh6b"
                        }
                    };

                    switch (category) {
                        case 'utility':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#00cc99";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'other':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ff6600";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'hentai':
                            page.image = "https://cdn.discordapp.com/attachments/1246408947708072027/1255160148272353373/Rias.gif?ex=667c1e7b&is=667accfb&hm=cd9d086020fd0e062be92126942d1d683c15a878bb699b000d9db9a34447eb6c&";
                            page.color = "#ff99cc";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'lavalink':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#ffcc00";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        case 'troll':
                            page.image = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926945190416404/standard_6.gif?ex=676419f0&is=6762c870&hm=23f99ab208ee624e678e89a0569ca44d75c0e618b34469d03d5a4b8f38f20e88&";
                            page.color = "#cc0000";
                            page.thumbnail = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            page.author.iconURL = "https://cdn.discordapp.com/attachments/1318424638258417685/1318926777095290951/4297657_orig.gif?ex=676419c8&is=6762c848&hm=a47dbb7fd3d03f9088a0bfbea6d8e3b17c732dabbea711457d7b1d25eab19be6&";
                            break;
                        default:
                            page.color = "#3498db"; // Set a default color if none matches
                            break;
                    }

                    pages.push(page);
                }

                return pages;
            };

            const slashCommandPages = createSlashCommandPages();
            const prefixCommandPages = createPrefixCommandPages();
            let currentPage = 0;
            let isPrefixHelp = false;

            const createEmbed = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                const page = pages[currentPage];

                if (!page) {
                    console.error('Page is undefined');
                    return new EmbedBuilder().setColor('#3498db').setTitle('Error').setDescription('Page not found.');
                }

                const fieldName = page.title === "Bot Information" ? "Additional Information" : "Commands";

                // Ensure a valid color is always set
                const color = page.color || '#3498db';

                return new EmbedBuilder()
                    .setTitle(page.title)
                    .setDescription(page.description)
                    .setColor(color)
                    .setImage(page.image)
                    .setThumbnail(page.thumbnail)
                    .setAuthor({ name: page.author.name, iconURL: page.author.iconURL, url: page.author.url })
                    .addFields({ name: fieldName, value: page.commands.join(', ') });
            };

            const createActionRow = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous1')
                            .setLabel('Previous')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next2')
                            .setLabel('Next')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === pages.length - 1),
                        new ButtonBuilder()
                            .setCustomId('prefix')
                            .setLabel(isPrefixHelp ? 'Normal Command List' : 'Excess Command List')
                            .setStyle(ButtonStyle.Secondary)
                    );
            };

            const createDropdown = () => {
                const pages = isPrefixHelp ? prefixCommandPages : slashCommandPages;
                return new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('page-select')
                            .setPlaceholder('Select a page')
                            .addOptions(pages.map((page, index) => ({
                                label: page.title,
                                value: index.toString()
                            })))
                    );
            };

            await interaction.reply({ embeds: [createEmbed()], components: [createDropdown(), createActionRow()] });

            const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

            collector.on('collect', async (button) => {
                if (button.user.id !== interaction.user.id) return;

                if (button.isButton()) {
                    if (button.customId === 'previous1') {
                        currentPage = (currentPage - 1 + (isPrefixHelp ? prefixCommandPages : slashCommandPages).length) % (isPrefixHelp ? prefixCommandPages : slashCommandPages).length;
                    } else if (button.customId === 'next2') {
                        currentPage = (currentPage + 1) % (isPrefixHelp ? prefixCommandPages : slashCommandPages).length;
                    } else if (button.customId === 'prefix') {
                        isPrefixHelp = !isPrefixHelp;
                        currentPage = 0;
                    }
                } else if (button.isSelectMenu()) {
                    currentPage = parseInt(button.values[0]);
                }

                try {
                    await button.update({ embeds: [createEmbed()], components: [createDropdown(), createActionRow()] });
                } catch (error) {
                    //console.error('Error updating the interaction:', error);
                }
            });

            collector.on('end', async () => {
                try {
                    await interaction.editReply({ components: [] });
                } catch (error) {
                    //console.error('Error editing the interaction reply:', error);
                }
            });
           }   else {
                const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({ 
                    name: "Alert!", 
                    iconURL: cmdIcons.dotIcon ,
                    url: "https://discord.gg/fZQUcabh6b"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/help`')
                .setTimestamp();
            
                await interaction.reply({ embeds: [embed] });
            
                } 
    }
};
