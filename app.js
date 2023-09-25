const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json()); // To parse JSON data in request body

const cricketTeamDBFilePath = path.join(__dirname, "cricketTeam.db");
const sqliteDBDriver = sqlite3.Database;

let cricketTeamDBConnectionObj = null;

const initializeDBAndServer = async () => {
  try {
    cricketTeamDBConnectionObj = await open({
      filename: cricketTeamDBFilePath,
      driver: sqliteDBDriver,
    });

    // Control flow reaches here only when
    // a db connection object is successfully
    // returned without any exceptions. Only
    // then, Node.js server instance is started
    // to listen on port 3000.
    app.listen(3000, () => {
      console.log(
        "Server successfully started and is listening on port 3000 !"
      );
    });
  } catch (exception) {
    console.log(`Error Initializing DB: ${exception.message}`);
    process.exit(1); // Don't want server process to start when
    // there is an issue connecting with sqlite
    // db instance.
  }
};

initializeDBAndServer();

// Cricket Team API end-points for client to
// carry out different data operations on data
// in the backend sqlite DB.

/* 
    End-Point 1: GET /players 
    ------------
    To fetch all player data from sqlite DB
    and send it as response to a GET request
    from client. 
*/
app.get("/players/", async (req, res) => {
  const getAllPlayersSQLQuery = `
    SELECT *
    FROM cricket_team;
    `;

  const allPlayerData = await cricketTeamDBConnectionObj.all(
    getAllPlayersSQLQuery
  );
  res.send(allPlayerData);
});

/* 
    End-Point 2: POST /players 
    ------------
    To add new player data to the
    cricket_team table in sqlite
    database.
*/

app.post("/players", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;

  const addNewPlayerDataQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
        ('${playerName}', ${jerseyNumber}, '${role}'); 
    `;

  const newPlayerDBInsertResponse = await cricketTeamDBConnectionObj.run(
    addNewPlayerDataQuery
  );

  res.send("Player Added to Team");
});

/*
    End-Point 3: GET /players/:playerId
    ------------
    To fetch details of specific player
    from the cricket_team table in sqlite
    Database.
*/

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;

  const getSpecificPlayerDetailsQuery = `
        SELECT * 
        FROM cricket_team
        WHERE
        player_id = ${playerId};
    `;

  const specificPlayerDetails = await cricketTeamDBConnectionObj.get(
    getSpecificPlayerDetailsQuery
  );

  res.send(specificPlayerDetails);
});

/*
    End-Point 4: PUT /players/:playerId
    ------------
    To update details of specific player
    in the cricket_team table within sqlite
    database.
*/

app.put("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const { playerName, jerseyNumber, role } = req.body;

  const updateSpecificPlayerDetailsQuery = `
    UPDATE 
        cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};
    `;

  await cricketTeamDBConnectionObj.run(updateSpecificPlayerDetailsQuery);
  res.send("Player Details Updated");
});

/*
    End-Point 5: DELETE /players/:playerId
    ------------
    To delete data of specific player from
    cricket_team table.
*/

app.delete("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;

  const deleteSpecificPlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  await cricketTeamDBConnectionObj.run(deleteSpecificPlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
