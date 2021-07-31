import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Button, Row, Container, Col} from "react-bootstrap";
import {deriveKeypair} from "ripple-lib";

// Connect ---------------------------------------------------------------------
const ripple = require('ripple-lib')
let api = new ripple.RippleAPI({server: 'wss://s.altnet.rippletest.net:51233'})
api.connect();


const createPaymentChannel = async () => {
    const pubKey = api.deriveKeypair("sn5St2TYJSuBbanu81hH9GNUa3ZP8").publicKey;

    const preparedTx = await api.prepareTransaction({
        "Account": "rP8RjzppsE34SeHD4YYZNaprKdqsGJRCk3",
        "TransactionType": "PaymentChannelCreate",
        "Amount": "10000000",
        "Destination": "radBdVvjUDF1VGgJo5nLvyGEexpZcWtiHu",
        "SettleDelay": 6000,
        "PublicKey": pubKey
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
}

const payWithPaymentChannel = async () => {

    const preparedTx = await api.prepareTransaction({
        "id": "channel_authorize_example_id1",
        "command": "channel_authorize",
        "channel_id": "7B5D9FA3695D3619CF9FE494A82A6E07F3817222EF357E3A59E70AE687A82204",
        "seed": "sn5St2TYJSuBbanu81hH9GNUa3ZP8",
        "key_type": "secp256k1",
        "amount": "1000000",
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
}

function App() {
    return (
        <div className="App">
            <Container>
                <Row>
                    <Col>
                        <Card style={{width: '30rem'}}>
                            <Card.Body>
                                <Card.Title>rP8RjzppsE34SeHD4YYZNaprKdqsGJRCk3</Card.Title>
                                <Card.Text>
                                    Secret: sn5St2TYJSuBbanu81hH9GNUa3ZP8
                                </Card.Text>
                                <Button variant="primary" onClick={createPaymentChannel}>Create payment channel</Button>
                                <Button variant="primary" onClick={payWithPaymentChannel}>Pay 10 drops via
                                    Channel</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card style={{width: '30rem'}}>
                            <Card.Body>
                                <Card.Title>radBdVvjUDF1VGgJo5nLvyGEexpZcWtiHu</Card.Title>
                                <Card.Text>
                                    Secret: snnowQVoWEsS64KDvbtnrECGyFgnf
                                </Card.Text>
                                <Button variant="primary">Go somewhere</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;
