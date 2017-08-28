import httpRequestApi from './httpRequestApi';

const sha3 = require('../tools/sha3.js');
const NodeRSA = require('node-rsa');

var apiKey = '';
var key = new NodeRSA();

export function setAccountInfo(_apiKey, pubKey, privKey)
{
	apiKey = _apiKey;
	key.importKey(pubKey, 'pkcs8-public');
	key.importKey(privKey, 'pkcs8-private');
}
export function hashFile(file)
{
	return sha3(file);
}
export function sendFile(file, id)
{
	var hashedDoc = hashFile(file);
	var signedHashedDoc = key.sign(hashedDoc, 'base64', 'utf8');
	var hashedSignedHashedDoc = hashFile(signedHashedDoc);
	var pubKey = key.exportKey('pkcs8-public');

	return new Promise(function(resolve, reject){
		httpRequestApi.http('/api/v1/document/storeHash',
		{
			hash: hashedDoc,
			hashSigned: signedHashedDoc,
			hashToStore: hashedSignedHashedDoc,
			apiKey: apiKey,
			documentID: id,
			publicKey: pubKey
		},
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(function(APIResultString){
			let APIResult = JSON.parse(APIResultString);
			if(typeof APIResult.subCode !== 'undefined') {
				reject(APIResult);
			} else {
				resolve(APIResult);
			}
		})
		.catch(function(error) {
			reject('Connection failed.');
		});
	});
}
export function retrieveDocInfo(id, apiKeySend)
{
	return new Promise(function(resolve, reject){
		httpRequestApi.http('/api/v1/document/audit?documentID=' + id + '&apiKey=' + apiKeySend, {},
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(function(APIResultString){
			let APIResult = JSON.parse(APIResultString);
			if(typeof APIResult.subCode !== 'undefined') {
				reject(APIResult);
			} else {
				resolve(APIResult);
			}
		})
		.catch(function(error) {
			reject('Connection failed.');
		});
	});
}
export function generateKeys(apiKey)
{
	var keys = new Array(2);
	key = new NodeRSA({b:512});
	var keyPublic = key.exportKey('pkcs8-public');
	var keyPrivate = key.exportKey('pkcs8-private');
	keys[0] = keyPublic;
	keys[1] = keyPrivate;
	return keys;
}
