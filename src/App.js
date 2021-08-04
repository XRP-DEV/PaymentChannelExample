import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Button, Row, Container, Col, Form, Alert, CardGroup, Badge} from "react-bootstrap";
import {deriveKeypair, xrpToDrops} from "ripple-lib";
import axios from "axios";


// Connect ---------------------------------------------------------------------
const ripple = require('ripple-lib')
let api = new ripple.RippleAPI({server: 'wss://s.altnet.rippletest.net:51233'})
api.connect();


// parameters
const payersAddress = "rP8RjzppsE34SeHD4YYZNaprKdqsGJRCk3";
const payerPublicKey = api.deriveKeypair("sn5St2TYJSuBbanu81hH9GNUa3ZP8").publicKey;
const publicKeyInHex = "303243463737463832343433354541423332433637353834373433464630364443333846354139423532303435324545344638303133323343423732323742333031";
const payeeAddress = "radBdVvjUDF1VGgJo5nLvyGEexpZcWtiHu";
//alert(payerPublicKey)

// signature: 3044022064EBCAC123DF62C4BF1E405D88301B36A72F4344B6AFCC65B9DEF57ED9C5E4C202203BFF61E06948D758152D67886AE242686498D4C618FF4F807D9D806836B8482D

const createPaymentChannel = async () => {

    let xrp = document.getElementById("amountXRP").value;

    const preparedTx = await api.prepareTransaction({
        "Account": payersAddress,
        "TransactionType": "PaymentChannelCreate",
        "Amount": api.xrpToDrops(xrp),
        "Destination": payeeAddress,
        "SettleDelay": 600,
        "PublicKey": payerPublicKey
    }, {
        "maxLedgerVersionOffset": 75
    });


    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
    console.log("Prepared transaction instructions:", preparedTx.txJSON)
    console.log("Transaction cost:", preparedTx.instructions.fee, "XRP")
    console.log("Transaction expires after ledger:", maxLedgerVersion)

    // signing transaction
    const signed = api.sign(preparedTx.txJSON, "sn5St2TYJSuBbanu81hH9GNUa3ZP8")
    const txID = signed.id
    const tx_blob = signed.signedTransaction
    console.log("Identifying hash:", txID)
    console.log("Signed blob:", tx_blob)


    const result = await api.submit(tx_blob)
    console.log("Tentative result code:", result.resultCode)
    console.log("Tentative result message:", result.resultMessage)

    alert("created channel")
}

const verifyClaim = async () => {

    const channelId = document.getElementById("verifyChannelID").value;
    const secret = document.getElementById("secret").value;
    const amountVerifyXRPClaim = document.getElementById("amountVerifyXRPClaim").value;


    // Simple POST request with a JSON body using fetch
    const requestOptions = {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "method": "channel_authorize",
            "params": [{
                "channel_id": channelId,
                "secret": secret,
                "amount": api.xrpToDrops(amountVerifyXRPClaim)
            }]
        })
    };
    fetch('/', requestOptions)
        .then(response => response.json())
        .then(data => {
            document.getElementById("signatureStatus").innerText = JSON.stringify(data.result.signature);
        })
        .catch(err => console.log(err));


};

const makeClaim = async () => {
    const amount = document.getElementById("makeClaimAmountXRPClaim").value;
    const id = document.getElementById("makeClaimChannelID").value;
    const signature = document.getElementById("makeClaimSignature").value;


    const preparedTx = await api.prepareTransaction({
        "Account": "radBdVvjUDF1VGgJo5nLvyGEexpZcWtiHu",
        "TransactionType": "PaymentChannelClaim",
        "Amount": xrpToDrops(amount),
        "Balance": xrpToDrops(amount),
        "Channel": id,
        "PublicKey": "02CF77F824435EAB32C67584743FF06DC38F5A9B520452EE4F801323CB7227B301",
        "Signature": signature
    }, {
        "maxLedgerVersionOffset": 75
    });

    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
    console.log("Prepared transaction instructions:", preparedTx.txJSON)
    console.log("Transaction cost:", preparedTx.instructions.fee, "XRP")
    console.log("Transaction expires after ledger:", maxLedgerVersion)

    // signing transaction
    const signed = api.sign(preparedTx.txJSON, "snnowQVoWEsS64KDvbtnrECGyFgnf")
    const txID = signed.id;
    const tx_blob = signed.signedTransaction
    console.log("Identifying hash:", txID)
    console.log("Signed blob:", tx_blob)


    const result = await api.submit(tx_blob)
    console.log("Tentative result code:", result.resultCode)
    console.log("Tentative result message:", result.resultMessage)

    alert("Made claim. Success!")
}

function App() {
    return (
        <div className="App">
            <Container>
                <CardGroup>
                    <Card style={{width: '30rem'}}>
                        <Card.Header>Create payment channel</Card.Header>
                        <Card.Body>
                            <Card.Title><Badge bg={'secondary'}> Payer</Badge></Card.Title>
                            <Card.Text>
                                Address: rP8RjzppsE34SeHD4YYZNaprKdqsGJRCk3
                                Secret: sn5St2TYJSuBbanu81hH9GNUa3ZP8
                            </Card.Text>
                            <Form>
                                <Form.Group className="mb-3" controlId="formBasicEmail">
                                    <Form.Label>XRP Amount</Form.Label>
                                    <Form.Control type="number" placeholder="Amount in XRP" id={'amountXRP'}/>
                                    <Button variant="primary" onClick={createPaymentChannel}>Create payment
                                        channel</Button>
                                </Form.Group>
                            </Form>

                        </Card.Body>
                    </Card>
                    <Card style={{width: '30rem'}}>
                        <Card.Header>Verify Claim</Card.Header>
                        <Card.Body>
                            <Card.Title></Card.Title>
                            <Card.Text>
                                <Form>
                                    <Form.Label>XRP Amount</Form.Label>
                                    <Form.Control type="number" placeholder="XRP claim"
                                                  id={'amountVerifyXRPClaim'}/>
                                    <Form.Label>Channel ID</Form.Label>
                                    <Form.Control type="text" placeholder="Channel ID" id={'verifyChannelID'}/>
                                    <Form.Label>Secret</Form.Label>
                                    <Form.Control type="text" placeholder="Secret" id={'secret'}/>
                                    <Button variant="primary" onClick={verifyClaim}>Verify claim</Button>
                                </Form>
                                <Alert>
                                    <p id={'signatureStatus'}></p>
                                </Alert>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                    <Card style={{width: '30rem'}}>
                        <Card.Header>Make claim</Card.Header>
                        <Card.Body>
                            <Card.Title><Badge bg={'secondary'}>Receiver</Badge></Card.Title>
                            <Card.Text>
                                Address: radBdVvjUDF1VGgJo5nLvyGEexpZcWtiHu
                                Secret: snnowQVoWEsS64KDvbtnrECGyFgnf
                            </Card.Text>
                            <Form>
                                <Form.Label>XRP Amount</Form.Label>
                                <Form.Control type="number" placeholder="XRP claim" id={'makeClaimAmountXRPClaim'}/>
                                <Form.Label>Channel ID</Form.Label>
                                <Form.Control type="text" placeholder="Channel ID" id={'makeClaimChannelID'}/>
                                <Form.Label>Signature</Form.Label>
                                <Form.Control type="text" placeholder="Signature" id={'makeClaimSignature'}/>
                                <Button variant="primary" onClick={makeClaim}>Make claim</Button>
                            </Form>
                        </Card.Body>
                    </Card>

                </CardGroup>
            </Container>
        </div>
    );
}

export default App;
