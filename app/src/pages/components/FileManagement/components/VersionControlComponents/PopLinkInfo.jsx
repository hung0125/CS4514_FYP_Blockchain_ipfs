import Popup from "reactjs-popup";
import QRCode from "react-qr-code";

const PopLinkInfo = (props) => {

    return (
        <Popup open={true} onClose={props.onClose} nested>
            <div className='bg-gray-700 grid justify-items-end rounded-t-md'><button onClick={props.onClose}>❌</button></div>
            <div className="bg-blue-200 text-black rounded-b-md p-3 overflow-auto max-h-screen max-w-screen-md break-all">
                URL: <a href={props.QRLink} target='_blank' className="underline">{props.QRLink}</a><br/>
                QR Code: <QRCode value={props.QRLink}/>
            </div>
        </Popup>  
    );
}

export default PopLinkInfo;