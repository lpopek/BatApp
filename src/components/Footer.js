import * as React from "react";
import { Box } from "@mui/material";

export default function Footer(){
    return(
        <footer>
            <Box sx={{width:0.95, bgcolor: '#EDEDED', pt:3, pb:3, textAlign: 'center', mx:'auto'}}>
                    Created by Łukasz Popek, Aneta Afelt
            </Box>
        </footer>

    )
}