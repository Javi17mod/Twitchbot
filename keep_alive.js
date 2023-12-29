const express = require('express')
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('El bot está en linea!'))

app.listen(port, () =>
console.log(`listo`)
);