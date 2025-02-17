import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "nes.css/css/nes.min.css";

import React, { useEffect } from 'react';

function App() {
    const [count, setCount] = useState(0);
    useEffect(() => {
        console.log("I run");

        // Assuming signOut and other functions are imported or defined elsewhere
        const signoutbutton = document.querySelector("#signoutbutton");
        signoutbutton.onclick = (event) => signOut(event, 'this');

        initializeTable().then(() => {
            const table = document.getElementById("datatable");
            if (table.rows.length > 0) {
                for (let i = 1, row; row = table.rows[i]; i++) {
                    console.log("ran through");

                    let buttonCell = row.cells[0];
                    let updateButton = buttonCell.querySelector("#updateButton");
                    updateButton.addEventListener('click', async function (event) {
                        await updateData(event, this);
                    });

                    let deleteButton = buttonCell.querySelector("#deleteButton");
                    deleteButton.addEventListener('click', async function (event) {
                        await deleteData(event, this);
                    });
                }
            }
        });
    }, []);



  return (
      <>
          <div className="nes-container">
              <form>
                  <div style={{ overflow: 'hidden' }} className="nes-container is-rounded is-dark">
                      <h2 style={{ float: 'left' }}>Playtime Leaderboard</h2>
                      <button style={{ float: 'right' }} id="signoutbutton" type="button" className="nes-btn is-error">Sign Out
                      </button>
                  </div>
                  <br/>
                  <section>
                      <div className="nes-container is-rounded is-dark with-title">
                          <h1 className="title">What is this?</h1>
                          <p>This website will compare your how much time you&#39;ve spent playing a game to other users.</p>
                      </div>
                      <br/>
                  </section>
                  <section className="nes-container is-rounded">
                      <h2>Game Information</h2>
                      <p>
                          <label htmlFor="gamename">
                              What is your most played game?
                          </label><br/>
                          <input type="text" id="gamename" className="nes-input" name="most-played-game" placeholder="Game Name" required/>
                      </p>
                      <p>
                          <label htmlFor="playtime">
                              How many hours do you have in this game?
                          </label><br/>
                          <input type="number" id="playtime" className="nes-input" name="play-time" placeholder="Total Playtime"/>
                      </p>
                      <p>
                          <label htmlFor="startdate">
                              When did you start playing this game?
                          </label><br/>
                          <input type="text" id="startdate" className="nes-input" name="started-playing" placeholder="MM/DD/YY"
                                 pattern="^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(20[0-9]{2})$" required/>
                      </p>
                      <br/>
                      <p>
                          <button id="submitbutton" type="submit" className="nes-btn is-primary" onClick={(event) => submit(event, "this")}>Submit</button>
                      </p>
                  </section>
                  <br/>
                  <section style={{ visibility : 'hidden' }} id="resultsHeader" className="nes-container is-rounded is-dark with-title">
                      <h1 className="title">Your Results</h1>
                      <h2>You've Spent</h2>
                      <p id="results"></p>
                      <br/>
                  </section>
                  <br/>
              </form>
              <form>
                  <aside className="nes-container with-title">
                      <h1 className="title">Everybody&#39;s Playtime</h1>
                          <table className="nes-table is-bordered is-centered" id="datatable">
                              <thead>
                              <tr>
                                  <th>Actions</th>
                                  <th>Name</th>
                                  <th>Game Name</th>
                                  <th>Playtime</th>
                                  <th>Start Date</th>
                                  <th>Hours/Day</th>
                              </tr>
                              </thead>
                              <tbody>
                              </tbody>
                          </table>
                  </aside>
              </form>
          </div>
      </>
  )
}

const submit = async function( event, where ) {
    // stop form submission from trying to load
    // a new .html page for displaying results...
    // this was the original browser behavior and still
    // remains to this day
    event.preventDefault();

    let name = ''

    await fetch('/api/get-username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                name = data.username;
                console.log('Logged in as:', data.username);
            } else {
                console.log('Not logged in');
            }
        })
        .catch(err => console.error('Error fetching username:', err));

    const gamename = document.querySelector( "#gamename")

    const playtime = document.querySelector( "#playtime")

    const startdate = document.querySelector( "#startdate")

    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[01])\/(20[0-9]{2})$/;
    if (!pattern.test(startdate.value)){
        alert("Date is in the wrong format.");
        return false;
    }
    if (gamename.value === '' || playtime.value === ''){
        alert("Not all fields are filled out.")
        return false;
    }

    const startTime = new Date(startdate.value);
    const currentTime = Date.now()

    console.log(startTime)
    console.log(currentTime)
    if (startTime >= currentTime && currentTime - startTime <= 100){
        alert("Date is in the future.")
        return false;
    }

    const json = { name: name, gamename: gamename.value, playtime: playtime.value, startdate: startdate.value }
    const body = JSON.stringify( json )

    console.log(body);
    const response = await fetch( "/submit", {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    })
    const results = await response.json();

    const data = results.insertedData
    console.log( "text:", data )
    if (data === "NameError"){
        alert("Name is already in use.")
        return false;
    }

    let table = document.getElementById("datatable")
    let extraRow = table.insertRow(table.rows.length)
    let buttonCell = extraRow.insertCell(0)
    buttonCell.innerHTML = '<button id="updateButton" type="button" class="nes-btn is-warning">Update</button> <button id="deleteButton" type="button" class="nes-btn is-error">Delete</button></th>';
    extraRow.insertCell(1).innerHTML = data.name;
    extraRow.insertCell(2).innerHTML = data.gamename;
    extraRow.insertCell(3).innerHTML = data.playtime;
    extraRow.insertCell(4).innerHTML = data.startdate;
    extraRow.insertCell(5).innerHTML = data.hours;

    let updateButton = buttonCell.querySelector("#updateButton")
    updateButton.addEventListener('click', function(event) {
        updateData(event, this);
    });

    let deleteButton = buttonCell.querySelector("#deleteButton")
    deleteButton.addEventListener('click', function(event) {
        deleteData(event, this);
    });

    let p = document.createElement("p");
    p.innerHTML = data.hours + " hours a day on " + data.gamename;
    document.getElementById("results").innerHTML = p.innerHTML;
    document.getElementById("resultsHeader").style.visibility='visible'

    clear()
}

const updateData = async function(event, where){
    event.preventDefault()
    let row = where.parentNode.parentNode;

    let name = ''

    await fetch('/api/get-username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                name = data.username;
                console.log('Logged in as:', data.username);
            } else {
                console.log('Not logged in');
            }
        })
        .catch(err => console.error('Error fetching username:', err));

    if (!(name === row.cells[1].innerHTML)){
        alert("This entry was not made by you.");
        return;
    }

    const gamename = document.querySelector( "#gamename")
    const playtime = document.querySelector( "#playtime")
    const startdate = document.querySelector( "#startdate")

    const pattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[01])\/(20[0-9]{2})$/;
    if (!pattern.test(startdate.value)){
        alert("Date is in the wrong format.");
        return false;
    }
    if (gamename.value === '' || playtime.value === ''){
        alert("Not all fields are filled out.")
        return false;
    }

    const startTime = new Date(startdate.value);
    const currentTime = Date.now()

    console.log(startTime)
    console.log(currentTime)
    if (startTime >= currentTime && currentTime - startTime <= 100){
        alert("Date is in the future.")
        return false;
    }

    const jsonOld = { name: row.cells[1].innerHTML, gamename: row.cells[2].innerHTML, playtime: row.cells[3].innerHTML, startdate: row.cells[4].innerHTML, hours: Number(row.cells[5].innerHTML) };

    const jsonNew = { name: name, gamename: gamename.value, playtime: playtime.value, startdate: startdate.value }
    const jsonTotal = {jsonOld: jsonOld, jsonNew: jsonNew}
    const body = JSON.stringify( jsonTotal )

    console.log(body);
    const response = await fetch( "/update", {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    })
    const results = await response.json();

    const data = results.insertedData
    console.log( "text:", data )
    if (data === "NameError"){
        alert("Name is already in use.")
        return false;
    }

    row.cells[1].innerHTML = data.name;
    row.cells[2].innerHTML = data.gamename;
    row.cells[3].innerHTML = data.playtime;
    row.cells[4].innerHTML = data.startdate;
    row.cells[5].innerHTML = data.hours;

    let p = document.createElement("p");
    p.innerHTML = "You've spent " + data.hours + " hours a day on " + data.gamename;
    document.getElementById("results").innerHTML = p.innerHTML;
    document.getElementById("resultsHeader").style.visibility='visible'

    clear()
}

const deleteData = async function(event, where){
    event.preventDefault()

    let row = where.parentNode.parentNode;

    let name = ''

    await fetch('/api/get-username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                name = data.username;
                console.log('Logged in as:', data.username);
            } else {
                console.log('Not logged in');
            }
        })
        .catch(err => console.error('Error fetching username:', err));

    if (!(name === row.cells[1].innerHTML)){
        alert("This entry was not made by you.");
        return;
    }

    const jsonOld = { name: row.cells[1].innerHTML, gamename: row.cells[2].innerHTML, playtime: row.cells[3].innerHTML, startdate: row.cells[4].innerHTML, hours: Number(row.cells[5].innerHTML) };

    const body = JSON.stringify( jsonOld )

    const response = await fetch( "/delete", {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body
    })
    const results = await response.json();

    row.parentNode.removeChild(row)

    alert("Entry Deleted")
}

const signOut = async function(event, where) {

    const response = await fetch( "/signout", {
        method:'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
}

function clear(){
    document.getElementById("yourname").value = "";
    document.getElementById("gamename").value = "";
    document.getElementById("playtime").value = "";
    document.getElementById("startdate").value = "";
}

async function initializeTable() {
    let name = ''

    await fetch('/api/get-username')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                name = data.username;
                console.log('Logged in as:', data.username);
            } else {
                console.log('Not logged in');
            }
        })
        .catch(err => console.error('Error fetching username:', err));

    const response = await fetch( "/initialize", {
        method:'POST'
    })

    const results = await response.json();

    const data = results.dataRecovered;
    console.log(data)

    let table = document.getElementById("datatable")

    for (let i = 0; i < data.length; i++) {
        let extraRow = table.insertRow(table.rows.length)
        let buttonCell = extraRow.insertCell(0)
        console.log(data[i].name);
        buttonCell.innerHTML = '<button id="updateButton" type="button" class="nes-btn is-warning">Update</button> <button id="deleteButton" type="button" class="nes-btn is-error">Delete</button></th>';
        extraRow.insertCell(1).innerHTML = data[i].name;
        extraRow.insertCell(2).innerHTML = data[i].gamename;
        extraRow.insertCell(3).innerHTML = data[i].playtime;
        extraRow.insertCell(4).innerHTML = data[i].startdate;
        extraRow.insertCell(5).innerHTML = data[i].hours;
    }
}

export default App
