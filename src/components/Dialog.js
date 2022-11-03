import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon  from '@mui/icons-material/ArrowBackIos'


export default function InfoDialog(props) {

    const open = props.open
    const onClose = props.onClose
    const currentDisc = props.currentDisc
    var discoverData = {}
    if (typeof props.featureProperties !== "undefined") {
        discoverData = {
            id: props.featureProperties[currentDisc].id,
            bat: props.featureProperties[currentDisc].bat,
            virus: props.featureProperties[currentDisc].virus,
            paper_name: props.featureProperties[currentDisc].paper_name,
            date: props.featureProperties[currentDisc].date
        }
        var discoverNumber = Object.keys(props.featureProperties).length - 1
    }else{
        discoverData = {
            id: 'N/A',
            bat: 'N/A',
            virus: 'N/A',
            paper_name: 'N/A',
            date: 'N/A'
        }
    }
    
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
            <Button onClick={props.decrementInd} disabled={!currentDisc}> <ArrowBackIosIcon/></Button>
            <Button onClick={props.incrementInd} disabled={currentDisc + 1 === discoverNumber}> <ArrowForwardIosIcon/></Button>
            <Button onClick={onClose}> <CancelIcon/> </Button>
            </DialogActions>
        </Dialog>
        </div>
    );
}