import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SaveTransaction } from "./savetransaction.js";
if (process.platform === 'darwin') {
    initializeApp({ credential: cert('/Users/dave/.ssh/xenition-a1c403b0ae7d.json') });
}
else {
    initializeApp();
}
const db = getFirestore();
(process.openStdin()).addListener("data", async (a) => {
    let data = (Buffer.from(a, 'base64').toString()).trim();
    if (data == "savetransaction") {
        debugger;
        SaveTransaction(db, '2022-10-31', `I spent $44 at these for fuel`, 'apple', () => { });
    }
});
export const savetransaction = (req, res) => {
    SaveTransaction(db, req.body.date, req.body.src, req.body.source, () => { })
        .then(_ => {
        res.status(200).send('all good');
    })
        .catch(er => {
        res.status(400).send(er);
    });
};
// function routePubIn(msg:any, cb = () => { }) 
// {
//     let data = Buffer.from(msg.data, 'base64').toString()
//
//     if (data === 'dailyreport') DailyReportRun(firestore, secretsClient, cb);
//
//     if (msg && msg.attributes && msg.attributes.event) 
//     {
// 	let ev = msg.attributes.event
//
// 	if (ev.includes("pw_status_v")) SaveStatus(firestore, msg.attributes.device_id, data, secretsClient, cb);
//     }
// }
// const mainPubSub = (event:any, _context:any, callback = () => { }) => { routePubIn(event, callback); };
// export { mainPubSub };
//# sourceMappingURL=index.js.map