# Hash Store

## Specification

- Insert API key (previously provided)
- Create keys (public and private) to sign or insert your own
- Add document:
	1) Send hash(sign(hash(document))), sign(hash(document)), hash(document), document ID, along with API key and public key used
	2) Return document ID
- Ask for information to audit using document ID (transaction hash, contract address, public key, sign(hash(document)))
- Upload document and validate (optional)

## Requirements

- MongoDB
- NodeJS
- NPM

## Run

- Run ```npm install``` if its the first time you try to use the project.
- Start MongoDB as service: ```sudo systemctl start mongod```
- Create a file called privateConfig.json inside backend/ with the following format:
```
{
    "gethHost": "address of an Ethereum node",
    "gethPort": "port of an Ethereum node",
    "address": "your Ethereum address starting with 0x",
    "privateKey": "your Ethereum private key without 0x"
}
```
- Compile the contract if needed with ```npm run compileContract```
- Start the API: ```npm run api``` (```npm run apiProd``` for production)
- Start the web app: ```npm start``` (```npm run build``` for production)

## TODO

- Show errors
- Further test blockchain content.
- Use eth classic?
- Upload document and validate?