// SPDX-License-Identifier: UNLICENSED

//Intention: 1. Manage and view profile 2. Upload files to profile
pragma solidity ^0.8.7;

contract ProfileMgnt {
    uint eventCount;

    struct FileStruct {
        string cid;
        uint timestamp;
        string name;
        string fsize;
        string lastModified;
        string category;
        string comment;
        uint blockID;
    }

    struct ProfileStruct {
        uint timestamp;
        string title;
        string name;
        string organization;
        string country;
        string city;
        string contact;
        string bio;
    }

    struct summaryStruct {
        FileStruct[] publicFiles;
        ProfileStruct[] profiles;
    }

    mapping(address => summaryStruct) allSummary;

    struct EventDetail {
        address sender;
        bool expired;
        bool isPrivate;
    }

    function updateProfile(
        string memory _title,
        string memory _name,
        string memory _organization,
        string memory _country,
        string memory _city,
        string memory _contact,
        string memory _bio) public {

        allSummary[msg.sender].profiles.push(ProfileStruct(
            block.timestamp,
            _title,
            _name,
            _organization,
            _country,
            _city,
            _contact,
            _bio));
    }

    mapping(uint => EventDetail) fileEventDetails;


    function uploadFiles(
        string memory cid,
        string memory name,
        string memory fsize,
        string memory lastModified,
        string memory category,
        string memory comment
    ) public {
        eventCount++;
        allSummary[msg.sender].publicFiles.push(FileStruct(
            cid, 
            block.timestamp, 
            name, 
            fsize, 
            lastModified, 
            category, 
            comment,
            eventCount));

        fileEventDetails[eventCount].sender = msg.sender;
    }

    function setPrivate(bool boolean, uint _blockID) public {
        require(fileEventDetails[_blockID].sender == msg.sender, "Unauthorized");
        fileEventDetails[_blockID].isPrivate = boolean;
    }

    function setExpired(uint _blockID) public {
        require(fileEventDetails[_blockID].sender == msg.sender, "Unauthorized");
        fileEventDetails[_blockID].expired = true;
    }

    function getProfile(address _user) public view returns (ProfileStruct[] memory) {
        return allSummary[_user].profiles;
    }

    function getProfilePublicFiles(address _user) public view returns (FileStruct[] memory) {
        FileStruct[] memory result = allSummary[_user].publicFiles;
        for(uint i = 0; i < result.length; i++) {
            if (fileEventDetails[result[i].blockID].isPrivate)
                result[i].cid = "private";

            if (fileEventDetails[result[i].blockID].expired)
                result[i].cid = "expired";
        }
        return result;
    }
}