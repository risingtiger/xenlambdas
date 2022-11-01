const SaveTransaction = async (db, date, str, sourceI, _cb = () => { }) => {
    return new Promise((res, rej) => {
        let datain = _SaveTransaction_parse(str);
        if (datain.er) {
            rej("unable to parse");
            return false;
        }
        let tagsSplit = datain.tags ? datain.tags.split("-").map((m) => m.trim()) : [];
        const catsPromise = db.collection("cat").get();
        const sourcesPromise = db.collection("source").get();
        const tagsPromise = db.collection("tag").get();
        Promise.all([catsPromise, sourcesPromise, tagsPromise])
            .then((snapshots) => {
            const catsAll = [];
            const sourcesAll = [];
            const tagsAll = [];
            snapshots[0].forEach((doc) => { catsAll.push({ id: doc.id, ...(doc.data()) }); });
            snapshots[1].forEach((doc) => { sourcesAll.push({ id: doc.id, ...(doc.data()) }); });
            snapshots[2].forEach((doc) => { tagsAll.push({ id: doc.id, ...(doc.data()) }); });
            let ts = Math.round((new Date(date)).getTime() / 1000);
            let merchant = datain.merchant;
            let cat = catsAll.find((c) => c.name === datain.cat);
            let source = sourcesAll.find((s) => s.name === sourceI);
            let tags = tagsAll.filter((t) => tagsSplit.includes(t.name));
            let amount = datain.amount;
            let notes = datain.notes || '';
            if (!ts || !merchant || !cat || !source || isNaN(amount)) {
                console.log("done fucked up");
                rej('done fucked up');
            }
            else {
                let tagsArray = tags.map((t) => db.doc(`tag/${t.id}`));
                let transactionSaveData = { ts, merchant, cat: db.doc(`cat/${cat.id}`), tags: tagsArray, source: db.doc(`source/${source.id}`), amount, notes };
                const batch = db.batch();
                const newref = db.collection("transaction").doc();
                batch.set(newref, transactionSaveData);
                batch.commit().then(() => {
                    console.log("batch write commited");
                    res(1);
                }).catch(() => {
                    console.log("done fucked up on the batch commit");
                    rej("bonked out on firestore save");
                });
            }
        });
    });
};
function _SaveTransaction_parse(str) {
    let matchMain = str.match(/I spent \$([0-9]+) at ([a-z' ]+) for ([a-z]+)/i);
    let matchNote = str.match(/, ([a-z0-9 ]+)/i);
    let datain = {
        tags: null,
    };
    if (matchMain) {
        datain.amount = Number(matchMain[1]);
        datain.merchant = matchMain[2];
        datain.cat = matchMain[3];
        if (matchNote) {
            datain.notes = matchNote[1];
        }
    }
    else {
        datain.er = true;
    }
    return datain;
}
export { SaveTransaction };
//# sourceMappingURL=savetransaction.js.map