const Client = require('ssh2-sftp-client');
const fs = require('fs');
const sftp = new Client();



async function uploadINDIxml(req, res) {
  try {
    // Configuratie op basis van de parameters
	
	let host = req.query.host;
	let port = req.query.port;
	let username = req.query.username;
	let password = req.query.password;
	let directory = req.query.directory;
  
	let sftpFileName = req.query.sftpFileName;
	
	
	const remoteMap = '/IndiUpload/rcv' + sftpFileName ;
	console.log('remoteMap: ' + remoteMap);
	
    const lokaalPad = directory.trim() + sftpFileName;
	console.log('lokaalPad: ' + lokaalPad);
	
    const config = {
      host: host,
      port: port || 22, // Standaardpoort 22 als geen andere opgegeven
      username: username,
      password: password
    };

    await sftp.connect(config);
    console.log('Verbonden met SFTP server');

    

    await sftp.put(lokaalPad, remoteMap);
    console.log('Upload succesvol');
	const st = await sftp.stat(remoteMap);
    console.log(`INDI Upload gelukt (${st.size} bytes op server ).` +lokaalPad);

    // Lokaal XML-bestand alleen verwijderen als de grootte op de server overeenkomt
    const lokaalSt = await fs.promises.stat(lokaalPad);
    if (st.size === lokaalSt.size) {
      await fs.promises.unlink(lokaalPad);
      console.log('Lokaal bestand verwijderd: ' + lokaalPad);
    } else {
      console.error(`Lokaal bestand NIET verwijderd: grootte wijkt af (lokaal ${lokaalSt.size}, server ${st.size} bytes). ` + lokaalPad);
    }

    await sftp.end();
  } catch (err) {
    console.error('Fout tijdens SFTP-upload:', err);
  }
}



module.exports = {
    uploadINDIxml: uploadINDIxml,
  
  };