import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';

const uuidv1 = require('uuid/v1');
const docHandler = require('./actions/documentHandle');

class Main extends React.Component
{
  constructor()
  {
    super()
    this.state=
    {
      publicKey  : "",
      privateKey : "",
      apiKey     : "",
      fileField  : "",
      fileGetId  : "",
      fileSetId  : "",
      showAudit  : false,
      auditData  : {
                     transactionHash: "",
                     contractAddress: "",
                     publicKey: "",
                     hashSigned: ""
                   },
      errDisplay : ""
    }
    this.handlePubKeyChange  = this.handlePubKeyChange.bind(this);
    this.handlePrivKeyChange = this.handlePrivKeyChange.bind(this);
    this.handleApiKeyChange  = this.handleApiKeyChange.bind(this);
    this.sendAccountInfo     = this.sendAccountInfo.bind(this);
    this.handleFileChange    = this.handleFileChange.bind(this);
    this.handleIdChange      = this.handleIdChange.bind(this);
  }
  handlePubKeyChange(key)
  {
    let self = this;
    self.setState({publicKey: key.target.value});
  }
  handlePrivKeyChange(key)
  {
    let self = this;
    self.setState({privateKey: key.target.value});
  }
  handleApiKeyChange(key)
  {
    let self = this;
    self.setState({apiKey: key.target.value});
  }
  generateKeys(apiKey)
  {
    let self = this;
    self.setState({
      publicKey : docHandler.generateKeys(apiKey)[0],
      privateKey : docHandler.generateKeys(apiKey)[1]
    })
  }
  sendAccountInfo()
  {
    docHandler.setAccountInfo(this.state.apiKey, this.state.publicKey, this.state.privateKey);
  }
  handleFileChange(file)
  {
    let self = this;
    var reader = new FileReader();
    reader.onload = function(e) 
    {
      self.setState({fileField: reader.result});
    }
      reader.readAsBinaryString(file[0]); 
  }
  handleHashSend(file)
  {
    this.sendAccountInfo();
    var fileId = uuidv1();
    docHandler.sendFile(file, fileId);
    this.setState({fileGetId: fileId});
  }
  handleDocRetrieve(id)
  {
    let self = this;
    docHandler.retrieveDocInfo(id, this.state.apiKey)
    .then(function(docData) {
      self.setState({auditData: docData, showAudit: true});
    })
    .catch(function(error) {
      self.setState({errDisplay: error});
    });
  }
  handleIdChange(id)
  {
    let self = this;
    self.setState({fileSetId: id.target.value});
  }
  render()
  {
    return(
      <div>
        <div className="AccountInfo">
          <p>API Key</p>
          <input onChange={this.handleApiKeyChange} value={this.state.apiKey} type="text"></input>
          <p>Public Key</p>
          <input onChange={this.handlePubKeyChange} value={this.state.publicKey} type="text"></input>
          <p>Private Key</p>
          <input onChange={this.handlePrivKeyChange} value={this.state.privateKey} type="text"></input><br></br>
          <button onClick={() =>{this.generateKeys(this.state.apiKey)}} type="button"> Generate Keys </button>
        </div>
        <div className="UploadHash">
          <Dropzone onDrop={this.handleFileChange}></Dropzone>
          <button onClick={() => {this.handleHashSend(this.state.fileField)}} id="btn_upload" type="button">Upload</button>
          <p>Id of the uploaded hash:</p>
          <p id="txt_fileHash">{this.state.fileGetId}</p>
        </div>
        <div className="DownloadDocInfo">
          <p>Insert document ID to retrieve audit data:</p>
          <input onChange={this.handleIdChange} value={this.state.idField} type="text"></input>
          <button onClick={() =>{this.handleDocRetrieve(this.state.fileSetId)}} id="btn_download" type="button">Audit</button><br></br>
          <div className="Audit Data">
            {this.state.showAudit? <AuditData parentAuditData={this.state.auditData}/> :null}
          </div>
        </div>
      </div>
      );
  }

}

const PENDING_MESSAGE = 'Transaction pending, try again later.';

class AuditData extends React.Component
{
  constructor()
  {
    super();
    this.state={
    }
  }
    render()
    {
      return(
        <div className="Audit Data">
            <p>Transaction Hash: </p>
            <p>{(typeof this.props.parentAuditData.transactionHash === 'undefined') ? PENDING_MESSAGE : this.props.parentAuditData.transactionHash}</p>
            <p>Contract Address: </p>
            <p>{(typeof this.props.parentAuditData.contractAddress === 'undefined') ? PENDING_MESSAGE : this.props.parentAuditData.contractAddress}</p>
            <p>Public Key: </p>
            <p>{this.props.parentAuditData.publicKey}</p>
            <p>Signed Hash: </p>
            <p>{this.props.parentAuditData.hashSigned}</p>
            <p></p>
          </div>
        );
    }
}

ReactDOM.render(<Main/>, document.getElementById("root"));