const debug = require('debug')('app:inicio');
//const dbDebug =  require('debug')('app:db');
const express = require('express');
const Joi = require('@hapi/joi');
const app = express();
//const logger = require('./logger.js');
const morgan = require('morgan');
const config  = require('config');


// app.post(); //envio de datos
// app.put(); //actualizacion 
// app.delete(); //eliminacion

const usuarios = [
    {id:1, nombre:'ariel'},
    {id:2, nombre:'facu'},
    {id:3, nombre:'yoli'}
];


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//----------- Configuracion de entornos ------------------

console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));

// -----------------------------------------------------


// ------ practicando middlewares -------------

//app.use(logger);

// app.use(function(req, res, next){
//     console.log('Autenticando....');
//     next();
// })

// ------ practicando middlewares -------------


// ------ middleware de terceros -------------

if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    // console.log('Morgan habilitado...')
    debug('Morgan esta habilitado');
};

//---------------------------------------------


// --------- Trabajos con la base de datos ------------

debug('Conectando con la base de datos')

// ----------------------------------------------------

app.get('/',(req, res) => {
    res.send('Hola Mundo desde Express');
}); //peticion

app.get('/api/usuarios', (req, res)=>{
    res.send(usuarios);
})

app.get('/api/usuarios/:id', (req, res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('el usuario no fue encontrando');
    res.send(usuario);
})
    

app.post('/api/usuarios',(req, res) => {
    
    //------------- prueba de middleware ---------------
    // let body = req.body;
    // console.log(body.nombre);
    // res.json({
    //     body
    //})
    // -------------------------------------------------
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    const {error, value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }
    // if(!req.body.nombre || req.body.nombre.length <= 2){
    //     //bad request
    //     res.status(400).send('debe ingresar un nombre, que tenga minimo 3 letras');
    //     return;
    // }    
});

app.put('/api/usuarios/:id',(req, res)=>{
    //encontrar si existe el objeto usuario
    // let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('el usuario no fue encontrando');
        return;
    }
    
    const {error, value} = validarUsuario(req.body.nombre) ;
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);

})


app.delete('/api/usuarios/:id',(req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('el usuario no fue encontrando');
        return;
    }

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);

    res.send(usuarios);
})


const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`escuchando en el puerto ${port}...`);
})



function existeUsuario(id){
   return(usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return(schema.validate({nombre: nom}));
}
