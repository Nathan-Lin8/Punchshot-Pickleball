import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useLocation } from "react-router-dom";
import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../components/UserContext/usercontext";
import Typography from "@mui/material/Typography";
import "../League/league.scss";
import "@fontsource/inter";
import "@fontsource/inter/200.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/InputBase";
import { FormControl } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useCookies } from "react-cookie";
import axios from "axios";

import { TeamSelectButton } from "./teamSelectButton";

const StyledInput = styled(TextField)({
  borderRadius: "1em",
  border: "3px solid #000000",
  fontSize: "calc(0.8vw + 0.1em)",
  width: "30vw",
  paddingLeft: "1vw",
});

const StyledLabel = styled("label")({
  paddingLeft: "1vw",
  marginBottom: "0.5vh",
});

const buttonTheme = createTheme({
  palette: {
    primary: {
      main: "#9146D8",
    },
    secondary: {
      main: "#D9D9D9",
    },
  },
});

export const TeamSelect = (props) => {
  // Grab the cookies
  const user = useContext(UserContext);

  // location.state holds the info about the league
  const location = useLocation();
  console.log(user);

  // For the input for a new team
  const [teamName, setTeamName] = useState(null);

  const [homeCourtAddress, setHomeCourtAddress] = useState(null);

  // Adds the team to the league
  const addTeamToLeague = async () => {
    // Make a copy of the league, add the new team
    const leagueInfo = location.state;

    // check if the team name or home court address is already taken
    const isTeamNameTaken = leagueInfo.Teams.some(team => team.TeamName === teamName);
    const isHomeCourtAddressTaken = leagueInfo.Teams.some(team => team.HomeCourtAddress === homeCourtAddress);

    if (isTeamNameTaken) {
      alert('This team name is already taken. Please choose another one.');
      return;
    }
  
    if (isHomeCourtAddressTaken) {
      alert('This home court address is already taken. Please choose another one.');
      return;
    }

    // console.log(leagueInfo);
    console.log(user);
    if (!user) {
      console.log("not signed in");
    }

    let isCaptain = leagueInfo["Teams"].find(
      (obj) => obj.TeamCaptain === user.Username
    );
    console.log("Creating Team");
    console.log("userName" + user.Username);
    console.log("is captain " + JSON.stringify(isCaptain));

    if (isCaptain) {
      alert("Cannot make new team as captain of another team");
      return;
    }

    leagueInfo["Teams"].push({
      TeamName: teamName,
      TeamCaptain: user.Username,
      CaptainEmail: user.Email,
      TeamMembers: [],
      PotentialTeamMembers: [],
      HomeCourtAddress: homeCourtAddress,
    });

    // Make a patch request to the leagues API with the updated league object
    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leagueInfo),
    };

    // Make the PATCH request to update the leagues
    const apiUrl = `http://localhost:8000/leagues/updateLeague/${location.state["_id"]}`;

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const removePlayerFromTeam = async (teamIndex) => {
    if (!user) {
      console.log("not signed in");
      return;
    }

    let PlayerList = location.state.Teams[teamIndex].TeamMembers;
    console.log(PlayerList);

    let teamCaptain = location.state.Teams[teamIndex].TeamCaptain;

    if (teamCaptain === user.Username) {
      if (PlayerList.length === 0) {
        alert("No team members in team to replace you as captain");
        return;
      }

      // removeCaptain and set first player to Captain
      location.state.Teams[teamIndex].TeamCaptain = PlayerList[0];
    } else {
      //find user in memberlist and remove from memberlist
      console.log("in filter");
      let inMemberList = PlayerList.find((item) => item === user.Username);
      if (!inMemberList) {
        alert("User already not in team");
        return;
      }
      let filteredArray = PlayerList.filter((item) => item !== user.Username);
      location.state.Teams[teamIndex].TeamMembers = filteredArray;
    }

    const apiUrl = `http://localhost:8000/leagues/updateLeague/${location.state["_id"]}`;

    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location.state),
    };

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Adds a player to the potential team member list of a team
  const addPlayerToPotentialList = async (teamIndex) => {
    if (!user) {
      console.log("not signed in");
      return;
    }

    let potentialPlayerList =
      location.state.Teams[teamIndex].PotentialTeamMembers;
    console.log(potentialPlayerList);

    let isCaptain = location.state["Teams"].find(
      (obj) => obj.TeamCaptain === user.Username
    );

    if (isCaptain) {
      alert("Cannot request to join new team as captain of this/another team");
      return;
    }

    let inTeam = potentialPlayerList.find((obj) => obj === user.Username);

    if (inTeam) {
      alert("Already in potential player list");
      return;
    }

    potentialPlayerList.push(user.Username);

    // Make the PATCH request to update the leagues
    const apiUrl = `http://localhost:8000/leagues/updateLeague/${location.state["_id"]}`;

    const requestOptions = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location.state),
    };

    fetch(apiUrl, requestOptions)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    // Make the GET request to send an email
    const emailApiUrl = `http://localhost:8000/leagues/sendRequestEmail?sendTo=${location.state.Teams[teamIndex].CaptainEmail}&user=${user.Username}`;

    fetch(emailApiUrl)
      .then((response) => response.json())
      .then((responseData) => {
        console.log(responseData);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  console.log(location.state)

  return (
    <Box sx={{ width: "80vw", height: "77.69vh", display: "flex" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          className="titleText"
          sx={{
            display: "flex",
            fontSize: "calc(0.7em + 1vw)",
            fontWeight: "bold",
            pt: "1%",
            align: "center",
            marginLeft: "10vw",
          }}
        >
          {location.state.LeagueName}
        </Typography>
        <Typography
          className="bodyText"
          sx={{
            display: "absolute",
            fontSize: "calc(0.1em + 1vw)",
            align: "left",
            marginLeft: "10vw",
          }}
        >
          Teams Required: {location.state.NumTeams}
        </Typography>
        <Typography
          className="bodyText"
          sx={{
            display: "absolute",
            fontSize: "calc(0.1em + 1vw)",
            align: "left",
            marginLeft: "10vw",
          }}
        >
          Start Date: {new Date(location.state.StartDate).toLocaleDateString()}
        </Typography>
        <Typography
          className="bodyText"
          sx={{
            display: "absolute",
            fontSize: "calc(0.1em + 1vw)",
            align: "left",
            marginLeft: "10vw",
          }}
        >
          End Date: {new Date(location.state.EndDate).toLocaleDateString()}
        </Typography>
        <Typography
          className="bodyText"
          sx={{
            display: "absolute",
            fontSize: "calc(0.1em + 1vw)",
            align: "left",
            marginLeft: "10vw",
            marginBottom: "3em",
          }}
        >
          <FormControl sx={{ height: "7vw", marginLeft: "1.5vw" }}>
            <StyledLabel htmlFor="leagueName">
              Team Name<span style={{ color: "red" }}>*</span>
            </StyledLabel>
            <StyledInput
              onChange={(event) => setTeamName(event.target.value)}
              id="leagueName"
              placeholder="Team1"
              required
            />
            <StyledLabel htmlFor="homeCourtAddress">
              Home Court Address<span style={{ color: "red" }}>*</span>
            </StyledLabel>
            <StyledInput
              onChange={(event) => setHomeCourtAddress(event.target.value)}
              id="homeCourtAddress"
              placeholder="123 Main St"
              required
            />
            <Button
              onClick={addTeamToLeague}
              variant="contained"
              color="primary"
              sx={{
                position: "relative",
                borderRadius: "calc(0.1em + 0.5vw)",
                pl: "calc(1.5vw)",
                pr: "calc(1.8vw)",
              }}
            >
              Create Team
            </Button>
          </FormControl>
        </Typography>

        <Box sx={{ position: "relative", left: "3svw" }}>
          {/* Dynamically renders the teams within the league */}
          {location.state.Teams !== null
            ? location.state.Teams.map((item, index) => (
                <TeamSelectButton
                  onClick={() => {
                    addPlayerToPotentialList(index);
                  }}
                  onClickRemoveUser={() => {
                    console.log("Remove User Is Running");
                    removePlayerFromTeam(index);
                  }}
                  name={location.state.Teams[index].TeamName}
                  captain={location.state.Teams[index].TeamCaptain}
                  members={location.state.Teams[index].TeamMembers}
                  home={location.state.Teams[index].HomeCourtAddress}
                  potentialMembers={
                    location.state.Teams[index].PotentialTeamMembers
                  }
                  showPotentialMembers={
                    user &&
                    user.Username === location.state.Teams[index].TeamCaptain
                  }
                  leagueInfo={location.state}
                  teamIndex={index}
                />
              ))
            : null}

          <Box sx={{ width: "45vw", height: "4vh", display: "flex" }}></Box>
          <Box
            sx={{
              position: "absolute",
              top: "102%",
              left: "9.5%",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "row",
            }}
          ></Box>
        </Box>
      </Box>
    </Box>
  );
};
