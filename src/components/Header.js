import * as React from "react";
  
import {Box } from "@mui/material";

// import BatIcon from "./Logo.js";

  
export default function Header() {
  return (
        <header>
          <Box sx={{ width: 0.95, height: 0.5, bgcolor: '#EDEDED', textAlign: 'center', fontSize: 30, fontWeight: 'medium', mx: 'auto'}} >
              BatApp
          </Box>
        </header>
  );
}