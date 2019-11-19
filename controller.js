var profilesAnswer = '';

function Query () {  

var ws = new WebSocket('ws://localhost:4001');
 
//Criando TTLV de Query Profiles
var TTLVRequest = new KMIPTTLV (Tags.REQUEST_MESSAGE, Types.STRUCTURE, '', 0x00000040);
// //Header Section
var TTLVHeader = new KMIPTTLV (Tags.REQUEST_HEADER, Types.STRUCTURE, '', 0x00000014);
var TTLVProtocol = new KMIPTTLV (Tags.PROTOCOL_VERSION, Types.STRUCTURE, '', 0x00000008);
var TTLVProtocolMajor = new KMIPTTLV (Tags.PROTOCOL_VERSION_MAJOR, Types.INTEGER, 0x00000001, 0x00000004);
var TTLVProtocolMinor = new KMIPTTLV (Tags.PROTOCOL_VERSION_MINOR, Types.INTEGER, 0x00000003, 0x00000004);

var TTLVHeaderBatch = new KMIPTTLV (Tags.BATCH_COUNT, Types.INTEGER, 0x00000001, 0x00000004);
//Batch Items
var TTLVBatchItem = new KMIPTTLV (Tags.BATCH_ITEM, Types.STRUCTURE, '', 0x0000000C);
var TTLVItemOperation = new KMIPTTLV (Tags.OPERATION, Types.ENUMERATION, Operation.QUERY, 0x00000004);
var TTLVRequestPayload = new KMIPTTLV (Tags.REQUEST_PAYLOAD, Types.STRUCTURE, '', 0x00000004);
var TTLVQueryFunction = new KMIPTTLV (Tags.QUERY_FUNCTION, Types.ENUMERATION, QueryFunction.QUERY_OPERATIONS, 0x00000001);


var bin1 = TTLVRequest.getBlock()+
TTLVHeader.getBlock()+
TTLVProtocol.getBlock()+
TTLVProtocolMajor.getBlock()+
TTLVProtocolMinor.getBlock()+
TTLVAuthentication.getBlock()+
TTLVCredential.getBlock()+
TTLVCredencialType.getBlock()+
TTLVCredencialValue.getBlock()+
TTLVUsername.getBlock()+
TTLVPassword.getBlock()+
TTLVHeaderBatch.getBlock()+
TTLVBatchItem.getBlock()+
TTLVItemOperation.getBlock()+
TTLVRequestPayload.getBlock()+
TTLVQueryFunction.getBlock();

ws.onopen = function () {
  ws.send(bin1)
  console.log('Requisição de Query Profiles enviada!');
};

ws.onmessage = function(data) {
  profilesAnswer = data;
  console.log('Resposta de Query Profiles!: ' + profilesAnswer.data);
};

}