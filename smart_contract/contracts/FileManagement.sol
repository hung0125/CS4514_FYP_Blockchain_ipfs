// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.7;

//Intention: Handle local storage and 1:1 file transfer, with additional features for each event
contract FileManagement {
    
    uint blockID;
    struct EventStruct {
        uint blockID;
        uint forJoinID;
        bool localPin;
        address sender;
        address recipient;
        uint timestamp;
        string extMetadataCID; //encrypted for external access
        string intMetadataCID; //encrypted for internal access
        FileControlStruct fileControl;
    }

    // To make it partially visible in blockchain environment
    struct FileControlStruct {
        bool isExpired;
        bool isPrivate; // to hide the file details from the recipient, self-to-self is not private, receipient should access the details
        bool permitRecipientUpdate;
    }

    enum JoinStatus { APPROVED, REJECTED, CANCELLED }
    uint joinID;
    struct JoinEventStruct {
        uint joinID;
        uint creationtime;
        uint blockID;
        address blockOwner;
        address joiner;
        JoinStatus status; 
        uint decisiontime;
    }

    struct UserStruct {
        uint[] incomEvents; //blockIDs
        uint[] outgoEvents; //blockIDs
        uint[] joinInbox; //joinIDs
        uint[] joinOutbox; //joinIDs
        mapping(uint => bool) pendingRequests; // true = pending, false = resolved
        string publicKey;
    }

    mapping(address => UserStruct) userList; //search UserStruct by address
    mapping(uint => EventStruct) eventMap; //search EventStruct by blockIDs
    mapping(uint => JoinEventStruct) joinMap; //search JoinEventStruct by joinIDs

    //functions to manage the chain
    function updatePublicKey(string memory _publicKey) public {
        userList[msg.sender].publicKey = _publicKey;
    }

    function getPublicKey(address _user) public view returns (string memory) {
        return userList[_user].publicKey;
    }

    function shareFile(address _recipient, string memory _intMetadataCID, string memory _extMetadataCID, bool _localPin) public {
        blockID++;
        eventMap[blockID].localPin = _localPin;
        eventMap[blockID].sender = msg.sender;
        eventMap[blockID].recipient = _recipient;
        eventMap[blockID].timestamp = block.timestamp;
        eventMap[blockID].intMetadataCID = _intMetadataCID;
        eventMap[blockID].blockID = blockID;
        
        if (msg.sender != _recipient) {
            eventMap[blockID].extMetadataCID = _extMetadataCID;
            userList[msg.sender].outgoEvents.push(blockID);
        }

        userList[_recipient].incomEvents.push(blockID);
    }

    function getIncomingFiles() public view returns (EventStruct[] memory) {
        uint[] storage blockIDs = userList[msg.sender].incomEvents;
        EventStruct[] memory result = new EventStruct[](blockIDs.length);

        for (uint i = 0; i < result.length; i++) {
            result[i] = eventMap[blockIDs[i]];
            if (result[i].fileControl.isPrivate && result[i].sender != msg.sender) {
                result[i].intMetadataCID = "private";
                result[i].extMetadataCID = "private";
            }        
        }
        return result;
    }

    function getOutgoingFiles() public view returns (EventStruct[] memory) {
        uint[] storage blockIDs = userList[msg.sender].outgoEvents;
        EventStruct[] memory result = new EventStruct[](blockIDs.length);
        
        for (uint i = 0; i < result.length; i++) {
            result[i] = eventMap[blockIDs[i]];
        }

        return result;
    }

    function setPrivate(bool _isPrivate, uint _blockID) public {
        //only sender have the right to set private
        require (eventMap[_blockID].sender == msg.sender, "Unauthorized.");
        //sender and recipient must be different
        require (eventMap[_blockID].sender != eventMap[_blockID].recipient, "Cannot set private for files sent to yourself.");

        eventMap[_blockID].fileControl.isPrivate = _isPrivate;
    }

    function setExpired(uint _blockID) public {
        require(msg.sender == eventMap[_blockID].sender, "Unauthorized.");
        require(!eventMap[_blockID].fileControl.isExpired, "Already expired.");
        
        eventMap[_blockID].fileControl.isExpired = true;
        eventMap[_blockID].intMetadataCID = "expired";
        eventMap[_blockID].extMetadataCID = "expired";
    }

    function setPermitRecipientUpdate(bool _isPermit, uint _blockID) public {
        require(msg.sender == eventMap[_blockID].sender, "Unauthorized");
        require(!eventMap[_blockID].fileControl.isExpired, "Already expired.");

        eventMap[_blockID].fileControl.permitRecipientUpdate = _isPermit;  
    }

    function updateMetadata(uint _blockID, string memory _intMetadataCID, string memory _extMetadataCID) public {
        require(msg.sender == eventMap[_blockID].sender || 
        (msg.sender == eventMap[_blockID].recipient && eventMap[_blockID].fileControl.permitRecipientUpdate && !eventMap[_blockID].fileControl.isPrivate), "Unauthorized.");
        require(!eventMap[_blockID].fileControl.isExpired, "Already expired.");
        
        if (eventMap[_blockID].sender != eventMap[_blockID].recipient) 
            eventMap[_blockID].extMetadataCID = _extMetadataCID;

        eventMap[_blockID].intMetadataCID = _intMetadataCID;
    }

    function requestJoinBlock(uint _blockID) public {
        require(eventMap[_blockID].blockID > 0, "The block does not exist.");
        require(msg.sender != eventMap[_blockID].sender, "You can't request to join the block you owned.");
        require(msg.sender != eventMap[_blockID].recipient, "Already joined the block.");
        require(!userList[msg.sender].pendingRequests[_blockID], "The request is pending approval.");
        
        joinID++;
        joinMap[joinID].joinID = joinID;
        joinMap[joinID].creationtime = block.timestamp;
        joinMap[joinID].blockOwner = eventMap[_blockID].sender;
        joinMap[joinID].joiner = msg.sender;
        joinMap[joinID].blockID = _blockID;

        userList[msg.sender].joinOutbox.push(joinID);
        userList[eventMap[_blockID].sender].joinInbox.push(joinID);
        
        userList[msg.sender].pendingRequests[_blockID] = true;
    }

    function getJoinInbox() public view returns (JoinEventStruct[] memory) {
        uint[] storage joinIDs = userList[msg.sender].joinInbox;
        JoinEventStruct[] memory result = new JoinEventStruct[](joinIDs.length);

        for (uint i = 0; i < result.length; i++) {
            result[i] = joinMap[joinIDs[i]];
        }
        return result;
    }

    function getJoinOutbox() public view returns (JoinEventStruct[] memory) {
        uint[] storage joinIDs = userList[msg.sender].joinOutbox;
        JoinEventStruct[] memory result = new JoinEventStruct[](joinIDs.length);

        for (uint i = 0; i < result.length; i++) {
            result[i] = joinMap[joinIDs[i]];
        }
        return result;
    }

    function evaluateJoinInbox(uint _joinID, bool _approve, string memory _extMetadataCID) public {
        require(joinMap[_joinID].decisiontime == 0, 'The request is already processed.');
        require(msg.sender == eventMap[joinMap[_joinID].blockID].sender, "Unauthorized.");

        uint bid = joinMap[_joinID].blockID;
        if (_approve) {
            joinMap[_joinID].status = JoinStatus.APPROVED;
            joinMap[_joinID].decisiontime = block.timestamp;
            
            // generate a copy
            blockID++;
            eventMap[blockID].localPin = eventMap[bid].localPin;
            eventMap[blockID].sender = msg.sender;
            eventMap[blockID].recipient = joinMap[_joinID].joiner;
            eventMap[blockID].timestamp = block.timestamp;
            eventMap[blockID].intMetadataCID = eventMap[bid].intMetadataCID;
            eventMap[blockID].fileControl = eventMap[bid].fileControl;
            eventMap[blockID].blockID = blockID;
            eventMap[blockID].forJoinID = _joinID;
            eventMap[blockID].extMetadataCID = _extMetadataCID;

            userList[msg.sender].outgoEvents.push(blockID);
            userList[joinMap[_joinID].joiner].incomEvents.push(blockID);
        }else {
            joinMap[_joinID].status = JoinStatus.REJECTED;
            joinMap[_joinID].decisiontime = block.timestamp;
        }

        userList[joinMap[_joinID].joiner].pendingRequests[bid] = false;
    }

    function cancelJoin(uint _joinID) public {
        require(joinMap[_joinID].decisiontime == 0, 'The request is already processed.');
        require(msg.sender == joinMap[_joinID].joiner, "Unauthorized.");

        joinMap[_joinID].status = JoinStatus.CANCELLED;
        joinMap[_joinID].decisiontime = block.timestamp;

        uint bid = joinMap[_joinID].blockID;
        userList[joinMap[_joinID].joiner].pendingRequests[bid] = false;
    }

}