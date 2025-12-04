import {} from 'dotenv/config';
import fs from 'fs';
import { EmbedBuilder, Client, GatewayIntentBits, Events } from 'discord.js';
import cheerio from 'cheerio';

const weatherKey = process.env.WEATHER_API;

// Create a new Client with the Guilds intent
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent]
});

// Fetch all js files in ./events
const events = fs
    .readdirSync('./events')
    .filter((file) => file.endsWith('.js'));

// Check for an event and execute the corresponding file in ./events
for (let event of events) {
    // The #events ES6 import-abbreviation is defined in the package.json
    // Note that the entries in the list of files (created by readdirSync) end with .js,
    // so the abbreviation is different to the #commands abbreviation
    const eventFile = await import(`#events/${event}`);
    // But first check if it's an event emitted once
    if (eventFile.once)
        client.once(eventFile.name, (...args) => {
            eventFile.invoke(...args);
        });
    else
        client.on(eventFile.name, (...args) => {
            eventFile.invoke(...args);
        });
}

// Login with the environment data
client.login(process.env.BOT_TOKEN);

/////////////////////////////////////VACANCES RANDOMIZE//////////////////////////////////////////

// Msg d'appel 
client.on('messageCreate', message => {
    console.log('Message received:', message.content);
    if (message.content === '!vacances') {

        // Access the nickname of the member if it exists
        const nickname = message.author.globalName;

        // Get a random country
        const randomCountry = getRandomCountry();
		
		// Modified variables
		let countryFlag = randomCountry.cca2.toLowerCase();
		const languages = Object.values(randomCountry.languages);
		const currencies = Object.values(randomCountry.currencies).map(currency => currency.name);
		console.log(randomCountry.name.common);
		// API Meteo
		const location = randomCountry.latlng;

		fetch(`https://api.tomorrow.io/v4/weather/forecast?location=${location}`, {
		  headers: {
			'apikey': weatherKey
		  }
		})
		.then(response => response.json())
		.then(data => {

		  const presentDayData = data.timelines.daily[0];
		  
		  const windSpeedNb = parseFloat(presentDayData.values.windSpeedAvg);	
		  const windSpeeeed = windSpeedNb*3.6;	  
		  	
		  const meteo = presentDayData.values.weatherCodeMax;		  
		  const emojiWeather = getWeatherDescription(meteo);
		  
		  // Get a random image link from the gallery website
		  const countryName = randomCountry.name.common
		  const galleryUrl = `https://www.pexels.com/search/${countryName}/`
		  const galleryTestUrl = `https://unsplash.com/fr/s/photos/${countryName}?license=free`
		  console.log(galleryUrl);
		  
		  // Get a random image link from the gallery website
          const randomImageLink = getRandomImageFromGallery(galleryUrl);
			
		  // Embed creation
		const embed2 = new EmbedBuilder().setURL('https://www.promovacances.com/').setImage('https://img-3.journaldesfemmes.fr/aL5fFg174va9eLn-2W8_aJulRGk=/1500x/smart/c6c97002083f4a32aa59af4d62840dba/ccmcms-jdf/12167269.jpg')
		const embed3 = new EmbedBuilder().setURL('https://www.promovacances.com/').setImage('https://www.1001cocktails.com/wp-content/uploads/1001cocktails/2023/07/shutterstock_2173861113-scaled.jpg')
		const embed4 = new EmbedBuilder().setURL('https://www.promovacances.com/').setImage('https://static.hitek.fr/img/actualite/ill_m/687047842/Fete-de-la-biere-10.jpg')
		const embed1 = new EmbedBuilder()		
		.setColor(1752220)
		.setTitle(`@${nickname}`)
		.setURL('https://www.promovacances.com/')
		.setAuthor({ name: 'Vos vacances avec l\'aléatoire !', iconURL: `https://i.ibb.co/pfxnqf4/logonoir.png`})
		.setDescription(`doit prendre des vacances dans ce pays <:pepehehe:1182411327801667675> :`)
		.setThumbnail(`https://i.ibb.co/pfxnqf4/logonoir.png`)
		.addFields(
			{ name: 'Pays', value: `:flag_${countryFlag}: ${randomCountry.translations.fra.common}`, inline: true },
			{ name: 'Region', value: `${randomCountry.region}`, inline: true },
			{ name: 'Capitale', value: `${randomCountry.capital}`, inline: true },
		)
		.addFields(
			{ name: 'Habitants', value: `${randomCountry.demonyms.fra.m}`, inline: true },
			{ name: 'Langage(s)', value: `${languages}\n`, inline: true },
			{ name: 'Monnaie(s)', value: `${currencies}`, inline: true },
		)	
		.addFields(
			{ name: 'Température', value: `:small_red_triangle: ${Math.round(presentDayData.values.temperatureApparentMax)}°C\n:thermometer: ${Math.round(presentDayData.values.temperatureApparentAvg)}°C\n:small_red_triangle_down: ${Math.round(presentDayData.values.temperatureApparentMin)}°C`, inline: true },
			{ name: 'Constantes', value: `:droplet: ${Math.round(presentDayData.values.humidityAvg)}%\n:dash: ${Math.round(windSpeeeed)}km/h\n:bubbles: ${Math.round(presentDayData.values.humidityMin)}%`, inline: true },
			{ name: 'Météo', value: `:${emojiWeather}:`, inline: true },
		)
		.setImage(`${randomImageLink}`)
		console.log(randomImageLink)
		.setTimestamp()
		.setFooter({ text: 'TaraVacances est développé par streLi', iconURL: 'https://avatars.githubusercontent.com/u/167698708?v=4' });
		
		message.channel.send({ embeds: [embed1, embed2, embed3, embed4] });								
		  
		})
		.catch(error => {
		  console.error('Error:', error);
		});
			
	}	
});

// Function to choose a random country
function getRandomCountry() {
	const countriesData = fs.readFileSync('./src/countries.json');
	const countries = JSON.parse(countriesData);
    const countryKeys = Object.keys(countries);
    const randomKey = countryKeys[Math.floor(Math.random() * countryKeys.length)];
    return countries[randomKey];
}

// Function to interpret weather condition
function getWeatherDescription(meteo) {
    const weatherCodes = {
        "0": "Unknown",
        "1000": "sun",
        "1100": "white_sun_small_cloud",
        "1101": "white_sun_cloud",
        "1102": "white_sun_cloud",
        "1001": "cloud",
        "2000": "fog",
        "2100": "fog",
        "4000": "cloud_rain",
        "4001": "cloud_rain",
        "4200": "cloud_rain",
        "4201": "cloud_rain",
        "5000": "cloud_snow",
        "5001": "cloud_snow",
        "5100": "cloud_snow",
        "5101": "cloud_snow",
        "6000": "cloud_snow",
        "6001": "cloud_snow",
        "6200": "cloud_snow",
        "6201": "cloud_snow",
        "7000": "cloud_snow",
        "7101": "cloud_snow",
        "7102": "cloud_snow",
        "8000": "thunder_cloud_rain"
    };

    return weatherCodes[meteo] || "Unknown";
}

// Function to get a random image on website
async function getRandomImageFromGallery(url) {
    try {
        // Fetch the gallery website
        const response = await fetch(url);
        const html = await response.text();

        // Load the HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract image links
        const imageLinks = [];
        $('img').each((index, element) => {
            const src = $(element).attr('src');
            if (src) {
                imageLinks.push(src);
            }
        });

        // Select a random image link
        const randomImageLink = imageLinks[Math.floor(Math.random() * imageLinks.length)];
        return randomImageLink;
    } catch (error) {
        console.error('Error fetching or parsing the gallery website:', error);
        return null;
    }
}