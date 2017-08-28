pragma solidity ^0.4.15;

contract HashStore {

    address owner;
    mapping(bytes32 => byte[64]) hashes; // documentID => hash
    uint hashesStored;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function HashStore() {
        owner = msg.sender;
        hashesStored = 0;
    }

    function getHash(bytes32 documentID) returns (byte[64]) {
        return hashes[documentID];
    }

    function storeHashes(bytes32[] documentIDs, byte[64][] newHashes) onlyOwner {
        uint numToAdd = documentIDs.length;
        uint i = 0;
        while (i < numToAdd) {
            hashes[documentIDs[i]] = newHashes[i];
            hashesStored = hashesStored + 1;
            i = i + 1;
        }
    }

    function getHashesStored() onlyOwner returns (uint) {
        return hashesStored;
    }

}