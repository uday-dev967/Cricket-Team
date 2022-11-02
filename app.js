const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndserver = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is running at https://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndserver();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//### API 1

app.get("/players", async (request, response) => {
  const allPlayers = `
    SELECT
      *
    FROM
      cricket_team;`;
  const players = await db.all(allPlayers);
  //console.log(players);
  const obj = players.map((player) => convertDbObjectToResponseObject(player));
  response.send(obj);
});

// ### API 2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
  INSERT INTO 
    cricket_team (player_name,jersey_number,role)
  VALUES
    ('${playerName}',${jerseyNumber},'${role}');`;
  const newPlayer = await db.run(addPlayerQuery);
  const player_Id = newPlayer.lastID;
  response.send("Player Added to Team");
});

// ### API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
        player_id = ${playerId}`;
  const player = await db.get(playerQuery);
  const obj = convertDbObjectToResponseObject(player);
  response.send(obj);
});

// ### API 4

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const playerUpdateQuery = `
  UPDATE
    cricket_team
  SET
    player_name='${playerName}',
    jersey_number=${jerseyNumber},
    role='${role}'
  WHERE 
    player_id = ${playerId}`;

  const updatePlayer = await db.run(playerUpdateQuery);
  response.send("Player Details Updated");
});

// ### API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const removePlayerQuery = `
        DELETE FROM
            cricket_team
        WHERE
            player_id = ${playerId};`;
  await db.run(removePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
