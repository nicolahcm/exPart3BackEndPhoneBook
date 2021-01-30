const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');


const Person = require('./models/person')
const app = express();
const cors = require('cors')



mongoose.connect(process.env.MONGODB_URI, () => { console.log("successfully connected to the db!") })



app.use(express.json())
app.use(cors())
// Morgan middleware.
morgan.token('show-post-body', function (req, res) {
    return JSON.stringify(req.body)   // the documentation says that it is expected to return a string.
})
app.use(morgan(':show-post-body :method :url :status :res[content-length] - :response-time ms'))
app.use(express.static("build"))





app.get("/api/persons", (req, res) => {

    Person.find({}).then(result => res.json(result))
})



app.get("/info", (req, res) => {
    Person.find({}).then(result => {
        const length = result.length
        const actualDate = new Date();
        res.json({
            date: actualDate,
            nr_people_phonelist: length
        })
    })
})


app.get("/api/persons/:id", (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {                // if nothing found, promise is rejected.
            res.json(person)
        })
        .catch(error => next(error))     // See middleware
})



app.delete("/api/persons/:id", (req, res, next) => {
    let idPerson = req.params.id;
    console.log("delete method applied", idPerson)

    Person.findByIdAndDelete(idPerson)
        .then(person => {                // if nothing found, promise fails and we send to the middleware
            res.json(person)
        })
        .catch(error => { next(error) })
})


app.post("/api/persons", (req, res, next) => {

    if ((!req.body.name) || (!req.body.number)) {
        return res.status(400).json({
            error: 'content missing'
        })
    }

    let { name, number } = req.body

    let newPerson = Person({ name: name, number: number })

    newPerson.save().then(savedPerson => res.json(savedPerson)).catch(error => {
        res.status(400).send({ error: "invalid input. Either the user already exists or not right type fields." })
    })

})

app.put("/api/persons/:id", (req, res, next) => {
    let idPerson = req.params.id;
    const newPerson = req.body   // as we send it is already the required object. see frontend!
    Person.findByIdAndUpdate(idPerson, newPerson, { new: true })
        .then(result => res.json(result))
        .catch(error => next(error))

})




const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)



const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => { console.log(`listening on port ${PORT}`) })