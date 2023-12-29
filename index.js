const tmi = require('tmi.js');
const fs = require('fs');
const path = require('path');

// Define configuration options for Twitch bot
const opts = {
  identity: {
    username: 'javiprogramer',
    password: 'oauth:3go38u2zdgwyigr2n0fah2klka0fq4'
  },
  channels: [
    'javiprogramer'
  ]
};

// Create a client with Twitch options
const client = new tmi.client(opts);

// Define file log configuration
const nombreArchivoLog = 'logs.txt';
const rutaArchivoLog = path.join(__dirname, nombreArchivoLog);

// Connect to Twitch chat
client.connect();

// Set up message event handling
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Handle incoming messages
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  }

  const username = context['username'];
 const userTimestamp = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });
  const isModerator = context['mod'];
  const isOwner = context['badges'] ? context['badges']['broadcaster'] === '1' : false;

  console.log(`Username: ${username}`);
  console.log(`Time: ${userTimestamp}`);
  console.log(`Mod ${isModerator}`);
  console.log(`Owner ${isOwner}`);

  const logMessage = `${userTimestamp}: ${context['username']} - ${msg}\n`;

  fs.appendFile(rutaArchivoLog, logMessage, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`* Se ha registrado: ${logMessage}`);
    }
  });

  const [command, parameter] = msg.trim().split(' ');
  const isCommand = command.startsWith('!');

  if (isCommand) {
    if (command === '!dice') {
      const num = rollDice();
      client.say(target, `Hey, ${username} rolled a ${num}`);
      console.log(`* Executed ${command} command`);
    } else if (command === '!owner') {
      client.say(target, `The owner of the bot is Javi17mod,\n Twitch: `);
    } else if (command === '!count') {
       // Leer el archivo 'count.txt'
       fs.readFile('count.txt', 'utf8', (err, data) => {
         if (err) {
           console.error('Error al leer el archivo:', err);
           return;
         }

         let count = parseInt(data) || 0; // Convertir a número; si no es un número, se asigna 0 por defecto
         count++; // Incrementar el contador

         // Guardar el nuevo valor en 'count.txt'
         fs.writeFile('count.txt', count.toString(), (err) => {
           if (err) {
             console.error('Error al escribir en el archivo:', err);
             return;
           }

           // Enviar mensaje con el nuevo valor del contador al chat
           client.say(target, `Counter: ${count}`);
           console.log('El contador ha sido actualizado:', count);
         });
       });
     } else if (command === '!logs') {
      if (username === "javiprogramer") {
        leerArchivoRegistro()
          .then((contenido) => {
            if (contenido) {
              client.say(target, contenido);
            } else {
              console.log('El archivo de registro está vacío.');
            }
          })
          .catch((error) => {
            console.error('Error al leer el archivo de registro:', error);
          });
      } else {
        client.say(target, `${username}, you don't have access to this command`);
      }
    } else {
      client.say(target, `${username}, ${command} is not an existing command`);
    }
  }
}

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Function to read the log file
function leerArchivoRegistro() {
  return new Promise((resolve, reject) => {
    fs.readFile(rutaArchivoLog, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
