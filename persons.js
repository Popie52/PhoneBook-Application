import express, { request, response } from "express";
import cors from "cors";
import morgan from "morgan";
import Person from "./db.js";


const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(morgan(":method :url :status :response-time ms :body"));

app.use(express.static("dist"));

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then(count => {
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${new Date().toUTCString()}</p>
      `);
    })
    .catch(error => next(error));
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    console.log(persons);
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person);
    })
    .catch((er) => next(er));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  Person.find({ name: name })
    .then((result) => {
      if (result.length > 0) {
        return res.status(400).json({
          error: "Name must be unique",
        });
      }

      const person = new Person({
        name: name,
        number: number,
      });

      person
        .save()
        .then((savedPerson) => {
          res.status(201).json(savedPerson);
        })
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const {name, number} = req.body;

  Person.findById(id).then(person => {
    if(!person) {
      return res.status(404).end();
    }
    person.name = name;
    person.number = number;

    person.save().then(result => {
      res.json(result)
    })
  }).catch(er => next(er));
});

app.delete("/api/persons/:id", (req, res, next) => {

  const id = req.params.id;
  Person.findByIdAndDelete(id).then(result => {
    res.status(204).end();
  }).catch(er => next(er));
});


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error);
  if(error.name === 'CastError') {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
