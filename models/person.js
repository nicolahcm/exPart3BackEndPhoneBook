const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const personSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    number: Number
})

personSchema.plugin(uniqueValidator);

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


const Person = mongoose.model("person", personSchema)


module.exports = Person