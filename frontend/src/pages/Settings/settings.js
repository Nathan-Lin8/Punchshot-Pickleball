import { Header } from "../../components/Header/header.js";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
import * as React from 'react';
import Tabs from '../../components/Tabs/tabs.js'
import { alpha } from '@mui/material/styles';
import General from "./general.js";
import Privacy from "./privacy.js";
import { useState } from "react";


export const Settings = () => {

  const color = '#9146D8'
  const [tabs] = useState([
    {name: 'General', id:0},
    {name: 'Privacy & Security', id:1},
    {name: 'Blocking', id:2},
    {name: 'Location & Region', id:3},
    {name: 'Other', id:4},
    
  ])
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        console.log(newValue);
        setValue(newValue);
    };

    return (
        <Box
        display="flex"
        flexDirection="column"
        alignItems="left"
        paddingRight="3em"
        paddingLeft = "3em"
        width="78%">
                <Tabs data={tabs} color = {color}/>

            <Box 
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
        >
            <Box
        sx={{
            width: "100%",
            paddingLeft: "1em",
            paddingRight: "1em",
            borderRadius: 4,
            backgroundColor: '#ffffff',
            border: `3px solid ${color}`,
            transition: '.4s',
            height:'35em',
            '&:hover': {
                boxShadow: `${alpha(color, 0.25)} 0 0 0 0.2rem`,
                transition: '.4s',
            },
        }}
            >
                {value === 0 && <General/>}
                {value === 1 && <Privacy />}
                {value === 2 && <General />}
                {value === 3 && <Privacy />}
                {value === 4 && <Privacy />}
                {value === 5 && <Privacy />}
         
            </Box>    
            </Box> 
        </Box>
    );
}