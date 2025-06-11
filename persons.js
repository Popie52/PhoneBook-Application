import express from 'express';
import cors from 'cors';
import morgan, { token } from 'morgan';

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const app = express();
const PORT = 3001;


const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => Number(n.id)))
    : 0
  return String(maxId + 1);
}

// app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({extended: true }));

morgan.token('body', (req) => {
  if(req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return '';
});


app.use(morgan(':method :url :status :response-time ms :body'));

app.use(express.static('dist'));


app.get("/info", (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date().toUTCString()}</p>`)
})


app.get("/api/persons", (req, res) => {
  res.json(persons);
})

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const check = persons.find(e => e.id == id);
  // console.log(check);
  if(!check) {
    return res.status(404).json({ 
      error: 'content Not Found' 
    })
  }
  res.json(check);
})


app.post("/api/persons", (req, res) => {
  const { name, number}= req.body;
  
  if (!name || !number) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  const check = persons.find(e => e.name === name);
  if(check) {
    return res.status(400).json({
      name: "Name must be unique"
    })
  }

  const person = {
    id: generateId(),
    name: name,
    number: number,
  }

  persons = persons.concat(person)

  res.json(person);
})


app.put("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const body = req.body;
  // console.log(body);
  const note = persons.find((note) => note.id === id);
  if (!note) {
    return res.status(404).json({
      error: 'Note not found',
    });
  }

  const changed = { ...note, ...body };
  persons = persons.map((e) => (e.id === id ? changed : e));
  res.status(200).json(changed);
})


app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const check = persons.find(e => e.id == id);
  // console.log(check);
  if(!check) {
    return res.status(204).json({ 
      error: 'content Not Found' 
    })
  }
  persons = persons.filter(e => e.id !== id);
  res.json(check);
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})