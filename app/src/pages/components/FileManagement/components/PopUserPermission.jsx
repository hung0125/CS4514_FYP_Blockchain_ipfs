import Popup from "reactjs-popup";
import { Line } from "../../general/Decorations";
import { Button } from "@mui/material";
import { setPermitRecipientUpdate, setPrivate } from "../../../../context/operations/EthContractFileProps";

const PopUserPermission = (props) => {

    const configPrivate = () => {
        const conf = confirm(`Are you sure to set this transfer as ${props.fileControl.isPrivate? 'public' : 'private'}?`);
        if (conf) {
            setPrivate(props.fileControl.isPrivate? false : true, props.blockID).then(result => {
                if (result) 
                    alert(`Set to ${props.fileControl.isPrivate? 'public' : 'private'}.`);
                props.fetchData();
            }); 
        }
    }

    const permitUpdate = () => {
        const conf = confirm(`Are you sure to ${props.fileControl.permitRecipientUpdate? 'disable' : 'enable'}?`);
        if (conf) {
            setPermitRecipientUpdate(props.fileControl.permitRecipientUpdate? false : true, props.blockID).then(result => {
                if (result) 
                    alert(props.fileControl.permitRecipientUpdate? 'Disabled' : 'Enabled');
                props.fetchData();
            });
        }
    }

    return (
        <Popup open={true} onClose={props.onClose} nested>
            <div className='bg-gray-700 text-cyan-300 grid justify-items-end rounded-t-md'><button onClick={props.onClose}>❌</button></div>
            <div id='PopVersionControlBody' className='bg-white rounded-b-md p-3 overflow-auto max-h-screen max-w-screen-lg'>
                <h1 className='font-bold text-gray-600'>Status</h1>
                <Line />

                Private: {props.fileControl.isPrivate ? 'Yes' : 'No'} 
                <Button
                    sx={{ textTransform: 'none', wordBreak: 'break-all', margin: '2px', float: 'right' }}
                    variant='contained'
                    size='small'
                    onClick={() => { configPrivate() }}>
                    Set {props.fileControl.isPrivate? 'Public' : 'Private'}
                </Button>
                <br /><br />
                <h1 className='font-bold text-gray-600'>Recipient's Permissions</h1>
                
                <Line />

                    <div className="inline-block">

                    <p className="float-left">Permit recipient to update the transfer: {props.fileControl.permitRecipientUpdate ? 'Yes' : 'No'}</p>
                    
                    <Button
                        sx={{ textTransform: 'none', margin: '3px', wordBreak: 'break-all', float: 'right' }}
                        variant='contained'
                        size='small'
                        onClick={() => { permitUpdate() }}>
                        {props.fileControl.permitRecipientUpdate? 'Disable' : 'Enable'}
                    </Button>
                    
                    </div>
 
            </div>
        </Popup>
    );
}

export default PopUserPermission;