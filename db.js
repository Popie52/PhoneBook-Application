import mongoose from "mongoose";
import 'dotenv/config'

const url = process.env.MONGODB_URI;


mongoose.set('strictQuery', false);

mongoose.connect(url).then(res => {
    console.log('Successfully connected to MongoDB');
}).catch(er => {
    console.log(er);
});

const schema = new mongoose.Schema({
    name: { 
        type: String,
        minLength: 3,
        required: true,
    },
    number: String,
})

schema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', schema);

export default Person;