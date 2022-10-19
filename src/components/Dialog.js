import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';



export default function InfoDialog(props) {
    const open = props.open
    const onClose = props.onClose
    const [discoverData, setDiscoverData] = useState(
        {
            "id":" ",
            "date": " ",
            "paper_name": " ",
            "bat": " ",
            "virus": " ",
        })
    useEffect(() => {
        if (typeof props.featureProperties !== 'undefined')
            setDiscoverData(props.featureProperties)
    }, [props.featureProperties])
    return (
        <div>
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle id="alert-dialog-title" className='dialog-title'>
            {"Discover Informations"}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                <div>Id: {discoverData.id}</div>
                <div>Bat: {discoverData.bat}</div>
                <div>Virus: {discoverData.virus}</div>
                <div>Paper: {discoverData.paper_name}</div>
                <div>Date: {discoverData.date}</div>
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onClose}> <CancelIcon/> </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}