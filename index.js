const express = require("express");
const path = require("path");
// const cors = require('cors')
const fs = require("fs");

const port = process.env.PORT || 3001;

const app = express();
app.use(express.json());

// ONLY FOR GETINITIALPROPS COZ IT RUNS BOTH ON SERVER AND CLIENT
// app.use(cors({
//     origin:"http://localhost:3000",
//     credentials:true
// }))

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

const pathToFile = path.resolve(__dirname, "data.json");

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/api/activeresources", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find((item) => item.status === "active");
  res.send(activeResource);
  // console.log(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;
  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();
  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (e) => {
    if (e) {
      return res.status(422).send("Can't store data in the file!");
    }
    return res.send("Success");
  });
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const id = req.params.id;
  const resource = resources.find((item) => item.id === id);
  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();

  const id = req.params.id;

  const resourceIndex = resources.findIndex((item) => item.id === id);
  const active = resources.find((item) => item.status === "active");
  if(resources[resourceIndex].status === "complete"){
    return res.status(422).send("Can't update because resource has already completed") 
  }

  resources[resourceIndex] = req.body;

  

  if (req.body.status === "active") {
    if (active) {
      return res.status(422).send("There is already active resources!");
    }
    resources[resourceIndex].status = "active";
    resources[resourceIndex].activationTime = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (e) => {
    if (e) {
      return res.send("Can't update data in the file!");
    }
    return res.send(resources);
  });
});

app.listen(port, console.log(`Running on ${port}`));
