import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import { none } from 'ol/centerconstraint';


export default function InfoDialog(props) {
    const open = props.open
    const onClose = props.onClose
    return (
        <div>
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle id="alert-dialog-title">
            {"Discover Informations"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                INFO
                {/* <div>Id:{props.featureProperties.id}</div>
                <div>Bat:{props.featureProperties.bat}</div>
                <div>Virus:{props.featureProperties.virus}</div>
                <div>Paper:{props.featureProperties.paper_name}</div>
                <div>Date:{props.featureProperties.date}</div> */}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}> <CancelIcon/> </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
    InfoDialog.defaultProps = {
        open: false,
        onClose: none,
        featureProperties: {
            "id":" ",
            "date": " ",
            "paper_name": " ",
            "bat": " ",
            "virus": " ",
        }
        
    }
}