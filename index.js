const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors')

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
]


app.use(express.json())

app.use(cors())

// Morgan middleware.
morgan.token('show-post-body', function (req, res) {
    return JSON.stringify(req.body)   // the documentation says that it is expected to return a string.
})
app.use(morgan(':show-post-body :method :url :status :res[content-length] - :response-time ms'))


app.get("/api/persons", (req, res) => {
    res.json(persons)
})



app.get("/info", (req, res) => {
    const nrPersons = persons.length;
    const actualDate = new Date();
    console.log(actualDate)


    res.send(`
    <p> The phonebook now has ${nrPersons} entries</p>

    <p> and the time is ${actualDate}</p>
    `)

})


app.get("/api/persons/:id", (req, res) => {
    let idPerson = req.params.id;
    let requiredPerson = persons.find(person => parseInt(idPerson) === person.id)

    if (requiredPerson) {
        res.json(requiredPerson)
    } else {
        res.status(404).end()
    }
})



app.delete("/api/persons/:id", (req, res) => {
    let idPerson = req.params.id;
    let requiredPerson = persons.find(person => parseInt(idPerson) === person.id);
    if (requiredPerson) {

        persons = persons.filter(person => person.id === parseInt(idPerson) ? false : true)
        res.status(204).end()
    } else {
        res.status(404).end()
    }
})


app.post("/api/persons", (req, res) => {


    // req.body.content is always undefined, regardless of sending or not the body, even with right content-type headers 
    // (application/json). Therefore I just check if the object req.body is empty. 
    // This method is suggested from stackoverflow, for checking that the object is empty.

    // true if req.body is {}, false otherwise.
    console.log(Object.keys(req.body).length === 0 && req.body.constructor === Object)

    if (Object.keys(req.body).length === 0 && req.body.constructor === Object) {
        return res.status(400).json({
            error: 'content missing'
        })
    }


    // Note: a request of this type needs to have headers:
    // content-type: "application/json"

    if (!req.body.name) {
        return res.status(400).json({
            error: 'name missing!'
        })
    }


    if (!req.body.number) {
        return res.status(400).json({
            error: 'number missing!'
        })
    }


    let { name, number } = req.body

    const findPersonWithSameName = persons.find(person => person.name === name)
    if (findPersonWithSameName) {
        return res.status(400).json({
            error: 'name already exists!'
        })
    }


    let id = Math.floor(Math.random() * 10000)
    const newPerson = { name, number, id }
    persons = persons.concat(newPerson)


    res.json(newPerson)

})



const PORT = process.env.PORT || 3001;

app.listen(PORT, () => { console.log(`listening on port ${PORT}`) })